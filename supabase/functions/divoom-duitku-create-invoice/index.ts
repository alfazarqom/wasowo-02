import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-client-info, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
};

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeCustomer(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function clientIp(req: Request): string {
  return (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0].trim();
}

const supabaseUrl = requiredEnv("SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function consumeLimit(key: string, action: "create_invoice" | "order_status", limit: number) {
  const keyHash = await sha256Hex(key);
  const { data, error } = await supabase.rpc("divoom_consume_rate_limit", {
    p_key_hash: keyHash, p_action: action, p_limit: limit, p_window_seconds: 60,
  });
  if (error) throw new Error("Rate limiter unavailable");
  return data === true;
}

async function getOrderStatus(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const merchantOrderId = normalizeCustomer(url.searchParams.get("merchantOrderId"), 50);
  const email = normalizeCustomer(url.searchParams.get("email"), 255).toLowerCase();
  if (!merchantOrderId || !email) return json({ success: false, error: "merchantOrderId and email are required." }, 400);

  if (!await consumeLimit(`${clientIp(req)}:${merchantOrderId}`, "order_status", 20)) {
    return json({ success: false, error: "Too many status requests. Try again shortly." }, 429);
  }

  const { data, error } = await supabase
    .from("divoom_orders")
    .select("id, merchant_order_id, customer_email, subtotal, shipping_cost, total_amount, order_status, created_at")
    .eq("merchant_order_id", merchantOrderId)
    .maybeSingle();

  if (error) {
    console.error("Order status lookup failed:", error.message);
    return json({ success: false, error: "Unable to retrieve order status." }, 500);
  }
  if (!data || String(data.customer_email).toLowerCase() !== email) {
    return json({ success: false, error: "Order not found." }, 404);
  }

  const { data: payment, error: paymentError } = await supabase
    .from("divoom_payment_transactions")
    .select("status, duitku_reference, payment_method, paid_at")
    .eq("order_id", data.id)
    .maybeSingle();
  if (paymentError) {
    console.error("Payment status lookup failed:", paymentError.message);
    return json({ success: false, error: "Unable to retrieve payment status." }, 500);
  }

  if (payment?.duitku_reference) {
    const { error: reconciliationError } = await supabase.rpc("divoom_reconcile_pending_payment_callbacks", {
      p_merchant_order_id: merchantOrderId,
      p_reference: payment.duitku_reference,
    });
    if (reconciliationError) {
      console.error("Pending callback reconciliation failed:", reconciliationError.message);
    }
  }

  const { data: refreshedPayment, error: refreshError } = await supabase
    .from("divoom_payment_transactions")
    .select("status, paid_at")
    .eq("order_id", data.id)
    .maybeSingle();
  if (refreshError) {
    console.error("Refreshed payment status lookup failed:", refreshError.message);
    return json({ success: false, error: "Unable to retrieve payment status." }, 500);
  }

  return json({
    success: true,
    data: {
      merchantOrderId: data.merchant_order_id,
      subtotal: data.subtotal,
      shippingCost: data.shipping_cost,
      totalAmount: data.total_amount,
      orderStatus: data.order_status,
      paymentStatus: refreshedPayment?.status ?? "pending",
      paidAt: refreshedPayment?.paid_at ?? null,
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method === "GET") return await getOrderStatus(req);
    if (req.method !== "POST") return json({ success: false, error: "Method not allowed." }, 405);

    const payload = await req.json();
    const customer = payload?.customer ?? {};
    const name = normalizeCustomer(customer.name, 120);
    const email = normalizeCustomer(customer.email, 255).toLowerCase();
    const phone = normalizeCustomer(customer.phone, 50);
    const address = normalizeCustomer(customer.address, 500);
    const city = normalizeCustomer(customer.city, 120);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !address) {
      return json({ success: false, error: "Valid name, email, and shipping address are required." }, 400);
    }
    if (!Array.isArray(payload?.items) || payload.items.length < 1 || payload.items.length > 30) {
      return json({ success: false, error: "Cart must contain between 1 and 30 distinct products." }, 400);
    }

    if (!await consumeLimit(clientIp(req), "create_invoice", 8)) {
      return json({ success: false, error: "Checkout rate limit reached. Try again shortly." }, 429);
    }

    const merchantCode = requiredEnv("DUITKU_MERCHANT_CODE");
    const apiKey = requiredEnv("DUITKU_API_KEY");
    const environment = requiredEnv("DUITKU_ENV").toLowerCase();
    if (environment !== "sandbox") {
      return json({ success: false, error: "This integration is restricted to Duitku Sandbox." }, 500);
    }
    const returnUrl = requiredEnv("STOREFRONT_RETURN_URL");
    const requested = new Map<string, number>();
    for (const item of payload.items) {
      const productId = normalizeCustomer(item?.productId, 200);
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return json({ success: false, error: "Invalid product or quantity." }, 400);
      }
      requested.set(productId, (requested.get(productId) ?? 0) + quantity);
    }
    if (requested.size !== payload.items.length) {
      return json({ success: false, error: "Duplicate product rows are not allowed." }, 400);
    }

    const ids = [...requested.keys()];
    const { data: products, error: productError } = await supabase
      .from("divoom_products")
      .select("id,title,availability,price,sale_price")
      .in("id", ids);

    if (productError) {
      console.error("Product validation failed:", productError.message);
      return json({ success: false, error: "Unable to validate products." }, 500);
    }
    if (!products || products.length !== ids.length) {
      return json({ success: false, error: "One or more products are no longer available." }, 409);
    }

    const productById = new Map(products.map((product) => [String(product.id), product]));
    const orderItems = [];
    let subtotal = 0;

    for (const [productId, quantity] of requested) {
      const product = productById.get(productId);
      if (!product || String(product.availability ?? "").trim().toLowerCase() !== "in stock") {
        return json({ success: false, error: `Product unavailable: ${productId}` }, 409);
      }
      const price = Number(product.sale_price ?? product.price);
      if (!Number.isSafeInteger(price) || price < 0) {
        return json({ success: false, error: "Product price is invalid." }, 500);
      }
      const lineTotal = price * quantity;
      if (!Number.isSafeInteger(lineTotal)) return json({ success: false, error: "Order amount is invalid." }, 400);
      subtotal += lineTotal;
      orderItems.push({
        product_id: productId,
        product_title: String(product.title),
        unit_price: price,
        quantity,
      });
    }

    const shippingCost = 52000;
    const totalAmount = subtotal + shippingCost;
    if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) {
      return json({ success: false, error: "Order total is invalid." }, 400);
    }

    const expectedTotalAmount = Number(payload?.expectedTotalAmount);
    if (!Number.isSafeInteger(expectedTotalAmount) || expectedTotalAmount !== totalAmount) {
      return json({
        success: false,
        error: "Cart total changed. Review the updated total before retrying checkout.",
      }, 409);
    }

    const merchantOrderId = `DV${Date.now()}${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`.slice(0, 50);
    const { data: order, error: orderError } = await supabase
      .from("divoom_orders")
      .insert({
        merchant_order_id: merchantOrderId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone || null,
        shipping_address: address,
        shipping_city: city || null,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
      })
      .select("id,merchant_order_id")
      .single();

    if (orderError || !order) {
      console.error("Order insert failed:", orderError?.message);
      return json({ success: false, error: "Unable to create order." }, 500);
    }

    const { error: itemsError } = await supabase.from("divoom_order_items").insert(
      orderItems.map((item) => ({ ...item, order_id: order.id })),
    );
    if (itemsError) {
      console.error("Order item insert failed:", itemsError.message);
      await supabase.from("divoom_orders").delete().eq("id", order.id);
      return json({ success: false, error: "Unable to save order items." }, 500);
    }

    const { error: paymentInsertError } = await supabase.from("divoom_payment_transactions").insert({
      order_id: order.id,
      merchant_order_id: merchantOrderId,
      payment_amount: totalAmount,
      status: "pending",
    });
    if (paymentInsertError) {
      console.error("Payment transaction insert failed:", paymentInsertError.message);
      await supabase.from("divoom_orders").delete().eq("id", order.id);
      return json({ success: false, error: "Unable to initialize payment." }, 500);
    }

    const timestamp = String(Date.now());
    const signature = await hmacSha256Hex(merchantCode + timestamp, apiKey);
    const endpoint = environment === "production"
      ? "https://api-prod.duitku.com/api/merchant/createInvoice"
      : "https://api-sandbox.duitku.com/api/merchant/createInvoice";
    const duitkuPayload = {
      paymentAmount: totalAmount,
      merchantOrderId,
      productDetails: orderItems.map((item) => `${item.product_title} x${item.quantity}`).join(", ").slice(0, 255),
      email,
      phoneNumber: phone || undefined,
      customerVaName: name.slice(0, 20),
      itemDetails: orderItems.map((item) => ({
        name: item.product_title.trim().slice(0, 50) || "Product",
        price: item.unit_price,
        quantity: item.quantity,
      })).concat([{ name: "Shipping", price: shippingCost, quantity: 1 }]),
      callbackUrl: `${supabaseUrl}/functions/v1/divoom-duitku-callback`,
      returnUrl,
    };

    let duitkuResponse: Response;
    let providerData: Record<string, unknown>;
    try {
      duitkuResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-duitku-timestamp": timestamp,
          "x-duitku-signature": signature,
          "x-duitku-merchantcode": merchantCode,
        },
        body: JSON.stringify(duitkuPayload),
      });
      providerData = await duitkuResponse.json();
    } catch (error) {
      console.error("Duitku invoice request result is unknown:", error instanceof Error ? error.message : "network error");
      await supabase.from("divoom_payment_transactions")
        .update({
          provider_status_message: "Create Invoice response unknown; awaiting a verified callback or operator reconciliation.",
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);
      return json({
        success: false,
        invoiceOutcome: "unknown",
        error: "Payment creation could not be confirmed. Do not retry this order automatically; contact support with the order ID.",
        merchantOrderId,
      }, 502);
    }

    const statusCode = String(providerData.statusCode ?? "");
    const reference = String(providerData.reference ?? "");
    if (statusCode && statusCode !== "00") {
      await supabase.from("divoom_payment_transactions")
        .update({
          status: "invoice_failed",
          provider_status_code: statusCode,
          provider_status_message: String(providerData.statusMessage ?? "Invoice creation rejected").slice(0, 250),
          provider_response: { statusCode, statusMessage: providerData.statusMessage ?? null },
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);
      await supabase.from("divoom_orders")
        .update({ order_status: "payment_failed", updated_at: new Date().toISOString() })
        .eq("merchant_order_id", merchantOrderId);
      return json({ success: false, invoiceOutcome: "rejected", error: "Duitku rejected the payment invoice request.", merchantOrderId }, 502);
    }

    if (!duitkuResponse.ok || statusCode !== "00" || !reference) {
      await supabase.from("divoom_payment_transactions")
        .update({
          provider_status_code: statusCode || null,
          provider_status_message: "Create Invoice response is ambiguous; payment remains pending for callback reconciliation.",
          provider_response: { statusCode, statusMessage: providerData.statusMessage ?? null },
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);
      return json({
        success: false,
        invoiceOutcome: "unknown",
        error: "Duitku invoice result could not be confirmed. Do not retry this order automatically; contact support with the order ID.",
        merchantOrderId,
      }, 502);
    }

    const { data: existingPayment, error: existingPaymentError } = await supabase
      .from("divoom_payment_transactions")
      .select("duitku_reference")
      .eq("merchant_order_id", merchantOrderId)
      .single();
    if (existingPaymentError || !existingPayment) {
      console.error("Payment reference pre-save lookup failed:", existingPaymentError?.message);
      return json({ success: false, invoiceOutcome: "unknown", error: "Invoice was created but payment state could not be checked. Contact support with the order ID.", merchantOrderId }, 500);
    }
    if (existingPayment.duitku_reference && existingPayment.duitku_reference !== reference) {
      console.error("Duitku reference mismatch for merchant order:", merchantOrderId);
      return json({ success: false, invoiceOutcome: "unknown", error: "Payment reference mismatch. Contact support with the order ID.", merchantOrderId }, 409);
    }

    const { error: saveReferenceError } = await supabase.from("divoom_payment_transactions")
      .update({
        duitku_reference: reference,
        provider_status_code: statusCode,
        provider_status_message: String(providerData.statusMessage ?? "Success").slice(0, 250),
        provider_response: { statusCode, statusMessage: providerData.statusMessage ?? null },
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_order_id", merchantOrderId);

    if (saveReferenceError) {
      console.error("Duitku reference persistence failed:", saveReferenceError.message);
      return json({ success: false, invoiceOutcome: "unknown", error: "Invoice was created but its reference could not be saved. Contact support with the order ID.", merchantOrderId }, 500);
    }

    const { error: reconciliationError } = await supabase.rpc("divoom_reconcile_pending_payment_callbacks", {
      p_merchant_order_id: merchantOrderId,
      p_reference: reference,
    });
    if (reconciliationError) {
      console.error("Pending callback reconciliation after invoice save failed:", reconciliationError.message);
    }

    return json({
      success: true,
      data: {
        merchantOrderId,
        reference,
        paymentAmount: totalAmount,
        subtotal,
        shippingCost,
        totalAmount,
        paymentScriptEnvironment: environment,
      },
    });
  } catch (error) {
    console.error("Invoice function error:", error instanceof Error ? error.message : "unknown error");
    return json({ success: false, error: "Unable to process checkout." }, 500);
  }
});

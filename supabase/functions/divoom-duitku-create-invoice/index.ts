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

  return json({
    success: true,
    data: {
      merchantOrderId: data.merchant_order_id,
      subtotal: data.subtotal,
      shippingCost: data.shipping_cost,
      totalAmount: data.total_amount,
      orderStatus: data.order_status,
      paymentStatus: payment?.status ?? "pending",
      paidAt: payment?.paid_at ?? null,
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
    if (environment !== "sandbox" && environment !== "production") {
      return json({ success: false, error: "DUITKU_ENV must be sandbox or production." }, 500);
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
      invoice_creation_state: "in_progress",
      invoice_attempted_at: new Date().toISOString(),
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
    const callbackUrl = `${supabaseUrl}/functions/v1/divoom-duitku-callback`;
    const itemDetails = orderItems.map((item) => ({
      // Duitku POP defines itemDetails.name as string(50), not 255.
      name: Array.from(item.product_title).slice(0, 50).join("") || "Product",
      price: item.unit_price,
      quantity: item.quantity,
    })).concat([{ name: "Shipping", price: shippingCost, quantity: 1 }]);
    const itemDetailsTotal = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!Number.isSafeInteger(itemDetailsTotal) || itemDetailsTotal !== totalAmount) {
      await supabase.from("divoom_payment_transactions")
        .update({
          status: "invoice_failed",
          invoice_creation_state: "rejected",
          invoice_error_message: "Item detail total did not match payment amount.",
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);
      return json({ success: false, error: "Order amount validation failed." }, 500);
    }

    const duitkuPayload = {
      paymentAmount: totalAmount,
      merchantOrderId,
      productDetails: orderItems.map((item) => `${item.product_title} x${item.quantity}`).join(", ").slice(0, 255),
      email,
      phoneNumber: phone || undefined,
      customerVaName: name.slice(0, 20),
      itemDetails,
      callbackUrl,
      returnUrl,
      // expiryPeriod intentionally omitted: merchant configuration governs expiry.
    };

    let duitkuResponse: Response;
    let providerData: Record<string, unknown> | null = null;
    let providerBody = "";
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
        signal: AbortSignal.timeout(20_000),
      });
      providerBody = await duitkuResponse.text();
      try {
        const parsed: unknown = JSON.parse(providerBody);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          providerData = parsed as Record<string, unknown>;
        }
      } catch {
        // A non-JSON response cannot prove that the provider rejected invoice creation.
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "network or timeout error";
      console.error("Duitku invoice request outcome is unknown:", message);
      await supabase.from("divoom_payment_transactions")
        .update({
          invoice_creation_state: "unknown",
          invoice_error_message: "Provider request outcome is unknown; do not retry with a new invoice automatically.",
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);
      return json({
        success: false,
        outcome: "unknown",
        merchantOrderId,
        error: "Duitku may have received the request. Do not submit another payment attempt until this order is reconciled.",
      }, 502);
    }

    const statusCode = String(providerData?.statusCode ?? "");
    const statusMessage = String(providerData?.statusMessage ?? "");
    const reference = String(providerData?.reference ?? "");
    const paymentUrl = String(providerData?.paymentUrl ?? "");
    const providerResponse = {
      merchantCode: providerData?.merchantCode ?? null,
      reference: reference || null,
      paymentUrl: paymentUrl || null,
      statusCode: statusCode || null,
      statusMessage: statusMessage.slice(0, 250) || null,
      httpStatus: duitkuResponse.status,
    };

    if (!duitkuResponse.ok || statusCode !== "00" || !reference) {
      const normalizedMessage = statusMessage.toLowerCase();
      const ambiguous = duitkuResponse.status === 409 ||
        duitkuResponse.status >= 500 ||
        normalizedMessage.includes("still in progress") ||
        normalizedMessage.includes("amount is different") ||
        (statusCode === "00" && !reference) ||
        !providerData;

      await supabase.from("divoom_payment_transactions")
        .update({
          status: ambiguous ? "pending" : "invoice_failed",
          invoice_creation_state: ambiguous ? "unknown" : "rejected",
          provider_status_code: statusCode || null,
          provider_status_message: statusMessage.slice(0, 250) || "No valid successful Create Invoice response.",
          provider_response: providerResponse,
          invoice_error_message: ambiguous
            ? "Provider outcome requires reconciliation; automatic invoice retry is blocked."
            : statusMessage.slice(0, 250) || "Duitku rejected Create Invoice.",
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);

      return json({
        success: false,
        outcome: ambiguous ? "unknown" : "rejected",
        merchantOrderId,
        error: ambiguous
          ? "Duitku invoice outcome is not definitive. Reconcile this order before another attempt."
          : "Duitku rejected the invoice request.",
      }, 502);
    }

    const { error: saveReferenceError } = await supabase.rpc("divoom_record_invoice_result", {
      p_merchant_order_id: merchantOrderId,
      p_reference: reference,
      p_payment_url: paymentUrl || null,
      p_status_code: statusCode,
      p_status_message: statusMessage || "SUCCESS",
      p_provider_response: providerResponse,
    });

    if (saveReferenceError) {
      console.error("Duitku reference persistence/reconciliation failed:", saveReferenceError.message);
      await supabase.from("divoom_payment_transactions")
        .update({
          invoice_creation_state: "unknown",
          invoice_error_message: "Invoice was created but reference persistence/reconciliation failed.",
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_order_id", merchantOrderId);
      return json({
        success: false,
        outcome: "unknown",
        merchantOrderId,
        error: "Invoice may exist but its reference could not be safely persisted. Contact support with the order ID.",
      }, 500);
    }

    return json({
      success: true,
      data: {
        merchantOrderId,
        reference,
        paymentUrl: paymentUrl || null,
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

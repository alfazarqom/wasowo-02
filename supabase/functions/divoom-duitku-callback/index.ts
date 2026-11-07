import { createClient } from "npm:@supabase/supabase-js@2";

const responseHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase server configuration is incomplete.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function oneValue(params: URLSearchParams, name: string): string {
  const values = params.getAll(name);
  return values.length === 1 ? values[0] : "";
}

function providerMetadata(params: URLSearchParams): Record<string, string> {
  // Keep documented operational metadata. Do not persist cardholder names,
  // masked PAN, card type, or tokenId in the general callback event record.
  const fields = [
    "productDetail",
    "additionalParam",
    "merchantUserId",
    "publisherOrderId",
    "spUserHash",
    "settlementDate",
    "issuerCode",
    "customerName",
    "bankAppCode",
    "bankOrderId",
    "bankRespCode",
    "bankRespMsg",
    "transactionState",
    "transactionStateStatus",
    "merchantCustomerId",
    "expiryDate",
  ];
  return Object.fromEntries(
    fields
      .map((field) => [field, params.get(field) ?? ""] as const)
      .filter(([, value]) => value.length > 0),
  );
}

function textResponse(body: string, status: number): Response {
  return new Response(body, { status, headers: responseHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return textResponse("Method Not Allowed", 405);

  try {
    const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return textResponse("Unsupported Media Type", 415);
    }

    const rawBody = await req.text();
    if (!rawBody || rawBody.length > 32_768) {
      return textResponse("Invalid callback body", 400);
    }

    const params = new URLSearchParams(rawBody);
    const merchantCode = oneValue(params, "merchantCode");
    // Preserve the exact submitted amount text for the documented HMAC input.
    const amountText = oneValue(params, "amount");
    const merchantOrderId = oneValue(params, "merchantOrderId");
    const reference = oneValue(params, "reference");
    const signature = oneValue(params, "signature").toLowerCase();
    const resultCode = oneValue(params, "resultCode");
    const paymentCode = oneValue(params, "paymentCode");

    if (!merchantCode || !amountText || !merchantOrderId || !reference || !signature || !resultCode) {
      return textResponse("Bad Request", 400);
    }
    if (!/^[1-9][0-9]*$/.test(amountText) || merchantOrderId.length > 50) {
      return textResponse("Bad Request", 400);
    }

    const expectedMerchantCode = Deno.env.get("DUITKU_MERCHANT_CODE") ?? "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") ?? "";
    if (!expectedMerchantCode || !apiKey || merchantCode !== expectedMerchantCode) {
      return textResponse("Unauthorized", 401);
    }

    const amount = Number(amountText);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return textResponse("Bad Request", 400);
    }

    // Official POP callback signature:
    // HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey).
    // Do not normalize amountText before calculating this signature.
    const expectedSignature = await hmacSha256Hex(
      merchantCode + amountText + merchantOrderId,
      apiKey,
    );
    if (!/^[a-f0-9]{64}$/.test(signature) || !constantTimeEqual(expectedSignature, signature)) {
      return textResponse("Unauthorized", 401);
    }

    const eventHash = await sha256Hex(rawBody);
    const { data: processingResult, error } = await supabase.rpc("divoom_apply_payment_callback", {
      p_event_hash: eventHash,
      p_merchant_order_id: merchantOrderId,
      p_amount: amount,
      p_amount_text: amountText,
      p_reference: reference,
      p_result_code: resultCode,
      p_payment_code: paymentCode,
      p_provider_metadata: providerMetadata(params),
    });

    if (error) {
      // Do not acknowledge an event that was not durably recorded. Duitku
      // requires HTTP 200 and retries callback delivery when it does not get it.
      console.error("Duitku callback persistence failed:", error.message);
      return textResponse("Callback processing failed", 500);
    }

    // The RPC durably applies, deduplicates, or quarantines every authenticated
    // callback outcome (including early-reference and unsupported-code cases).
    console.log("Duitku callback handled:", String(processingResult ?? "unknown"));
    return textResponse("OK", 200);
  } catch (error) {
    console.error(
      "Duitku callback handler error:",
      error instanceof Error ? error.message : "unknown error",
    );
    return textResponse("Internal Server Error", 500);
  }
});

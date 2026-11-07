import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  try {
    const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return new Response("Unsupported Media Type", { status: 415, headers: corsHeaders });
    }

    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const merchantCode = params.get("merchantCode") ?? "";
    const amountText = params.get("amount") ?? "";
    const merchantOrderId = params.get("merchantOrderId") ?? "";
    const reference = params.get("reference") ?? "";
    const signature = (params.get("signature") ?? "").toLowerCase();
    const resultCode = params.get("resultCode") ?? "";
    const paymentCode = params.get("paymentCode") ?? "";

    if (!merchantCode || !amountText || !merchantOrderId || !reference || !signature || !resultCode) {
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    const expectedMerchantCode = Deno.env.get("DUITKU_MERCHANT_CODE") ?? "";
    const apiKey = Deno.env.get("DUITKU_API_KEY") ?? "";
    if (!expectedMerchantCode || !apiKey || merchantCode !== expectedMerchantCode) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const amount = Number(amountText);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    const expectedSignature = await hmacSha256Hex(merchantCode + amountText + merchantOrderId, apiKey);
    if (!constantTimeEqual(expectedSignature, signature)) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const eventHash = await sha256Hex(rawBody);
    const { data, error } = await supabase.rpc("divoom_apply_payment_callback", {
      p_event_hash: eventHash,
      p_merchant_order_id: merchantOrderId,
      p_amount: amount,
      p_reference: reference,
      p_result_code: resultCode,
      p_payment_code: paymentCode,
    });

    if (error) {
      console.error("Callback processing failed:", error.message);
      return new Response("Callback processing failed", { status: 409, headers: corsHeaders });
    }

    // Duitku's current POP docs specify POST + x-www-form-urlencoded and signature
    // validation, but do not define a mandatory acknowledgment body.
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Callback handler error:", error instanceof Error ? error.message : "unknown error");
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=60, s-maxage=300",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(withSupabase({ auth: "none" }, async (req, ctx) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json(
      { success: false, error: "Method not allowed. Use GET." },
      405,
    );
  }

  const pageSize = 500;
  const products: Record<string, unknown>[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await ctx.supabase
      .from("divoom_products")
      .select("*")
      .order("title", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("get-divoom-products query failed:", error.message);
      return json(
        { success: false, error: "Unable to retrieve Divoom products." },
        500,
      );
    }

    const page = (data ?? []) as Record<string, unknown>[];
    products.push(...page);

    if (page.length < pageSize) break;
    offset += page.length;
  }

  return json({
    success: true,
    data: products,
    total: products.length,
  });
}));

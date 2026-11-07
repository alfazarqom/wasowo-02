# Divoom Duitku POP — setup and review notes

Target repository: `alfazarqom/wasowo-02`  
Target Supabase project: `mvwflakurihhakdrlteg`  
Integration: Duitku POP JavaScript popup  
Shipping: flat Rp52.000

## Files

- `supabase/migrations/20261107000100_create_divoom_duitku_schema.sql`
- `supabase/functions/divoom-duitku-create-invoice/index.ts`
- `supabase/functions/divoom-duitku-callback/index.ts`
- `App.tsx`

## Required Supabase secrets

Configure these in the Supabase project secret manager before deployment. Never put credentials in `App.tsx`.

- `DUITKU_MERCHANT_CODE`
- `DUITKU_API_KEY`
- `DUITKU_ENV` — `sandbox` or `production`
- `STOREFRONT_RETURN_URL` — public storefront URL with `?payment_return=1` appended
- Supabase-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

The Edge Functions use service-role access internally. They must be deployed with JWT verification disabled because these two endpoints are public guest-checkout/callback endpoints; the functions enforce their own validation and rate limits. Do not expose the service-role key.

## Duitku POP contract implemented

- Create Invoice: POST JSON to the official sandbox or production endpoint.
- Request headers: `x-duitku-timestamp` (UNIX milliseconds), `x-duitku-signature`, `x-duitku-merchantcode`.
- Create Invoice signature: HMAC-SHA256 of `merchantCode + timestamp` using the merchant API key.
- Callback: POST `application/x-www-form-urlencoded`.
- Callback signature: HMAC-SHA256 of `merchantCode + amount + merchantOrderId` using the merchant API key.
- Only callback `resultCode=00` marks the order paid; `01` marks it failed. Other result codes are rejected without changing payment state.
- Create Invoice requires an `Idempotency-Key` header. The key and normalized checkout fingerprint are stored on the new `divoom_orders` records; retries with the same key reuse the saved invoice or return an in-progress response instead of creating another order.
- If the Duitku request outcome is ambiguous (for example, a network timeout after the request was sent), the transaction is marked `invoice_unknown`; automatic retry with a new key is blocked to avoid accidentally creating a second payable invoice. Reconcile with Duitku before starting another attempt.
- The browser loads the Duitku JS library ahead of time, but `checkout.process()` is invoked only by an explicit user click. Popup events and the return URL are not payment proof; the UI reads status from the server.
- POP documentation does not specify a fixed callback acknowledgment body; this implementation responds `200 OK` after verified processing.

Official source of truth: https://docs.duitku.com/pop/id/ (checked 2026-11-07), sections Create Invoice, Callback, Duitku JS, and Redirect.

## Important scope notes

- The existing `divoom_products` table has no numeric stock column in the audited schema. This implementation checks `availability = 'in stock'` at checkout but does not reserve or decrement stock.
- Shipping is included as a separate Rp52.000 line item and in the authoritative backend total.
- Guest order status is retrieved by merchant order ID plus matching email and rate-limited.
- No existing non-Divoom table or Edge Function is modified. The idempotency fields are part of the new `divoom_orders` table definition in this not-yet-applied migration.
- The migration is source only. It has NOT been executed. The functions have NOT been deployed. Secrets have NOT been set.

## Manual activation steps (not performed)

1. Review and apply the migration to the intended Supabase project.
2. Configure the required secrets.
3. Deploy both functions with JWT verification disabled.
4. Test only against Duitku Sandbox; verify callback, popup, duplicate callback, wrong signature, wrong amount, and guest status lookup.
5. Do not switch `DUITKU_ENV` to production until merchant credentials and callback behavior are confirmed.

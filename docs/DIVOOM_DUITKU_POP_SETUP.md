# Duitku POP Sandbox — setup and implementation notes

Target repository: `alfazarqom/wasowo-02`  
Target Supabase project: `mvwflakurihhakdrlteg`  
Integration: Duitku POP JavaScript Popup  
Environment for this implementation: **Sandbox only**  
Shipping: flat Rp52.000

## Approved checkout flow

1. The storefront sends customer details, product IDs, quantities, and the displayed `expectedTotalAmount` to `divoom-duitku-create-invoice`.
2. The Edge Function reads current product title, availability, price, and sale price from `public.divoom_products`.
3. The Edge Function recalculates subtotal, shipping, and total using integer IDR. It rejects the request with HTTP 409 if the calculated total differs from `expectedTotalAmount`. No order or invoice is created on mismatch.
4. The Edge Function creates the guest order, order items, and pending payment record, then sends Create Invoice to the official Duitku Sandbox endpoint.
5. The frontend loads the Sandbox POP JavaScript library and calls `checkout.process(reference, options)`.
6. Duitku's signed HTTP callback is the only source that changes payment status. Popup events and browser redirect only refresh or display server status.
7. `OrderSuccessPage` independently checks the server status and displays confirmation only when the backend returns `paid`.

There is no separate quote table or quote-approval endpoint in this approved scope. The client total is only a consistency check; the backend remains authoritative for all prices and the amount sent to Duitku.

## Repository files

- `src/config/backend.ts` — public Edge Function base URL and endpoint constants; no Supabase anon/publishable key is used in the browser.
- `src/context/AppContext.tsx` — reads the product catalog from `get-divoom-products`; no local seed fallback.
- `src/pages/CheckoutPage.tsx` — sends item IDs, quantities, and expected total.
- `src/pages/PaymentPage.tsx` — Sandbox popup and server status polling.
- `src/pages/PaymentReturnPage.tsx` — reads server status; does not trust redirect result codes.
- `src/pages/OrderSuccessPage.tsx` — verifies payment status on every page load.
- `supabase/functions/divoom-duitku-create-invoice/index.ts`
- `supabase/functions/divoom-duitku-callback/index.ts`
- `supabase/migrations/20261107000100_create_divoom_duitku_schema.sql`
- `supabase/migrations/20261107000200_fix_callback_invoice_reference_race.sql`

## Duitku POP contract

- Create Invoice: HTTP POST JSON to `https://api-sandbox.duitku.com/api/merchant/createInvoice`.
- Required headers: `Content-Type: application/json`, `x-duitku-timestamp` (Unix milliseconds), `x-duitku-signature`, and `x-duitku-merchantcode`.
- Create Invoice signature: HMAC-SHA256 of `merchantCode + timestamp` using the merchant API key.
- Callback: HTTP POST with `application/x-www-form-urlencoded`.
- Callback signature: HMAC-SHA256 of `merchantCode + amount + merchantOrderId` using the merchant API key.
- Accepted callback result codes: `00` (success) and `01` (failed); unknown codes are rejected.
- `itemDetails.name` is limited to 50 characters. Item prices and quantities are integers, and the sum of `price × quantity` must equal `paymentAmount`.
- The callback reference, amount, merchant order ID, and merchant code are checked before a status transition.
- A valid signed callback can persist the provider reference when the Create Invoice response has not yet been saved. After a successful invoice reference save, the backend also invokes pending-callback reconciliation.
- Ambiguous Create Invoice network/response failures remain pending; they are not marked as a definitive invoice failure and are not automatically retried with a new invoice.
- No explicit `expiryPeriod` is sent because the merchant's expiry configuration has not been verified.
- Popup JavaScript events and return URL query parameters are not proof of payment.

Official source of truth: https://docs.duitku.com/pop/id/ — Create Invoice, Item Details, Callback, Duitku JS, and Redirect (checked 2026-11-07).

## Required Edge Function secrets

Configure/verify these in the Supabase project secret manager. Secret values must never be placed in frontend code or committed to Git.

- `DUITKU_MERCHANT_CODE`
- `DUITKU_API_KEY`
- `DUITKU_ENV=sandbox`
- `STOREFRONT_RETURN_URL` — public storefront URL with `?payment_return=1` appended
- Supabase-provided `SUPABASE_URL`
- Supabase-provided `SUPABASE_SERVICE_ROLE_KEY`

The user confirmed the Sandbox secrets are configured. Secret values were not read or displayed. The Edge Functions use service-role access only on the server. The public guest-checkout and callback functions currently have `verify_jwt=false`; internal input validation and Duitku callback signature verification remain mandatory. Never expose the service-role key.

## Current Supabase observations (read-only, 2026-11-07)

- Project `mvwflakurihhakdrlteg` is active.
- The deployed `divoom-duitku-create-invoice` and `divoom-duitku-callback` Edge Functions are active (version 2 at inspection time); `get-divoom-products` is also active.
- `public.divoom_products` contains 147 rows and exposes the fields used by checkout.
- The transaction tables and callback/rate-limit RPCs exist, and RLS is enabled on the transaction tables.
- The repository's two 2026-11-07 migration versions are not present in the project's migration history, even though the related tables and some RPCs exist. The deployed callback RPC definition also differs from the updated repository migration.

**Important:** this is schema/migration drift. Do not run either migration blindly. Reconcile the migration history, active table definitions, RPC bodies, grants, and RLS before applying any database migration. This branch changes repository source only; it does not apply migrations, deploy functions, or modify secrets.

## Explicit scope exclusions

- No production endpoint or production popup.
- No production deployment or real payment.
- No active Supabase migration execution.
- No secret value changes or reads.
- No inventory reservation/decrement; checkout checks the existing `availability` flag only.
- No new expiry value or provider inquiry endpoint invented beyond the official POP documentation.
- No separate quote workflow.
- No new guest authentication/OTP mechanism. The existing limited status lookup remains based on order ID plus matching email and is not a general order-detail API.

## Manual activation and test gate (not performed)

1. Reconcile the schema and migration history before applying the repository migrations.
2. Confirm `DUITKU_ENV=sandbox` and the public callback/return URLs without exposing credential values.
3. Deploy the updated Edge Functions only after a separate deployment approval.
4. Run Sandbox tests for: valid invoice, expected-total mismatch, invalid callback signature, invalid result code, amount/reference mismatch, duplicate callback, callback before reference persistence, ambiguous Create Invoice response, and direct access to a pending Order Success URL.
5. Do not switch to production until merchant credentials, callback behavior, expiry configuration, and release scope are separately approved.

# Divoom Duitku POP — setup and review notes

Target repository: `alfazarqom/wasowo-02`  
Target Supabase project observed during audit: `mvwflakurihhakdrlteg`  
Integration: Duitku POP JavaScript Popup  
Shipping: flat Rp52.000

## Source of truth

The canonical provider contract for this repository is [DUITKU_POP_SOURCE_OF_TRUTH.md](./DUITKU_POP_SOURCE_OF_TRUTH.md).

Official source: https://docs.duitku.com/pop/id/ (checked 2026-11-07). The current official documentation takes precedence over assumptions in existing code, comments, copied samples, and this setup note.

## Relevant files

- `docs/DUITKU_POP_SOURCE_OF_TRUTH.md` — canonical provider contract and project constraints.
- `supabase/migrations/20261107000100_create_divoom_duitku_schema.sql`
- `supabase/migrations/20261107000200_fix_callback_invoice_reference_race.sql`
- `supabase/migrations/20261107000300_align_divoom_duitku_pop_callback.sql` — additive protocol alignment, callback metadata, invoice outcome state, and atomic callback reconciliation.
- `supabase/functions/divoom-duitku-create-invoice/index.ts`
- `supabase/functions/divoom-duitku-callback/index.ts`
- `src/pages/CheckoutPage.tsx`
- `src/pages/PaymentPage.tsx`
- `src/pages/PaymentReturnPage.tsx`
- `src/pages/OrderSuccessPage.tsx`

## Required Supabase secrets

Configure these in the Supabase project secret manager before deployment. Never put credentials in frontend code.

- `DUITKU_MERCHANT_CODE`
- `DUITKU_API_KEY`
- `DUITKU_ENV` — `sandbox` or `production`
- `STOREFRONT_RETURN_URL`
- Supabase-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key to the browser. Do not read or print secret values in audit reports.

## Verified POP protocol contract

### Create Invoice

- HTTP `POST`, `application/json`.
- Sandbox: `https://api-sandbox.duitku.com/api/merchant/createInvoice`.
- Production: `https://api-prod.duitku.com/api/merchant/createInvoice`.
- Required headers: `x-duitku-timestamp` (UNIX milliseconds), `x-duitku-signature`, `x-duitku-merchantcode`.
- Request signature: HMAC-SHA256 of `merchantCode + timestamp`, keyed by the merchant API key.
- Required fields include `paymentAmount`, `merchantOrderId`, `productDetails`, `email`, `callbackUrl`, and `returnUrl`.
- `itemDetails.name` maximum is **50 characters**; `price` and `paymentAmount` are integer IDR values without decimals.
- The sum of item detail line totals must equal `paymentAmount`.
- The response `reference` must be persisted and tied to the corresponding payment.

### HTTP Callback

- HTTP `POST`, `application/x-www-form-urlencoded`.
- Callback signature: HMAC-SHA256 of `merchantCode + amount + merchantOrderId`, keyed by the merchant API key.
- The official POP page is internally inconsistent: the HTTP Callback parameter table lists `00` success / `01` failed, while Errors → API Response → Callback lists `00` success / `02` failed. The implementation treats only `00` as paid, accepts `01` and `02` as non-success/failure, and durably quarantines all other codes. The JS `pendingEvent` is a browser event and is not the HTTP callback result code contract.
- Validate signature, merchant code, merchant order ID, amount, reference, and allowed state transition.
- Duitku requires HTTP `200 OK` and retries when it does not receive HTTP 200, up to five attempts according to the current documentation. Acknowledge only after the callback has been safely and durably handled.

### Popup and return URL

- Popup JS library: Sandbox `https://app-sandbox.duitku.com/lib/js/duitku.js`; Production `https://app-prod.duitku.com/lib/js/duitku.js`.
- JS callback events are for UI only; they cannot update authoritative payment status.
- Return URL query parameters, including `resultCode`, can be manually changed by the customer and must not update payment state.
- Payment status must come from a server-authoritative read after secure authorization.

See the canonical source-of-truth document for the full contract and review checklist.

## Project-specific constraints

- Database objects use the `divoom_` prefix; Edge Functions use the `divoom-` prefix.
- Shipping is flat Rp52.000 and included exactly once in the server-authoritative amount.
- Guest checkout remains supported; mandatory customer authentication is not introduced.
- `expiryPeriod` is omitted unless merchant configuration and an explicit approved requirement establish its value. The current project decision is to follow merchant configuration; no fixed value has been selected.
- Guest order lookup hardening remains a deferred dependency. Do not expose order details through merchant order ID + email alone.
- Quantitative inventory reservation/decrement and automated refund are outside the approved scope.
- Do not invent or implement a provider inquiry/status endpoint without verifying it in the current official POP documentation and merchant configuration.

## Current implementation review notes (static inspection)

The following are code observations, not runtime test results:

- Create Invoice request signature and endpoint selection currently follow the documented POP contract.
- Callback transport and callback signature formula currently follow the documented POP contract.
- Create Invoice now limits `itemDetails.name` to 50 characters and verifies that item detail line totals equal `paymentAmount`.
- HTTP callback now validates the documented form content type, exact amount text in the HMAC input, merchant, signature, order, amount, and reference.
- Only callback `resultCode=00` can mark paid. The official documentation's `01`/`02` discrepancy is explicitly handled as non-success; unknown codes are durably quarantined.
- Early callbacks are durably stored and reconciled atomically after the Create Invoice response's `reference` is persisted.
- Network timeout, malformed provider response, missing reference, HTTP 409, HTTP 5xx, and documented concurrent-request messages are handled as ambiguous invoice outcomes; the function does not blindly retry or mark them as definitive failures.
- Successful Create Invoice response persists `reference` and `paymentUrl` through the new `divoom_record_invoice_result` RPC.
- Checkout currently creates the invoice directly without a separately persisted buyer approval bound to the final backend quote.
- Order Success currently renders a confirmed-payment message without verifying a server-authoritative status.
- Guest order lookup is not to be expanded until the deferred secure access mechanism is decided.

## Verification status

- Static repository edits are committed on `feature/duitku-pop-hardening`.
- No Deno tests, TypeScript build, lint, SQL migration execution, Supabase function deployment, or live Sandbox transaction has been run as part of this repository-only change.
- The existing guest order status GET path in the Create Invoice function is not redesigned in this task; its security hardening remains a deferred dependency and must not be treated as approved guest order lookup.

## Operational boundary

Migration files in the repository are proposals only unless separately approved for execution. This documentation update does not execute migrations, mutate the live Supabase database, read or change secrets, change merchant settings, create Sandbox transactions, deploy functions, merge branches, or deploy the application.

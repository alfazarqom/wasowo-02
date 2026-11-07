# Duitku POP — Official Source of Truth

> **Status:** Reference baseline for payment integration in this repository  
> **Checked:** 2026-11-07  
> **Repository:** `alfazarqom/wasowo-02`  
> **Integration mode:** Duitku POP JavaScript Popup  
> **Backend:** Supabase Edge Functions + PostgreSQL  
> **Supabase project observed during audit:** `mvwflakurihhakdrlteg`

## 1. Authority and precedence

This document records the provider contract that the repository must follow.

1. **Duitku POP protocol:** The current official Duitku POP API Reference is authoritative for provider endpoints, request headers, signature formulas, payload fields, callback format, result codes, and popup/redirect behavior.
2. **Supabase platform behavior:** Current official Supabase documentation is authoritative for Edge Functions, secrets, PostgreSQL, RLS, RPC execution, and deployment mechanics.
3. **Project-specific behavior:** The approved repository requirements and the actual connected Supabase schema determine order, quote, payment, and customer-access behavior. They must not contradict the Duitku protocol.
4. **Repository code and migrations:** These are implementation artifacts, not proof of provider requirements or live database state. Verify them against the sources above and the connected project.

Primary provider reference: https://docs.duitku.com/pop/id/  
Relevant sections: Create Invoice, JSON Objects, Callback, Duitku JS, JS Callback, Window Redirection, Redirect, Payment Method, Errors, and Changelog.

A copied code example is not a substitute for checking the current parameter table and contract. If official documentation changes, update this document and the implementation plan before changing behavior.

## 2. Integration mode

This repository uses **Duitku POP JavaScript Popup**:

1. The Supabase Edge Function creates the invoice server-to-server.
2. The Edge Function persists the returned Duitku `reference`.
3. The frontend loads the environment-matched Duitku JS library and calls `checkout.process(reference, options)`.
4. JS events are presentation/navigation signals only.
5. The provider sends an independent HTTP callback to the Supabase callback Edge Function.
6. Only a verified server callback may update the authoritative payment state.

Do not silently replace Popup with Window Redirection or another Duitku product/API.

## 3. Create Invoice contract

### Endpoint and request

- Method: `POST`
- Content type: `application/json`
- Sandbox: `https://api-sandbox.duitku.com/api/merchant/createInvoice`
- Production: `https://api-prod.duitku.com/api/merchant/createInvoice`

Required headers:

| Header | Requirement |
|---|---|
| `Content-Type` | `application/json` |
| `x-duitku-timestamp` | UNIX timestamp in milliseconds |
| `x-duitku-signature` | HMAC-SHA256 signature |
| `x-duitku-merchantcode` | Merchant code |

Request signature:

```text
stringToSign = merchantCode + timestamp
signature = HMAC_SHA256(stringToSign, apiKey)
```

The API key is server-side only. Generate the signature inside the Supabase Edge Function.

### Required and optional payload fields

The current documentation marks these fields as required:

- `paymentAmount`: integer IDR.
- `merchantOrderId`: string, maximum 50 characters; unique for a new transaction.
- `productDetails`: string, maximum 255 characters.
- `email`: string, maximum 255 characters.
- `callbackUrl`: callback endpoint.
- `returnUrl`: browser return endpoint.

Optional fields include `additionalParam`, `merchantUserInfo`, `paymentMethod`, `customerVaName`, `phoneNumber`, `itemDetails`, `customerDetail`, `creditCardDetail`, and `expiryPeriod`.

Important validation rules:

- Each `itemDetails.name` is limited to **50 characters**.
- `itemDetails.price` is an integer; decimals are not permitted.
- The sum of `itemDetails.price × quantity` must equal `paymentAmount`.
- Do not send an explicit `expiryPeriod` unless the merchant configuration and approved business requirement specify it. In this project, expiry follows merchant configuration and no explicit value has been approved.
- Do not reuse one `merchantOrderId` for a different new transaction.
- Duitku documents that repeated Create Invoice requests with the same order ID may return the same response for five minutes; concurrent requests can produce an in-progress or amount-difference error. Prevent duplicate concurrent invoice creation in the backend rather than retrying blindly.

### Successful response

The documented response includes:

- `merchantCode`
- `reference`
- `paymentUrl`
- `statusCode`
- `statusMessage`

Persist the returned `reference` against the exact merchant order/payment. For Popup mode, the frontend uses the `reference` with the environment-matched Duitku JS library.

Treat provider business status separately from HTTP status. An HTTP response alone is not proof that invoice creation succeeded.

## 4. HTTP callback contract

### Transport and fields

- Method: `POST`
- Content type: `application/x-www-form-urlencoded`
- The callback endpoint must be publicly reachable over HTTP/HTTPS.
- Duitku requires an HTTP `200 OK` callback response.

The documented callback fields include `merchantCode`, `amount`, `merchantOrderId`, `resultCode`, `reference`, `signature`, and `paymentCode`, plus optional provider/payment metadata.

Callback signature:

```text
stringToSign = merchantCode + amount + merchantOrderId
signature = HMAC_SHA256(stringToSign, apiKey)
```

Preserve the exact amount text used in the signature input. After signature verification, validate the parsed amount as a positive safe integer and compare it with the persisted payment amount.

Before applying a callback, validate:

- configured merchant code matches;
- signature is valid using the server-side API key;
- merchant order ID maps to one known payment;
- amount equals the persisted payment amount;
- Duitku reference matches the persisted invoice reference, or is stored as a verified early callback awaiting reference persistence;
- result code is a documented value;
- the payment state transition is allowed.

### Result codes and an inconsistency in the official reference

The current official Indonesian POP page contains two callback-code descriptions that do not fully agree:

- The HTTP Callback parameter table (Callback section) lists `00` = Success and `01` = Failed.
- The Errors → API Response → Callback table lists `00` = Success and `02` = Failed.
- Separately, the Duitku JS section labels the browser `pendingEvent` as event `01`. That is a browser event and must not be conflated with the HTTP Callback result-code contract.

Repository handling is deliberately conservative:

- Only HTTP callback `00` may mark a payment as paid.
- HTTP callback `01` and `02` are both accepted as documented non-success/failure values and never mark a payment as paid.
- Any other or empty result code is durably quarantined as unsupported and cannot mutate the payment/order state.
- Confirm the exact callback code behavior for the merchant's enabled payment channels with Duitku before production activation if Duitku supplies a code outside these documented values.

A valid signature does not remove the need to validate merchant, order, amount, reference, idempotency, and state transition.

### Acknowledgment and retries

The documentation requires HTTP `200 OK` and says Duitku retries callback delivery when it has not received HTTP 200, up to five attempts, after which it sends a failed-callback notification by email. It also documents dashboard callback resend. The Errors section additionally documents HTTP 409 `The transaction is still in progress` and HTTP 400 `Amount is different please try again later` for concurrent/repeated Create Invoice requests using the same order ID; treat these as ambiguous and do not blindly create a second invoice.

The documentation does not prescribe a mandatory response body. Return HTTP 200 only after the event is durably and safely handled (applied, recognized as a duplicate, or durably queued for reconciliation). If processing fails before durable handling, return a non-200 response so retry/recovery remains possible.

Callback processing must be idempotent and safe under duplicate/concurrent delivery.

## 5. Browser popup and return behavior

### Duitku JS

The documented library URLs are:

- Production: `https://app-prod.duitku.com/lib/js/duitku.js`
- Sandbox: `https://app-sandbox.duitku.com/lib/js/duitku.js`

Call:

```js
checkout.process(duitkuReference, {
  defaultLanguage: "id",
  successEvent,
  pendingEvent,
  errorEvent,
  closeEvent
});
```

These browser events may update the UI or trigger a read-only refresh from the backend. They must never directly mark an order/payment as paid.

### Return URL

Duitku may redirect to `returnUrl` with `merchantOrderId`, `resultCode`, and `reference`. The documentation explicitly warns not to use redirect `resultCode` to update payment status because the URL can be manually changed by the customer.

The return page must treat all query parameters as untrusted navigation context and retrieve authoritative status through a safely authorized backend read path.

## 6. Supabase implementation boundary

- Merchant code and API key remain in Supabase Edge Function secrets; never expose them in frontend code or Vite client environment variables.
- Use the service role only inside server-side Edge Functions where required; never send it to the browser.
- Keep RLS enabled on exposed transaction tables and do not add public policies merely to make checkout work.
- Restrict privileged RPC execution to the intended server role; review `SECURITY DEFINER`, fixed `search_path`, schema qualification, and grants.
- Keep provider HTTP calls outside long-running PostgreSQL transactions.
- Use database constraints/RPCs for atomic state transitions and idempotency.
- The browser must not be able to mutate payment status.
- Do not implement an undocumented inquiry/status endpoint or claim that a provider status-check mechanism exists without verifying it in the current POP documentation and merchant configuration.

## 7. Project-specific approved constraints

- Supabase backend and Edge Functions are used for payment processing.
- Duitku POP JavaScript Popup remains the selected integration mode.
- Database objects use the `divoom_` prefix and Edge Functions use the `divoom-` prefix.
- Shipping is flat Rp52.000 and is included exactly once in the server-authoritative amount.
- Guest checkout remains supported; mandatory customer authentication is not introduced.
- `expiryPeriod` remains omitted until merchant configuration/requirement is confirmed.
- Guest order lookup hardening is a deferred dependency; do not expose order details through merchant order ID + email alone.
- Quantitative inventory reservation/decrement and automated refund are outside the approved scope.
- Repository migration files are proposals only unless separately approved for execution. No live database mutation, secret change, merchant setting change, Sandbox transaction, merge, or deployment is authorized by this reference document.

## 8. Implementation review checklist

- [ ] Request endpoint and environment match the current POP documentation.
- [ ] Request HMAC uses `merchantCode + timestamp` and HMAC-SHA256.
- [ ] Timestamp is UNIX milliseconds.
- [ ] Required Create Invoice fields are present and correctly typed.
- [ ] Item names are at most 50 characters; item amounts are integers.
- [ ] Item total equals `paymentAmount`.
- [ ] `expiryPeriod` is omitted unless explicitly approved and configured.
- [ ] Provider response status and HTTP status are handled separately.
- [ ] Duitku `reference` is persisted and tied to the correct payment.
- [ ] Callback parser accepts the documented form content type.
- [ ] Callback HMAC uses `merchantCode + amount + merchantOrderId`.
- [ ] HTTP callback `00` alone marks paid; documented `01`/`02` non-success values cannot mark paid; unknown values are quarantined.
- [ ] Duplicate and early callbacks are durably/idempotently handled.
- [ ] Create Invoice timeout, HTTP 409, HTTP 5xx, malformed response, and missing reference are treated as ambiguous, not as definitive rejection.
- [ ] Successful Create Invoice response persists `reference` and `paymentUrl` and triggers early-callback reconciliation.
- [ ] HTTP 200 is returned only after safe durable handling.
- [ ] Popup JS events and return URL parameters never set payment status.
- [ ] Order success UI is based only on an authoritative server status.
- [ ] Supabase secrets, RLS, RPC grants, and privileged functions are reviewed.
- [ ] No undocumented provider endpoint or behavior is assumed.

## 9. Review history

- 2026-11-07 — Reviewed https://docs.duitku.com/pop/id/ and recorded the POP Create Invoice, Callback, JS Callback, Popup, Redirect, and payload constraints for this repository.
- 2026-11-07 — Recorded the official page's callback result-code inconsistency (`01` in the callback parameter table vs `02` in Errors → API Response → Callback); implementation only treats `00` as paid and quarantines values outside `00`, `01`, and `02`.
- 2026-11-07 — Aligned the repository migration and Edge Functions with item name length, callback event persistence, callback reconciliation, and ambiguous Create Invoice outcomes.

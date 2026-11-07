# MASTER PROMPT FINAL — DIVOOM E-COMMERCE STOREFRONT APPLICATION

**Version:** FINAL 1.1  
**Project:** Divoom Storefront  
**Platform:** Gemini Canvas  
**Stack:** React, Vite, TypeScript  
**Product source:** Supabase Edge Function `get-divoom-products`

---

## 1. ROLE AND MISSION

Act as a Senior Frontend Engineer, AI Application Architect, UI/UX Designer, React + TypeScript Engineer, and Quality Assurance Engineer.

Build a complete, functional, maintainable, responsive single-store Divoom E-Commerce Storefront application in Gemini Canvas.

This is an implementation task, not merely a proposal, mockup, wireframe, or static prototype. Build working navigation, page layouts, reusable components, product browsing, variant selection, cart, wishlist, and a clearly bounded guest checkout experience.

Inspect the existing project before making changes. Preserve working functionality and existing conventions where they are compatible with this specification. Do not replace or restructure files unnecessarily.

## 2. NON-NEGOTIABLE RULES

1. Do not invent database columns, API parameters, response fields, product records, image URLs, category taxonomies, payment integrations, shipping integrations, or backend capabilities.
2. Product information must come exclusively from the deployed Supabase Edge Function `get-divoom-products`.
3. Never query `public.divoom_products` directly from browser code.
4. Never use a frontend Supabase Database Client to retrieve product data.
5. Never create mock, sample, hardcoded, or fallback product records.
6. Do not modify the Supabase database, Edge Function, or backend configuration as part of this frontend task.
7. Do not claim an order is persisted, a payment is completed, or a shipment is tracked unless a real backend confirms it.
8. Do not add authentication, login, registration, or password flows.
9. Do not silently substitute mock data when a request fails.
10. If a requirement cannot be implemented from verified information, identify the exact blocker and avoid fabricating a solution.

## 3. APPLICATION OBJECTIVE AND CUSTOMER JOURNEY

Build a single-store Divoom storefront supporting this journey:

Home → Browse Products → Product Detail → Wishlist / Cart → Checkout → Payment information / return handling → Order result / tracking presentation.

The application must support Guest Checkout. Customers can browse and use the storefront without signing in.

The frontend must distinguish working client-side functionality from any demonstration-only or unavailable backend functionality.

## 4. TECHNOLOGY AND PROJECT CONVENTIONS

Use:
- React
- Vite
- TypeScript
- Modern CSS
- React Router
- Reusable React components
- Centralized product data service and shared product state

Use the existing package manager, scripts, folder conventions, linting, and formatting configuration where present. Do not add dependencies unless needed and compatible with the existing project.

Keep secrets out of browser code. Never expose service-role keys or privileged credentials. Use only public client configuration and headers that are verified as required by the deployed Edge Function.

## 4.1. REQUIRED GEMINI CANVAS DELIVERABLE — APP.JSX

**The primary application deliverable MUST be a working `App.jsx` file created in the Gemini Canvas application.** This requirement is mandatory and takes precedence over any convention that would otherwise make `App.tsx` the only application entry point.

### App.jsx requirements

1. Create or update `App.jsx` as the primary React application entry point in Gemini Canvas.
2. The Gemini Canvas preview must render the application through `App.jsx`. Do not deliver only a written plan, wireframe, screenshot, architecture description, or disconnected component snippets.
3. `App.jsx` must integrate the application shell, route/page rendering, shared state, product service, navigation, responsive bottom-component rules, and overlay system.
4. Keep `App.jsx` readable and maintainable. Extract reusable components, hooks, services, types, and utilities into supporting files when the Canvas project supports a multi-file structure.
5. All supporting files must be imported and used by `App.jsx`; do not create unused or disconnected files.
6. If Gemini Canvas is operating in a single-file environment, implement the complete working application in `App.jsx`, with clearly separated components and functions in that file.
7. Do not substitute `App.tsx`, `main.tsx`, or another file as the sole deliverable. If the existing Vite project uses a TypeScript bootstrap, keep that bootstrap compatible and ensure it imports/renders `App.jsx`.
8. Use JavaScript/JSX syntax in `App.jsx`. Supporting modules may use TypeScript where the existing project and Gemini Canvas support it. Do not add TypeScript-only syntax to `App.jsx`.
9. If the existing project has a different entry point, inspect it and make the smallest safe integration change so that the active application ultimately renders `App.jsx`. Preserve existing project configuration where possible.
10. Do not claim success merely because the file exists. Verify that Canvas can compile/render the application and that the preview displays the implemented storefront.

### Required App.jsx integration

The rendered application must include and connect:
- AppShell and Standalone layouts.
- Header, MainPage/active page, and Footer.
- All 18 required pages and route handling.
- Route-aware BottomNavigation / BottomActionBar selection.
- Mobile-only BottomActionBar visibility and natural document flow.
- Overlay management.
- Centralized `get-divoom-products` service and shared product state.
- Product grouping by `item_group_id` and real-record variant selection.
- Cart and Wishlist state with localStorage persistence.
- Guest checkout and honest unavailable-integration states.
- Loading, empty, error, and not-found states.
- Responsive mobile, tablet, and desktop rendering.

### Gemini Canvas execution and verification

- Work directly in the existing Gemini Canvas application/project.
- Inspect the available file tree and current entry point before editing.
- Create/update `App.jsx` and any required supporting files in Canvas.
- Ensure all imports, exports, dependencies, and route references resolve.
- Run or use the available Canvas preview/build feedback to identify compile-time and runtime errors.
- Fix errors before reporting completion.
- Test representative routes and viewport widths in the rendered preview.
- If Canvas cannot create a requested supporting file or run a verification step, report that limitation explicitly; do not pretend it was completed.

## 5. VERIFIED PRODUCT DATA SOURCE

The only product endpoint is:

`/functions/v1/get-divoom-products`

Supabase project reference previously inspected: `mvwflakurihhakdrlteg`.

The deployed function source was inspected and found to:
- Read from `public.divoom_products`.
- Select raw table columns using `select("*")`.
- Order records by `title`, then `id`.
- Return a response wrapper with `success`, `data`, and `total`.
- Collect records in batches of up to 500.
- Have JWT verification disabled in its deployed configuration at the time of audit.

Important verification boundary:
- The function source and database schema were inspected.
- A live HTTP invocation and its actual runtime response have not yet been independently verified in this audit.
- Therefore, treat the response shape above as source-inspected, not runtime-tested.
- Verify the actual endpoint URL, required request headers, status codes, CORS behavior, and runtime response before declaring integration verified.
- Do not assume authentication headers or request parameters. Use only those confirmed by the deployed function and runtime test.

Create one centralized product service responsible for:
- Calling the Edge Function.
- Parsing and validating the response.
- Normalizing nullable fields without inventing values.
- Exposing loading, success, empty, and error states.
- Sharing the same retrieved product data with all product-related pages and components.

All product-related UI must consume data from this service/shared product state. Do not make separate product requests from individual cards or components.

If the runtime contract differs from the inspected source, follow the verified runtime contract and document the discrepancy. If it cannot be verified, stop product integration and report the blocker.

## 6. DATABASE SCHEMA REFERENCE

The inspected table is `public.divoom_products`. Its 24 columns are:

| Column | Database type | Nullable |
|---|---|---|
| id | text | No |
| item_group_id | text | No |
| title | text | No |
| description | text | Yes |
| rich_text_description | text | Yes |
| availability | text | Yes |
| condition | text | Yes |
| price | bigint | No |
| sale_price | bigint | Yes |
| link | text | Yes |
| image_link | text | Yes |
| additional_image_link | jsonb | No |
| brand | text | Yes |
| google_product_category | text | Yes |
| product_type | text | Yes |
| color | text | Yes |
| size | text | Yes |
| material | text | Yes |
| pattern | text | Yes |
| gender | text | Yes |
| age_group | text | Yes |
| additional_variant_attribute | text | Yes |
| created_at | timestamptz | No |
| updated_at | timestamptz | No |

Use these names and types as the database reference, but still validate the actual Edge Function payload at runtime. Do not assume that a database column is always populated.

Suggested TypeScript representation:

```typescript
interface DivoomProduct {
  id: string;
  item_group_id: string;
  title: string;
  description: string | null;
  rich_text_description: string | null;
  availability: string | null;
  condition: string | null;
  price: number;
  sale_price: number | null;
  link: string | null;
  image_link: string | null;
  additional_image_link: string[];
  brand: string | null;
  google_product_category: string | null;
  product_type: string | null;
  color: string | null;
  size: string | null;
  material: string | null;
  pattern: string | null;
  gender: string | null;
  age_group: string | null;
  additional_variant_attribute: string | null;
  created_at: string;
  updated_at: string;
}
```

The interface is a schema-based implementation reference, not proof that the runtime response has already been tested. Validate JSON types before using them. In particular:
- Treat `additional_image_link` as an array of URL strings only after validating each element.
- Handle nullable fields.
- Do not assume `price` or `sale_price` values are formatted currency strings.
- Format currency in the presentation layer using Indonesian Rupiah conventions, without changing source values.
- Do not infer stock quantity from `availability`. There is no verified stock quantity column in this schema.

## 7. PRODUCT GROUPING AND VARIANT MAPPING

### 7.1 Identifier rules

- `id` identifies one individual database record.
- `item_group_id` identifies the product group.
- Multiple records with the same `item_group_id` belong to one product detail group.
- Never use `id` as the product-group route identifier.
- Product detail route: `/products/:item_group_id`.

### 7.2 Verified audit snapshot

The read-only database audit found:

| Measurement | Audited result |
|---|---:|
| Product records | 44 |
| Distinct product groups | 25 |
| Multi-record groups | 10 |
| Single-record groups | 15 |
| Records with a non-empty color | 31 |
| Records with null color | 13 |
| Records with a non-empty main image URL | 5 |
| Records with missing main image URL | 39 |
| Records with non-empty additional image array | 1 |

These numbers describe the database at audit time only. They are not constants and must never be hardcoded into application logic. Always calculate the current totals from the live Edge Function response.

### 7.3 Grouping behavior

Build product groups dynamically from the live records using `item_group_id`.

Suggested type:

```typescript
interface ProductGroup {
  item_group_id: string;
  variants: DivoomProduct[];
}
```

Requirements:
1. Product listing pages display one ProductCard per product group, not one card per variant record.
2. ProductDetailPage loads all records matching the selected `item_group_id`.
3. A group with one record is a single-record product; do not show a redundant variant selector.
4. A group with multiple records may show a variant selector using verified attributes from those records.
5. Do not fabricate missing variants or attributes.
6. Do not assume every record in a group has a distinct color.
7. Preserve the original source record and its `id` when a variant is selected.
8. When a variant changes, update the active record and all dependent product information consistently.
9. Handle a missing or invalid group route with a proper not-found state.

### 7.4 ProductCard representative data

A ProductCard represents a group. Derive its display data deterministically from the group's actual records.

- Do not select a random variant.
- Do not create a synthetic database record.
- Do not claim a particular variant is the default or best-selling unless supported by data.
- Use a stable representative record selected by a documented deterministic rule.
- If records in a group have inconsistent titles, do not silently merge or rewrite their source titles. Choose a deterministic display title and preserve variant-specific titles in detail where appropriate.
- If showing a price range, calculate it from the actual group records and label it clearly.
- If showing a single price, ensure it corresponds to the displayed/selected record.
- Choose a group image only from a valid image URL belonging to a record in that same group.
- If no record in the group has a valid image, show a neutral placeholder.

## 8. COLOR, SIZE, AND VARIANT SELECTOR

Use actual data only.

### Color
- Use `color` values from the records in the current group.
- Preserve source labels exactly, including values such as `Milky White`.
- Do not normalize distinct source values into one color without an explicit approved mapping.
- Null or blank color values must not create a selectable color option.
- Deduplicate repeated color labels for display while retaining the corresponding source records.
- If multiple records share a color, define a deterministic record-selection rule or expose another verified attribute if available. Do not arbitrarily discard records.

### Size
- Use `size` only when actual non-empty values exist in the current group.
- Do not show a size selector when no size values are available.

### Variant behavior
- Selecting an option must select a real record from the current group.
- Update the active record's price, sale price, availability, images, description, and other displayed attributes where applicable.
- Do not infer availability from color, image presence, or stock quantity.
- Do not invent a stock status mapping. Display the source availability value or a carefully designed neutral state when null, until valid business rules are confirmed.

## 9. PRODUCT IMAGE MAPPING AND GALLERY

### 9.1 Verified database observations

The audit found:
- `additional_image_link` is JSONB and all 44 records contain an array.
- 43 records have an empty array.
- One record has a non-empty array.
- That non-empty array belongs to product record `ditoopropink` in group `ditoopro`.
- The non-empty array contains URL strings; its first URL duplicates that record's `image_link`.
- Only 5 records have a non-empty `image_link`; 39 do not.

These are audit-time observations. Revalidate live data; do not hardcode these counts.

### 9.2 Gallery construction

For the selected variant:
1. Read `image_link` as the primary image when it is a valid non-empty URL.
2. Read `additional_image_link` only after validating that it is an array of strings.
3. Combine the primary image and additional image URLs.
4. Remove duplicate URLs while preserving their first-seen order.
5. Do not add images from another product group.
6. Do not fabricate, guess, or rewrite image URLs.
7. If no valid image exists, render a neutral placeholder with appropriate dimensions and accessible alternative text.
8. Do not hide a product solely because it has no image.

### 9.3 Variant image behavior

When the active variant changes, update the gallery using only that variant's image fields. Do not continue showing the previous variant's images unless the same URL is actually present in the newly selected record.

## 10. CATEGORY DATA RULES

The inspected schema has `product_type` and `google_product_category`, but no dedicated category table or verified category hierarchy.

Therefore:
- Do not invent category names, parent-child relationships, or a taxonomy.
- Inspect actual values before using either field as a storefront category source.
- Use a field for category navigation only if its actual values are sufficiently consistent and meaningful for that purpose.
- Do not assume `product_type` and `google_product_category` are interchangeable.
- If no reliable category source exists, keep the required category pages in a clear empty/coming-from-data state or report the exact limitation. Do not generate fabricated categories or product assignments.

## 11. APPLICATION ARCHITECTURE

Implement two layout types: AppShell and Standalone.

### 11.1 AppShell

Structural order:

```text
AppShell
├── Header
├── MainPage
│   └── CurrentPage
├── Footer
├── BottomComponent
│   ├── BottomNavigation OR
│   └── BottomActionBar
└── Overlays
    ├── Modal
    ├── Drawer
    ├── QuickView
    ├── BottomSheet
    └── Toast
```

Rules:
- Header exists once per AppShell.
- MainPage renders the active route page.
- Footer exists once per AppShell.
- BottomComponent exists once per AppShell.
- BottomNavigation and BottomActionBar are mutually exclusive.
- Select the bottom component from the active page route.
- BottomActionBar is mobile-only (320px–767px), remains in natural document flow, and is not rendered on tablet/desktop (768px and wider). Never use fixed, sticky, or absolute positioning for it.
- Overlays are managed independently from page content.
- Do not duplicate shared layout components inside individual pages.

### 11.2 Standalone

```text
Standalone
├── Header
├── MainPage
└── Footer
```

Standalone pages do not render AppShell BottomNavigation or BottomActionBar.

## 12. REQUIRED APPLICATION PAGES

Implement exactly these 18 pages unless the user explicitly approves a change.

### 12.1 AppShell — 14 pages

1. **HomePage**
   - Hero section and promotional presentation.
   - Featured products and new arrivals derived from live product data.
   - Category section only when valid category data is available.
   - Do not invent promotions, discounts, or product badges.

2. **ProductsPage**
   - Product groups, one ProductCard per `item_group_id`.
   - Search/filter/sort controls only where supported by actual data.
   - Product grid and loading, empty, and error states.

3. **ProductDetailPage**
   - Product information from the selected group.
   - Variant selector when multiple valid variants exist.
   - Product gallery using the selected record's image fields.
   - Price, sale price, availability, description, and specifications where available.
   - Quantity selector, add to cart, and add to wishlist.

4. **CategoriesPage**
   - Category listing only from a verified category source.
   - Do not fabricate categories.

5. **CategoryDetailPage**
   - Products filtered using the verified category mapping.
   - If no valid category mapping exists, explain the limitation through an appropriate empty/unavailable state.

6. **SearchPage**
   - Search input and results based on loaded live product data.
   - Empty search and no-results states.

7. **WishlistPage**
   - Saved products.
   - Remove from wishlist and move/add to cart.
   - Resolve saved product references against current live product data.

8. **CartPage**
   - Cart items, quantity controls, remove action, subtotal, and checkout navigation.
   - Cart lines must reference actual product records and selected variants.

9. **ProfilePage**
   - Guest customer information presentation.
   - No account creation, authentication, or password management.
   - Do not invent persisted customer profile data.

10. **OrdersPage**
    - Order history only when a real order source is connected.
    - Without backend persistence, show an explicitly labeled demonstration/empty state; do not fabricate historical orders.

11. **OrderDetailPage**
    - Display order details only from actual available order state/data.
    - Do not invent order identifiers, payment results, or shipping events.

12. **OrderTrackingPage**
    - Display tracking information only when a real tracking source exists.
    - Otherwise clearly state that live tracking is not connected.

13. **CheckoutPage**
    - Guest customer details, address form, order summary, validation, and total calculation.
    - Shipping price/business rules must not be invented.
    - If shipping rules are not configured, disclose the limitation and do not fabricate a final payable total.

14. **ContactPage**
    - Contact information and contact actions only from verified project configuration or supplied business information.
    - Do not invent phone numbers, addresses, or social links.

### 12.2 Standalone — 4 pages

15. **PaymentPage**
    - Payment summary and payment instructions only if a real payment integration or verified instructions exist.
    - Otherwise present a clearly labeled demo/unavailable state.

16. **PaymentReturnPage**
    - Handle the return route safely.
    - A browser redirect or query parameter alone is not proof of payment success.
    - Never mark payment as successful without trusted backend confirmation.

17. **OrderSuccessPage**
    - Show confirmed success only when supported by actual order/payment confirmation.
    - Otherwise show a neutral result/pending state with accurate wording.

18. **NotFoundPage**
    - Clear 404 presentation and navigation back to HomePage.

Do not implement LoginPage, RegisterPage, ForgotPasswordPage, or authentication guards.

## 13. BOTTOM COMPONENT ROUTING RULES

### BottomNavigation

Display on:
- HomePage
- ProductsPage
- CategoriesPage
- CategoryDetailPage
- WishlistPage
- ProfilePage
- OrdersPage

### BottomActionBar

Display on:
- ProductDetailPage
- SearchPage
- CartPage
- CheckoutPage
- OrderDetailPage
- OrderTrackingPage
- ContactPage

Rules:
- Only one bottom component may render at a time.
- Bottom component selection must follow the active route.
- Standalone pages render neither component.
- BottomActionBar renders only on mobile (320px–767px), remains in natural document flow, and must not be fixed, sticky, or absolute. It is hidden/unmounted at 768px and wider.

## 14. OVERLAYS

Create reusable:
- Modal
- Drawer
- QuickView
- BottomSheet
- Toast

Requirements:
- Consistent visual system.
- Accessible open/close controls and keyboard behavior where appropriate.
- Correct layering and focus behavior.
- Mobile-friendly interaction.
- Avoid duplicate overlay state or competing overlay instances.

## 15. FUNCTIONAL REQUIREMENTS

Implement and verify:
- Route navigation and browser history.
- Direct URL access and browser refresh.
- Product data loading through the centralized service.
- Product grouping by `item_group_id`.
- Product detail and variant selection.
- Search across actual available product fields.
- Filtering and sorting only by actual supported data.
- Product gallery and missing-image placeholder.
- Quantity selection.
- Add/remove/update cart items.
- Add/remove wishlist items.
- Cart subtotal calculation from actual selected product records.
- Checkout form validation.
- Order summary calculation.
- Modal, Drawer, BottomSheet, QuickView, and Toast interactions.
- Loading, empty, error, and not-found states.

Do not make a control appear functional if it has no real behavior. Disable or clearly label unavailable actions.

## 16. CART AND WISHLIST PERSISTENCE

Use localStorage for cart and wishlist only.

Rules:
- Persist stable product identifiers and selected variant identifiers, not a duplicate product catalog.
- Reconcile stored cart/wishlist references against the latest Edge Function product data.
- Handle removed or unavailable records without crashing.
- Do not silently replace an invalid saved variant with a different variant.
- Do not treat localStorage as a product database or trusted order database.
- Validate quantities and calculations.
- Do not assume a stock quantity field exists.

## 17. GUEST CHECKOUT, ORDERS, AND PAYMENTS

Guest checkout is mandatory; authentication is not.

Customer details are collected in CheckoutPage. Do not create authentication flows.

No verified order persistence, payment gateway, shipping API, or tracking integration is included in the current product-data scope. Therefore:
- Do not invent backend endpoints or database tables.
- Do not claim orders persist across devices or sessions.
- Do not claim payment has succeeded based on a client-side action.
- Do not invent shipping prices or delivery estimates.
- Keep demonstration behavior clearly labeled as a frontend demonstration.
- Separate frontend form validation from actual order creation.
- Keep payment and order pages structurally available while accurately communicating unavailable integrations.

## 18. DESIGN SYSTEM AND RESPONSIVE UI

Design direction:
- Minimalist
- Modern
- Premium
- Clean
- Professional
- Mobile-first

Create reusable design tokens for:
- Color
- Typography
- Spacing
- Border radius
- Shadows
- Layout widths
- Z-index/layering
- Interaction states
- Responsive breakpoints

### 18.1 Responsive viewport tiers

The application must work across mobile, tablet, and desktop. Use these implementation tiers consistently unless the existing project already has an established, compatible breakpoint system:

| Tier | Viewport width | Required behavior |
|---|---:|---|
| Small mobile | 320–359px | Compact layout; no horizontal page overflow; controls remain usable |
| Standard mobile | 360–767px | Primary mobile storefront experience |
| Tablet | 768–1023px | Tablet-optimized spacing, navigation, and content grid |
| Desktop | 1024px and wider | Full desktop layout with appropriate content width and desktop navigation |

Use mobile-first CSS and progressive enhancement. Breakpoints are layout rules, not fixed device assumptions. Test intermediate widths, not only the listed examples.

### 18.2 BottomActionBar is mobile-only

**BottomActionBar must render only on mobile viewports (320px–767px). It must never appear on tablet or desktop.**

- Keep BottomActionBar in natural document flow on mobile; do not use `position: fixed`, `position: sticky`, or `position: absolute`.
- At viewport widths of 768px and above, hide/unmount BottomActionBar and do not leave an empty reserved area, bottom padding, or layout gap for it.
- On tablet and desktop, the relevant page actions must remain accessible through the page's normal content or an appropriate desktop control. Do not simply make those actions unavailable when BottomActionBar is hidden.
- Preserve the existing route-to-BottomActionBar page mapping for mobile.
- Standalone pages must not render BottomActionBar at any viewport width.
- Do not replace BottomActionBar with BottomNavigation on desktop unless that behavior is explicitly specified elsewhere. The desktop navigation pattern should use the Header/page layout.
- Ensure viewport resizing across 767px/768px does not leave stale component state, duplicate controls, or inaccessible actions.

### 18.3 Layout and component adaptation

- Use fluid widths and a readable maximum content width on large screens; center the main content where appropriate.
- Avoid hardcoded page widths that cause overflow.
- Product grids should adapt progressively: one column only when necessary on narrow screens, typically two columns on standard mobile, and more columns as available width increases. Choose exact column counts based on card readability and available space.
- On tablet and desktop, use available horizontal space without stretching product cards or text excessively.
- Header, navigation, forms, product detail gallery, cart, checkout, footer, and overlays must each have intentional mobile, tablet, and desktop layouts.
- On narrow screens, stack multi-column content when needed; on wider screens, use columns where they improve scanability.
- Images must be responsive, preserve intended aspect ratios, and avoid layout shifts.
- Tables or dense product specifications must remain readable; use responsive stacking or a contained horizontal scroller only for the table region when necessary, never for the entire page.
- Prevent long product titles, URLs, and unbroken text from forcing horizontal overflow.
- Account for mobile browser safe areas only where controls genuinely approach device edges. Do not use safe-area padding to simulate a fixed bottom bar.
- Ensure page content remains reachable and is not obscured by navigation, overlays, or browser UI.

### 18.4 Mobile usability and accessibility

- Provide touch targets that are comfortably usable; aim for at least 44×44 CSS pixels for primary interactive controls.
- Do not rely on hover to expose essential actions.
- Keep text readable without requiring pinch zoom.
- Use visible focus states, semantic controls, accessible labels, and logical keyboard navigation.
- Check color contrast and error/help text visibility.
- Ensure dialogs, drawers, quick views, and BottomSheet fit within small viewports and can be dismissed accessibly.

### 18.5 Visual consistency

Use consistent typography, spacing, controls, buttons, form fields, product cards, and visual hierarchy.

Do not invent a brand identity, logo asset, or business contact details if none are provided. Use existing project assets and verified brand configuration where available.

## 19. REUSABLE COMPONENTS

Build reusable components as appropriate:
- AppShell
- StandaloneLayout
- Header
- Footer
- BottomNavigation
- BottomActionBar
- ProductCard
- ProductGrid
- ProductGallery
- ProductPrice
- ProductVariantSelector
- QuantitySelector
- SearchInput
- CategoryCard
- CartItem
- OrderCard
- OrderSummary
- CheckoutForm
- LoadingState
- EmptyState
- ErrorState
- ImagePlaceholder
- Modal
- Drawer
- QuickView
- BottomSheet
- Toast

Keep business logic out of presentation components where practical. Avoid duplicated product fetching and duplicated layout elements.

## 20. DATA AND STATE MANAGEMENT

Centralize state and services for:
- Product data and request status.
- Product groups and active variants.
- Cart.
- Wishlist.
- Current route/page context.
- Overlay state.
- Checkout form state.

The Edge Function is the only source of product data. Cart and wishlist may persist locally. Order/payment state must not be represented as backend-confirmed unless it actually is.

Use clear TypeScript types and runtime validation at external data boundaries. Handle unexpected response shapes safely.

## 21. ERROR AND EMPTY STATES

Implement clear states for:
- Product loading.
- Product request failure.
- Empty product response.
- Invalid Edge Function response.
- Missing product group.
- Product without image.
- Product without color or size.
- Empty search results.
- Empty cart.
- Empty wishlist.
- Invalid checkout fields.
- Missing category mapping.
- Unavailable order/payment/tracking integration.
- Invalid route.

Never silently use mock data as a fallback.

## 22. IMPLEMENTATION WORKFLOW

Follow this sequence. Do not skip inspection or verification.

### PHASE 1 — PROJECT INSPECTION
- Inspect the existing repository/project structure.
- Identify entry points, routes, components, styles, assets, package manager, and dependencies.
- Identify existing functionality that must be preserved.
- Inspect environment configuration without exposing secrets.
- Inspect the deployed `get-divoom-products` source and verify the runtime request/response contract.
- Record confirmed facts separately from assumptions and blockers.

### PHASE 1A — GEMINI CANVAS APP ENTRY POINT
- Inspect how the current Gemini Canvas project represents files and selects its React entry point.
- Create or update `App.jsx` as the mandatory primary application component.
- Connect the active project bootstrap to render `App.jsx`; preserve the existing Vite/React setup where possible.
- Decide whether supporting files can be created based on the actual Canvas project capabilities. If not, keep the implementation in `App.jsx`.
- Confirm that the initial `App.jsx` renders in the Gemini Canvas preview before proceeding with the full page implementation.

### PHASE 2 — REQUIREMENTS AND ARCHITECTURE
- Confirm the 18-page route map.
- Implement AppShell and Standalone layouts.
- Implement BottomComponent route selection.
- Define product service, product grouping, and state architecture.
- Define category behavior based on verified data only.

### PHASE 3 — DESIGN SYSTEM
- Inspect existing assets and styles.
- Define design tokens and reusable component styles.
- Implement responsive behavior and accessibility foundations.

### PHASE 4 — PRODUCT DATA INTEGRATION
- Implement the centralized Edge Function service.
- Validate the actual runtime response.
- Validate fields and JSON types.
- Group records by `item_group_id`.
- Implement representative ProductCard data and variant mapping.
- Implement image gallery deduplication and placeholders.
- Verify loading, empty, and error states.

### PHASE 5 — PAGE IMPLEMENTATION
- Implement all 18 required pages.
- Reuse shared layouts and components.
- Connect every product-facing page to shared live product data.
- Keep unavailable backend-dependent features clearly bounded.

### PHASE 6 — INTERACTIONS
- Implement routing, search, filters, sorting, variants, cart, wishlist, and checkout validation.
- Implement overlays and notifications.
- Implement localStorage persistence for cart and wishlist only.

### PHASE 7 — VERIFICATION
- Run available type checks, lint, build, and tests.
- Verify all 18 routes.
- Verify direct URL access and browser refresh.
- Verify Edge Function request and response at runtime.
- Verify grouping and variant selection against live records.
- Verify gallery URL validation and deduplication.
- Verify missing-image behavior.
- Verify cart and wishlist persistence and reconciliation.
- Verify responsive behavior at representative mobile, tablet, and desktop widths, including the 767px/768px BottomActionBar boundary and no horizontal overflow.
- Verify no fake payment/order/tracking success.
- Report any unverified behavior or remaining blockers.

Do not claim a check passed unless it was actually run and its result inspected.

## 23. ACCEPTANCE CRITERIA

The application is complete only when all applicable criteria below are verified:

1. A working `App.jsx` file exists in the Gemini Canvas project and is the primary application component.
2. The active Gemini Canvas application/preview renders through `App.jsx`; the file is not merely present but disconnected.
3. Supporting files, if created, are correctly imported and integrated; no required component or service is left disconnected.
4. All 18 specified pages exist and route correctly.
5. AppShell and Standalone layouts follow the defined structure.
6. Footer appears once per layout, not duplicated inside pages.
7. BottomNavigation and BottomActionBar follow the exact route rules and are mutually exclusive on mobile.
8. BottomActionBar appears only at 320px–767px; it is not rendered at 768px and wider.
9. Hiding BottomActionBar on tablet/desktop leaves no empty reserved area, and the relevant actions remain accessible through page content or desktop controls.
10. BottomActionBar is in natural document flow and is never fixed, sticky, or absolute.
11. All product data originates exclusively from `get-divoom-products`.
12. No frontend direct query to `divoom_products` exists.
13. No mock, hardcoded, or fallback product records exist.
14. ProductCard displays one group per `item_group_id`.
15. ProductDetailPage loads records for the correct `item_group_id`.
16. Variant selection uses actual records and updates the active record correctly.
17. Null color/size values do not create fabricated options.
18. Product images use only validated URLs from the selected record.
19. Duplicate gallery URLs are removed.
20. Products without images display a neutral placeholder and remain visible.
21. Cart and wishlist work and persist through localStorage.
22. Guest checkout does not require authentication.
23. No unsupported order, payment, shipping, or tracking capability is claimed.
24. Loading, empty, error, and not-found states are implemented.
25. Direct URL navigation and refresh work where supported by the Canvas runtime/router.
26. Responsive layouts work on mobile, tablet, and desktop, including narrow widths and intermediate viewport sizes.
27. No horizontal page overflow occurs at tested viewport widths.
28. BottomActionBar is visible on mobile widths from 320px through 767px and absent at 768px and wider.
29. BottomActionBar actions remain accessible on tablet/desktop through normal page controls, without a blank reserved bottom area.
30. Available type checks, lint, build, tests, and/or Canvas preview checks pass, or failures are documented accurately.
31. No critical runtime errors remain in the verified test flows.

Do not mark a criterion as verified unless the relevant file, rendered preview, or test result was actually inspected. If Gemini Canvas does not expose a particular verification mechanism, mark that criterion Not verified and explain why.
 
## 24. FINAL DELIVERY REPORT

At completion, provide a concise but evidence-based report containing:

- Gemini Canvas project structure and active entry point inspected.
- `App.jsx` file path and implementation status.
- Confirmation whether the active Gemini Canvas preview renders through `App.jsx`.
- Supporting files created and how they are integrated into `App.jsx`.
- Application rendering/compile status and the exact verification method used.
- Project structure inspected.
- Architecture and routes implemented.
- List of the 18 pages and their implementation status.
- Reusable components created or reused.
- Edge Function integration details and runtime verification status.
- Product grouping and variant mapping behavior.
- Product image mapping and missing-image handling.
- Cart and wishlist behavior.
- Guest checkout behavior and explicit integration limitations.
- Type check, lint, build, and test results.
- Route and responsive verification results.
- Remaining blockers and unverified items.

Use these evidence labels:
- **Verified:** directly inspected or successfully tested.
- **Indication:** suggested by source or partial evidence but not fully tested.
- **Not verified:** unavailable or not tested.

Do not report the application as fully complete if critical acceptance criteria remain unverified or fail.

## 26. FINAL EXECUTION INSTRUCTION

Create and maintain the working application directly in the existing Gemini Canvas project, with `App.jsx` as the mandatory primary application component and rendered application entry. Prioritize correctness, maintainability, consistent architecture, accurate product mapping, and honest verification.

Preserve existing working functionality. Do not modify Supabase schema or Edge Functions. Do not fabricate product data or unsupported backend behavior.

When blocked, state the exact missing information, the affected requirement, and the safest next step. Continue with independent requirements that can be implemented safely without inventing data or behavior.

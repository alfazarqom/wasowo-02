# MASTER PROMPT V1.0 — COMPLETE E-COMMERCE STOREFRONT APPLICATION

## ROLE

Act as a Senior Frontend Engineer, UI/UX Designer, Software Architect, and Application Developer.

Your task is to design and build a complete, functional, modern E-Commerce Storefront Application using Gemini Canvas.

Do not produce only a mockup, wireframe, or static UI. Build a working application with functional navigation, reusable components, interactive elements, and consistent application architecture.

## 1. APPLICATION OBJECTIVE

Build a complete single-store E-Commerce Storefront.

The application must support the customer journey:

Home → Browse Products → Product Detail → Wishlist / Cart → Checkout → Payment → Order Confirmation → Order Tracking.

Authentication is not required.

The application must support Guest Checkout.

## 2. TECHNOLOGY

Use:
- React
- Vite
- TypeScript
- Modern CSS
- React Router for page navigation
- Reusable React components
- Supabase Edge Function for product retrieval

Follow the existing project structure if a project is already provided. Do not unnecessarily replace or restructure working project files.

## 3. PRODUCT DATA SOURCE — STRICT REQUIREMENT

The ONLY source of product data is the Supabase Edge Function:

`get-divoom-products`

Requirements:

1. Retrieve all product information through this Edge Function.
2. Never query `divoom_products` directly from the frontend.
3. Never use Supabase Database Client to retrieve products.
4. Never create mock, sample, or hardcoded product records.
5. Never create a local fallback product dataset.
6. Use the actual Edge Function response contract.
7. Verify request parameters and response fields before implementation.
8. Handle loading, success, empty, and error states.
9. Do not invent product properties or response structures.
10. Reuse the retrieved product data throughout the application.

Create a centralized product service to handle requests to `get-divoom-products`.

All product-related components and pages must consume data through the centralized service or shared product state.

Configuration:

- Supabase project URL: use existing project configuration.
- Supabase Edge Function endpoint: `/functions/v1/get-divoom-products`.
- Authentication headers: follow the actual deployed function requirements.
- Do not expose service-role keys or privileged credentials in frontend code.

If the existing function contract cannot be verified, stop product integration and report the missing information. Do not fabricate an API contract.

## 4. APPLICATION ARCHITECTURE

Implement two primary layouts.

### A. AppShell

AppShell must contain:

- Header
- MainPage / CurrentPage
- Footer
- BottomComponent
- Overlays

Structure:

AppShell
- Header
- MainPage
  - CurrentPage
- Footer
- BottomComponent
  - BottomNavigation OR BottomActionBar
- Overlays
  - Modal
  - Drawer
  - QuickView
  - BottomSheet
  - Toast

Rules:

- Header exists once per AppShell.
- Footer exists once per AppShell.
- BottomComponent exists once per AppShell.
- BottomNavigation and BottomActionBar are mutually exclusive.
- BottomActionBar must follow natural document flow, not fixed or absolute positioning.
- Overlays must be managed independently of page content.

### B. Standalone

Standalone pages use a separate layout from AppShell.

Standalone
- Header
- MainPage
- Footer

Do not duplicate layout components inside individual pages.

## 5. APP PAGES

### A. AppShell Pages

Implement these 14 pages:

1. HomePage
   - Hero section
   - Promotional banners
   - Featured products
   - New arrivals
   - Product categories
   - Product recommendations

2. ProductsPage
   - Product listing
   - Product grid
   - Sorting
   - Filtering
   - Product cards

3. ProductDetailPage
   - Product gallery
   - Product name
   - Price
   - Description
   - Product specifications
   - Color variants
   - Size variants when available
   - Quantity selector
   - Add to cart
   - Add to wishlist

4. CategoriesPage
   - Category listing
   - Category navigation

5. CategoryDetailPage
   - Category information
   - Products belonging to selected category

6. SearchPage
   - Search input
   - Search results
   - Empty search state

7. WishlistPage
   - Saved products
   - Remove from wishlist
   - Move to cart

8. CartPage
   - Cart items
   - Quantity management
   - Remove items
   - Subtotal
   - Checkout navigation

9. ProfilePage
   - Guest customer information
   - Customer details
   - Contact information

10. OrdersPage
    - Order history interface
    - Order status
    - Order navigation

11. OrderDetailPage
    - Order information
    - Purchased items
    - Payment information
    - Shipping information

12. OrderTrackingPage
    - Order tracking information
    - Order status timeline

13. CheckoutPage
    - Customer information
    - Shipping address
    - Order summary
    - Shipping cost
    - Total payment
    - Checkout validation

14. ContactPage
    - Store contact information
    - Contact options

### B. Standalone Pages

Implement these 4 pages:

15. PaymentPage
    - Payment summary
    - Payment method presentation
    - Payment instructions
    - Payment status

16. PaymentReturnPage
    - Payment return handling
    - Payment status presentation

17. OrderSuccessPage
    - Order confirmation
    - Order summary
    - Order tracking navigation

18. NotFoundPage
    - 404 message
    - Return to homepage

Do not implement LoginPage, RegisterPage, or ForgotPasswordPage.

## 6. BOTTOM COMPONENT RULES

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

- Display only one bottom component at a time.
- Select the component based on the active page.
- Do not render both simultaneously.
- Do not use fixed or absolute positioning for BottomActionBar.

Standalone pages do not display AppShell bottom components.

## 7. OVERLAYS

Create reusable overlay components:

- Modal
- Drawer
- QuickView
- BottomSheet
- Toast

Requirements:

- Reusable across pages.
- Consistent visual design.
- Proper open and close behavior.
- Appropriate mobile interaction.
- Avoid unnecessary overlay duplication.

## 8. FUNCTIONAL REQUIREMENTS

All major UI controls must work.

Implement:

- Page navigation
- Product search
- Product filtering
- Product sorting
- Product detail navigation
- Variant selection
- Quantity selection
- Add to cart
- Remove from cart
- Update cart quantity
- Add to wishlist
- Remove from wishlist
- Cart subtotal calculation
- Checkout form validation
- Order summary calculation
- Toast notifications
- Modal and Drawer interactions
- Browser refresh and direct URL navigation

Use localStorage for cart and wishlist persistence.

Do not create fake product data to make interactions work.

## 9. GUEST CHECKOUT

The application must not require customer authentication.

Customer information is collected during checkout.

Do not implement:
- Login
- Registration
- Password management
- Authentication guards

Guest users must be able to browse products, add products to their cart, and proceed to checkout.

## 10. DESIGN SYSTEM

Create a consistent modern storefront design.

Design direction:
- Minimalist
- Modern
- Premium
- Clean
- Professional
- Mobile-first

Use:
- Consistent typography
- Consistent spacing scale
- Consistent border radius
- Reusable buttons
- Reusable input fields
- Reusable product cards
- Consistent colors
- Clear visual hierarchy

Responsive requirements:
- Mobile-first design
- Support mobile, tablet, and desktop
- Maintain consistent layouts
- Avoid horizontal overflow

## 11. REUSABLE COMPONENTS

Create reusable components, including:

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
- Modal
- Drawer
- QuickView
- BottomSheet
- Toast

Avoid unnecessary duplication.

## 12. DATA AND STATE MANAGEMENT

Use centralized state management for:

- Product data
- Cart
- Wishlist
- Active page context
- UI overlays
- Checkout state

Product data must always originate from `get-divoom-products`.

Cart and wishlist may use localStorage.

Do not treat localStorage as a product database.

Do not invent an order persistence backend, payment gateway, or shipping API.

If no real order/payment integration is available, implement an explicitly identified frontend demonstration flow. Never report a real payment or order as completed without backend confirmation.

## 13. ERROR HANDLING

Provide appropriate states for:

- Product loading
- Product loading failure
- No products available
- No search results
- Empty cart
- Empty wishlist
- Invalid checkout input
- Missing product
- Invalid route

Never silently substitute mock data when the Edge Function fails.

## 14. IMPLEMENTATION WORKFLOW

Follow this sequence:

PHASE 1 — PROJECT INSPECTION
- Inspect the existing project.
- Understand its structure.
- Identify installed dependencies.
- Identify existing routing and components.
- Verify Edge Function configuration and contract.

PHASE 2 — ARCHITECTURE
- Establish AppShell.
- Establish Standalone.
- Establish page routing.
- Establish BottomComponent selection.
- Establish reusable components.

PHASE 3 — DESIGN SYSTEM
- Define design tokens.
- Establish typography.
- Establish colors.
- Establish spacing.
- Establish component styles.

PHASE 4 — DATA INTEGRATION
- Implement get-divoom-products service.
- Verify actual response structure.
- Implement centralized product state.
- Implement loading, empty, and error states.

PHASE 5 — PAGE IMPLEMENTATION
- Build all 18 pages.
- Implement reusable components.
- Implement responsive layouts.

PHASE 6 — FUNCTIONAL IMPLEMENTATION
- Implement navigation.
- Implement cart.
- Implement wishlist.
- Implement search and filtering.
- Implement checkout interactions.
- Implement overlay interactions.

PHASE 7 — VERIFICATION
- Verify all routes.
- Verify all page layouts.
- Verify product data retrieval.
- Verify cart and wishlist.
- Verify responsive behavior.
- Verify error handling.
- Verify browser refresh and direct URL access.

## 15. ACCEPTANCE CRITERIA

The application is considered complete when:

1. All 18 pages are implemented.
2. AppShell and Standalone layouts work correctly.
3. BottomNavigation and BottomActionBar follow the specified rules.
4. All product data comes exclusively from `get-divoom-products`.
5. No mock or hardcoded product records exist.
6. Cart and wishlist work correctly.
7. Guest Checkout works.
8. Major UI interactions function correctly.
9. All routes support direct navigation and refresh.
10. Loading, empty, and error states are implemented.
11. The application is responsive.
12. No real payment success is fabricated.
13. No critical runtime errors remain.

## 16. FINAL INSTRUCTIONS

Build the application, not just its documentation.

Work systematically and preserve existing working functionality.

Do not invent API contracts, product fields, backend capabilities, or business rules.

If a requirement cannot be implemented because information is missing, report the exact blocker.

At completion, provide:
- Implemented application structure
- List of all implemented pages
- Reusable component list
- Product integration details
- Functional feature checklist
- Verification results
- Remaining limitations

Your priority is a complete, consistent, functional, and maintainable E-Commerce Storefront Application.

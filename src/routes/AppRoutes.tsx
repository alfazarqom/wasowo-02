import React, { useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { StandaloneLayout } from '../components/layout/StandaloneLayout';
import { StandalonePage } from '../components/layout/StandalonePage';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CategoryDetailPage } from '../pages/CategoryDetailPage';
import { SearchPage } from '../pages/SearchPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ProfilePage } from '../pages/ProfilePage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';
import { PaymentPage } from '../pages/PaymentPage';
import { PaymentReturnPage } from '../pages/PaymentReturnPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Information & Legal Pages
import { TermsAndConditionsPage } from '../pages/legal/TermsAndConditionsPage';
import { PrivacyPolicyPage } from '../pages/legal/PrivacyPolicyPage';
import { ShippingPolicyPage } from '../pages/legal/ShippingPolicyPage';
import { PaymentPolicyPage } from '../pages/legal/PaymentPolicyPage';
import { ReturnAndRefundPolicyPage } from '../pages/legal/ReturnAndRefundPolicyPage';
import { CancellationPolicyPage } from '../pages/legal/CancellationPolicyPage';
import { WarrantyPolicyPage } from '../pages/legal/WarrantyPolicyPage';
import { FAQPage } from '../pages/legal/FAQPage';
import { ContactUsPage } from '../pages/legal/ContactUsPage';
import { AboutUsPage } from '../pages/legal/AboutUsPage';

function LegacyQueryHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.has('payment_return')) {
      navigate(`/payment-return?${searchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}

export function AppRoutes() {
  return (
    <>
      <LegacyQueryHandler />
      <Routes>
        {/* Main Storefront Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:groupId" element={<ProductDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryName" element={<CategoryDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/tracking" element={<OrderTrackingPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
        </Route>

        {/* Information & Legal Pages (StandalonePage Architecture) */}
        <Route element={<StandalonePage />}>
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/payment-policy" element={<PaymentPolicyPage />} />
          <Route path="/return-refund-policy" element={<ReturnAndRefundPolicyPage />} />
          <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
          <Route path="/warranty-policy" element={<WarrantyPolicyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
        </Route>

        {/* Standalone Minimal Transactional Routes */}
        <Route element={<StandaloneLayout />}>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/:merchantOrderId" element={<PaymentPage />} />
          <Route path="/payment-return" element={<PaymentReturnPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import HeroSection from "./components/common/HeroSection";
import TrustRibbon from "./components/common/TrustRibbon";
import CollectionsSection from "./components/common/CollectionsSection";
import FeaturedProducts from "./components/product/FeaturedProducts";
import ReviewsSection from "./components/common/ReviewsSection";
import AboutSection from "./components/common/AboutSection";
import Footer from "./components/footer/Footer";

import Collections from "./pages/Collections/Collections";
import About from "./pages/About/About";
import Help from "./pages/Help/Help";
import CustomerAuth from "./pages/CustomerAuth/CustomerAuth";
import CustomerAccount from "./pages/CustomerAccount/CustomerAccount";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Cart from "./pages/Cart/Cart";
import LegalPolicies from "./pages/Legal/LegalPolicies";

import CartProvider from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import CurrencyFloatingWidget from "./components/common/CurrencyFloatingWidget";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustRibbon />
        <CollectionsSection />
        <FeaturedProducts />
        <AboutSection />
        <ReviewsSection />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <CurrencyProvider>
            <CurrencyFloatingWidget />
            <div className="app">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collection" element={<Navigate to="/collections" replace />} />
                <Route path="/products" element={<Navigate to="/collections" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                <Route path="/login" element={<CustomerAuth />} />
                <Route path="/account" element={<CustomerAccount />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/policies" element={<LegalPolicies />} />
                <Route path="/refund-policy" element={<LegalPolicies initialTab="refund" />} />
                <Route path="/shipping-policy" element={<LegalPolicies initialTab="shipping" />} />
                <Route path="/terms-and-conditions" element={<LegalPolicies initialTab="terms" />} />
                <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
                <Route path="/privacy-policy" element={<LegalPolicies initialTab="privacy" />} />
                <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                <Route path="/contact-us" element={<Navigate to="/about" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </CurrencyProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
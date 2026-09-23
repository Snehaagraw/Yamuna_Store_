import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import HeroSection from "./components/common/HeroSection";
import CollectionsSection from "./components/common/CollectionsSection";
import FeaturedProducts from "./components/product/FeaturedProducts";
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

import CartProvider from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

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
        <CollectionsSection />
        <FeaturedProducts />
        <AboutSection />
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
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/login" element={<CustomerAuth />} />
              <Route path="/account" element={<CustomerAccount />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
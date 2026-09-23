import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";

import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

import "../../styles/cart.css";

function Cart() {
  const navigate = useNavigate();
  const { isCustomerLoggedIn } = useAuth();

  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const handleDecrease = (item) => {
    decreaseQuantity(item.product.id);
  };

  const handleIncrease = (item) => {
    increaseQuantity(item.product.id);
  };

  const handleRemove = (item) => {
    removeFromCart(item.product.id);
  };

  const handleCheckout = () => {
    if (isCustomerLoggedIn) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=/checkout");
    }
  };

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <section className="cart-container">
          <div className="cart-page-header">
            <span className="cart-page-eyebrow">
              YOUR SELECTION
            </span>

            <h1>Your Cart</h1>

            <p>
              Review your chosen pieces before continuing
              to checkout.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-symbol">य</div>

              <h2>Your cart is empty</h2>

              <p>
                Discover devotional clothing inspired by
                Vrindavan.
              </p>

              <button
                type="button"
                className="cart-continue-button"
                onClick={() => navigate("/collections")}
              >
                Explore Collection →
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {cartItems.map((item) => {
                  const cartItem = {
                    product: item,
                    quantity: item.quantity,
                  };

                  return (
                    <CartItem
                      key={item.id}
                      item={cartItem}
                      onDecrease={handleDecrease}
                      onIncrease={handleIncrease}
                      onRemove={handleRemove}
                    />
                  );
                })}
              </div>

              <CartSummary
                subtotal={cartTotal}
                onCheckout={handleCheckout}
              />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Cart;
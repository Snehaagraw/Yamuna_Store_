import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "yamuna_store_cart";

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(
        CART_STORAGE_KEY
      );

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    } catch (error) {
      console.error(
        "Unable to load cart:",
        error
      );

      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Unable to save cart:",
        error
      );
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize = "", quantityToAdd = 1) => {
    let maxStock = 99;
    if (
      product.size_inventory &&
      selectedSize &&
      product.size_inventory[selectedSize] !== undefined
    ) {
      maxStock = Number(product.size_inventory[selectedSize]);
    } else if (
      product.size_inventory &&
      !selectedSize &&
      Object.keys(product.size_inventory).length > 0
    ) {
      const vals = Object.values(product.size_inventory);
      if (vals.length > 0) maxStock = Number(vals[0]);
    }

    if (maxStock <= 0) {
      return false;
    }

    const qty = Math.max(1, Number(quantityToAdd) || 1);

    const itemPrice =
      product.size_prices &&
      selectedSize &&
      product.size_prices[selectedSize] !== undefined &&
      product.size_prices[selectedSize] !== "" &&
      !isNaN(Number(product.size_prices[selectedSize]))
        ? Number(product.size_prices[selectedSize])
        : Number(product.price);

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) =>
          item.id === product.id &&
          (item.size || "") === (selectedSize || "")
      );

      if (existingItem) {
        if (existingItem.quantity >= maxStock) {
          return previousItems;
        }

        return previousItems.map((item) =>
          item.id === product.id &&
          (item.size || "") === (selectedSize || "")
            ? {
                ...item,
                price: itemPrice,
                maxStock,
                quantity: Math.min(maxStock, item.quantity + qty),
              }
            : item
        );
      }

      return [
        ...previousItems,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          size: selectedSize || "",
          price: itemPrice,
          fabric: product.fabric,
          weight: product.weight || "",
          image:
            product.images?.[0]?.image || null,
          quantity: Math.min(maxStock, qty),
          maxStock,
        },
      ];
    });

    return true;
  };

  const removeFromCart = (productId, size = null) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) =>
          !(
            item.id === productId &&
            (size === null || (item.size || "") === (size || ""))
          )
      )
    );
  };

  const increaseQuantity = (productId, size = null) => {
    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (
          item.id === productId &&
          (size === null || (item.size || "") === (size || ""))
        ) {
          const maxAllowed =
            item.maxStock !== undefined ? item.maxStock : 99;

          if (item.quantity >= maxAllowed) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (productId, size = null) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === productId &&
          (size === null || (item.size || "") === (size || ""))
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

export default CartProvider;
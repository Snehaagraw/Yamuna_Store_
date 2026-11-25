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

  const addToCart = (
    product,
    selectedSize = "",
    quantityToAdd = 1,
    selectedColor = "",
    selectedImage = null
  ) => {
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

    const rawPrice =
      product.size_prices &&
      selectedSize &&
      product.size_prices[selectedSize] !== undefined &&
      product.size_prices[selectedSize] !== "" &&
      !isNaN(Number(product.size_prices[selectedSize]))
        ? Number(product.size_prices[selectedSize])
        : Number(product.price);

    const disc = Number(product.discount_percent) || 0;
    const orig = product.original_price ? Number(product.original_price) : null;
    let itemPrice = rawPrice;
    if (disc > 0 && orig && itemPrice >= orig) {
      itemPrice = Math.round(orig * (1 - disc / 100));
    }

    const normColor = selectedColor ? selectedColor.trim() : "";
    const normSize = selectedSize ? selectedSize.trim() : "";

    // Pick the most accurate image for this color
    let chosenImage = selectedImage;
    if (!chosenImage && normColor && product.images?.length > 0) {
      const matchedImg = product.images.find(
        (img) => img.color && img.color.toLowerCase() === normColor.toLowerCase()
      );
      if (matchedImg) chosenImage = matchedImg.image;
    }
    if (!chosenImage) {
      chosenImage = product.images?.[0]?.image || null;
    }

    const effectiveWeight =
      product.size_weights && normSize && product.size_weights[normSize]
        ? product.size_weights[normSize]
        : product.weight || "";

    setCartItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) =>
          item.id === product.id &&
          (item.size || "") === normSize &&
          (item.color || "") === normColor
      );

      if (existingItem) {
        if (existingItem.quantity >= maxStock) {
          return previousItems;
        }

        return previousItems.map((item) =>
          item.id === product.id &&
          (item.size || "") === normSize &&
          (item.color || "") === normColor
            ? {
                ...item,
                price: itemPrice,
                weight: effectiveWeight || item.weight || "",
                image: chosenImage || item.image,
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
          size: normSize,
          color: normColor,
          price: itemPrice,
          fabric: product.fabric,
          weight: effectiveWeight,
          image: chosenImage,
          quantity: Math.min(maxStock, qty),
          maxStock,
        },
      ];
    });

    return true;
  };

  const removeFromCart = (productId, size = null, color = null) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) =>
          !(
            item.id === productId &&
            (size === null || (item.size || "") === (size || "")) &&
            (color === null || (item.color || "") === (color || ""))
          )
      )
    );
  };

  const increaseQuantity = (productId, size = null, color = null) => {
    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (
          item.id === productId &&
          (size === null || (item.size || "") === (size || "")) &&
          (color === null || (item.color || "") === (color || ""))
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

  const decreaseQuantity = (productId, size = null, color = null) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) =>
          item.id === productId &&
          (size === null || (item.size || "") === (size || "")) &&
          (color === null || (item.color || "") === (color || ""))
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
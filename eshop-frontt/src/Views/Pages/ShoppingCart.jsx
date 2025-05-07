import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/ShoppingCart.css";

const ShoppingCartPage = () => {
  const { refreshAccessToken } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Track loading state for cart data
  const [imagesLoaded, setImagesLoaded] = useState(false); // Track image loading state
  const navigate = useNavigate();

  // Fetch product details (including image) for each item
  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`https://localhost:5050/products/${productId}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      const data = await response.json();
      return data.product;
    } catch (err) {
      console.error("Error fetching product details:", err);
      return null;
    }
  };

  // Fetch the shopping cart data
  const getCart = async () => {
    try {
      const username = localStorage.getItem("username");
      let token = localStorage.getItem("token");

      if (!username || !token) {
        throw new Error("User is not logged in or token is missing.");
      }

     let response = await fetch(`https://localhost:5050/basket/${username}`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

if (response.status === 401) {
  console.log("Token expired, attempting to refresh...");
  token = await refreshAccessToken(); // <<< MERR TOKENIN E RI
  if (!token) {
    navigate("/login");
    return;
  }

  response = await fetch(`https://localhost:5050/basket/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`, // <<< PËRDOR TOKENIN E RI
      "Content-Type": "application/json",
    },
  });
}


      if (response.status === 404) {
        setCart({ items: [] });
        setError("");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch cart.");
      }

      const data = await response.json();
      setCart({ items: data.shoppingCart.items });
      setError("");
      setIsLoading(false);

      // Load images for products asynchronously without blocking UI
      loadProductImages(data.shoppingCart.items);
    } catch (err) {
      console.error("Error fetching shopping cart:", err);
      setError(err.message || "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  // Load images for products asynchronously
  const loadProductImages = async (items) => {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const product = await fetchProductDetails(item.productId);
        return {
          ...item,
          imageUrl: product ? product.imageUrl : null,
        };
      })
    );

    setCart((prevCart) => ({
      items: updatedItems,
    }));

    setImagesLoaded(true); // All images are loaded
  };

  // Remove item from the cart
  const removeItemFromCart = async (productId) => {
    try {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");

      if (!username || !token) {
        throw new Error("User is not logged in or token is missing.");
      }

      const response = await fetch(
        `https://localhost:5050/basket/${username}/items/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      getCart(); // Refresh cart after removal
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError(error.message || "An unknown error occurred.");
    }
  };

  useEffect(() => {
    getCart(); // Fetch cart on component mount
  }, []);

  return (
    <div className="shopping-cart-container">
      <h1>Your Shopping Cart</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {isLoading ? (
        <div>Loading your cart...</div> // Show loading state until cart is ready
      ) : cart.items.length === 0 ? (
        <div>
          <p>Your shopping cart is empty.</p>
          <button onClick={() => navigate("/shop")}>Go to Shop</button>
        </div>
      ) : (
        <ul>
          {cart.items.map((item, idx) => (
            <li key={idx} className="cart-item">
              <div className="cart-item-image-container">
                {/* Show placeholder if image is not loaded */}
                {!item.imageUrl || !imagesLoaded ? (
                  <div className="image-placeholder">Loading Image...</div>
                ) : (
                  <img
                    src={`https://localhost:5050${item.imageUrl}`}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                )}
              </div>

              <div className="cart-item-details">
                <p>
                  <strong>{item.productName}</strong>
                </p>
                <p>Price: €{item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Color: {item.color}</p>
              </div>

              <div className="remove-button-container">
                <button onClick={() => removeItemFromCart(item.productId)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShoppingCartPage;

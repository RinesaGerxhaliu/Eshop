import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../../Styles/ShoppingCart.css";
import { useCurrency } from "../../contexts/CurrencyContext";

const ShoppingCartPage = () => {
  const { refreshAccessToken } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { convert, format } = useCurrency();

  const handleProcessOrder = () => {
    navigate("/order");
  };
  const fetchProductDetails = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://localhost:5050/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Product not found");
      const data = await response.json();
      return data.product;
    } catch (err) {
      console.error("Error fetching product details:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadCartWithDetails = async () => {
      try {
        setIsLoading(true);
        setError("");
        const username = localStorage.getItem("username");
        let token = localStorage.getItem("token");
        if (!username || !token) throw new Error("Not logged in.");

        let response = await fetch(
          `https://localhost:5050/basket/${username}`,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        if (response.status === 401) {
          token = await refreshAccessToken();
          if (!token) return navigate("/login");
          response = await fetch(
            `https://localhost:5050/basket/${username}`,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );
        }

        const data = await response.json();
        const rawItems = data?.shoppingCart?.items;

        if (!Array.isArray(rawItems) || rawItems.length === 0) {
          setCart({ items: [] });
          setIsLoading(false);
          return;
        }


        const productsDetails = await Promise.all(
          rawItems.map((item) => fetchProductDetails(item.productId))
        );

        const enrichedItems = rawItems.map((item, idx) => ({
          ...item,
          imageUrl: productsDetails[idx]?.imageUrl || null,
          productName: productsDetails[idx]?.name || item.productId,
        }));

        setCart({ items: enrichedItems });
      } catch (err) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadCartWithDetails();
  }, [refreshAccessToken, navigate]);

  const removeItemFromCart = async (productId) => {
    try {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      if (!username || !token) throw new Error("Not logged in.");

      const response = await fetch(
        `https://localhost:5050/basket/${username}/items/${productId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error("Failed to remove item.");

      setCart((prev) => ({
        items: prev.items.filter((i) => i.productId !== productId),
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error");
    }
  };

  return (
    <div className="shopping-cart-container">
      <h1>Your Shopping Cart</h1>
      {error && <p className="error-text">{error}</p>}

      {isLoading ? (
        <div>Loading your cart...</div>
      ) : cart.items.length === 0 ? (
        <div className="empty-state">
          <p>Your shopping cart is empty.</p>
          <button onClick={() => navigate("/shop")}>Go to Shop</button>
        </div>
      ) : (
        <>
          <ul>
            {cart.items.map((item) => (
              <li key={item.productId} className="cart-item">
                <div className="cart-item-image-container">
                  {item.imageUrl ? (
                    <Link to={`/products/${item.productId}`}>
                      <img
                        src={`https://localhost:5050${item.imageUrl}`}
                        alt={item.productName}
                        className="cart-item-image"
                      />
                    </Link>
                  ) : (
                    <div className="image-placeholder">No image</div>
                  )}
                </div>

                <div className="cart-item-details">
                  <p>
                    <Link
                      to={`/products/${item.productId}`}
                      className="product-link"
                    >
                      <strong>{item.productName}</strong>
                    </Link>
                  </p>
                  <p>Price: {format(convert(item.price))}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>

                <div className="remove-button-container">
                  <button
                    onClick={() => removeItemFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="process-order-container">
            <button
              className="process-order-button"
              onClick={handleProcessOrder}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCartPage;

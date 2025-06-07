import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
      const response = await fetch(`https://localhost:5050/products/${productId}`);
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

        if (!username || !token) throw new Error("User is not logged in or token is missing.");

        let response = await fetch(`https://localhost:5050/basket/${username}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        if (response.status === 401) {
          token = await refreshAccessToken();
          if (!token) return navigate("/login");

          response = await fetch(`https://localhost:5050/basket/${username}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
        }

        if (response.status === 404) {
          setCart({ items: [] });
          setIsLoading(false);
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch cart.");

        const data = await response.json();
        const rawItems = data.shoppingCart.items;

        // Merret detajet e produkteve PARA se të shfaqë listën
        const productsDetails = await Promise.all(
          rawItems.map((item) => fetchProductDetails(item.productId))
        );

        // Bashkon detajet e produkteve me artikujt e shportës
        const enrichedItems = rawItems.map((item, index) => ({
          ...item,
          imageUrl: productsDetails[index]?.imageUrl || null,
          productName: productsDetails[index]?.name || item.productId,
        }));

        setCart({ items: enrichedItems });
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching shopping cart:", err);
        setError(err.message || "An unknown error occurred.");
        setIsLoading(false);
      }
    };

    loadCartWithDetails();
  }, [refreshAccessToken, navigate]);

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

      // Rifresko shportën pas fshirjes
      // thjesht e thërret përsëri loadCartWithDetails me fetch të plotë
      // ose e rifreskon me filtrim lokal
      setCart((prev) => ({
        items: prev.items.filter((item) => item.productId !== productId),
      }));
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError(error.message || "An unknown error occurred.");
    }
  };

  return (
    <div className="shopping-cart-container">
      <h1>Your Shopping Cart</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {isLoading ? (
        <div>Loading your cart...</div>
      ) : cart.items.length === 0 ? (
        <div>
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
                    <img
                      src={`https://localhost:5050${item.imageUrl}`}
                      alt={item.productName}
                      className="cart-item-image"
                    />
                  ) : (
                    <div className="image-placeholder">No image</div>
                  )}
                </div>

                <div className="cart-item-details">
                  <p>
                    <strong>{item.productName || item.productId}</strong>
                  </p>
                  <p>Price: {format(convert(item.price))}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Color: {item.color}</p>
                </div>

                <div className="remove-button-container">
                  <button onClick={() => removeItemFromCart(item.productId)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="process-order-container">
            <button className="process-order-button" onClick={handleProcessOrder}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCartPage;

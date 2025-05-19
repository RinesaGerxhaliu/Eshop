import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/ShoppingCart.css";

const ShoppingCartPage = () => {
  const { refreshAccessToken } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const navigate = useNavigate();

  // Funksioni për të marrë detajet e produktit
  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(
        `https://localhost:5050/products/${productId}`
      );
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

  // Funksioni për të marrë karrocën nga API-ja ose localStorage
  const getCart = async () => {
    setIsLoading(true);

    const username = localStorage.getItem("username");
    let token = localStorage.getItem("token");

    if (!username || !token) {
      // Përdoruesi jo i loguar
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      setCart({ items: cartItems });
      setIsLoading(false);
      return;
    }

    try {
      let response = await fetch(`https://localhost:5050/basket/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.log("Token expired, attempting to refresh...");
        token = await refreshAccessToken();
        if (!token) {
          navigate("/login");
          return;
        }

        response = await fetch(`https://localhost:5050/basket/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.status === 404) {
        setCart({ items: [] });
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setCart({ items: data.shoppingCart.items });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching shopping cart:", err);
      setError(err.message || "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  // Funksioni për të ngarkuar imazhet e produkteve
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

    setImagesLoaded(true);
  };

  // Funksioni për të hequr një produkt nga karroca
  const removeItemFromCart = async (productId) => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username || !token) {
      // Përdoruesi jo i loguar: Ndrysho karrocën në localStorage
      const updatedCartItems = cart.items.filter(
        (item) => item.productId !== productId
      );
      localStorage.setItem("cart", JSON.stringify(updatedCartItems));
      setCart({ items: updatedCartItems }); // Sigurohuni që UI të rifreskohet
      return;
    }

    // Përdoruesi i loguar: Bëj thirrje në API për të hequr produktin nga karroca
    try {
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

      getCart(); // Rifresko karrocën pas heqjes
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError(error.message || "An unknown error occurred.");
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  useEffect(() => {
    if (cart.items.length > 0) {
      loadProductImages(cart.items);
    }
  }, [cart.items]);

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
        <ul>
          {cart.items.map((item, idx) => (
            <li key={idx} className="cart-item">
              <div className="cart-item-image-container">
                {!item.imageUrl || !imagesLoaded ? (
                  <div className="image-placeholder">Loading Image...</div>
                ) : (
                  <img
                    src={
                      item.imageUrl
                        ? `https://localhost:5050${item.imageUrl}`
                        : "placeholder-image-url"
                    }
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

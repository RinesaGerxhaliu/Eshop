import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/ShoppingCart.css";
import { useCurrency } from "../../contexts/CurrencyContext";

const Wishlist = () => {
  const { refreshAccessToken } = useAuth();
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loadedItems, setLoadedItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { convert, format } = useCurrency();

  const fetchProductDetails = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://localhost:5050/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Product not found");
      const data = await response.json();
      return data.product;
    } catch (err) {
      console.error("Error fetching product details:", err);
      return null;
    }
  };

  const getWishlist = async () => {
    setIsLoading(true);
    setError("");

    const username = localStorage.getItem("username");
    let token = localStorage.getItem("token");

    if (!username || !token) {
      const wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlist({ items: wishlistItems });
      setIsLoading(false);
      return;
    }

    try {
      let response = await fetch(`https://localhost:5050/wishlist/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) {
          navigate("/login");
          return;
        }
        localStorage.setItem("token", token);
        response = await fetch(`https://localhost:5050/wishlist/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.status === 404) {
        const createResponse = await fetch("https://localhost:5050/wishlist", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wishlist: {
              id: crypto.randomUUID(),
              userName: username,
              items: [],
            },
          }),
        });
        if (!createResponse.ok) {
          throw new Error("Failed to create wishlist");
        }
        return await getWishlist(); 
      }

      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const data = await response.json();
      setWishlist({ items: data.wishlist.items || [] });
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFullProductData = async (items) => {
    if (!items.length) {
      setLoadedItems([]);
      return;
    }
    try {
      const productsWithDetails = await Promise.all(
        items.map(async (item) => {
          const product = await fetchProductDetails(item.productId);
          return {
            ...item,
            imageUrl: product?.imageUrl || null,
            productName: product?.name || item.productName || "Unnamed Product",
            price: product?.price ?? item.price ?? 0,
          };
        })
      );
      setLoadedItems(productsWithDetails);
    } catch (err) {
      console.error("Error loading product details:", err);
      setError("Error loading product details.");
    }
  };

  const removeItemFromWishlist = async (productId) => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (!username || !token) {
      const updatedItems = wishlist.items.filter((item) => item.productId !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updatedItems));
      setWishlist({ items: updatedItems });
      setLoadedItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:5050/wishlist/${username}/items/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to remove item from wishlist");

      const updated = wishlist.items.filter((item) => item.productId !== productId);
      setWishlist({ items: updated });
      setLoadedItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
      setError(err.message || "An unknown error occurred.");
    }
  };

  useEffect(() => {
    if (wishlist.items.length > 0) {
      loadFullProductData(wishlist.items);
    } else {
      setLoadedItems([]);
    }
  }, [wishlist.items]);

  useEffect(() => {
    getWishlist();
  }, []);

  return (
    <div className="shopping-cart-container">
      <h1>Your Wishlist</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {isLoading ? (
        <div style={{ fontSize: 18, fontWeight: "bold" }}>Loading your wishlist...</div>
      ) : loadedItems.length === 0 ? (
        <div>
          <p>Your wishlist is empty.</p>
          <button onClick={() => navigate("/shop")}>Go to Shop</button>
        </div>
      ) : (
        <ul>
          {loadedItems.map((item) => (
            <li key={item.productId} className="cart-item">
              <div className="cart-item-image-container">
                {!item.imageUrl ? (
                  <div className="image-placeholder">No Image</div>
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
                <p>Price: {format ? format(convert(item.price)) : item.price.toFixed(2)}</p>
                <p>Color: {item.color}</p>
              </div>

              <div className="remove-button-container">
                <button onClick={() => removeItemFromWishlist(item.productId)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Wishlist;

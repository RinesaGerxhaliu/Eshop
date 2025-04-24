import React, { useEffect, useState } from 'react';
import '../../Styles/ShoppingCart.css';

const ShoppingCartPage = () => {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const username = localStorage.getItem("username");

    if (!refreshToken || !username) {
      throw new Error("No refresh token or username found.");
    }

    const response = await fetch('https://localhost:5050/auth/refresh', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken, username }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token.");
    }

    const data = await response.json();
    localStorage.setItem("token", data.accessToken); 
    return data.accessToken;
  };

  // Function to get cart data
  const getCart = async () => {
    try {
      const username = localStorage.getItem("username");
      let token = localStorage.getItem("token");

      if (!username || !token) {
        throw new Error("User is not logged in or token is missing.");
      }

      let response = await fetch(`https://localhost:5050/basket/${username}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.log('Token expired, attempting to refresh...');
        token = await refreshToken(); 
        response = await fetch(`https://localhost:5050/basket/${username}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.status === 404) {
        setCart({ items: [] });
        setError('');
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch cart.");
      }

      const data = await response.json();
      setCart(data.shoppingCart);
      setError('');
    } catch (err) {
      console.error("Error fetching shopping cart:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  return (
    <div className="shopping-cart-container">
      <h1>Your Shopping Cart</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading cart...</p>
      ) : (
        !cart || !cart.items || cart.items.length === 0 ? (
          <p>Your shopping cart is empty.</p>
        ) : (
          <ul>
            {cart.items.map((item, idx) => (
              <li key={idx} className="cart-item">
                <p><strong>{item.productName}</strong></p>
                <p>Price: €{item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Color: {item.color}</p>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

export default ShoppingCartPage;

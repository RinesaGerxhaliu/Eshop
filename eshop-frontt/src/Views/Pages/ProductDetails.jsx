import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../Styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); 
  const [isAdded, setIsAdded] = useState(false); 

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

  const fetchProduct = async () => {
    try {
      const response = await fetch(`https://localhost:5050/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsAdding(true);  
    setIsAdded(false);  // Reset isAdded state to false

    const userName = localStorage.getItem("username");
    if (!userName) {
      alert("User not logged in.");
      setIsAdding(false); // Reset isAdding state
      return;
    }

    const shoppingCartItem = {
      productId: product.id,
      quantity,
      color: "Pink",
      price: product.price,
      productName: product.name,
      imageUrl: product.imageUrl, // Include the imageUrl here
    };

    const requestData = {
      userName,
      shoppingCartItem,
    };

    const postToBasket = async (token) => {
      return await fetch(`https://localhost:5050/basket/${userName}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
    };

    try {
      let token = localStorage.getItem("token");
      let response = await postToBasket(token);

      if (response.status === 401) {
        // If token expired, try to refresh
        token = await refreshToken();
        response = await postToBasket(token);
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      await response.json();
      setIsAdding(false);  // Reset isAdding state after success
      setIsAdded(true);  // Set isAdded to true after successful addition
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      alert("Failed to add product to cart.");
      setIsAdding(false);  
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <div className="container-product">
      <section className="product-details">
        <div className="product-images">
          <img
            src={`https://localhost:5050${product.imageUrl}`}
            alt={product.name}
            className="main-image"
          />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="product-price">{product.price.toFixed(2)} €</p>
          <div className="product-rating">
            Review: ★★★★☆ ({product.reviews} Reviews){/*E boj me e marr prej reviews metodes*/}
          </div>

          <form onSubmit={handleAddToCart}>
            <div className="product-options">
              <div className="quantity-cart-row">
                <div className="quantity">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button className="add-to-cart" type="submit" disabled={isAdding}>
                  {isAdding ? "Adding..." : isAdded ? "Added" : "Add to Cart"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;

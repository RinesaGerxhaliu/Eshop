import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/ProductDetails.css";
import { useCurrency } from "../../contexts/CurrencyContext";
import ProductReviews from "./ProductReviews"; // kjo mund të hiqet për admin
import { useAuth } from "../../contexts/AuthContext"; // për të marrë rolet
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();
  const { convert, format } = useCurrency();
  const { roles } = useAuth(); // Përdorim rolet për të kontrolluar nëse është admin

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [refreshReviewsKey, setRefreshReviewsKey] = useState(0);


  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const username = localStorage.getItem("username");

    if (!refreshToken || !username) {
      throw new Error("No refresh token or username found.");
    }

    const response = await fetch("https://localhost:5050/auth/refresh", {
      method: "POST",
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
      if (!response.ok) throw new Error("Product not found");
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

  const checkIfCartExists = async (username, token) => {
  const response = await fetch(`https://localhost:5050/basket/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
};


const handleAddToCart = async (e) => {
  e.preventDefault();

  let token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!username || !token) {
    window.location.href = "/login"; 
    return;
  }

  setIsAdding(true);

  try {
    const cartExists = await checkIfCartExists(username, token);

    const itemPayload = {
      ProductId: product.id,
      Quantity: quantity,
      Color: "",
      Price: product.price,
      ProductName: product.name,
    };

    const url = cartExists
      ? `https://localhost:5050/basket/${username}/items`
      : `https://localhost:5050/basket`;

    const body = cartExists
      ? JSON.stringify({ userName: username, ShoppingCartItem: itemPayload })
      : JSON.stringify({
          shoppingCart: {
            items: [itemPayload],
          },
        });

    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    if (response.status === 401) {
      token = await refreshToken();
      localStorage.setItem("token", token);

      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
    }

    if (!response.ok) {
      throw new Error("Failed to add item to cart.");
    }

    setIsAdded(true);
  } catch (err) {
    console.error("Add to cart failed:", err);
  } finally {
    setIsAdding(false);
  }
};


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccess("");
    setReviewError("");

    let token = localStorage.getItem("token");

    if (!token) {
      setReviewError("You must be logged in to leave a review.");
      return;
    }

    try {
      let response = await fetch("https://localhost:5050/products/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          reviewText,
          rating: parseInt(rating),
        }),
      });

      if (response.status === 401) {
        token = await refreshToken();
        localStorage.setItem("token", token);

        response = await fetch("https://localhost:5050/products/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: id,
            reviewText,
            rating: parseInt(rating),
          }),
        });
      }

      if (!response.ok) throw new Error("Failed to submit review");

      setReviewSuccess("Review submitted successfully!");
      setReviewText("");
      setRating(5);

      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess("");
        setRefreshReviewsKey(prev => prev + 1); 
      }, 2);
      
    } catch (err) {
      setReviewError(err.message || "An error occurred");
    }
  };

  const handleStarClick = (star) => {
    setRating(star);
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");
  

  return (
    <div className="container-product">
      <section className="product-details">
        {product && (
          <>
            <div className="product-images">
              <img
                src={`https://localhost:5050${product.imageUrl}`}
                alt={product.name}
                className="main-image"
              />
            </div>

            <div className="product-infoo">
              <h1>{product.name}</h1>
              <p className="product-descriptionn">{product.description}</p>
              <p className="product-pricee">
                {product.price
                  ? format(convert(product.price))
                  : "Price not available"}
              </p>
              <div className="product-rating">
                Review: ★★★★☆ ({product.reviews} Reviews)
              </div>

              {!isAdmin && (
                <form onSubmit={handleAddToCart}>
                  <div className="product-options">
                    <div className="quantity-cart-row">
                      <div className="quantity">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        >
                          –
                        </button>
                        <span className="qty-value">{quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => setQuantity((q) => q + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button className="add-to-cart" type="submit">
                        {isAdding
                          ? "Adding..."
                          : isAdded
                          ? "Added"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {!isAdmin && (
                <button
                  className="add-to-cart"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  Leave a Review
                </button>
              )}

              {isReviewModalOpen && (
                <div className="review-modal open">
                  <div className="review-modal-content">
                    <h3>Leave a Review</h3>

                    {reviewError && (
                      <p className="text-danger">{reviewError}</p>
                    )}
                    {reviewSuccess && (
                      <p className="text-success">{reviewSuccess}</p>
                    )}

                    <form onSubmit={handleReviewSubmit} className="review-form">
                      <div className="form-group">
                        <label>Rating:</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`star-btn ${
                                rating >= star ? "selected" : ""
                              }`}
                              onClick={() => handleStarClick(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Your Review:</label>
                        <textarea
                          rows="5"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                        />
                      </div>

                      <button type="submit">Submit Review</button>
                    </form>

                    <button
                      className="btn btn-secondary"
                      onClick={() => setIsReviewModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
      {!isAdmin && (
        <div className="reviews-container">
          <ProductReviews key={refreshReviewsKey} productId={id} />

        </div>
      )}
    </div>
  );
};

export default ProductDetails;
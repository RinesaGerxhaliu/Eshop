import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/ProductDetails.css";
import { useCurrency } from "../../contexts/CurrencyContext";
import ProductReviews from "./ProductReviews";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const { convert, format } = useCurrency();
  const { roles } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [refreshReviewsKey, setRefreshReviewsKey] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [averageRating, setAverageRating] = useState(null);

  // Helper to refresh token if expired
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const username = localStorage.getItem("username");
    if (!refreshToken || !username) throw new Error("No refresh token or username found.");

    const response = await fetch("https://localhost:5050/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, username }),
    });
    if (!response.ok) throw new Error("Failed to refresh token.");
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

  // Average rating for stars
  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`https://localhost:5050/products/${id}/average-rating`);
      if (!response.ok) throw new Error("Failed to fetch average rating");
      const data = await response.json();
      setAverageRating(data.averageRating);
    } catch (err) {
      setAverageRating(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchAverageRating();
    }
  }, [id]);

  // Star rendering helper
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={"full-" + i} color="#FFD700" />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key="half" color="#FFD700" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={"empty-" + i} color="#FFD700" />);
    return stars;
  };

  // ADD TO CART
  const checkIfCartExists = async (username, token) => {
    const response = await fetch(`https://localhost:5050/basket/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (!username || !token) return (window.location.href = "/login");
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
        : JSON.stringify({ shoppingCart: { items: [itemPayload] } });

      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body,
      });

      if (response.status === 401) {
        token = await refreshToken();
        localStorage.setItem("token", token);
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body,
        });
      }
      if (!response.ok) throw new Error("Failed to add item to cart.");
      setIsAdded(true);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const fetchWishlistStatus = async () => {
    const username = localStorage.getItem("username");
    let token = localStorage.getItem("token");
    if (!username || !token) return setIsFavorite(false);

    try {
      // Try GET wishlist
      let response = await fetch(`https://localhost:5050/wishlist/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 404) {
        // If not found, POST (create)
        const createResponse = await fetch("https://localhost:5050/wishlist", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ wishlist: { items: [] } }) // No username or id
        });
        if (!createResponse.ok) throw new Error("Failed to create wishlist");

        // After POST, do a single GET to fetch it.
        response = await fetch(`https://localhost:5050/wishlist/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.status === 401) {
        // Refresh token and retry GET (never POST again)
        token = await refreshToken();
        localStorage.setItem("token", token);
        response = await fetch(`https://localhost:5050/wishlist/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const data = await response.json();
      const items = data.wishlist?.items || [];
      const found = items.some((item) => item.productId === id);
      setIsFavorite(found);
    } catch (error) {
      console.error("Could not load wishlist status", error);
      setIsFavorite(false);
    }
  };


  const handleWishlistToggle = async () => {
    const username = localStorage.getItem("username");
    let token = localStorage.getItem("token");
    if (!username || !token) return (window.location.href = "/login");

    const deleteUrl = `https://localhost:5050/wishlist/${username}/items/${id}`;
    const postUrl = `https://localhost:5050/wishlist/${username}/items`;

    try {
      if (isFavorite) {
        let response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          token = await refreshToken();
          localStorage.setItem("token", token);
          response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (!response.ok) throw new Error("Failed to remove from wishlist");
        setIsFavorite(false);
      } else {
        const body = JSON.stringify({
          userName: username,
          wishlistItem: { productId: id },
        });

        let response = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body,
        });

        if (response.status === 401) {
          token = await refreshToken();
          localStorage.setItem("token", token);
          response = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body,
          });
        }
        if (!response.ok) throw new Error("Failed to add to wishlist");
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Wishlist toggle failed", error);
    }
  };

  // REVIEW submit
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: id, reviewText, rating: parseInt(rating) }),
      });
      if (response.status === 401) {
        token = await refreshToken();
        localStorage.setItem("token", token);
        response = await fetch("https://localhost:5050/products/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: id, reviewText, rating: parseInt(rating) }),
        });
      }
      if (!response.ok) throw new Error("Failed to submit review");
      setReviewSuccess("Review submitted successfully!");
      setReviewText("");
      setRating(5);
      await fetchAverageRating();
      setIsReviewModalOpen(false);
      setReviewSuccess("");
      setRefreshReviewsKey((prev) => prev + 1);
    } catch (err) {
      setReviewError(err.message || "An error occurred");
    }
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
              <div className="product-title-row">
                {!isAdmin && (
                  <div className="wishlist-container">

                    <button
                      className={`wishlist-heart ${isFavorite ? "active" : ""}`}
                      onClick={handleWishlistToggle}
                      title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
                      aria-pressed={isFavorite}
                    >
                      {isFavorite ? <FaHeart color="red" /> : <FaRegHeart color="gray" />}
                    </button>
                  </div>
                )}
                <div className="product-title-row">
                  <h1 className="product-name">{product.name}</h1>
                </div>
              </div>

              <p className="product-descriptionn">{product.description}</p>
              <p className="product-pricee">
                {product.price ? format(convert(product.price)) : "Price not available"}
              </p>
              {averageRating != null && (
                <div className="product-rating">
                  <span className="rating-label">Average Rating:</span>
                  <span className="stars">{renderStars(averageRating)}</span>
                  <span className="rating-value">{averageRating.toFixed(1)}</span>
                </div>
              )}

              {!isAdmin && (
                <form onSubmit={handleAddToCart}>
                  <div className="product-options">
                    <div className="quantity-cart-row">
                      <div className="quantity">
                        <button type="button" className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>–</button>
                        <span className="qty-value">{quantity}</span>
                        <button type="button" className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
                      </div>
                      <button className="add-to-cart" type="submit">
                        {isAdding ? "Adding..." : isAdded ? "Added" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {!isAdmin && (
                <button
                  className="add-to-cart"
                  onClick={() => {
                    setRating(0);
                    setHoverRating(0);
                    setIsReviewModalOpen(true);
                  }}
                >
                  Leave a Review
                </button>
              )}

              {isReviewModalOpen && (
                <div className="review-modal open">
                  <div className="review-modal-content">
                    <h3>Leave a Review</h3>
                    {reviewError && <p className="text-danger">{reviewError}</p>}
                    {reviewSuccess && <p className="text-success">{reviewSuccess}</p>}

                    <form onSubmit={handleReviewSubmit} className="review-form">
                      <div className="form-group">
                        <label>Rating:</label>
                        <div className="star-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`star-btn ${(hoverRating || rating) >= star ? "selected" : ""}`}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
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
                    <button className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>
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
          <ProductReviews key={refreshReviewsKey} productId={id} onReviewsChange={fetchAverageRating} />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;

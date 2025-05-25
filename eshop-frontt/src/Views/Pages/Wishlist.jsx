import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/ShoppingCart.css";

const Wishlist = () => {
    const { refreshAccessToken } = useAuth();
    const [wishlist, setWishlist] = useState({ items: [] });
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

    // Funksioni për të marrë wishlist-in nga API-ja ose localStorage
    const getWishlist = async () => {
        setIsLoading(true);

        const username = localStorage.getItem("username");
        let token = localStorage.getItem("token");

        if (!username || !token) {
            // Përdoruesi jo i loguar
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
                console.log("Token expired, attempting to refresh...");
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
                setWishlist({ items: [] });
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            setWishlist({ items: data.wishlist.items });
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError(err.message || "An unknown error occurred.");
            setIsLoading(false);
        }
    };

    // Funksioni për të ngarkuar imazhet e produkteve në wishlist
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

        setWishlist({ items: updatedItems });
        setImagesLoaded(true);
    };

    // Funksioni për të hequr një produkt nga wishlist
    const removeItemFromWishlist = async (productId) => {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");

        if (!username || !token) {
            const updatedItems = wishlist.items.filter(
                (item) => item.productId !== productId
            );
            localStorage.setItem("wishlist", JSON.stringify(updatedItems));
            setWishlist({ items: updatedItems });
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

            if (!response.ok) {
                throw new Error("Failed to remove item from wishlist");
            }

            getWishlist(); // Rifresko wishlist pas heqjes
        } catch (error) {
            console.error("Error removing item from wishlist:", error);
            setError(error.message || "An unknown error occurred.");
        }
    };

    useEffect(() => {
        getWishlist();
    }, []);

    useEffect(() => {
        if (wishlist.items.length > 0) {
            loadProductImages(wishlist.items);
        }
    }, [wishlist.items]);
    return (
        <div className="shopping-cart-container">
            <h1>Your Wishlist</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {isLoading ? (
                <div>Loading your wishlist...</div>
            ) : wishlist.items.length === 0 ? (
                <div>
                    <p>Your wishlist is empty.</p>
                    <button onClick={() => navigate("/shop")}>Go to Shop</button>
                </div>
            ) : (
                <ul>
                    {wishlist.items.map((item, idx) => (
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
                                <p>Color: {item.color}</p>
                            </div>

                            <div className="remove-button-container">
                                <button onClick={() => removeItemFromWishlist(item.productId)}>
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

export default Wishlist;

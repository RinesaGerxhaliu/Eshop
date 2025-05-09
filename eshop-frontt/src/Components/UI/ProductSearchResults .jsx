import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../../Styles/FilterProducts.css"; // Sigurohuni që ky stil të jetë i lidhur me komponentin

const ProductSearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("search"); // Get query param from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Përdorim për menaxhimin e gabimeve

  useEffect(() => {
    if (query) {
      setLoading(true); // Sigurohemi që ngarkimi të rifilloje çdo herë që query ndryshon
      axios
        .get(`https://localhost:5050/products/search?query=${query}`)
        .then((response) => {
          setProducts(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setError("There was an error fetching the products.");
          setLoading(false);
        });
    }
  }, [query]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="product-section">
      <h2>Results for "{query}"</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={`https://localhost:5050${product.imageUrl}`}
                alt={product.name}
                className="product-image"
              />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-info">
                <p className="product-price">${product.price}</p>
                <a href={`/products/${product.id}`} className="details">
                  Details
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
};

export default ProductSearchResults;

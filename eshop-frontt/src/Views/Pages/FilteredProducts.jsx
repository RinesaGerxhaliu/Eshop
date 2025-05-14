import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaSort } from "react-icons/fa";
import "../../Styles/FilterProducts.css";

const API = "https://localhost:5050";

const FilteredProducts = () => {
  const { filterType, filterId } = useParams();
  const [products, setProducts] = useState([]);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);

  const fetchProducts = async () => {
    try {
      let url = "";

      if (filterType === "by-category") {
        url = `${API}/products/by-category/${filterId}`;
      } else if (filterType === "by-brand") {
        url = `${API}/products/by-brand/${filterId}`;
      } else {
        url = `${API}/products`;
      }

      if (!url) return;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");

      let data = await response.json();
      if (!Array.isArray(data)) data = [];

      if (sortOrder === "low") {
        data.sort((a, b) => a.price - b.price);
      } else if (sortOrder === "high") {
        data.sort((a, b) => b.price - a.price);
      } else if (sortOrder === "az") {
        data.sort((a, b) => a.name.localeCompare(b.name));
      }

      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filterType, filterId, sortOrder]);

  const handleSortClick = () => {
    setShowSortOptions(!showSortOptions);
  };

  const handleSortOption = (option) => {
    setSortOrder(option);
    setShowSortOptions(false);
  };

  return (
    <section className="product-section">
      <div className="sort-button-container">
        <button className="sort-button" onClick={handleSortClick}>
          <FaSort style={{ marginRight: "6px" }} />
          Sort
        </button>
        {showSortOptions && (
          <div className="sort-options">
            <button onClick={() => handleSortOption("low")}>
              Price: Low to High
            </button>
            <button onClick={() => handleSortOption("high")}>
              Price: High to Low
            </button>
            <button onClick={() => handleSortOption("az")}>
              Products: A-Z
            </button>
          </div>
        )}
      </div>

      <div className="product-list">
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img src={`${API}${product.imageUrl}`} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-info">
                  <p className="product-price">${product.price}</p>
                  <Link to={`/products/${product.id}`} className="details">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products found</p>
        )}
      </div>
    </section>
  );
};

export default FilteredProducts;

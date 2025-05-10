import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { FaSort } from "react-icons/fa"; // ikona për sortim
import "../../Styles/FilterProducts.css";

const API = "https://localhost:5050";

const FilteredProducts = () => {
  const { filterType, filterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        const path = location.pathname;

        if (path.endsWith("/sorted/by-price")) {
          response = await fetch(`${API}/products/sorted/by-price`);
        } else if (path.endsWith("/sorted/by-price-descending")) {
          response = await fetch(`${API}/products/sorted/by-price-descending`);
        } else if (path.includes("/products/filter")) {
          if (filterType === "category") {
            response = await fetch(`${API}/products/by-category/${filterId}`);
          } else if (filterType === "brand") {
            response = await fetch(`${API}/products/by-brand/${filterId}`);
          }
        }

        if (response && response.ok) {
          const data = await response.json();
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [filterType, filterId, location.pathname]);

  const handleSortClick = () => {
    setShowSortOptions(!showSortOptions);
  };

  const handleSortOption = (option) => {
    if (option === "low") {
      navigate("/products/sorted/by-price");
    } else if (option === "high") {
      navigate("/products/sorted/by-price-descending");
    }
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

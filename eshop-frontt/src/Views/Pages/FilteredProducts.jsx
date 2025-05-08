import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../Styles/FilterProducts.css";

const API = "https://localhost:5050";

const FilteredProducts = () => {
  const { filterType, filterId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        let response;
        if (filterType === "category") {
          response = await fetch(`${API}/products/by-category/${filterId}`);
        } else if (filterType === "brand") {
          response = await fetch(`${API}/products/by-brand/${filterId}`);
        }

        if (response.ok) {
          const data = await response.json();
          console.log("Data from API:", data);
          setProducts(data || []);
        } else {
          console.error("Error fetching products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchFilteredProducts();
  }, [filterType, filterId]);

  return (
    <section className="product-section">
      <div className="product-list">
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={`${API}${product.imageUrl}`}
                  alt={product.name}
                />
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

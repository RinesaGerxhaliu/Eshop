import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import "../../Styles/FilterProducts.css";

const API = "https://localhost:5050";

const FilteredProducts = ({ sortByPrice }) => {
  const { filterType, filterId } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response;
        const path = location.pathname;

        if (path.endsWith("/sorted/by-price")) {
          response = await fetch(`${API}/products/sorted/by-price`);
        } else if (path.endsWith("/sorted/by-price-descending")) {
          response = await fetch(`${API}/products/sorted/by-price-descending`);
        }
         else if (path.includes("/products/filter")) {
          if (filterType === "category") {
            response = await fetch(`${API}/products/by-category/${filterId}`);
          } else if (filterType === "brand") {
            response = await fetch(`${API}/products/by-brand/${filterId}`);
          }
        }
        
        if (response && response.ok) {
          const data = await response.json();
          console.log("Fetched products:", data.map(p => p.price));
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
  
    fetchProducts();
  }, [filterType, filterId, location.pathname]);
  


  return (
    <section className="product-section">
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
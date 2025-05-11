import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/Shop.css";
import ProductCard from "../../Components/UI/ProductCard";
import { FaSort } from "react-icons/fa";

const API = "https://localhost:5050";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    fetch(`${API}/products?PageIndex=0&PageSize=12`, { mode: "cors" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.products?.data) {
          setProducts(data.products.data);
        } else {
          throw new Error("Unexpected response shape");
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setErrorMsg(err.message);
      });
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "low") return a.price - b.price; 
    if (sortOrder === "high") return b.price - a.price; 
    if (sortOrder === "az") return a.name.localeCompare(b.name);
    return 0;
  });

  const handleSortClick = () => setShowSortOptions(!showSortOptions);
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
            <button onClick={() => handleSortOption("low")}>Price: Low to High</button>
            <button onClick={() => handleSortOption("high")}>Price: High to Low</button>
            <button onClick={() => handleSortOption("az")}>Products: A-Z</button> 
          </div>
        )}
      </div>

      <h2 className="section-title">Popular Products</h2>
      {errorMsg && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error loading products: {errorMsg}
        </div>
      )}
      <div className="product-grid">
        {sortedProducts.map((prod) => (
          <ProductCard
            key={prod.id}
            id={prod.id}
            name={prod.name}
            description={prod.description}
            price={prod.price}
            imageUrl={prod.imageUrl}
            reviews={prod.reviews}
          />
        ))}
      </div>
    </section>
  );
};

export default Shop;

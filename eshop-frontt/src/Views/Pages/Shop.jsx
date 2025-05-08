import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/Shop.css";
import ProductCard from "../../Components/UI/ProductCard";

const API = "https://localhost:5050";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

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

  return (
    <section className="product-section">
      <h2 className="section-title">Popular Products</h2>
      {errorMsg && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error loading products: {errorMsg}
        </div>
      )}
      <div className="product-grid">
        {products.map((prod) => (
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

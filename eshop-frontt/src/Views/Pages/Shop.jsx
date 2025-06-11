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

  const [pageIndex, setPageIndex] = useState(0);
  const PAGE_SIZE = 8;
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
    });

    const token = localStorage.getItem("token");

    fetch(`${API}/products?${params.toString()}`, {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const items = data.products?.data || [];
        setProducts(items);

        const count =
          data.products?.count ?? data.products?.totalItems ?? items.length;
        setTotalCount(count);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setErrorMsg(err.message);
      });
  }, [pageIndex]);


  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "low") return a.price - b.price;
    if (sortOrder === "high") return b.price - a.price;
    if (sortOrder === "az") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
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
            <button onClick={() => handleSortOption("low")}>
              Price: Low to High
            </button>
            <button onClick={() => handleSortOption("high")}>
              Price: High to Low
            </button>
            <button onClick={() => handleSortOption("az")}>
              Products: A-Z
            </button>
            <button onClick={() => {
              setSortOrder(null);
              setShowSortOptions(false);
            }}>
              Reset Sort
            </button>
          </div>
        )}

      </div>

      <h2 className="section-title">All Products</h2>
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
      <div className="pagination">
        <div className="pagination-buttons-grid">
          <button
            onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
            disabled={pageIndex === 0}
          >
            ← Prev
          </button>

          <div className="pagination-info">
            Page {pageIndex + 1} of {totalPages}
          </div>

          <button
            onClick={() => setPageIndex((i) => Math.min(i + 1, totalPages - 1))}
            disabled={pageIndex + 1 >= totalPages}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Shop;

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
  const [pageIndex, setPageIndex] = useState(0);
  const PAGE_SIZE = 8;
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
    });

    try {
      let url = "";

      if (filterType === "category") {
        url = `${API}/products/by-category/${filterId}`;
      } else if (filterType === "brand") {
        url = `${API}/products/by-brand/${filterId}`;
      }

      if (!url) return;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");

      let data = await response.json();
      if (!Array.isArray(data)) data = [];

      setTotalCount(data.length); 
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

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

  useEffect(() => {
    fetchProducts();
  }, [filterType, filterId, pageIndex]);

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
        {sortedProducts.length > 0 ? (
          <>
            <div className="product-grid">
              {sortedProducts
                .slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)
                .map((product) => (
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

            <div className="pagination">
              <div className="pagination-buttons">
                <button
                  onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
                  disabled={pageIndex === 0}
                >
                  ← Prev
                </button>
                <button
                  onClick={() =>
                    setPageIndex((i) => Math.min(i + 1, totalPages - 1))
                  }
                  disabled={pageIndex + 1 >= totalPages}
                >
                  Next →
                </button>
              </div>
              <div className="pagination-info">
                Page {pageIndex + 1} of {totalPages}
              </div>
            </div>
          </>
        ) : (
          <p>No products found</p>
        )}
      </div>
    </section>
  );
};

export default FilteredProducts;

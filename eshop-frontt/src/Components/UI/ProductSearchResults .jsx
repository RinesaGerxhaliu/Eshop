import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../../Styles/FilterProducts.css";

const PAGE_SIZE = 8;

const ProductSearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .get("https://localhost:5050/products/search", {
        params: {
          query,
          pageIndex,
          pageSize: PAGE_SIZE,
        },
      })
      .then((response) => {
        const data = response.data;
        // Backend po kthen: { pageIndex, pageSize, count, data }
        setProducts(data.data ?? []);
        setTotalCount(data.count ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("There was an error fetching the products.");
        setLoading(false);
      });
  }, [query, pageIndex]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (newPageIndex) => {
    if (newPageIndex >= 0 && newPageIndex < totalPages) {
      setPageIndex(newPageIndex);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-section">
      <h2>Results for "{query}"</h2>
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
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
                  onClick={() =>
                    setPageIndex((i) => Math.min(i + 1, totalPages - 1))
                  }
                  disabled={pageIndex + 1 >= totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
        </>
      )}
    </div>
  );
};

export default ProductSearchResults;

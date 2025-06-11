import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaSort } from "react-icons/fa";
import { useCurrency } from "../../contexts/CurrencyContext";
import "../../Styles/FilterProducts.css";

const API = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function FilteredProducts() {
  const { filterType, filterId } = useParams();
  const [filterName, setFilterName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { convert, format } = useCurrency();

  useEffect(() => {
    const fetchNames = async () => {
      if (
        (filterType !== "subcategory" && filterType !== "brand") ||
        !filterId
      ) {
        setFilterName("");
        setCategoryName("");
        return;
      }

      try {
        if (filterType === "subcategory") {
          // 1. Merr subcategory me categoryId
          const resSub = await fetch(`${API}/subcategories/${filterId}`);
          if (!resSub.ok) throw new Error("Failed to fetch subcategory");
          const dataSub = await resSub.json();
          const subcategoryName = dataSub.subcategory?.name ?? "";
          const categoryId = dataSub.subcategory?.categoryId;

          setFilterName(subcategoryName);

          if (categoryId) {
            // 2. Merr emrin e kategorisë
            const resCat = await fetch(`${API}/categories/${categoryId}`);
            if (!resCat.ok) throw new Error("Failed to fetch category");
            const dataCat = await resCat.json();
            const categoryName = dataCat.category?.name ?? "";
            setCategoryName(categoryName);
          } else {
            setCategoryName("");
          }
        } else if (filterType === "brand") {
          // Për brand, merr vetëm emrin e brand-it
          const res = await fetch(`${API}/brands/${filterId}`);
          if (!res.ok) throw new Error("Failed to fetch brand");
          const data = await res.json();
          setFilterName(data.brand?.name ?? "");
          setCategoryName("");
        }
      } catch (error) {
        console.error(error);
        setFilterName("");
        setCategoryName("");
      }
    };

    fetchNames();
  }, [filterType, filterId]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (
        (filterType !== "subcategory" && filterType !== "brand") ||
        !filterId
      ) {
        setProducts([]);
        setTotalCount(0);
        return;
      }

      const params = new URLSearchParams({
        PageIndex: pageIndex,
        PageSize: PAGE_SIZE,
      });

      const url =
        filterType === "subcategory"
          ? `${API}/products/by-subcategory/${filterId}?${params}`
          : `${API}/products/by-brand/${filterId}?${params}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const isPaged = data.items !== undefined;
        setProducts(isPaged ? data.items : data);
        setTotalCount(isPaged ? data.totalCount : data.length);
      } catch {
        setProducts([]);
        setTotalCount(0);
      }
    };

    setPageIndex(0);
    fetchProducts();
  }, [filterType, filterId, pageIndex]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "low") return a.price - b.price;
    if (sortOrder === "high") return b.price - a.price;
    if (sortOrder === "az") return a.name.localeCompare(b.name);
    return 0;
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const headingLabel =
    filterType === "subcategory"
      ? "Subcategory"
      : filterType === "brand"
      ? "Brand"
      : "";

  return (
    <section className="product-section">
      {headingLabel && filterName ? (
        <header className="filter-heading">
          <h2>
            {headingLabel} - {filterName}
          </h2>
          {categoryName && <h3>Category: {categoryName}</h3>}
        </header>
      ) : (
        <p>Loading filter name...</p>
      )}

      <div className="sort-button-container">
        <button
          className="sort-button"
          onClick={() => setShowSortOptions((s) => !s)}
          aria-haspopup="true"
          aria-expanded={showSortOptions}
        >
          <FaSort style={{ marginRight: 6 }} />
          Sort
        </button>
        {showSortOptions && (
          <div className="sort-options" role="menu">
            <button
              onClick={() => {
                setSortOrder("low");
                setShowSortOptions(false);
              }}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => {
                setSortOrder("high");
                setShowSortOptions(false);
              }}
            >
              Price: High to Low
            </button>
            <button
              onClick={() => {
                setSortOrder("az");
                setShowSortOptions(false);
              }}
            >
              Products: A-Z
            </button>
          </div>
        )}
      </div>

      <div className="product-list">
        {sortedProducts.length > 0 ? (
          <>
            <div className="product-grid">
              {sortedProducts.map((product) => {
                const imgSrc = product.imageUrl
                  ? product.imageUrl.startsWith("http")
                    ? product.imageUrl
                    : `${API}${product.imageUrl}`
                  : "/Assets/placeholder.png";

                return (
                  <div key={product.id} className="product-card">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                    />
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-info">
                      <p className="product-price">
                        {format(convert(product.price))}
                      </p>
                      <Link to={`/products/${product.id}`} className="details">
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pagination">
              <div className="pagination-buttons-grid">
                <button
                  onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
                  disabled={pageIndex === 0}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {pageIndex + 1} of {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setPageIndex((i) => Math.min(i + 1, totalPages - 1))
                  }
                  disabled={pageIndex + 1 >= totalPages}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>No products found</p>
        )}
      </div>
    </section>
  );
}

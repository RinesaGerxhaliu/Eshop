import React, { useEffect, useState } from "react";
import Select from "react-select";
import "../Styles/ManageProducts.css";
import AddProduct from "./UI/AddProduct";

const BASE = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterCat, setFilterCat] = useState("");
  const [filterBrd, setFilterBrd] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(""), 5000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  const safeProducts = Array.isArray(products) ? products : [];

  const fetchJson = async (url, opts) => {
    const res = await fetch(url, { mode: "cors", ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    fetchJson(`${BASE}/categories`)
      .then(data => {
        const list = data.Categories ?? data.categories ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));

    fetchJson(`${BASE}/brands`)
      .then(data => {
        const list = data.Brands ?? data.brands ?? [];
        setBrands(Array.isArray(list) ? list : []);
      })
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    const params = {
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
      ...(filterCat && { CategoryId: filterCat }),
      ...(filterBrd && { BrandId: filterBrd }),
    };
    const url = `${BASE}/products?${new URLSearchParams(params)}`;

    fetchJson(url)
      .then(data => {
        const page = data.products;
        const items = Array.isArray(page?.data) ? page.data : [];
        setProducts(items);
        setTotalCount(typeof page?.totalCount === "number"
          ? page.totalCount
          : items.length
        );
      })
      .catch(() => {
        setProducts([]);
        setTotalCount(0);
      });
  }, [pageIndex, filterCat, filterBrd]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetchJson(`${BASE}/products/${id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== id));
    setTotalCount(prev => prev - 1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const brandOptions = brands.map(b => ({ value: b.id, label: b.name }));
  const selectedCategory = categoryOptions.find(o => o.value === filterCat) || null;
  const selectedBrand = brandOptions.find(o => o.value === filterBrd) || null;

  const selectStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
  };

  return (
    <>
      <AddProduct
        isOpen={showAddModal}
        categories={categories}
        brands={brands}
        onAdd={() => {
          setPageIndex(0);
          setShowAddModal(false);
          setSuccessMsg("Product added successfully!");
        }}
        onError={msg => setSuccessMsg(msg)}
        onClose={() => setShowAddModal(false)}
      />

      {successMsg && (
        <div className="mp-success">
          {successMsg}
        </div>
      )}


      <div className="mp-container">
        <header className="mp-header">
          <h1>Manage Products</h1>
          <button
            className="mp-btn mp-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Product
          </button>
        </header>
        <div className="mp-filters">
          <div className="mp-select-wrapper">
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={opt => { setFilterCat(opt?.value ?? ""); setPageIndex(0); }}
              placeholder="All Categories"
              isClearable
              menuPlacement="bottom"
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={selectStyles}
              classNamePrefix="mp-select"
            />
          </div>

          <div className="mp-select-wrapper">
            <Select
              options={brandOptions}
              value={selectedBrand}
              onChange={opt => { setFilterBrd(opt?.value ?? ""); setPageIndex(0); }}
              placeholder="All Brands"
              isClearable
              menuPlacement="bottom"
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={selectStyles}
              classNamePrefix="mp-select"
            />
          </div>

          <button
            className="mp-btn mp-btn-secondary"
            onClick={() => { setFilterCat(""); setFilterBrd(""); setPageIndex(0); }}
          >
            Reset
          </button>
        </div>

        <div className="mp-table-wrap">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Name</th><th>Price</th><th>Category</th>
                <th>Brand</th><th>Image</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeProducts.length > 0 ? safeProducts.map(p => {
                const cat = categories.find(c => c.id === p.categoryId)?.name;
                const brd = brands.find(b => b.id === p.brandId)?.name;
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>{cat || "–"}</td>
                    <td>{brd || "–"}</td>
                    <td>
                      {p.imageUrl ? (
                        <img
                          src={`${BASE}${p.imageUrl.startsWith('/') ? '' : '/'}${p.imageUrl}`}
                          alt={p.name}
                          className="mp-image"
                        />
                      ) : (
                        <div className="mp-image-placeholder">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ccc"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="3" x2="21" y2="21" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className="mp-btn mp-btn-action"
                        onClick={() => window.location.href = `/admin-dashboard/manage-products/${p.id}/edit`}
                      >Edit</button>
                      <button
                        className="mp-btn mp-btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >Delete</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 && (
          <div className="mp-pagination">
            <button
              className="mp-btn mp-btn-secondary"
              onClick={() => setPageIndex(i => Math.max(i - 1, 0))}
              disabled={pageIndex === 0}
            >← Prev</button>
            <span style={{ margin: "0 12px" }}>
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              className="mp-btn mp-btn-secondary"
              onClick={() => setPageIndex(i => Math.min(i + 1, totalPages - 1))}
              disabled={pageIndex + 1 >= totalPages}
            >Next →</button>
          </div>
        )}
      </div>
    </>
  );
}

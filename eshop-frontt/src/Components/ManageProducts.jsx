import React, { useEffect, useState } from "react";
import Select from "react-select";
import "../Styles/ManageProducts.css";
import AddProduct from "./UI/AddProduct";
import EditProduct from "./UI/EditProduct";
import { useCurrency } from "../contexts/CurrencyContext";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { convert, format } = useCurrency();

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
    fetchJson(`${BASE}/categories?PageIndex=0&PageSize=100`)
      .then(data => {
        const list = data.categories?.data ?? data.Categories ?? [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  
      fetchJson(`${BASE}/brands?PageIndex=0&PageSize=20`)
      .then(data => {
        const list = data.brands?.data ?? data.Brands ?? data.items ?? [];
        setBrands(Array.isArray(list) ? list : []);
      })
      .catch(() => setBrands([]));
    
  
  }, []);
  


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const { isSuccessful } = await fetchJson(
        `${BASE}/products/${id}`,
        { method: "DELETE" }
      );

      if (isSuccessful) {
        setSuccessMsg("Product deleted successfully!");
        loadProducts();
      } else {
        setSuccessMsg("Product deletion failed.");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Failed to delete product: " + err.message);
    }
  };



  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const brandOptions = brands.map(b => ({ value: b.id, label: b.name }));
  const selectedCategory = categoryOptions.find(o => o.value === filterCat) || null;
  const selectedBrand = brandOptions.find(o => o.value === filterBrd) || null;

  const selectStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
  };

  const loadProducts = async () => {
    const params = new URLSearchParams({
      PageIndex: pageIndex,
      PageSize: PAGE_SIZE,
      ...(filterCat && { CategoryId: filterCat }),
      ...(filterBrd && { BrandId: filterBrd }),
    });
    const url = `${BASE}/products?${params}`;

    try {
      const { products: page } = await fetchJson(url);

      const items = Array.isArray(page?.data)
        ? page.data
        : Array.isArray(page?.items)
          ? page.items
          : [];

      const count = typeof page?.count === 'number'
        ? page.count
        : typeof page?.totalItems === 'number'
          ? page.totalItems
          : items.length;

      setProducts(items);
      setTotalCount(count);
    } catch (err) {
      console.error("Failed loading products:", err);
      setProducts([]);
      setTotalCount(0);
    }
  };


  useEffect(() => {
    loadProducts();
  }, [pageIndex, filterCat, filterBrd]);

  const sortedProducts = React.useMemo(() => {
    return [...safeProducts].sort((a, b) => {
      return sortAsc
        ? a.price - b.price
        : b.price - a.price;
    });
  }, [safeProducts, sortAsc]);

  const handleDeleteConfirmed = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      const { isSuccessful } = await fetchJson(`${BASE}/products/${id}`, { method: "DELETE" });
      if (isSuccessful) {
        setSuccessMsg("Product deleted successfully!");
        loadProducts();
      } else {
        setSuccessMsg("Product deletion failed.");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Failed to delete product: " + err.message);
    }
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

      <EditProduct
        isOpen={showEditModal}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onEdit={() => {
          loadProducts();
          setPageIndex(0);
          setShowEditModal(false);
          setSuccessMsg("Product updated successfully!");
        }}
        onError={msg => setSuccessMsg(msg)}
        onClose={() => setShowEditModal(false)}
      />


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
          <button
            className="mp-btn mp-btn-secondary"
            onClick={() => {
              setSortAsc(sa => !sa);
              setPageIndex(0);
            }}
          >
            Sort: {sortAsc ? 'Low → High' : 'High → Low'}
          </button>
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
            onClick={() => { setFilterCat(""); setFilterBrd(""); setSortAsc(true); setPageIndex(0); }}
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
              {sortedProducts.length > 0 ? sortedProducts.map(p => {
                const cat = categories.find(c => c.id === p.categoryId)?.name;
                const brd = brands.find(b => b.id === p.brandId)?.name;
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{format(convert(p.price))}</td>
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
                        onClick={() => {
                          setEditingProduct(p);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="mp-btn mp-btn-danger"
                        onClick={() => setDeleteTarget(p)}
                      >
                        Delete
                      </button>
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

        {deleteTarget && (
          <div className="review-modal open" onClick={() => setDeleteTarget(null)}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete “{deleteTarget.name}”?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  className="mp-btn mp-btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                >Cancel</button>
                <button
                  className="mp-btn mp-btn-danger"
                  onClick={handleDeleteConfirmed}
                >Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

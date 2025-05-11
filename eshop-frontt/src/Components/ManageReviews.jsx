import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import "../Styles/ManageReviews.css";

const BASE = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterProd, setFilterProd] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const api = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  useEffect(() => {
    api
      .get("/products", {
        params: { pageIndex: 0, pageSize: 1000 }
      })
      .then(res => {
        const list = res.data.products?.data ?? res.data.products?.items ?? [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const loadReviews = () => {
    api
      .get("/admin/reviews", {
        params: {
          pageIndex,
          pageSize: PAGE_SIZE,
          ...(filterProd && { productId: filterProd })
        }
      })
      .then(res => {
        const page = res.data.reviews ?? {};
        const items = Array.isArray(page.data) ? page.data : [];
        const count = typeof page.count === "number" ? page.count : 0;
        setReviews(items);
        setTotalCount(count);
      })
      .catch(err => {
        console.error("Failed loading reviews:", err);
        setReviews([]);
        setTotalCount(0);
      });
  };

  useEffect(() => {
    loadReviews();
  }, [pageIndex, filterProd]);

  const handleDeleteConfirmed = () => {
  api
    .delete(`/products/reviews/${deleteTarget.id}`)
    .then(res => {
      if (res.status === 204) {
        setSuccessMsg("Review deleted successfully!");
        loadReviews();
      } else {
        setSuccessMsg("Failed to delete review.");
      }
    })
    .catch(err => {
      console.error("Error deleting review:", err);
      setSuccessMsg("Failed to delete review.");
    });
  setDeleteTarget(null);
};


  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const productOptions = products.map(p => ({ value: p.id, label: p.name }));
  const selectedProduct = productOptions.find(o => o.value === filterProd) || null;

  return (
    <>
      {successMsg && <div className="mr-success">{successMsg}</div>}

      <div className="mr-container">
        <header className="mr-header">
          <h1>Manage Reviews</h1>
        </header>

        <div className="mr-filters">
          <div className="mr-select-wrapper">
            <Select
              options={productOptions}
              value={selectedProduct}
              onChange={opt => {
                setFilterProd(opt?.value || "");
                setPageIndex(0);
              }}
              placeholder="Filter by Product"
              isClearable
              classNamePrefix="mr-select"
            />
          </div>
          <button
            className="mr-btn mr-btn-secondary"
            onClick={() => {
              setFilterProd("");
              setPageIndex(0);
            }}
          >
            Reset
          </button>
        </div>

        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Product</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map(r => {
                  const prodName =
                    products.find(p => p.id === r.productId)?.name || "–";
                  return (
                    <tr key={r.id}>
                      <td>{r.reviewerUserName}</td>
                      <td>{r.rating}</td>
                      <td>{r.reviewText}</td>
                      <td>{prodName}</td>
                      <td>
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="mr-btn mr-btn-danger"
                          onClick={() => setDeleteTarget(r)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 && (
          <div className="mr-pagination">
            <button
              className="mr-btn mr-btn-secondary"
              onClick={() =>
                setPageIndex(i => Math.max(i - 1, 0))
              }
              disabled={pageIndex === 0}
            >
              ← Prev
            </button>
            <span style={{ margin: "0 12px" }}>
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              className="mr-btn mr-btn-secondary"
              onClick={() =>
                setPageIndex(i => Math.min(i + 1, totalPages - 1))
              }
              disabled={pageIndex + 1 >= totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {deleteTarget && (
          <div
            className="mr-modal open"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="mr-modal-content"
              onClick={e => e.stopPropagation()}
            >
              <h2>Confirm Delete</h2>
              <p>
                Delete review by “{deleteTarget.reviewerUserName}”?
              </p>
              <div className="mr-modal-actions">
                <button
                  className="mr-btn mr-btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  className="mr-btn mr-btn-danger"
                  onClick={handleDeleteConfirmed}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../Styles/Subcategories.css";
import AddSubcategory from "./UI/AddSubcategory";
import EditSubcategory from "./UI/EditSubcategory";

const PAGE_SIZE = 10;

export default function Subcategories() {
  const { categoryId } = useParams();

  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubcategory, setEditSubcategory] = useState(null);
  const [deleteSubcategoryId, setDeleteSubcategoryId] = useState(null);

  // --- single axios instance with baseURL & auth header ---
  const api = axios.create({
    baseURL: "https://localhost:5050",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });

  // load category name
  useEffect(() => {
    if (!categoryId) return;
    setError("");
    api
      .get(`/categories/${categoryId}`)
      .then(res => setCategoryName(res.data.category.name))
      .catch(() => setError("Error loading category name"));
  }, [categoryId]);

  // fetch subcategories
  const fetchSubcategories = () => {
    if (!categoryId) return;
    setLoading(true);
    setError("");

    api
      .get(`/categories/${categoryId}/subcategories`, {
        params: { pageIndex, pageSize: PAGE_SIZE },
      })
      .then(res => {
        const subcats = res.data.subcategories || {};
        setSubcategories(subcats.data || []);
        setTotalCount(subcats.totalCount || 0);
      })
      .catch(() => setError("Error loading subcategories"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSubcategories, [categoryId, pageIndex]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function confirmDeleteSubcategory() {
    if (deleteSubcategoryId == null) return;

    api
      .delete(`/subcategories/${deleteSubcategoryId}`)
      .then(res => {
        console.log("DELETE success:", res.status, res.data);
        // if your handler returns isSuccessful:
        if (res.data.isSuccessful === false) {
          alert("Subcategory was not found or already deleted");
        } else {
          // successful delete
          if (subcategories.length === 1 && pageIndex > 0) {
            setPageIndex(p => p - 1);
          } else {
            fetchSubcategories();
          }
        }
        setDeleteSubcategoryId(null);
      })
      .catch(err => {
        console.error(
          "DELETE /subcategories error:",
          err.response?.status,
          err.response?.data
        );
        alert(
          `Error deleting subcategory: ${
            err.response?.status || ""
          } ${JSON.stringify(err.response?.data) || err.message}`
        );
        setDeleteSubcategoryId(null);
      });
  }

  function handleAddSuccess() {
    setIsAddModalOpen(false);
    fetchSubcategories();
  }

  function handleEditSuccess() {
    setIsEditModalOpen(false);
    setEditSubcategory(null);
    fetchSubcategories();
  }

  return (
    <div className="manage-categories-container">
      <header
        className="manage-categories-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Subcategories for: {categoryName || "Loading..."}</h2>
        <button
          className="manage-categories-btn manage-categories-btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Subcategory
        </button>
      </header>

      {error && (
        <div className="manage-categories-error" style={{ color: "red" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading subcategories...</div>
      ) : subcategories.length === 0 ? (
        <div>No subcategories found.</div>
      ) : (
        <>
          <div className="manage-categories-table-wrap">
            <table className="manage-categories-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map(subcat => (
                  <tr key={subcat.id}>
                    <td>{subcat.name}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="manage-categories-btn manage-categories-btn-secondary me-2"
                        onClick={() => {
                          setEditSubcategory(subcat);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="manage-categories-btn manage-categories-btn-danger"
                        onClick={() => setDeleteSubcategoryId(subcat.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              className="manage-categories-pagination"
              style={{ marginTop: 16 }}
            >
              <button
                className="manage-categories-btn manage-categories-btn-secondary"
                onClick={() =>
                  setPageIndex(p => Math.max(p - 1, 0))
                }
                disabled={pageIndex === 0}
              >
                ← Previous
              </button>
              <span>
                Page {pageIndex + 1} of {totalPages}
              </span>
              <button
                className="manage-categories-btn manage-categories-btn-secondary"
                onClick={() =>
                  setPageIndex(p => Math.min(p + 1, totalPages - 1))
                }
                disabled={pageIndex + 1 === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <AddSubcategory
        isOpen={isAddModalOpen}
        onAdd={handleAddSuccess}
        onError={msg => alert(msg)}
        onClose={() => setIsAddModalOpen(false)}
        categoryId={categoryId}
      />

      {/* Edit Modal */}
      <EditSubcategory
        isOpen={isEditModalOpen}
        subcategory={editSubcategory}
        onSave={handleEditSuccess}
        onError={msg => alert(msg)}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Confirmation */}
      {deleteSubcategoryId != null && (
        <div
          className="review-modal open"
          onClick={() => setDeleteSubcategoryId(null)}
        >
          <div
            className="review-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <h2>Confirm Delete</h2>
            <p>
              Delete “
              {subcategories.find(s => s.id === deleteSubcategoryId)?.name}
              ”?
            </p>
            <div className="form-actions">
              <button
                className="manage-categories-btn manage-categories-btn-secondary"
                onClick={() => setDeleteSubcategoryId(null)}
              >
                Cancel
              </button>
              <button
                className="manage-categories-btn manage-categories-btn-danger"
                onClick={confirmDeleteSubcategory}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubcategory, setEditSubcategory] = useState(null);

  const [deleteSubcategoryId, setDeleteSubcategoryId] = useState(null);


 const token = localStorage.getItem("token");
useEffect(() => {
  console.log("Using token:", token);
}, []);

  const axiosInstance = axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  function handleDeleteClick(id) {
    setDeleteSubcategoryId(id);
  }

function confirmDeleteSubcategory() {
  if (!deleteSubcategoryId) return;

  axiosInstance
    .delete(`https://localhost:5050/subcategories/${deleteSubcategoryId}`)
    .then(() => {
      setDeleteSubcategoryId(null);

      if (subcategories.length === 1 && pageIndex > 0) {
        setPageIndex(pageIndex - 1);
      } else {
        fetchSubcategories();
      }
    })
    .catch(() => alert("Error deleting subcategory"));
}


  useEffect(() => {
    if (!categoryId) return;
    setError(null);

    axiosInstance
      .get(`https://localhost:5050/categories/${categoryId}`)
      .then((res) => setCategoryName(res.data.category.name))
      .catch(() => setError("Error loading category name"));
  }, [categoryId]);

  const fetchSubcategories = () => {
    if (!categoryId) return;

    setLoading(true);
    setError(null);

    axiosInstance
      .get(`https://localhost:5050/categories/${categoryId}/subcategories`, {
        params: { pageIndex, pageSize: PAGE_SIZE },
      })
      .then((res) => {
        const subcats = res.data.subcategories;
        setSubcategories(subcats.data);
        setTotalCount(subcats.totalCount);
      })
      .catch(() => setError("Error loading subcategories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId, pageIndex]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function handlePrev() {
    setPageIndex((p) => Math.max(p - 1, 0));
  }

  function handleNext() {
    setPageIndex((p) => Math.min(p + 1, totalPages - 1));
  }

  function handleAddSubcategory() {
    setIsAddModalOpen(true);
  }

  function handleAddSuccess() {
    setIsAddModalOpen(false);
    fetchSubcategories(); 
  }

  function handleAddError(msg) {
    alert(msg);
  }

  function handleEditClick(subcategory) {
    setEditSubcategory(subcategory);
    setIsEditModalOpen(true);
  }

  function handleEditSuccess() {
    setIsEditModalOpen(false);
    setEditSubcategory(null);
    fetchSubcategories();
  }

  function handleEditError(msg) {
    alert(msg);
  }

  return (
    <div className="manage-categories-container">
      <header
        className="manage-categories-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2>Subcategories for: {categoryName || "Loading..."}</h2>
        <button
          className="manage-categories-btn manage-categories-btn-primary"
          onClick={handleAddSubcategory}
        >
          + Add Subcategory
        </button>
      </header>

      {error && <div className="manage-categories-error" style={{ color: "red" }}>{error}</div>}

      {loading ? (
        <div>Loading subcategories...</div>
      ) : (
        <>
          <div className="manage-categories-table-wrap">
            {subcategories.length === 0 ? (
              <div>No subcategories found.</div>
            ) : (
              <table className="manage-categories-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map((subcat) => (
                    <tr key={subcat.id}>
                      <td>{subcat.name}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="manage-categories-btn manage-categories-btn-secondary me-2"
                          onClick={() => handleEditClick(subcat)}
                        >
                          Edit
                        </button>
                        <button
                          className="manage-categories-btn manage-categories-btn-danger"
                          onClick={() => handleDeleteClick(subcat.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages >= 1 && (
            <div className="manage-categories-pagination" style={{ marginTop: 16 }}>
              <button
                className="manage-categories-btn manage-categories-btn-secondary"
                onClick={handlePrev}
                disabled={pageIndex === 0}
              >
                ← Previous
              </button>
              <span>
                Page {pageIndex + 1} of {totalPages}
              </span>
              <button
                className="manage-categories-btn manage-categories-btn-secondary"
                onClick={handleNext}
                disabled={pageIndex + 1 === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <AddSubcategory
        isOpen={isAddModalOpen}
        onAdd={handleAddSuccess}
        onError={handleAddError}
        onClose={() => setIsAddModalOpen(false)}
        categoryId={categoryId}
      />

      <EditSubcategory
        isOpen={isEditModalOpen}
        subcategory={editSubcategory}
        onSave={handleEditSuccess}
        onError={handleEditError}
        onClose={() => setIsEditModalOpen(false)}
      />

      {deleteSubcategoryId && (
        <div className="review-modal open" onClick={() => setDeleteSubcategoryId(null)}>
          <div className="review-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>Delete “{subcategories.find(s => s.id === deleteSubcategoryId)?.name}”?</p>
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

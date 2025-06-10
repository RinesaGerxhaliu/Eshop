import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCheck } from "react-icons/fa";
import AddCategory from "./UI/AddCategory";
import { useNavigate } from "react-router-dom";
import "../Styles/ManageCategories.css";

const BASE = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function ManageCategories() {
  const [cats, setCats] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const loadCategories = () => {
    api
      .get("/categories", { params: { pageIndex, pageSize: PAGE_SIZE } })
      .then((res) => {
        const page = res.data.categories ?? res.data.Categories ?? {};
        const items = Array.isArray(page.data)
          ? page.data
          : Array.isArray(page.items)
          ? page.items
          : [];
        const count =
          typeof page.count === "number"
            ? page.count
            : typeof page.totalCount === "number"
            ? page.totalCount
            : typeof page.totalItems === "number"
            ? page.totalItems
            : items.length;
        setCats(items);
        setTotalCount(count);
      })
      .catch((err) => {
        console.error(err);
        setCats([]);
        setTotalCount(0);
      });
  };

  useEffect(loadCategories, [pageIndex]);

  const handleAddSuccess = () => {
    setShowAddModal(false);
    setSuccessMsg("Category added successfully!");
    setPageIndex(0);
    loadCategories();
  };

  const handleDelete = (id) => setDeleteTarget(id);
  const confirmDelete = () => {
    api
      .delete(`/categories/${deleteTarget}`)
      .then((res) => {
        setSuccessMsg(
          res.status === 200
            ? "Category deleted successfully!"
            : "Deletion failed."
        );
        loadCategories();
      })
      .catch((err) => {
        console.error(err);
        setSuccessMsg("Error: " + err.message);
      })
      .finally(() => setDeleteTarget(null));
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };
  const saveEdit = () => {
    api
      .put(`/categories/${editingId}`, { name: editingName })
      .then((res) => {
        setSuccessMsg(
          res.status === 200 ? "Category updated!" : "Update failed."
        );
        loadCategories();
        setEditingId(null);
      })
      .catch((err) => {
        console.error(err);
        setSuccessMsg("Error: " + err.message);
      });
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const isAdmin = roles.map((r) => r.toLowerCase()).includes("admin");

  return (
    <>
      <AddCategory
        isOpen={showAddModal}
        onAdd={handleAddSuccess}
        onError={(msg) => setSuccessMsg(msg)}
        onClose={() => setShowAddModal(false)}
      />

      {successMsg && (
        <div className="manage-categories-success">{successMsg}</div>
      )}

      <div className="manage-categories-container">
        <header className="manage-categories-header">
          <h1>Manage Categories</h1>
          <button
            className="manage-categories-btn manage-categories-btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add Category
          </button>
        </header>

        <div className="manage-categories-table-wrap">
          <table className="manage-categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Products Count</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cats.length ? (
                cats.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {editingId === c.id ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          autoFocus
                        />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td>
                      {typeof c.productCount === "number"
                        ? c.productCount
                        : "–"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {isAdmin &&
                        (editingId === c.id ? (
                          <button
                            className="manage-categories-btn manage-categories-btn-action"
                            onClick={saveEdit}
                          >
                            <FaCheck />
                          </button>
                        ) : (
                          <button
                            className="manage-categories-btn manage-categories-btn-secondary"
                            onClick={() => handleEdit(c.id, c.name)}
                          >
                            <FaEdit />
                          </button>
                        ))}
                      {isAdmin && (
                        <button
                          className="manage-categories-btn manage-categories-btn-danger"
                          onClick={() => handleDelete(c.id)}
                          style={{ marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      )}
                      <button
                        className="manage-categories-btn manage-categories-btn-action"
                        style={{ marginLeft: 8 }}
                        onClick={() =>
                           navigate(`/admin-dashboard/categories/${c.id}/subcategories`)
                        }
                      >
                        View Subcategories
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: 20 }}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="manage-categories-pagination">
            <button
              className="manage-categories-btn manage-categories-btn-secondary"
              onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
              disabled={!pageIndex}
            >
              ← Prev
            </button>
            <span>
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              className="manage-categories-btn manage-categories-btn-secondary"
              onClick={() =>
                setPageIndex((i) => Math.min(i + 1, totalPages - 1))
              }
              disabled={pageIndex + 1 >= totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {deleteTarget !== null && (
          <div
            className="review-modal open"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="review-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Confirm Delete</h2>
              <p>Delete “{cats.find((c) => c.id === deleteTarget)?.name}”?</p>
              <div className="form-actions">
                <button
                  type="button"
                  className="manage-categories-btn manage-categories-btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="manage-categories-btn manage-categories-btn-danger"
                  onClick={confirmDelete}
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

import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import AddBrand from "./UI/AddBrand";
import "../Styles/ManageBrands.css";
import { FaEdit, FaCheck } from "react-icons/fa";

const BASE = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function ManageBrands() {
  const [brands, setBrands] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const api = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const loadBrands = () => {
    api
      .get("/brands", {
        params: {
          pageIndex,
          pageSize: PAGE_SIZE,
        },
      })
      .then((res) => {
        const items = Array.isArray(res.data.brands?.data)
          ? res.data.brands.data
          : res.data.brands ?? [];
        const count =
          typeof res.data.count === "number" ? res.data.count : items.length;
        setBrands(items);
        setTotalCount(count);
      })
      .catch((err) => {
        console.error("Failed loading brands:", err);
        setBrands([]);
        setTotalCount(0);
      });
  };

  useEffect(() => {
    loadBrands();
  }, [pageIndex]);

  const handleDeleteConfirmed = async () => {
    const id = deleteTarget.id;
    setDeleteTarget(null);
    try {
      const res = await api.delete(`/brands/${id}`);
      if (res.status === 200) {
        setSuccessMsg("Brand deleted successfully!");
        loadBrands();
      } else {
        setSuccessMsg("Brand deletion failed.");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Failed to delete brand: " + err.message);
    }
  };

  const handleEdit = (id, currentName) => {
    setEditingId(id); 
    setEditingName(currentName); 
  };

  const handleUpdateBrand = async () => {
    if (!editingName.trim()) return; 

    try {
      const response = await api.put(`/brands/${editingId}`, { name: editingName });

      if (response.status === 200) {
        setSuccessMsg("Brand updated successfully!");
        setEditingId(null);
        loadBrands(); 
      } else {
        setSuccessMsg("Failed to update brand.");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      setSuccessMsg("Failed to update brand: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }));




  return (
    <>
      <AddBrand
        isOpen={showAddModal}
        onAdd={() => {
          setPageIndex(0);
          setShowAddModal(false);
          setSuccessMsg("Brand added successfully!");
        }}
        onError={(msg) => setSuccessMsg(msg)}
        onClose={() => setShowAddModal(false)}
      />

      {successMsg && <div className="mr-success">{successMsg}</div>}

      <div className="mr-container">
        <header className="mr-header">
          <h1>Manage Brands</h1>
          <button
            className="mp-btn mp-btn-primaryy"
            onClick={() => setShowAddModal(true)}
          >
            + Add Brand
          </button>
        </header>
        <div className="mr-table-wrap">
          <table className="mr-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
                 {brands.length > 0 ? (
                brands.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {editingId === b.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateBrand(); 
                          }}
                          autoFocus
                        />
                      ) : (
                        b.name 
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {editingId === b.id ? (
                        <button
                          className="mp-btn mp-btn-success"
                          onClick={handleUpdateBrand}
                        >
                          <FaCheck />
                        </button>
                      ) : (
                        <button
                          className="mp-btn mp-btn-secondary"
                          onClick={() => handleEdit(b.id, b.name)} 
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        className="mp-btn mp-btn-danger"
                        onClick={() => setDeleteTarget(b)}
                        style={{ marginLeft: "8px" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    No brands found.
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
              onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
              disabled={pageIndex === 0}
            >
              ← Prev
            </button>
            <span style={{ margin: "0 12px" }}>
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              className="mr-btn mr-btn-secondary"
              onClick={() => setPageIndex((i) => Math.min(i + 1, totalPages - 1))}
              disabled={pageIndex + 1 >= totalPages}
            >
              Next →
            </button>
          </div>
        )}

        {deleteTarget && (
          <div
            className="review-modal open"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              className="review-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete “{deleteTarget.name}”?</p>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
              >
                <button
                  className="mp-btn mp-btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </button>
                <button
                  className="mp-btn mp-btn-danger"
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

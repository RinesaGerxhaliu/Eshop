import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCheck, FaTrash, FaPlus } from "react-icons/fa";
import "../Styles/ShippingMethod.css";
import AddShippingMethod from "./UI/AddShippingMethod"; 
const BASE = "https://localhost:5050";
const PAGE_SIZE = 8;

export default function ShippingMethod() {
  const [methods, setMethods] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCost, setEditingCost] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false); 

  const api = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    loadShippingMethods();
  }, [pageIndex]);

  useEffect(() => {
    if (!successMsg && !errorMsg) return;
    const t = setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 4000);
    return () => clearTimeout(t);
  }, [successMsg, errorMsg]);

  const loadShippingMethods = () => {
    api
      .get("/shipping-methods", {
        params: {
          pageIndex,
          pageSize: PAGE_SIZE,
        },
      })
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const count = res.data?.count ?? data.length;
        setMethods(data);
        setTotalCount(count);
      })
      .catch((err) => {
        console.error("Failed loading shipping methods:", err);
        setErrorMsg("Error loading shipping methods.");
        setMethods([]);
      });
  };

    const handleDeleteConfirmed = async () => {
  const id = deleteTarget.id;
  setDeleteTarget(null);
  try {
    const res = await api.delete(`/shipping-methods/${id}`);
    if (res.status === 200 || res.status === 204) {
      setSuccessMsg("Shipping method deleted successfully!");
      
      setMethods((prev) => prev.filter(m => m.id !== id));
      
    } else {
      setErrorMsg("Shipping method deletion failed.");
    }
  } catch (err) {
    console.error(err);
    setErrorMsg("Failed to delete shipping method: " + err.message);
  }
};


  const handleEdit = (id, name, cost) => {
    setEditingId(id);
    setEditingName(name);
    setEditingCost(cost.toString());
  };

  const handleUpdateMethod = async () => {
    if (!editingName.trim() || isNaN(editingCost) || editingCost < 0) return;

    try {
      const res = await api.put(`/shipping-methods/${editingId}`, {
        name: editingName,
        cost: parseFloat(editingCost),
      });

      if (res.status === 200) {
        setSuccessMsg("Shipping method updated successfully!");
        setEditingId(null);
        loadShippingMethods();
      } else {
        setErrorMsg("Update failed.");
      }
    } catch (error) {
      setErrorMsg("Update failed: " + error.message);
    }
  };

  

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="mr-container">
      <header className="mr-header">
        <h1>Manage Shipping Methods</h1>
        <button className="mp-btn mp-btn-primaryy" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add
        </button>
      </header>

      {(successMsg || errorMsg) && (
        <div className={`mr-success ${errorMsg ? "mr-error" : ""}`}>
          {successMsg || errorMsg}
        </div>
      )}

      <div className="mr-table-wrap">
        <table className="mr-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {methods.length > 0 ? (
              methods.map((m) => (
                <tr key={m.id}>
                  <td>
                    {editingId === m.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateMethod()}
                      />
                    ) : (
                      m.name
                    )}
                  </td>
                  <td>
                    {editingId === m.id ? (
                      <input
                        type="number"
                        value={editingCost}
                        onChange={(e) => setEditingCost(e.target.value)}
                      />
                    ) : (
                      m.cost.toFixed(2) + " €"
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {editingId === m.id ? (
                      <button
                        className="mp-btn mp-btn-success"
                        onClick={handleUpdateMethod}
                      >
                        <FaCheck />
                      </button>
                    ) : (
                      <button
                        className="mp-btn mp-btn-secondary"
                        onClick={() => handleEdit(m.id, m.name, m.cost)}
                      >
                        <FaEdit />
                      </button>
                    )}
                       <button
                        className="mp-btn mp-btn-danger"
                        onClick={() => setDeleteTarget(m)}
                        style={{ marginLeft: "8px" }}
                      >
                        Delete
                      </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No shipping methods found.
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
            disabled={pageIndex === totalPages - 1}
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

      {/* Add Modal */}
      <AddShippingMethod
        isOpen={showAddModal}
        onAdd={() => {
          setSuccessMsg("Shipping method added!");
          setShowAddModal(false);
          setPageIndex(0);
          loadShippingMethods();
        }}
        onClose={() => setShowAddModal(false)}
        onError={(msg) => setErrorMsg(msg)}
      />
    </div>
  );
}

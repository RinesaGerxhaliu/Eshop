import React, { useEffect, useState } from "react";
import "../../Styles/AddBrand.css"; // contains your .review-modal, .form-actions, etc.

const BASE = "https://localhost:5050";

export default function AddCategory({ isOpen, onAdd, onError, onClose }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) return onError("Name is required");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      onAdd();
    } catch (err) {
      console.error(err);
      onError("Failed to create category: " + err.message);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="review-modal open" onClick={onClose}>
      <div className="review-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Category</h2>
        </div>
        <form className="add-brand-form" onSubmit={handleSubmit}>
          <label>Category Name *</label>
          <input
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <div className="form-actions">
            <button type="button"  onClick={onClose}>
              Cancel
            </button>
            <button type="submit" >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

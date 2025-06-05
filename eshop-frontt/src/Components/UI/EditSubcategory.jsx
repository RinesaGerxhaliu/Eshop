import React, { useState, useEffect } from "react";

const BASE = "https://localhost:5050";

export default function EditSubcategory({ isOpen, subcategory, onSave, onError, onClose }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen && subcategory) {
      setName(subcategory.name || "");
    }
  }, [isOpen, subcategory]);

  if (!isOpen) return null;

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!name.trim()) return onError("Name is required");

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE}/subcategories`, { // pa id në URL
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subcategory: {
          id: subcategory.id,          // dërgo id
          name,                        // emrin e ri
          categoryId: subcategory.categoryId,
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    onSave();
  } catch (err) {
    console.error(err);
    onError("Failed to update subcategory: " + err.message);
  }
};


  return (
    <div className="review-modal open" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Subcategory</h2>
        </div>
        <form className="add-brand-form" onSubmit={handleSubmit}>
          <label>Subcategory Name *</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="form-actions">
            <button type="button" className="mp-btn mp-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="mp-btn mp-btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

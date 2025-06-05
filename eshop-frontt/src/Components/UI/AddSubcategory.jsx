import React, { useEffect, useState } from "react";
import "../../Styles/AddBrand.css";

const BASE = "https://localhost:5050";

export default function AddSubcategory({ isOpen, onAdd, onError, onClose }) {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

 useEffect(() => {
  if (isOpen) {
    setName("");
    setSelectedCategoryId("");
    fetch(`${BASE}/categories?pageIndex=0&pageSize=8`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories?.data || []);
        if (data.categories?.data.length > 0) {
          setSelectedCategoryId(data.categories.data[0].id);
        }
      })
      .catch(() => onError("Failed to load categories"));
  }
}, [isOpen, onError]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return onError("Name is required");
    if (!selectedCategoryId) return onError("Please select a category");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE}/subcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subcategory: {
            name,
            categoryId: selectedCategoryId,
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      onAdd();
    } catch (err) {
      console.error(err);
      onError("Failed to create subcategory: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal open" onClick={onClose}>
      <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Subcategory</h2>
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

          <label>Category *</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

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

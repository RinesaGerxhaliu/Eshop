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
      const res = await fetch(`${BASE}/subcategories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subcategory: {
            id: subcategory.id,
            name,
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Subcategory</h2>
        <form onSubmit={handleSubmit} className="edit-subcategory-form">
          <label htmlFor="name">Subcategory Name *</label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            placeholder="Enter subcategory name"
          />

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #fff;
          padding: 24px 32px;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
          width: 400px;
          max-width: 90%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        h2 {
          margin-bottom: 20px;
          font-weight: 600;
          color: #333;
          text-align: center;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }

        input {
          width: 100%;
          padding: 10px 14px;
          font-size: 1rem;
          border: 1.8px solid #ccc;
          border-radius: 8px;
          outline-offset: 2px;
          transition: border-color 0.2s ease;
        }

      

        .form-actions {
          margin-top: 28px;
          display: flex;
          justify-content: flex-end;
          gap: 16px;
        }

        .btn {
          padding: 10px 20px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
         
        }

        .btn-primary:hover {
          background-color: #2563eb;
         
        }

        .btn-secondary {
          background-color: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}

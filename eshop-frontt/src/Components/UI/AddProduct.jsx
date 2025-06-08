import React, { useEffect, useState } from "react";
import "../../Styles/AddProduct.css";

const BASE = "https://localhost:5050";

// Utility për headers me autorizim
const authHeaders = (isJson = true) => {
  const token = localStorage.getItem("token");
  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export default function AddProduct({
  isOpen,
  categories = [],
  brands = [],
  onAdd,
  onClose,
  onError,
}) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [subcategoriesError, setSubcategoriesError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        price: "",
        description: "",
        categoryId: "",
        subcategoryId: "",
        brandId: "",
      });
      setImageFile(null);
      setPreviewUrl("");
      setSubcategories([]);
      setLoadingSubcategories(false);
      setSubcategoriesError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (form.categoryId) {
      setLoadingSubcategories(true);
      setSubcategoriesError(null);
      setSubcategories([]);
      setForm((f) => ({ ...f, subcategoryId: "" }));

      fetch(`${BASE}/categories/${form.categoryId}/subcategories`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load subcategories");
          return res.json();
        })
        .then((data) => {
          setSubcategories(data.subcategories?.data || []);
          setLoadingSubcategories(false);
        })
        .catch((err) => {
          console.error(err);
          setSubcategoriesError("Error loading subcategories");
          setLoadingSubcategories(false);
        });
    } else {
      setSubcategories([]);
      setForm((f) => ({ ...f, subcategoryId: "" }));
    }
  }, [form.categoryId]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "price") {
      value = value.replace(",", ".");
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return onError("Please select a valid image file (jpg, png, etc.)");
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.categoryId || !form.brandId) {
      return onError("Name, price, category & brand are required");
    }

    try {
      // 1. Krijo produktin
      const createRes = await fetch(`${BASE}/products`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          product: {
            name: form.name,
            price: parseFloat(form.price),
            description: form.description || null,
            categoryId: form.categoryId || null,
            subcategoryId: form.subcategoryId || null,
            brandId: form.brandId || null,
          },
        }),
      });

      if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(text);
      }

      const { id: newProductId } = await createRes.json();

      // 2. Upload-i i imazhit (nëse ka)
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const imgRes = await fetch(`${BASE}/products/${newProductId}/image`, {
          method: "POST",
          headers: authHeaders(false),
          body: fd,
        });

        if (!imgRes.ok) {
          console.warn("Image upload failed:", await imgRes.text());
        }
      }

      onAdd();
      onClose();
    } catch (err) {
      console.error(err);
      onError(`Failed to create product: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal open" onClick={onClose}>
      <div
        className="review-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Add New Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="upload-container">
            <label htmlFor="imageUpload" className="upload-button">
              {imageFile ? "Change Image" : "Upload Image"}
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="upload-input"
            />
            {previewUrl && (
              <div className="preview-wrapper">
                <img src={previewUrl} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>

          <div>
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Price *</label>
            <input
              name="price"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 19.99 or 19,99"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Category *</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {form.categoryId && subcategories.length > 0 && (
            <div>
              <label>Subcategory</label>
              <select
                name="subcategoryId"
                value={form.subcategoryId}
                onChange={handleChange}
                disabled={loadingSubcategories || !!subcategoriesError}
              >
                {loadingSubcategories && (
                  <option value="">Loading subcategories...</option>
                )}
                {subcategoriesError && (
                  <option value="">{subcategoriesError}</option>
                )}
                {!loadingSubcategories && !subcategoriesError && (
                  <>
                    <option value="">Select a subcategory</option>
                    {subcategories.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          )}

          <div>
            <label>Brand *</label>
            <select
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Brand --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

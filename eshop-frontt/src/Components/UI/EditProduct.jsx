// src/Components/UI/EditProduct.jsx
import React, { useEffect, useState } from 'react';
import '../../Styles/AddProduct.css';

const BASE = "https://localhost:5050";

export default function EditProduct({
    isOpen,
    product = null,          // the product object to edit, or null
    categories = [],
    brands = [],
    onEdit,                  // callback after successful edit
    onClose,
    onError,
}) {
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        categoryId: '',
        brandId: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // When modal opens or product changes, populate the form
    useEffect(() => {
        if (isOpen && product) {
            setForm({
                name: product.name || '',
                price: product.price?.toString() || '',
                description: product.description || '',
                categoryId: product.categoryId || '',
                brandId: product.brandId || '',
            });
            setPreviewUrl(
                product.imageUrl
                    ? `${BASE}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`
                    : ''
            );
            // if your API returns an image URL
            setImageFile(null);
        }
    }, [isOpen, product]);

    const handleChange = e => {
        let { name, value } = e.target;
        if (name === 'price') {
            // allow comma as decimal sep:
            value = value.replace(',', '.');
        }
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            return alert('Please select a valid image file (jpg, png, etc.)');
        }
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        // basic validation
        if (!form.name || !form.price || !form.categoryId || !form.brandId) {
            return onError('Name, price, category & brand are required');
        }

        try {
            // 1) Update product fields
            const updateRes = await fetch(`${BASE}/products`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Product: {
                        Id: product.id,
                        Name: form.name,
                        Price: parseFloat(form.price),
                        Description: form.description || null,
                        CategoryId: form.categoryId,
                        BrandId: form.brandId
                    }
                })

            });
            if (!updateRes.ok) {
                const text = await updateRes.text();
                throw new Error(text);
            }

            // 2) If user selected a new image, upload it
            if (imageFile) {
                const fd = new FormData();
                fd.append("file", imageFile);
                const imgRes = await fetch(
                    `${BASE}/products/${product.id}/image`,
                    { method: "POST", body: fd }
                );
                if (!imgRes.ok) {
                    console.warn("Image upload failed:", await imgRes.text());
                }
            }

            onEdit();    // inform parent
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to update product: " + err.message);
        }
    };

    if (!isOpen || !product) return null;



    return (
        <div className="review-modal open" onClick={onClose}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Product</h2>
                </div>

                <form onSubmit={handleSubmit} className="add-product-form">
                    {/* IMAGE UPLOAD */}
                    <div className="upload-container">
                        <label htmlFor="imageUpload" className="upload-button">
                            {imageFile ? 'Change Image' : previewUrl ? 'Replace Image' : 'Upload Image'}
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
                                <img
                                    src={
                                        // allow absolute API URLs (http/https) or blob URLs
                                        previewUrl.startsWith('http') ||
                                            previewUrl.startsWith('blob:')
                                            ? previewUrl
                                            : `${BASE}${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`
                                    }
                                    alt="Preview"
                                    className="preview-image"
                                />
                            </div>
                        )}
                    </div>

                    {/* OTHER FIELDS */}
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
                            <option value="">-- None --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Brand *</label>
                        <select
                            name="brandId"
                            value={form.brandId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- None --</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="form-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

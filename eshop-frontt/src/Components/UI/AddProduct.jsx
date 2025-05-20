import React, { useEffect, useState } from 'react';
import '../../Styles/AddProduct.css';

const BASE = "https://localhost:5050";

export default function AddProduct({
    isOpen,
    categories = [],
    brands = [],
    onAdd,
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

    useEffect(() => {
        if (isOpen) {
            setForm({
                name: '',
                price: '',
                description: '',
                categoryId: '',
                brandId: ''
            });
            setImageFile(null);
            setPreviewUrl('');
        }
    }, [isOpen]);

    const handleChange = e => {
        let { name, value } = e.target;
        if (name === 'price') {
            value = value.replace(',', '.');
        }
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleFileChange = e => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return onError('Please select a valid image file (jpg, png, etc.)');
        }

        setImageFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.price || !form.categoryId || !form.brandId) {
            return onError('Name, price, category & brand are required');
        }

        try {
            const createRes = await fetch(`${BASE}/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product: {
                        name: form.name,
                        price: parseFloat(form.price),
                        description: form.description || null,
                        categoryId: form.categoryId || null,
                        brandId: form.brandId || null
                    }
                })
            });
            if (!createRes.ok) {
                const text = await createRes.text();
                throw new Error(text);
            }
            const { id: newProductId } = await createRes.json();

            if (imageFile) {
                const fd = new FormData();
                fd.append("file", imageFile);
                const imgRes = await fetch(
                    `${BASE}/products/${newProductId}/image`,
                    { method: "POST", body: fd }
                );
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
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Product</h2>
                </div>


                <form onSubmit={handleSubmit} className="add-product-form">
                    {/* IMAGE UPLOAD */}
                    <div className="upload-container">
                        <label htmlFor="imageUpload" className="upload-button">
                            {imageFile ? 'Change Image' : 'Upload Image'}
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
                                    src={previewUrl}
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
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

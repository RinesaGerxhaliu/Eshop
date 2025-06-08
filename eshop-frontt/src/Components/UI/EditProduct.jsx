import React, { useEffect, useState } from 'react';
import '../../Styles/AddProduct.css';
import { useCurrency } from "../../contexts/CurrencyContext";

const BASE = "https://localhost:5050";
const token = localStorage.getItem("token"); 

export default function EditProduct({
    isOpen,
    product = null,
    categories = [],
    brands = [],
    onEdit,
    onClose,
    onError,
}) {
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        categoryId: '',
        subcategoryId: '',
        brandId: '',
    });
    const [subcategories, setSubcategories] = useState([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [subcategoriesError, setSubcategoriesError] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const { convert, format } = useCurrency();

    useEffect(() => {
        if (isOpen && product) {
            setForm({
                name: product.name || '',
                price: product.price != null ? format(convert(product.price)) : '',
                description: product.description || '',
                categoryId: product.categoryId || '',
                subcategoryId: product.subcategoryId || '',
                brandId: product.brandId || '',
            });
            setPreviewUrl(
                product.imageUrl
                    ? `${BASE}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`
                    : ''
            );
            setImageFile(null);
        }
    }, [isOpen, product, convert, format]);

    useEffect(() => {
        if (form.categoryId) {
            setLoadingSubcategories(true);
            setSubcategoriesError(null);
            fetch(`${BASE}/categories/${form.categoryId}/subcategories`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load subcategories');
                    return res.json();
                })
                .then(data => {
                    const subs = data.subcategories?.data || [];
                    setSubcategories(subs);
                    setLoadingSubcategories(false);

                    if (
                        form.subcategoryId &&
                        !subs.some(sc => sc.id === form.subcategoryId)
                    ) {
                        setForm(f => ({ ...f, subcategoryId: '' }));
                    }
                })
                .catch(err => {
                    console.error(err);
                    setSubcategoriesError('Error loading subcategories');
                    setLoadingSubcategories(false);
                });
        } else {
            setSubcategories([]);
            setForm(f => ({ ...f, subcategoryId: '' }));
        }
    }, [form.categoryId]);

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
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!form.name || !form.price || !form.categoryId || !form.brandId) {
            return onError('Name, price, category & brand are required');
        }
        if (subcategories.length > 0 && !form.subcategoryId) {
            return onError('Please select a subcategory');
        }

        try {
            let raw = form.price
                .replace(/[^0-9\.,]/g, '')
                .replace(',', '.');
            const conversionRate = convert(1);
            const basePrice = parseFloat(raw) / conversionRate;

           const updateRes = await fetch(`${BASE}/products`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
        Product: {
            Id: product.id,
            Name: form.name,
            Price: basePrice,
            Description: form.description || null,
            CategoryId: form.categoryId,
            SubcategoryId: form.subcategoryId || null,
            BrandId: form.brandId,
        }
    })
});

      
            if (!updateRes.ok) {
                const text = await updateRes.text();
                throw new Error(text);
            }

           if (imageFile) {
    const fd = new FormData();
    fd.append("file", imageFile);

    const imgRes = await fetch(`${BASE}/products/${product.id}/image`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: fd
    });

    if (!imgRes.ok) {
        console.warn("Image upload failed:", await imgRes.text());
    }
}


            onEdit();
            onClose();
        } catch (err) {
            console.error(err);
            onError(`Failed to update product: ${err.message}`);
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
                            placeholder={format(convert(1)).replace(/\d/g, '') + '0.00'}
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
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {form.categoryId && subcategories.length > 0 && (
                        <div>
                            <label>Subcategory *</label>
                            <select
                                name="subcategoryId"
                                value={form.subcategoryId}
                                onChange={handleChange}
                                required={subcategories.length > 0}
                                disabled={loadingSubcategories || !!subcategoriesError}
                            >
                                {loadingSubcategories && <option value="">Loading subcategories...</option>}
                                {subcategoriesError && <option value="">{subcategoriesError}</option>}
                                {!loadingSubcategories && !subcategoriesError && (
                                    <>
                                        <option value="">Select a subcategory</option>
                                        {subcategories.map(sc => (
                                            <option key={sc.id} value={sc.id}>{sc.name}</option>
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
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import '../../Styles/AddBrand.css'; 

const BASE = "https://localhost:5050";

export default function AddBrand({ isOpen, onAdd, onClose, onError }) {
    const [form, setForm] = useState({ name: '' });

    useEffect(() => {
        if (isOpen) {
            setForm({ name: '' });
        }
    }, [isOpen]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name) {
            return onError('Name is required');
        }

        try {
            const token = localStorage.getItem("token"); // Adjust based on where you store the JWT

            const res = await fetch(`${BASE}/brands`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: form.name })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            onAdd();
            onClose();
        } catch (err) {
            console.error(err);
            onError(`Failed to create brand: ${err.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal open" onClick={onClose}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Brand</h2>
                </div>

                <form onSubmit={handleSubmit} className="add-brand-form">
                    <div>
                        <label>Brand Name *</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import '../../Styles/AddShippingMethod.css'; 

const BASE = "https://localhost:5050";

export default function AddShippingMethod({ isOpen, onAdd, onClose, onError }) {
    const [form, setForm] = useState({ name: '', cost: '' });

    useEffect(() => {
        if (isOpen) {
            setForm({ name: '', cost: '' });
        }
    }, [isOpen]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!form.name || form.cost === '') {
            return onError('Name and cost are required');
        }

        const cost = parseFloat(form.cost);
        if (isNaN(cost) || cost < 0) {
            return onError('Cost must be a valid non-negative number');
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE}/shipping-methods`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    shippingMethod: {
                        name: form.name,
                        cost: cost
                    }
                })
            });

            if (res.status === 403) {
                return onError('You are not authorized to perform this action');
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            onAdd();
            onClose();
        } catch (err) {
            console.error(err);
            onError(`Failed to create shipping method: ${err.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="review-modal open" onClick={onClose}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Shipping Method</h2>
                </div>

                <form onSubmit={handleSubmit} className="add-shippingmethod-form">
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
                        <label>Cost *</label>
                        <input
                            name="cost"
                            type="number"
                            step="0.01"
                            value={form.cost}
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

import React, { useState } from "react";

function EditAddressForm({ address, token, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    street: address.street,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phoneNumber: address.phoneNumber,
    isDefault: address.isDefault,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      savedAddress: {
        id: address.id,
        customerId: address.customerId,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phoneNumber: formData.phoneNumber,
        },
        isDefault: formData.isDefault,
      },
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://localhost:5050/saved-addresses/${address.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update address");
      }
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Edit Address</h3>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.gridContainer}>
        <input
          type="text"
          name="street"
          placeholder="Street"
          value={formData.street}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="postalCode"
          placeholder="Postal Code"
          value={formData.postalCode}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>

      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          style={styles.checkbox}
        />
        Set as default address
      </label>

      <div style={styles.buttonContainer}>
      <button
  type="submit"
  disabled={loading}
  style={{
    ...styles.button,
    backgroundColor: loading ? "#f8b7cd" : "#fce4ec",
    color: "#d63384", 
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: "0 0 8px rgba(245, 120, 180, 0.5)", 
  }}
  onMouseEnter={(e) => {
    if (!loading) e.currentTarget.style.backgroundColor = "#f8b7cd"; 
  }}
  onMouseLeave={(e) => {
    if (!loading) e.currentTarget.style.backgroundColor = "#fce4ec"; 
  }}
>
  {loading ? "Saving..." : "Save Changes"}
</button>

<button
  type="button"
  onClick={onCancel}
  style={{
    ...styles.button,
    backgroundColor: "#fce4ec",
    color: "#b83280", 
    boxShadow: "0 0 8px rgba(245, 120, 180, 0.4)",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8b7cd")} 
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fce4ec")} 
>
  Cancel
</button>

      </div>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: "500px",
    margin: "2rem auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "12px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 12px rgba(175, 105, 155, 0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    marginBottom: "1rem",
    textAlign: "center",
    color: "#333",
  },
  error: {
    color: "#ff4d4f",
    backgroundColor: "#fff1f0",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "1rem",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px 24px",
    marginBottom: "2rem",
    backgroundColor: "#eaeaea",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "inset 0 0 10px #d3d3d3",
    width: "100%",
    boxSizing: "border-box",
  },
  input: {
    padding: "12px 14px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1.5px solid #ccc",
    outline: "none",
    backgroundColor: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    fontWeight: "500",
    width: "100%",
    boxSizing: "border-box",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    color: "#333",
    marginTop: "1rem",
  },
  checkbox: {
    width: "16px",
    height: "16px",
  },
  buttonContainer: {
    marginTop: "1.5rem",
    display: "flex",
    gap: "0.5rem",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "700",
    transition: "background-color 0.3s ease",
    flex: 1,
  },
};

export default EditAddressForm;

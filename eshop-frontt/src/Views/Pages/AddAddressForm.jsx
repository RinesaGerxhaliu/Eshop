import React, { useState } from "react";

function AddAddressForm({ customerId, token, onSuccess, onCancel }) {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAddress = {
      savedAddress: {
        customerId,
        address: {
          street,
          city,
          state,
          postalCode,
          country,
          phoneNumber,
        },
        isDefault,
      },
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://localhost:5050/saved-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      onSuccess(); // Notify parent to refresh addresses or UI
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={styles.form}
    >
      {error && (
        <p style={styles.error}>{error}</p>
      )}

      <div style={styles.gridContainer}>
        <input
          type="text"
          placeholder="Street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <label style={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
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
            backgroundColor: loading ? "#d6f5e9" : "#a3e4d7",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#065f46",
            boxShadow: "0 0 8px #a3e4d7aa",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#6ee7b7";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#a3e4d7";
          }}
        >
          {loading ? "Saving..." : "Save Address"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            ...styles.button,
            backgroundColor: "#f9d5d3",
            color: "#9b2c2c",
            boxShadow: "0 0 8px #f9d5d3aa",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9d5d3")}
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

export default AddAddressForm;

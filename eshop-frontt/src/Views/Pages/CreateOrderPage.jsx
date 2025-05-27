import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/CreateOrderPage.css";

const CreateOrderPage = () => {
  const { refreshAccessToken } = useAuth();
  const [orderName, setOrderName] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: ""
  });
  const [items, setItems] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  };

  // Merr produktet ne basket per user
  useEffect(() => {
    (async () => {
      const username = localStorage.getItem("username");
      let token = localStorage.getItem("token");
      const resp = await fetch(`https://localhost:5050/basket/${username}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setItems(
          data.shoppingCart.items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity
          }))
        );
      }
    })();
  }, []);
  
  useEffect(() => {
    (async () => {
      const resp = await fetch("https://localhost:5050/shipping-methods");
      if (resp.ok) {
        const list = await resp.json();
        setShippingMethods(list);
      } else {
        console.error("Failed to fetch shipping methods", resp.statusText);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      const resp = await fetch("https://localhost:5050/saved-addresses/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.address && data.address.address) {
          setAddress(data.address.address);
        }
      } else {
        console.warn("No saved address found or failed to fetch.");
      }
    })();
  }, []);

  const handleAddressChange = e => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    let token = localStorage.getItem("token");
    const decoded = parseJwt(token);
    const customerId =
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub;

    const payload = {
      order: {
        customerId,
        orderName,
        items,
        shippingMethodId,
        shippingAddress: address
      }
    };

    let resp = await fetch("https://localhost:5050/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (resp.status === 401) {
      token = await refreshAccessToken();
      if (!token) return navigate("/login");
      resp = await fetch("https://localhost:5050/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }

    if (resp.ok) {
      const { id } = await resp.json();
      navigate(`/orders/${id}`);
    } else {
      const errText = await resp.text();
      setError(errText);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header" style={{ backgroundColor: '#e83e8c', color: '#fff' }}>
          <h3 className="mb-0">Create New Order</h3>
        </div>
        <div className="card-body" style={{ backgroundColor: '#fff0f5' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Order Summary */}
          {items.length > 0 && (
            <ul className="list-group mb-4">
              {items.map((i, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between">
                  <span>{i.productName || i.productId}</span>
                  <span>Qty: {i.quantity}</span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ color: '#8b005d' }}>Order Name</label>
              <input
                type="text"
                className="form-control"
                value={orderName}
                onChange={e => setOrderName(e.target.value)}
                required
                style={{ borderRadius: '0.75rem' }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ color: '#8b005d' }}>Shipping Method</label>
              <select
                className="form-select"
                value={shippingMethodId}
                onChange={e => setShippingMethodId(e.target.value)}
                required
                style={{ borderRadius: '0.75rem' }}
              >
                <option value="">Select method</option>
                {shippingMethods.map(sm => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name} (€{sm.cost})
                  </option>
                ))}
              </select>
            </div>

            <h5 className="mt-4">Shipping Address</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" style={{ color: '#8b005d' }}>Street</label>
                <input
                  name="street"
                  className="form-control"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" style={{ color: '#8b005d' }}>City</label>
                <input
                  name="city"
                  className="form-control"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ color: '#8b005d' }}>State</label>
                <input
                  name="state"
                  className="form-control"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ color: '#8b005d' }}>Postal Code</label>
                <input
                  name="postalCode"
                  className="form-control"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  required
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" style={{ color: '#8b005d' }}>Country</label>
                <input
                  name="country"
                  className="form-control"
                  value={address.country}
                  onChange={handleAddressChange}
                  required
                  style={{ borderRadius: '0.75rem' }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ color: '#8b005d' }}>Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                className="form-control"
                value={address.phoneNumber}
                onChange={handleAddressChange}
                required
                style={{ borderRadius: '0.75rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={isSubmitting}
              style={{ backgroundColor: '#e83e8c', borderColor: '#e83e8c', borderRadius: '1rem' }}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;

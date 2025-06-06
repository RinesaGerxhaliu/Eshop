import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/CreateOrderPage.css";

const CreateOrderPage = () => {
  const { refreshAccessToken } = useAuth();
  const navigate = useNavigate();

  // --------- State variables ---------
  // 1. Hiqëm orderName, sepse nuk ekziston si kolone në back
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: ""
  });
  const [items, setItems] = useState([]);                        // list of { productId, productName, quantity, price }
  const [shippingMethods, setShippingMethods] = useState([]);    // list of { id, name, cost }
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBasket, setIsLoadingBasket] = useState(true);
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] = useState(true);

  // --------- Helper to parse JWT ---------
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return {};
    }
  };

  // --------- 1. Fetch basket items for current user ---------
  useEffect(() => {
    const fetchBasket = async () => {
      setIsLoadingBasket(true);
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      if (!username || !token) {
        setItems([]);
        setIsLoadingBasket(false);
        return;
      }

      try {
        const resp = await fetch(`https://localhost:5050/basket/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          console.log("BASKET RESPONSE:", data.shoppingCart.items);

          setItems(
            data.shoppingCart.items.map((i) => ({
              productId:   i.productId,
              productName: i.productName,
              quantity:    i.quantity,
              // përshtatni sipas emrit të vërtetë të fushës për çmimin:
              price:       i.price != null ? Number(i.price) : 0
            }))
          );
        } else {
          console.error("Failed to fetch basket:", resp.statusText);
          setItems([]);
        }
      } catch (e) {
        console.error("Error fetching basket:", e);
        setItems([]);
      } finally {
        setIsLoadingBasket(false);
      }
    };

    fetchBasket();
  }, []);

  // --------- 2. Fetch available shipping methods ---------
  useEffect(() => {
    const fetchShippingMethods = async () => {
      setIsLoadingShippingMethods(true);
      try {
        const resp = await fetch("https://localhost:5050/shipping-methods");
        if (resp.ok) {
          const list = await resp.json();
          setShippingMethods(
            list.map((m) => ({
              id:   m.id,
              name: m.name,
              cost: m.cost != null ? Number(m.cost) : 0
            }))
          );
        } else {
          console.error("Failed to fetch shipping methods:", resp.statusText);
          setShippingMethods([]);
        }
      } catch (e) {
        console.error("Error fetching shipping methods:", e);
        setShippingMethods([]);
      } finally {
        setIsLoadingShippingMethods(false);
      }
    };

    fetchShippingMethods();
  }, []);

  // --------- 3. Fetch saved address (if exists) ---------
  useEffect(() => {
    const fetchSavedAddress = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const resp = await fetch("https://localhost:5050/saved-addresses/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.address && data.address.address) {
            setAddress(data.address.address);
          }
        }
      } catch (e) {
        console.warn("No saved address found or failed to fetch.", e);
      }
    };
    fetchSavedAddress();
  }, []);

  // --------- 4. Handle address input changes ---------
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // --------- 5. Compute subtotal, shipping cost, and total ---------
  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const priceNum = typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
      const qtyNum   = typeof i.quantity === "number" ? i.quantity : parseInt(i.quantity) || 0;
      return sum + priceNum * qtyNum;
    }, 0);
  }, [items]);

  const shippingCost = useMemo(() => {
    const method = shippingMethods.find((m) => m.id === shippingMethodId);
    return method ? method.cost : 0;
  }, [shippingMethodId, shippingMethods]);

  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  // --------- 6. Form validation (disable “Place Order” if something is missing) ---------
  const isFormValid = useMemo(() => {
    if (items.length === 0) return false;
    if (!shippingMethodId) return false;
    const { street, city, state, postalCode, country, phoneNumber } = address;
    if (
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim() ||
      !country.trim() ||
      !phoneNumber.trim()
    ) {
      return false;
    }
    return true;
  }, [items, shippingMethodId, address]);

  // --------- 7. Submit handler ---------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      let token = localStorage.getItem("token");
      const decoded = parseJwt(token);
      const customerId =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub;

      // **Hiqëm orderName nga payload**
      const payload = {
        order: {
          customerId,
          items: items.map((i) => ({
            productId: i.productId,
            quantity:  i.quantity,
            price:     i.price
          })),
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
        navigate(`/checkout/${id}`);
      } else {
        const errText = await resp.text();
        setError(errText);
      }
    } catch (ex) {
      console.error("Error placing order:", ex);
      setError("Something went wrong while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------- 8. Render ---------
  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header text-white" style={{ backgroundColor: "#e83e8c" }}>
          <h3 className="mb-0">Create New Order</h3>
        </div>

        <div className="card-body" style={{ backgroundColor: "#fff0f5" }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* 8.1 Loading states */}
          {(isLoadingBasket || isLoadingShippingMethods) && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          )}

          {/* 8.2 Order Summary: Items + Subtotal */}
          {!isLoadingBasket && items.length > 0 && (
            <>
              <h5>Order Summary</h5>
              <ul className="list-group mb-2">
                {items.map((i, idx) => {
                  const priceNum = typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
                  const qtyNum   = typeof i.quantity === "number" ? i.quantity : parseInt(i.quantity) || 0;
                  return (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {i.productName} (Qty: {qtyNum}) @ €{priceNum.toFixed(2)}
                      </div>
                      <div>€{(priceNum * qtyNum).toFixed(2)}</div>
                    </li>
                  );
                })}
              </ul>
              <div className="d-flex justify-content-between mb-4">
                <strong>Subtotal:</strong>
                <strong>€{subtotal.toFixed(2)}</strong>
              </div>
            </>
          )}

          {/* 8.3 Form për krijimin e porosisë (pa Order Name) */}
          <form onSubmit={handleSubmit}>
            {/* Shipping Method */}
            <div className="mb-3">
              <label className="form-label text-pink">Shipping Method</label>
              <select
                className="form-select"
                value={shippingMethodId}
                onChange={(e) => setShippingMethodId(e.target.value)}
                required
                style={{ borderRadius: "0.75rem" }}
              >
                <option value="">Select method</option>
                {shippingMethods.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name} (€{sm.cost.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Compute and display Shipping Cost & Total */}
            {shippingMethodId && (
              <>
                <div className="mb-3 d-flex justify-content-between">
                  <div>
                    <strong>Shipping Cost:</strong>
                  </div>
                  <div>€{shippingCost.toFixed(2)}</div>
                </div>
                <div className="mb-4 d-flex justify-content-between">
                  <div>
                    <strong>Total:</strong>
                  </div>
                  <div>€{total.toFixed(2)}</div>
                </div>
              </>
            )}

            {/* Shipping Address */}
            <h5 className="text-pink">Shipping Address</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-pink">Street</label>
                <input
                  name="street"
                  type="text"
                  className="form-control"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Street name"
                  required
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-pink">City</label>
                <input
                  name="city"
                  type="text"
                  className="form-control"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  required
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label text-pink">State</label>
                <input
                  name="state"
                  type="text"
                  className="form-control"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  required
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label text-pink">Postal Code</label>
                <input
                  name="postalCode"
                  type="text"
                  className="form-control"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Postal Code"
                  required
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label text-pink">Country</label>
                <input
                  name="country"
                  type="text"
                  className="form-control"
                  value={address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  required
                  style={{ borderRadius: "0.75rem" }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-pink">Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                className="form-control"
                value={address.phoneNumber}
                onChange={handleAddressChange}
                placeholder="e.g. 049-000-000"
                required
                style={{ borderRadius: "0.75rem" }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-pink w-100"
              disabled={!isFormValid || isSubmitting || isLoadingBasket || isLoadingShippingMethods}
              style={{
                borderRadius: "1rem",
                backgroundColor: !isFormValid || isSubmitting ? "#e0a3bf" : "#e83e8c",
                borderColor: !isFormValid || isSubmitting ? "#e0a3bf" : "#e83e8c"
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Placing Order…
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/CreateOrderPage.css";

export default function CreateOrderPage() {
  const { refreshAccessToken } = useAuth();
  const navigate = useNavigate();

  // States
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [address, setAddress] = useState({
    street: "", city: "", state: "", postalCode: "", country: "", phoneNumber: ""
  });
  const [items, setItems] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBasket, setIsLoadingBasket] = useState(true);
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] = useState(true);

  // Payment method state: "stripe" or "cod"
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  // Parse JWT helper
  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split(".")[1])); } catch { return {}; }
  };

  // Fetch basket items
  useEffect(() => {
    const fetchBasket = async () => {
      setIsLoadingBasket(true);
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("token");
      if (!username || !token) { setItems([]); setIsLoadingBasket(false); return; }
      try {
        const resp = await fetch(`https://localhost:5050/basket/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) { setItems([]); setIsLoadingBasket(false); return; }
        const data = await resp.json();
        const simpleItems = data.shoppingCart.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: typeof i.price === "number" ? i.price : Number(i.price || 0),
          imageUrl: null
        }));
        const enriched = await Promise.all(simpleItems.map(async (item) => {
          try {
            const prodResp = await fetch(`https://localhost:5050/products/${item.productId}`);
            if (!prodResp.ok) throw new Error("Product not found");
            const pd = await prodResp.json();
            return { ...item, imageUrl: pd.product.imageUrl || null };
          } catch { return { ...item, imageUrl: null }; }
        }));
        setItems(enriched);
        setError("");
      } catch (e) {
        setError("Failed to load your shopping cart."); setItems([]);
      } finally { setIsLoadingBasket(false); }
    };
    fetchBasket();
  }, [refreshAccessToken, navigate]);

  // Fetch shipping methods
  useEffect(() => {
    const fetchShippingMethods = async () => {
      setIsLoadingShippingMethods(true);
      try {
        const resp = await fetch("https://localhost:5050/shipping-methods");
        if (!resp.ok) { setShippingMethods([]); setIsLoadingShippingMethods(false); return; }
        const list = await resp.json();
        setShippingMethods(list.map((m) => ({
          id: m.id, name: m.name, cost: typeof m.cost === "number" ? m.cost : Number(m.cost || 0)
        })));
      } catch (e) { setShippingMethods([]); }
      finally { setIsLoadingShippingMethods(false); }
    };
    fetchShippingMethods();
  }, []);

  // Fetch saved address
  useEffect(() => {
    const fetchSavedAddress = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const resp = await fetch("https://localhost:5050/saved-addresses/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.address && data.address.address) setAddress(data.address.address);
      } catch { /* ignore */ }
    };
    fetchSavedAddress();
  }, []);

  // Address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Totals
  const subtotal = useMemo(() =>
    items.reduce((sum, i) => {
      const p = typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
      const q = typeof i.quantity === "number" ? i.quantity : parseInt(i.quantity) || 0;
      return sum + p * q;
    }, 0), [items]);

  const shippingMethod = shippingMethods.find((m) => m.id === shippingMethodId);
  const shippingCost = shippingMethod ? shippingMethod.cost : 0;
  const total = subtotal + shippingCost;

  // Validation
  const isFormValid = useMemo(() => {
    if (items.length === 0) return false;
    if (!shippingMethodId) return false;
    const { street, city, state, postalCode, country, phoneNumber } = address;
    if (!street.trim() || !city.trim() || !state.trim() || !postalCode.trim() || !country.trim() || !phoneNumber.trim())
      return false;
    return true;
  }, [items, shippingMethodId, address]);

   const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isFormValid || isSubmitting) return;
  setIsSubmitting(true);
  setError("");

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    // ←– NEW: decode token and grab customerId
    const decoded = parseJwt(token);
    const customerId =
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      decoded.sub;
    if (!customerId) throw new Error("Customer ID not found in token");

    // build the order payload
    const orderPayload = {
      customerId,              // ←– use the decoded customerId here
      orderName: "",
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price
      })),
      shippingMethodId,
      savedAddressId: null,
      shippingAddress: address
    };

    if (paymentMethod === "stripe") {
      navigate("/checkout", {
        state: { order: orderPayload, subtotal, shippingCost, total }
      });
    } else {
      const resp = await fetch("https://localhost:5050/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order: orderPayload,
          currencyCode: "EUR",
          paymentMethod: "CashOnDelivery"
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Failed to place COD order");
      }

      navigate("/order-confirmation", {
        state: { order: orderPayload, subtotal, shippingCost, total }
      });
    }
  } catch (ex) {
    setError(ex.message);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="create-order-container">
      <div className="card">
        <div className="card-header">
          <h3>Create New Order</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {(isLoadingBasket || isLoadingShippingMethods) && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          )}
          {!isLoadingBasket && items.length > 0 && (
            <>
              <h5>Order Summary</h5>
              <ul className="list-group mb-2">
                {items.map((i, idx) => {
                  const p = typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
                  const q = typeof i.quantity === "number" ? i.quantity : parseInt(i.quantity) || 0;
                  return (
                    <li key={idx} className="list-group-item d-flex align-items-center">
                      <div className="item-image-wrapper">
                        {i.imageUrl ? (
                          <img src={`https://localhost:5050${i.imageUrl}`} alt={i.productName} className="item-image" />
                        ) : (<div className="item-image placeholder" />)}
                      </div>
                      <div className="item-details">
                        <div className="item-name">{i.productName}</div>
                        <div className="item-subinfo">
                          Qty: {q} × €{p.toFixed(2)}
                        </div>
                      </div>
                      <div className="item-line-total">€{(p * q).toFixed(2)}</div>
                    </li>
                  );
                })}
              </ul>
              <div className="d-flex justify-content-between mb-4 totals-row">
                <strong>Subtotal:</strong>
                <strong>€{subtotal.toFixed(2)}</strong>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Shipping Method</label>
              <select className="form-select" value={shippingMethodId} onChange={(e) => setShippingMethodId(e.target.value)} required>
                <option value="">Select method</option>
                {shippingMethods.map((sm) => (
                  <option key={sm.id} value={sm.id}>{sm.name} (€{sm.cost.toFixed(2)})</option>
                ))}
              </select>
            </div>

            {/* Payment Method Radios */}
            <div className="mb-3">
              <label className="form-label">Payment Method</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="payStripe"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                  />
                  <label className="form-check-label" htmlFor="payStripe">Pay with Stripe</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="payCOD"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <label className="form-check-label" htmlFor="payCOD">Pay on Delivery</label>
                </div>
              </div>
            </div>

            {shippingMethodId && (
              <>
                <div className="mb-3 d-flex justify-content-between totals-row">
                  <span><strong>Shipping Cost:</strong></span>
                  <span>€{shippingCost.toFixed(2)}</span>
                </div>
                <div className="mb-4 d-flex justify-content-between totals-row">
                  <span><strong>Total:</strong></span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </>
            )}

            <h5 className="mb-3">Shipping Address</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Street</label>
                <input name="street" type="text" className="form-control" value={address.street} onChange={handleAddressChange} placeholder="Street name" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">City</label>
                <input name="city" type="text" className="form-control" value={address.city} onChange={handleAddressChange} placeholder="City" required />
              </div>
            </div>
            <div className="row g-3 mt-2">
              <div className="col-md-4">
                <label className="form-label">State</label>
                <input name="state" type="text" className="form-control" value={address.state} onChange={handleAddressChange} placeholder="State" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Postal Code</label>
                <input name="postalCode" type="text" className="form-control" value={address.postalCode} onChange={handleAddressChange} placeholder="Postal Code" required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Country</label>
                <input name="country" type="text" className="form-control" value={address.country} onChange={handleAddressChange} placeholder="Country" required />
              </div>
            </div>
            <div className="mt-3">
              <label className="form-label">Phone Number</label>
              <input name="phoneNumber" type="tel" className="form-control" value={address.phoneNumber} onChange={handleAddressChange} placeholder="e.g. 049-000-000" required />
            </div>

            <button
              type="submit"
              className="btn btn-pink mt-4"
              disabled={!isFormValid || isSubmitting || isLoadingBasket || isLoadingShippingMethods}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  {paymentMethod === "stripe" ? "Processing Payment…" : "Processing Order…"}
                </>
              ) : (
                paymentMethod === "stripe" ? "Continue to Payment" : "Process Order"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

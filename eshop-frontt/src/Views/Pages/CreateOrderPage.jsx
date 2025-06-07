import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/CreateOrderPage.css";

export default function CreateOrderPage() {
  const { refreshAccessToken } = useAuth();
  const navigate = useNavigate();

  // State
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

  // Parse JWT
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

  // Submit handler (NAVIGON TE CHECKOUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const decoded = parseJwt(token);
      const customerId =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.sub;

      // Dërgo draft order + totals te checkout për pagesë
      navigate("/checkout", {
        state: {
          order: {
            customerId,
            orderName: "",
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price
            })),
            shippingMethodId,
            savedAddressId: null,
            shippingAddress: address
          },
          subtotal, shippingCost, total
        }
      });
    } catch (ex) {
      setError("Something went wrong.");
    } finally { setIsSubmitting(false); }
  };

  // Render
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
            <button type="submit" className="btn btn-pink mt-4"
              disabled={!isFormValid || isSubmitting || isLoadingBasket || isLoadingShippingMethods}>
              {isSubmitting ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Placing Order…</>) : ("Continue to Payment")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

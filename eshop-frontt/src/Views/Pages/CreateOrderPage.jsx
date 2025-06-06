import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../Styles/CreateOrderPage.css"; // ← updated CSS path

export default function CreateOrderPage() {
  const { refreshAccessToken } = useAuth();
  const navigate = useNavigate();

  // --------- State variables ---------
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: ""
  });
  const [items, setItems] = useState([]);                     // { productId, productName, quantity, price, imageUrl }
  const [shippingMethods, setShippingMethods] = useState([]); // { id, name, cost }
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
        if (!resp.ok) {
          console.error("Failed to fetch basket:", resp.statusText);
          setItems([]);
          setIsLoadingBasket(false);
          return;
        }

        const data = await resp.json();
        // Map items and fetch each image:
        const simpleItems = data.shoppingCart.items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: typeof i.price === "number" ? i.price : Number(i.price || 0),
          imageUrl: null
        }));

        const enriched = await Promise.all(
          simpleItems.map(async (item) => {
            try {
              const prodResp = await fetch(`https://localhost:5050/products/${item.productId}`);
              if (!prodResp.ok) throw new Error("Product not found");
              const pd = await prodResp.json();
              return {
                ...item,
                imageUrl: pd.product.imageUrl || null
              };
            } catch {
              return { ...item, imageUrl: null };
            }
          })
        );

        setItems(enriched);
        setError("");
      } catch (e) {
        console.error("Error fetching basket:", e);
        setError("Failed to load your shopping cart.");
        setItems([]);
      } finally {
        setIsLoadingBasket(false);
      }
    };

    fetchBasket();
  }, [refreshAccessToken, navigate]);

  // --------- 2. Fetch available shipping methods ---------
  useEffect(() => {
    const fetchShippingMethods = async () => {
      setIsLoadingShippingMethods(true);
      try {
        const resp = await fetch("https://localhost:5050/shipping-methods");
        if (!resp.ok) {
          console.error("Failed to fetch shipping methods:", resp.statusText);
          setShippingMethods([]);
          setIsLoadingShippingMethods(false);
          return;
        }

        const list = await resp.json();
        setShippingMethods(
          list.map((m) => ({
            id: m.id,
            name: m.name,
            cost: typeof m.cost === "number" ? m.cost : Number(m.cost || 0)
          }))
        );
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
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.address && data.address.address) {
          setAddress(data.address.address);
        }
      } catch {
        // ignore if nothing saved
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
      const p = typeof i.price === "number" ? i.price : parseFloat(i.price) || 0;
      const q = typeof i.quantity === "number" ? i.quantity : parseInt(i.quantity) || 0;
      return sum + p * q;
    }, 0);
  }, [items]);

  const shippingMethod = shippingMethods.find((m) => m.id === shippingMethodId);
  const shippingCost = shippingMethod ? shippingMethod.cost : 0;
  const total = subtotal + shippingCost;

  // --------- 6. Form validation ---------
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
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.sub;

      // We must still send orderName="" and savedAddressId=null
      const payload = {
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

      // If 401, refresh token
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

        // Pass subtotal/shippingCost/total in location.state
        navigate(
          `/checkout/${id}`,
          {
            state: {
              subtotal: subtotal,     // from your useMemo
              shippingCost: shippingCost,
              total: total
            }
          }
        );
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
    <div className="create-order-container">
      <div className="card">
        <div className="card-header">
          <h3>Create New Order</h3>
        </div>
        <div className="card-body">
          {/* Display any error */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Loading spinner */}
          {(isLoadingBasket || isLoadingShippingMethods) && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
          )}

          {/* Order Summary */}
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
                          <img
                            src={`https://localhost:5050${i.imageUrl}`}
                            alt={i.productName}
                            className="item-image"
                          />
                        ) : (
                          <div className="item-image placeholder" />
                        )}
                      </div>
                      <div className="item-details">
                        <div className="item-name">{i.productName}</div>
                        <div className="item-subinfo">
                          Qty: {q} × €{p.toFixed(2)}
                        </div>
                      </div>
                      <div className="item-line-total">
                        €{(p * q).toFixed(2)}
                      </div>
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

          {/* Create Order Form */}
          <form onSubmit={handleSubmit}>
            {/* Shipping Method */}
            <div className="mb-3">
              <label className="form-label">Shipping Method</label>
              <select
                className="form-select"
                value={shippingMethodId}
                onChange={(e) => setShippingMethodId(e.target.value)}
                required
              >
                <option value="">Select method</option>
                {shippingMethods.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name} (€{sm.cost.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Shipping Cost & Total */}
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

            {/* Shipping Address */}
            <h5 className="mb-3">Shipping Address</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Street</label>
                <input
                  name="street"
                  type="text"
                  className="form-control"
                  value={address.street}
                  onChange={handleAddressChange}
                  placeholder="Street name"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">City</label>
                <input
                  name="city"
                  type="text"
                  className="form-control"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  required
                />
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-md-4">
                <label className="form-label">State</label>
                <input
                  name="state"
                  type="text"
                  className="form-control"
                  value={address.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Postal Code</label>
                <input
                  name="postalCode"
                  type="text"
                  className="form-control"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  placeholder="Postal Code"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Country</label>
                <input
                  name="country"
                  type="text"
                  className="form-control"
                  value={address.country}
                  onChange={handleAddressChange}
                  placeholder="Country"
                  required
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label">Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                className="form-control"
                value={address.phoneNumber}
                onChange={handleAddressChange}
                placeholder="e.g. 049-000-000"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-pink mt-4"
              disabled={!isFormValid || isSubmitting || isLoadingBasket || isLoadingShippingMethods}
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
}

import React, { useState, useEffect } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate, useParams } from "react-router-dom";
import "../../Styles/StripeElements.css"; // ← make sure this path is correct

// Style configuration for each Stripe Element
const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: "Poppins, sans-serif",
      "::placeholder": { color: "#a0a0a0" },
      padding: "12px 14px",
    },
    invalid: {
      color: "#fa755a",
    },
  },
};

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Order summary state:
  const [orderItems, setOrderItems] = useState([]); // Each: { productName, quantity, unitPrice, imageUrl? }
  const [shippingCost, setShippingCost] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState("");

  // Payment form state:
  const [postalCode, setPostalCode] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  // 1) Fetch order details on mount:
  useEffect(() => {
    async function fetchOrder() {
      setIsLoadingOrder(true);
      try {
        const resp = await fetch(`https://localhost:5050/orders/${orderId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!resp.ok) {
          throw new Error(`Failed to load order (${resp.status})`);
        }
        const data = await resp.json();
        // Assume the API returns something like:
        // {
        //   id: "...",
        //   items: [ { productName, quantity, unitPrice, imageUrl? }, ... ],
        //   shippingCost: number,
        //   total: number,
        //   subtotal: number
        // }
        setOrderItems(data.items || []);
        setShippingCost(data.shippingCost ?? 0);
        setSubtotal(data.subtotal ?? 0);
        setTotal(data.total ?? 0);
        setOrderError("");
      } catch (e) {
        console.error("Error fetching order:", e);
        setOrderError("Could not load order summary.");
        setOrderItems([]);
      } finally {
        setIsLoadingOrder(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  // 2) Payment submit handler:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    // 2.a) Fetch clientSecret from backend if not fetched yet:
    let cs = clientSecret;
    if (!cs) {
      try {
        const resp = await fetch("https://localhost:5050/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orderId, currencyCode: "eur" }),
        });
        if (!resp.ok) {
          const err = (await resp.json()).error || "Failed to get client secret";
          throw new Error(err);
        }
        const data = await resp.json();
        cs = data.clientSecret;
        setClientSecret(cs);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
        setProcessing(false);
        return;
      }
    }

    // 2.b) Grab each Stripe Element
    const numberElement = elements.getElement(CardNumberElement);
    const expiryElement = elements.getElement(CardExpiryElement);
    const cvcElement    = elements.getElement(CardCvcElement);

    if (!numberElement || !expiryElement || !cvcElement) {
      setErrorMsg("Card fields not loaded properly.");
      setProcessing(false);
      return;
    }

    // 2.c) Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(cs, {
      payment_method: {
        card: numberElement,
        billing_details: {
          address: {
            postal_code: postalCode.trim(),
          },
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // 3) On success, redirect:
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  // 3) Render
  return (
    <div className="checkout-page">
      {/* Left: Order Summary */}
      <aside className="summary-panel">
        <h3 className="summary-title">Order Summary</h3>

        {isLoadingOrder && (
          <div className="summary-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        )}

        {orderError && (
          <div className="alert alert-danger" role="alert">
            {orderError}
          </div>
        )}

        {!isLoadingOrder && !orderError && (
          <>
            <ul className="summary-items">
              {orderItems.map((item, idx) => {
                const unit = typeof item.price === "number"
                  ? item.unitPrice
                  : parseFloat(item.price) || 0;
                const qty = typeof item.quantity === "number"
                  ? item.quantity
                  : parseInt(item.quantity) || 0;
                return (
                  <li key={idx} className="summary-item">
                    {item.imageUrl ? (
                      <img
                        src={`https://localhost:5050${item.imageUrl}`}
                        alt={item.productName}
                        className="summary-item-image"
                      />
                    ) : (
                      <div className="summary-item-image placeholder" />
                    )}
                    <div className="summary-item-details">
                      <div className="summary-item-name">{item.productName}</div>
                      <div className="summary-item-subinfo">
                        Qty: {qty} &times; €{unit.toFixed(2)}
                      </div>
                    </div>
                    <div className="summary-item-total">
                      €{(unit * qty).toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="summary-totals">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Shipping:</span>
                <span>€{shippingCost.toFixed(2)}</span>
              </div>
              <div className="totals-row total-final">
                <span>Total:</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Right: Payment Form */}
      <section className="payment-panel">
        <h2 className="checkout-heading">Complete Your Payment</h2>
        {errorMsg && <div className="checkout-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Card Number */}
          <label htmlFor="cardNumber" className="checkout-label">Card Number</label>
          <div className="stripe-element-wrapper">
            <CardNumberElement
              id="cardNumber"
              options={ELEMENT_OPTIONS}
              onChange={(e) => e.error ? setErrorMsg(e.error.message) : setErrorMsg("")}
            />
          </div>

          {/* Expiry */}
          <label htmlFor="cardExpiry" className="checkout-label">Expiration Date</label>
          <div className="stripe-element-wrapper">
            <CardExpiryElement
              id="cardExpiry"
              options={ELEMENT_OPTIONS}
              onChange={(e) => e.error ? setErrorMsg(e.error.message) : setErrorMsg("")}
            />
          </div>

          {/* CVC */}
          <label htmlFor="cardCvc" className="checkout-label">CVC</label>
          <div className="stripe-element-wrapper">
            <CardCvcElement
              id="cardCvc"
              options={ELEMENT_OPTIONS}
              onChange={(e) => e.error ? setErrorMsg(e.error.message) : setErrorMsg("")}
            />
          </div>

          {/* Postal Code */}
          <label htmlFor="postalCode" className="checkout-label">Postal Code</label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g. 10000"
            className="checkout-input"
            required
          />

          <button
            type="submit"
            disabled={!stripe || processing}
            className="checkout-button"
          >
            {processing ? "Processing…" : "Pay Now"}
          </button>
        </form>
      </section>
    </div>
  );
}

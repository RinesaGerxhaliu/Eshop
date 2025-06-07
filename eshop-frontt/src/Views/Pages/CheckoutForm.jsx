import React, { useState, useEffect } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate, useParams } from "react-router-dom";
import "../../Styles/StripeElements.css";

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

  const [orderItems, setOrderItems] = useState([]); 
  const [shippingCost, setShippingCost] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState("");

  const [postalCode, setPostalCode] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

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

        const order = data.order;

        setOrderItems(order.items || []);
        setShippingCost(order.shippingCost ?? 0);
        setSubtotal(order.subtotal ?? 0);
        setTotal(order.total ?? 0);

        setOrderError("");
      } catch (e) {
        console.error("Error fetching order:", e);
        setOrderError("Could not load order summary.");

        setOrderItems([]);
        setShippingCost(0);
        setSubtotal(0);
        setTotal(0);
      } finally {
        setIsLoadingOrder(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

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
          const err =
            (await resp.json()).error || "Failed to get client secret";
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

    const numberElement = elements.getElement(CardNumberElement);
    const expiryElement = elements.getElement(CardExpiryElement);
    const cvcElement = elements.getElement(CardCvcElement);

    if (!numberElement || !expiryElement || !cvcElement) {
      setErrorMsg("Card fields not loaded properly.");
      setProcessing(false);
      return;
    }
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
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  return (
    <div className="checkout-page">

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
            <div className="summary-totals">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>€{(subtotal ?? 0).toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Shipping:</span>
                <span>€{(shippingCost ?? 0).toFixed(2)}</span>
              </div>
              <div className="totals-row total-final">
                <span>Total:</span>
                <span>€{(total ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </aside>

      <section className="payment-panel">
        <h2 className="checkout-heading">Complete Your Payment</h2>
        {errorMsg && <div className="checkout-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="checkout-form">
          <label htmlFor="cardNumber" className="checkout-label">
            Card Number
          </label>
          <div className="stripe-element-wrapper">
            <CardNumberElement
              id="cardNumber"
              options={ELEMENT_OPTIONS}
              onChange={(e) =>
                e.error ? setErrorMsg(e.error.message) : setErrorMsg("")
              }
            />
          </div>

          <label htmlFor="cardExpiry" className="checkout-label">
            Expiration Date
          </label>
          <div className="stripe-element-wrapper">
            <CardExpiryElement
              id="cardExpiry"
              options={ELEMENT_OPTIONS}
              onChange={(e) =>
                e.error ? setErrorMsg(e.error.message) : setErrorMsg("")
              }
            />
          </div>

          <label htmlFor="cardCvc" className="checkout-label">
            CVC
          </label>
          <div className="stripe-element-wrapper">
            <CardCvcElement
              id="cardCvc"
              options={ELEMENT_OPTIONS}
              onChange={(e) =>
                e.error ? setErrorMsg(e.error.message) : setErrorMsg("")
              }
            />
          </div>

          <label htmlFor="postalCode" className="checkout-label">
            Postal Code
          </label>
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

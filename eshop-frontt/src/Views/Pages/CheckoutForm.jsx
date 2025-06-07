import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate, useLocation } from "react-router-dom";
import "../../Styles/StripeElements.css";

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: "Poppins, sans-serif",
      "::placeholder": { color: "#a0a0a0" },
      padding: "12px 14px",
    },
    invalid: { color: "#fa755a" },
  },
};

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();

  // Draft order & totals nga navigate
  const draftOrder = location.state?.order;
  const subtotal = location.state?.subtotal ?? 0;
  const shippingCost = location.state?.shippingCost ?? 0;
  const total = location.state?.total ?? 0;

  const [postalCode, setPostalCode] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setProcessing(true);
    if (!stripe || !elements) { setProcessing(false); return; }

    let cs = clientSecret;
    if (!cs) {
      try {
        const resp = await fetch("https://localhost:5050/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: draftOrder,
            currencyCode: "eur",
          }),
        });
        if (!resp.ok) {
          throw new Error((await resp.json()).error || "Failed to get client secret");
        }
        const data = await resp.json();
        cs = data.clientSecret;
        setClientSecret(cs);
      } catch (err) {
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
        billing_details: { address: { postal_code: postalCode.trim() } },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Backend krijon order nga webhook!
      navigate(`/order-confirmation`);
    }
  };

  return (
    <div className="checkout-page">
      <aside className="summary-panel">
        <h3 className="summary-title">Order Summary</h3>
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
      </aside>
      <section className="payment-panel">
        <h2 className="checkout-heading">Complete Your Payment</h2>
        {errorMsg && <div className="checkout-error">{errorMsg}</div>}
        <form onSubmit={handleSubmit} className="checkout-form">
          <label htmlFor="cardNumber" className="checkout-label">Card Number</label>
          <div className="stripe-element-wrapper">
            <CardNumberElement id="cardNumber" options={ELEMENT_OPTIONS}
              onChange={(e) => e.error ? setErrorMsg(e.error.message) : setErrorMsg("")} />
          </div>
          <label htmlFor="cardExpiry" className="checkout-label">Expiration Date</label>
          <div className="stripe-element-wrapper">
            <CardExpiryElement id="cardExpiry" options={ELEMENT_OPTIONS}
              onChange={(e) => e.error ? setErrorMsg(e.error.message) : setErrorMsg("")} />
          </div>
          <label htmlFor="cardCvc" className="checkout-label">CVC</label>
          <div className="stripe-element-wrapper">
            <CardCvcElement id="cardCvc" options={ELEMENT_OPTIONS}
              onChange={(e) => e.error ? setErrorMsg(e.error.message) : setErrorMsg("")} />
          </div>
          <label htmlFor="postalCode" className="checkout-label">Postal Code</label>
          <input id="postalCode" type="text" value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)} placeholder="e.g. 10000"
            className="checkout-input" required />
          <button type="submit" disabled={!stripe || processing || !draftOrder} className="checkout-button">
            {processing ? "Processing…" : "Pay Now"}
          </button>
        </form>
      </section>
    </div>
  );
}

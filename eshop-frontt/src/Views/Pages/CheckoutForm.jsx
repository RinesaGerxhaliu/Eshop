// src/Components/Features/checkout/CheckoutForm.jsx
import React, { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate, useParams } from "react-router-dom";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { orderId } = useParams(); // will read /checkout/:orderId
  const [clientSecret, setClientSecret] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // 1. Fetch clientSecret from your backend:
    fetch(`https://localhost:5050/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // if you require auth
      body: JSON.stringify({ orderId, currencyCode: "eur" }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = (await res.json()).error || "Failed to get client secret";
          throw new Error(err);
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(err.message);
      });
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMsg("Card element not found");
      setProcessing(false);
      return;
    }

    // 2. Confirm Card Payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setErrorMsg(error.message);
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      // 3. Payment succeeded → redirect to a “Thank you” or order‐complete page
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Complete Your Payment</h2>
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ padding: "1rem 0" }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#a0a0a0" },
                },
                invalid: { color: "#fa755a" },
              },
            }}
          />
        </div>

        <button type="submit" disabled={!stripe || !clientSecret || processing} style={{ width: "100%" }}>
          {processing ? "Processing…" : "Pay Now"}
        </button>
      </form>
    </div>
  );
}

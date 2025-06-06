// src/StripeProvider.jsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Replace this with your actual Stripe publishable key from Dashboard (pk_test_...)
const stripePromise = loadStripe("pk_test_51RX2ffPwO8aInMq0haYY4p2MFCsAQ19pnmf15Kd4SsNQMkbXHxvAPp39LD2jM2UOa0n3bfRIIZTIVvD8nKBiuoTL00Oz7rZqKm");

export default function StripeProvider({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

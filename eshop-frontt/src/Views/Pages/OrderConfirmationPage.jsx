import React from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/OrderConfirmation.css";

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // Make sure this key matches your storage

  return (
    <div className="order-confirmation-container">
      <h2>Thank you for your order!</h2>
      <p>
        Your order has been received and will be processed shortly.
      </p>

      <button
        className="confirm-orders-link"
        onClick={() => navigate(`/user-orders/${userId}`)}
      >
        See all your orders
      </button>
      <button
        className="back-home-link"
        onClick={() => navigate("/shop")}
      >
        Back to Shopping
      </button>
    </div>
  );
}

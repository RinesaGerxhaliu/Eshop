import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  if (!order) {
    // Nëse nuk ka order, kthehu në faqen kryesore ose krijo një mesaj gabimi
    return (
      <div className="container mt-5">
        <h3>Order not found</h3>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Thank you for your order!</h2>
      <p>Your order has been received and will be processed shortly.</p>
      <h4>Order Details</h4>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.quantity} × {item.productId} @ €{item.price.toFixed(2)}
          </li>
        ))}
      </ul>
      <p><strong>Total:</strong> €{order.total.toFixed(2)}</p>
      <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

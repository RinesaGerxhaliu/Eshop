import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/GetOrders.css";
import { useCurrency } from "../../contexts/CurrencyContext";

const API = "https://localhost:5050";

// Map numeric status codes to human-readable strings
const shipmentStatusNames = {
  0: "Pending",
  1: "Shipped",
  2: "Delivered",
  3: "Cancelled",
};

const fetchShipmentStatus = async (orderId) => {
  try {
    const response = await fetch(`${API}/shipments/order/${orderId}`);
    if (response.status === 404) return "Pending";
    if (!response.ok) throw new Error("Failed to fetch shipment");
    const data = await response.json();
    return shipmentStatusNames[data.status] || "Unknown";
  } catch (err) {
    console.error("Error fetching shipment status:", err);
    return "Unknown";
  }
};

const fetchProductDetails = async (productId) => {
  try {
    const response = await fetch(`${API}/products/${productId}`);
    if (!response.ok) throw new Error("Product not found");
    const data = await response.json();
    return data.product;
  } catch (err) {
    console.error("Error fetching product details:", err);
    return null;
  }
};

const UserOrders = () => {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const { convert, format } = useCurrency();

  useEffect(() => {
    const loadOrdersWithImages = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const response = await fetch(`${API}/users/${userId}/orders`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const enriched = await Promise.all(
          (data.orders || []).map(async (order) => {
            console.log("Order id:", order.id, "Order object:", order);
            const items = await Promise.all(
              order.items.map(async (item) => {
                const details = await fetchProductDetails(item.productId);
                return {
                  ...item,
                  productName: details?.name || item.productId,
                  imageUrl: details?.imageUrl || null,
                };
              })
            );
            // Use order.id here as orderId for shipment fetch
            const shipmentStatus = await fetchShipmentStatus(order.id);
            return { ...order, items, shipmentStatus };
          })
        );

        setOrders(enriched);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrdersWithImages();
  }, [userId]);

  return (
    <div className="orders-page d-flex flex-column min-vh-100 bg-trendora">
      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3">
        {loading ? (
          <p className="text-center mb-0">Loading orders...</p>
        ) : errorMsg ? (
          <p className="text-danger text-center mb-0">Error: {errorMsg}</p>
        ) : orders.length === 0 ? (
          <p className="text-center mb-0">No orders found.</p>
        ) : (
          <div className="container">
            <h2 className="text-center mb-4 orders-heading">My Orders</h2>
            <div className="mx-auto w-100" style={{ maxWidth: "800px", marginBottom: "80px" }}>
              <div className="accordion" id="ordersAccordion">
                {orders.map((order, idx) => (
                  <div className="accordion-item mb-3 bg-light bg-opacity-25" key={idx}>
                    <h2 className="accordion-header" id={`heading-${idx}`}>
                      <button
                        className="accordion-button collapsed bg-transparent text-dark border-0 d-flex justify-content-between align-items-center"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse-${idx}`}
                        aria-expanded="false"
                        aria-controls={`collapse-${idx}`}
                        style={{ boxShadow: "none" }}
                      >
                        <span>Order #{idx + 1}</span>
                        <span
                          className={`badge ms-auto ${
                            order.shipmentStatus === "Delivered"
                              ? "bg-success"
                              : order.shipmentStatus === "Shipped"
                              ? "bg-info text-dark"
                              : order.shipmentStatus === "Pending"
                              ? "bg-warning text-dark"
                              : order.shipmentStatus === "Cancelled"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {order.shipmentStatus}
                        </span>
                      </button>
                    </h2>
                    <div
                      id={`collapse-${idx}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading-${idx}`}
                      data-bs-parent="#ordersAccordion"
                    >
                      <div className="accordion-body p-3">
                        <ul className="list-group list-group-flush">
                          {order.items.map((item, i) => (
                            <li key={i} className="list-group-item bg-transparent d-flex align-items-center gap-3">
                              {item.imageUrl ? (
                                <img
                                  src={`${API}${item.imageUrl}`}
                                  alt={item.productName}
                                  className="img-fluid"
                                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                                />
                              ) : (
                                <div className="no-image-placeholder">No Image</div>


                              )}
                              <div>
                                <strong>{item.productName}</strong>
                                <br />
                                Quantity: {item.quantity}
                                <br />
                                Price: {format(convert(item.price))}
                              </div>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 fw-bold text-trendora mb-0">Total: {format(convert(order.total))}</p>



                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserOrders;
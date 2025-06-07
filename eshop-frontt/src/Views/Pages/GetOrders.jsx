import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Styles/GetOrders.css";

const API = "https://localhost:5050";

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

  useEffect(() => {
    const loadOrdersWithImages = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const response = await fetch(`${API}/users/${userId}/orders`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const enrichedOrders = await Promise.all(
          (data.orders || []).map(async (order) => {
            const itemsWithDetails = await Promise.all(
              order.items.map(async (item) => {
                const details = await fetchProductDetails(item.productId);
                return {
                  ...item,
                  productName: details?.name || item.productId,
                  imageUrl: details?.imageUrl || null,
                };
              })
            );
            return { ...order, items: itemsWithDetails };
          })
        );

        setOrders(enrichedOrders);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrdersWithImages();
  }, [userId]);

  if (loading) return <p className="text-center mt-4">Loading orders...</p>;
  if (errorMsg) return <p className="text-danger text-center mt-4">Error: {errorMsg}</p>;
  if (orders.length === 0) return <p className="text-center mt-4">No orders found.</p>;

  return (
    
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "#e83e8c",position: "sticky" }}>Your Orders</h2>

      <div className="mx-auto w-100 order-accordion-wrapper" style={{ maxWidth: "800px", marginBottom: "80px" }}>
        <div className="accordion accordion-flush" id="ordersAccordion">
          {orders.map((order, index) => (
            <div className="accordion-item border" key={index}>
              <h2 className="accordion-header" id={`heading-${index}`}>
                <button
                  className="accordion-button collapsed bg-light text-dark"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${index}`}
                  aria-expanded="false"
                  aria-controls={`collapse-${index}`}
                  style={{ borderBottom: "1px solid #dee2e6" }}
                >
                  Order #{index + 1}
                </button>
              </h2>
              <div
                id={`collapse-${index}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading-${index}`}
                data-bs-parent="#ordersAccordion"
              >
                <div className="accordion-body p-3">
                  <ul className="list-group">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex align-items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={`https://localhost:5050${item.imageUrl}`}
                            alt={item.productName}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px"
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              backgroundColor: "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "8px"
                            }}
                          >
                            No Image
                          </div>
                        )}
                        <div>
                          <strong>{item.productName}</strong> <br />
                          Quantity: {item.quantity} <br />
                          Price: ${item.price.toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 fw-bold" style={{ color: "#e83e8c" }}>
                    Total: ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserOrders;




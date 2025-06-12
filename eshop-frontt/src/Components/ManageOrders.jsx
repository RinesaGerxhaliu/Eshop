import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCheck } from "react-icons/fa";
import Select from "react-select";
import "../Styles/ManageOrders.css";
import { useCurrency } from "../contexts/CurrencyContext";

const BASE_URL = "https://localhost:5050";
const PAGE_SIZE = 5;

const shipmentStatusNames = {
  0: "Pending",
  1: "Shipped",
  2: "Delivered",
  3: "Cancelled",
};

const statusOptions = [
  { value: 0, label: "Pending" },
  { value: 1, label: "Shipped" },
  { value: 2, label: "Delivered" },
  { value: 3, label: "Cancelled" },
];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
   const { convert, format } = useCurrency();

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
    const fetchProductDetails = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data.product;
    } catch {
      return null;
    }
  };

        const loadOrders = async () => {
  setLoading(true);
  try {
    let ordersList = [];

    if (filterStatus) {
      const res = await api.get(`/orders/by-shipment-status/${filterStatus.value}`);
      ordersList = res.data.orders || [];

      // Apliko pagination manualisht për filtrin
      const pagedOrders = ordersList.slice(
        pageIndex * PAGE_SIZE,
        (pageIndex + 1) * PAGE_SIZE
      );

      setTotalCount(ordersList.length);

      const detailedOrders = await Promise.all(
        pagedOrders.map(async (order) => {
          let shipmentDetails = null;
          try {
            const shipmentRes = await api.get(`/shipments/order/${order.id || order.orderId}`);
            shipmentDetails = shipmentRes.data;
          } catch {}

          const itemsWithDetails = await Promise.all(
            (order.items || []).map(async (item) => {
              const product = await fetchProductDetails(item.productId);
              return {
                ...item,
                productName: product?.name || item.productId,
                imageUrl: product?.imageUrl || null,
              };
            })
          );

          return {
            ...order,
            shipmentDetails,
            items: itemsWithDetails,
          };
        })
      );

      setOrders(detailedOrders);
    } else {
      const res = await api.get("/orders", {
        params: {
          pageIndex,
          pageSize: PAGE_SIZE,
        },
      });

      const page = res.data.orders ?? res.data.Orders ?? {};
      const items = Array.isArray(page.data)
        ? page.data
        : Array.isArray(page.items)
        ? page.items
        : [];

      const count =
        typeof page.count === "number"
          ? page.count
          : typeof page.totalCount === "number"
          ? page.totalCount
          : typeof page.totalItems === "number"
          ? page.totalItems
          : items.length;

      const detailedOrders = await Promise.all(
        items.map(async (order) => {
          let shipmentDetails = null;
          try {
            const shipmentRes = await api.get(`/shipments/order/${order.id || order.orderId}`);
            shipmentDetails = shipmentRes.data;
          } catch {}

          const itemsWithDetails = await Promise.all(
            (order.items || []).map(async (item) => {
              const product = await fetchProductDetails(item.productId);
              return {
                ...item,
                productName: product?.name || item.productId,
                imageUrl: product?.imageUrl || null,
              };
            })
          );

          return {
            ...order,
            shipmentDetails,
            items: itemsWithDetails,
          };
        })
      );

      setOrders(detailedOrders);
      setTotalCount(count);
    }
  } catch (err) {
    console.error("Error loading orders", err);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};





  useEffect(() => {
    loadOrders();
  }, [pageIndex, filterStatus]);

  const handleStatusEdit = (orderId, status) => {
    setEditingOrderId(orderId);
    setEditingStatus(status);
  };

  const handleStatusUpdate = async (orderId, shipmentId) => {
  try {
    await api.put(`/shipments/${shipmentId}/status`, {
      newStatus: editingStatus,
      statusDate: new Date().toISOString(),
    });
    setSuccessMsg("Shipment status updated!");
    setEditingOrderId(null);
    loadOrders();

    
    setTimeout(() => {
      setSuccessMsg("");
    }, 1000);

  } catch (error) {
    console.error("Update failed", error);
  }
};


  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="mr-container">
      <header className="mr-header">
        <h1>Manage Orders</h1>
      </header>

      {successMsg && <div className="mr-success">{successMsg}</div>}

      <div className="mr-filters" style={{ marginBottom: "1rem" }}>
  <div className="mr-select-wrapper" style={{ width: "300px" }}>
    <Select
      options={statusOptions}
      value={filterStatus}
      onChange={(opt) => {
        setFilterStatus(opt || null);
        setPageIndex(0);
      }}
      isClearable
      placeholder="Filter by Shipment Status"
      classNamePrefix="mr-select"
    />
  </div>
  <button
    className="mr-btn mr-btn-secondary"
    onClick={() => {
      setFilterStatus(null);
      setPageIndex(0);
    }}
  >
    Reset
  </button>
</div>


      {loading ? (
  <p>Loading orders...</p>
) : (
  <div className="mr-table-wrap">
    <table className="mr-table">
      <thead>
  <tr>
    <th>Address</th>
    <th>Items</th>
    <th>Shipment Status</th>
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {orders.length > 0 ? (
    orders.map((order) => {
      const shipment = order.shipmentDetails;
      return (
        <tr key={order.id}>
          {/* <td>#{order.id}</td> */}

          <td>
            {shipment?.address
              ? `${shipment.address.street}, ${shipment.address.city}, ${shipment.address.country}`
              : "No Address"}
          </td>

          <td>
            {order.items.map((item, i) => (
              <div key={i} className="d-flex align-items-center gap-2 mb-2">
                {item.imageUrl ? (
                  <img
                    src={`${BASE_URL}${item.imageUrl}`}
                    alt={item.productName}
                    className="rounded"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#eee",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "5px",
                      fontSize: "10px",
                    }}
                  >
                    No Image
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: "bold" }}>{item.productName}</div>
                  <div>Quantity: {item.quantity}</div>
                  <div>Price: {format(convert(item.price))}</div>
                </div>
              </div>
            ))}
          </td>

          {/* <td className="fw-bold">{format(convert(order.total))}</td> */}

          <td>
            {editingOrderId === order.id ? (
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(parseInt(e.target.value))}
              >
                {Object.entries(shipmentStatusNames).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={`badge ${
                  shipment?.status === 2
                    ? "bg-success"
                    : shipment?.status === 1
                    ? "bg-info text-dark"
                    : shipment?.status === 0
                    ? "bg-warning text-dark"
                    : "bg-danger"
                }`}
              >
                {shipmentStatusNames[shipment?.status] || "Pending"}
              </span>
            )}
          </td>

          <td style={{ textAlign: "right" }}>
            {editingOrderId === order.id ? (
              <button
                className="mp-btn mp-btn-success"
                onClick={() => handleStatusUpdate(order.id, shipment?.id)}
              >
                <FaCheck />
              </button>
            ) : (
              <button
                className="mp-btn mp-btn-secondary"
                onClick={() =>
                  handleStatusEdit(order.id, shipment?.status || 0)
                }
              >
                <FaEdit />
              </button>
            )}
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="4" style={{ textAlign: "center" }}>
        No orders found.
      </td>
    </tr>
  )}
</tbody>

    </table>

    {totalPages > 1 && (
      <div className="mr-pagination">
        <button
          className="mr-btn mr-btn-secondary"
          onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
          disabled={pageIndex === 0}
        >
          ← Prev
        </button>
        <span style={{ margin: "0 12px" }}>
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          className="mr-btn mr-btn-secondary"
          onClick={() => setPageIndex((i) => Math.min(i + 1, totalPages - 1))}
          disabled={pageIndex === totalPages - 1}
        >
          Next →
        </button>
      </div>
    )}
  </div>
)}
</div>
  );
}
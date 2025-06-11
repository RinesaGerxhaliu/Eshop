import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../Styles/profile.css";
import AddAddressForm from "./AddAddressForm";
import EditAddressForm from "./EditAddressForm";
import { useNavigate } from "react-router-dom";



function UserProfile() {
  const { isLoggedIn } = useAuth();

  const [userInfo, setUserInfo] = useState(null);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("info");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 2,
    totalCount: 0,
  });
  const isAdmin = () => {
  // Supozojmë që userInfo.role ose userInfo.roles ekziston
  if (!userInfo) return false;
  if (userInfo.role) {
    return userInfo.role.toLowerCase() === "admin";
  }
  // Nëse rolet janë në një array
  if (userInfo.roles && Array.isArray(userInfo.roles)) {
    return userInfo.roles.some(r => r.toLowerCase() === "admin");
  }
  return false;
};


  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const token = getToken();
    if (token && isLoggedIn) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.sub;
        localStorage.setItem("userId", userId);
        setUserInfo(decoded);
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Failed to decode token");
      }
    }
    setUserInfoLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      if (activeSection === "orders") setError("No valid token found");
      if (activeSection === "addressBook") setAddressError("No valid token found");
      return;
    }

    if (activeSection === "orders") {
      setLoading(true);
      fetchOrders(token, pagination.pageIndex, pagination.pageSize);
    } else if (activeSection === "addressBook") {
      setAddressLoading(true);
      fetchAddresses(token);
    } else {
      setSelectedOrder(null);
    }
  }, [activeSection, pagination.pageIndex, pagination.pageSize]);

  const fetchOrders = async (token, pageIndex, pageSize) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found.");

      const response = await fetch(
        `https://localhost:5050/orders?PageIndex=${pageIndex}&PageSize=${pageSize}&CustomerId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();

      setOrders(data.orders.data || []);
      setPagination({
        pageIndex: data.orders.pageIndex,
        pageSize: data.orders.pageSize,
        totalCount: data.orders.count,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (token) => {
    try {
      const response = await fetch(`https://localhost:5050/saved-addresses/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAddresses([]);
          setAddressError(null);
          return;
        } else {
          throw new Error("Failed to fetch saved addresses");
        }
      }

      const data = await response.json();
      const addr = data.address;

      if (!addr) {
        setAddresses([]);
        setAddressError(null);
        return;
      }

      const flattened = [
        {
          id: addr.id,
          customerId: addr.customerId,
          street: addr.address.street,
          city: addr.address.city,
          state: addr.address.state,
          postalCode: addr.address.postalCode,
          country: addr.address.country,
          phoneNumber: addr.address.phoneNumber,
          isDefault: addr.isDefault,
        },
      ];

      setAddresses(flattened);
      setAddressError(null);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setAddressError("Error fetching addresses.");
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.pageIndex < Math.ceil(pagination.totalCount / pagination.pageSize) - 1) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
    }
  };

  const handlePreviousPage = () => {
    if (pagination.pageIndex > 0) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
    }
  };

  const navigate = useNavigate();

const handleOrdersPageRedirect = () => {
  const userId = localStorage.getItem("userId");
  if (userId) navigate(`/user-orders/${userId}`);
};


  return (
    <div className="profile-container">
      <div className="myaccount-container">
        <h2 className="myaccountt">My Account</h2>
      </div>

      <div className="profile-content">
        <div className="left-panel">
          <h2 className="myaccount">My Info</h2>
          <div className="button-group">
            <button onClick={() => setActiveSection("info")}>My Info</button>
          <div className="button-group">
 

  {!isAdmin() && (
    <>
      <button onClick={() => setActiveSection("addressBook")}>My Address Book</button>
      <button onClick={handleOrdersPageRedirect}>My Orders</button>
    </>
  )}
</div>
          </div>
        </div>

        <div className="right-panel">
          <div className="section-content">
            {activeSection === "info" && (
              <div className="user-info">
                <h2 className="myaccount">Personal Information</h2>
                {userInfoLoading ? (
                  <p>Loading user info...</p>
                ) : userInfo ? (
                  <>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Full Name:</strong> {userInfo.name || `${userInfo.given_name || ""} ${userInfo.family_name || ""}`}</p>
                  </>
                ) : (
                  <p>No user information available.</p>
                )}
              </div>
            )}

            {activeSection === "addressBook" && (
              <div className="address-book-section">
                {addressLoading && <p>Loading addresses...</p>}
                {addressError && <p style={{ color: "red" }}>{addressError}</p>}

                {!editingAddress ? (
                  <>
                    {addresses.length > 0 ? (
                      <div className="address-list">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="address-card">
                            <p className="section-title">Your Saved Address</p>
                            <p><strong>Street:</strong> {addr.street}</p>
                            <p><strong>City:</strong> {addr.city}</p>
                            <p><strong>State:</strong> {addr.state}</p>
                            <p><strong>Postal Code:</strong> {addr.postalCode}</p>
                            <p><strong>Country:</strong> {addr.country}</p>
                            <p><strong>Phone:</strong> {addr.phoneNumber}</p>
                            {addr.isDefault && <p className="default-label">(Default)</p>}
                            <button className="edit-btn" onClick={() => setEditingAddress(addr)}>Edit</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p>No saved addresses.</p>
                        {!addingAddress && (
                          <button onClick={() => setAddingAddress(true)}>Add Address</button>
                        )}
                      </>
                    )}

                    {addingAddress && (
                      <div className="address-form-wrapper">
                        <AddAddressForm
                          customerId={userInfo?.sub || localStorage.getItem("userId")}
                          token={getToken()}
                          onSuccess={() => {
                            setAddingAddress(false);
                            fetchAddresses(getToken());
                          }}
                          onCancel={() => setAddingAddress(false)}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <EditAddressForm
                    address={editingAddress}
                    token={getToken()}
                    onSuccess={() => {
                      setEditingAddress(null);
                      fetchAddresses(getToken());
                    }}
                    onCancel={() => setEditingAddress(null)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../Styles/profile.css';

function UserProfile() {
  const { isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('info');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfoLoading, setUserInfoLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 2,
    totalCount: 0,
  });

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const token = getToken();
    if (token && isLoggedIn) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.sub; 
        localStorage.setItem('userId', userId);
        setUserInfo(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Failed to decode token');
      }
    }
    setUserInfoLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeSection === 'orders') {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError('No valid token found');
        setLoading(false);
        return;
      }
      fetchOrders(token, pagination.pageIndex, pagination.pageSize);
    } else {
      setSelectedOrder(null);
    }
  }, [activeSection, pagination.pageIndex, pagination.pageSize]);

  const fetchOrders = async (token, pageIndex, pageSize) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found.');
        setLoading(false);
        return;
      }
  
      const response = await fetch(
        `https://localhost:5050/orders?PageIndex=${pageIndex}&PageSize=${pageSize}&CustomerId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) throw new Error('Failed to fetch orders');
  
      const data = await response.json();
      setOrders(data.orders.data || []);
      setPagination({
        pageIndex: data.orders.pageIndex,
        pageSize: data.orders.pageSize,
        totalCount: data.orders.count,
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    const token = getToken();
    try {
      const response = await fetch(`https://localhost:5050/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error('Error fetching order details:', errorResponse);
        throw new Error('Failed to fetch order details');
      }
  
      const data = await response.json();
      setSelectedOrder(data.order); 
      console.log('Fetched order:', data.order); 
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Error fetching order details.');
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

  const handleOrderClick = (orderId) => {
    console.log('Fetching order details for ID:', orderId);
    fetchOrderById(orderId); 
  };
  
  useEffect(() => {
    if (selectedOrder) {
      console.log('Selected order updated:', selectedOrder);
    }
  }, [selectedOrder]);

  return (
    <div className="profile-container">
      <div className="myaccount-container">
        <h2 className="myaccountt">My Account</h2>
      </div>

      <div className="profile-content">
        <div className="left-panel">
          <h2 className="myaccount">My Info</h2>
          <div className="button-group">
            <button onClick={() => setActiveSection('info')}>My Info</button>
            <button onClick={() => setActiveSection('orders')}>My Orders</button>
            <button onClick={() => setActiveSection('addressBook')}>My Address Book</button>
          </div>
        </div>

        <div className="right-panel">
          <div className="section-content">
            {activeSection === 'info' && (
              <div className="user-info">
                <h2 className="myaccount">Personal Information</h2>
                {userInfoLoading ? (
                  <p>Loading user info...</p>
                ) : userInfo ? (
                  <>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Full Name:</strong> {userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`}</p>
                  </>
                ) : (
                  <p>No user information available.</p>
                )}
              </div>
            )}

            {activeSection === 'orders' && (
              <div className="orders-section">
                {loading && <p>Loading orders...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {!selectedOrder ? (
                  <>
                    <ul>
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <li key={order.id} onClick={() => handleOrderClick(order.id)} style={{ cursor: 'pointer' }}>
                            <p><strong>Order Name:</strong> {order.orderName}</p>
                            <p><strong>Items:</strong> {order.items?.length}</p>
                          </li>
                        ))
                      ) : (
                        <p>No orders found.</p>
                      )}
                    </ul>

                    <div className="pagination-controls">
                      <button onClick={handlePreviousPage} disabled={pagination.pageIndex <= 0}>Previous</button>
                      <button
                        onClick={handleNextPage}
                        disabled={pagination.pageIndex >= Math.ceil(pagination.totalCount / pagination.pageSize) - 1}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Name:</strong> {selectedOrder.orderName}</p>  
                    <h4>Items</h4>
                    <ul>
                      {selectedOrder.items.map((item, i) => (
                        <li key={i}>
                          <p><strong>Quantity:</strong> {item.quantity}</p>
                          <p><strong>Price:</strong> €{item.price}</p>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => setSelectedOrder(null)}>Back to Orders</button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'addressBook' && (
              <div className="address-book-section">
                <h3>Your Address Book</h3>
                <p>Here is your address book...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

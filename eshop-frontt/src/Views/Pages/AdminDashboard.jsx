// src/Components/Layout/AdminDashboard.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import AdminSidebar   from '../../Components/Layout/AdminSidebar';
import ChartComponent from '../../Components/ChartComponent';
import ManageProducts from '../../Components/ManageProducts';  // ← make sure this path matches!
import ManageUsers from '../../Components/ManageUsers';  // Shtoni këtë

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar />
      
      <div
        style={{
          marginLeft: '240px',
          padding: '20px',
          width: '100%',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Routes>
          {/* Dashboard home at /admin */}
          <Route index element={<ChartComponent />} />

          {/* Manage Products at /admin/products */}
          <Route path="manage-products" element={<ManageProducts />} />
          <Route path="manage-users" element={<ManageUsers />} />  {/* Shtoni këtë rruge */}
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

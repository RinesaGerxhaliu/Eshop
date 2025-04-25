import React from 'react';
import AdminSidebar from '../../Components/Layout/AdminSidebar';
import ChartComponent from '../../Components/ChartComponent';  // Import your chart component

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar />
      
      <div style={{ marginLeft: '240px', padding: '20px', width: '100%', backgroundColor: '#f9f9f9' }}>
        <ChartComponent />
        
    
      </div>
    </div>
  );
};

export default AdminDashboard;

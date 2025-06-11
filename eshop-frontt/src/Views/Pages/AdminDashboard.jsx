import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../../Components/Layout/AdminSidebar';
import ChartComponent from '../../Components/ChartComponent';
import ManageProducts from '../../Components/ManageProducts';
import ManageUsers from '../../Components/ManageUsers';
import ManageReviews from '../../Components/ManageReviews';
import ManageBrands from '../../Components/ManageBrands';
import ManageCategories from '../../Components/ManageCategories';
import ShippingMethod from '../../Components/ShippingMethod';
import ManageOrders from '../../Components/ManageOrders';
import Subcategories from '../../Components/Subcategories';  

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
          <Route index element={<ChartComponent />} />
            <Route path="categories/:categoryId/subcategories" element={<Subcategories />} />

          <Route path="manage-products" element={<ManageProducts />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-reviews" element={<ManageReviews />} />
          <Route path="manage-brands" element={<ManageBrands />} />
          <Route path="manage-categories" element={<ManageCategories />} />
          <Route path="shipping-method" element={<ShippingMethod />}/>
          <Route path="manage-orders" element={<ManageOrders />}>
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

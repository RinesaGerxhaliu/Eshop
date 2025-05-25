import { Routes, Route } from 'react-router-dom';
import AdminSidebar   from '../../Components/Layout/AdminSidebar';
import ChartComponent from '../../Components/ChartComponent';
import ManageProducts from '../../Components/ManageProducts';  
import ManageUsers from '../../Components/ManageUsers'; 
import ManageReviews from '../../Components/ManageReviews'; 
import ManageBrands from '../../Components/ManageBrands'; 
import ManageCategories from '../../Components/ManageCategories';
import SubcategoriesList from '../../Components/UI/SubcategoriesList';

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

          <Route path="manage-products" element={<ManageProducts />} />
          <Route path="manage-users" element={<ManageUsers />} /> 
          <Route path="manage-reviews" element={<ManageReviews />} />
          <Route path="manage-brands" element={<ManageBrands />} />
          <Route path="manage-categories" element={<ManageCategories />}>

        <Route
          path=":categoryId/subcategories"
          element={<SubcategoriesList />}
        />
      </Route>
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

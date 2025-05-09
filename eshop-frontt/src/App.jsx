
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Login from './Components/Features/auth/Login';
import Register from './Components/Features/auth/Register';
import Homepage from './Views/Pages/Homepage';
import { AuthProvider } from './contexts/AuthContext';
import UserProfile from './Views/Pages/UserProfile';
import ShoppingCartPage from './Views/Pages/ShoppingCart';
import { CurrencyProvider } from './contexts/CurrencyContext';
import Dashboard from './Views/Pages/AdminDashboard';
import PrivateRoute from './Components/PrivateRoute';
import Shop from './Views/Pages/Shop';
import ProductDetails from './Views/Pages/ProductDetails';
import Sidebar from './Views/Pages/Sidebar'; 
import FilteredProducts from './Views/Pages/FilteredProducts';
import ProductSearchResults from './Components/UI/ProductSearchResults '

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const location = useLocation();
  const [sortByPrice, setSortByPrice] = useState(null);

  const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');
  return (
    <>
      <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} /> 
      
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/filter/:filterType/:filterId" element={<FilteredProducts />} />
        <Route path="/products/sorted/by-price" element={<FilteredProducts />} />
        <Route path="/products/sorted/by-price-descending" element={<FilteredProducts />} />

        <Route  path="/products" element={<ProductSearchResults />} />
        
        <Route
           path="/admin-dashboard/*"
          element={
            <PrivateRoute roles={['admin']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminDashboard && <Footer />}
      
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} setSortByPrice={setSortByPrice} />} {/* Pass the setSortByPrice function here */}
    </>
  );
}

export default App;

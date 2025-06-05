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
import Wishlist from './Views/Pages/Wishlist';
import { CurrencyProvider } from './contexts/CurrencyContext';
import Dashboard from './Views/Pages/AdminDashboard';
import PrivateRoute from './Components/PrivateRoute'; 
import Shop from './Views/Pages/Shop';
import ProductDetails from './Views/Pages/ProductDetails';
import Sidebar from './Views/Pages/Sidebar';
import FilteredProducts from './Views/Pages/FilteredProducts';
import ProductSearchResults from './Components/UI/ProductSearchResults '
import CreateOrderPage from './Views/Pages/CreateOrderPage';
import Subcategories from "./Components/Subcategories";

function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </Router>
  );
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [sortByPrice, setSortByPrice] = useState(null);
  const isAdminDashboard = location.pathname.startsWith('/admin-dashboard');
  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <AuthProvider> 
      {!shouldHideNavbar && (
        <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/cart" element={<ShoppingCartPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/order" element={<CreateOrderPage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/filter/:filterType/:filterId" element={<FilteredProducts />} />
        <Route path="/products/sorted/by-price" element={<FilteredProducts />} />
        <Route path="/products/sorted/by-price-descending" element={<FilteredProducts />} />
        <Route path="/products" element={<ProductSearchResults />} />
        <Route path="/categories/:categoryId/subcategories" element={<Subcategories />} />
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

      {!isAdminDashboard && !shouldHideNavbar && <Footer />}

      {sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          setSortByPrice={setSortByPrice}
        />
      )}
    </AuthProvider>
  );
}


export default App;

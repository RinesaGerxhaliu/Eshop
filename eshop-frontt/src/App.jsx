import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Login from './Components/Features/auth/Login';
import Register from './Components/Features/auth/Register';
import Homepage from './Views/Pages/Homepage';
import { AuthProvider } from './contexts/AuthContext';
import UserProfile from './Views/Pages/UserProfile';
import Shop from './Views/Pages/Shop';
import ProductDetails from './Views/Pages/ProductDetails';
import ShoppingCartPage from './Views/Pages/ShoppingCart';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route path="/homepage" element={<Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/cart" element={<ShoppingCartPage />} />



          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;

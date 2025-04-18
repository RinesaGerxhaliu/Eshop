import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Login from './Components/Features/auth/Login';
import Register from './Components/Features/auth/Register';
import Homepage from './Views/Pages/Homepage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Render homepage at "/" */}
          <Route path="/" element={<Homepage />} />

          {/* Or if you’d rather keep the "/homepage" URL: */}
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/register" element={<Register />} />
          {/* Login page */}
          <Route path="/login" element={<Login />} />

          {/* Catch‑all: redirect anything else to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;

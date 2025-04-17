import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-custom">
      <div className="container">
        <div className="left-links">
          <Link className="nav-link" to="/homepage">ABOUT US</Link>
          <Link className="nav-link" to="#">SHOP</Link>
          <Link className="nav-link" to="#">CONTACT</Link>
        </div>

        <Link className="navbar-brand" to="/homepage">Moujan Lusso</Link>

        <div className="right-links">
  {isLoggedIn ? (
    <div className="user-actions">
      <FaUserCircle className="user-icon" />
      <button className="nav-link logout-btn" onClick={handleLogout}>
        LOGOUT
      </button>
    </div>
  ) : (
    <div className="user-actions">
      <FaUserCircle className="user-icon" />
      <Link className="nav-link sign-in-btn" to="/login">SIGN IN</Link>
    </div>
  )}
          <select className="currency-select">
            <option>EUR</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <div className="left-links">
          <Link className="nav-link" to="/homepage">ABOUT US</Link>
          <Link className="nav-link" to="#">SHOP</Link>
          <Link className="nav-link" to="#">CONTACT</Link>
        </div>

        <Link className="navbar-brand" to="/homepage">Moujan Lusso</Link>

        <div className="right-links">
          {isLoggedIn ? (
            <button className="nav-link logout" onClick={handleLogout}>
              LOGOUT
            </button>
          ) : (
            <Link className="nav-link login" to="/login">SIGN IN</Link>
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

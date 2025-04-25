import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingBag } from "react-icons/fa";
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
          <Link className="nav-link" to="/shop">SHOP</Link>
          <Link className="nav-link" to="#">CONTACT</Link>
        </div>

        <Link className="navbar-brandd" to="/homepage">Moujan Lusso</Link>

        <div className="right-links">
            {isLoggedIn ? (
              <div className="user-actions">
                <FaShoppingBag className="user-icon" 
                 onClick={() => navigate('/cart')}
                 style={{ cursor: 'pointer' }}
                />
              <FaUserCircle
                className="user-icon"
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              />
              <button className="nav-link logout-btn" onClick={handleLogout}>
                LOGOUT
              </button>
            </div>
            ) : (
              <div className="user-actions">
                 <FaShoppingBag className="user-iconn" />
                <FaUserCircle className="user-iconn" />
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
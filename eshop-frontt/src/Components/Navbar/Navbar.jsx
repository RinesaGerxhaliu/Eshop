import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingBag } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, logout, roles } = useAuth();
  const { currency, rates, setCurrency } = useCurrency();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fallback list shown until real rates arrive
  const supported = ["EUR", "USD", "GBP"];
  const codes = Object.keys(rates || {});
  const options = codes.length > 1 ? codes : supported;

  return (
    <nav className="navbar-custom">
      <div className="container">
        <div className="left-links">
          <Link className="nav-link" to="/homepage">
            ABOUT US
          </Link>
          <Link className="nav-link" to="/shop">
            SHOP
          </Link>
          <Link className="nav-link" to="#">
            CONTACT
          </Link>
        </div>

        <Link className="navbar-brandd" to="/homepage">
          Trendora
        </Link>

        <div className="right-links">
          {isLoggedIn ? (
            <div className="user-actions">
              <FaShoppingBag
                className="user-icon"
                onClick={() => navigate("/cart")}
                style={{ cursor: "pointer" }}
              />
              <FaUserCircle
                className="user-icon"
                onClick={() => navigate("/profile")}
                style={{ cursor: "pointer" }}
              />
              {roles.includes("admin") && (
                <Link className="nav-link logout-btnn" to="/admin-dashboard">
                  Dashboard
                </Link>
              )}
              <button className="nav-link logout-btn" onClick={handleLogout}>
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="user-actions">
              <FaShoppingBag className="user-iconn" />
              <FaUserCircle className="user-iconn" />
              <Link className="nav-link sign-in-btn" to="/login">
                SIGN IN
              </Link>
            </div>
          )}

          <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {options.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

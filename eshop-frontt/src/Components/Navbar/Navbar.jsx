import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingBag, FaBars } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import Sidebar from "../../Views/Pages/Sidebar";
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, logout, roles } = useAuth();
  const { currency, rates, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    window.location.href = "/login";

  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      console.log(`Searching for: ${searchQuery}`);
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate("/cart"); // Navigate to the cart if logged in
    } else {
      navigate("/cart"); // Redirect to login if not logged in
    }
  };

  const supported = ["EUR", "USD", "GBP"];
  const codes = Object.keys(rates || {});
  const options = codes.length > 1 ? codes : supported;

  return (
    <>
      <nav className="navbar-custom">
        <div className="container">
          <div className="left-links">
            <FaBars
              className="menu-icon"
              onClick={() => setSidebarOpen(true)}
              style={{
                cursor: "pointer",
                fontSize: "24px",
                marginRight: "10px",
              }}
            />
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

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          <div className="right-links">
            {isLoggedIn ? (
              <div className="user-actions">
                <FaShoppingBag
                  className="user-icon"
                  onClick={handleCartClick} // Cart icon click handler
                  style={{
                    cursor: "pointer",
                  }}
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
                <FaShoppingBag
                  className="user-iconn"
                  onClick={handleCartClick} // Redirect to login if not logged in
                  style={{
                    cursor: "pointer",
                  }}
                  title="Please sign in to view your cart"
                />
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

      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
    </>
  );
};

export default Navbar;

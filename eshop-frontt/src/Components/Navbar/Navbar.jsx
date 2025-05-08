import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingBag, FaBars } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import "./Navbar.css";
import Sidebar from "../../Views/Pages/Sidebar";

const Navbar = () => {
  const { isLoggedIn, logout, roles } = useAuth();
  const { currency, rates, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              style={{ cursor: "pointer", fontSize: "24px", marginRight: "10px" }}
            />
            <Link className="nav-link" to="/homepage">ABOUT US</Link>
            <Link className="nav-link" to="/shop">SHOP</Link>
            <Link className="nav-link" to="#">CONTACT</Link>
          </div>

          <Link className="navbar-brandd" to="/homepage">Trendora</Link>

          <div className="right-links">
            {isLoggedIn ? (
              <div className="user-actions">
                <FaShoppingBag className="user-icon" onClick={() => navigate("/cart")} style={{ cursor: "pointer" }} />
                <FaUserCircle className="user-icon" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }} />
                {roles.includes("admin") && (
                  <Link className="nav-link logout-btnn" to="/admin-dashboard">Dashboard</Link>
                )}
                <button className="nav-link logout-btn" onClick={handleLogout}>LOGOUT</button>
              </div>
            ) : (
              <div className="user-actions">
                <FaShoppingBag className="user-iconn" />
                <FaUserCircle className="user-iconn" />
                <Link className="nav-link sign-in-btn" to="/login">SIGN IN</Link>
              </div>
            )}

            <select
              className="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {options.map((code) => (
                <option key={code} value={code}>{code}</option>
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

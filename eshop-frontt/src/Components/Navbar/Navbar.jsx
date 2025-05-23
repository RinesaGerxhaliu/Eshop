import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaShoppingBag, FaBars, FaSignOutAlt } from "react-icons/fa";
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const location = useLocation();

  React.useEffect(() => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  }, [location.pathname]);


  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length >= 2) {
      try {
        const res = await fetch(
          `https://localhost:5050/products/search?query=${encodeURIComponent(value)}&pageIndex=0&pageSize=6`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const supported = ["EUR", "USD", "GBP"];
  const codes = Object.keys(rates || {});
  const options = codes.length > 1 ? codes : supported;

  return (
    <>
      <nav className="navbar-modern">
        <div className="navbar-inner">
          {/* Left: Menu & Links */}
          <div className="nav-block nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(true)} />
            <Link className="nav-link" to="/homepage">About Us</Link>
            <Link className="nav-link" to="/shop">Shop</Link>
          </div>
          {/* Center: Brand + Search */}
          <div className="nav-block nav-center">
            <Link className="navbar-brandd" to="/homepage">
              Trendora
            </Link>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleInputChange}
                className="search-input"
                autoComplete="off"
                onFocus={() => suggestions.length && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button type="submit" className="search-button">
                Search
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((product) => (
                    <li
                      key={product.id}
                      className="suggestion-item"
                      onMouseDown={() => {
                        setSearchQuery(product.name);
                        setShowSuggestions(false);
                        navigate(`/products/${product.id}`);
                      }}
                    >
                      <img
                        src={product.imageUrl ? `https://localhost:5050${product.imageUrl}` : "/placeholder.png"}
                        alt={product.name}
                        className="suggestion-thumb"
                      />
                      <div style={{ flex: 1 }}>
                        <div className="suggestion-title">{product.name}</div>
                        <div className="suggestion-price">{product.price.toFixed(2)} €</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>
          <div className="nav-block nav-right">
            <FaShoppingBag className="user-icon" onClick={handleCartClick} title="View cart" />
            {isLoggedIn ? (
              <>
                <FaUserCircle className="user-icon" onClick={() => navigate("/profile")} />
                {roles.includes("admin") && (
                  <Link className="nav-link" to="/admin-dashboard">
                    Dashboard
                  </Link>
                )}
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="logout-icon" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <FaUserCircle className="user-icon" />
                <Link className="nav-link" to="/login">
                  Sign In
                </Link>
              </>
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

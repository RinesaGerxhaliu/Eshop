import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/sidebar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const API = "https://localhost:5050";

const Sidebar = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [activeView, setActiveView] = useState("main");
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingCats(true);
    fetch(`${API}/categories?PageIndex=0&PageSize=20`)  // mund ta ndryshosh sipas nevojës
      .then((res) => res.json())
      .then((data) => {
        // data.categories.data është array i kategorive
        setCategories(data.categories?.data || []);
      })
      .catch((err) => console.error("Fetch categories error:", err))
      .finally(() => setLoadingCats(false));

    setLoadingBrands(true);
    fetch(`${API}/brands?PageIndex=0&PageSize=20`)
      .then((res) => res.json())
      .then((data) => {
        // po ashtu brands.data është array i brendeve
        setBrands(data.brands?.data || []);
      })
      .catch((err) => console.error("Fetch brands error:", err))
      .finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleFilterClick = (type, id) => {
    onClose();
    navigate(`/products/filter/${type}/${id}`);
  };

  return (
    <div className="sidebar-overlay">
      <div className="sidebar" ref={sidebarRef}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {activeView === "main" && (
          <>
            <h3 className="toggle-header">View All</h3>
            <div className="sidebar-section">
              <h3
                className="toggle-header"
                onClick={() => setActiveView("categories")}
                style={{ cursor: "pointer" }}
              >
                Categories
              </h3>
            </div>

            <div className="sidebar-section">
              <h3
                className="toggle-header"
                onClick={() => setActiveView("brands")}
                style={{ cursor: "pointer" }}
              >
                Brands
              </h3>
            </div>

            <div className="sidebar-section">
              <h3
                className="toggle-header"
                onClick={() => navigate("/profile")}
                style={{ cursor: "pointer" }}
              >
                User Profile
              </h3>
            </div>
          </>
        )}

        {activeView === "categories" && (
          <>
            <button className="back-btn" onClick={() => setActiveView("main")}>
              ← Back
            </button>
            <div className="sidebar-section">
              <h3 className="toggle-header">All Categories</h3>
              <ul>
                {loadingCats ? (
                  <li>Loading categories…</li>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <li
                      key={cat.id}
                      onClick={() => handleFilterClick("category", cat.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {cat.name}
                    </li>
                  ))
                ) : (
                  <li>No categories available</li>
                )}
              </ul>
            </div>
          </>
        )}

        {activeView === "brands" && (
          <>
            <button className="back-btn" onClick={() => setActiveView("main")}>
              ← Back
            </button>
            <div className="sidebar-section">
              <h3 className="toggle-header">All Brands</h3>
              <ul>
                {loadingBrands ? (
                  <li>Loading brands…</li>
                ) : brands.length > 0 ? (
                  brands.map((brand) => (
                    <li
                      key={brand.id}
                      onClick={() => handleFilterClick("brand", brand.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {brand.name}
                    </li>
                  ))
                ) : (
                  <li>No brands available</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

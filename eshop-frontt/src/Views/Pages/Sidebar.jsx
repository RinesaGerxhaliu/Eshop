import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    fetch(`${API}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error("Fetch categories error:", err))
      .finally(() => setLoadingCats(false));

    setLoadingBrands(true);
    fetch(`${API}/brands`)
      .then((res) => res.json())
      .then((data) => setBrands(data.brands || []))
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
              >
                Categories
              </h3>
            </div>

            <div className="sidebar-section">
              <h3
                className="toggle-header"
                onClick={() => setActiveView("brands")}
              >
                Brands
              </h3>
            </div>

            <div className="sidebar-section">
              <h3
                className="toggle-header"
                onClick={() => navigate("/profile")}
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
                {loadingCats
                  ? <li>Loading categories…</li>
                  : categories.length > 0
                    ? categories.map(cat => (
                      // ← REPLACE THIS:
                      // <li key={cat.id}>
                      //   <Link to={`/products/filter/category/${cat.id}`}>
                      //     {cat.name}
                      //   </Link>
                      // </li>

                      // …WITH THIS:
                      <li
                        key={cat.id}
                        onClick={() => {
                          onClose();
                          navigate(`/products/filter/category/${cat.id}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {cat.name}
                      </li>
                    ))
                    : <li>No categories available</li>
                }
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
                {loadingBrands
                  ? <li>Loading brands…</li>
                  : brands.length > 0
                    ? brands.map(brand => (
                      <li
                        key={brand.id}
                        onClick={() => {
                          onClose();
                          navigate(`/products/filter/brand/${brand.id}`);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {brand.name}
                      </li>
                    ))
                    : <li>No brands available</li>
                }
              </ul>
            </div>
          </>
        )}


      </div>
    </div>
  );
};

export default Sidebar;
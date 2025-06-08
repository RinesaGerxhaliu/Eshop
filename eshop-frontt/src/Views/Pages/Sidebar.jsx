import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/sidebar.css";

const API = "https://localhost:5050";

export default function Sidebar({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [expandedCats, setExpandedCats] = useState([]);
  const [subMap, setSubMap] = useState({});
  const [loadingSubs, setLoadingSubs] = useState({});

  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingCats(true);
    fetch(`${API}/categories?PageIndex=0&PageSize=50`)
      .then(res => res.json())
      .then(d => setCategories(d.categories?.data || []))
      .catch(console.error)
      .finally(() => setLoadingCats(false));

    setLoadingBrands(true);
    fetch(`${API}/brands?PageIndex=0&PageSize=50`)
      .then(res => res.json())
      .then(d => setBrands(d.brands?.data || []))
      .catch(console.error)
      .finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    const handler = e => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleFilter = (type, id) => {
    onClose();
    navigate(`/products/filter/${type}/${id}`);
  };

  const toggleCat = catId => {
    if (expandedCats.includes(catId)) {
      setExpandedCats(expandedCats.filter(id => id !== catId));
    } else {
      setExpandedCats([...expandedCats, catId]);
      if (!subMap[catId]) {
        setLoadingSubs(prev => ({ ...prev, [catId]: true }));
        fetch(`${API}/categories/${catId}/subcategories?PageIndex=0&PageSize=50`)
          .then(r => r.json())
          .then(d => {
            setSubMap(prev => ({ ...prev, [catId]: d.subcategories?.data || [] }));
          })
          .catch(console.error)
          .finally(() => {
            setLoadingSubs(prev => ({ ...prev, [catId]: false }));
          });
      }
    }
  };

  return (
    <div className="sidebar-overlay">
      <div className="sidebar" ref={sidebarRef}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="sidebar-section">
          <h3>All Categories</h3>
          <ul>
            {loadingCats && <li>Loading categories…</li>}
            {!loadingCats && categories.length === 0 && <li>No categories available</li>}
            {!loadingCats && categories.map(cat => (
              <React.Fragment key={cat.id}>
                <li onClick={() => toggleCat(cat.id)}>{cat.name}</li>
                {expandedCats.includes(cat.id) && (
                  <ul className="sidebar-sublist">
                    {loadingSubs[cat.id] && <li>Loading…</li>}
                    {!loadingSubs[cat.id] && subMap[cat.id]?.length === 0 && <li>No subcategories</li>}
                    {!loadingSubs[cat.id] && subMap[cat.id].map(sub => (
                      <li key={sub.id} onClick={() => handleFilter("subcategory", sub.id)}>{sub.name}</li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>All Brands</h3>
          <ul>
            {loadingBrands && <li>Loading brands…</li>}
            {!loadingBrands && brands.length === 0 && <li>No brands available</li>}
            {!loadingBrands && brands.map(br => (
              <li key={br.id} onClick={() => handleFilter("brand", br.id)}>{br.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

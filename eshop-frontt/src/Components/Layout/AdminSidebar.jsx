import { FaUserCog, FaBoxOpen, FaSignOutAlt, FaChartBar, FaShippingFast, FaShoppingCart } from "react-icons/fa";
import { MdRateReview, MdStore } from "react-icons/md";
import { FaListUl } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
      <ul className="sidebar-menu">
        <li onClick={() => navigate("/admin-dashboard")}>
          <FaChartBar className="sidebar-icon" />
          Dashboard
        </li>
        <li onClick={() => navigate("/admin-dashboard/manage-users")}>
          <FaUserCog className="sidebar-icon" />
          Manage Users
        </li>
        <li onClick={() => navigate("/admin-dashboard/manage-products")}>
          <FaBoxOpen className="sidebar-icon" />
          Manage Products
        </li>

        <li onClick={() => navigate("/admin-dashboard/manage-reviews")}>
          <MdRateReview className="sidebar-icon" />
          Manage Reviews
        </li>
        <li onClick={() => navigate("/admin-dashboard/manage-categories")}>
          <FaListUl className="sidebar-icon" />
          Manage Categories
        </li>


        <li onClick={() => navigate("/admin-dashboard/manage-brands")}>
          <MdStore className="sidebar-icon" />
          Manage Brands
        </li>

        <li onClick={() => navigate("/admin-dashboard/shipping-method")}>
          <FaShippingFast className="sidebar-icon" />
          Shipping Methods
        </li>

        <li onClick={() => navigate("/admin-dashboard/manage-orders")}>
          <FaShoppingCart className="sidebar-icon" />
          Manage Orders
        </li>

        <li onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" />
          Logout
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;

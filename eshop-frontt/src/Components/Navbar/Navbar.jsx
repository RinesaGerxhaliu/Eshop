import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="left-links">
        <a href="#">ABOUT US</a>
        <a href="#">SHOP</a>
        <a href="#">CONTACT</a>
      </div>
      <div className="logo">Moujan Lusso</div>
      <div className="right-links">
        <a href="#">LOGIN</a>
      
        <select>
          <option>EUR</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;

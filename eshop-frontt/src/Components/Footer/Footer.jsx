// src/Components/UI/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import './Footer.css';
import { FaTwitter, FaFacebookF, FaPinterestP, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <h2 className="footer-logo">Trendora</h2>

      {/* Primary Links */}
      <div className="footer-links primary-links">
        <Link to="/shop">Shop Now</Link>
        <Link to="#latest-arrivals">New Arrivals</Link>
        <Link to="/best-sellers">Best Sellers</Link>
      </div>

      <hr className="footer-divider" />

      {/* Secondary Links */}
      <div className="footer-links secondary-links">
        <Link to="/ingredients-glossary">Ingredients Glossary</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/terms">Terms & Conditions</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </div>

      {/* Social Icons */}
      <div className="footer-socials">
        <a href="https://twitter.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        <a href="https://facebook.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
        <a href="https://pinterest.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><FaPinterestP /></a>
        <a href="https://linkedin.com/company/Trendora" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
        <a href="https://instagram.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Trendora, Ltd. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
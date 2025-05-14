import React from "react";
import "./Footer.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand logo */}
        <h1 className="footer-logo">Trendora</h1>

        {/* Top navigation links */}
        <div className="footer-links top-links">
          <a href="/shop">Shop Now</a>
          <a href="/new-arrivals">New Arrivals</a>
          <a href="/best-sellers">Best Sellers</a>
        </div>

        <hr className="footer-divider" />

        {/* Secondary navigation links */}
        <div className="footer-links">
          <a href="/ingredients-glossary">Ingredients Glossary</a>
          <a href="/blog">Blog</a>
          <a href="/faq">FAQ</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact Us</a>
        </div>

        {/* Social media icons */}
        <div className="footer-socials">
          <a href="https://twitter.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
          <a href="https://facebook.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
          <a href="https://pinterest.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><i className="fab fa-pinterest-p"></i></a>
          <a href="https://linkedin.com/company/Trendora" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          <a href="https://instagram.com/TrendoraOfficial" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
        </div>

        {/* Bottom legal links */}
        <div className="footer-bottom">
          <p>
            <a href="/terms">Terms & Conditions</a> | <a href="/privacy">Privacy Policy</a>
          </p>
          <p>Copyright © 2025 Trendora, Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
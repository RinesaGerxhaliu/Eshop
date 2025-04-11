import React from "react";
import "./Footer.css";
import '@fortawesome/fontawesome-free/css/all.min.css';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <h1 className="footer-logo">Moujan Lusso</h1>

        <div className="footer-links top-links">
          <a href="#">BRANDS</a>
          <a href="#">MEDIA</a>
          <a href="#">PR AGENCIES</a>
        </div>

        <hr className="footer-divider" />

        <div className="footer-links">
          <a href="#">BRAND DIRECTORY</a>
          <a href="#">SHOP</a>
          <a href="#">FAQ</a>
          <a href="#">ABOUT</a>
          <a href="#">CONTACT</a>
        </div>

        <div className="footer-socials">
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-pinterest-p"></i></a>
          <a href="#"><i className="fab fa-linkedin-in"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>

        <div className="footer-bottom">
          <p><a href="#">Terms & Conditions</a> <a href="#">Privacy Policy</a></p>
          <p>Copyright © 2025 Moujan Lusso, Ltd. All rights reserved. Site credit.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

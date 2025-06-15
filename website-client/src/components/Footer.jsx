import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"

export default function Footer() {
  return (
    <footer className="footer" data-aos="fade-up">
      <div className="footer-links" data-aos="fade-up" data-aos-delay="100">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>

      <div className="footer-icons" data-aos="fade-up" data-aos-delay="200">
        <a href="#"><span className="icon">📷</span></a>
        <a href="#"><span className="icon">📘</span></a>
      </div>

      <p className="copyright" data-aos="fade-up" data-aos-delay="300">
        © 2024 Sweet Delights Bakery. All rights reserved.
      </p>
    </footer>
  );
}

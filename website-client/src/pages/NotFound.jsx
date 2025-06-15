import React from "react";
import { Link } from "react-router-dom";
// import "../scss/main.scss";
import "../styles/style.css"

export default function NotFound() {
  return (
    <div className="not-found">
      <h1 data-aos="fade-down">404</h1>
      <p data-aos="fade-up" data-aos-delay="100">Sahifa topilmadi yoki mavjud emas.</p>
      <Link to="/" className="back-home" data-aos="zoom-in" data-aos-delay="200">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}

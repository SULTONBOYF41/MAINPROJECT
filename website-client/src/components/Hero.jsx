// ✅ Hero.jsx (AOS qo‘shilgan)
import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"
import cake1 from "../assets/images/cake1.png";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${cake1})` }}>
      <div className="hero-overlay">
        <h1 className="hero-title" data-aos="fade-up">
          Indulge in Our Exquisite Cakes
        </h1>
        <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
          Experience the finest cakes made with love and the freshest ingredients.
        </p>
        {/* <button href="/menu" className="view-menu" data-aos="zoom-in" data-aos-delay="400">
          View Menu
        </button> */}
        <Link to="/menu" className="view-menu" data-aos="zoom-in" data-aos-delay="400">View Menu</Link>
      </div>
    </section>
  );
}

// Header.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/style.css";
import DarkModeToggle from "./DarkModeToggle";
import { initHoverGlow } from "../scripts/hover-glow";
import Logo from "../assets/icons/logo.jpg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    initHoverGlow();

    // Token borligini tekshiramiz
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <header className="main-header">
      <div>
        <Link to="/">
          <img src={Logo} alt="Sweet Delights Bakery Logo" className="logo" />
        </Link>
      </div>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="nav__links">Home</Link>
        <Link to="/menu" className="nav__links">Menu</Link>
        <Link to="/about" className="nav__links">About</Link>
        <Link to="/contact" className="nav__links">Contact</Link>
      </nav>

      <div className="header__buttons">
        {isLoggedIn ? (
          <Link to="/profile" className="order">Profile</Link>
        ) : (
          <Link to="/register" className="order">Register</Link>
        )}
        <DarkModeToggle />
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
          </svg>
        )}
      </button>
    </header>
  );
}

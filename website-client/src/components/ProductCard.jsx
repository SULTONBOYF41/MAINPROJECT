import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"

export default function ProductCard({ image, title, description }) {
  return (
    <div className="product-card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
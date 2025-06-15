import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"
import chocolate from "../assets/images/chocolate.jpg";
import vanilla from "../assets/images/vanilla.jpg";
import strawberry from "../assets/images/strawberry.jpg";

export default function SignatureCakes() {
  return (
    <section className="signature-cakes">
      <h2 className="section-title" data-aos="fade-up">Our Signature Cakes</h2>
      <div className="cake-list">
        <div className="cake-card" data-aos="fade-up" data-aos-delay="100">
          <img src={chocolate} alt="Decadent Chocolate Cake" />
          <h3>Decadent Chocolate Cake</h3>
          <p>Rich chocolate cake with a smooth ganache.</p>
        </div>
        <div className="cake-card" data-aos="fade-up" data-aos-delay="200">
          <img src={vanilla} alt="Classic Vanilla Cake" />
          <h3>Classic Vanilla Cake</h3>
          <p>Light and fluffy vanilla cake with creamy buttercream.</p>
        </div>
        <div className="cake-card" data-aos="fade-up" data-aos-delay="300">
          <img src={strawberry} alt="Fresh Strawberry Cake" />
          <h3>Fresh Strawberry Cake</h3>
          <p>Delicious strawberry cake with fresh strawberries.</p>
        </div>
      </div>
    </section>
  );
}

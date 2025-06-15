// ✅ Testimonials.jsx (AOS qo‘shilgan)
import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"

export default function Testimonials() {
  return (
    <section className="testimonials">
      <h2 className="section-title" data-aos="fade-up">Customer Testimonials</h2>

      <div className="testimonial" data-aos="fade-up" data-aos-delay="100">
        <div className="user-info">
          <div>
            <p className="name">Emily Carter</p>
            <p className="date">May 15, 2024</p>
          </div>
        </div>
        <div className="stars">★★★★★</div>
        <p className="comment">
          "The chocolate cake was absolutely divine! The ganache was so rich and the cake was incredibly moist. Highly
          recommend!"
        </p>
        <div className="feedback">
          <span>👍 12</span>
          <span>👎 2</span>
        </div>
      </div>

      <div className="testimonial" data-aos="fade-up" data-aos-delay="200">
        <div className="user-info">
          <div>
            <p className="name">David Lee</p>
            <p className="date">April 22, 2024</p>
          </div>
        </div>
        <div className="stars">★★★★☆</div>
        <p className="comment">
          "The vanilla cake was good, but I found it a bit too sweet for my taste. The buttercream was well-made though."
        </p>
        <div className="feedback">
          <span>👍 5</span>
          <span>👎 1</span>
        </div>
      </div>

      <div className="testimonial" data-aos="fade-up" data-aos-delay="300">
        <div className="user-info">
          <div>
            <p className="name">Sarah Johnson</p>
            <p className="date">March 10, 2024</p>
          </div>
        </div>
        <div className="stars">★★★★★</div>
        <p className="comment">
          "The strawberry cake was a hit at our party! The fresh berries were a perfect complement to the light cake. Will
          definitely order again!"
        </p>
        <div className="feedback">
          <span>👍 15</span>
          <span>👎 0</span>
        </div>
      </div>
    </section>
  );
}
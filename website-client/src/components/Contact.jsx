import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"

export default function Contact() {
  return (
    <section className="contact">
      <h2 className="section-title" data-aos="fade-up">Contact Us</h2>
      <form className="contact-form" data-aos="fade-up" data-aos-delay="200">
        <label data-aos="fade-up" data-aos-delay="300">
          <p>Name</p>
          <input type="text" placeholder="Your Name" />
        </label>
        <label data-aos="fade-up" data-aos-delay="400">
          <p>Email</p>
          <input type="email" placeholder="Your Email" />
        </label>
        <label data-aos="fade-up" data-aos-delay="500">
          <p>Message</p>
          <textarea placeholder="Your Message"></textarea>
        </label>
        <div className="form-send" data-aos="zoom-in" data-aos-delay="600">
          <button type="submit">Send</button>
        </div>
      </form>
    </section>
  );
}

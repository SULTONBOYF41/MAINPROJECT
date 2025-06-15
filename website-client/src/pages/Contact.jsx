import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"

export default function Contact() {
  return (
    <section className="contact-page">
      <h1 className="section-title" data-aos="fade-up">Contact Us</h1>
      <p className="contact-description" data-aos="fade-up" data-aos-delay="100">
        We'd love to hear from you! Whether you have a question about our cakes, want to place a custom order,
        or just want to say hello, please reach out using the form below or our contact information.
      </p>

      <form className="contact-form-extended" data-aos="fade-up" data-aos-delay="200">
        <label>
          <p>Your Name</p>
          <input type="text" placeholder="Enter your name" />
        </label>

        <label>
          <p>Your Email</p>
          <input type="email" placeholder="Enter your email" />
        </label>

        <label>
          <p>Subject</p>
          <input type="text" placeholder="Enter the subject" />
        </label>

        <label>
          <p>Message</p>
          <textarea placeholder="Enter your message"></textarea>
        </label>

        <div className="form-send-end">
          <button type="submit">Send Message</button>
        </div>
      </form>

      <div className="contact-location" data-aos="fade-up" data-aos-delay="300">
        <h2>Our Location</h2>
        <p>Visit us at our bakery or give us a call. We're open Tuesday to Sunday, from 9 AM to 6 PM.</p>
        <table className="contact-table">
          <tbody>
            <tr>
              <td className="label">Address</td>
              <td>123 Sweet Street, Bakery Town, 12345</td>
            </tr>
            <tr>
              <td className="label">Phone</td>
              <td>(555) 123–4567</td>
            </tr>
            <tr>
              <td className="label">Email</td>
              <td>info@sweetdelights.com</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="contact-social" data-aos="fade-up" data-aos-delay="400">
        <h2>Follow Us</h2>
        <div className="social-icons">
          <a href="#"><i className="icon">📷</i><p>Instagram</p></a>
          <a href="#"><i className="icon">📘</i><p>Facebook</p></a>
          <a href="#"><i className="icon">🐦</i><p>Twitter</p></a>
        </div>
      </div>
    </section>
  );
}

import React from "react";
// import "../scss/main.scss";
import "../styles/style.css"
import aboutBanner from "../assets/images/about-banner.png";

export default function About() {
  return (
    <div className="about-page">
      <div
        className="about-banner"
        style={{ backgroundImage: `url(${aboutBanner})` }}
        data-aos="fade-down"
      >
        <h1 data-aos="fade-up" data-aos-delay="200">About Us</h1>
      </div>

      <section className="about-section" data-aos="fade-up" data-aos-delay="100">
        <h2>Our Story</h2>
        <p>
          Sweet Delights Bakery was founded in 2010 by Sarah Miller, a passionate baker with a dream of sharing her love
          for delicious, handcrafted cakes with the community. Starting from a small home kitchen, Sarah’s dedication to
          quality and creativity quickly gained recognition, leading to the opening of our first storefront in the heart
          of downtown. Over the years, we’ve grown, but our commitment to using the finest ingredients and traditional
          baking techniques remains unchanged.
        </p>
      </section>

      <section className="about-section" data-aos="fade-up" data-aos-delay="200">
        <h2>Our Mission</h2>
        <p>
          At Sweet Delights Bakery, our mission is to create moments of joy and celebration through our exceptional cakes.
          We believe that every cake should be a masterpiece, crafted with care and attention to detail. We strive to
          exceed our customers’ expectations by offering a wide range of flavors, designs, and personalized options to suit
          any occasion.
        </p>
      </section>

      <section className="about-section" data-aos="fade-up" data-aos-delay="300">
        <h2>What Makes Us Unique</h2>
        <p>
          What sets Sweet Delights Bakery apart is our unwavering commitment to quality and innovation. We use only the
          freshest, locally sourced ingredients whenever possible, and our cakes are baked fresh daily to ensure maximum
          flavor and moistness. Our skilled team of bakers and decorators are constantly exploring new techniques and
          flavor combinations to create unique and unforgettable cakes. From classic favorites to custom creations, we're
          dedicated to making every cake a work of art.
        </p>
      </section>
    </div>
  );
}

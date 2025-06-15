import React, { useState } from "react";
// import "../scss/main.scss";
import "../styles/style.css"
import ProductCard from "./ProductCard";
import CategoryTabs from "./CategoryTabs";
import cheesecake1 from "../assets/images/cheesecake1.jpg";
import cheesecake2 from "../assets/images/cheesecake2.jpg";
import cheesecake3 from "../assets/images/cheesecake3.jpg";

export default function MenuPage() {
  const [category, setCategory] = useState("cheesecakes");
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 yangi state
  const handleOrder = (product) => {
    const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const newOrders = [...currentOrders, product];
    localStorage.setItem("orders", JSON.stringify(newOrders));
    alert("✅ Buyurtma qabul qilindi!");
  };

  const cheesecakes = [
    {
      image: cheesecake1,
      title: "Classic New York Cheesecake",
      description: "A rich and creamy cheesecake with a graham cracker crust, perfect for any occasion.",
    },
    {
      image: cheesecake2,
      title: "Strawberry Swirl Cheesecake",
      description: "A delightful twist on the classic, featuring a swirl of fresh strawberry puree.",
    },
    {
      image: cheesecake3,
      title: "Chocolate Fudge Cheesecake",
      description: "For chocolate lovers, a decadent cheesecake with a rich chocolate fudge topping.",
    },
  ];

  

  // 🔎 Filter logic
  const filteredCakes = cheesecakes.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="menu-section">
      <h2 className="section-title" data-aos="fade-up">Our Menu</h2>
      <p className="menu-description" data-aos="fade-up" data-aos-delay="100">
        Explore our delicious selection of cakes and desserts, crafted with love and the finest ingredients.
      </p>

      <input
        className="search-input"
        placeholder="Search for desserts"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        data-aos="fade-up"
        data-aos-delay="200"
      />

      <CategoryTabs selected={category} onSelect={setCategory} />

      <div className="menu-grid">
        {filteredCakes.length > 0 ? (
          filteredCakes.map((item, idx) => <ProductCard key={idx} {...item} />)
        ) : (
          <p className="no-results" data-aos="fade-up" data-aos-delay="300">No matching desserts found.</p>
        )}
      </div>

      <div className="pagination">
        <span className="arrow">‹</span>
        <span className="current">1</span>
        <span className="page">2</span>
      </div>
    </div>
  );
}

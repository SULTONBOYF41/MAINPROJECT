import React from "react";

export default function CategoryTabs({ selected, onSelect }) {
  return (
    <div className="category-tabs">
      <button
        className={selected === "cheesecakes" ? "active" : ""}
        onClick={() => onSelect("cheesecakes")}
      >
        Cheesecakes
      </button>
      <button
        className={selected === "other" ? "active" : ""}
        onClick={() => onSelect("other")}
      >
        Other Desserts
      </button>
    </div>
  );
}

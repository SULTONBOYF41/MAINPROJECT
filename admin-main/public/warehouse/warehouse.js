import { renderProductCard } from "../scripts/renderCard.js";

document.addEventListener("DOMContentLoaded", () => {
  loadWarehouseData();
  setupSearchAndFilters();
});

let fullWarehouseData = [];

// 🔄 Ombor ma'lumotlarini yuklash
function loadWarehouseData() {
  fetch("/api/warehouse")
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        console.error("⚠️ Ma'lumot massiv emas:", data);
        throw new Error("Ma'lumotlar massiv emas");
      }

      fullWarehouseData = data;
      renderCategoryButtons();
      renderWarehouseCards();
    })
    .catch(err => {
      console.error("❌ Ombor ma'lumotlarini olishda xatolik:", err);
      alert("Ma'lumotlarni olishda xatolik yuz berdi");
    });
}

// 🔘 Kategoriya tugmalarini chiqarish
function renderCategoryButtons() {
  const categories = ["Barchasi", ...new Set(fullWarehouseData.map(p => p.category || "Noma'lum"))];
  const container = document.getElementById("category-buttons");
  container.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.classList.add("category-btn");
    if (cat === "Barchasi") btn.classList.add("active");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderWarehouseCards();
    });
    container.appendChild(btn);
  });
}

// 🔍 Qidiruv va filter sozlamalari
function setupSearchAndFilters() {
  document.getElementById("search-input").addEventListener("input", () => {
    renderWarehouseCards();
  });
}

// 🧾 Mahsulot kartochkalarini chizish
function renderWarehouseCards() {
  const container = document.getElementById("product-cards");
  const searchQuery = document.getElementById("search-input").value.toLowerCase();
  const activeCategory = document.querySelector(".category-btn.active")?.textContent || "Barchasi";

  container.innerHTML = "";

  fullWarehouseData
    .filter(p => {
      const matchesCategory = activeCategory === "Barchasi" || p.category === activeCategory;
      const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery);
      return matchesCategory && matchesSearch;
    })
    .forEach(p => {
      const cards = renderProductCard(p); // bu yerda array qaytadi

      cards.forEach(card => {
        container.appendChild(card);
      });
    });
}

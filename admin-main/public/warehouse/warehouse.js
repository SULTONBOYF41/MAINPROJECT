import { renderProductCard } from "../scripts/renderCard.js"; // ⬅️ eng tepaga qo‘shing

document.addEventListener("DOMContentLoaded", () => {
  loadWarehouseData();
  setupSearchAndFilters();
});

let fullWarehouseData = [];

// 🔄 Omborxona ma'lumotlarini yuklash
function loadWarehouseData() {
  fetch("/api/warehouse") // ✅ To‘g‘rilangan marshrut
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
// 🔁 Mahsulot kartochkalarini chizish (faqat variantsiz)


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
      const card = renderProductCard(p); // ✅ faqat shu
      container.appendChild(card);       // ✅ va bu
    });
}



// function renderWarehouseCards() {
//   const container = document.getElementById("product-cards");
//   const searchQuery = document.getElementById("search-input").value.toLowerCase();
//   const activeCategory = document.querySelector(".category-btn.active")?.textContent || "Barchasi";

//   container.innerHTML = "";

//   fullWarehouseData
//     .filter(p => {
//       const matchesCategory = activeCategory === "Barchasi" || p.category === activeCategory;
//       const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery);
//       return matchesCategory && matchesSearch;
//     })
//     .forEach(p => {
//       const card = document.createElement("div");
//       card.className = "product-card styled-card";

//       const imagePath = p.image ? `/uploads/${p.image}` : "/uploads/default.jpg";
//       const description = p.description || "Izoh mavjud emas";
//       const price = p.price ? `${p.price} so'm` : "Narx belgilanmagan";
//       const qtyText = p.quantity?.value != null ? `${p.quantity.value} ${p.unit}` : "Miqdor yo'q";

//       card.innerHTML = `
//         <img src="${imagePath}" alt="${p.name}" class="product-image" />
//         <h4>${p.name}</h4>
//         <p class="product-subtitle">${description}</p>
//         <div class="product-price">Narx: ${price}</div>
//         <div class="qty">Miqdor: ${qtyText}</div>
//       `;

//       container.appendChild(card);
//     });
// }


import { renderProductCard } from "../scripts/renderCard.js";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("product-grid");
  const sidebar = document.getElementById("sidebar");
  const form = document.getElementById("sell-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const statusMessage = document.getElementById("status-message");
  const searchInput = document.getElementById("search-input");
  const categoryContainer = document.getElementById("category-buttons");

  const btnProducts = document.getElementById("btn-products");
  const btnSales = document.getElementById("btn-sales");
  const salesSection = document.getElementById("sales-section");
  const productsSection = document.getElementById("products-section");

  let allProducts = [];
  let selectedCategory = "Barchasi";

  // 🔄 Mahsulotlarni yuklash
  async function loadProducts() {
    try {
      const res = await fetch("/api/warehouse");
      if (!res.ok) throw new Error("Server xatosi");
      allProducts = await res.json();

      renderCategoryButtons();
      renderFilteredProducts();
    } catch (err) {
      console.error("❌ Mahsulotlarni olishda xatolik:", err.message);
    }
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-sale-btn")) {
      const json = JSON.parse(e.target.dataset.json);
      document.getElementById("sidebar-title").textContent = `${json.product} – Tahrirlash`;

      form.product.value = json.product;
      form.unit.value = json.unit;
      form.quantity.value = json.quantity;
      form.price.value = json.price;
      form.date.value = json.date;
      form.branch.value = json.branch;

      form.setAttribute("data-edit-id", json.id); // 🔐

      sidebar.classList.add("open");
    }
  });


  // 🔍 Filtering va render
  function renderFilteredProducts() {
    const query = searchInput.value.toLowerCase();
    grid.innerHTML = "";

    allProducts
      .filter(p => (p.name || "").toLowerCase().includes(query))
      .filter(p => selectedCategory === "Barchasi" || p.category === selectedCategory)
      .forEach(product => {
        const card = renderProductCard(product);
        card.addEventListener("click", () => openSidebar(product));
        grid.appendChild(card);
      });
  }

  // 🔘 Kategoriya tugmalari
  function renderCategoryButtons() {
    const categories = ["Barchasi", ...new Set(allProducts.map(p => p.category || "Noma'lum"))];
    categoryContainer.innerHTML = "";

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      btn.classList.add("category-btn");
      if (cat === selectedCategory) btn.classList.add("active");

      btn.addEventListener("click", () => {
        selectedCategory = cat;
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderFilteredProducts();
      });

      categoryContainer.appendChild(btn);
    });
  }

  // 📥 Sotuv panelini ochish
  function openSidebar(product) {
    document.getElementById("sidebar-title").textContent = `${product.name} – Sotish`;
    document.getElementById("selected-product-name").value = product.name;
    document.getElementById("selected-unit").value = product.unit;

    form.reset();
    sidebar.classList.add("open");
  }

  // ❌ Panelni yopish
  cancelBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    statusMessage.textContent = "";
  });

  // 📤 Sotuvni yuborish
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      branch: form.branch.value.trim(),
      product: form.product.value.trim(),
      unit: form.unit.value.trim(),
      quantity: parseFloat(form.quantity.value),
      price: parseInt(form.price.value),
      date: form.date.value
    };

    const editId = form.getAttribute("data-edit-id");
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/branch-sales/${editId}` : "/branch-sales";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const message = await res.text();
      statusMessage.textContent = res.ok ? "✅ " + message : "❌ " + message;
      statusMessage.style.color = res.ok ? "green" : "red";

      if (res.ok) {
        form.reset();
        form.removeAttribute("data-edit-id");
        sidebar.classList.remove("open");
        loadProducts();
        loadSalesHistory();
      }
    } catch (err) {
      statusMessage.textContent = "❌ Saqlashda xatolik: " + err.message;
      statusMessage.style.color = "red";
    }
  });


  // 🔎 Qidiruv
  searchInput.addEventListener("input", renderFilteredProducts);

  // 📜 Sotuvlar tarixini yuklash
  async function loadSalesHistory() {
    try {
      const res = await fetch("/branch-sales?branch=Filial 1");
      const data = await res.json();

      const tableBody = document.getElementById("sales-history-body");
      if (!tableBody) return;

      tableBody.innerHTML = "";
      data.reverse().forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.date}</td>
          <td>${item.product}</td>
          <td>${item.quantity}</td>
          <td>${item.unit}</td>
          <td>${item.price} so'm</td>
          <td><button class="edit-sale-btn" data-id="${item.id}" data-json='${JSON.stringify(item)}'>✏️</button></td>
        `;

        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("❌ Sotuvlar tarixini yuklashda xatolik:", err.message);
    }
  }

  // 🔁 Sahifalar orasida almashish
  btnSales?.addEventListener("click", () => {
    productsSection.style.display = "none";
    salesSection.style.display = "block";
  });

  btnProducts?.addEventListener("click", () => {
    salesSection.style.display = "none";
    productsSection.style.display = "block";
  });

  // ▶️ Yuklashni boshlash
  loadProducts();
  loadSalesHistory();
});

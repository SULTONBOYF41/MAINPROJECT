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

  const variantGroup = document.getElementById("variant-group");
  const variantSelect = document.getElementById("variant-select");
  const unitInput = document.getElementById("selected-unit");
  const productInput = document.getElementById("selected-product-name");
  let sizeInput = document.getElementById("selected-size");
  let soldQtyInput = document.getElementById("sold-qty");

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
      form["sold-qty"].value = json.quantity;  // NEW!
      form.price.value = json.price;
      form.date.value = json.date;
      form.branch.value = json.branch;
      if (form["selected-size"]) form["selected-size"].value = json.size || "";

      form.setAttribute("data-edit-id", json.id);
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
        const cards = renderProductCard(product);
        cards.forEach(card => {
          card.addEventListener("click", () => openSidebar(product));
          grid.appendChild(card);
        });
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

  // 📥 Sotuv panelini ochish (to‘liq optimallashtirilgan)
  function openSidebar(product) {
    document.getElementById("sidebar-title").textContent = `${product.name} – Sotish`;
    form.reset();

    productInput.value = product.name;

    // Eski inputlarni tozalash
    if (document.getElementById("sold-qty")) document.getElementById("sold-qty").remove();
    if (document.getElementById("selected-size")) document.getElementById("selected-size").remove();

    // 🟢 Variantli mahsulot
    if (product.has_variants && product.variants?.length) {
      variantGroup.style.display = "block";
      variantSelect.innerHTML = `<option value="">-- Tanlang --</option>`;

      // Variantlarni selectga qo‘shamiz
      product.variants.forEach(v => {
        const opt = document.createElement("option");
        // Faqat kerakli qiymatlar: size (number), unit, price, quantity
        opt.value = JSON.stringify({
          size: Number(v.size), // majburiy number
          unit: v.unit,
          price: v.price,
          quantity: v.quantity
        });
        opt.textContent = `${v.size} sm (${v.unit}) – ${v.price} so'm`;
        variantSelect.appendChild(opt);
      });

      // Size uchun hidden input
      sizeInput = document.createElement("input");
      sizeInput.type = "hidden";
      sizeInput.id = "selected-size";
      sizeInput.name = "size";
      form.insertBefore(sizeInput, variantGroup.nextSibling);

      // Sotiladigan miqdor inputi (sold-qty)
      soldQtyInput = document.createElement("input");
      soldQtyInput.type = "number";
      soldQtyInput.id = "sold-qty";
      soldQtyInput.name = "sold-qty";
      soldQtyInput.className = "form-group";
      soldQtyInput.placeholder = "Qancha (soni yoki kg)";
      soldQtyInput.required = true;
      form.insertBefore(soldQtyInput, document.getElementById("price").parentNode);

      // Variant tanlanganda qiymatlarni to‘ldirish
      variantSelect.onchange = () => {
        const selected = variantSelect.value;
        if (selected) {
          const variant = JSON.parse(selected);
          sizeInput.value = Number(variant.size); // har doim number sifatida
          unitInput.value = variant.unit;
          form.price.value = variant.price;
          soldQtyInput.max = variant.quantity; // optional: mavjudidan ko‘p kiritmaslik uchun
        } else {
          sizeInput.value = "";
          unitInput.value = "";
          form.price.value = "";
          soldQtyInput.max = "";
        }
      };

    } else {
      // 🟡 Oddiy mahsulot uchun
      variantGroup.style.display = "none";
      unitInput.value = product.unit;
      form.price.value = product.price || "";

      // Sotiladigan miqdor inputi
      soldQtyInput = document.createElement("input");
      soldQtyInput.type = "number";
      soldQtyInput.id = "sold-qty";
      soldQtyInput.name = "sold-qty";
      soldQtyInput.className = "form-group";
      soldQtyInput.placeholder = "Qancha (soni yoki kg)";
      soldQtyInput.required = true;
      form.insertBefore(soldQtyInput, document.getElementById("price").parentNode);
    }

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

    if (variantGroup.style.display === "block" && !variantSelect.value) {
      statusMessage.textContent = "❌ Avval variantni tanlang!";
      statusMessage.style.color = "red";
      return;
    }

    const data = {
      branch: form.branch.value.trim(),
      product: form.product.value.trim(),
      unit: form.unit.value.trim(),
      quantity: parseFloat(form["sold-qty"].value),
      price: parseInt(form.price.value),
      date: form.date.value
    };
    if (form["size"]) {
      // Hamma variantlarda size ni numberga konvertatsiya qilamiz
      data.size = parseFloat(form["size"].value);
    }

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

  // 📜 Sotuvlar tarixini yuklash (variantli mahsulotlarda size ni chiqaradi)
  async function loadSalesHistory() {
    try {
      const res = await fetch("/branch-sales?branch=Filial 1");
      const data = await res.json();

      const tableBody = document.getElementById("sales-history-body");
      if (!tableBody) return;

      tableBody.innerHTML = "";
      data.reverse().forEach(item => {
        // Mahsulot nomiga variant (size) va unit ni qo‘shamiz
        let productLabel = item.product;
        if (item.size !== null && item.size !== undefined) {
          // size son ko‘rinishida bo‘lsa, "40 sm (dona)" yoki "0.5 kg" format qilamiz
          let unitLabel = item.unit || "";
          // Agar birlik "kg" bo‘lsa, float ko‘rinishda qoldiramiz, aks holda butun son
          let sizeLabel = (unitLabel === "kg") ? item.size : parseInt(item.size);
          productLabel = `${item.product} ${sizeLabel} ${unitLabel}`;
        }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.date}</td>
        <td>${productLabel}</td>
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("production-form");
  const nameInput = document.getElementById("prod-name");
  const sizeWrapper = document.getElementById("prod-size-wrapper");
  const unitInput = document.getElementById("prod-unit");
  const qtyInput = document.getElementById("prod-qty");

  let productCache = [];

// Helper: mahsulotlar ro‘yxatini olish
async function fetchProducts() {
  const res = await fetch("/api/warehouse"); // yoki /api/products, qaysi endpointda variantlar to‘liq bo‘lsa
  return await res.json();
}

// O‘lcham inputini chiqarish
function renderSizeInput(type, variants = []) {
  sizeWrapper.innerHTML = ""; // Oldingi select/inputni tozalash
  if (type === "select") {
    const select = document.createElement("select");
    select.name = "size";
    select.id = "prod-size";
    select.required = true;
    select.innerHTML = `<option value="">Variantni tanlang</option>` +
      variants.map(v =>
        `<option value="${v.size}">${v.size} ${v.unit} – ${v.price ? v.price + " so'm" : ""}</option>`
      ).join("");
    sizeWrapper.appendChild(select);

    // Select o‘zgarganda avtomatik unit ni to‘ldirish
    select.addEventListener("change", e => {
      const val = e.target.value;
      const selected = variants.find(v => String(v.size) === String(val));
      if (selected) unitInput.value = selected.unit;
      else unitInput.value = "";
    });
  }
  // Agar type bo‘sh yoki boshqa — hech narsa chiqmasin
}

// Mahsulot nomini blur qilganda ishlaydi
nameInput.addEventListener("blur", async () => {
  const name = nameInput.value.trim().toLowerCase();
  if (!name) {
    renderSizeInput(); // Umuman o‘lcham chiqmasin
    unitInput.disabled = false;
    return;
  }

  const products = await fetchProducts();
  const found = products.find(p => (p.name || "").trim().toLowerCase() === name);

  if (found && found.has_variants && found.variants?.length) {
    renderSizeInput("select", found.variants);
    unitInput.disabled = true;
    unitInput.value = ""; // Selectdan tanlanganda qiymat qo‘yiladi
  } else {
    renderSizeInput(); // O‘lcham umuman chiqmasin
    unitInput.disabled = false;
    unitInput.value = ""; // Avvalgi qiymat bo‘lsa, tozalash uchun
  }
});


  // Formani submit qilish
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;

    const sizeInput = sizeWrapper.querySelector('[name="size"]');

    const payload = {
      name: nameInput.value.trim(),
      quantity: parseFloat(qtyInput.value),
      unit: unitInput.value.trim(),
      date: form["prod-date"].value,
      size: sizeInput && sizeInput.value ? sizeInput.value.trim() : undefined
    };

    // Validasiyalash
    if (!payload.name || !payload.quantity || !payload.unit || !payload.date) {
      alert("Iltimos, barcha maydonlarni to‘ldiring.");
      button.disabled = false;
      return;
    }
    if (sizeInput && sizeInput.required && !payload.size) {
      alert("Variant mahsulot uchun o‘lcham majburiy!");
      button.disabled = false;
      return;
    }

    // Serverga jo‘natish
    fetch("/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        form.reset();
        renderSizeInput("input"); // Default inputga qaytarish
        unitInput.disabled = false;
        loadProduction();
        button.disabled = false;
      })
      .catch(() => {
        alert("❌ Ma’lumotni yuborishda xatolik yuz berdi.");
        button.disabled = false;
      });
  });

  // So‘nggi ishlab chiqarishlarni yuklash
  window.loadProduction = function() {
    fetch("/production")
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("production-list");
        tbody.innerHTML = "";
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(() => {
        console.error("❌ Ishlab chiqarish ma’lumotlarini olishda xatolik.");
      });
  };

  // Dastlab oddiy input qilib boshlash
  renderSizeInput("input");
  window.loadProduction();
});

const productForm = document.getElementById("product-form");
const productList = document.getElementById("products-body");
const productTable = document.getElementById("product-table");
const addButton = document.getElementById("add-button");
const updateButton = document.getElementById("update-button");
const variantSection = document.getElementById("variant-section");
const hasVariantsCheckbox = document.getElementById("has-variants");
const variantContainer = document.getElementById("variant-container");
const priceInput = document.getElementById("main-price");
const unitInput = document.getElementById("main-unit");

hasVariantsCheckbox.addEventListener("change", () => {
  variantSection.style.display = hasVariantsCheckbox.checked ? "block" : "none";

  if (hasVariantsCheckbox.checked) {
    priceInput.style.display = "none";
    unitInput.style.display = "none";
    // 🔑 Yashirin bo‘lsa required ni olib tashlash
    priceInput.removeAttribute("required");
    unitInput.removeAttribute("required");
    // Qiymatini bo‘shatish (ixtiyoriy, xatolikdan qochish uchun)
    priceInput.value = "";
    unitInput.value = "";
  } else {
    priceInput.style.display = "";
    unitInput.style.display = "";
    // 🔑 Qayta required qilish
    priceInput.setAttribute("required", "required");
    unitInput.setAttribute("required", "required");
  }
});


let variants = [];

// 🔘 Variant form elementlarini render qilish
function renderVariantInputs() {
  variantContainer.innerHTML = "";
  variants.forEach((variant, index) => {
    const div = document.createElement("div");
    div.classList.add("variant-input");

    div.innerHTML = `
      <input type="number" placeholder="O‘lcham (sm)" value="${variant.size}" data-index="${index}" class="variant-size" required />
      <input type="number" placeholder="Narx (so'm)" value="${variant.price}" data-index="${index}" class="variant-price" required />
      <select data-index="${index}" class="variant-unit">
        <option value="kg" ${variant.unit === "kg" ? "selected" : ""}>kg</option>
        <option value="dona" ${variant.unit === "dona" ? "selected" : ""}>dona</option>
      </select>
      <button type="button" class="remove-variant" data-index="${index}">❌</button>
    `;

    variantContainer.appendChild(div);
  });
}

// ➕ Variant qo‘shish
document.getElementById("add-variant").addEventListener("click", () => {
  variants.push({ size: "", price: "", unit: "dona" });
  renderVariantInputs();
});

// ❌ Variant o‘chirish
variantContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-variant")) {
    const index = parseInt(e.target.dataset.index);
    variants.splice(index, 1);
    renderVariantInputs();
  }
});

// 🔁 Variant inputlar o‘zgarishini kuzatish
variantContainer.addEventListener("input", (e) => {
  const index = parseInt(e.target.dataset.index);
  const type = e.target.classList.contains("variant-size")
    ? "size"
    : e.target.classList.contains("variant-price")
    ? "price"
    : "unit";

  variants[index][type] = type === "size" || type === "price"
    ? parseFloat(e.target.value)
    : e.target.value;
});

export function initProductForm() {
  // Faqat bitta event listener
  if (productForm && !productForm._listenerAdded) {
    productForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const rawFormData = new FormData(productForm);
      const editId = productForm.getAttribute("data-edit-id");
      const hasVariants = hasVariantsCheckbox.checked;

      rawFormData.append("has_variants", hasVariants ? 1 : 0);
      if (hasVariants) {
        rawFormData.append("variants", JSON.stringify(variants));
      }

      try {
        let res, message;

        if (editId) {
          res = await fetch(`/products/${editId}`, {
            method: "POST",
            body: rawFormData,
          });
        } else {
          res = await fetch("/products", {
            method: "POST",
            body: rawFormData,
          });
        }

        message = await res.text();
        alert(message);
        productForm.reset();
        productForm.removeAttribute("data-edit-id");
        addButton.style.display = "inline-block";
        updateButton.style.display = "none";
        variantContainer.innerHTML = "";
        variants = [];

        loadProducts();
      } catch (err) {
        alert("❌ Saqlashda xatolik: " + err.message);
      }
    });

    // ❗Fakat bitta submit listener
    productForm._listenerAdded = true;

    updateButton.addEventListener("click", () => {
      productForm.dispatchEvent(new Event("submit"));
    });
  }

  if (productList) loadProducts();
}


export async function loadProducts() {
  try {
    const res = await fetch("/products");
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      if (productTable) productTable.style.display = "none";
      return;
    }

    productTable.style.display = "table";
    productList.innerHTML = "";

    data.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${product.image ? `<img src="/uploads/${product.image}" width="40">` : "-"}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.price} so'm</td>
        <td>${product.description || "-"}</td>
        <td>
          <button onclick="editProduct(${product.id})">✏️</button>
          <button onclick="deleteProduct(${product.id})">🗑️</button>
        </td>
      `;
      productList.appendChild(tr);
    });
  } catch (err) {
    alert("❌ Mahsulotlarni yuklashda xatolik: " + err.message);
  }
}

window.deleteProduct = async function (id) {
  if (!confirm("Rostdan ham o‘chirmoqchimisiz?")) return;

  try {
    const res = await fetch(`/products/${id}`, {
      method: "DELETE",
    });
    const message = await res.text();
    alert(message);
    loadProducts();
  } catch (err) {
    alert("❌ O‘chirishda xatolik: " + err.message);
  }
};

window.editProduct = async function (id) {
  try {
    const res = await fetch("/products");
    const products = await res.json();
    const product = products.find((p) => p.id === id);
    if (!product) return alert("Mahsulot topilmadi");

    productForm.name.value = product.name;
    productForm.category.value = product.category;
    productForm.price.value = product.price;
    productForm.description.value = product.description;
    productForm.unit.value = product.unit || "";
    productForm.setAttribute("data-edit-id", id);
    addButton.style.display = "none";
    updateButton.style.display = "inline-block";

    // 🔁 Variantlarni yuklash (variantlarni olish serverdan kerak bo‘ladi)
    const variantRes = await fetch(`/products/${id}/variants`);
    const variantList = await variantRes.json();
    if (variantList?.length) {
      hasVariantsCheckbox.checked = true;
      variants = variantList;
      renderVariantInputs();
    } else {
      hasVariantsCheckbox.checked = false;
      variants = [];
      variantContainer.innerHTML = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    alert("❌ Tahrirlashda xatolik: " + err.message);
  }
};

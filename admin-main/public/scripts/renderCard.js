export function renderProductCard(p) {
  const card = document.createElement("div");
  card.className = "product-card styled-card";

  const imagePath = p.image ? `/uploads/${p.image}` : "/uploads/default.jpg";
  const description = p.description || "Izoh mavjud emas";
  const price = p.price ? `${p.price} so'm` : "Narx belgilanmagan";

  const qtyValue = p.quantity?.value ?? 0;
  const qtyUnit = p.quantity?.unit || ""; // ✅ MUHIM TO‘G‘RILASH

  const qtyText = `${qtyValue} ${qtyUnit}`;

  let qtyColor = "green";
  if (qtyValue < 3) qtyColor = "red";
  else if (qtyValue < 5) qtyColor = "orange";

  card.innerHTML = `
    <img src="${imagePath}" alt="${p.name}" class="product-image" />
    <h4>${p.name}</h4>
    <p class="product-subtitle">${description}</p>
    <div class="product-price">Narx: ${price}</div>
    <div class="qty" style="color: ${qtyColor}; font-weight: bold;">Miqdor: ${qtyText}</div>
  `;

  // 🟢 TO‘G‘RI UNIT qiymat
  card.dataset.unit = qtyUnit;
  
  return card;
}



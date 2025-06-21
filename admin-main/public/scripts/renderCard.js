export function renderProductCard(p) {
  const cards = [];

  const imagePath = p.image ? `/uploads/${p.image}` : "/uploads/default.jpg";
  const description = p.description || "Izoh mavjud emas";

  // 🟢 Variantli mahsulot uchun
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const card = document.createElement("div");
    card.className = "product-card styled-card";

    let variantHtml = `
      <div style="margin-top: 10px;">
        <b>O'lchamlar:</b>
        <ul style="padding-left: 0; margin-top: 8px;">
          ${p.variants
            .map((v) => {
              const qtyValue = v.quantity ?? 0;
              let qtyColor = "green";
              if (qtyValue < 3) qtyColor = "red";
              else if (qtyValue < 5) qtyColor = "orange";
              return `
                <li style="list-style: none; margin-bottom: 5px;">
                  <span style="font-weight: bold;">${v.size} sm (${v.unit})</span> - ${v.price} so'm <br>
                  <span style="color:${qtyColor}; font-weight: bold;">
                    Miqdor: ${qtyValue} ${v.unit}
                  </span>
                </li>
              `;
            })
            .join("")}
        </ul>
      </div>
    `;

    card.innerHTML = `
      <img src="${imagePath}" alt="${p.name}" class="product-image" />
      <h4>${p.name}</h4>
      <p class="product-subtitle">${description}</p>
      ${variantHtml}
    `;

    card.dataset.productId = p.id || p.product_id;
    cards.push(card);

  } 
  else {
    // 🟡 Oddiy mahsulot uchun — avvalgi ko‘rinishda
    const card = document.createElement("div"); // BU YERDA E'LON QILING!
    card.className = "product-card styled-card";

    const qtyValue = (p.quantity && p.quantity.value != null) ? p.quantity.value : (p.warehouse_qty ?? 0);
    const qtyUnit = (p.quantity && p.quantity.unit) ? p.quantity.unit : (p.unit || "");
    const qtyText = `${qtyValue} ${qtyUnit}`;
    const priceText = p.price ? `${p.price} so'm` : "Narx belgilanmagan";

    let qtyColor = "green";
    if (qtyValue < 3) qtyColor = "red";
    else if (qtyValue < 5) qtyColor = "orange";

    card.innerHTML = `
      <img src="${imagePath}" alt="${p.name}" class="product-image" />
      <h4>${p.name}${qtyUnit ? ` (${qtyUnit})` : ""}</h4>
      <p class="product-subtitle">${description}</p>
      <div class="product-price">Narx: ${priceText}</div>
      <div class="qty" style="color: ${qtyColor}; font-weight: bold;">
        Miqdor: ${qtyText}
      </div>
    `;

    card.dataset.unit = qtyUnit;
    card.dataset.productId = p.id || p.product_id;
    cards.push(card);
  }


  // Yagona card, arrayda
  return cards;
}

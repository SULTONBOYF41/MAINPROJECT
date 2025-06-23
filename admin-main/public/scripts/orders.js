// --- FORM BUYURTMA QO'SHISH ---
export function submitOrder(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  const order = {
    customer: form.customer.value.trim(),
    product: form.product.value.trim(),
    quantity: parseFloat(form.quantity.value),
    unit: form.unit.value.trim(),
    source: form.source.value.trim(),
    price: parseInt(form.price.value),
    date: form.date.value,
    note: form.note.value.trim()
  };

  if (!order.customer || !order.product || !order.quantity || !order.unit || !order.date || isNaN(order.price)) {
    alert("Barcha maydonlar to‘g‘ri to‘ldirilishi kerak!");
    button.disabled = false;
    return;
  }

  fetch("/orders", { // localhost:3000 ni yozmaslik yaxshi (prod uchun)
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(order)
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      form.reset();
      button.disabled = false;
      // Yangi buyurtma kiritilganda ro'yxatni avtomatik yangilash
      loadOrders();
    })
    .catch(() => {
      alert("Buyurtma qo‘shishda xatolik yuz berdi");
      button.disabled = false;
    });
}

// --- TABLAR LOGIKASI ---
document.getElementById("tab-add-order").onclick = function () {
  this.classList.add("active");
  document.getElementById("tab-orders-list").classList.remove("active");
  document.getElementById("order-form-section").style.display = "";
  document.getElementById("orders-list-section").style.display = "none";
};

document.getElementById("tab-orders-list").onclick = function () {
  this.classList.add("active");
  document.getElementById("tab-add-order").classList.remove("active");
  document.getElementById("order-form-section").style.display = "none";
  document.getElementById("orders-list-section").style.display = "";
  loadOrders();
};

// --- BUYURTMALAR JADVALLARINI YUKLASH ---
export function loadOrders() {
  fetch("/orders")
    .then(res => res.json())
    .then(orders => {
      const tbody = document.querySelector("#orders-table tbody");
      if (!tbody) return;
      tbody.innerHTML = "";
      orders.forEach((order, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${order.customer}</td>
          <td>${order.product}</td>
          <td>${order.quantity}</td>
          <td>${order.unit}</td>
          <td>${order.source}</td>
          <td>${order.price}</td>
          <td>${order.date}</td>
          <td>${order.note || ""}</td>
          <td>${order.status || "pending"}</td>
          <td>
            <button class="status-btn" onclick="updateStatus(${order.id}, 'qabul qilindi')">Qabul qilish</button>
            <button class="status-btn" onclick="updateStatus(${order.id}, 'bekor qilindi')">Bekor qilish</button>
            <button class="status-btn" onclick="updateStatus(${order.id}, 'tayyor')">Tayyor</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
}

// --- STATUS O'ZGARTIRISH ---
window.updateStatus = function(orderId, status) {
  fetch(`/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      loadOrders();
    })
    .catch(() => alert("Statusni o‘zgartirishda xatolik!"));
}

const pages = ['pending', 'accepted', 'cancelled', 'ready'];
const icons = {
  pending: '📥',
  accepted: '✅',
  cancelled: '❌',
  ready: '📦'
};

const BASE_URL = 'http://localhost:3001';

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const page = link.dataset.page;
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    document.getElementById(page).classList.add('active');
    link.classList.add('active');

    // 👉 Hisobot sahifasiga o‘tilganda ishlasin:
    if (page === "reports") {
      renderReports();
    }
  });
});


// BUYURTMALAR YUKLASH
pages.forEach(status => {
  fetch(`${BASE_URL}/bot-orders?status=${status}`)
    .then(res => res.json())
    .then(data => renderTable(data, status))
    .catch(err => console.error(`❌ ${status} yuklashda xatolik:`, err));
});

function renderTable(data, status) {
  const section = document.getElementById(status);
  section.innerHTML = `
    <h2>${icons[status]} ${capitalize(status)}</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tort</th>
          <th>Og‘irlik</th>
          <th>Tel</th>
          <th>Username</th>
          <th>Sana</th>
          <th>Amal</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (order, i) => `
            <tr data-id="${order.id}">
              <td>${i + 1}</td>
              <td>${order.cake_name}</td>
              <td>${order.weight}</td>
              <td>${order.phone}</td>
              <td>@${order.username}</td>
              <td>${order.created_at}</td>
              <td>${renderButtons(order)}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderButtons(order) {
  if (order.status === "pending") {
    return `
      <button onclick="updateStatus(${order.id}, 'accepted')">Qabul qilish</button>
      <button onclick="updateStatus(${order.id}, 'cancelled')">Bekor qilish</button>
    `;
  }
  if (order.status === "accepted") {
    return `<button onclick="updateStatus(${order.id}, 'ready')">Tayyor</button>`;
  }
  return "-";
}

function updateStatus(id, newStatus) {
  fetch(`${BASE_URL}/bot-orders/status/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((res) => res.json())
    .then(() => {
      const oldRow = document.querySelector(`tr[data-id='${id}']`);
      if (oldRow) oldRow.remove();

      fetch(`${BASE_URL}/bot-orders?status=${newStatus}`)
        .then((res) => res.json())
        .then((data) => {
          const order = data.find((item) => item.id === id);
          if (order) {
            appendOrderToSection(order, newStatus);
            sendBotMessage(order.chat_id, getMessageByStatus(newStatus));
          }
        });
    })
    .catch((err) => console.error("❌ Statusni yangilashda xatolik:", err));
}


function appendOrderToSection(order, status) {
  const section = document.getElementById(status);
  if (!section.querySelector("tbody")) return; // Agar hali yuklanmagan bo‘lsa

  const tbody = section.querySelector("tbody");
  const row = document.createElement("tr");
  row.setAttribute("data-id", order.id);
  row.innerHTML = `
    <td>#</td>
    <td>${order.cake_name}</td>
    <td>${order.weight}</td>
    <td>${order.phone}</td>
    <td>@${order.username}</td>
    <td>${order.created_at}</td>
    <td>${renderButtons(order)}</td>
  `;
  tbody.appendChild(row);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function sendBotMessage(chat_id, text) {
  fetch(`${BASE_URL}/bot-orders/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ chat_id, text })
  }).catch((err) =>
    console.error("❌ Botga xabar yuborishda xatolik:", err)
  );
}

function getMessageByStatus(status) {
  switch (status) {
    case "accepted":
      return "✅ Buyurtmangiz qabul qilindi!";
    case "ready":
      return "📦 Buyurtmangiz tayyor bo‘ldi. Tez orada yetkaziladi.";
    case "cancelled":
      return "❌ Kechirasiz, buyurtmangiz bekor qilindi.";
    default:
      return "";
  }
}

function renderReports() {
  const section = document.getElementById("reports");
  const today = new Date().toISOString().split("T")[0];
  section.innerHTML = `
    <h2>📊 Hisobotlar</h2>
    <div class="date-range">
      <label>Sanadan:</label>
      <input type="date" id="from" value="${today}" />
      <label>gacha:</label>
      <input type="date" id="to" value="${today}" />
      <button onclick="loadReport()">Ko‘rish</button>
    </div>
    <div id="report-content"></div>
  `;
}

function loadReport() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  if (!from || !to) return alert("Iltimos, sanalarni tanlang!");

  fetch(`${BASE_URL}/bot-reports?from=${from}&to=${to}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("report-content");
      container.innerHTML = `
        <div class="report-cards">
          <div class="card">Jami: ${data.total ?? 0}</div>
          <div class="card">Qabul qilingan: ${data.accepted ?? 0}</div>
          <div class="card">Tayyor: ${data.ready ?? 0}</div>
          <div class="card">Bekor qilingan: ${data.cancelled ?? 0}</div>
        </div>

        <h3>Top 10 mijozlar</h3>
        <ul class="top-list">${(data.top_customers || []).map(c => `<li>@${c.username} (${c.count})</li>`).join('')}</ul>

        <h3>Top 10 tortlar</h3>
        <ul class="top-list">${(data.top_cakes || []).map(c => `<li>${c.cake_name} (${c.count})</li>`).join('')}</ul>

        <h3>Buyurtmalar grafigi</h3>
        <canvas id="report-chart" width="600" height="250"></canvas>
      `;

      drawChart({
        total: data.total,
        accepted: data.accepted,
        ready: data.ready,
        cancelled: data.cancelled
      });
    })
    .catch(err => console.error("Hisobot olishda xatolik:", err));
}

function drawChart(data) {
  const ctx = document.getElementById("report-chart").getContext("2d");

  // Agar eski chart mavjud bo‘lsa — uni yo‘q qilamiz
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Jami", "Qabul qilingan", "Tayyor", "Bekor qilingan"],
      datasets: [{
        label: "Buyurtmalar soni",
        data: [data.total, data.accepted, data.ready, data.cancelled],
        backgroundColor: [
          "#770E13", "#28a745", "#ffc107", "#dc3545"
        ],
        borderRadius: 8,
        barThickness: 50
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

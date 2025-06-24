// 📁 scripts/report.js
import { renderChart } from "./chart.js";
import { getParamKey, getReportParam } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const typeRadios = document.querySelectorAll('input[name="reportType"]');
  const dateInput = document.getElementById("report-date");
  const weekInput = document.getElementById("report-week");
  const monthInput = document.getElementById("report-month");
  const dateFrom = document.getElementById("report-date-from");
  const dateTo = document.getElementById("report-date-to");
  document.getElementById("view-report-btn").onclick = viewReport;
  document.getElementById("download-pdf-btn").onclick = downloadPdfReport;

  function handleTypeChange() {
    const val = document.querySelector('input[name="reportType"]:checked').value;
    dateInput.style.display = val === "kunlik" ? "inline" : "none";
    weekInput.style.display = val === "haftalik" ? "inline" : "none";
    monthInput.style.display = val === "oylik" ? "inline" : "none";
    dateFrom.style.display = dateTo.style.display = val === "oraliq" ? "inline" : "none";
  }

  typeRadios.forEach(radio => radio.addEventListener("change", handleTypeChange));
  handleTypeChange(); // sahifa yuklanganda ham tekshiradi
});

let reportData = null;
let selectedBranch = null;

// 🔄 Dropdown va boshqaruv elementlarini boshlash
export function initReportDropdown() {
  const producedCount = document.getElementById("produced-count");
  if (producedCount) producedCount.textContent = "umumiy";

  document.querySelectorAll('input[name="reportType"]').forEach(radio => {
    radio.addEventListener("change", updateDateInput);
  });

  updateDateInput();

  const backBtn = document.getElementById("back-to-main");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.getElementById("branch-report-container").style.display = "none";
      document.getElementById("report-summary").style.display = "flex";
      document.getElementById("report-row").style.display = "flex";
      document.getElementById("chart-title").style.display = "block";
      document.getElementById("reportChart").style.display = "block";

      if (reportData) {
        renderChart(
          ["Filial daromadi", "Buyurtmalar daromadi", "Xarajatlar", "Sof foyda"],
          [
            reportData.branch_income || 0,
            reportData.total_order_income || 0,
            reportData.total_expenses || 0,
            (reportData.branch_income + reportData.total_order_income - reportData.total_expenses)
          ]
        );
      }

      backBtn.style.display = "none";
    });
  }
}

// 📅 Sana turi bo‘yicha inputlarni boshqarish
function updateDateInput() {
  const type = document.querySelector('input[name="reportType"]:checked')?.value;
  const dateInput = document.getElementById("report-date");
  const weekInput = document.getElementById("report-week");
  const monthInput = document.getElementById("report-month");

  if (dateInput) dateInput.style.display = "none";
  if (weekInput) weekInput.style.display = "none";
  if (monthInput) monthInput.style.display = "none";

  if (type === "kunlik" && dateInput) dateInput.style.display = "inline-block";
  else if (type === "haftalik" && weekInput) weekInput.style.display = "inline-block";
  else if (type === "oylik" && monthInput) monthInput.style.display = "inline-block";
}

// --- Yangi render funksiyasi: ---
function renderReportResult(data) {
  // Bloklarni olib kelamiz
  const summary = document.getElementById("report-summary");
  const row = document.getElementById("report-row");
  const chartTitle = document.getElementById("chart-title");
  const reportChart = document.getElementById("reportChart");

  // Ko‘rsatamiz
  summary.style.display = "block";
  row.style.display = "flex";
  chartTitle.style.display = "block";
  reportChart.style.display = "block";

  // Obyekt elementlarga natijani yozamiz
  document.getElementById("produced-count").textContent =
    (data.total_production_kg || 0) + " kg, " + (data.total_production_dona || 0) + " dona";
  document.getElementById("sold-store").textContent =
    (data.store_sold_kg || 0) + " kg, " + (data.store_sold_dona || 0) + " dona";
  document.getElementById("order-count").textContent = data.total_orders || 0;
  document.getElementById("total-income").textContent = (data.total_income || 0).toLocaleString();
  document.getElementById("total-expenses").textContent = (data.total_expenses || 0).toLocaleString();
  document.getElementById("net-profit").textContent = (data.net_profit || 0).toLocaleString();

  // Top 10 mahsulotlar
  const topProducts = data.top_products || [];
  const topProductsTable = document.getElementById("top-products");
  topProductsTable.innerHTML = topProducts.length
    ? topProducts
        .map(
          (p) =>
            `<tr><td>${p.name}</td><td>${p.sold}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="2">Ma’lumot yo‘q</td></tr>`;

  // Buyurtma manbalari
  const orderSources = data.platforms || {};
  const sourcesList = document.getElementById("order-sources");
  sourcesList.innerHTML =
    Object.keys(orderSources).length > 0
      ? Object.entries(orderSources)
          .map(([source, count]) => `<li>${source}: ${count}</li>`)
          .join("")
      : `<li>Ma’lumot yo‘q</li>`;

  // Diagramma (grafik) chizish
  renderChart(
    ["Filial daromadi", "Buyurtmalar daromadi", "Xarajatlar", "Sof foyda"],
    [
      data.branch_income || 0,
      data.total_order_income || 0,
      data.total_expenses || 0,
      data.net_profit || 0
    ]
  );
}


export function viewReport() {
  const type = document.querySelector('input[name="reportType"]:checked').value;

  let url, param;

  if (type === "kunlik") {
    param = document.getElementById("report-date").value;
    if (!param) return alert("Sanani tanlang!");
    url = new URL(`http://localhost:3000/report/kunlik`);
    url.searchParams.append("date", param);
  } else if (type === "haftalik") {
    param = document.getElementById("report-week").value;
    if (!param) return alert("Haftani tanlang!");
    url = new URL(`http://localhost:3000/report/haftalik`);
    url.searchParams.append("week", param);
  } else if (type === "oylik") {
    param = document.getElementById("report-month").value;
    if (!param) return alert("Oyni tanlang!");
    url = new URL(`http://localhost:3000/report/oylik`);
    url.searchParams.append("month", param);
  } else if (type === "oraliq") {
    const from = document.getElementById("report-date-from").value;
    const to = document.getElementById("report-date-to").value;
    if (!from || !to) return alert("Boshlanish va tugash sanani tanlang!");
    url = new URL(`http://localhost:3000/report/interval`);
    url.searchParams.append("from", from);
    url.searchParams.append("to", to);
  } else {
    return alert("Hisobot turi tanlanmagan!");
  }

  fetch(url.toString())
    .then(res => {
      if (!res.ok) throw new Error("Hisobotni olishda xatolik");
      return res.json();
    })
    .then(data => {
      if (!data) return alert("Ma’lumot topilmadi!");
      renderReportResult(data);
    })
    .catch(err => {
      console.error("❌ Hisobotda xatolik:", err.message);
      alert("Hisobotni olishda xatolik yuz berdi");
    });
}







// 📥 PDF yuklash tugmasi
export function downloadPdfReport() {
  const type = document.querySelector('input[name="reportType"]:checked').value;
  const param = getReportParam(type);
  if (!param) return alert("Sana tanlanmagan!");
  const url = `http://localhost:3000/report/pdf/${type}?${getParamKey(type)}=${encodeURIComponent(param)}`;
  window.open(url, "_blank");
}



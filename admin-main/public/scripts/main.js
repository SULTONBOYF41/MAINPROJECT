import { submitOrder, loadOrders } from "./orders.js";
import { submitExpense, loadExpenses } from "./expenses.js";
import { initReportDropdown, viewReport, downloadPdfReport } from "./report.js";
import { loadProducts, initProductForm } from "./products.js";

// --- SPA bo‘lim o‘zgartirish ---
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const page = document.getElementById("page-" + id);
  if (page) {
    page.classList.add("active");
    if (window.location.hash.replace("#", "") !== id) {
      window.location.hash = id;
    }
  }
}

// --- Sahifa yuklanganda va hash o‘zgarganda sectionni ko‘rsatish
function handleHashSection() {
  let id = window.location.hash.replace("#", "") || "report";
  showPage(id);

  // *** Faqat buyurtmalar sahifasiga o‘tsak, orders tab ochiq bo‘lsa pollingni ishga tushuramiz ***
  if (id === "orders") {
    // Buyurtmalar jadvali yangilansin (tab "Buyurtmalar" faol bo‘lsa)
    const ordersTabActive = document.getElementById("tab-orders-list").classList.contains("active");
    if (ordersTabActive) {
      loadOrders();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("order-form")?.addEventListener("submit", submitOrder);
  document.getElementById("expense-form")?.addEventListener("submit", submitExpense);
  document.getElementById("view-report-btn")?.addEventListener("click", viewReport);
  document.getElementById("download-pdf-btn")?.addEventListener("click", downloadPdfReport);

  loadExpenses();
  loadProducts();
  initProductForm();
  initReportDropdown();

  handleHashSection();

  document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      let text = btn.textContent.toLowerCase();
      if (text.includes("hisobot")) window.location.hash = "report";
      else if (text.includes("buyurtma")) window.location.hash = "orders";
      else if (text.includes("xarajat")) window.location.hash = "expenses";
      else if (text.includes("ishlab")) window.location.hash = "production";
      else if (text.includes("mahsulot")) window.location.hash = "products";
    });
  });

  // --- POLLING: Har 5 sekunda buyurtmalar tab faol bo‘lsa jadvalni avtomatik yangilash
  setInterval(() => {
    // Faqat buyurtmalar sahifasida va "Buyurtmalar" TAB faol bo‘lsa
    const pageOrdersActive = document.getElementById("page-orders").classList.contains("active");
    const tabOrdersListActive = document.getElementById("tab-orders-list").classList.contains("active");
    if (pageOrdersActive && tabOrdersListActive) {
      loadOrders();
    }
  }, 1000); // 5 sekundda bir
});

window.addEventListener("hashchange", handleHashSection);

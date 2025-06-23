const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { getDateRange } = require("../utils/dateHelpers");
const PDFDocument = require("pdfkit"); // Boshida
const stream = require("stream");      // Boshida, agar kerak bo‘lsa

// YANGI: Sana oraliq bo‘yicha hisobot
router.get("/interval", (req, res) => {
  const { from, to, branch } = req.query;
  if (!from || !to) return res.status(400).send("❌ Sana oralig‘i tanlanmagan");

  // Quyida eski asosiy hisobot logikasini takrorlang, faqat start = from, end = to bo‘ladi:
  const start = from, end = to;

  // --- Quyida qolgan eski kodni copy-paste qilamiz (faqat type/queryParam qismi yo'q) ---

  const report = {
    range: { start, end },
    total_production_kg: 0,
    total_production_dona: 0,
    store_sold_kg: 0,
    store_sold_kg_price: 0,
    store_sold_dona: 0,
    store_sold_dona_price: 0,
    total_orders: 0,
    total_order_income: 0,
    total_income: 0,
    total_expenses: 0,
    net_profit: 0,
    branch_income: 0,
    total_production_sum: 0,
    platforms: {},
    top_products: []
  };

  db.all(`SELECT quantity, unit FROM production WHERE date BETWEEN ? AND ?`, [start, end], (err, rows) => {
    if (err) return res.status(500).send("❌ Mahsulotlarni olishda xatolik: " + err.message);

    rows.forEach(row => {
      const unit = (row.unit || "").toLowerCase();
      const qty = parseFloat(row.quantity || 0);
      if (unit.includes("kg")) report.total_production_kg += qty;
      else report.total_production_dona += qty;
    });

    report.total_production_sum = report.total_production_kg + report.total_production_dona;

    db.get(`SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?`, [start, end], (err, row) => {
      if (err) return res.status(500).send("❌ Xarajatlarni olishda xatolik: " + err.message);
      report.total_expenses = row?.total || 0;

      db.all(`SELECT product, quantity, unit, price, source FROM orders WHERE date BETWEEN ? AND ?`, [start, end], (err, orders) => {
        if (err) return res.status(500).send("❌ Buyurtmalarni olishda xatolik: " + err.message);
        report.total_orders = orders.length;

        const productSales = {};
        const platforms = {};
        let order_income = 0;

        orders.forEach(o => {
          const source = (o.source || '').toLowerCase();
          const isFilial = source === "filial";
          const qty = parseFloat(o.quantity || 0);
          const price = parseFloat(o.price || 0);

          if (o.product) {
            productSales[o.product] = (productSales[o.product] || 0) + qty;
          }

          if (!isFilial) {
            platforms[source] = (platforms[source] || 0) + 1;
            order_income += qty * price;
          }
        });

        report.total_order_income = order_income;

        const branchQuery = branch
          ? `SELECT 
              SUM(CASE WHEN unit = 'kg' THEN quantity ELSE 0 END) AS total_kg,
              SUM(CASE WHEN unit = 'kg' THEN price ELSE 0 END) AS total_kg_price,
              SUM(CASE WHEN unit = 'dona' THEN quantity ELSE 0 END) AS total_dona,
              SUM(CASE WHEN unit = 'dona' THEN price ELSE 0 END) AS total_dona_price
            FROM branch_sales
            WHERE date BETWEEN ? AND ? AND branch = ?`
          : `SELECT 
              SUM(CASE WHEN unit = 'kg' THEN quantity ELSE 0 END) AS total_kg,
              SUM(CASE WHEN unit = 'kg' THEN price ELSE 0 END) AS total_kg_price,
              SUM(CASE WHEN unit = 'dona' THEN quantity ELSE 0 END) AS total_dona,
              SUM(CASE WHEN unit = 'dona' THEN price ELSE 0 END) AS total_dona_price
            FROM branch_sales
            WHERE date BETWEEN ? AND ?`;

        const params = branch ? [start, end, branch] : [start, end];

        db.get(branchQuery, params, (err, branchData) => {
          if (err) return res.status(500).send("❌ Filial sotuvlarini olishda xatolik: " + err.message);

          report.store_sold_kg = branchData?.total_kg || 0;
          report.store_sold_kg_price = branchData?.total_kg_price || 0;
          report.store_sold_dona = branchData?.total_dona || 0;
          report.store_sold_dona_price = branchData?.total_dona_price || 0;

          report.branch_income = report.store_sold_kg_price + report.store_sold_dona_price;
          report.total_income = report.total_order_income + report.branch_income;
          report.net_profit = report.total_income - report.total_expenses;
          report.platforms = platforms;

          report.top_products = Object.entries(productSales)
            .map(([name, sold]) => ({ name, sold }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

          res.json(report);
        });
      });
    });
  });
});

// === PDF Hisobot route ===
router.get("/pdf/:type", (req, res) => {
  const { type } = req.params;
  const { date, week, month, from, to } = req.query;
  // Sana oraliqni aniqlash
  let queryParam = date || week || month || null;
  let start, end;
  if (type === "oraliq") {
    if (!from || !to) return res.status(400).send("❌ Sana oralig‘i tanlanmagan");
    start = from;
    end = to;
  } else {
    if (!queryParam) return res.status(400).send("❌ Sana tanlanmagan");
    const range = require("../utils/dateHelpers").getDateRange(type, queryParam);
    start = range.start;
    end = range.end;
  }

  // Ma'lumotlarni SQLdan yuklash (foydalanuvchi ehtiyojiga moslashtiring)
  db.all(
    `SELECT * FROM orders WHERE date BETWEEN ? AND ? ORDER BY date ASC`,
    [start, end],
    (err, rows) => {
      if (err) return res.status(500).send("❌ PDF uchun buyurtmalarni olishda xatolik: " + err.message);

      // PDF document yaratish
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      doc.fontSize(16).text('📊 Ruxshona Tort Hisobot', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Sana oralig‘i: ${start} dan ${end} gacha`);
      doc.moveDown();

      // Jadval sarlavhasi
      doc.font("Helvetica-Bold");
      doc.text("Mijoz", 40, doc.y, { continued: true });
      doc.text("Mahsulot", 120, doc.y, { continued: true });
      doc.text("Miqdor", 250, doc.y, { continued: true });
      doc.text("Birlik", 310, doc.y, { continued: true });
      doc.text("Narxi", 370, doc.y, { continued: true });
      doc.text("Sana", 440, doc.y, { continued: true });
      doc.text("Izoh", 500, doc.y);
      doc.font("Helvetica");

      doc.moveDown(0.5);

      // Jadval qatorlari
      rows.forEach(row => {
        doc.text(row.customer || "-", 40, doc.y, { continued: true });
        doc.text(row.product || "-", 120, doc.y, { continued: true });
        doc.text(row.quantity || "-", 250, doc.y, { continued: true });
        doc.text(row.unit || "-", 310, doc.y, { continued: true });
        doc.text(row.price || "-", 370, doc.y, { continued: true });
        doc.text(row.date || "-", 440, doc.y, { continued: true });
        doc.text(row.note || "-", 500, doc.y);
      });

      doc.end();
    }
  );
});

module.exports = router;

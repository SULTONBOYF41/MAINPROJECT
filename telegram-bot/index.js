const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const db = require("./db/database");


const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Buyurtmalar data (agar SQLite ishlatmasangiz, bu vaqtinchalik)
let orders = [];
let orderId = 1;

// Status bo‘yicha buyurtmalarni olish
app.get("/bot-orders", (req, res) => {
  const { status } = req.query;

  db.all(`
    SELECT * FROM orders WHERE status = ? ORDER BY id DESC
  `, [status], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Buyurtma statusini yangilash
app.patch("/bot-orders/status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// Hisobot uchun statistikalar
app.get("/bot-reports", (req, res) => {
  const { from, to } = req.query;

  const stats = {
    total: 0,
    accepted: 0,
    ready: 0,
    cancelled: 0,
    top_customers: [],
    top_cakes: []
  };

  db.all(`
    SELECT * FROM orders WHERE created_at BETWEEN ? AND ?
  `, [from, to], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    stats.total = rows.length;
    stats.accepted = rows.filter(o => o.status === 'accepted').length;
    stats.ready = rows.filter(o => o.status === 'ready').length;
    stats.cancelled = rows.filter(o => o.status === 'cancelled').length;

    const countBy = (arr, key) => {
      const map = {};
      arr.forEach(row => {
        map[row[key]] = (map[row[key]] || 0) + 1;
      });
      return Object.entries(map)
        .map(([k, v]) => ({ [key]: k, count: v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    };

    stats.top_customers = countBy(rows, "username");
    stats.top_cakes = countBy(rows, "cake_name");

    res.json(stats);
  });
});


// Botga xabar yuborish uchun endpoint (loggina yozib qo'yamiz)
app.post("/bot-orders/send-message", (req, res) => {
  const { chat_id, text } = req.body;
  console.log(`✉️ BOTGA YUBORISH: [${chat_id}] - ${text}`);
  res.json({ ok: true });
});

// Vaqtincha buyurtma qo‘shish (test uchun)
app.post("/bot-orders", (req, res) => {
  const { cake_name, weight, phone, username, chat_id } = req.body;

  const created_at = new Date().toISOString().split("T")[0];

  db.run(`
    INSERT INTO orders (cake_name, weight, phone, username, chat_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `, [cake_name, weight, phone, username, chat_id, created_at], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});




app.listen(PORT, () => {
  console.log(`✅ Telegram bot backend: http://localhost:${PORT}`);
});

function getTopItems(data, field) {
  const counts = {};
  data.forEach(item => {
    counts[item[field]] = (counts[item[field]] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([key, count]) => ({ [field]: key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}


const TelegramBot = require("node-telegram-bot-api");
const { TOKEN } = require("./config");
const { orderHandler } = require("./handlers/orderHandler");

const bot = new TelegramBot(TOKEN, { polling: true });

orderHandler(bot);

console.log("🤖 Telegram bot ishlayapti...");

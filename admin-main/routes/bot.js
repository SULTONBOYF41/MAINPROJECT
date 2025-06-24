// routes/bot.js
const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Buyurtmalarni status bo‘yicha olish
router.get("/orders", (req, res) => {
  const { status } = req.query;
  db.all(
    `SELECT * FROM orders WHERE status = ? ORDER BY id DESC`,
    [status],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Buyurtma statusini o‘zgartirish
router.patch("/orders/status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Hisobot statistikasi
router.get("/reports", (req, res) => {
  const { from, to } = req.query;
  const stats = {
    total: 0,
    accepted: 0,
    ready: 0,
    cancelled: 0,
    top_customers: [],
    top_cakes: []
  };

  db.all(
    `SELECT * FROM orders WHERE date BETWEEN ? AND ?`,
    [from, to],
    (err, rows) => {
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

      stats.top_customers = countBy(rows, "customer");
      stats.top_cakes = countBy(rows, "product");

      res.json(stats);
    }
  );
});

// Telegramga xabar yuborish (hozircha logda chiqadi)
router.post("/orders/send-message", (req, res) => {
  const { chat_id, text } = req.body;
  console.log(`✉️ BOTGA YUBORISH: [${chat_id}] - ${text}`);
  res.json({ ok: true });
});

module.exports = router;

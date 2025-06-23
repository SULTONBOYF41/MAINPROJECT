const express = require("express");
const router = express.Router();
const db = require("../db/database");

// routes/orders.js

router.post("/", (req, res) => {
  const { customer, product, quantity, unit, source, price, date, note } = req.body;
  db.run("INSERT INTO orders (customer, product, quantity, unit, source, price, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
    [customer, product, quantity, unit, source, price, date, note], 
    err => {
      if (err) return res.status(500).send(err.message);
      res.send("✅ Buyurtma muvaffaqiyatli qo‘shildi");
  });
});

router.get("/", (_, res) => {
  db.all("SELECT * FROM orders ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) return res.status(500).send("Xatolik: " + err.message);
    res.send("Status muvaffaqiyatli o‘zgartirildi");
  });
});


module.exports = router;
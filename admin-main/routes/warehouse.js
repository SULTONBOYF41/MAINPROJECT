const express = require("express");
const router = express.Router();
const db = require("../db/database");

// ✅ Ombor ma'lumotlari (faqat variantsiz mahsulotlar)
router.get("/", (req, res) => {
  const query = `
    SELECT 
      p.id as product_id,
      p.name as product_name,
      p.category,
      p.image,
      p.price,
      p.description,
      p.unit,
      p.has_variants,
      w.quantity as warehouse_qty
    FROM products p
    LEFT JOIN warehouse w ON p.id = w.product_id AND p.unit = w.unit
    WHERE p.has_variants = 0
    ORDER BY p.id DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("📛 SQL xatosi:", err.message);
      return res.status(500).json({ error: err.message });
    }

    const result = rows.map(row => ({
      product_id: row.product_id,
      name: row.product_name,
      category: row.category,
      image: row.image,
      description: row.description,
      unit: row.unit,
      price: row.price,
      has_variants: false,
      variants: [],
      quantity: { unit: row.unit, value: row.warehouse_qty ?? 0 }
    }));

    res.json(result);
  });
});

// ✅ POST: Yangi miqdor qo‘shish yoki yangilash
router.post("/", (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || quantity == null) return res.status(400).json({ error: "Ma'lumotlar yetarli emas" });

  db.get(`SELECT id FROM warehouse WHERE product_id = ?`, [product_id], (err, row) => {
    if (err) return res.status(500).json({ error: "Tekshiruvda xatolik" });

    if (row) {
      db.run(
        `UPDATE warehouse SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?`,
        [quantity, product_id],
        err => {
          if (err) return res.status(500).json({ error: "Yangilashda xatolik" });
          res.json({ success: true, updated: true });
        }
      );
    } else {
      db.run(
        `INSERT INTO warehouse (product_id, quantity) VALUES (?, ?)`,
        [product_id, quantity],
        err => {
          if (err) return res.status(500).json({ error: "Qo‘shishda xatolik" });
          res.json({ success: true, created: true });
        }
      );
    }
  });
});

// ✅ DELETE
router.delete("/:product_id", (req, res) => {
  const { product_id } = req.params;
  db.run(`DELETE FROM warehouse WHERE product_id = ?`, [product_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Mahsulot topilmadi" });
    res.json({ success: true, deleted: true });
  });
});

// ✅ PUT
router.put("/:product_id", (req, res) => {
  const { product_id } = req.params;
  const { quantity } = req.body;
  if (quantity == null) return res.status(400).json({ error: "Yangi miqdor kerak" });

  db.run(
    `UPDATE warehouse SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?`,
    [quantity, product_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Mahsulot topilmadi" });
      res.json({ success: true, updated: true });
    }
  );
});

module.exports = router;

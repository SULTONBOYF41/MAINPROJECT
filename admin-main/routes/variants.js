const express = require("express");
const router = express.Router();
const db = require("../db/database");

// 🔍 Mahsulotga tegishli variantlarni olish
router.get("/products/:id/variants", (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM product_variants WHERE product_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).send("❌ Variantlarni olishda xatolik");
    res.json(rows);
  });
});

// ➕ Variantlarni qo‘shish (faqat mahsulot yaratish paytida)
router.post("/products/:id/variants", (req, res) => {
  const { id } = req.params;
  const variants = req.body.variants;

  if (!Array.isArray(variants)) {
    return res.status(400).send("❌ Variantlar noto‘g‘ri formatda");
  }

  const stmt = db.prepare(
    "INSERT INTO product_variants (product_id, size, price, unit) VALUES (?, ?, ?, ?)"
  );

  for (let variant of variants) {
    stmt.run(id, variant.size, variant.price, variant.unit);
  }

  stmt.finalize((err) => {
    if (err) return res.status(500).send("❌ Variantlarni saqlashda xatolik");
    res.send("✅ Variantlar saqlandi");
  });
});

// ❌ Mahsulot o‘chirilganda variantlarini o‘chirish
router.delete("/products/:id/variants", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM product_variants WHERE product_id = ?", [id], function (err) {
    if (err) return res.status(500).send("❌ Variantlarni o‘chirishda xatolik");
    res.send("🗑️ Variantlar o‘chirildi");
  });
});

module.exports = router;

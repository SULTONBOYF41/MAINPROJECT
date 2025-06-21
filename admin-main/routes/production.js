const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/", (req, res) => {
  const { name, quantity, unit, size, date } = req.body;

  if (!name || !quantity || !unit || !date) {
    return res.status(400).send("❌ Barcha maydonlar to‘ldirilishi shart");
  }

  const qty = parseFloat(quantity);
  const normalizedUnit = unit.toLowerCase().includes("kg") ? "kg" : "dona";
  const cleanName = name.trim().toLowerCase();

  db.get(
    "SELECT id, name, unit, has_variants FROM products WHERE LOWER(name) = ?",
    [cleanName],
    (err, product) => {
      if (err) return res.status(500).send("❌ Mahsulotni aniqlashda xatolik: " + err.message);
      if (!product) return res.status(404).send(`❌ "${name}" nomli mahsulot mavjud emas`);

      const product_id = product.id;

      // PRODUCTION jadvaliga yozamiz
      db.run(
        `INSERT INTO production (name, quantity, unit, size, date) VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), qty, normalizedUnit, size || null, date],
        err => {
          if (err) return res.status(500).send("❌ Ishlab chiqarishni saqlashda xatolik: " + err.message);

          if (product.has_variants) {
            // ...VARIANTLI logika (to‘g‘ri ishlayapti!)
            if (!size) return res.status(400).send("❌ Variant mahsulotlar uchun o‘lcham majburiy");
            db.get(
              `SELECT id, quantity FROM product_variants WHERE product_id = ? AND unit = ? AND size = ?`,
              [product_id, normalizedUnit, size],
              (err, variant) => {
                if (err) return res.status(500).send("❌ Variantni tekshirishda xatolik: " + err.message);
                if (variant) {
                  const newQty = parseFloat(variant.quantity) + qty;
                  db.run(
                    `UPDATE product_variants SET quantity = ? WHERE id = ?`,
                    [newQty, variant.id],
                    err => {
                      if (err) return res.status(500).send("❌ Variantni yangilashda xatolik: " + err.message);
                      res.send("✅ Variant omborda miqdori yangilandi");
                    }
                  );
                } else {
                  return res.status(404).send(`❌ "${name}" mahsulotining "${size} ${normalizedUnit}" varianti topilmadi`);
                }
              }
            );
          } else {
            // ------> FAQAT SHU QISM: VARIANTSIZ mahsulot uchun OMORGA QO‘SHISH <------

            db.get(
              `SELECT id, quantity FROM warehouse WHERE product_id = ? AND unit = ?`,
              [product_id, normalizedUnit],
              (err, row) => {
                if (err) return res.status(500).send("❌ Omborni tekshirishda xatolik: " + err.message);

                if (row) {
                  // BOR BO‘LSA MIQDORINI YANGILAYMIZ
                  const newQty = parseFloat(row.quantity) + qty;
                  db.run(
                    `UPDATE warehouse SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [newQty, row.id],
                    err => {
                      if (err) return res.status(500).send("❌ Omborni yangilashda xatolik: " + err.message);
                      res.send("✅ Omborda miqdor yangilandi");
                    }
                  );
                } else {
                  // YO‘Q BO‘LSA YANGI QO‘SHAMIZ — **unit majburiy!**
                  db.run(
                    `INSERT INTO warehouse (product_id, quantity, unit) VALUES (?, ?, ?)`,
                    [product_id, qty, normalizedUnit],
                    err => {
                      if (err) return res.status(500).send("❌ Omborga qo‘shishda xatolik: " + err.message);
                      res.send("✅ Omborga yangi mahsulot qo‘shildi");
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  );
});

router.get("/", (req, res) => {
  db.all("SELECT * FROM production ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).send("❌ O‘qishda xatolik: " + err.message);
    res.json(rows);
  });
});

module.exports = router;

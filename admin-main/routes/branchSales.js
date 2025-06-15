const express = require("express");
const router = express.Router();
const db = require("../db/database");

// ✅ Filial sotuvini qo‘shish
router.post("/", (req, res) => {
  console.log("📥 POST /branch-sales qabul qilindi");
  console.log("➡️ So‘rov body:", req.body);

  let { branch, product, quantity, unit, price, date, source } = req.body;

  if (!branch || !product || !quantity || !unit || !price || !date) {
    console.log("⚠️ Maydonlar to‘liq emas:", req.body);
    return res.status(400).send("❌ Barcha maydonlar to‘ldirilishi kerak");
  }

  const qty = parseFloat(quantity);
  price = parseInt(price);

  if (isNaN(qty) || isNaN(price)) {
    console.log("⚠️ Miqdor yoki narx noto‘g‘ri:", { qty, price });
    return res.status(400).send("❌ Miqdor yoki narx noto‘g‘ri formatda");
  }

  // 🔍 Mahsulot ID ni name + unit bo‘yicha topamiz
  db.get(`SELECT id FROM products WHERE name = ? AND unit = ?`, [product, unit], (err, found) => {
    if (err) {
      console.log("❌ Mahsulotni izlashda xatolik:", err.message);
      return res.status(500).send("❌ Mahsulotni izlashda xatolik");
    }
    if (!found) {
      console.log("❌ Mahsulot topilmadi:", product, unit);
      return res.status(404).send("❌ Mahsulot topilmadi");
    }

    const productId = found.id;
    console.log("🔎 Topilgan mahsulot ID:", productId);

    db.get(
      `SELECT quantity FROM warehouse WHERE product_id = ? AND unit = ?`,
      [productId, unit],
      (err, row) => {
        if (err) {
          console.log("❌ Ombor tekshiruvida xatolik:", err.message);
          return res.status(500).send("❌ Ombor tekshiruvida xatolik");
        }

        if (!row) {
          console.log("⚠️ Omborda bu mahsulot yo‘q:", productId, unit);
          return res.status(400).send("❌ Omborda bu mahsulot topilmadi");
        }

        const availableQty = parseFloat(row.quantity);
        if (isNaN(availableQty)) {
          return res.status(500).send("❌ Ombordagi miqdor noto‘g‘ri formatda");
        }

        if (availableQty < qty) {
          return res.status(400).send(`❌ Omborda yetarli mahsulot yo‘q. Bor: ${availableQty} ${unit}`);
        }

        // ✅ Sotuvni saqlash
        db.run(
          `INSERT INTO branch_sales (branch, product, quantity, unit, price, date, source)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [branch, product, qty, unit, price, date, source || null],
          function (err) {
            if (err) {
              console.log("❌ Sotuvni saqlashda xatolik:", err.message);
              return res.status(500).send("❌ Saqlashda xatolik: " + err.message);
            }

            // 🔁 Omborni yangilash
            const newQty = availableQty - qty;
            db.run(
              `UPDATE warehouse SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ? AND unit = ?`,
              [newQty, productId, unit],
              err => {
                if (err) {
                  console.log("❌ Omborni yangilashda xatolik:", err.message);
                  return res.status(500).send("❌ Omborni yangilashda xatolik");
                }

                res.send("✅ Sotuv saqlandi va ombor yangilandi");
              }
            );
          }
        );
      }
    );
  });
});


router.get("/", (req, res) => {
  const { date, branch } = req.query;
  let query = "SELECT * FROM branch_sales";
  const params = [];

  if (branch && date) {
    query += " WHERE branch = ? AND date = ?";
    params.push(branch, date);
  } else if (branch) {
    query += " WHERE branch = ?";
    params.push(branch);
  } else if (date) {
    query += " WHERE date = ?";
    params.push(date);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).send("❌ O‘qishda xatolik");
    res.json(rows);
  });
});

// ✅ Sotuvni yangilash
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { branch, product, quantity, unit, price, date } = req.body;

  if (!branch || !product || !quantity || !unit || !price || !date) {
    return res.status(400).send("❌ Barcha maydonlar to‘ldirilishi kerak");
  }

  db.run(
    `UPDATE branch_sales SET branch = ?, product = ?, quantity = ?, unit = ?, price = ?, date = ? WHERE id = ?`,
    [branch, product, quantity, unit, price, date, id],
    function (err) {
      if (err) return res.status(500).send("❌ Yangilashda xatolik: " + err.message);
      if (this.changes === 0) return res.status(404).send("❌ Sotuv topilmadi");
      res.send("✅ Sotuv muvaffaqiyatli yangilandi");
    }
  );
});


module.exports = router;

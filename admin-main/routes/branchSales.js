const express = require("express");
const router = express.Router();
const db = require("../db/database");

// ✅ Filial sotuvini qo‘shish (variantli va variantsiz uchun)
  router.post("/", (req, res) => {
    let { branch, product, quantity, unit, price, date, size, source } = req.body;

    product = (product || '').trim();
    unit = (unit || '').trim().toLowerCase();

    if (!branch || !product || !quantity || !unit || !price || !date) {
      return res.status(400).send("❌ Barcha maydonlar to‘ldirilishi kerak");
    }

    const qty = parseFloat(quantity);
    price = parseInt(price);

    if (isNaN(qty) || isNaN(price)) {
      return res.status(400).send("❌ Miqdor yoki narx noto‘g‘ri formatda");
    }

    db.get(
      `SELECT id, has_variants FROM products WHERE name = ? LIMIT 1`,
      [product],
      (err, productRow) => {
        if (err || !productRow) return res.status(404).send("❌ Mahsulot topilmadi");

        // === VARIANTLI ===
        if (productRow.has_variants) {
          if (typeof size === "string" && size.trim() !== "") size = parseFloat(size);
          if (!size && size !== 0) return res.status(400).send("❌ Variant (o‘lcham) tanlanmagan!");

          db.get(
            `SELECT id, quantity FROM product_variants WHERE product_id = ? AND size = ? AND unit = ?`,
            [productRow.id, size, unit],
            (err2, variantRow) => {
              if (err2 || !variantRow) return res.status(404).send("❌ Variant topilmadi");

              const availableQty = parseFloat(variantRow.quantity);
              if (availableQty < qty) {
                return res.status(400).send(`❌ Omborda yetarli emas. Bor: ${availableQty}`);
              }

              // Sotuvni branch_sales ga yozamiz (size ham kiritiladi!)
              db.run(
                `INSERT INTO branch_sales (branch, product, quantity, unit, price, date, source, size)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [branch, product, qty, unit, price, date, source || null, size],
                function (err3) {
                  if (err3) return res.status(500).send("❌ Saqlanmadi");

                  const newQty = availableQty - qty;
                  db.run(
                    `UPDATE product_variants SET quantity = ? WHERE id = ?`,
                    [newQty, variantRow.id],
                    (err4) => {
                      if (err4) return res.status(500).send("❌ Ombor variant yangilanmadi");
                      res.send("✅ Mahsulot saqlandi va ombor yangilandi");
                    }
                  );
                }
              );
            }
          );

        // === VARIANTSIZ ===
        } else {
          db.get(
            `SELECT id FROM products WHERE name = ? AND LOWER(unit) = ? AND has_variants = 0`,
            [product, unit],
            (err, found2) => {
              if (err || !found2) return res.status(404).send("❌ Mahsulot topilmadi");
              const productId = found2.id;

              db.get(
                `SELECT quantity FROM warehouse WHERE product_id = ? AND LOWER(unit) = ?`,
                [productId, unit],
                (err3, row) => {
                  if (err3 || !row) return res.status(400).send("❌ Omborda topilmadi");
                  const availableQty = parseFloat(row.quantity);
                  if (availableQty < qty) {
                    return res.status(400).send(`❌ Omborda yetarli emas. Bor: ${availableQty}`);
                  }

                  db.run(
                    `INSERT INTO branch_sales (branch, product, quantity, unit, price, date, source, size)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
                    [branch, product, qty, unit, price, date, source || null],
                    function (err4) {
                      if (err4) return res.status(500).send("❌ Saqlanmadi");

                      const newQty = availableQty - qty;
                      db.run(
                        `UPDATE warehouse SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ? AND LOWER(unit) = ?`,
                        [newQty, productId, unit],
                        (err5) => {
                          if (err5) return res.status(500).send("❌ Ombor yangilanmadi");
                          res.send("✅ Mahsulot saqlandi va ombor yangilandi");
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      }
    );
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

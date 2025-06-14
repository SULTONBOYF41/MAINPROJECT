const express = require("express");
const router = express.Router();
const db = require("../db/database");
const multer = require("multer");
const path = require("path");

// RASM yuklash sozlamalari
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 1. Mahsulot qo‘shish (va omborga yozish)
router.post("/", upload.single("image"), (req, res) => {
  const { name, category, price, description, unit } = req.body;
  const image = req.file?.filename || "";

  if (!name || !category || !price || !unit) {
    return res.status(400).send("❌ Majburiy maydonlar to‘ldirilmagan");
  }

  db.run(
    `INSERT INTO products (name, category, price, image, description, unit)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, price, image, description || "", unit],
    function (err) {
      if (err) return res.status(500).send("❌ Mahsulot saqlashda xatolik: " + err.message);

      const newProductId = this.lastID;

      db.run(
        `INSERT INTO warehouse (product_id, quantity, unit) VALUES (?, 0, ?)`,
        [newProductId, unit],
        err => {
          if (err) {
            console.error("❌ Omborga yozishda xatolik:", err.message);
            return res.status(500).send("❌ Mahsulot qo‘shildi, lekin omborga yozilmadi");
          }
          res.send("✅ Mahsulot va Omborga muvaffaqiyatli qo‘shildi");
        }
      );
    }
  );
});

// 2. Mahsulotlar ro‘yxatini olish
router.get("/", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).send("❌ Mahsulotlarni olishda xatolik: " + err.message);
    res.json(rows);
  });
});

// 3. Mahsulotni o‘chirish (ombor yozuvi bilan)
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).send("❌ O‘chirishda xatolik: " + err.message);
    if (this.changes === 0) return res.status(404).send("❌ Mahsulot topilmadi");

    db.run("DELETE FROM warehouse WHERE product_id = ?", [id]);
    res.send("🗑️ Mahsulot (va ombordagi yozuvi) o‘chirildi");
  });
});

// 4. Mahsulotni yangilash (rasm bilan yoki rasm yo‘q)
router.post("/:id", upload.single("image"), (req, res) => {
  const { name, category, price, description, unit } = req.body;
  const id = req.params.id;
  const image = req.file?.filename;

  if (!name || !category || !price || !unit) {
    return res.status(400).send("❌ Majburiy maydonlar to‘ldirilmagan");
  }

  const sql = image
    ? `UPDATE products SET name = ?, category = ?, price = ?, description = ?, unit = ?, image = ? WHERE id = ?`
    : `UPDATE products SET name = ?, category = ?, price = ?, description = ?, unit = ? WHERE id = ?`;

  const params = image
    ? [name, category, price, description || "", unit, image, id]
    : [name, category, price, description || "", unit, id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).send("❌ Yangilashda xatolik: " + err.message);
    if (this.changes === 0) return res.status(404).send("❌ Mahsulot topilmadi");

    res.send("✏️ Mahsulot yangilandi");
  });
});

// 5. PUT orqali oddiy yangilash (frontend PUT ishlatgan holat uchun)
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, unit } = req.body;

  if (!name || !category || !price || !unit) {
    return res.status(400).send("❌ Majburiy maydonlar to‘ldirilmagan");
  }

  db.run(
    `UPDATE products SET name = ?, category = ?, price = ?, description = ?, unit = ? WHERE id = ?`,
    [name, category, price, description || "", unit, id],
    function (err) {
      if (err) return res.status(500).send("❌ Yangilashda xatolik: " + err.message);
      if (this.changes === 0) return res.status(404).send("❌ Mahsulot topilmadi");
      res.send("✏️ Mahsulot yangilandi");
    }
  );
});

module.exports = router;

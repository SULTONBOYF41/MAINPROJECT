// 📁 routes/products.js
const express = require("express");
const router = express.Router();
const db = require("../db/database");
const multer = require("multer");
const path = require("path");

// RASM yuklash
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 1. Mahsulot + variantlar qo‘shish
// 📄 Mahsulotni tahrirlash (variantlar bilan)
router.post("/:id", upload.single("image"), (req, res) => {
  const { name, category, price, description, unit, has_variants, variants } = req.body;
  const image = req.file?.filename;
  const { id } = req.params;

  if (!name || !category) return res.status(400).send("❌ Majburiy maydonlar to‘ldirilmagan");

  const updateSql = `
    UPDATE products SET
      name = ?, category = ?, price = ?, description = ?, unit = ?, has_variants = ?
      ${image ? ', image = ?' : ''}
    WHERE id = ?
  `;

  const params = [
    name,
    category,
    price || 0,
    description || "",
    unit || "",
    has_variants === "1" ? 1 : 0,
  ];
  if (image) params.push(image);
  params.push(id);

  db.run(updateSql, params, function (err) {
    if (err) return res.status(500).send("❌ Mahsulotni yangilashda xatolik: " + err.message);

    // Variantlarni yangilash
    if (has_variants === "1" && variants) {
      let parsedVariants;
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        return res.status(400).send("❌ Variantlar noto‘g‘ri formatda");
      }
      // Eski variantlarni o‘chir
      db.run("DELETE FROM product_variants WHERE product_id = ?", [id], err2 => {
        if (err2) return res.status(500).send("❌ Eski variantlarni o‘chirishda xatolik");

        const insertStmt = db.prepare(`INSERT INTO product_variants (product_id, size, price, unit) VALUES (?, ?, ?, ?)`);
        parsedVariants.forEach(v => {
          insertStmt.run([id, v.size, v.price, v.unit]);
        });
        insertStmt.finalize(() => {
          // 🧹 Warehouse ni ham variantlarsiz holda tozalab qo‘yish mumkin (ixtiyoriy)
          db.run("DELETE FROM warehouse WHERE product_id = ?", [id]);
          res.send("✅ Mahsulot muvaffaqiyatli tahrirlandi");
        });
      });
    } else {
      // Variant yo‘q: product_variants tozalansin, warehouse yangilansin
      db.run("DELETE FROM product_variants WHERE product_id = ?", [id], err2 => {
        if (err2) return res.status(500).send("❌ Variantlarni o‘chirishda xatolik");
        db.run(
          "INSERT OR REPLACE INTO warehouse (product_id, quantity, unit) VALUES (?, ?, ?)",
          [id, 0, unit],
          err3 => {
            if (err3) return res.status(500).send("❌ Omborga yozishda xatolik");
            res.send("✅ Mahsulot muvaffaqiyatli tahrirlandi");
          }
        );
      });
    }
  });
});

// 🆕 1. Mahsulot + variantlar qo‘shish (CREATE)
router.post("/", upload.single("image"), (req, res) => {
  const { name, category, price, description, unit, has_variants, variants } = req.body;
  const image = req.file?.filename || "";

  if (!name || !category) {
    return res.status(400).send("❌ Majburiy maydonlar to‘ldirilmagan");
  }

  db.run(
    `INSERT INTO products (name, category, price, image, description, unit, has_variants)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, price || 0, image, description || "", unit || "", has_variants === "1" ? 1 : 0],
    function (err) {
      if (err) return res.status(500).send("❌ Mahsulot saqlashda xatolik: " + err.message);

      const newProductId = this.lastID;

      if (has_variants === "1" && variants) {
        let parsedVariants;
        try {
          parsedVariants = JSON.parse(variants);
        } catch (e) {
          return res.status(400).send("❌ Variantlar noto‘g‘ri formatda");
        }

        const insertStmt = db.prepare(`INSERT INTO product_variants (product_id, size, price, unit) VALUES (?, ?, ?, ?)`);
        parsedVariants.forEach(v => {
          insertStmt.run([newProductId, v.size, v.price, v.unit]);
        });
        insertStmt.finalize(() => {
          res.send("✅ Mahsulot muvaffaqiyatli qo‘shildi (variantlar bilan)");
        });
      } else {
        // oddiy mahsulot bo‘lsa — omborga yozish
        db.run(
          `INSERT INTO warehouse (product_id, quantity, unit) VALUES (?, 0, ?)`,
          [newProductId, unit],
          err => {
            if (err) {
              console.error("❌ Omborga yozishda xatolik:", err.message);
              return res.status(500).send("❌ Mahsulot qo‘shildi, lekin omborga yozilmadi");
            }
            res.send("✅ Mahsulot muvaffaqiyatli qo‘shildi");
          }
        );
      }
    }
  );
});



// 2. Mahsulotlar ro‘yxati (variantlari bilan)
router.get("/", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, products) => {
    if (err) return res.status(500).send("❌ Mahsulotlarni olishda xatolik: " + err.message);

    db.all("SELECT * FROM product_variants", [], (err, variants) => {
      if (err) return res.status(500).send("❌ Variantlarni olishda xatolik");

      const combined = products.map(p => {
        const productVariants = variants.filter(v => v.product_id === p.id);
        return { ...p, variants: productVariants };
      });

      res.json(combined);
    });
  });
});

// 📄 Mahsulotning variantlari (tahrirlaganda olish uchun)
router.get("/:id/variants", (req, res) => {
  const productId = req.params.id;
  db.all(
    "SELECT id, size, price, unit FROM product_variants WHERE product_id = ?",
    [productId],
    (err, rows) => {
      if (err) return res.status(500).send("❌ Variantlarni olishda xatolik");
      res.json(rows);
    }
  );
});


// 3. Mahsulotni o‘chirish (variant va ombor yozuvlari bilan)
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).send("❌ O‘chirishda xatolik: " + err.message);
    if (this.changes === 0) return res.status(404).send("❌ Mahsulot topilmadi");

    db.run("DELETE FROM product_variants WHERE product_id = ?", [id]);
    db.run("DELETE FROM warehouse WHERE product_id = ?", [id]);
    res.send("🗑️ Mahsulot va barcha bog‘liq ma'lumotlar o‘chirildi");
  });
});



module.exports = router;

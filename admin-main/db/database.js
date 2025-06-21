// 📁 db/database.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./ruxshona.db");

// Mahsulotlar jadvali (has_variants alohida berilgan)
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price INTEGER,
    image TEXT,
    description TEXT,
    unit TEXT,
    has_variants INTEGER DEFAULT 0
  )
`);

// Mahsulot variantlari (masalan: 40 sm, 50 sm)
db.run(`
  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    size REAL,
    price INTEGER,
    unit TEXT,
    quantity REAL DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )
`);

// Omborxona (bitta mahsulotning variantsiz va variantsiz birlikda miqdori)
db.run(`
  CREATE TABLE IF NOT EXISTS warehouse (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity REAL,
    unit TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Ishlab chiqarish (size variantsiz uchun NULL, variantli uchun mavjud)
db.run(`
  CREATE TABLE IF NOT EXISTS production (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    size REAL,                -- <== YANGI QO'SHILGAN
    date TEXT NOT NULL
  )
`);

// Filial sotuvlari
db.run(`
  CREATE TABLE IF NOT EXISTS branch_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price INTEGER NOT NULL,
    date TEXT NOT NULL,
    source TEXT
  )
`);

// Buyurtmalar
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price INTEGER NOT NULL,
    date TEXT NOT NULL,
    source TEXT,
    customer TEXT,
    note TEXT
  )
`);

// Xarajatlar
db.run(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    note TEXT
  )
`);

// Foydalanuvchilar
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// --- Migratsiya: eski bazalarda yetishmayotgan ustunlarni qo‘shish ---
db.all("PRAGMA table_info(products)", (err, columns) => {
  if (err) {
    console.error("PRAGMA table_info(products) xatolik:", err.message);
    return;
  }
  if (!columns.some(c => c.name === 'has_variants')) {
    db.run(`ALTER TABLE products ADD COLUMN has_variants INTEGER DEFAULT 0`);
  }
});

db.all("PRAGMA table_info(production)", (err, columns) => {
  if (err) {
    console.error("PRAGMA table_info(production) xatolik:", err.message);
    return;
  }
  if (!columns.some(c => c.name === 'size')) {
    db.run(`ALTER TABLE production ADD COLUMN size REAL`);
  }
});

// --- Migratsiya: branch_sales jadvaliga size ustuni qo‘shish
db.all("PRAGMA table_info(branch_sales)", (err, columns) => {
  if (err) {
    console.error("PRAGMA table_info(branch_sales) xatolik:", err.message);
    return;
  }
  if (!columns.some(c => c.name === 'size')) {
    db.run(`ALTER TABLE branch_sales ADD COLUMN size REAL`);
  }
});



module.exports = db;

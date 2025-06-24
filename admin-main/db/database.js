// 📁 db/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Bazani nomini yagona qilamiz:
const dbPath = path.resolve(__dirname, "ruxshona.db");
const db = new sqlite3.Database(dbPath);


db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT,
    phone TEXT,
    address TEXT,
    birthday TEXT,
    telegram_id INTEGER UNIQUE,
    username TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
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
    size REAL,
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
    source TEXT,
    size REAL
  )
`);

// Buyurtmalar (universal, hamma maydonlar bilan)
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product TEXT,         -- admin panel buyurtmalari uchun
    quantity REAL,
    unit TEXT,
    price INTEGER,
    date TEXT,
    source TEXT,
    customer TEXT,
    note TEXT,
    status TEXT DEFAULT 'pending',

    -- Quyidagilar telegram botdan kelsa to‘ladi, admin paneldan kelganda null
    cake_name TEXT,       -- tort nomi (telegram-bot)
    weight TEXT,          -- og‘irligi (telegram-bot)
    phone TEXT,           -- telefon raqam (telegram-bot)
    username TEXT,        -- telegram username
    chat_id INTEGER,
    created_at TEXT
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

// --- Migratsiya: yetishmayotgan ustunlarni qo‘shish (versiyadan qat'i nazar) ---
const migrateIfMissing = (table, column, def) => {
  db.all(`PRAGMA table_info(${table})`, (err, columns) => {
    if (err) {
      console.error(`PRAGMA table_info(${table}) xatolik:`, err.message);
      return;
    }
    // Column nomini kichik harfga tekshirib, aniq solishtiring:
    if (!columns.some(c => c.name && c.name.toLowerCase() === column.toLowerCase())) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
    }
  });
};

migrateIfMissing("products", "has_variants", "INTEGER DEFAULT 0");
migrateIfMissing("production", "size", "REAL");
migrateIfMissing("branch_sales", "size", "REAL");
migrateIfMissing("orders", "cake_name", "TEXT");
migrateIfMissing("orders", "weight", "TEXT");
migrateIfMissing("orders", "phone", "TEXT");
migrateIfMissing("orders", "username", "TEXT");
migrateIfMissing("orders", "chat_id", "INTEGER");
migrateIfMissing("orders", "created_at", "TEXT");

migrateIfMissing("customers", "address", "TEXT");
migrateIfMissing("customers", "birthday", "TEXT");



module.exports = db;

// 📁 db/database.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./ruxshona.db");

// 🧁 Mahsulotlar

db.run(`DROP TABLE IF EXISTS orders`);

db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price INTEGER,
    image TEXT,
    description TEXT,
    unit TEXT
  )
`);

// 🏪 Filial sotuvlari

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


// 📦 Omborxona

db.run(`
  CREATE TABLE IF NOT EXISTS warehouse (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity REAL,
    unit TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// 👤 Foydalanuvchilar
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// 1. Mahsulotlar jadvaliga qo‘shimcha ustun (agar mavjud bo‘lsa, o'tkaziladi)
db.run(`ALTER TABLE products ADD COLUMN has_variants INTEGER DEFAULT 0`, () => {});

// 2. Yangi product_variants jadvali
db.run(`
  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    size REAL,
    price INTEGER,
    unit TEXT,
    quantity INTEGER DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    note TEXT
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS production (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

// 📦 Buyurtmalar (orders)
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



module.exports = db;

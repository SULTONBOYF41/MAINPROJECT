const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "orders.sqlite");
const db = new sqlite3.Database(dbPath);

// Jadval yaratish (agar mavjud bo‘lmasa)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cake_name TEXT,
      weight TEXT,
      phone TEXT,
      username TEXT,
      chat_id INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TEXT
    )
  `);
});

module.exports = db;

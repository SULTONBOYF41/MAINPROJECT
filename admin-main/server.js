// ======= SETUP =======
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 3000;

// ======= DATABASE (umumiy) =======
const db = require("./db/database"); // faqat bitta db, masalan, ruxshona.db

// ======= FILE UPLOAD SETUP =======
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ======= MIDDLEWARE =======
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static('uploads'));
app.use('/warehouse', express.static(path.join(__dirname, 'public/warehouse')));

// ======= ADMIN-MAIN ROUTES =======
app.use("/report", require("./routes/report"));
app.use("/products", require("./routes/products"));
app.use("/production", require("./routes/production"));
app.use("/expenses", require("./routes/expenses"));
app.use("/orders", require("./routes/orders"));
app.use("/branch-sales", require("./routes/branchSales"));
app.use("/api/warehouse", require("./routes/warehouse"));
app.use("/variants", require("./routes/variants"));

// ===================== TELEGRAM BOT MARSHRUTLARI =====================
// (bot frontend yoki hisobotlari uchun API endpointlar, buyurtma status va boshqalar)
app.get("/bot-orders", (req, res) => {
  const { status } = req.query;
  db.all(
    `SELECT * FROM orders WHERE status = ? ORDER BY id DESC`,
    [status],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.patch("/bot-orders/status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Hisobot statistikasi (bot uchun, moslashtirilgan, faqat kerak bo‘lsa)
app.get("/bot-reports", (req, res) => {
  const { from, to } = req.query;
  const stats = {
    total: 0,
    accepted: 0,
    ready: 0,
    cancelled: 0,
    top_customers: [],
    top_cakes: []
  };

  db.all(
    `SELECT * FROM orders WHERE date BETWEEN ? AND ?`,
    [from, to],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      stats.total = rows.length;
      stats.accepted = rows.filter(o => o.status === 'accepted').length;
      stats.ready = rows.filter(o => o.status === 'ready').length;
      stats.cancelled = rows.filter(o => o.status === 'cancelled').length;

      // Top customers & cakes (moslashtirilgan maydonlarga e'tibor bering)
      const countBy = (arr, key) => {
        const map = {};
        arr.forEach(row => {
          map[row[key]] = (map[row[key]] || 0) + 1;
        });
        return Object.entries(map)
          .map(([k, v]) => ({ [key]: k, count: v }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      };

      stats.top_customers = countBy(rows, "customer");
      stats.top_cakes = countBy(rows, "product");

      res.json(stats);
    }
  );
});

app.post("/bot-orders/send-message", (req, res) => {
  const { chat_id, text } = req.body;
  // Bu yerda Telegram bot orqali xabar jo‘natishni yozishingiz mumkin
  // Hozircha logda chiqadi:
  console.log(`✉️ BOTGA YUBORISH: [${chat_id}] - ${text}`);
  res.json({ ok: true });
});

// ===================== TELEGRAM BOT POLLING VA HANDLER =====================
const TelegramBot = require("node-telegram-bot-api");
const { TOKEN } = require("./config");
const { sendOrderToBackend } = require("./utils/api");

// --- Telegram buyurtmalarini admin-main bazasiga yozadigan handler ---
function orderHandler(bot) {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `
🍰 Assalomu alaykum, Ruxshona Tort botiga xush kelibsiz!
Buyurtma berish uchun quyidagicha yozing:

/tort Tort nomi, Og‘irligi, Telefon raqamingiz

Masalan:
/tort Shohona, 2kg, +998901234567
    `.trim());
  });

  bot.onText(/\/tort (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || "no_username";
    const parts = match[1].split(",");

    if (parts.length < 3) {
      return bot.sendMessage(chatId, "❗️Iltimos, tort nomi, og‘irligi va telefon raqamingizni vergul bilan ajratib yozing.");
    }

    const [cake_name, weight, phone] = parts.map(p => p.trim());

    // Admin-main uchun mos order obyekt
    const order = {
      customer: username,
      product: cake_name,
      quantity: parseFloat(weight),  // "2kg" bo‘lsa, faqat soni
      unit: weight.replace(/[\d\.]/g, ''), // "2kg" -> "kg"
      source: "Telegram",
      price: 0,
      date: new Date().toISOString().split("T")[0],
      note: `Telefon: ${phone}, Telegram: @${username}`
    };

    try {
      // Bunda server o‘zini o‘zi chaqiradi (o‘zi uchun xohlasangiz POSTni to‘g‘ridan to‘g‘ri SQLga yozib yuborishingiz mumkin)
      await sendOrderToBackend(order);
      bot.sendMessage(chatId, "✅ Buyurtmangiz qabul qilindi! Tez orada tasdiqlanadi.");
    } catch (err) {
      bot.sendMessage(chatId, "❌ Buyurtmani yuborishda xatolik yuz berdi.");
    }
  });
}

// --- Telegram bot polling ---
const bot = new TelegramBot(TOKEN, { polling: true });
orderHandler(bot);

console.log("🤖 Telegram bot ishlayapti...");

// ======= SERVER =======
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} da ishlayapti`);
});

// ======= YORDAMCHI: Telegram buyurtmasini SQLga to‘g‘ridan to‘g‘ri yozish ham mumkin =======
/*
Agar o‘zi-chiqar POST qilishni xohlamasangiz, bu funksiya orqali buyurtmani bevosita SQLga yozasiz:

function insertTelegramOrderToDb(order, cb) {
  db.run(
    "INSERT INTO orders (customer, product, quantity, unit, source, price, date, note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      order.customer, order.product, order.quantity, order.unit, order.source,
      order.price, order.date, order.note, 'pending'
    ],
    cb
  );
}
*/


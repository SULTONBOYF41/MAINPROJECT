// handlers/telegramBot.js
const TelegramBot = require("node-telegram-bot-api");
const { TOKEN } = require("../config");
const db = require("../db/database");
const { sendOrderToBackend } = require("../utils/api");

const userStates = {};

function orderHandler(bot) {
  // --- RO‘YXATDAN O‘TISH ---
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    db.get("SELECT * FROM customers WHERE telegram_id = ?", [chatId], (err, customer) => {
      if (customer) {
        bot.sendMessage(chatId, `
🍰 <b>Assalomu alaykum, ${customer.fullname || customer.username}!</b>

🤗 <b>Ruxshona Tort botiga xush kelibsiz!</b>
Siz bu bot orqali yangi, sifatli va mazali tortlarga buyurtma bera olasiz.

<b>Buyurtma berish uchun:</b>
<code>/tort Tort_nomi, og‘irligi</code>
Masalan: <code>/tort Shohona, 2kg</code>

👤 Profilingizni ko‘rish uchun: <code>/profile</code>

Agar savolingiz bo‘lsa, bemalol yozing!
        `.trim(), { parse_mode: "HTML" });
      } else {
        bot.sendMessage(chatId, "Ismingizni kiriting:");
        userStates[chatId] = { step: 1, data: { telegram_id: chatId, username: msg.from.username || "" } };
      }
    });
  });

  // Ro‘yxatdan o‘tish dialogi
  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    if (!userStates[chatId]) return;

    const state = userStates[chatId];
    const text = msg.text?.trim();

    if (state.step === 1) {
      state.data.fullname = text;
      bot.sendMessage(chatId, "📞 Telefon raqamingizni kiriting (masalan: +998901234567):");
      state.step = 2;
    } else if (state.step === 2) {
      if (!/^(\+998|998|[0-9])/.test(text)) {
        bot.sendMessage(chatId, "❗️ Telefon raqami xato. Qaytadan kiriting:");
        return;
      }
      state.data.phone = text;
      bot.sendMessage(chatId, "📍 Manzilingizni kiriting:");
      state.step = 3;
    } else if (state.step === 3) {
      state.data.address = text;
      db.run(
        `INSERT INTO customers (fullname, phone, address, telegram_id, username) VALUES (?, ?, ?, ?, ?)`,
        [state.data.fullname, state.data.phone, state.data.address, state.data.telegram_id, state.data.username],
        (err) => {
          if (err && err.message.includes("UNIQUE")) {
            bot.sendMessage(chatId, "Siz allaqachon ro‘yxatdan o‘tgansiz.");
          } else if (err) {
            bot.sendMessage(chatId, "❗️ Xatolik: " + err.message);
          } else {
            bot.sendMessage(chatId, "✅ Ro‘yxatdan o‘tdingiz! Buyurtma uchun <b>/tort</b> yozishingiz mumkin.", { parse_mode: "HTML" });
          }
          delete userStates[chatId];
        }
      );
    }
  });

  // /profile komandasi
  bot.onText(/\/profile/, (msg) => {
    const chatId = msg.chat.id;
    db.get("SELECT * FROM customers WHERE telegram_id = ?", [chatId], (err, customer) => {
      if (customer) {
        bot.sendMessage(chatId, `
👤 <b>Profil:</b>
<b>Ism:</b> ${customer.fullname}
<b>Telefon:</b> ${customer.phone}
<b>Manzil:</b> ${customer.address || "-"}
<b>Username:</b> @${customer.username || "-"}
        `.trim(), { parse_mode: "HTML" });
      } else {
        bot.sendMessage(chatId, "Siz ro‘yxatdan o‘tmagansiz. /start buyrug‘ini yozing.");
      }
    });
  });

  // --- BUYURTMA BERISH ---
  bot.onText(/\/tort (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    db.get("SELECT * FROM customers WHERE telegram_id = ?", [chatId], async (err, customer) => {
      if (!customer) {
        bot.sendMessage(chatId, "Buyurtma uchun avval ro‘yxatdan o‘ting! /start");
        return;
      }
      const parts = match[1].split(",");
      if (parts.length < 1) return bot.sendMessage(chatId, "Tort nomini yozing.");
      const cake_name = parts[0].trim();
      const weight = parts[1] ? parts[1].trim() : "";

      const order = {
        customer: customer.fullname,
        product: cake_name,
        quantity: weight ? parseFloat(weight) : 1,
        unit: weight ? weight.replace(/[\d\.]/g, '') : '',
        source: "Telegram",
        price: 0,
        date: new Date().toISOString().split("T")[0],
        note: `Telefon: ${customer.phone}, Manzil: ${customer.address}, Telegram: @${customer.username}`
      };
      try {
        await sendOrderToBackend(order);
        bot.sendMessage(chatId, "✅ <b>Buyurtmangiz qabul qilindi!</b>\nTez orada tasdiqlanadi.", { parse_mode: "HTML" });
      } catch (err) {
        bot.sendMessage(chatId, "❌ Buyurtmani yuborishda xatolik yuz berdi.");
      }
    });
  });
}

function startTelegramBot() {
  const bot = new TelegramBot(TOKEN, { polling: true });
  orderHandler(bot);
  console.log("🤖 Telegram bot ishlayapti...");
}

module.exports = { startTelegramBot };

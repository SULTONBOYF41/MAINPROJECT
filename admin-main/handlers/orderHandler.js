const { sendOrderToBackend } = require("../utils/api");

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

    // ADAPTED ORDER OBJECT for admin-main backend
    const order = {
      customer: username,                // Foydalanuvchi telegram username (yoki ism)
      product: cake_name,                // Tort nomi
      quantity: parseFloat(weight),      // Faqat son bo‘lsa, float qilib oladi
      unit: weight.replace(/[\d\.]/g, ''), // kg/dona ajratib oladi ("2kg" -> "kg")
      source: "Telegram",                // Manba sifatida Telegram
      price: 0,                          // Narx so‘ralmasa, 0 qilib yuboriladi
      date: new Date().toISOString().split("T")[0],
      note: `Telefon: ${phone}, Telegram: @${username}`
    };

    try {
      await sendOrderToBackend(order);
      bot.sendMessage(chatId, "✅ Buyurtmangiz qabul qilindi! Tez orada tasdiqlanadi.");
    } catch (err) {
      bot.sendMessage(chatId, "❌ Buyurtmani yuborishda xatolik yuz berdi.");
    }
  });
}

module.exports = { orderHandler };

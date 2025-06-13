const { sendOrderToBackend } = require("../utils/api");

function orderHandler(bot) {
  // /start komandasi
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `
🍰 Assalomu alaykum, Ruxshona Tort botiga xush kelibsiz!
Buyurtma berish uchun quyidagicha yozing:

/tort Tort nomi, Og‘irligi, Telefon raqamingiz

Masalan:
/tort Shohona, 2kg, +998901234567
    `.trim());
  });

  // /tort komandasini ushlash
  bot.onText(/\/tort (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || "no_username";

    const parts = match[1].split(",");
    if (parts.length < 3) {
      return bot.sendMessage(chatId, "❗️Iltimos, tort nomi, og‘irligi va telefon raqamingizni vergul bilan ajratib yozing.");
    }

    const [cake_name, weight, phone] = parts.map(p => p.trim());

    const order = {
      cake_name,
      weight,
      phone,
      username,
      chat_id: chatId
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

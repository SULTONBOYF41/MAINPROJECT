const axios = require("axios");
const { API_URL } = require("../config");

async function sendOrderToBackend(order) {
  try {
    const res = await axios.post(API_URL, order);
    return res.data;
  } catch (err) {
    console.error("❌ Backendga yuborishda xatolik:", err.message);
    throw err;
  }
}

module.exports = { sendOrderToBackend };

const axios = require('axios');

// Sends a Telegram message to the admin. Credentials from env:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Fire-and-forget: never throws — a notification failure must not break the request.
async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return; // not configured — silently skip
  try {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true },
      { timeout: 8000 }
    );
  } catch (err) {
    console.error('Telegram notify failed:', err.response?.data?.description || err.message);
  }
}

module.exports = { sendTelegram };

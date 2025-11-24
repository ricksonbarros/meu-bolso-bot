const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Pegamos o token do bot nas variáveis de ambiente
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_URL = `https://api.telegram.org/bot${TOKEN}`;

// Endpoint principal do Telegram
app.post("/webhook", async (req, res) => {
  const message = req.body.message;

  if (message && message.text) {
    const chatId = message.chat.id;
    const userMessage = message.text;

    // Resposta simples (depois vai virar o assistente financeiro)
    await axios.post(`${TELEGRAM_URL}/sendMessage`, {
      chat_id: chatId,
      text: `Você disse: ${userMessage}`
    });
  }

  return res.sendStatus(200);
});

// Porta usada pelo Render
app.listen(10000, () => {
  console.log("Bot rodando!");
});

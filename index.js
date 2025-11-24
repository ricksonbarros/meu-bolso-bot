const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// Servidor web obrigatório para o Render
const app = express();
app.get("/", (req, res) => res.send("Bot está rodando 🚀"));
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor web iniciado");
});

// Pegando o token das variáveis de ambiente do Render
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ ERRO: BOT_TOKEN não encontrado! Configure no Render → Environment.");
  process.exit(1);
}

// Inicializando o bot
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Olá! Seu assistente financeiro está online.");
});

import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

// === CONFIGURAÇÕES ===
const TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// === CLIENTE SUPABASE ===
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === BOT TELEGRAM ===
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // Salvar mensagem no banco
  await supabase.from("messages").insert({
    user_id: String(chatId),
    message: text,
  });

  bot.sendMessage(chatId, "Mensagem recebida e salva no banco!");
});

// === RENDER ===
app.get("/", (req, res) => res.send("Bot rodando!"));
app.listen(process.env.PORT || 3000);

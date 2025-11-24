import TelegramBot from "node-telegram-bot-api";
import { createClient } from "@supabase/supabase-js";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Conectar ao Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Função para interpretar a mensagem
function parseFinanceMessage(text) {
  text = text.toLowerCase();

  // pegar o valor (ex: 20, 30.50)
  const amountMatch = text.match(/(\d+(\.\d+)?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);

  // identificar se é gasto ou entrada
  let type = "";
  if (text.includes("gastei") || text.includes("paguei")) type = "gasto";
  if (text.includes("recebi") || text.includes("entrou")) type = "entrada";
  if (!type) return null;

  // categoria simples (usar palavras-chave)
  let category = "geral";
  if (text.includes("uber") || text.includes("taxi")) category = "transporte";
  if (text.includes("lanche") || text.includes("comida")) category = "alimentação";
  if (text.includes("aluguel")) category = "moradia";

  return {
    amount,
    type,
    category,
    description: text,
  };
}

// Quando o bot recebe mensagem
bot.on("message", async (msg) =>

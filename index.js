import TelegramBot from "node-telegram-bot-api";
import { createClient } from "@supabase/supabase-js";

// Inicie o bot com polling
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Conectar ao Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Função para interpretar mensagens do usuário
function parseFinanceMessage(text) {
  text = text.toLowerCase();

  const amountMatch = text.match(/(\d+(\.\d+)?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);

  let type = "";
  if (text.includes("gastei") || text.includes("paguei")) type = "gasto";
  if (text.includes("recebi") || text.includes("entrou")) type = "entrada";
  if (!type) return null;

  let category = "geral";
  if (text.includes("uber") || text.includes("taxi")) category = "transporte";
  if (text.includes("lanche") || text.includes("comida")) category = "alimentação";
  if (text.includes("aluguel")) category = "moradia";

  return { amount, type, category, description: text };
}

// Receber mensagens
bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  const parsed = parseFinanceMessage(text);

  if (!parsed) {
    bot.sendMessage(
      chatId,
      "Não entendi 🤖\nExemplo:\n• gastei 20 uber\n• recebi 300 hoje\n• paguei 45 lanche"
    );
    return;
  }

  const { amount, type, category, description } = parsed;

  const { error } = await supabase.from("finances").insert([
    {
      user_id: userId,
      type,
      amount,
      category,
      description,
    },
  ]);

  if (error) {
    bot.sendMessage(chatId, "❌ Erro ao salvar no banco!");
    console.log(error);
    return;
  }

  bot.sendMessage(
    chatId,
    `✔️ Registro salvo!\nTipo: ${type}\nValor: R$ ${amount}\nCategoria: ${category}`
  );
});

console.log("Bot financeiro rodando...");

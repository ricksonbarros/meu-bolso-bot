import TelegramBot from "node-telegram-bot-api";
import { createClient } from "@supabase/supabase-js";

// Inicializa bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Inicializa Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Função para interpretar mensagens simples
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

// Função para calcular saldo
async function getSaldo(userId) {
  const { data, error } = await supabase.from("finances").select("*").eq("user_id", userId);
  if (error) return null;
  let saldo = 0;
  data.forEach(item => {
    if (item.type === "entrada") saldo += parseFloat(item.amount);
    else saldo -= parseFloat(item.amount);
  });
  return saldo;
}

// Função para pegar histórico
async function getHistorico(userId, limit = 10) {
  const { data, error } = await supabase
    .from("finances")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return null;
  return data;
}

// Responder mensagens gerais
bot.on("message", async (msg) => {
  const text = msg.text;
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  if (!text) return;

  // Comandos
  if (text.startsWith("/saldo")) {
    const saldo = await getSaldo(userId);
    bot.sendMessage(chatId, `💰 Seu saldo atual: R$ ${saldo.toFixed(2)}`);
    return;
  }

  if (text.startsWith("/historico")) {
    const historico = await getHistorico(userId);
    if (!historico || historico.length === 0) {
      bot.sendMessage(chatId, "Nenhum lançamento encontrado.");
      return;
    }
    let msgHistorico = "📝 Últimos lançamentos:\n\n";
    historico.forEach(item => {
      msgHistorico += `${item.type.toUpperCase()}: R$ ${item.amount} (${item.category}) - ${item.description}\n`;
    });
    bot.sendMessage(chatId, msgHistorico);
    return;
  }

  if (text.startsWith("/ajuda")) {
    bot.sendMessage(chatId, `
📌 Comandos disponíveis:
/gasto valor descrição - registrar gasto
/entrada valor descrição - registrar entrada
/saldo - ver saldo atual
/historico - últimos lançamentos
/ajuda - mostrar esta mensagem
Exemplo: gastei 20 uber
    `);
    return;
  }

  // Mensagens automáticas tipo "gastei 20 uber" ou "recebi 300"
  const parsed = parseFinanceMessage(text);
  if (!parsed) {
    bot.sendMessage(chatId, "Não entendi 🤖\nExemplo:\n• gastei 20 uber\n• recebi 300 hoje\n• paguei 45 lanche\nOu use /ajuda para comandos.");
    return;
  }

  const { amount, type, category, description } = parsed;
  const { error } = await supabase.from("finances").insert([
    { user_id: userId, type, amount, category, description }
  ]);

  if (error) {
    bot.sendMessage(chatId, "❌ Erro ao salvar no banco!");
    console.log(error);
    return;
  }

  bot.sendMessage(chatId, `✔️ Registro salvo!\nTipo: ${type}\nValor: R$ ${amount}\nCategoria: ${category}`);
});

console.log("Bot financeiro rodando...");

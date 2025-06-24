const { AoiClient } = require('aoi.js');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

async function queryHuggingFace(prompt, persona = "") {
  const finalPrompt = persona ? persona + "\nUsuario: " + prompt : prompt;
  const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: finalPrompt })
  });

  const data = await response.json();
  if (Array.isArray(data)) return data[0]?.generated_text || '🤖 Sin respuesta.';
  return '⚠️ Error al responder.';
}

const bot = new AoiClient({
  token: process.env.TOKEN,
  prefix: ">",
  intents: ["MessageContent", "Guilds", "GuildMessages"]
});

bot.onMessage();

bot.functionManager.createFunction({
  name: "$hugchat",
  type: "djs",
  code: async (d) => {
    const channelId = await d.util.getVar(d, "chatbotChannel", d.guild?.id);
    if (!channelId || d.message.channel.id !== channelId) return { code: "" };

    const message = d.args.join(" ");
    const persona = fs.existsSync("./database/persona.txt") ? fs.readFileSync("./database/persona.txt", "utf8") : "";

    const reply = await queryHuggingFace(message, persona);
    return { code: reply };
  }
});

bot.command({
  name: "$alwaysExecute",
  code: `
$hugchat
`
});
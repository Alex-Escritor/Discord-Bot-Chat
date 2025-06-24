const { AoiClient } = require('aoi.js');
const fs = require('fs');

const bot = new AoiClient({
  token: process.env.TOKEN,
  prefix: ">",
  intents: ["MessageContent", "Guilds", "GuildMessages"]
});

bot.variables({
  chatbotChannel: ""
});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.command(command);
}

require('./huggingResponder.js');
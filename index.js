require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

// شبكة أمان عامة: أي خطأ غير متوقع بأي مكان بالبوت يُسجَّل فقط
// ولا يوقف العملية بالكامل. هذا يمنع انهيار البوت المفاجئ الذي
// يحتاج إعادة تشغيل يدوية بعد كل خطأ صغير.
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ خطأ غير معالج (unhandledRejection):', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ خطأ غير متوقع (uncaughtException):', err);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(process.env.DISCORD_TOKEN);

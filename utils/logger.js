const { EmbedBuilder } = require('discord.js');
const { readDb } = require('./db');

async function sendLog(client, title, description, fields = []) {
  const db = readDb();
  const channelId = db.settings.logChannelId;
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setColor(0xA855F7)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
  if (fields.length) embed.addFields(fields);
  channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { sendLog };

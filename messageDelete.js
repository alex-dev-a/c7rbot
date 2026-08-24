const { EmbedBuilder } = require('discord.js');
const { readDb } = require('../utils/db');

module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (message.partial || !message.author || message.author.bot) return;
    const db = readDb();
    const channelId = db.settings.messageLogChannelId;
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setColor(0xFF3D6E)
      .setTitle('🗑️ رسالة محذوفة')
      .addFields(
        { name: 'العضو', value: `<@${message.author.id}>` },
        { name: 'القناة', value: `<#${message.channel.id}>` },
        { name: 'المحتوى', value: message.content?.slice(0, 1000) || '—' }
      )
      .setTimestamp();
    channel.send({ embeds: [embed] }).catch(() => {});
  }
};

const { EmbedBuilder } = require('discord.js');
const { readDb } = require('../utils/db');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (oldMessage.partial || !oldMessage.author || oldMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;
    const db = readDb();
    const channelId = db.settings.messageLogChannelId;
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setColor(0xFACC15)
      .setTitle('✏️ رسالة معدّلة')
      .addFields(
        { name: 'العضو', value: `<@${oldMessage.author.id}>` },
        { name: 'القناة', value: `<#${oldMessage.channel.id}>` },
        { name: 'قبل', value: oldMessage.content?.slice(0, 500) || '—' },
        { name: 'بعد', value: newMessage.content?.slice(0, 500) || '—' }
      )
      .setTimestamp();
    channel.send({ embeds: [embed] }).catch(() => {});
  }
};

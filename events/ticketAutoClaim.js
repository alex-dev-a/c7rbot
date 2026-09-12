const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { readDb } = require('../utils/db');

module.exports = {
  name: 'channelCreate',
  async execute(channel) {
    if (channel.type !== ChannelType.GuildText) return;
    const db = readDb();
    const categoryId = db.settings.ticketCategoryId;
    if (!categoryId) return;
    if (channel.parentId !== categoryId) return;

    setTimeout(async () => {
      const embed = new EmbedBuilder()
        .setColor(0xA855F7)
        .setTitle('إستلام التذكرة')
        .setDescription('اضغط الزر أدناه لاستلام هذه التذكرة. يمكن لعضو واحد فقط استلامها.');
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_autoclaim').setLabel('استلام').setStyle(ButtonStyle.Primary).setEmoji('📥')
      );
      await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
    }, 1500);
  }
};

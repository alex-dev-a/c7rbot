const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDb } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('قائمة-الإدارة')
    .setDescription('عرض قائمة كاملة بكل أعضاء الإدارة وتفاصيل نقاطهم'),
  async execute(interaction) {
    const db = readDb();
    const entries = Object.entries(db.staff);
    if (!entries.length) {
      return interaction.reply('لا توجد بيانات مسجّلة بعد.');
    }
    const sorted = entries.sort((a, b) => b[1].points - a[1].points);

    const chunks = [];
    for (let i = 0; i < sorted.length; i += 20) {
      chunks.push(sorted.slice(i, i + 20));
    }

    for (let i = 0; i < chunks.length; i++) {
      const desc = chunks[i].map(([id, s]) => {
        const vHrs = Math.floor(s.voiceSeconds / 3600);
        const vMins = Math.floor((s.voiceSeconds % 3600) / 60);
        return `**<@${id}>** — ${s.points} نقطة\n` +
          `┗ تذاكر: ${s.ticketsHandled} · رسائل: ${s.textMessages} · صوت: ${vHrs}س${vMins}د · تقارير: ${s.reports}`;
      }).join('\n\n');

      const embed = new EmbedBuilder()
        .setColor(0xA855F7)
        .setTitle(`📋 قائمة الإدارة الكاملة${chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : ''}`)
        .setDescription(desc);

      if (i === 0) {
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.followUp({ embeds: [embed] });
      }
    }
  }
};

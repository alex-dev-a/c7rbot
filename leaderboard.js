const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDb } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('المتصدرين')
    .setDescription('عرض أفضل 10 أعضاء إدارة حسب النقاط'),
  async execute(interaction) {
    const db = readDb();
    const sorted = Object.entries(db.staff).sort((a, b) => b[1].points - a[1].points).slice(0, 10);
    if (!sorted.length) return interaction.reply('لا توجد بيانات بعد.');
    const desc = sorted.map(([id, s], i) => `**${i + 1}.** <@${id}> — ${s.points} نقطة`).join('\n');
    const embed = new EmbedBuilder().setColor(0xA855F7).setTitle('🏆 قائمة المتصدرين').setDescription(desc);
    await interaction.reply({ embeds: [embed] });
  }
};

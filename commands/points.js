const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDb, getStaff } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('نقاطي')
    .setDescription('عرض نقاطك أو نقاط عضو آخر')
    .addUserOption(opt => opt.setName('عضو').setDescription('العضو')),
  async execute(interaction) {
    const target = interaction.options.getUser('عضو') || interaction.user;
    const db = readDb();
    const staff = getStaff(db, target.id);
    const hrs = Math.floor(staff.dutySeconds / 3600);
    const mins = Math.floor((staff.dutySeconds % 3600) / 60);
    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle(`📊 إحصائيات ${target.username}`)
      .addFields(
        { name: 'النقاط', value: `${staff.points}`, inline: true },
        { name: 'التذاكر المنجزة', value: `${staff.ticketsHandled}`, inline: true },
        { name: 'التقارير المرسلة', value: `${staff.reports}`, inline: true },
        { name: 'وقت المناوبة الكلي', value: `${hrs}س ${mins}د` }
      );
    await interaction.reply({ embeds: [embed] });
  }
};

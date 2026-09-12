const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('لوحة-الحضور')
    .setDescription('نشر لوحة تسجيل الدخول والخروج')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle('🕒 تسجيل الحضور')
      .setDescription('اضغط "تسجيل دخول" عند بدء نشاطك الإداري، و"تسجيل خروج" عند الانتهاء. تُحتسب نقطة ثابتة لكل عملية بغض النظر عن المدة.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('checkin').setLabel('تسجيل دخول').setStyle(ButtonStyle.Success).setEmoji('🟢'),
      new ButtonBuilder().setCustomId('checkout').setLabel('تسجيل خروج').setStyle(ButtonStyle.Danger).setEmoji('🔴')
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

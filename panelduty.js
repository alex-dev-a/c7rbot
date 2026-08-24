const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('لوحة-المناوبة')
    .setDescription('نشر لوحة تسجيل المناوبة (دخول/خروج)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle('🕒 لوحة تسجيل المناوبة')
      .setDescription('اضغط "بدء المناوبة" عند دخولك للعمل، و"إنهاء المناوبة" عند الانتهاء. تُحتسب نقاطك تلقائياً حسب مدة تواجدك.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('duty_checkin').setLabel('بدء المناوبة').setStyle(ButtonStyle.Success).setEmoji('🟢'),
      new ButtonBuilder().setCustomId('duty_checkout').setLabel('إنهاء المناوبة').setStyle(ButtonStyle.Danger).setEmoji('🔴')
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

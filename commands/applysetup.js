const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('لوحة-التقديم')
    .setDescription('نشر لوحة التقديم على فريق الإدارة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle('📋 التقديم على فريق إدارة C7R')
      .setDescription('اضغط الزر أدناه لتعبئة استمارة التقديم على فريق الإدارة.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('apply_open').setLabel('تقديم الآن').setStyle(ButtonStyle.Primary).setEmoji('📝')
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

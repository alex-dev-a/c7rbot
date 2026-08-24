const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('لوحة-المهام')
    .setDescription('نشر لوحة استلام وإنهاء المهام داخل هذه القناة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle('🎫 استلام وإنهاء المهمة')
      .setDescription('اضغط "استلام" عند بدء العمل على هذه المهمة، و"إنهاء" عند الانتهاء منها لاحتساب نقاطك.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_claim').setLabel('استلام').setStyle(ButtonStyle.Primary).setEmoji('📥'),
      new ButtonBuilder().setCustomId('ticket_complete').setLabel('إنهاء').setStyle(ButtonStyle.Success).setEmoji('🏁')
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

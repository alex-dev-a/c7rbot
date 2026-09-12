const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readDb } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('لوحة-التقديم')
    .setDescription('نشر لوحة تقديم لنوع معيّن (أنشئ الأنواع أولاً عبر /config addapptype)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName('نوع').setDescription('معرّف نوع التقديم (شوفه عبر /config listapptypes)').setRequired(true)),
  async execute(interaction) {
    const key = interaction.options.getString('نوع').trim().toLowerCase();
    const db = readDb();
    const type = db.settings.applicationTypes[key];
    if (!type) {
      const available = Object.keys(db.settings.applicationTypes);
      return interaction.reply({
        content: available.length
          ? `⚠️ ما فيه نوع تقديم بهذا المعرّف. الأنواع المتاحة: ${available.map(k => `\`${k}\``).join(', ')}`
          : '⚠️ ما فيه أي نوع تقديم مُعدّ بعد. أضف واحد أولاً عبر `/config addapptype`.',
        ephemeral: true
      });
    }
    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle(`📋 التقديم على ${type.name}`)
      .setDescription('اضغط الزر أدناه لتعبئة استمارة التقديم.\n\n*Click the button below to fill out the application form.*');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`apply_open_${key}`).setLabel('تقديم الآن').setStyle(ButtonStyle.Primary).setEmoji('📝')
    );
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

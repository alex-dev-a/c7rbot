const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const VALID_COLORS = {
  بنفسجي: 0xA855F7,
  أحمر: 0xED4245,
  أخضر: 0x57F287,
  أزرق: 0x3B82F6,
  أصفر: 0xFACC15,
  أسود: 0x000000
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('رسالة-جماعية')
    .setDescription('إرسال رسالة خاصة لكل حاملي رتبة معينة')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(opt => opt.setName('رتبة').setDescription('الرتبة المستهدفة').setRequired(true))
    .addStringOption(opt => opt.setName('رسالة').setDescription('نص الرسالة').setRequired(true))
    .addStringOption(opt => opt.setName('لون').setDescription('لون الإمبد')
      .addChoices(
        { name: 'بنفسجي', value: 'بنفسجي' },
        { name: 'أحمر', value: 'أحمر' },
        { name: 'أخضر', value: 'أخضر' },
        { name: 'أزرق', value: 'أزرق' },
        { name: 'أصفر', value: 'أصفر' },
        { name: 'أسود', value: 'أسود' }
      ))
    .addStringOption(opt => opt.setName('تذييل').setDescription('نص إضافي أسفل الرسالة (اختياري)')),
  async execute(interaction) {
    const role = interaction.options.getRole('رتبة');
    const text = interaction.options.getString('رسالة');
    const colorName = interaction.options.getString('لون');
    const footer = interaction.options.getString('تذييل');

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    await guild.members.fetch();
    const members = guild.members.cache.filter(m => m.roles.cache.has(role.id) && !m.user.bot);

    if (!members.size) {
      return interaction.editReply('⚠️ ما فيه أي عضو يحمل هذه الرتبة حالياً.');
    }

    const embed = new EmbedBuilder()
      .setColor(VALID_COLORS[colorName] || VALID_COLORS['بنفسجي'])
      .setTitle('C7R E-SPORTS')
      .setDescription(text)
      .setTimestamp();
    if (footer) embed.setFooter({ text: footer });

    let success = 0, failed = 0;
    for (const member of members.values()) {
      try {
        await member.send({ embeds: [embed] });
        success++;
      } catch (err) {
        failed++;
      }
    }

    await interaction.editReply(`✅ تم الإرسال بنجاح لـ ${success} عضو.${failed ? ` ⚠️ فشل الإرسال لـ ${failed} عضو (خاص مغلق).` : ''}`);
  }
};

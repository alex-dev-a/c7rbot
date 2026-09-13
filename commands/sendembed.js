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
    .setName('ارسال-امبد')
    .setDescription('إرسال إمبد مخصص لأي قناة تختارها')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt => opt.setName('قناة').setDescription('القناة المستهدفة').setRequired(true))
    .addStringOption(opt => opt.setName('وصف').setDescription('نص الإمبد').setRequired(true))
    .addStringOption(opt => opt.setName('عنوان').setDescription('عنوان الإمبد (اختياري)'))
    .addStringOption(opt => opt.setName('لون').setDescription('لون الإمبد')
      .addChoices(
        { name: 'بنفسجي', value: 'بنفسجي' },
        { name: 'أحمر', value: 'أحمر' },
        { name: 'أخضر', value: 'أخضر' },
        { name: 'أزرق', value: 'أزرق' },
        { name: 'أصفر', value: 'أصفر' },
        { name: 'أسود', value: 'أسود' }
      ))
    .addStringOption(opt => opt.setName('صورة').setDescription('رابط صورة تظهر أسفل الإمبد (اختياري)'))
    .addStringOption(opt => opt.setName('تذييل').setDescription('نص أسفل الإمبد (اختياري)')),
  async execute(interaction) {
    const channel = interaction.options.getChannel('قناة');
    const description = interaction.options.getString('وصف');
    const title = interaction.options.getString('عنوان');
    const colorName = interaction.options.getString('لون');
    const image = interaction.options.getString('صورة');
    const footer = interaction.options.getString('تذييل');

    const embed = new EmbedBuilder()
      .setColor(VALID_COLORS[colorName] || VALID_COLORS['بنفسجي'])
      .setDescription(description)
      .setTimestamp();
    if (title) embed.setTitle(title);
    if (image) embed.setImage(image);
    if (footer) embed.setFooter({ text: footer });

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ تم إرسال الإمبد إلى <#${channel.id}>.`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: '⚠️ تعذّر إرسال الإمبد لهذه القناة — تأكد أن للبوت صلاحية الإرسال فيها.', ephemeral: true });
    }
  }
};

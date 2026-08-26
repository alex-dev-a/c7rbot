const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ارسال-خاص')
    .setDescription('إرسال رسالة خاصة لعضو عبر البوت')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt => opt.setName('عضو').setDescription('العضو المستقبل').setRequired(true))
    .addStringOption(opt => opt.setName('رسالة').setDescription('نص الرسالة').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('عضو');
    const text = interaction.options.getString('رسالة');

    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle('📩 رسالة من إدارة C7R')
      .setDescription(text)
      .setFooter({ text: `أُرسلت بواسطة ${interaction.user.username}` })
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ تم إرسال الرسالة إلى <@${user.id}>.`, ephemeral: true });
    } catch (err) {
      await interaction.reply({ content: `⚠️ تعذّر إرسال الرسالة — يبدو أن العضو مغلق الخاص عن أعضاء السيرفر.`, ephemeral: true });
    }
  }
};

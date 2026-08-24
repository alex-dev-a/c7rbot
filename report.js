const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('تقرير')
    .setDescription('إرسال تقرير إداري'),
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId('report_modal').setTitle('تقرير إداري');
    const subject = new TextInputBuilder().setCustomId('report_subject').setLabel('عنوان التقرير').setStyle(TextInputStyle.Short).setRequired(true);
    const details = new TextInputBuilder().setCustomId('report_details').setLabel('تفاصيل التقرير').setStyle(TextInputStyle.Paragraph).setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(subject),
      new ActionRowBuilder().addComponents(details)
    );
    await interaction.showModal(modal);
  }
};

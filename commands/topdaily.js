const { SlashCommandBuilder } = require('discord.js');
const { replyPeriodTop } = require('../utils/periodTop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('توب-اليوم')
    .setDescription('متصدرو النقاط والتواجد الصوتي خلال آخر 24 ساعة'),
  async execute(interaction) {
    await replyPeriodTop(interaction, 'day');
  }
};

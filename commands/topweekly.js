const { SlashCommandBuilder } = require('discord.js');
const { replyPeriodTop } = require('../utils/periodTop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('توب-الاسبوع')
    .setDescription('متصدرو النقاط والتواجد الصوتي خلال آخر 7 أيام'),
  async execute(interaction) {
    await replyPeriodTop(interaction, 'week');
  }
};

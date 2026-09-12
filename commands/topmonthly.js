const { SlashCommandBuilder } = require('discord.js');
const { replyPeriodTop } = require('../utils/periodTop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('توب-الشهر')
    .setDescription('متصدرو النقاط والتواجد الصوتي خلال آخر 30 يوم'),
  async execute(interaction) {
    await replyPeriodTop(interaction, 'month');
  }
};

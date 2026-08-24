const { SlashCommandBuilder } = require('discord.js');
const { readDb, writeDb, getStaff } = require('../utils/db');
const { sendLog } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('استلام-تذكرة')
    .setDescription('تسجيل استلامك لتذكرة (يُستخدم مع بوتات التذاكر الخارجية)'),
  async execute(interaction, client) {
    const db = readDb();
    const staff = getStaff(db, interaction.user.id);
    staff.points += db.settings.ticketClaimPoints;
    staff.ticketsHandled += 1;
    writeDb(db);
    await interaction.reply(`✅ تم تسجيل استلامك للتذكرة (+${db.settings.ticketClaimPoints} نقطة).`);
    sendLog(client, '📥 استلام تذكرة (يدوي)', `<@${interaction.user.id}> سجل استلام تذكرة في <#${interaction.channel.id}>.`);
  }
};

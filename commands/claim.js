const { SlashCommandBuilder } = require('discord.js');
const { readDb, writeDb, getStaff, logPointEvent } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('استلام-تذكرة')
    .setDescription('تسجيل استلامك لتذكرة (يُستخدم مع بوتات التذاكر الخارجية)'),
  async execute(interaction) {
    const db = readDb();
    const staff = getStaff(db, interaction.user.id);
    staff.points += db.settings.ticketClaimPoints;
    staff.ticketsHandled += 1;
    logPointEvent(db, { type: 'ticket', userId: interaction.user.id, amount: db.settings.ticketClaimPoints, channelId: interaction.channel.id });
    writeDb(db);
    await interaction.reply(`✅ تم تسجيل استلامك للتذكرة (+${db.settings.ticketClaimPoints} نقطة).`);
  }
};

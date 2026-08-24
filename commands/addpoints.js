const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readDb, writeDb, getStaff } = require('../utils/db');
const { sendLog } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('إضافة-نقاط')
    .setDescription('إضافة نقاط يدوياً لعضو إدارة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt => opt.setName('عضو').setDescription('العضو').setRequired(true))
    .addIntegerOption(opt => opt.setName('عدد').setDescription('عدد النقاط').setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('عضو');
    const amount = interaction.options.getInteger('عدد');
    const db = readDb();
    const staff = getStaff(db, user.id);
    staff.points += amount;
    writeDb(db);
    await interaction.reply(`✅ تم إضافة ${amount} نقطة لـ <@${user.id}>. الرصيد الحالي: ${staff.points}.`);
    sendLog(client, '➕ إضافة نقاط', `<@${interaction.user.id}> أضاف ${amount} نقطة لـ <@${user.id}>.`);
  }
};

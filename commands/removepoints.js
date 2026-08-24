const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readDb, writeDb, getStaff } = require('../utils/db');
const { sendLog } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('خصم-نقاط')
    .setDescription('خصم نقاط يدوياً من عضو إدارة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt => opt.setName('عضو').setDescription('العضو').setRequired(true))
    .addIntegerOption(opt => opt.setName('عدد').setDescription('عدد النقاط').setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('عضو');
    const amount = interaction.options.getInteger('عدد');
    const db = readDb();
    const staff = getStaff(db, user.id);
    staff.points = Math.max(0, staff.points - amount);
    writeDb(db);
    await interaction.reply(`✅ تم خصم ${amount} نقطة من <@${user.id}>. الرصيد الحالي: ${staff.points}.`);
    sendLog(client, '➖ خصم نقاط', `<@${interaction.user.id}> خصم ${amount} نقطة من <@${user.id}>.`);
  }
};

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readDb, writeDb, getStaff, logPointEvent } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('خصم-نقاط')
    .setDescription('خصم نقاط يدوياً من عضو إدارة')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt => opt.setName('عضو').setDescription('العضو').setRequired(true))
    .addIntegerOption(opt => opt.setName('عدد').setDescription('عدد النقاط').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('عضو');
    const amount = interaction.options.getInteger('عدد');
    const db = readDb();
    const staff = getStaff(db, user.id);
    staff.points = Math.max(0, staff.points - amount);
    logPointEvent(db, { type: 'manual', userId: user.id, amount: -amount, by: interaction.user.id });
    writeDb(db);
    await interaction.reply(`✅ تم خصم ${amount} نقطة من <@${user.id}>. الرصيد الحالي: ${staff.points}.`);
  }
};

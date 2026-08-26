const { readDb, writeDb, getStaff } = require('../utils/db');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const db = readDb();
    const staffRoleId = db.settings.staffRoleId;
    if (!staffRoleId) return;

    const member = message.member;
    if (!member || !member.roles.cache.has(staffRoleId)) return;

    const userId = message.author.id;
    const now = Date.now();
    const cooldownMs = (db.settings.textCooldownSeconds || 60) * 1000;
    const last = db.lastTextPoint[userId] || 0;

    if (now - last < cooldownMs) return;

    db.lastTextPoint[userId] = now;
    const staff = getStaff(db, userId);
    staff.points += db.settings.textPointsPerMessage || 1;
    staff.textMessages += 1;
    writeDb(db);
  }
};

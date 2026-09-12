const { readDb, writeDb, getStaff, logPointEvent, logVoiceSession } = require('../utils/db');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const db = readDb();
    const staffRoleId = db.settings.staffRoleId;
    if (!staffRoleId) return;

    const member = newState.member || oldState.member;
    if (!member || member.user.bot) return;
    if (!member.roles.cache.has(staffRoleId)) return;

    const userId = member.id;
    const wasInVoice = !!oldState.channelId;
    const isInVoice = !!newState.channelId;

    if (!wasInVoice && isInVoice) {
      db.voiceSessions[userId] = Date.now();
      writeDb(db);
      return;
    }

    if (wasInVoice && !isInVoice) {
      const start = db.voiceSessions[userId];
      if (start) {
        const seconds = Math.floor((Date.now() - start) / 1000);
        delete db.voiceSessions[userId];
        const staff = getStaff(db, userId);
        staff.voiceSeconds += seconds;
        logVoiceSession(db, userId, seconds);
        const intervalSeconds = (db.settings.voiceIntervalMinutes || 10) * 60;
        const pointsEarned = Math.floor(seconds / intervalSeconds) * (db.settings.voicePointsPerInterval || 1);
        if (pointsEarned > 0) {
          staff.points += pointsEarned;
          logPointEvent(db, { type: 'voice', userId, amount: pointsEarned });
        }
        writeDb(db);
      }
      return;
    }
  }
};

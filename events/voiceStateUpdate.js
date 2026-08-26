const { readDb, writeDb, getStaff } = require('../utils/db');
const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
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
        const intervalSeconds = (db.settings.voiceIntervalMinutes || 10) * 60;
        const pointsEarned = Math.floor(seconds / intervalSeconds) * (db.settings.voicePointsPerInterval || 1);
        staff.points += pointsEarned;
        writeDb(db);
        if (pointsEarned > 0) {
          const mins = Math.floor(seconds / 60);
          sendLog(client, '🔊 نشاط صوتي', `<@${userId}> قضى ${mins} دقيقة بالروم الصوتي وحصل على ${pointsEarned} نقطة.`);
        }
      }
      return;
    }
  }
};

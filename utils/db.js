const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      staff: {},
      settings: {
        logChannelId: null,
        messageLogChannelId: null,
        reviewChannelId: null,
        staffRoleId: null,
        ticketBotIds: [],
        ticketClaimPoints: 5,
        dutyPointsPerHour: 2,
        textPointsPerMessage: 1,
        textCooldownSeconds: 60,
        voicePointsPerInterval: 1,
        voiceIntervalMinutes: 10
      },
      claimedMessages: [],
      activeSessions: {},
      activeTickets: {},
      voiceSessions: {},
      lastTextPoint: {},
      applications: {}
    }, null, 2));
  }
}

function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  if (!db.settings.textPointsPerMessage) db.settings.textPointsPerMessage = 1;
  if (!db.settings.textCooldownSeconds) db.settings.textCooldownSeconds = 60;
  if (!db.settings.voicePointsPerInterval) db.settings.voicePointsPerInterval = 1;
  if (!db.settings.voiceIntervalMinutes) db.settings.voiceIntervalMinutes = 10;
  if (!db.voiceSessions) db.voiceSessions = {};
  if (!db.lastTextPoint) db.lastTextPoint = {};
  if (!db.applications) db.applications = {};
  return db;
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getStaff(db, userId) {
  if (!db.staff[userId]) {
    db.staff[userId] = {
      points: 0,
      ticketsHandled: 0,
      dutySeconds: 0,
      reports: 0,
      voiceSeconds: 0,
      textMessages: 0
    };
  }
  if (db.staff[userId].voiceSeconds === undefined) db.staff[userId].voiceSeconds = 0;
  if (db.staff[userId].textMessages === undefined) db.staff[userId].textMessages = 0;
  return db.staff[userId];
}

module.exports = { readDb, writeDb, getStaff, DB_PATH };

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const EVENT_RETENTION_DAYS = 65;

function defaultData() {
  return {
    staff: {},
    settings: {
      staffRoleId: null,
      ticketBotIds: [],
      ticketClaimPoints: 5,
      checkinPoints: 1,
      checkoutPoints: 1,
      textPointsPerMessage: 1,
      textCooldownSeconds: 60,
      voicePointsPerInterval: 1,
      voiceIntervalMinutes: 10,
      reportsChannelId: null,
      dailyReportChannelId: null,
      dailyReportHourUTC: 6,
      ticketCategoryId: null,
      applicationTypes: {}
    },
    claimedMessages: [],
    activeTickets: {},
    ticketClaims: {},
    voiceSessions: {},
    lastTextPoint: {},
    applications: {},
    checkedIn: {},
    pointEvents: [],
    voiceLog: [],
    lastDailyReportDate: null
  };
}

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData(), null, 2));
  }
}

function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const def = defaultData();
  db.settings = { ...def.settings, ...db.settings };
  for (const key of Object.keys(def)) {
    if (key === 'settings') continue;
    if (db[key] === undefined) db[key] = def[key];
  }
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
      reports: 0,
      voiceSeconds: 0,
      textMessages: 0
    };
  }
  const s = db.staff[userId];
  if (s.voiceSeconds === undefined) s.voiceSeconds = 0;
  if (s.textMessages === undefined) s.textMessages = 0;
  if (s.ticketsHandled === undefined) s.ticketsHandled = 0;
  if (s.reports === undefined) s.reports = 0;
  return s;
}

function logPointEvent(db, { type, userId, amount, by, channelId }) {
  db.pointEvents.push({ type, userId, amount, by: by || null, channelId: channelId || null, ts: Date.now() });
}

function logVoiceSession(db, userId, seconds) {
  db.voiceLog.push({ userId, seconds, ts: Date.now() });
}

function pruneOldEvents(db) {
  const cutoff = Date.now() - EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  db.pointEvents = db.pointEvents.filter(e => e.ts >= cutoff);
  db.voiceLog = db.voiceLog.filter(e => e.ts >= cutoff);
}

module.exports = {
  readDb, writeDb, getStaff, logPointEvent, logVoiceSession, pruneOldEvents, DB_PATH
};

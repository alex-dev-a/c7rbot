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
        dutyPointsPerHour: 2
      },
      claimedMessages: [],
      activeSessions: {},
      activeTickets: {}
    }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getStaff(db, userId) {
  if (!db.staff[userId]) {
    db.staff[userId] = { points: 0, ticketsHandled: 0, dutySeconds: 0, reports: 0 };
  }
  return db.staff[userId];
}

module.exports = { readDb, writeDb, getStaff, DB_PATH };

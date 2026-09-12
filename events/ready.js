const { ActivityType, EmbedBuilder } = require('discord.js');
const { readDb, writeDb, pruneOldEvents } = require('../utils/db');

function todayKeyUTC() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

async function sendDailyReport(client) {
  const db = readDb();
  const channelId = db.settings.dailyReportChannelId;
  if (!channelId) return;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const events = db.pointEvents.filter(e => e.ts >= cutoff);

  const ticketEvents = events.filter(e => e.type === 'ticket');
  const textEvents = events.filter(e => e.type === 'text');
  const voiceEvents = events.filter(e => e.type === 'voice');
  const manualEvents = events.filter(e => e.type === 'manual');

  function summarize(evList, withGranter) {
    if (!evList.length) return 'لا يوجد نشاط.';
    const byUser = {};
    for (const e of evList) {
      if (!byUser[e.userId]) byUser[e.userId] = { total: 0, count: 0, by: new Set() };
      byUser[e.userId].total += e.amount;
      byUser[e.userId].count += 1;
      if (e.by) byUser[e.userId].by.add(e.by);
    }
    return Object.entries(byUser).map(([id, v]) => {
      let line = `<@${id}>: ${v.total} نقطة (${v.count} مرة)`;
      if (withGranter && v.by.size) {
        line += ` — بواسطة ${[...v.by].map(b => `<@${b}>`).join('، ')}`;
      }
      return line;
    }).join('\n');
  }

  const totalPoints = events.reduce((sum, e) => sum + e.amount, 0);
  const totalByUser = {};
  for (const e of events) totalByUser[e.userId] = (totalByUser[e.userId] || 0) + e.amount;
  const totalDesc = Object.entries(totalByUser).length
    ? Object.entries(totalByUser).map(([id, amt]) => `<@${id}>: ${amt} نقطة`).join('\n')
    : 'لا يوجد نشاط.';

  const embed = new EmbedBuilder()
    .setColor(0xA855F7)
    .setTitle('📊 التقرير الصباحي اليومي — C7R')
    .setDescription(`ملخص نشاط الإدارة خلال آخر 24 ساعة (${new Date().toISOString().slice(0, 10)})`)
    .addFields(
      { name: `🎫 التذاكر المستلمة (${ticketEvents.length})`, value: summarize(ticketEvents, false) },
      { name: `✍️ نقاط الكتابة (${textEvents.length})`, value: summarize(textEvents, false) },
      { name: `🔊 نقاط التواجد الصوتي (${voiceEvents.length})`, value: summarize(voiceEvents, false) },
      { name: `➕ نقاط الإضافة اليدوية (${manualEvents.length})`, value: summarize(manualEvents, true) },
      { name: `📈 إجمالي النقاط الموزّعة اليوم (${totalPoints})`, value: totalDesc }
    )
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(() => {});
}

function scheduleDailyReport(client) {
  setInterval(async () => {
    const db = readDb();
    const now = new Date();
    const targetHour = db.settings.dailyReportHourUTC ?? 6;
    const key = todayKeyUTC();
    if (now.getUTCHours() === targetHour && db.lastDailyReportDate !== key) {
      db.lastDailyReportDate = key;
      pruneOldEvents(db);
      writeDb(db);
      await sendDailyReport(client);
    }
  }, 60 * 1000);
}

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ C7R BOT جاهز — تسجيل الدخول باسم ${client.user.tag}`);
    client.user.setActivity('C7R | إدارة الأداء', { type: ActivityType.Watching });
    scheduleDailyReport(client);
  }
};

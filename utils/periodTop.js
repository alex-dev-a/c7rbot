const { EmbedBuilder } = require('discord.js');
const { readDb } = require('./db');

const DAY_MS = 24 * 60 * 60 * 1000;

function cutoffFor(period) {
  if (period === 'day') return Date.now() - DAY_MS;
  if (period === 'week') return Date.now() - 7 * DAY_MS;
  if (period === 'month') return Date.now() - 30 * DAY_MS;
  return 0;
}

function periodLabel(period) {
  if (period === 'day') return 'اليوم';
  if (period === 'week') return 'الأسبوع';
  return 'الشهر';
}

async function replyPeriodTop(interaction, period) {
  const db = readDb();
  const cutoff = cutoffFor(period);

  const pointsByUser = {};
  for (const ev of db.pointEvents) {
    if (ev.ts < cutoff) continue;
    pointsByUser[ev.userId] = (pointsByUser[ev.userId] || 0) + ev.amount;
  }

  const voiceByUser = {};
  for (const ev of db.voiceLog) {
    if (ev.ts < cutoff) continue;
    voiceByUser[ev.userId] = (voiceByUser[ev.userId] || 0) + ev.seconds;
  }

  const pointsSorted = Object.entries(pointsByUser).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const voiceSorted = Object.entries(voiceByUser).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const pointsDesc = pointsSorted.length
    ? pointsSorted.map(([id, pts], i) => `**${i + 1}.** <@${id}> — ${pts} نقطة`).join('\n')
    : 'لا توجد بيانات لهذه الفترة.';

  const voiceDesc = voiceSorted.length
    ? voiceSorted.map(([id, secs], i) => {
        const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
        return `**${i + 1}.** <@${id}> — ${h}س ${m}د`;
      }).join('\n')
    : 'لا توجد بيانات لهذه الفترة.';

  const embed = new EmbedBuilder()
    .setColor(0xA855F7)
    .setTitle(`🏆 متصدرو ${periodLabel(period)}`)
    .addFields(
      { name: '📈 النقاط', value: pointsDesc },
      { name: '🔊 التواجد الصوتي', value: voiceDesc }
    );

  await interaction.reply({ embeds: [embed] });
}

module.exports = { replyPeriodTop };

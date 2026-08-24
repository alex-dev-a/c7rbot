const { EmbedBuilder } = require('discord.js');
const { readDb } = require('../utils/db');

// يراقب كل الإجراءات الإدارية (حظر، طرد، كتم، تعديل رتب...) عبر سجل التدقيق الرسمي لديسكورد
// ويرسلها لقناة السجلات — لا يعتمد على تخمين صياغة أي بوت.
module.exports = {
  name: 'guildAuditLogEntryCreate',
  async execute(entry, guild, client) {
    const db = readDb();
    const channelId = db.settings.logChannelId;
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setColor(0x7C3AED)
      .setTitle('🛡️ إجراء إداري مسجّل')
      .addFields(
        { name: 'الإجراء', value: String(entry.action) },
        { name: 'المنفذ', value: entry.executor ? `<@${entry.executor.id}>` : 'غير معروف' },
        { name: 'الهدف', value: entry.target ? `${entry.target.id ?? entry.target}` : '—' },
        { name: 'السبب', value: entry.reason || '—' }
      )
      .setTimestamp();
    channel.send({ embeds: [embed] }).catch(() => {});
  }
};

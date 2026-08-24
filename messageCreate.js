const { readDb, writeDb, getStaff } = require('../utils/db');
const { sendLog } = require('../utils/logger');

// يراقب رسائل بوتات التذاكر الخارجية المحددة عبر /config addticketbot
// ويحاول رصد كلمة "استلام" أو "claimed" مع منشن لعضو ليحتسب له النقاط تلقائياً.
// هذه الطريقة تعتمد على صياغة رسائل البوت الآخر، فقد لا تعمل مع كل البوتات —
// لذلك أمر /استلام-تذكرة اليدوي هو الطريقة الأكيدة دائماً.
module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.author.bot) return;

    const db = readDb();
    if (!db.settings.ticketBotIds.includes(message.author.id)) return;

    const embedText = message.embeds
      .map(e => `${e.title || ''} ${e.description || ''} ${(e.fields || []).map(f => f.value).join(' ')}`)
      .join(' ');
    const content = `${message.content} ${embedText}`;

    const claimRegex = /claim(?:ed)?\s*(?:by)?|استلم|تم الاستلام/i;
    if (!claimRegex.test(content)) return;

    const mention = message.mentions.users.first();
    if (!mention) return;

    if (db.claimedMessages.includes(message.id)) return;
    db.claimedMessages.push(message.id);
    if (db.claimedMessages.length > 2000) db.claimedMessages = db.claimedMessages.slice(-1000);

    const staff = getStaff(db, mention.id);
    staff.points += db.settings.ticketClaimPoints;
    staff.ticketsHandled += 1;
    writeDb(db);

    sendLog(client, '🔗 استلام تذكرة (بوت خارجي)', `تم رصد استلام تذكرة بواسطة <@${mention.id}> عبر بوت آخر (+${db.settings.ticketClaimPoints} نقطة).`);
  }
};

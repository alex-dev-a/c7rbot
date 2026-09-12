const { readDb, writeDb, getStaff, logPointEvent } = require('../utils/db');

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
    logPointEvent(db, { type: 'ticket', userId: mention.id, amount: db.settings.ticketClaimPoints, channelId: message.channel.id });
    writeDb(db);
  }
};

const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { readDb } = require('../utils/db');

const ACTION_NAMES = {
  [AuditLogEvent.GuildUpdate]: 'تحديث إعدادات السيرفر',
  [AuditLogEvent.ChannelCreate]: 'إنشاء قناة',
  [AuditLogEvent.ChannelUpdate]: 'تعديل قناة',
  [AuditLogEvent.ChannelDelete]: 'حذف قناة',
  [AuditLogEvent.ChannelOverwriteCreate]: 'إضافة صلاحية قناة',
  [AuditLogEvent.ChannelOverwriteUpdate]: 'تعديل صلاحية قناة',
  [AuditLogEvent.ChannelOverwriteDelete]: 'حذف صلاحية قناة',
  [AuditLogEvent.MemberKick]: 'طرد عضو',
  [AuditLogEvent.MemberBanAdd]: 'حظر عضو',
  [AuditLogEvent.MemberBanRemove]: 'رفع حظر عضو',
  [AuditLogEvent.MemberUpdate]: 'تعديل بيانات عضو',
  [AuditLogEvent.MemberRoleUpdate]: 'تعديل رتبة عضو',
  [AuditLogEvent.MemberMove]: 'نقل عضو صوتياً',
  [AuditLogEvent.MemberDisconnect]: 'قطع اتصال عضو صوتياً',
  [AuditLogEvent.BotAdd]: 'إضافة بوت',
  [AuditLogEvent.RoleCreate]: 'إنشاء رتبة',
  [AuditLogEvent.RoleUpdate]: 'تعديل رتبة',
  [AuditLogEvent.RoleDelete]: 'حذف رتبة',
  [AuditLogEvent.InviteCreate]: 'إنشاء دعوة',
  [AuditLogEvent.InviteDelete]: 'حذف دعوة',
  [AuditLogEvent.WebhookCreate]: 'إنشاء webhook',
  [AuditLogEvent.WebhookUpdate]: 'تعديل webhook',
  [AuditLogEvent.WebhookDelete]: 'حذف webhook',
  [AuditLogEvent.EmojiCreate]: 'إضافة إيموجي',
  [AuditLogEvent.EmojiUpdate]: 'تعديل إيموجي',
  [AuditLogEvent.EmojiDelete]: 'حذف إيموجي',
  [AuditLogEvent.MessageDelete]: 'حذف رسالة',
  [AuditLogEvent.MessageBulkDelete]: 'حذف جماعي للرسائل',
  [AuditLogEvent.MessagePin]: 'تثبيت رسالة',
  [AuditLogEvent.MessageUnpin]: 'إلغاء تثبيت رسالة',
  [AuditLogEvent.StageInstanceCreate]: 'بدء جلسة ستيج',
  [AuditLogEvent.StickerCreate]: 'إضافة ستيكر',
  [AuditLogEvent.StickerUpdate]: 'تعديل ستيكر',
  [AuditLogEvent.StickerDelete]: 'حذف ستيكر',
  [AuditLogEvent.ThreadCreate]: 'إنشاء ثريد',
  [AuditLogEvent.ThreadUpdate]: 'تعديل ثريد',
  [AuditLogEvent.ThreadDelete]: 'حذف ثريد',
  [AuditLogEvent.AutoModerationRuleCreate]: 'إنشاء قاعدة أوتوموديريشن',
  [AuditLogEvent.AutoModerationRuleUpdate]: 'تعديل قاعدة أوتوموديريشن',
  [AuditLogEvent.AutoModerationRuleDelete]: 'حذف قاعدة أوتوموديريشن',
  [AuditLogEvent.AutoModerationBlockMessage]: 'حظر رسالة (أوتوموديريشن)',
  [AuditLogEvent.AutoModerationFlagToPost]: 'تنبيه أوتوموديريشن',
  [AuditLogEvent.AutoModerationUserCommunicationDisabled]: 'كتم عضو (أوتوموديريشن)'
};

function actionName(action) {
  return ACTION_NAMES[action] || `إجراء (${action})`;
}

function formatTarget(entry) {
  if (!entry.target) return '—';
  const id = entry.target.id ?? entry.target;
  if (!id) return '—';

  switch (entry.action) {
    case AuditLogEvent.MemberKick:
    case AuditLogEvent.MemberBanAdd:
    case AuditLogEvent.MemberBanRemove:
    case AuditLogEvent.MemberUpdate:
    case AuditLogEvent.MemberRoleUpdate:
    case AuditLogEvent.MemberMove:
    case AuditLogEvent.MemberDisconnect:
    case AuditLogEvent.BotAdd:
      return `<@${id}>`;
    case AuditLogEvent.RoleCreate:
    case AuditLogEvent.RoleUpdate:
    case AuditLogEvent.RoleDelete:
      return `<@&${id}>`;
    case AuditLogEvent.ChannelCreate:
    case AuditLogEvent.ChannelUpdate:
    case AuditLogEvent.ChannelDelete:
    case AuditLogEvent.ChannelOverwriteCreate:
    case AuditLogEvent.ChannelOverwriteUpdate:
    case AuditLogEvent.ChannelOverwriteDelete:
    case AuditLogEvent.MessageDelete:
    case AuditLogEvent.MessageBulkDelete:
    case AuditLogEvent.MessagePin:
    case AuditLogEvent.MessageUnpin:
    case AuditLogEvent.ThreadCreate:
    case AuditLogEvent.ThreadUpdate:
    case AuditLogEvent.ThreadDelete:
      return `<#${id}>`;
    default:
      return `\`${id}\``;
  }
}

module.exports = {
  name: 'guildAuditLogEntryCreate',
  async execute(entry, guild, client) {
    const db = readDb();
    const channelId = db.settings.logChannelId;
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xA855F7)
      .setTitle('🛡️ إجراء إداري مسجّل')
      .addFields(
        { name: 'الإجراء', value: actionName(entry.action) },
        { name: 'المنفذ', value: entry.executor ? `<@${entry.executor.id}>` : 'غير معروف' },
        { name: 'الهدف', value: formatTarget(entry) },
        { name: 'السبب', value: entry.reason || '—' }
      )
      .setTimestamp();
    channel.send({ embeds: [embed] }).catch(() => {});
  }
};

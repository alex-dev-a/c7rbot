const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readDb, writeDb } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('إعداد بوت C7R (للإدارة العليا فقط)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('logchannel').setDescription('تحديد قناة سجلات الإدارة')
      .addChannelOption(opt => opt.setName('channel').setDescription('القناة').setRequired(true)))
    .addSubcommand(sub => sub.setName('messagelogchannel').setDescription('تحديد قناة سجلات الرسائل')
      .addChannelOption(opt => opt.setName('channel').setDescription('القناة').setRequired(true)))
    .addSubcommand(sub => sub.setName('reviewchannel').setDescription('تحديد قناة مراجعة طلبات التقديم')
      .addChannelOption(opt => opt.setName('channel').setDescription('القناة').setRequired(true)))
    .addSubcommand(sub => sub.setName('staffrole').setDescription('تحديد رتبة الإدارة')
      .addRoleOption(opt => opt.setName('role').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('addticketbot').setDescription('إضافة آيدي بوت تذاكر خارجي لمراقبته')
      .addStringOption(opt => opt.setName('botid').setDescription('آيدي البوت').setRequired(true)))
    .addSubcommand(sub => sub.setName('ticketpoints').setDescription('نقاط استلام كل تذكرة')
      .addIntegerOption(opt => opt.setName('amount').setDescription('عدد النقاط').setRequired(true)))
    .addSubcommand(sub => sub.setName('dutypoints').setDescription('نقاط كل ساعة مناوبة')
      .addIntegerOption(opt => opt.setName('amount').setDescription('عدد النقاط').setRequired(true)))
    .addSubcommand(sub => sub.setName('textpoints').setDescription('نقاط الرسائل الكتابية (العدد وفترة الانتظار)')
      .addIntegerOption(opt => opt.setName('points').setDescription('عدد النقاط لكل رسالة').setRequired(true))
      .addIntegerOption(opt => opt.setName('cooldown_seconds').setDescription('فترة الانتظار بالثواني بين كل رسالة تُحتسب والثانية').setRequired(true)))
    .addSubcommand(sub => sub.setName('voicepoints').setDescription('نقاط التواجد الصوتي (العدد وكل كم دقيقة)')
      .addIntegerOption(opt => opt.setName('points').setDescription('عدد النقاط لكل فترة').setRequired(true))
      .addIntegerOption(opt => opt.setName('interval_minutes').setDescription('كل كم دقيقة تُحتسب النقاط').setRequired(true))),
  async execute(interaction) {
    const db = readDb();
    const sub = interaction.options.getSubcommand();
    if (sub === 'logchannel') {
      db.settings.logChannelId = interaction.options.getChannel('channel').id;
    } else if (sub === 'messagelogchannel') {
      db.settings.messageLogChannelId = interaction.options.getChannel('channel').id;
    } else if (sub === 'reviewchannel') {
      db.settings.reviewChannelId = interaction.options.getChannel('channel').id;
    } else if (sub === 'staffrole') {
      db.settings.staffRoleId = interaction.options.getRole('role').id;
    } else if (sub === 'addticketbot') {
      const id = interaction.options.getString('botid');
      if (!db.settings.ticketBotIds.includes(id)) db.settings.ticketBotIds.push(id);
    } else if (sub === 'ticketpoints') {
      db.settings.ticketClaimPoints = interaction.options.getInteger('amount');
    } else if (sub === 'dutypoints') {
      db.settings.dutyPointsPerHour = interaction.options.getInteger('amount');
    } else if (sub === 'textpoints') {
      db.settings.textPointsPerMessage = interaction.options.getInteger('points');
      db.settings.textCooldownSeconds = interaction.options.getInteger('cooldown_seconds');
    } else if (sub === 'voicepoints') {
      db.settings.voicePointsPerInterval = interaction.options.getInteger('points');
      db.settings.voiceIntervalMinutes = interaction.options.getInteger('interval_minutes');
    }
    writeDb(db);
    await interaction.reply({ content: '✅ تم تحديث الإعدادات بنجاح.', ephemeral: true });
  }
};

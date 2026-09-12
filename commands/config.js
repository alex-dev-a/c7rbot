const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readDb, writeDb } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('إعداد بوت C7R (للإدارة العليا فقط)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('staffrole').setDescription('تحديد رتبة الإدارة')
      .addRoleOption(opt => opt.setName('role').setDescription('الرتبة').setRequired(true)))
    .addSubcommand(sub => sub.setName('addticketbot').setDescription('إضافة آيدي بوت تذاكر خارجي لمراقبته')
      .addStringOption(opt => opt.setName('botid').setDescription('آيدي البوت').setRequired(true)))
    .addSubcommand(sub => sub.setName('ticketpoints').setDescription('نقاط استلام كل تذكرة')
      .addIntegerOption(opt => opt.setName('amount').setDescription('عدد النقاط').setRequired(true)))
    .addSubcommand(sub => sub.setName('checkinpoints').setDescription('نقاط تسجيل الدخول والخروج (ثابتة، بدون احتساب مدة)')
      .addIntegerOption(opt => opt.setName('checkin').setDescription('نقاط تسجيل الدخول').setRequired(true))
      .addIntegerOption(opt => opt.setName('checkout').setDescription('نقاط تسجيل الخروج').setRequired(true)))
    .addSubcommand(sub => sub.setName('textpoints').setDescription('نقاط الرسائل الكتابية (العدد وفترة الانتظار)')
      .addIntegerOption(opt => opt.setName('points').setDescription('عدد النقاط لكل رسالة').setRequired(true))
      .addIntegerOption(opt => opt.setName('cooldown_seconds').setDescription('فترة الانتظار بالثواني').setRequired(true)))
    .addSubcommand(sub => sub.setName('voicepoints').setDescription('نقاط التواجد الصوتي (العدد وكل كم دقيقة)')
      .addIntegerOption(opt => opt.setName('points').setDescription('عدد النقاط لكل فترة').setRequired(true))
      .addIntegerOption(opt => opt.setName('interval_minutes').setDescription('كل كم دقيقة تُحتسب النقاط').setRequired(true)))
    .addSubcommand(sub => sub.setName('reportschannel').setDescription('تحديد قناة استلام التقارير الإدارية')
      .addChannelOption(opt => opt.setName('channel').setDescription('القناة').setRequired(true)))
    .addSubcommand(sub => sub.setName('dailyreportchannel').setDescription('تحديد قناة التقرير الصباحي التلقائي')
      .addChannelOption(opt => opt.setName('channel').setDescription('القناة').setRequired(true)))
    .addSubcommand(sub => sub.setName('dailyreporthour').setDescription('تحديد ساعة إرسال التقرير الصباحي (بتوقيت UTC، 0-23)')
      .addIntegerOption(opt => opt.setName('hour').setDescription('الساعة (UTC)').setRequired(true)))
    .addSubcommand(sub => sub.setName('ticketcategory').setDescription('تحديد الكاتيغوري التي تُرسل فيها رسالة استلام التذكرة تلقائياً')
      .addChannelOption(opt => opt.setName('category').setDescription('الكاتيغوري').setRequired(true)))
    .addSubcommand(sub => sub.setName('addapptype').setDescription('إضافة نوع تقديم جديد مرتبط بقناة مخصصة')
      .addStringOption(opt => opt.setName('key').setDescription('معرّف قصير بالإنجليزية بدون مسافات (مثال: esports)').setRequired(true))
      .addStringOption(opt => opt.setName('name').setDescription('اسم القسم كما يظهر للمتقدمين').setRequired(true))
      .addChannelOption(opt => opt.setName('channel').setDescription('قناة مراجعة هذا النوع من التقديم').setRequired(true)))
    .addSubcommand(sub => sub.setName('listapptypes').setDescription('عرض كل أنواع التقديم المُعدّة حالياً')),
  async execute(interaction) {
    const db = readDb();
    const sub = interaction.options.getSubcommand();

    if (sub === 'staffrole') {
      db.settings.staffRoleId = interaction.options.getRole('role').id;
    } else if (sub === 'addticketbot') {
      const id = interaction.options.getString('botid');
      if (!db.settings.ticketBotIds.includes(id)) db.settings.ticketBotIds.push(id);
    } else if (sub === 'ticketpoints') {
      db.settings.ticketClaimPoints = interaction.options.getInteger('amount');
    } else if (sub === 'checkinpoints') {
      db.settings.checkinPoints = interaction.options.getInteger('checkin');
      db.settings.checkoutPoints = interaction.options.getInteger('checkout');
    } else if (sub === 'textpoints') {
      db.settings.textPointsPerMessage = interaction.options.getInteger('points');
      db.settings.textCooldownSeconds = interaction.options.getInteger('cooldown_seconds');
    } else if (sub === 'voicepoints') {
      db.settings.voicePointsPerInterval = interaction.options.getInteger('points');
      db.settings.voiceIntervalMinutes = interaction.options.getInteger('interval_minutes');
    } else if (sub === 'reportschannel') {
      db.settings.reportsChannelId = interaction.options.getChannel('channel').id;
    } else if (sub === 'dailyreportchannel') {
      db.settings.dailyReportChannelId = interaction.options.getChannel('channel').id;
    } else if (sub === 'dailyreporthour') {
      const hour = interaction.options.getInteger('hour');
      if (hour < 0 || hour > 23) {
        return interaction.reply({ content: '⚠️ الساعة يجب أن تكون بين 0 و23.', ephemeral: true });
      }
      db.settings.dailyReportHourUTC = hour;
    } else if (sub === 'ticketcategory') {
      db.settings.ticketCategoryId = interaction.options.getChannel('category').id;
    } else if (sub === 'addapptype') {
      const key = interaction.options.getString('key').trim().toLowerCase();
      const name = interaction.options.getString('name');
      const channel = interaction.options.getChannel('channel');
      db.settings.applicationTypes[key] = { name, channelId: channel.id };
      writeDb(db);
      return interaction.reply({ content: `✅ تم إضافة نوع تقديم جديد: **${name}** (المعرّف: \`${key}\`) مرتبط بـ <#${channel.id}>.`, ephemeral: true });
    } else if (sub === 'listapptypes') {
      const types = Object.entries(db.settings.applicationTypes);
      if (!types.length) return interaction.reply({ content: 'لا توجد أنواع تقديم مُعدّة بعد.', ephemeral: true });
      const list = types.map(([key, v]) => `\`${key}\` — ${v.name} → <#${v.channelId}>`).join('\n');
      return interaction.reply({ content: list, ephemeral: true });
    }

    writeDb(db);
    await interaction.reply({ content: '✅ تم تحديث الإعدادات بنجاح.', ephemeral: true });
  }
};

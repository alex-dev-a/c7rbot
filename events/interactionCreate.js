const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
const { readDb, writeDb, getStaff } = require('../utils/db');
const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        const reply = { content: '⚠️ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
        else await interaction.reply(reply);
      }
      return;
    }

    if (interaction.isButton()) {
      const db = readDb();

      if (interaction.customId === 'duty_checkin') {
        if (db.activeSessions[interaction.user.id]) {
          return interaction.reply({ content: 'أنت بالفعل في مناوبة نشطة.', ephemeral: true });
        }
        db.activeSessions[interaction.user.id] = Date.now();
        writeDb(db);
        await interaction.reply({ content: '🟢 بدأت مناوبتك، تم تسجيل الوقت.', ephemeral: true });
        sendLog(client, '🟢 بدء مناوبة', `<@${interaction.user.id}> بدأ مناوبة إدارية.`);
        return;
      }

      if (interaction.customId === 'duty_checkout') {
        const start = db.activeSessions[interaction.user.id];
        if (!start) {
          return interaction.reply({ content: 'ما عندك مناوبة نشطة حالياً.', ephemeral: true });
        }
        const seconds = Math.floor((Date.now() - start) / 1000);
        delete db.activeSessions[interaction.user.id];
        const staff = getStaff(db, interaction.user.id);
        staff.dutySeconds += seconds;
        const pointsEarned = Math.floor((seconds / 3600) * db.settings.dutyPointsPerHour);
        staff.points += pointsEarned;
        writeDb(db);
        const hrs = Math.floor(seconds / 3600), mins = Math.floor((seconds % 3600) / 60);
        await interaction.reply({ content: `🔴 انتهت مناوبتك (${hrs}س ${mins}د). حصلت على ${pointsEarned} نقطة.`, ephemeral: true });
        sendLog(client, '🔴 إنهاء مناوبة', `<@${interaction.user.id}> أنهى مناوبته بعد ${hrs}س ${mins}د وحصل على ${pointsEarned} نقطة.`);
        return;
      }

      if (interaction.customId === 'ticket_claim') {
        db.activeTickets[interaction.channel.id] = db.activeTickets[interaction.channel.id] || {};
        if (db.activeTickets[interaction.channel.id][interaction.user.id]) {
          return interaction.reply({ content: 'أنت مستلم هذه المهمة بالفعل.', ephemeral: true });
        }
        db.activeTickets[interaction.channel.id][interaction.user.id] = Date.now();
        writeDb(db);
        await interaction.reply({ content: `✅ استلم <@${interaction.user.id}> هذه المهمة.` });
        sendLog(client, '📥 استلام تذكرة', `<@${interaction.user.id}> استلم مهمة في <#${interaction.channel.id}>.`);
        return;
      }

      if (interaction.customId === 'ticket_complete') {
        const active = db.activeTickets[interaction.channel.id];
        const start = active && active[interaction.user.id];
        if (!start) {
          return interaction.reply({ content: 'ما عندك مهمة مستلمة في هذه القناة.', ephemeral: true });
        }
        delete db.activeTickets[interaction.channel.id][interaction.user.id];
        const staff = getStaff(db, interaction.user.id);
        staff.points += db.settings.ticketClaimPoints;
        staff.ticketsHandled += 1;
        writeDb(db);
        await interaction.reply({ content: `🏁 أنهى <@${interaction.user.id}> هذه المهمة وحصل على ${db.settings.ticketClaimPoints} نقطة.` });
        sendLog(client, '📤 إنهاء تذكرة', `<@${interaction.user.id}> أنهى المهمة في <#${interaction.channel.id}> (+${db.settings.ticketClaimPoints} نقطة).`);
        return;
      }

      if (interaction.customId === 'apply_open') {
        const modal = new ModalBuilder().setCustomId('apply_modal').setTitle('استمارة تقديم C7R');
        const nameInput = new TextInputBuilder().setCustomId('apply_name').setLabel('اسمك داخل ديسكورد').setStyle(TextInputStyle.Short).setRequired(true);
        const ageInput = new TextInputBuilder().setCustomId('apply_age').setLabel('عمرك').setStyle(TextInputStyle.Short).setRequired(true);
        const whyInput = new TextInputBuilder().setCustomId('apply_why').setLabel('ليش تبي تنضم لفريق الإدارة؟').setStyle(TextInputStyle.Paragraph).setRequired(true);
        const expInput = new TextInputBuilder().setCustomId('apply_exp').setLabel('خبرتك السابقة (إن وجدت)').setStyle(TextInputStyle.Paragraph).setRequired(false);
        modal.addComponents(
          new ActionRowBuilder().addComponents(nameInput),
          new ActionRowBuilder().addComponents(ageInput),
          new ActionRowBuilder().addComponents(whyInput),
          new ActionRowBuilder().addComponents(expInput)
        );
        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId.startsWith('apply_accept_') || interaction.customId.startsWith('apply_deny_')) {
        const isAccept = interaction.customId.startsWith('apply_accept_');
        const prefix = isAccept ? 'apply_accept_' : 'apply_deny_';
        const appId = interaction.customId.slice(prefix.length);

        const app = db.applications[appId];
        if (!app) {
          return interaction.reply({ content: '⚠️ لم يُعثر على بيانات هذا الطلب.', ephemeral: true });
        }
        if (app.status !== 'pending') {
          const statusText = app.status === 'accepted' ? 'مقبول' : 'مرفوض';
          return interaction.reply({
            content: `⚠️ تمت معالجة هذا الطلب مسبقاً من قبل <@${app.decidedBy}> (${statusText}). لا يمكن تعديله مرة أخرى.`,
            ephemeral: true
          });
        }

        app.status = isAccept ? 'accepted' : 'rejected';
        app.decidedBy = interaction.user.id;
        app.decidedAt = Date.now();
        writeDb(db);

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('apply_accept_done').setLabel('قبول').setStyle(ButtonStyle.Success).setDisabled(true),
          new ButtonBuilder().setCustomId('apply_deny_done').setLabel('رفض').setStyle(ButtonStyle.Danger).setDisabled(true)
        );
        const originalEmbed = interaction.message.embeds[0];
        const updatedEmbed = originalEmbed
          ? EmbedBuilder.from(originalEmbed).addFields({
              name: 'الحالة',
              value: `${isAccept ? '✅ مقبول' : '❌ مرفوض'} بواسطة <@${interaction.user.id}>`
            })
          : null;

        await interaction.update({
          embeds: updatedEmbed ? [updatedEmbed] : undefined,
          components: [disabledRow]
        });

        sendLog(client, isAccept ? '✅ قبول تقديم' : '❌ رفض تقديم', `طلب <@${app.userId}> تمت مراجعته (${isAccept ? 'قبول' : 'رفض'}) بواسطة <@${interaction.user.id}>.`);
        const user = await client.users.fetch(app.userId).catch(() => null);
        if (user) {
          user.send(isAccept
            ? '🎉 تم قبول طلب تقديمك في فريق إدارة C7R! تواصل مع الإدارة للخطوات التالية.'
            : '❌ نأسف، تم رفض طلب تقديمك في فريق إدارة C7R حالياً.'
          ).catch(() => {});
        }
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'apply_modal') {
        const name = interaction.fields.getTextInputValue('apply_name');
        const age = interaction.fields.getTextInputValue('apply_age');
        const why = interaction.fields.getTextInputValue('apply_why');
        const exp = interaction.fields.getTextInputValue('apply_exp') || 'لا يوجد';
        const db = readDb();
        const reviewChannelId = db.settings.reviewChannelId;
        if (!reviewChannelId) {
          return interaction.reply({ content: '⚠️ لم يتم إعداد قناة مراجعة الطلبات بعد. أخبر الإدارة.', ephemeral: true });
        }
        const channel = await client.channels.fetch(reviewChannelId).catch(() => null);

        const appId = `${interaction.user.id}_${Date.now()}`;
        db.applications[appId] = { userId: interaction.user.id, status: 'pending' };
        writeDb(db);

        if (channel) {
          const embed = new EmbedBuilder()
            .setColor(0xA855F7)
            .setTitle('📋 طلب تقديم جديد')
            .addFields(
              { name: 'المتقدم', value: `<@${interaction.user.id}>` },
              { name: 'الاسم', value: name },
              { name: 'العمر', value: age },
              { name: 'سبب التقديم', value: why },
              { name: 'الخبرة', value: exp }
            )
            .setTimestamp();
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`apply_accept_${appId}`).setLabel('قبول').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`apply_deny_${appId}`).setLabel('رفض').setStyle(ButtonStyle.Danger)
          );
          channel.send({ embeds: [embed], components: [row] });
        }
        await interaction.reply({ content: '✅ تم إرسال طلبك بنجاح، سيتم مراجعته قريباً.', ephemeral: true });
        return;
      }

      if (interaction.customId === 'report_modal') {
        const subject = interaction.fields.getTextInputValue('report_subject');
        const details = interaction.fields.getTextInputValue('report_details');
        const db = readDb();
        const staff = getStaff(db, interaction.user.id);
        staff.reports += 1;
        writeDb(db);
        sendLog(client, '📝 تقرير جديد', `تقرير من <@${interaction.user.id}>`, [
          { name: 'الموضوع', value: subject },
          { name: 'التفاصيل', value: details }
        ]);
        await interaction.reply({ content: '✅ تم إرسال تقريرك بنجاح.', ephemeral: true });
        return;
      }
    }
  }
};

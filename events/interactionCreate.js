const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
const { readDb, writeDb, getStaff, logPointEvent, todayKeyUTC } = require('../utils/db');

async function handleButton(interaction, client) {
  const db = readDb();

  if (interaction.customId === 'checkin') {
    const today = todayKeyUTC();
    if (db.lastCheckin[interaction.user.id] === today) {
      return interaction.reply({ content: 'أنت سجّلت دخولك اليوم بالفعل. حاول مرة ثانية بكرة.', ephemeral: true });
    }
    db.lastCheckin[interaction.user.id] = today;
    const staff = getStaff(db, interaction.user.id);
    const amount = db.settings.checkinPoints || 0;
    staff.points += amount;
    logPointEvent(db, { type: 'checkin', userId: interaction.user.id, amount });
    writeDb(db);
    await interaction.reply({ content: `🟢 تم تسجيل دخولك لليوم (+${amount} نقطة).`, ephemeral: true });
    return;
  }

  if (interaction.customId === 'checkout') {
    const today = todayKeyUTC();
    if (db.lastCheckout[interaction.user.id] === today) {
      return interaction.reply({ content: 'أنت سجّلت خروجك اليوم بالفعل. حاول مرة ثانية بكرة.', ephemeral: true });
    }
    db.lastCheckout[interaction.user.id] = today;
    const staff = getStaff(db, interaction.user.id);
    const amount = db.settings.checkoutPoints || 0;
    staff.points += amount;
    logPointEvent(db, { type: 'checkout', userId: interaction.user.id, amount });
    writeDb(db);
    await interaction.reply({ content: `🔴 تم تسجيل خروجك لليوم (+${amount} نقطة).`, ephemeral: true });
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
    const amount = db.settings.ticketClaimPoints;
    staff.points += amount;
    staff.ticketsHandled += 1;
    logPointEvent(db, { type: 'ticket', userId: interaction.user.id, amount, channelId: interaction.channel.id });
    writeDb(db);
    await interaction.reply({ content: `🏁 أنهى <@${interaction.user.id}> هذه المهمة وحصل على ${amount} نقطة.` });
    return;
  }

  if (interaction.customId === 'ticket_autoclaim') {
    const channelId = interaction.channel.id;
    if (db.ticketClaims[channelId]) {
      return interaction.reply({ content: `⚠️ تم استلام هذه التذكرة مسبقاً بواسطة <@${db.ticketClaims[channelId]}>.`, ephemeral: true });
    }
    if (db.settings.staffRoleId && !interaction.member.roles.cache.has(db.settings.staffRoleId)) {
      return interaction.reply({ content: '⚠️ هذا الزر مخصص لأعضاء الإدارة فقط.', ephemeral: true });
    }
    db.ticketClaims[channelId] = interaction.user.id;
    const staff = getStaff(db, interaction.user.id);
    const amount = db.settings.ticketClaimPoints;
    staff.points += amount;
    staff.ticketsHandled += 1;
    logPointEvent(db, { type: 'ticket', userId: interaction.user.id, amount, channelId });
    writeDb(db);

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_autoclaim_done').setLabel(`تم الاستلام بواسطة ${interaction.user.username}`).setStyle(ButtonStyle.Secondary).setDisabled(true)
    );
    await interaction.update({ components: [disabledRow] });
    await interaction.channel.send(`✅ <@${interaction.user.id}> استلم هذه التذكرة (+${amount} نقطة).`).catch(() => {});
    return;
  }

  if (interaction.customId.startsWith('apply_open_')) {
    const key = interaction.customId.slice('apply_open_'.length);
    const type = db.settings.applicationTypes[key];
    if (!type) {
      return interaction.reply({ content: '⚠️ نوع التقديم هذا لم يعد متاحاً.', ephemeral: true });
    }
    const modal = new ModalBuilder().setCustomId(`apply_modal_${key}`).setTitle(`تقديم — ${type.name}`.slice(0, 45));
    const nameInput = new TextInputBuilder().setCustomId('apply_name').setLabel('اسمك داخل ديسكورد / Your Discord name').setStyle(TextInputStyle.Short).setRequired(true);
    const ageInput = new TextInputBuilder().setCustomId('apply_age').setLabel('عمرك / Your age').setStyle(TextInputStyle.Short).setRequired(true);
    const whyInput = new TextInputBuilder().setCustomId('apply_why').setLabel('سبب التقديم / Why are you applying?').setStyle(TextInputStyle.Paragraph).setRequired(true);
    const expInput = new TextInputBuilder().setCustomId('apply_exp').setLabel('خبرتك السابقة / Previous experience').setStyle(TextInputStyle.Paragraph).setRequired(false);
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
        content: `⚠️ تمت معالجة هذا الطلب مسبقاً من قبل <@${app.decidedBy}> (${statusText}).`,
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
          name: 'الحالة / Status',
          value: `${isAccept ? '✅ مقبول / Accepted' : '❌ مرفوض / Rejected'} — <@${interaction.user.id}>`
        })
      : null;

    await interaction.update({
      embeds: updatedEmbed ? [updatedEmbed] : undefined,
      components: [disabledRow]
    });

    const user = await client.users.fetch(app.userId).catch(() => null);
    if (user) {
      user.send(isAccept
        ? `🎉 تم قبول طلب تقديمك! تواصل مع الإدارة للخطوات التالية.\n🎉 Your application has been accepted! Contact the staff for next steps.`
        : `❌ نأسف، تم رفض طلب تقديمك حالياً.\n❌ Sorry, your application has been rejected for now.`
      ).catch(() => {});
    }
    return;
  }
}

async function handleModal(interaction, client) {
  const db = readDb();

  if (interaction.customId.startsWith('apply_modal_')) {
    const key = interaction.customId.slice('apply_modal_'.length);
    const type = db.settings.applicationTypes[key];
    if (!type) {
      return interaction.reply({ content: '⚠️ نوع التقديم هذا لم يعد متاحاً.', ephemeral: true });
    }

    const name = interaction.fields.getTextInputValue('apply_name');
    const age = interaction.fields.getTextInputValue('apply_age');
    const why = interaction.fields.getTextInputValue('apply_why');
    const exp = interaction.fields.getTextInputValue('apply_exp') || 'لا يوجد / None';

    const channel = await client.channels.fetch(type.channelId).catch(() => null);

    const appId = `${interaction.user.id}_${Date.now()}`;
    db.applications[appId] = { userId: interaction.user.id, status: 'pending', type: key };
    writeDb(db);

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(0xA855F7)
        .setTitle(`📋 طلب تقديم جديد — ${type.name} / New Application`)
        .addFields(
          { name: 'المتقدم / Applicant', value: `<@${interaction.user.id}>` },
          { name: 'الاسم / Name', value: name },
          { name: 'العمر / Age', value: age },
          { name: 'سبب التقديم / Reason', value: why },
          { name: 'الخبرة / Experience', value: exp }
        )
        .setTimestamp();
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`apply_accept_${appId}`).setLabel('قبول').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`apply_deny_${appId}`).setLabel('رفض').setStyle(ButtonStyle.Danger)
      );
      await channel.send({ embeds: [embed], components: [row] }).catch(() => {});
    }
    await interaction.reply({ content: '✅ تم إرسال طلبك بنجاح، سيتم مراجعته قريباً.\n✅ Your application has been submitted.', ephemeral: true });
    return;
  }

  if (interaction.customId === 'report_modal') {
    const subject = interaction.fields.getTextInputValue('report_subject');
    const details = interaction.fields.getTextInputValue('report_details');
    const staff = getStaff(db, interaction.user.id);
    staff.reports += 1;
    writeDb(db);

    const channelId = db.settings.reportsChannelId;
    if (channelId) {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor(0xA855F7)
          .setTitle('📝 تقرير إداري جديد')
          .addFields(
            { name: 'المرسل', value: `<@${interaction.user.id}>` },
            { name: 'العنوان', value: subject },
            { name: 'التفاصيل', value: details }
          )
          .setTimestamp();
        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }
    await interaction.reply({ content: '✅ تم إرسال تقريرك بنجاح.', ephemeral: true });
    return;
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error('خطأ بأمر:', interaction.commandName, err);
        const reply = { content: '⚠️ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true };
        try {
          if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
          else await interaction.reply(reply);
        } catch (_) { /* تجاهل */ }
      }
      return;
    }

    if (interaction.isButton()) {
      try {
        await handleButton(interaction, client);
      } catch (err) {
        console.error('خطأ بزر:', interaction.customId, err);
        try {
          const reply = { content: '⚠️ حدث خطأ أثناء تنفيذ هذا الإجراء.', ephemeral: true };
          if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
          else await interaction.reply(reply);
        } catch (_) { /* تجاهل */ }
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      try {
        await handleModal(interaction, client);
      } catch (err) {
        console.error('خطأ بنموذج:', interaction.customId, err);
        try {
          const reply = { content: '⚠️ حدث خطأ أثناء معالجة النموذج.', ephemeral: true };
          if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
          else await interaction.reply(reply);
        } catch (_) { /* تجاهل */ }
      }
      return;
    }
  }
};

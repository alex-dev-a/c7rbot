const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ C7R BOT جاهز — تسجيل الدخول باسم ${client.user.tag}`);
    client.user.setActivity('C7R | إدارة الأداء', { type: ActivityType.Watching });
  }
};

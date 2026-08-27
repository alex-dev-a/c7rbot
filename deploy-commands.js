require('dotenv').config();
const fs = require('fs');
const path = require('path');

const commands = JSON.parse(fs.readFileSync(path.join(__dirname, 'commands-static.json'), 'utf8'));

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

(async () => {
  try {
    console.log(`⏳ تسجيل ${commands.length} أمر (نسخة خفيفة)...`);
    const res = await fetch(
      `https://discord.com/api/v10/applications/${clientId}/guilds/${guildId}/commands`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commands)
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ فشل تسجيل الأوامر (${res.status}):`, errText);
      process.exit(1);
    }

    console.log('✅ تم تسجيل الأوامر بنجاح.');
  } catch (err) {
    console.error('❌ خطأ أثناء تسجيل الأوامر:', err);
    process.exit(1);
  }
})();

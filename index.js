const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder
} = require('discord.js');

const {
  createCanvas,
  loadImage
} = require('@napi-rs/canvas');

const path = require('path');

const TOKEN = process.env.TOKEN;

const GUILD_ID = '1554748054412992564';
const WELCOME_CHANNEL_ID = '1556384341544673291';

// ===== إعدادات التصميم =====
const WIDTH = 1536;
const HEIGHT = 1536;

// صورة العضو
const AVATAR_SIZE = 600;

// مكان صورة العضو
const AVATAR_X = (WIDTH - AVATAR_SIZE) / 2;
const AVATAR_Y = 300;

// إعدادات الاسم
const NAME_Y = 990;

const MAX_FONT_SIZE = 70;
const MIN_FONT_SIZE = 35;

// أقصى عرض مسموح للاسم
const MAX_NAME_WIDTH = 1250;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`WELCOME BOT ONLINE: ${client.user.tag}`);
});

client.on('guildMemberAdd', async member => {
  try {
    if (member.guild.id !== GUILD_ID) return;

    const channel = await member.guild.channels.fetch(
      WELCOME_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) return;

    // تحميل الخلفية
    const background = await loadImage(
      path.join(__dirname, 'welcome.png')
    );

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // رسم الخلفية
    ctx.drawImage(
      background,
      0,
      0,
      WIDTH,
      HEIGHT
    );

    // تحميل صورة العضو
    const avatarURL = member.user.displayAvatarURL({
      extension: 'png',
      size: 1024
    });

    const avatar = await loadImage(avatarURL);

    // ===== قص صورة العضو بشكل دائري =====

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      WIDTH / 2,
      AVATAR_Y + AVATAR_SIZE / 2,
      AVATAR_SIZE / 2,
      0,
      Math.PI * 2
    );

    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      avatar,
      AVATAR_X,
      AVATAR_Y,
      AVATAR_SIZE,
      AVATAR_SIZE
    );

    ctx.restore();

    // ===== إطار أبيض حول الصورة =====

    ctx.beginPath();

    ctx.arc(
      WIDTH / 2,
      AVATAR_Y + AVATAR_SIZE / 2,
      AVATAR_SIZE / 2,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.stroke();

    // ===== اسم العضو =====

    const username = member.user.username;

    let fontSize = MAX_FONT_SIZE;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // يصغر الخط تلقائياً إذا الاسم طويل
    while (fontSize > MIN_FONT_SIZE) {
      ctx.font = `bold ${fontSize}px Arial`;

      const width = ctx.measureText(username).width;

      if (width <= MAX_NAME_WIDTH) {
        break;
      }

      fontSize -= 2;
    }

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#FFFFFF';

    // ظل بسيط عشان الاسم يكون واضح
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 12;

    ctx.fillText(
      username,
      WIDTH / 2,
      NAME_Y
    );

    ctx.shadowBlur = 0;

    // تحويل الصورة إلى PNG
    const buffer = await canvas.encode('png');

    const attachment = new AttachmentBuilder(
      buffer,
      {
        name: 'welcome.png'
      }
    );

    // إرسال الصورة
    await channel.send({
      files: [attachment]
    });

  } catch (error) {
    console.error('WELCOME ERROR:', error);
  }
});

client.login(TOKEN);
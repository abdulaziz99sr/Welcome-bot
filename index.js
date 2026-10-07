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

// ================================
// SETTINGS
// ================================

const TOKEN = process.env.TOKEN;

const GUILD_ID = '1554748054412992564';
const WELCOME_CHANNEL_ID = '1556384341544673291';

const WIDTH = 1536;
const HEIGHT = 1536;

// Avatar
const AVATAR_SIZE = 600;
const AVATAR_X = (WIDTH - AVATAR_SIZE) / 2;
const AVATAR_Y = 250;

// Username
// الدائرة تنتهي عند Y = 850
// اليوزر تحتها مباشرة
const USERNAME_Y = 930;

const MAX_FONT_SIZE = 75;
const MIN_FONT_SIZE = 32;
const MAX_USERNAME_WIDTH = 1250;


// ================================
// CLIENT
// ================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});


// ================================
// READY
// ================================

client.once('ready', () => {
  console.log(`WELCOME BOT ONLINE: ${client.user.tag}`);
});


// ================================
// NEW MEMBER
// ================================

client.on('guildMemberAdd', async (member) => {
  try {

    // السيرفر المطلوب فقط
    if (member.guild.id !== GUILD_ID) return;


    // ================================
    // CHANNEL
    // ================================

    const channel = await member.guild.channels
      .fetch(WELCOME_CHANNEL_ID)
      .catch(() => null);

    if (!channel || !channel.isTextBased()) {
      console.log('WELCOME CHANNEL NOT FOUND');
      return;
    }


    // ================================
    // BACKGROUND
    // ================================

    const background = await loadImage(
      path.join(__dirname, 'welcome.PNG')
    );


    // ================================
    // CANVAS
    // ================================

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      background,
      0,
      0,
      WIDTH,
      HEIGHT
    );


    // ================================
    // AVATAR
    // ================================

    const avatarURL = member.user.displayAvatarURL({
      extension: 'png',
      size: 1024,
      forceStatic: true
    });

    const avatar = await loadImage(avatarURL);

    const avatarCenterX = WIDTH / 2;
    const avatarCenterY = AVATAR_Y + (AVATAR_SIZE / 2);


    // قص الأفتار دائرة
    ctx.save();

    ctx.beginPath();

    ctx.arc(
      avatarCenterX,
      avatarCenterY,
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


    // ================================
    // WHITE AVATAR BORDER
    // ================================

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      avatarCenterX,
      avatarCenterY,
      AVATAR_SIZE / 2,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.restore();


    // ================================
    // USERNAME INSIDE PNG
    // ================================

    const username = `@${member.user.username}`;

    let fontSize = MAX_FONT_SIZE;

    ctx.save();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // تصغير تلقائي لليوزرات الطويلة
    while (fontSize > MIN_FONT_SIZE) {

      ctx.font = `bold ${fontSize}px sans-serif`;

      const width = ctx.measureText(username).width;

      if (width <= MAX_USERNAME_WIDTH) {
        break;
      }

      fontSize -= 2;
    }

    ctx.font = `bold ${fontSize}px sans-serif`;

    // إطار أسود حول الكتابة عشان تبين بأي خلفية
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';

    // النص أبيض
    ctx.fillStyle = '#FFFFFF';

    ctx.strokeText(
      username,
      WIDTH / 2,
      USERNAME_Y,
      MAX_USERNAME_WIDTH
    );

    ctx.fillText(
      username,
      WIDTH / 2,
      USERNAME_Y,
      MAX_USERNAME_WIDTH
    );

    ctx.restore();


    // ================================
    // CREATE PNG
    // ================================

    const buffer = await canvas.encode('png');

    const attachment = new AttachmentBuilder(
      buffer,
      {
        name: 'welcome.png'
      }
    );


    // ================================
    // SEND
    // ================================

    await channel.send({
      content: `𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗥𝗲𝘁𝗿𝗼 .. <@${member.id}>`,
      files: [attachment]
    });


    console.log(
      `WELCOME SENT: @${member.user.username}`
    );

  } catch (error) {

    console.error('WELCOME ERROR:', error);

  }
});


// ================================
// LOGIN
// ================================

client.login(TOKEN);
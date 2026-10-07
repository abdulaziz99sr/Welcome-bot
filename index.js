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


// ==========================================
// SETTINGS
// ==========================================

const TOKEN = process.env.TOKEN;

const GUILD_ID = '1554748054412992564';
const WELCOME_CHANNEL_ID = '1556384341544673291';

const WIDTH = 1536;
const HEIGHT = 1536;

// صورة العضو
const AVATAR_SIZE = 600;
const AVATAR_X = (WIDTH - AVATAR_SIZE) / 2;
const AVATAR_Y = 300;

// اليوزر تحت الصورة
const USERNAME_Y = 1000;

const MAX_FONT_SIZE = 80;
const MIN_FONT_SIZE = 35;
const MAX_NAME_WIDTH = 1250;


// ==========================================
// DISCORD CLIENT
// ==========================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});


// ==========================================
// BOT READY
// ==========================================

client.once('ready', () => {
  console.log(`WELCOME BOT ONLINE: ${client.user.tag}`);
});


// ==========================================
// MEMBER JOIN
// ==========================================

client.on('guildMemberAdd', async (member) => {

  try {

    // يتأكد من السيرفر
    if (member.guild.id !== GUILD_ID) return;


    // ==========================================
    // WELCOME CHANNEL
    // ==========================================

    const channel = await member.guild.channels
      .fetch(WELCOME_CHANNEL_ID)
      .catch(() => null);

    if (!channel || !channel.isTextBased()) {
      console.log('Welcome channel not found.');
      return;
    }


    // ==========================================
    // BACKGROUND
    // ==========================================

    const backgroundPath = path.join(
      __dirname,
      'welcome.PNG'
    );

    const background = await loadImage(
      backgroundPath
    );


    // ==========================================
    // CANVAS
    // ==========================================

    const canvas = createCanvas(
      WIDTH,
      HEIGHT
    );

    const ctx = canvas.getContext('2d');


    // الخلفية
    ctx.drawImage(
      background,
      0,
      0,
      WIDTH,
      HEIGHT
    );


    // ==========================================
    // MEMBER AVATAR
    // ==========================================

    const avatarURL = member.user.displayAvatarURL({
      extension: 'png',
      size: 1024
    });

    const avatar = await loadImage(
      avatarURL
    );


    // ==========================================
    // CIRCLE AVATAR
    // ==========================================

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      WIDTH / 2,
      AVATAR_Y + (AVATAR_SIZE / 2),
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


    // ==========================================
    // WHITE BORDER
    // ==========================================

    ctx.beginPath();

    ctx.arc(
      WIDTH / 2,
      AVATAR_Y + (AVATAR_SIZE / 2),
      AVATAR_SIZE / 2,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.stroke();


    // ==========================================
    // USERNAME
    // ==========================================

    // يوزر حساب Discord الحقيقي
    // مثال: @aziz99
    const username = `@${member.user.username}`;

    let fontSize = MAX_FONT_SIZE;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';


    // يصغر الخط تلقائياً إذا اليوزر طويل
    while (fontSize > MIN_FONT_SIZE) {

      ctx.font = `bold ${fontSize}px sans-serif`;

      const textWidth =
        ctx.measureText(username).width;

      if (textWidth <= MAX_NAME_WIDTH) {
        break;
      }

      fontSize -= 2;
    }


    ctx.font =
      `bold ${fontSize}px sans-serif`;

    ctx.fillStyle = '#FFFFFF';

    ctx.shadowColor =
      'rgba(0, 0, 0, 0.95)';

    ctx.shadowBlur = 15;

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;


    // رسم اليوزر تحت الدائرة
    ctx.fillText(
      username,
      WIDTH / 2,
      USERNAME_Y,
      MAX_NAME_WIDTH
    );


    // إلغاء الظل
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;


    // ==========================================
    // FINAL IMAGE
    // ==========================================

    const buffer =
      await canvas.encode('png');

    const attachment =
      new AttachmentBuilder(
        buffer,
        {
          name: 'welcome.png'
        }
      );


    // ==========================================
    // SEND WELCOME
    // ==========================================

    await channel.send({

      content:
        `𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗥𝗲𝘁𝗿𝗼 .. <@${member.id}>`,

      files: [
        attachment
      ]

    });


    console.log(
      `WELCOME SENT TO: @${member.user.username}`
    );


  } catch (error) {

    console.error(
      'WELCOME ERROR:',
      error
    );

  }

});


// ==========================================
// LOGIN
// ==========================================

client.login(TOKEN);
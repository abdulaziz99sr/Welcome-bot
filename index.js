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

// ==============================
// SETTINGS
// ==============================

const TOKEN = process.env.TOKEN;

const GUILD_ID = '1554748054412992564';
const WELCOME_CHANNEL_ID = '1556384341544673291';

// Canvas
const WIDTH = 1536;
const HEIGHT = 1536;

// Avatar
const AVATAR_SIZE = 600;
const AVATAR_X = (WIDTH - AVATAR_SIZE) / 2;
const AVATAR_Y = 300;

// Username
const NAME_Y = 990;
const MAX_FONT_SIZE = 70;
const MIN_FONT_SIZE = 35;
const MAX_NAME_WIDTH = 1250;


// ==============================
// CLIENT
// ==============================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});


// ==============================
// READY
// ==============================

client.once('ready', () => {
  console.log(`WELCOME BOT ONLINE: ${client.user.tag}`);
});


// ==============================
// NEW MEMBER
// ==============================

client.on('guildMemberAdd', async (member) => {

  try {

    // Only your server
    if (member.guild.id !== GUILD_ID) return;


    // Get welcome channel
    const channel = await member.guild.channels.fetch(
      WELCOME_CHANNEL_ID
    ).catch(() => null);

    if (!channel || !channel.isTextBased()) {
      console.log('Welcome channel not found.');
      return;
    }


    // ==============================
    // LOAD BACKGROUND
    // ==============================

    const background = await loadImage(
      path.join(__dirname, 'welcome.PNG')
    );


    // ==============================
    // CREATE CANVAS
    // ==============================

    const canvas = createCanvas(WIDTH, HEIGHT);

    const ctx = canvas.getContext('2d');


    // Draw background
    ctx.drawImage(
      background,
      0,
      0,
      WIDTH,
      HEIGHT
    );


    // ==============================
    // LOAD MEMBER AVATAR
    // ==============================

    const avatarURL = member.user.displayAvatarURL({
      extension: 'png',
      size: 1024
    });

    const avatar = await loadImage(avatarURL);


    // ==============================
    // DRAW CIRCLE AVATAR
    // ==============================

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


    // ==============================
    // WHITE AVATAR BORDER
    // ==============================

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


    // ==============================
    // USERNAME
    // ==============================

    const username = member.user.username;

    let fontSize = MAX_FONT_SIZE;

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';


    // Automatically resize long usernames
    while (fontSize > MIN_FONT_SIZE) {

      ctx.font = `bold ${fontSize}px Arial`;

      const textWidth = ctx.measureText(username).width;

      if (textWidth <= MAX_NAME_WIDTH) {
        break;
      }

      fontSize -= 2;
    }


    ctx.font = `bold ${fontSize}px Arial`;

    ctx.fillStyle = '#FFFFFF';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';

    ctx.shadowBlur = 12;


    // Draw username
    ctx.fillText(
      username,
      WIDTH / 2,
      NAME_Y,
      MAX_NAME_WIDTH
    );


    // Remove shadow
    ctx.shadowBlur = 0;


    // ==============================
    // CREATE PNG
    // ==============================

    const buffer = await canvas.encode('png');


    const attachment = new AttachmentBuilder(
      buffer,
      {
        name: 'welcome.png'
      }
    );


    // ==============================
    // SEND WELCOME
    // ==============================

    await channel.send({

      content:
        `𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗥𝗲𝘁𝗿𝗼 .. <@${member.id}>`,

      files: [
        attachment
      ]

    });


    console.log(
      `Welcomed: ${member.user.tag}`
    );


  } catch (error) {

    console.error(
      'WELCOME ERROR:',
      error
    );

  }

});


// ==============================
// LOGIN
// ==============================

client.login(TOKEN);
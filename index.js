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

const AVATAR_SIZE = 600;
const AVATAR_X = (WIDTH - AVATAR_SIZE) / 2;
const AVATAR_Y = 300;


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
// READY
// ==========================================

client.once('ready', () => {
  console.log(`WELCOME BOT ONLINE: ${client.user.tag}`);
});


// ==========================================
// MEMBER JOIN
// ==========================================

client.on('guildMemberAdd', async (member) => {

  try {

    if (member.guild.id !== GUILD_ID) return;


    // ==========================================
    // GET WELCOME CHANNEL
    // ==========================================

    const channel = await member.guild.channels
      .fetch(WELCOME_CHANNEL_ID)
      .catch(() => null);

    if (!channel || !channel.isTextBased()) {
      console.log('Welcome channel not found.');
      return;
    }


    // ==========================================
    // LOAD BACKGROUND
    // ==========================================

    const background = await loadImage(
      path.join(__dirname, 'welcome.PNG')
    );


    // ==========================================
    // CREATE CANVAS
    // ==========================================

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      background,
      0,
      0,
      WIDTH,
      HEIGHT
    );


    // ==========================================
    // LOAD MEMBER AVATAR
    // ==========================================

    const avatarURL = member.user.displayAvatarURL({
      extension: 'png',
      size: 1024
    });

    const avatar = await loadImage(avatarURL);


    // ==========================================
    // DRAW CIRCLE AVATAR
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
    // CREATE IMAGE
    // ==========================================

    const buffer = await canvas.encode('png');

    const attachment = new AttachmentBuilder(
      buffer,
      {
        name: 'welcome.png'
      }
    );


    // ==========================================
    // MESSAGE + IMAGE
    // ==========================================

    await channel.send({
      content: `𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗧𝗼 𝗥𝗲𝘁𝗿𝗼 .. <@${member.id}>`,
      files: [attachment]
    });


    // ==========================================
    // USERNAME UNDER IMAGE
    // ==========================================

    await channel.send({
      content: `@${member.user.username}`
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
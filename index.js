// ==========================================
// USERNAME UNDER AVATAR
// ==========================================

const username = member.user.username;

let fontSize = 80;
const minFontSize = 35;
const maxWidth = 1250;

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillStyle = '#FFFFFF';

while (fontSize > minFontSize) {
  ctx.font = `bold ${fontSize}px sans-serif`;

  if (ctx.measureText(username).width <= maxWidth) {
    break;
  }

  fontSize -= 2;
}

// ظل أسود واضح
ctx.shadowColor = '#000000';
ctx.shadowBlur = 15;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 4;

// الاسم تحت الدائرة
ctx.fillText(
  username,
  WIDTH / 2,
  1000,
  maxWidth
);

// إلغاء الظل
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0; 
const { Jimp } = require('jimp');
async function check() {
  const img = await Jimp.read('./data/reference/tab_scoreboard_full.jpg');
  console.log('Dimensions:', img.width, 'x', img.height);
}
check();

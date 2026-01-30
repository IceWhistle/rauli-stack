const { Jimp } = require('jimp');
async function check() {
  const img = await Jimp.read('./data/reference/full_1080p.png');
  console.log('Dimensions:', img.width, 'x', img.height);
}
check();

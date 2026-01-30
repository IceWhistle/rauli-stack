const { Jimp } = require('jimp');

const LAYOUT = {
  enemyTeam: { startX: 855, startY: 45, playerWidth: 95, playerGap: 5, playerCount: 6 },
  itemGrid: { offsetY: 255, offsetX: 8, slotSize: 28, gapX: 3, gapY: 3, columns: 4, rows: 4 }
};

async function test() {
  const img = await Jimp.read('./data/reference/full_scoreboard.jpg');
  console.log('Image size:', img.width, 'x', img.height);
  
  for (let p = 0; p < 6; p++) {
    const px = LAYOUT.enemyTeam.startX + (p * (LAYOUT.enemyTeam.playerWidth + LAYOUT.enemyTeam.playerGap));
    const slotX = px + LAYOUT.itemGrid.offsetX;
    const slotY = LAYOUT.enemyTeam.startY + LAYOUT.itemGrid.offsetY;
    console.log(`Player ${p+1}: card at X=${px}, items at (${slotX}, ${slotY})`);
  }
}
test().catch(console.error);

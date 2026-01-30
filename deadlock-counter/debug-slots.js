#!/usr/bin/env node
// Debug: extract and analyze individual slots

const { Jimp, intToRGBA } = require('jimp');
const fs = require('fs');
const path = require('path');

// Try different Y positions to find actual items
const LAYOUT = {
  enemyTeam: {
    startX: 815,
    startY: 355,      // Try lower - items might be further down
    playerWidth: 93,
    playerGap: 4,
    playerCount: 6
  },
  itemGrid: {
    offsetY: 0,
    offsetX: 2,
    slotSize: 21,
    gapX: 1,
    gapY: 1,
    columns: 4,
    rows: 4
  }
};

async function main() {
  const screenshot = await Jimp.read('./data/reference/full_1080p.png');
  
  // Create output dir
  const outDir = './data/debug-slots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  const { enemyTeam, itemGrid } = LAYOUT;
  
  // Extract first few slots for analysis
  for (let p = 0; p < 3; p++) {  // First 3 players
    const playerX = enemyTeam.startX + (p * (enemyTeam.playerWidth + enemyTeam.playerGap));
    
    for (let row = 0; row < 2; row++) {  // First 2 rows
      for (let col = 0; col < 4; col++) {
        const slotX = playerX + itemGrid.offsetX + (col * (itemGrid.slotSize + itemGrid.gapX));
        const slotY = enemyTeam.startY + itemGrid.offsetY + (row * (itemGrid.slotSize + itemGrid.gapY));
        
        const slotImg = screenshot.clone().crop({
          x: slotX,
          y: slotY,
          w: itemGrid.slotSize,
          h: itemGrid.slotSize
        });
        
        // Analyze colors
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        let darkPixels = 0;
        
        for (let y = 0; y < slotImg.height; y++) {
          for (let x = 0; x < slotImg.width; x++) {
            const c = intToRGBA(slotImg.getPixelColor(x, y));
            totalR += c.r;
            totalG += c.g;
            totalB += c.b;
            count++;
            if (c.r < 40 && c.g < 40 && c.b < 40) darkPixels++;
          }
        }
        
        const avgR = Math.round(totalR / count);
        const avgG = Math.round(totalG / count);
        const avgB = Math.round(totalB / count);
        const darkPct = Math.round((darkPixels / count) * 100);
        
        const filename = `p${p+1}_r${row}_c${col}.png`;
        await slotImg.write(path.join(outDir, filename));
        
        console.log(`${filename}: avg RGB(${avgR},${avgG},${avgB}) dark:${darkPct}%`);
      }
    }
    console.log('---');
  }
  
  console.log(`\nExtracted slots saved to ${outDir}/`);
}

main().catch(console.error);

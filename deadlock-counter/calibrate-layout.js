#!/usr/bin/env node
// Visual calibration tool - draws detected regions on screenshot

const { Jimp } = require('jimp');
const path = require('path');

// Layout for the reference screenshot (with Testing Tools visible)
// Enemy item grids are visible below the Infernus character headers
const LAYOUT = {
  enemyTeam: {
    startX: 815,      // X where first enemy column starts
    startY: 248,      // Y where item grids start
    playerWidth: 93,  // Width allocated per player
    playerGap: 4,     // Gap between player columns
    playerCount: 6
  },
  itemGrid: {
    offsetY: 0,       // Items start at startY directly
    offsetX: 2,       // Small offset from left edge
    slotSize: 21,     // Each item slot size
    gapX: 1,          // Horizontal gap
    gapY: 1,          // Vertical gap
    columns: 4,
    rows: 4
  }
};

async function main() {
  const img = await Jimp.read('./data/reference/full_1080p.png');
  console.log(`Image size: ${img.width}x${img.height}`);
  
  const RED = 0xff0000ff;
  const GREEN = 0x00ff00ff;
  const BLUE = 0x0000ffff;
  
  // Draw rectangles around detected regions
  for (let p = 0; p < LAYOUT.enemyTeam.playerCount; p++) {
    const playerX = LAYOUT.enemyTeam.startX + (p * (LAYOUT.enemyTeam.playerWidth + LAYOUT.enemyTeam.playerGap));
    
    // Draw player card outline (green)
    drawRect(img, playerX, LAYOUT.enemyTeam.startY, LAYOUT.enemyTeam.playerWidth, 200, GREEN);
    
    // Draw item grid (red squares)
    for (let row = 0; row < LAYOUT.itemGrid.rows; row++) {
      for (let col = 0; col < LAYOUT.itemGrid.columns; col++) {
        const slotX = playerX + LAYOUT.itemGrid.offsetX + (col * (LAYOUT.itemGrid.slotSize + LAYOUT.itemGrid.gapX));
        const slotY = LAYOUT.enemyTeam.startY + LAYOUT.itemGrid.offsetY + (row * (LAYOUT.itemGrid.slotSize + LAYOUT.itemGrid.gapY));
        
        drawRect(img, slotX, slotY, LAYOUT.itemGrid.slotSize, LAYOUT.itemGrid.slotSize, RED);
      }
    }
  }
  
  await img.write('./data/reference/calibration_overlay.png');
  console.log('Saved calibration overlay to ./data/reference/calibration_overlay.png');
}

function drawRect(img, x, y, w, h, color) {
  // Top and bottom edges
  for (let i = 0; i < w; i++) {
    if (x + i >= 0 && x + i < img.width) {
      if (y >= 0 && y < img.height) img.setPixelColor(color, x + i, y);
      if (y + h - 1 >= 0 && y + h - 1 < img.height) img.setPixelColor(color, x + i, y + h - 1);
    }
  }
  // Left and right edges
  for (let i = 0; i < h; i++) {
    if (y + i >= 0 && y + i < img.height) {
      if (x >= 0 && x < img.width) img.setPixelColor(color, x, y + i);
      if (x + w - 1 >= 0 && x + w - 1 < img.width) img.setPixelColor(color, x + w - 1, y + i);
    }
  }
}

main().catch(console.error);

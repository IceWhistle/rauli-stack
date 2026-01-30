// Screenshot processor for Deadlock scoreboard
// Detects item icons using template matching

const fs = require('fs');
const path = require('path');

// Scoreboard layout constants for 1920x1080
const LAYOUT_1080P = {
  // Approximate positions - will need calibration with real screenshots
  scoreboard: {
    x: 200,
    y: 150,
    width: 1520,
    height: 780
  },
  // Each player row
  playerRows: {
    height: 65,
    startY: 200,
    // Enemy team is typically bottom half
    enemyStartY: 500
  },
  // Item slots within each row
  itemSlots: {
    startX: 800,  // Where items begin in the row
    slotWidth: 48,
    slotHeight: 48,
    gap: 4,
    count: 16  // Max items visible
  }
};

class ScreenshotProcessor {
  constructor(iconDir) {
    this.iconDir = iconDir || path.join(__dirname, '../../data/icons');
    this.icons = new Map();
    this.loadIcons();
  }

  loadIcons() {
    if (!fs.existsSync(this.iconDir)) {
      console.log('Icon directory not found:', this.iconDir);
      return;
    }

    const files = fs.readdirSync(this.iconDir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const itemName = file.replace('.png', '').replace(/_/g, ' ');
        this.icons.set(itemName.toLowerCase(), path.join(this.iconDir, file));
      }
    }
    console.log(`Loaded ${this.icons.size} icon templates`);
  }

  // Extract item regions from screenshot
  getItemRegions(layout = LAYOUT_1080P) {
    const regions = [];
    const { itemSlots, playerRows } = layout;
    
    // 6 enemy players (approximate)
    for (let player = 0; player < 6; player++) {
      const rowY = playerRows.enemyStartY + (player * playerRows.height);
      
      // 16 item slots per player
      for (let slot = 0; slot < itemSlots.count; slot++) {
        regions.push({
          player,
          slot,
          x: itemSlots.startX + (slot * (itemSlots.slotWidth + itemSlots.gap)),
          y: rowY,
          width: itemSlots.slotWidth,
          height: itemSlots.slotHeight
        });
      }
    }
    
    return regions;
  }

  // Placeholder for actual image comparison
  // In production, use sharp + pixelmatch or similar
  async processScreenshot(imagePath) {
    // This would:
    // 1. Load the screenshot
    // 2. Extract item slot regions
    // 3. Compare each region against icon templates
    // 4. Return detected items per player
    
    return {
      players: [
        { slot: 0, items: ['detected items would go here'] },
        // ...
      ],
      confidence: 0,
      needsCalibration: true
    };
  }

  // Get calibration guide
  getCalibrationGuide() {
    return {
      instructions: [
        '1. Take a screenshot while holding TAB in Deadlock',
        '2. Upload the screenshot',
        '3. Click on the corners of the first item slot',
        '4. System will auto-detect the grid from there'
      ],
      expectedLayout: LAYOUT_1080P
    };
  }
}

module.exports = { ScreenshotProcessor, LAYOUT_1080P };

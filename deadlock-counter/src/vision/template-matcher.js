// Template matching for Deadlock item detection
// Compares screenshot regions against item icon templates

const { Jimp, intToRGBA } = require('jimp');
const fs = require('fs');
const path = require('path');

// Scoreboard layout for 1920x1080 (TAB screen)
// Calibrated from actual Deadlock screenshot with Testing Tools visible
const LAYOUT_1080P = {
  // Enemy team section (6 columns of player items)
  enemyTeam: {
    startX: 815,      // X where first enemy column starts
    startY: 248,      // Y where item grids start
    playerWidth: 93,  // Width allocated per player column
    playerGap: 4,     // Gap between player columns
    playerCount: 6
  },
  // Item grid within each player column (4x4 grid)
  itemGrid: {
    offsetY: 0,       // Items start at startY directly
    offsetX: 2,       // Small offset from column left edge
    slotSize: 21,     // Each item slot size
    gapX: 1,          // Horizontal gap between slots
    gapY: 1,          // Vertical gap between rows
    columns: 4,
    rows: 4
  }
};

class TemplateMatcher {
  constructor(iconsDir, manifestPath) {
    this.iconsDir = iconsDir || path.join(__dirname, '../../data/icons');
    this.manifestPath = manifestPath || path.join(__dirname, '../../data/icon-manifest.json');
    this.templates = new Map(); // name -> { image, category, tier, cost }
    this.loaded = false;
    this.templateSize = 28; // Size to normalize templates to
  }

  async loadTemplates() {
    if (this.loaded) return;
    
    console.log('Loading item templates...');
    const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
    
    let loaded = 0;
    let failed = 0;
    
    for (const [category, items] of Object.entries(manifest.categories)) {
      for (const item of items) {
        const iconPath = path.join(this.iconsDir, item.icon);
        
        if (!fs.existsSync(iconPath)) {
          failed++;
          continue;
        }
        
        try {
          // Load and resize template to match expected slot size
          let img = await Jimp.read(iconPath);
          img = img.resize({ w: this.templateSize, h: this.templateSize });
          
          this.templates.set(item.name, {
            image: img,
            category,
            tier: item.tier,
            cost: item.cost,
            path: item.icon
          });
          loaded++;
        } catch (err) {
          console.error(`Failed to load ${item.name}: ${err.message}`);
          failed++;
        }
      }
    }
    
    console.log(`Loaded ${loaded} templates (${failed} failed)`);
    this.loaded = true;
  }

  // Calculate similarity between two images (0-1, higher is more similar)
  async compareImages(img1, img2) {
    // Ensure same size
    const w = Math.min(img1.width, img2.width);
    const h = Math.min(img1.height, img2.height);
    
    let totalDiff = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c1 = intToRGBA(img1.getPixelColor(x, y));
        const c2 = intToRGBA(img2.getPixelColor(x, y));
        
        // Skip transparent pixels
        if (c1.a < 128 || c2.a < 128) continue;
        
        // Calculate color distance
        const dr = Math.abs(c1.r - c2.r);
        const dg = Math.abs(c1.g - c2.g);
        const db = Math.abs(c1.b - c2.b);
        
        totalDiff += (dr + dg + db) / 765; // Normalize to 0-1
        pixelCount++;
      }
    }
    
    if (pixelCount === 0) return 0;
    
    // Return similarity (1 - average difference)
    return 1 - (totalDiff / pixelCount);
  }

  // Find best matching template for a slot image
  async findBestMatch(slotImage, categoryHint = null) {
    let bestMatch = null;
    let bestScore = 0;
    const threshold = 0.65; // Minimum similarity to consider a match
    
    for (const [name, template] of this.templates) {
      // If category hint provided, skip other categories
      if (categoryHint && template.category !== categoryHint) continue;
      
      const score = await this.compareImages(slotImage, template.image);
      
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = { name, ...template, confidence: score };
      }
    }
    
    return bestMatch;
  }

  // Detect category by dominant color
  // Weapon = orange/tan/brown, Vitality = green, Spirit = purple/blue
  detectCategoryByColor(img) {
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    let maxR = 0, maxG = 0, maxB = 0;
    
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const c = intToRGBA(img.getPixelColor(x, y));
        // Skip very dark or transparent pixels
        if (c.a < 100 || (c.r + c.g + c.b) < 60) continue;
        
        totalR += c.r;
        totalG += c.g;
        totalB += c.b;
        count++;
        
        maxR = Math.max(maxR, c.r);
        maxG = Math.max(maxG, c.g);
        maxB = Math.max(maxB, c.b);
      }
    }
    
    if (count === 0) return null;
    
    const avgR = totalR / count;
    const avgG = totalG / count;
    const avgB = totalB / count;
    
    // Calculate color ratios
    const total = avgR + avgG + avgB;
    if (total < 30) return null; // Too dark
    
    const rRatio = avgR / total;
    const gRatio = avgG / total;
    const bRatio = avgB / total;
    
    // Weapon = orange/tan/brown - high red, medium green, low blue
    // Orange items: R > G > B, R dominant
    if (rRatio > 0.4 && rRatio > gRatio && rRatio > bRatio && avgB < avgR * 0.6) {
      return 'weapon';
    }
    
    // Also catch tan/brown weapons: R >= G > B
    if (avgR > 100 && avgR >= avgG && avgG > avgB && avgB < 100 && rRatio > 0.35) {
      return 'weapon';
    }
    
    // Vitality = green - high green relative to others
    if (gRatio > 0.38 && avgG > avgR && avgG > avgB) {
      return 'vitality';
    }
    
    // Spirit = purple/blue - high blue, some red, low green
    // Purple: B high, R medium, G low
    if (bRatio > 0.35 && avgB > avgG && (avgR > avgG * 0.8 || avgB > avgR)) {
      return 'spirit';
    }
    
    // Also catch blue items
    if (avgB > 100 && avgB > avgR && avgB > avgG && bRatio > 0.4) {
      return 'spirit';
    }
    
    return null;
  }

  // Check if slot appears empty
  isEmptySlot(img) {
    let darkPixels = 0;
    let totalPixels = 0;
    
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const c = intToRGBA(img.getPixelColor(x, y));
        totalPixels++;
        
        // Dark/transparent = empty
        if (c.a < 100 || (c.r < 40 && c.g < 40 && c.b < 40)) {
          darkPixels++;
        }
      }
    }
    
    return (darkPixels / totalPixels) > 0.7;
  }

  // Process a full screenshot and detect all enemy items
  async processScreenshot(imagePath, layout = LAYOUT_1080P) {
    await this.loadTemplates();
    
    console.log(`Processing screenshot: ${imagePath}`);
    const screenshot = await Jimp.read(imagePath);
    console.log(`Screenshot size: ${screenshot.width}x${screenshot.height}`);
    
    // Scale layout if screenshot is not 1080p
    const scaleX = screenshot.width / 1920;
    const scaleY = screenshot.height / 1080;
    
    if (scaleX !== 1 || scaleY !== 1) {
      console.log(`Scaling layout by ${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`);
    }
    
    const results = {
      players: [],
      totalItems: 0,
      categoryCounts: { weapon: 0, vitality: 0, spirit: 0 }
    };
    
    // Scale the layout
    const enemyTeam = {
      startX: Math.floor(layout.enemyTeam.startX * scaleX),
      startY: Math.floor(layout.enemyTeam.startY * scaleY),
      playerWidth: Math.floor(layout.enemyTeam.playerWidth * scaleX),
      playerGap: Math.floor(layout.enemyTeam.playerGap * scaleX),
      playerCount: layout.enemyTeam.playerCount
    };
    
    const itemGrid = {
      offsetY: Math.floor(layout.itemGrid.offsetY * scaleY),
      offsetX: Math.floor(layout.itemGrid.offsetX * scaleX),
      slotSize: Math.max(16, Math.floor(layout.itemGrid.slotSize * Math.min(scaleX, scaleY))),
      gapX: Math.floor(layout.itemGrid.gapX * scaleX),
      gapY: Math.floor(layout.itemGrid.gapY * scaleY),
      columns: layout.itemGrid.columns,
      rows: layout.itemGrid.rows
    };
    
    // Process each enemy player
    for (let p = 0; p < enemyTeam.playerCount; p++) {
      const playerX = enemyTeam.startX + (p * (enemyTeam.playerWidth + enemyTeam.playerGap));
      const player = {
        index: p + 1,
        items: [],
        categoryCounts: { weapon: 0, vitality: 0, spirit: 0 }
      };
      
      // Process each item slot (4x4 grid)
      for (let row = 0; row < itemGrid.rows; row++) {
        for (let col = 0; col < itemGrid.columns; col++) {
          const slotX = playerX + itemGrid.offsetX + (col * (itemGrid.slotSize + itemGrid.gapX));
          const slotY = enemyTeam.startY + itemGrid.offsetY + (row * (itemGrid.slotSize + itemGrid.gapY));
          
          // Bounds check
          if (slotX < 0 || slotY < 0 || 
              slotX + itemGrid.slotSize > screenshot.width ||
              slotY + itemGrid.slotSize > screenshot.height) {
            continue;
          }
          
          // Extract slot region
          const slotImg = screenshot.clone().crop({
            x: slotX,
            y: slotY,
            w: itemGrid.slotSize,
            h: itemGrid.slotSize
          });
          
          // Skip empty slots
          if (this.isEmptySlot(slotImg)) continue;
          
          // Detect category by color first (faster)
          const categoryHint = this.detectCategoryByColor(slotImg);
          
          // Find matching template
          const match = await this.findBestMatch(slotImg, categoryHint);
          
          if (match) {
            player.items.push({
              name: match.name,
              category: match.category,
              tier: match.tier,
              cost: match.cost,
              confidence: match.confidence,
              slot: { row, col }
            });
            player.categoryCounts[match.category]++;
            results.categoryCounts[match.category]++;
            results.totalItems++;
          } else if (categoryHint) {
            // Fallback: detected color but no template match
            player.items.push({
              name: `Unknown ${categoryHint}`,
              category: categoryHint,
              tier: null,
              cost: null,
              confidence: 0.5,
              slot: { row, col }
            });
            player.categoryCounts[categoryHint]++;
            results.categoryCounts[categoryHint]++;
            results.totalItems++;
          }
        }
      }
      
      results.players.push(player);
    }
    
    return results;
  }

  // Quick category-only detection (faster, less accurate)
  async detectCategoriesOnly(imagePath, layout = LAYOUT_1080P) {
    console.log(`Quick category detection: ${imagePath}`);
    const screenshot = await Jimp.read(imagePath);
    
    // Scale layout if needed
    const scaleX = screenshot.width / 1920;
    const scaleY = screenshot.height / 1080;
    
    const results = {
      players: [],
      totalItems: 0,
      categoryCounts: { weapon: 0, vitality: 0, spirit: 0 }
    };
    
    const enemyTeam = {
      startX: Math.floor(layout.enemyTeam.startX * scaleX),
      startY: Math.floor(layout.enemyTeam.startY * scaleY),
      playerWidth: Math.floor(layout.enemyTeam.playerWidth * scaleX),
      playerGap: Math.floor(layout.enemyTeam.playerGap * scaleX),
      playerCount: layout.enemyTeam.playerCount
    };
    
    const itemGrid = {
      offsetY: Math.floor(layout.itemGrid.offsetY * scaleY),
      offsetX: Math.floor(layout.itemGrid.offsetX * scaleX),
      slotSize: Math.max(16, Math.floor(layout.itemGrid.slotSize * Math.min(scaleX, scaleY))),
      gapX: Math.floor(layout.itemGrid.gapX * scaleX),
      gapY: Math.floor(layout.itemGrid.gapY * scaleY),
      columns: layout.itemGrid.columns,
      rows: layout.itemGrid.rows
    };
    
    for (let p = 0; p < enemyTeam.playerCount; p++) {
      const playerX = enemyTeam.startX + (p * (enemyTeam.playerWidth + enemyTeam.playerGap));
      const player = {
        index: p + 1,
        categoryCounts: { weapon: 0, vitality: 0, spirit: 0 }
      };
      
      for (let row = 0; row < itemGrid.rows; row++) {
        for (let col = 0; col < itemGrid.columns; col++) {
          const slotX = playerX + itemGrid.offsetX + (col * (itemGrid.slotSize + itemGrid.gapX));
          const slotY = enemyTeam.startY + itemGrid.offsetY + (row * (itemGrid.slotSize + itemGrid.gapY));
          
          // Bounds check
          if (slotX < 0 || slotY < 0 || 
              slotX + itemGrid.slotSize > screenshot.width ||
              slotY + itemGrid.slotSize > screenshot.height) {
            continue;
          }
          
          const slotImg = screenshot.clone().crop({
            x: slotX,
            y: slotY,
            w: itemGrid.slotSize,
            h: itemGrid.slotSize
          });
          
          if (this.isEmptySlot(slotImg)) continue;
          
          const category = this.detectCategoryByColor(slotImg);
          if (category) {
            player.categoryCounts[category]++;
            results.categoryCounts[category]++;
            results.totalItems++;
          }
        }
      }
      
      results.players.push(player);
    }
    
    return results;
  }
}

module.exports = { TemplateMatcher, LAYOUT_1080P };

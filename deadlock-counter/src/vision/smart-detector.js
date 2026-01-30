// Smart item detector for Deadlock
// Uses color-based scanning to find items, then template matching to identify

const { Jimp, intToRGBA } = require('jimp');
const fs = require('fs');
const path = require('path');

class SmartDetector {
  constructor(iconsDir, manifestPath) {
    this.iconsDir = iconsDir || path.join(__dirname, '../../data/icons');
    this.manifestPath = manifestPath || path.join(__dirname, '../../data/icon-manifest.json');
    this.templates = new Map();
    this.loaded = false;
  }

  async loadTemplates() {
    if (this.loaded) return;
    
    const manifest = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
    
    for (const [category, items] of Object.entries(manifest.categories)) {
      for (const item of items) {
        const iconPath = path.join(this.iconsDir, item.icon);
        if (!fs.existsSync(iconPath)) continue;
        
        try {
          let img = await Jimp.read(iconPath);
          img = img.resize({ w: 24, h: 24 });
          
          this.templates.set(item.name, {
            image: img,
            category,
            tier: item.tier,
            cost: item.cost
          });
        } catch (err) {
          // Skip failed loads
        }
      }
    }
    
    console.log(`Loaded ${this.templates.size} templates`);
    this.loaded = true;
  }

  // Detect item category by color
  detectCategory(img) {
    let r = 0, g = 0, b = 0, n = 0;
    
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const c = intToRGBA(img.getPixelColor(x, y));
        if (c.r + c.g + c.b < 50) continue; // Skip very dark pixels
        r += c.r; g += c.g; b += c.b; n++;
      }
    }
    
    if (n < 10) return null; // Too few pixels
    
    r /= n; g /= n; b /= n;
    
    // Weapon: orange/tan - high red, medium green
    if (r > 90 && r > g && r > b && g > 40 && b < r * 0.7) {
      return 'weapon';
    }
    
    // Vitality: green dominant
    if (g > 60 && g > r * 0.9 && g > b) {
      return 'vitality';
    }
    
    // Spirit: purple/blue - blue high, red present
    if (b > 60 && (b > g || (r > 50 && r < b * 1.3))) {
      return 'spirit';
    }
    
    return null;
  }

  // Compare two images for similarity
  async compareImages(img1, img2) {
    const w = Math.min(img1.width, img2.width, 24);
    const h = Math.min(img1.height, img2.height, 24);
    
    let diff = 0, count = 0;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c1 = intToRGBA(img1.getPixelColor(x, y));
        const c2 = intToRGBA(img2.getPixelColor(x, y));
        
        const dr = Math.abs(c1.r - c2.r);
        const dg = Math.abs(c1.g - c2.g);
        const db = Math.abs(c1.b - c2.b);
        
        diff += (dr + dg + db) / 765;
        count++;
      }
    }
    
    return count > 0 ? 1 - (diff / count) : 0;
  }

  // Find best matching template for a slot
  async findMatch(slotImage, category = null) {
    let bestMatch = null;
    let bestScore = 0;
    
    // Resize slot to match template size
    const slot = slotImage.clone().resize({ w: 24, h: 24 });
    
    for (const [name, template] of this.templates) {
      if (category && template.category !== category) continue;
      
      const score = await this.compareImages(slot, template.image);
      
      if (score > bestScore && score > 0.60) {
        bestScore = score;
        bestMatch = { name, ...template, confidence: score };
      }
    }
    
    return bestMatch;
  }

  // Scan entire scoreboard area for items
  async scanScreenshot(imagePath, options = {}) {
    await this.loadTemplates();
    
    const screenshot = await Jimp.read(imagePath);
    console.log(`Scanning ${screenshot.width}x${screenshot.height} screenshot...`);
    
    const {
      startX = 800,
      endX = 1150,
      startY = 240,
      endY = 400,
      slotSize = 22,
      stepSize = 24
    } = options;
    
    const results = {
      items: [],
      categoryCounts: { weapon: 0, vitality: 0, spirit: 0 },
      scannedRegions: 0
    };
    
    // Scan grid
    for (let y = startY; y < endY; y += stepSize) {
      for (let x = startX; x < endX; x += stepSize) {
        if (x + slotSize > screenshot.width || y + slotSize > screenshot.height) continue;
        
        const slot = screenshot.clone().crop({ x, y, w: slotSize, h: slotSize });
        results.scannedRegions++;
        
        // First check by color
        const category = this.detectCategory(slot);
        if (!category) continue;
        
        // Try to identify specific item
        const match = await this.findMatch(slot, category);
        
        if (match) {
          results.items.push({
            ...match,
            position: { x, y }
          });
          results.categoryCounts[match.category]++;
        } else {
          // Unknown item but valid category
          results.items.push({
            name: `Unknown ${category}`,
            category,
            confidence: 0.5,
            position: { x, y }
          });
          results.categoryCounts[category]++;
        }
      }
    }
    
    console.log(`Scanned ${results.scannedRegions} regions, found ${results.items.length} items`);
    return results;
  }

  // Quick category-only scan (faster)
  async quickScan(imagePath, options = {}) {
    const screenshot = await Jimp.read(imagePath);
    
    const {
      startX = 800,
      endX = 1150,
      startY = 240,
      endY = 400,
      slotSize = 22,
      stepSize = 24
    } = options;
    
    const counts = { weapon: 0, vitality: 0, spirit: 0 };
    
    for (let y = startY; y < endY; y += stepSize) {
      for (let x = startX; x < endX; x += stepSize) {
        if (x + slotSize > screenshot.width || y + slotSize > screenshot.height) continue;
        
        const slot = screenshot.clone().crop({ x, y, w: slotSize, h: slotSize });
        const category = this.detectCategory(slot);
        
        if (category) counts[category]++;
      }
    }
    
    return counts;
  }
}

module.exports = { SmartDetector };

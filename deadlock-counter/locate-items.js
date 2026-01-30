#!/usr/bin/env node
// Sample specific areas where items are visible in the screenshot

const { Jimp, intToRGBA } = require('jimp');
const fs = require('fs');

async function main() {
  const screenshot = await Jimp.read('./data/reference/full_1080p.png');
  
  const outDir = './data/item-samples';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  // Based on visual inspection of the screenshot:
  // The colorful item icons visible appear to be around:
  // - Y range: ~250-370
  // - X range: ~815-1100
  
  // Sample a grid across the area where items should be
  console.log('Sampling item area grid...\n');
  
  for (let y = 250; y <= 370; y += 30) {
    let row = `Y=${y}: `;
    for (let x = 815; x <= 1100; x += 25) {
      const slot = screenshot.clone().crop({ x, y, w: 22, h: 22 });
      
      let r = 0, g = 0, b = 0, n = 0;
      for (let py = 0; py < slot.height; py++) {
        for (let px = 0; px < slot.width; px++) {
          const c = intToRGBA(slot.getPixelColor(px, py));
          r += c.r; g += c.g; b += c.b; n++;
        }
      }
      r = Math.round(r/n); g = Math.round(g/n); b = Math.round(b/n);
      
      // Determine dominant color category
      let cat = '-';
      if (g > r && g > b && g > 70) cat = 'V'; // Vitality (green)
      else if (r > g && r > b && r > 100) cat = 'W'; // Weapon (orange/red)
      else if (b > g && (b > r * 0.8) && b > 70) cat = 'S'; // Spirit (purple/blue)
      
      row += cat;
      
      // Save samples that might be items
      if (cat !== '-') {
        await slot.write(`${outDir}/x${x}_y${y}_${cat}.png`);
      }
    }
    console.log(row);
  }
  
  console.log('\n--- Legend: W=Weapon(orange), V=Vitality(green), S=Spirit(purple), -=unknown ---');
  console.log('\nSaved detected item samples to', outDir);
}

main().catch(console.error);

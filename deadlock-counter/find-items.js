#!/usr/bin/env node
// Scan vertically to find actual item locations

const { Jimp, intToRGBA } = require('jimp');
const fs = require('fs');

async function main() {
  const screenshot = await Jimp.read('./data/reference/full_1080p.png');
  
  // Create output dir
  const outDir = './data/scan-results';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  // Sample at X=900 (middle of item area) at different Y positions
  const sampleX = 900;
  const slotSize = 25;
  
  console.log('Scanning Y positions to find colorful items...\n');
  
  for (let y = 200; y <= 400; y += 10) {
    const slot = screenshot.clone().crop({
      x: sampleX,
      y: y,
      w: slotSize,
      h: slotSize
    });
    
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    let maxR = 0, maxG = 0, maxB = 0;
    
    for (let py = 0; py < slot.height; py++) {
      for (let px = 0; px < slot.width; px++) {
        const c = intToRGBA(slot.getPixelColor(px, py));
        totalR += c.r;
        totalG += c.g;
        totalB += c.b;
        count++;
        maxR = Math.max(maxR, c.r);
        maxG = Math.max(maxG, c.g);
        maxB = Math.max(maxB, c.b);
      }
    }
    
    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);
    
    // Save interesting samples (high color saturation)
    const saturation = Math.max(maxR, maxG, maxB) - Math.min(avgR, avgG, avgB);
    const colorful = saturation > 50;
    
    const marker = colorful ? ' <<<' : '';
    console.log(`Y=${y}: avg(${avgR},${avgG},${avgB}) max(${maxR},${maxG},${maxB})${marker}`);
    
    if (colorful) {
      await slot.write(`${outDir}/y${y}.png`);
    }
  }
  
  // Also scan horizontally at a few Y positions
  console.log('\n--- Horizontal scan at Y=250 ---');
  for (let x = 800; x <= 1100; x += 20) {
    const slot = screenshot.clone().crop({ x, y: 250, w: 25, h: 25 });
    
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    for (let py = 0; py < slot.height; py++) {
      for (let px = 0; px < slot.width; px++) {
        const c = intToRGBA(slot.getPixelColor(px, py));
        totalR += c.r; totalG += c.g; totalB += c.b; count++;
      }
    }
    console.log(`X=${x}: avg(${Math.round(totalR/count)},${Math.round(totalG/count)},${Math.round(totalB/count)})`);
  }
  
  console.log('\n--- Horizontal scan at Y=300 ---');
  for (let x = 800; x <= 1100; x += 20) {
    const slot = screenshot.clone().crop({ x, y: 300, w: 25, h: 25 });
    
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    for (let py = 0; py < slot.height; py++) {
      for (let px = 0; px < slot.width; px++) {
        const c = intToRGBA(slot.getPixelColor(px, py));
        totalR += c.r; totalG += c.g; totalB += c.b; count++;
      }
    }
    console.log(`X=${x}: avg(${Math.round(totalR/count)},${Math.round(totalG/count)},${Math.round(totalB/count)})`);
  }
}

main().catch(console.error);

#!/usr/bin/env node
// Test smart detector

const { SmartDetector } = require('./src/vision/smart-detector');

async function main() {
  const detector = new SmartDetector();
  
  console.log('=== Smart Detector Test ===\n');
  
  // Full scan with template matching
  console.log('--- Full Scan ---');
  const results = await detector.scanScreenshot('./data/reference/full_1080p.png', {
    startX: 800,
    endX: 1120,
    startY: 240,
    endY: 390,
    slotSize: 22,
    stepSize: 24
  });
  
  console.log(`\nTotal items: ${results.items.length}`);
  console.log(`  Weapon: ${results.categoryCounts.weapon}`);
  console.log(`  Vitality: ${results.categoryCounts.vitality}`);
  console.log(`  Spirit: ${results.categoryCounts.spirit}`);
  
  console.log('\nIdentified items:');
  const identified = results.items.filter(i => !i.name.startsWith('Unknown'));
  for (const item of identified.slice(0, 15)) {
    console.log(`  ${item.name} (${item.category}) at (${item.position.x},${item.position.y}) - ${Math.round(item.confidence * 100)}%`);
  }
  
  if (identified.length > 15) {
    console.log(`  ... and ${identified.length - 15} more`);
  }
  
  // Quick category scan
  console.log('\n--- Quick Category Scan ---');
  const quick = await detector.quickScan('./data/reference/full_1080p.png', {
    startX: 800,
    endX: 1120,
    startY: 240,
    endY: 390
  });
  
  console.log(`Weapon: ${quick.weapon}, Vitality: ${quick.vitality}, Spirit: ${quick.spirit}`);
  console.log(`Total: ${quick.weapon + quick.vitality + quick.spirit}`);
}

main().catch(console.error);

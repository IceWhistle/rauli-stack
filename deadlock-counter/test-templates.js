#!/usr/bin/env node
// Test template matching on a screenshot

const { TemplateMatcher } = require('./src/vision/template-matcher');
const path = require('path');
const fs = require('fs');

async function main() {
  const matcher = new TemplateMatcher();
  
  // Load templates
  await matcher.loadTemplates();
  console.log(`Templates loaded: ${matcher.templates.size}`);
  
  // Find test screenshot (prefer full 1080p)
  const testImages = [
    './data/reference/full_1080p.png',
    './data/reference/tab_scoreboard_full.jpg',
    './data/reference/full_scoreboard.jpg'
  ];
  
  let testImage = null;
  for (const img of testImages) {
    if (fs.existsSync(img)) {
      testImage = img;
      break;
    }
  }
  
  if (!testImage) {
    console.log('\nNo test screenshot found. Place a TAB scoreboard screenshot at:');
    console.log('  ./data/reference/full_scoreboard.jpg');
    console.log('\nTesting template loading only...');
    
    // Show some template info
    console.log('\nSample templates:');
    let count = 0;
    for (const [name, data] of matcher.templates) {
      if (count++ >= 10) break;
      console.log(`  ${name} (${data.category}, T${data.tier}, ${data.cost} souls)`);
    }
    return;
  }
  
  console.log(`\nProcessing: ${testImage}`);
  
  // Full detection with template matching
  console.log('\n=== Full Template Matching ===');
  const results = await matcher.processScreenshot(testImage);
  
  console.log(`\nTotal items detected: ${results.totalItems}`);
  console.log(`  Weapon: ${results.categoryCounts.weapon}`);
  console.log(`  Vitality: ${results.categoryCounts.vitality}`);
  console.log(`  Spirit: ${results.categoryCounts.spirit}`);
  
  console.log('\nPer-player breakdown:');
  for (const player of results.players) {
    const itemNames = player.items.map(i => 
      `${i.name}${i.confidence ? ` (${Math.round(i.confidence * 100)}%)` : ''}`
    ).join(', ');
    
    console.log(`  Player ${player.index}: ${player.items.length} items`);
    console.log(`    W:${player.categoryCounts.weapon} V:${player.categoryCounts.vitality} S:${player.categoryCounts.spirit}`);
    if (player.items.length > 0) {
      console.log(`    Items: ${itemNames.substring(0, 100)}${itemNames.length > 100 ? '...' : ''}`);
    }
  }
  
  // Quick category-only detection
  console.log('\n=== Quick Category Detection ===');
  const quickResults = await matcher.detectCategoriesOnly(testImage);
  console.log(`Total: ${quickResults.totalItems} (W:${quickResults.categoryCounts.weapon} V:${quickResults.categoryCounts.vitality} S:${quickResults.categoryCounts.spirit})`);
}

main().catch(console.error);

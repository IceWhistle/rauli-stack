#!/usr/bin/env node
// Fetch all Deadlock shop items and their icons from the official API
// Downloads icons to data/icons/ and creates updated items.json

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://assets.deadlock-api.com/v2/items/by-type/upgrade';
const ICONS_DIR = path.join(__dirname, '../data/icons');
const ITEMS_FILE = path.join(__dirname, '../data/items-api.json');

// Ensure directories exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Fetch JSON from URL
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Sanitize filename
function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

async function main() {
  console.log('Fetching items from API...');
  const items = await fetchJson(API_URL);
  
  console.log(`Found ${items.length} items total`);
  
  // Filter to shopable items only
  const shopItems = items.filter(item => item.shopable === true);
  console.log(`${shopItems.length} shopable items`);
  
  // Process items
  const processed = {
    weapon: [],
    vitality: [],
    spirit: []
  };
  
  const itemsData = {};
  
  for (const item of shopItems) {
    const category = item.item_slot_type;
    if (!['weapon', 'vitality', 'spirit'].includes(category)) continue;
    
    const name = item.name;
    const filename = sanitizeFilename(name);
    const iconUrl = item.shop_image_small || item.shop_image;
    
    if (!iconUrl) {
      console.log(`  Skip ${name}: no icon`);
      continue;
    }
    
    // Determine extension
    const ext = iconUrl.includes('.webp') ? '.webp' : '.png';
    const iconPath = path.join(ICONS_DIR, category, `${filename}${ext}`);
    
    // Ensure category dir exists
    const catDir = path.join(ICONS_DIR, category);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
    
    // Download icon
    if (!fs.existsSync(iconPath)) {
      try {
        console.log(`  Downloading ${name}...`);
        await downloadFile(iconUrl, iconPath);
      } catch (err) {
        console.log(`  Failed to download ${name}: ${err.message}`);
        continue;
      }
    }
    
    // Add to processed data
    processed[category].push({
      name,
      filename,
      tier: item.item_tier,
      cost: item.cost,
      iconPath: `${category}/${filename}${ext}`
    });
    
    // Build items data for engine
    itemsData[name] = {
      category,
      tier: item.item_tier,
      cost: item.cost,
      tags: extractTags(item),
      counters: [],
      countered_by: []
    };
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Weapon items: ${processed.weapon.length}`);
  console.log(`Vitality items: ${processed.vitality.length}`);
  console.log(`Spirit items: ${processed.spirit.length}`);
  console.log(`Total: ${processed.weapon.length + processed.vitality.length + processed.spirit.length}`);
  
  // Save items data
  const output = {
    fetchedAt: new Date().toISOString(),
    items: itemsData,
    byCategory: processed
  };
  
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${ITEMS_FILE}`);
}

// Extract tags from item properties
function extractTags(item) {
  const tags = [];
  const props = item.properties || {};
  
  // Category-based tags
  if (item.item_slot_type === 'spirit') tags.push('spirit_damage');
  if (item.item_slot_type === 'weapon') tags.push('bullet_damage');
  if (item.item_slot_type === 'vitality') tags.push('health');
  
  // Property-based tags
  if (props.BonusHealth) tags.push('health');
  if (props.TechPower && props.TechPower.value !== '0') tags.push('spirit_damage');
  if (props.BulletArmorReduction) tags.push('bullet_armor_reduction');
  if (props.TechArmorReduction) tags.push('spirit_armor_reduction');
  if (props.LifeSteal || item.name.toLowerCase().includes('lifesteal')) tags.push('lifesteal');
  if (props.HealingReduction || item.name.toLowerCase().includes('anti-heal') || item.name.toLowerCase().includes('toxic')) tags.push('anti_heal');
  if (props.Silence || item.name.toLowerCase().includes('silence')) tags.push('silence');
  if (props.SlowPercent || item.name.toLowerCase().includes('slow')) tags.push('slow');
  if (props.StunDuration) tags.push('stun', 'cc');
  if (props.RootDuration) tags.push('root', 'cc');
  if (item.name.toLowerCase().includes('shield')) tags.push('shield');
  if (item.name.toLowerCase().includes('resist')) tags.push('defense');
  if (props.BulletResist) tags.push('bullet_defense');
  if (props.TechResist) tags.push('spirit_defense');
  
  return [...new Set(tags)];
}

main().catch(console.error);

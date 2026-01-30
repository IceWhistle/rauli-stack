// Main Deadlock Item Detector
// Exports unified detection interface

const { SmartDetector } = require('./vision/smart-detector');
const { TemplateMatcher, LAYOUT_1080P } = require('./vision/template-matcher');

class DeadlockDetector {
  constructor(options = {}) {
    this.smartDetector = new SmartDetector(options.iconsDir, options.manifestPath);
    this.templateMatcher = new TemplateMatcher(options.iconsDir, options.manifestPath);
  }

  // Full detection with template matching (slower, more accurate for known items)
  async detectItems(imagePath, options = {}) {
    return await this.smartDetector.scanScreenshot(imagePath, {
      startX: options.startX || 800,
      endX: options.endX || 1120,
      startY: options.startY || 240,
      endY: options.endY || 390,
      slotSize: options.slotSize || 22,
      stepSize: options.stepSize || 24
    });
  }

  // Quick category-only detection (faster)
  async detectCategories(imagePath, options = {}) {
    return await this.smartDetector.quickScan(imagePath, options);
  }

  // Grid-based detection using predefined layout (for standard scoreboard)
  async detectFromLayout(imagePath, layout = LAYOUT_1080P) {
    return await this.templateMatcher.processScreenshot(imagePath, layout);
  }

  // Load templates (call before detection for faster subsequent calls)
  async initialize() {
    await this.smartDetector.loadTemplates();
    await this.templateMatcher.loadTemplates();
  }
}

// Helper to format results for overlay
function formatForOverlay(results) {
  const enemies = [];
  
  // Group items by approximate X position (player columns)
  const columnWidth = 100;
  const columns = {};
  
  for (const item of results.items) {
    const col = Math.floor((item.position.x - 800) / columnWidth);
    if (!columns[col]) columns[col] = [];
    columns[col].push(item);
  }
  
  // Convert to enemy format
  for (let i = 0; i < 6; i++) {
    const items = columns[i] || [];
    enemies.push({
      hero: '',
      items: items.map(i => i.name).filter(n => !n.startsWith('Unknown'))
    });
  }
  
  return enemies;
}

module.exports = { DeadlockDetector, formatForOverlay };

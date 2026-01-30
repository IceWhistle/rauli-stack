const express = require('express');
const path = require('path');
const fs = require('fs');
const CounterEngine = require('./engine');
const { DeadlockDetector, formatForOverlay } = require('./detector');

const app = express();
const engine = new CounterEngine();
const detector = new DeadlockDetector();

// Pre-load templates
detector.initialize().catch(err => console.error('Failed to load detector:', err.message));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Get all items
app.get('/api/items', (req, res) => {
  res.json(engine.items);
});

// Get all heroes
app.get('/api/heroes', (req, res) => {
  res.json(Object.keys(engine.heroTags));
});

// Get recommendations based on enemy team
app.post('/api/recommend', (req, res) => {
  const { enemies, yourHero } = req.body;
  const results = engine.getRecommendations(enemies, yourHero);
  res.json(results);
});

// Quick counter lookup
app.get('/api/counter/:item', (req, res) => {
  const counters = engine.counterItem(req.params.item);
  res.json(counters);
});

// Detect items from screenshot
app.post('/api/detect', async (req, res) => {
  try {
    const { image, options } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Handle base64 image
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    
    // Save temp file
    const tempPath = path.join(__dirname, '../temp_screenshot.png');
    fs.writeFileSync(tempPath, imgBuffer);
    
    // Detect items
    const results = await detector.detectItems(tempPath, options || {});
    
    // Clean up
    fs.unlinkSync(tempPath);
    
    // Format for overlay
    const enemies = formatForOverlay(results);
    
    res.json({
      success: true,
      items: results.items,
      counts: results.categoryCounts,
      enemies,
      total: results.items.length
    });
  } catch (err) {
    console.error('Detection error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Quick category detection
app.post('/api/detect/quick', async (req, res) => {
  try {
    const { image, options } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    
    const tempPath = path.join(__dirname, '../temp_screenshot.png');
    fs.writeFileSync(tempPath, imgBuffer);
    
    const counts = await detector.detectCategories(tempPath, options || {});
    
    fs.unlinkSync(tempPath);
    
    res.json({
      success: true,
      counts,
      total: counts.weapon + counts.vitality + counts.spirit
    });
  } catch (err) {
    console.error('Quick detection error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3456;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Deadlock Counter running at http://0.0.0.0:${PORT}`);
});

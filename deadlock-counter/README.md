# Deadlock Counter-Item Overlay

Real-time item detection and counter-item recommendations for Deadlock.

## Features

- **170 Item Templates** - All current Deadlock items (Jan 2026 update)
- **Smart Detection** - Color-based + template matching
- **Counter Recommendations** - AI suggests builds based on enemy items
- **Overlay UI** - Compact display for in-game use

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3456`

## API Endpoints

### Detection

**POST /api/detect**
- Send base64 screenshot, get detected items + counter recommendations
- Body: `{ image: "base64...", options: { startX, endX, startY, endY } }`

**POST /api/detect/quick**
- Fast category-only detection (weapon/vitality/spirit counts)
- Body: same as above

### Recommendations

**POST /api/recommend**
- Get counter items for enemy builds
- Body: `{ enemies: [{ hero: "Infernus", items: ["item1", "item2"] }] }`

### Data

**GET /api/items** - All items
**GET /api/heroes** - All heroes
**GET /api/counter/:item** - Counters for specific item

## Files Structure

```
data/
  icons/           - 170 item icon templates
    weapon/        - 56 weapon items
    vitality/      - 59 vitality items  
    spirit/        - 55 spirit items
  icon-manifest.json  - Item name → icon mapping
  items-api.json      - Full item data from API
  items.json          - Counter/tag data for engine

src/
  detector.js         - Main detection interface
  engine.js           - Counter recommendation engine
  server.js           - Express API server
  vision/
    smart-detector.js    - Color + template matching
    template-matcher.js  - Grid-based template matching

public/
  overlay.html     - In-game overlay UI
  index.html       - Full web interface
```

## Detection Methods

1. **Smart Scan** - Scans screenshot area, detects items by color, identifies with templates
2. **Layout Grid** - Uses predefined positions for TAB scoreboard
3. **Quick Scan** - Fast color-only category detection

## Calibration

If detection isn't accurate:

1. Run `node calibrate-layout.js` to generate overlay image
2. Adjust coordinates in `src/vision/smart-detector.js`
3. Test with `node test-smart.js`

## Credits

Item data from [Deadlock API](https://assets.deadlock-api.com)

// Layout calibration for Deadlock scoreboard
// Based on analysis of reference screenshot

// 1920x1080 layout - enemy team on right side
const LAYOUT_1080P = {
  // Enemy team section (6 players on right)
  enemyTeam: {
    startX: 815,      // X where enemy cards start
    startY: 57,       // Y where first card row starts
    playerWidth: 94,  // Width of each player card
    playerGap: 3,     // Gap between cards
    playerCount: 6
  },
  // Item grid within each player card
  // Items appear below hero portrait and stats
  itemGrid: {
    offsetY: 160,     // Y offset from card top to first item row
    offsetX: 4,       // X offset from card left edge
    slotSize: 22,     // Size of each item slot (smaller than shop icons)
    gapX: 1,          // Horizontal gap between slots
    gapY: 1,          // Vertical gap between rows
    columns: 4,       // 4 items per row
    rows: 4           // 4 rows of items
  }
};

// Alternative layout for different scoreboard views
const LAYOUT_1080P_ALT = {
  enemyTeam: {
    startX: 810,
    startY: 55,
    playerWidth: 96,
    playerGap: 2,
    playerCount: 6
  },
  itemGrid: {
    offsetY: 155,
    offsetX: 3,
    slotSize: 23,
    gapX: 2,
    gapY: 2,
    columns: 4,
    rows: 4
  }
};

module.exports = { LAYOUT_1080P, LAYOUT_1080P_ALT };

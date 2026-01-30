const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, desktopCapturer, clipboard, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Import counter logic (separated for testability)
const { HEROES, getRecommendations, formatBuildForClipboard } = require('./counter-logic');

let mainWindow;
let tray = null;
let isVisible = true;

// Match history file path
const historyPath = path.join(app.getPath('userData'), 'match-history.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 700,
    minWidth: 380,
    minHeight: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Note: In production, should use contextIsolation: true with preload script
      // Acceptable for local-only desktop app with no external web content
    }
  });
  
  mainWindow.loadFile('overlay.html');
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  
  mainWindow.on('closed', () => { 
    mainWindow = null; 
  });
  
  mainWindow.on('hide', () => {
    isVisible = false;
    updateTrayMenu();
  });
  
  mainWindow.on('show', () => {
    isVisible = true;
    updateTrayMenu();
  });
}

function createTray() {
  // Create a simple tray icon (16x16 red square)
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAQklEQVQ4T2NkoBAwUqifYdQABhpo4P9/BvL9wEADL/z//5+RgRIvjIbBaCAMnkD4TyINUOwHYp2Ayg+MNIYBxRoAAPzPJBGKmb0SAAAAAElFTkSuQmCC');
  
  tray = new Tray(icon);
  tray.setToolTip('Deadlock Counter v4.0');
  updateTrayMenu();
  
  tray.on('click', () => {
    toggleWindow();
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: isVisible ? 'Hide Overlay' : 'Show Overlay', 
      click: () => toggleWindow() 
    },
    { type: 'separator' },
    { 
      label: 'Capture Screen (F1)', 
      click: () => captureScreen() 
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => app.quit() 
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function toggleWindow() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
}

async function captureScreen() {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    if (sources.length > 0) {
      const screenshot = sources[0].thumbnail;
      
      // Send to renderer for processing
      if (mainWindow) {
        mainWindow.webContents.send('screenshot-captured', screenshot.toDataURL());
      }
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    if (mainWindow) {
      mainWindow.webContents.send('screenshot-error', error.message);
    }
  }
}

// Load match history
function loadMatchHistory() {
  try {
    if (fs.existsSync(historyPath)) {
      const data = fs.readFileSync(historyPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load match history:', error);
  }
  return [];
}

// Save match history
function saveMatchHistory(history) {
  try {
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Failed to save match history:', error);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Global hotkey to toggle overlay
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    toggleWindow();
  });
  
  // F1 to capture screen
  globalShortcut.register('F1', () => {
    captureScreen();
  });
});

// IPC Handlers with input validation
ipcMain.handle('get-heroes', () => {
  return JSON.parse(JSON.stringify(HEROES));
});

ipcMain.handle('get-recommendations', (_event, heroes, myHero = null) => {
  try {
    return getRecommendations(heroes, myHero);
  } catch (_error) {
    return { recommendations: [], analysis: {}, tagCounts: {}, error: 'Processing failed' };
  }
});

ipcMain.handle('copy-build', (_event, recommendations, buildPaths, enemyHeroes) => {
  try {
    const text = formatBuildForClipboard(recommendations, buildPaths, enemyHeroes);
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-match', (_event, matchData) => {
  try {
    const history = loadMatchHistory();
    matchData.id = Date.now();
    matchData.timestamp = new Date().toISOString();
    history.unshift(matchData);
    // Keep last 50 matches
    if (history.length > 50) {
      history.length = 50;
    }
    saveMatchHistory(history);
    return { success: true, id: matchData.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-history', () => {
  return loadMatchHistory();
});

ipcMain.handle('delete-match', (_event, matchId) => {
  try {
    let history = loadMatchHistory();
    history = history.filter(m => m.id !== matchId);
    saveMatchHistory(history);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (tray) {
    tray.destroy();
  }
  app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

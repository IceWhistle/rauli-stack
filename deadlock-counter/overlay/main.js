const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let isVisible = true;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 320,
    height: 500,
    x: screenWidth - 340,  // Right side of screen
    y: 100,
    frame: false,          // No window frame
    transparent: true,     // Transparent background
    alwaysOnTop: true,     // Always on top
    skipTaskbar: true,     // Don't show in taskbar
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('overlay.html');
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  
  // Click-through when not focused (optional)
  // mainWindow.setIgnoreMouseEvents(true, { forward: true });
}

app.whenReady().then(() => {
  createWindow();
  
  // Toggle visibility with Ctrl+Shift+D
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (isVisible) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
    isVisible = !isVisible;
  });
  
  // Minimize with Ctrl+Shift+M
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    mainWindow.minimize();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for window controls
ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('minimize-app', () => {
  mainWindow.hide();
  isVisible = false;
});

ipcMain.on('set-opacity', (event, opacity) => {
  mainWindow.setOpacity(opacity);
});

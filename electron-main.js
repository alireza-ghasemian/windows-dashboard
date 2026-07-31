import { app, BrowserWindow, Tray, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { createRequire } from 'module';

// Prevent multiple instances of the application
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;
  let tray = null;
  let isQuitting = false;

  // Determine where to store user data (portable or standard AppData)
  const appDataPath = app.getPath('userData');
  const dataDir = path.join(appDataPath, 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Ensure we have a valid icon.png to prevent any Tray or Window initialization crashes
  const iconPath = path.join(app.getAppPath(), 'icon.png');
  if (!fs.existsSync(iconPath)) {
    // 1x1 transparent PNG fallback base64
    const fallbackBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    try {
      fs.writeFileSync(iconPath, Buffer.from(fallbackBase64, 'base64'));
      console.log('Created fallback icon.png successfully.');
    } catch (err) {
      console.error('Failed to create fallback icon.png:', err);
    }
  }

  async function startBackendServer() {
    const serverPath = path.join(app.getAppPath(), 'dist', 'server.cjs');
    
    console.log('Loading Express server directly in main process from:', serverPath);
    console.log('User data directory configured at:', dataDir);

    // Set environment variables before loading the server
    process.env.NODE_ENV = 'production';
    process.env.DATA_DIR = dataDir;
    process.env.STATIC_DIR = path.join(app.getAppPath(), 'dist');
    process.env.PORT = '3000';

    try {
      // Use createRequire to bypass Node's ESM lack of ASAR support.
      // Electron monkey-patches require() to fully support reading and executing files inside .asar
      const requireInstance = createRequire(import.meta.url);
      requireInstance(serverPath);
      console.log('Express server started successfully within the main process using require().');
    } catch (error) {
      console.error('Failed to start Express server via require() in main process:', error);
      try {
        console.log('Attempting fallback to dynamic import...');
        // Convert standard filesystem path to a valid file:// URL across all operating systems
        const serverUrl = pathToFileURL(serverPath).href;
        // Dynamically import the bundled server directly inside the main process
        await import(serverUrl);
        console.log('Express server started successfully within the main process using dynamic import.');
      } catch (importError) {
        console.error('Failed fallback dynamic import of Express server:', importError);
      }
    }
  }

  function createWindow() {
    const currentIconPath = fs.existsSync(iconPath) ? iconPath : undefined;

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 960,
      minHeight: 600,
      title: 'Personal Productivity Ecosystem',
      backgroundColor: '#0a051d', // Matching the beautiful twilight dark theme
      autoHideMenuBar: true, // Hides menu bar (press Alt to show if needed)
      icon: currentIconPath,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Completely remove the default menu bar (for production clean look)
    mainWindow.setMenu(null);

    // Load the local server
    mainWindow.loadURL('http://localhost:3000');

    // Handle potential load failures (e.g. if the server is still booting up)
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      if (validatedURL.startsWith('http://localhost:3000')) {
        console.log(`Failed to load ${validatedURL}. Error: ${errorDescription} (${errorCode}). Retrying in 1 second...`);
        setTimeout(() => {
          if (mainWindow) {
            mainWindow.loadURL('http://localhost:3000');
          }
        }, 1000);
      }
    });

    // Intercept window close event to hide it to the system tray
    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  function createTray() {
    const currentIconPath = fs.existsSync(iconPath) ? iconPath : undefined;
    if (!currentIconPath) return;

    tray = new Tray(currentIconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Personal Productivity Ecosystem');
    tray.setContextMenu(contextMenu);

    // Single-click on the tray icon to toggle show/hide
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    // Double-click on the tray icon to show the app
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }

  // Handle second instance startup
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    await startBackendServer();
    createTray();

    // Wait a short duration to ensure server is ready
    setTimeout(() => {
      createWindow();
    }, 1000);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // On Windows/Linux, do nothing here since the app lives in the Tray!
      // The app will only quit if explicitely requested from the Tray menu.
    }
  });
}

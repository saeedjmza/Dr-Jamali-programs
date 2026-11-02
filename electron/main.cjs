const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '..', 'build', 'icon.ico')
    : path.join(__dirname, '..', 'build', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    icon: iconPath,
    title: 'محاسبه‌گر زمان خودایستایی تونل (RMR - Bieniawski 1989)',
    backgroundColor: '#020617', // slate-950
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: isDev, // Completely disable DevTools in packaged production builds
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Custom application menu
  const isMac = process.platform === 'darwin';

  const viewSubmenu = [
    { label: 'بزرگنمایی (Zoom In)', role: 'zoomIn' },
    { label: 'کوچک‌نمایی (Zoom Out)', role: 'zoomOut' },
    { label: 'اندازه واقعی (Reset Zoom)', role: 'resetZoom' },
    { type: 'separator' },
    { label: 'تمام صفحه (Full Screen)', role: 'togglefullscreen' },
  ];

  // Only include developer tools during local development, never for end users
  if (isDev) {
    viewSubmenu.push(
      { type: 'separator' },
      { label: 'ابزار توسعه‌دهندگان (DevTools)', role: 'toggleDevTools' }
    );
  }

  const template = [
    {
      label: 'برنامه (App)',
      submenu: [
        { label: 'درباره نرم‌افزار', role: 'about' },
        { type: 'separator' },
        { label: 'خروج (Exit)', role: isMac ? 'close' : 'quit' },
      ],
    },
    {
      label: 'نما (View)',
      submenu: viewSubmenu,
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // In production, block DevTools keyboard shortcuts (F12, Ctrl+Shift+I, etc.)
  if (!isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (
        (input.control && input.shift && input.key.toLowerCase() === 'i') ||
        (input.meta && input.alt && input.key.toLowerCase() === 'i') ||
        input.key === 'F12'
      ) {
        event.preventDefault();
      }
    });

    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  // In production, load the built dist/index.html
  // In development mode, load local server if available
  const devUrl = 'http://localhost:3000';
  const prodIndex = path.join(__dirname, '..', 'dist', 'index.html');

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev && !require('fs').existsSync(prodIndex)) {
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow.loadFile(prodIndex);
    });
  } else {
    mainWindow.loadFile(prodIndex);
  }

  // Open target="_blank" links in external default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

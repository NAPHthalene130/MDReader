const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { FileStore } = require('./file-store');

let mainWindow = null;
let fileStore = null;

function resolveCoreBundlePath() {
  const candidates = [
    // Development build output from the shared core package.
    path.join(__dirname, '..', '..', 'core', 'dist', 'core-bundle.js'),
    // Packaged Electron app extraResources output.
    process.resourcesPath ? path.join(process.resourcesPath, 'core-bundle', 'core-bundle.js') : null,
    // Repository fallback so Windows can still render Markdown before core is built.
    path.join(__dirname, '..', '..', 'android', 'app', 'src', 'main', 'assets', 'core-bundle.js'),
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function createWindow() {
  const userDataPath = app.getPath('userData');
  fileStore = new FileStore(path.join(userDataPath, 'recent-files.json'));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'MDReader',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Provide core-bundle.js to renderer via IPC (avoids path issues in packaged app)
ipcMain.handle('core:getBundle', async () => {
  const bundlePath = resolveCoreBundlePath();
  if (!bundlePath) {
    console.error('MDReader: core-bundle.js not found in any known location');
    return null;
  }
  try {
    return fs.readFileSync(bundlePath, 'utf-8');
  } catch (err) {
    console.error('MDReader: Failed to read core bundle:', err);
    return null;
  }
});

// IPC Handlers

ipcMain.handle('dialog:openFile', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Markdown File',
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const fileName = path.basename(filePath);

  fileStore.addFile(filePath, fileName);

  return { filePath, fileName };
});

ipcMain.handle('file:read', async (_event, filePath) => {
  if (!filePath) return { success: false, error: '无效的文件路径' };
  try {
    const stats = fs.statSync(filePath);
    const MAX_SIZE = 50 * 1024 * 1024;
    if (stats.size > MAX_SIZE) {
      return { success: false, error: `文件过大 (${(stats.size / 1024 / 1024).toFixed(1)} MB)，最大支持 50 MB` };
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('file:getList', async () => {
  return fileStore.getFiles();
});

ipcMain.handle('file:remove', async (_event, filePath) => {
  fileStore.removeFile(filePath);
  return fileStore.getFiles();
});

ipcMain.handle('file:getStats', async (_event, filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
    };
  } catch {
    return null;
  }
});

ipcMain.handle('export:pdf', async (_event, baseName) => {
  if (!mainWindow) return { success: false, error: '窗口未就绪' };
  const safeBaseName = (typeof baseName === 'string' && baseName.trim()) ? baseName.trim() : 'export';
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出为 PDF',
    defaultPath: `${safeBaseName}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  const destPath = result.filePath;
  try {
    const pdfBuffer = await mainWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      marginsType: 0,
    });
    await fs.promises.writeFile(destPath, pdfBuffer);
    return { success: true, path: destPath };
  } catch (err) {
    try {
      if (fs.existsSync(destPath)) {
        await fs.promises.unlink(destPath);
      }
    } catch {
      // Ignore cleanup errors; the primary error is what matters
    }
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

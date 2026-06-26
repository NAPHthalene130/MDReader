const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  getFileList: () => ipcRenderer.invoke('file:getList'),
  removeFile: (filePath) => ipcRenderer.invoke('file:remove', filePath),
  getFileStats: (filePath) => ipcRenderer.invoke('file:getStats', filePath),
  getCoreBundle: () => ipcRenderer.invoke('core:getBundle'),
  getMermaidBundle: () => ipcRenderer.invoke('asset:getMermaidBundle'),
  exportPdf: (baseName) => ipcRenderer.invoke('export:pdf', baseName),
  exportImage: (baseName, format, html) => ipcRenderer.invoke('export:image', baseName, format, html),
});

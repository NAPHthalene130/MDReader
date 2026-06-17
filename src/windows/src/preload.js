const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  getFileList: () => ipcRenderer.invoke('file:getList'),
  removeFile: (filePath) => ipcRenderer.invoke('file:remove', filePath),
  getFileStats: (filePath) => ipcRenderer.invoke('file:getStats', filePath),
});

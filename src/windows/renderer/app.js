// app.js - Navigation and app shell
(function () {
  const fileManagerPage = document.getElementById('file-manager-page');
  const viewerPage = document.getElementById('viewer-page');

  window.App = {
    showFileManager() {
      fileManagerPage.classList.add('active');
      viewerPage.classList.remove('active');
      if (window.FileManager) {
        window.FileManager.load();
      }
    },

    showViewer(filePath, fileName) {
      fileManagerPage.classList.remove('active');
      viewerPage.classList.add('active');
      if (window.Viewer) {
        window.Viewer.openFile(filePath, fileName);
      }
    },
  };

  // Initialize file manager
  document.addEventListener('DOMContentLoaded', () => {
    if (window.FileManager) {
      window.FileManager.init();
    }
    if (window.Viewer) {
      window.Viewer.init();
    }
  });
})();

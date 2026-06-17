// app.js - Navigation, core bundle loader, and app shell
(function () {
  const fileManagerPage = document.getElementById('file-manager-page');
  const viewerPage = document.getElementById('viewer-page');

  if (!fileManagerPage || !viewerPage) {
    console.error('MDReader: Required DOM elements not found');
    return;
  }

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

  // Load core bundle and initialize
  async function init() {
    // Load core-bundle.js via IPC (avoids relative path issues in packaged app)
    if (window.electronAPI && window.electronAPI.getCoreBundle) {
      try {
        const bundleScript = await window.electronAPI.getCoreBundle();
        if (bundleScript) {
          const scriptEl = document.createElement('script');
          scriptEl.textContent = bundleScript;
          document.head.appendChild(scriptEl);
        }
      } catch (e) {
        console.error('MDReader: Failed to load core bundle', e);
      }
    }

    // Init modules when ready
    if (window.FileManager) {
      window.FileManager.init();
    }
    if (window.Viewer) {
      window.Viewer.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

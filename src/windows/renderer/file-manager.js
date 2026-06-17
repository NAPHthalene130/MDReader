// file-manager.js - 文件管理页面
(function () {
  const container = document.getElementById('file-manager-page');
  if (!container) return;
  let contentEl = null;

  function formatDate(isoString) {
    const d = new Date(isoString);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  function renderFileList(files) {
    if (!contentEl) return;

    if (files.length === 0) {
      contentEl.innerHTML = `
        <div class="fm-header">
          <h1>📖 MDReader</h1>
          <p>Markdown 阅读器</p>
        </div>
        <div class="fm-empty">
          <div class="fm-empty-icon">📂</div>
          <h2>暂无文件</h2>
          <p>点击右下角 + 按钮添加 Markdown 文件开始阅读</p>
        </div>`;
      return;
    }

    let html = `<div class="fm-header"><h1>📖 MDReader</h1><p>最近阅读</p></div><div class="fm-list">`;
    for (const file of files) {
      html += `
        <div class="fm-card" data-path="${escapeHtml(file.path)}">
          <div class="fm-card-body">
            <div class="fm-card-icon">📄</div>
            <div class="fm-card-info">
              <div class="fm-card-name">${escapeHtml(file.name)}</div>
              <div class="fm-card-meta">
                <span>${escapeHtml(file.path)}</span>
                <span>${formatDate(file.openedAt)}</span>
              </div>
            </div>
            <button class="fm-card-close" title="从列表中移除">✕</button>
          </div>
        </div>`;
    }
    html += '</div>';
    contentEl.innerHTML = html;

    contentEl.querySelectorAll('.fm-card-body').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.fm-card-close')) return;
        const path = el.closest('.fm-card').dataset.path;
        const nameEl = el.querySelector('.fm-card-name');
        const name = nameEl ? nameEl.textContent : '';
        window.App.showViewer(path, name);
      });
    });

    contentEl.querySelectorAll('.fm-card-close').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const path = btn.closest('.fm-card').dataset.path;
          await window.electronAPI.removeFile(path);
        } catch (err) {
          console.error('Failed to remove file:', err);
        }
        load();
      });
    });
  }

  async function load() {
    if (!window.electronAPI) {
      contentEl.innerHTML = '<div class="fm-empty"><div class="fm-empty-icon">⚠️</div><h2>Electron 环境未就绪</h2></div>';
      return;
    }
    try {
      const files = await window.electronAPI.getFileList();
      renderFileList(files);
    } catch (err) {
      console.error('Failed to load file list:', err);
      renderFileList([]);
    }
  }

  async function addFile() {
    if (!window.electronAPI) return;
    try {
      const result = await window.electronAPI.openFileDialog();
      if (result) load();
    } catch (err) {
      console.error('Failed to open file dialog:', err);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  window.FileManager = {
    init() {
      const style = document.createElement('style');
      style.textContent = `
        .fm-content { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .fm-header { padding: 28px 24px 16px; text-align: center; flex-shrink: 0; }
        .fm-header h1 { font-size: 24px; font-weight: 700; color: #0366d6; margin: 0; }
        .fm-header p { font-size: 13px; color: #8b949e; margin: 4px 0 0; }
        .fm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; color: #8b949e; }
        .fm-empty-icon { font-size: 72px; margin-bottom: 16px; opacity: 0.5; }
        .fm-empty h2 { font-size: 20px; color: #1a1a2e; margin-bottom: 8px; }
        .fm-empty p { font-size: 14px; }
        .fm-list { flex: 1; overflow-y: auto; padding: 0 24px 100px; }
        .fm-card { background: #fff; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: box-shadow 0.2s, transform 0.15s; cursor: pointer; }
        .fm-card:hover { box-shadow: 0 4px 16px rgba(3,102,214,0.12); transform: translateY(-1px); }
        .fm-card-body { display: flex; align-items: center; padding: 16px 20px; }
        .fm-card-icon { font-size: 28px; margin-right: 14px; flex-shrink: 0; }
        .fm-card-info { flex: 1; min-width: 0; }
        .fm-card-name { font-size: 15px; font-weight: 600; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        .fm-card-meta { display: flex; gap: 16px; font-size: 12px; color: #8b949e; flex-wrap: wrap; }
        .fm-card-meta span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }
        .fm-card-close { background: none; border: none; color: #d1d5db; font-size: 18px; cursor: pointer; padding: 6px 10px; border-radius: 6px; flex-shrink: 0; transition: color 0.15s, background 0.15s; margin-left: 8px; }
        .fm-card-close:hover { color: #ef4444; background: #fef2f2; }
        .fm-fab { position: fixed; bottom: 28px; right: 28px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #0366d6, #0550ae); color: #fff; border: none; font-size: 30px; cursor: pointer; box-shadow: 0 6px 20px rgba(3,102,214,0.35); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; z-index: 100; line-height: 1; }
        .fm-fab:hover { transform: scale(1.08); box-shadow: 0 8px 28px rgba(3,102,214,0.45); }
        .fm-fab:active { transform: scale(0.95); }
      `;
      document.head.appendChild(style);

      // Create content area (separate from FAB to prevent innerHTML wipe)
      contentEl = document.createElement('div');
      contentEl.className = 'fm-content';
      container.appendChild(contentEl);

      // FAB - positioned fixed, appended to container but outside content area
      const fab = document.createElement('button');
      fab.className = 'fm-fab';
      fab.textContent = '+';
      fab.title = '添加 Markdown 文件';
      fab.addEventListener('click', addFile);
      container.appendChild(fab);

      load();
    },
    load,
  };
})();

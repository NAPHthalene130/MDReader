// viewer.js - Markdown 查看页面
(function () {
  const container = document.getElementById('viewer-page');
  if (!container) return;

  function init() {
    const style = document.createElement('style');
    style.textContent = `
      .v-layout { display: flex; height: 100%; }
      .v-toc { width: 260px; min-width: 260px; background: #fff; border-right: 1px solid #e5e7eb; overflow-y: auto; padding: 20px 16px; transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
      .v-toc.hidden { margin-left: -260px; }
      .v-toc-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #0366d6; display: flex; align-items: center; gap: 8px; }
      .v-toc-list { list-style: none; padding: 0; margin: 0; }
      .v-toc-list .v-toc-list { padding-left: 16px; }
      .v-toc-item { margin-bottom: 2px; }
      .v-toc-link { display: block; padding: 6px 10px; font-size: 13px; color: #4b5563; text-decoration: none; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background 0.15s, color 0.15s; }
      .v-toc-link:hover { background: #f0f5ff; color: #0366d6; }
      .v-toc-link.active { background: #0366d6; color: #fff; font-weight: 600; }
      .v-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
      .v-toolbar { display: flex; align-items: center; padding: 10px 20px; background: #fff; border-bottom: 1px solid #e5e7eb; gap: 12px; }
      .v-btn { padding: 7px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px solid #d1d5db; background: #fff; color: #374151; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
      .v-btn:hover { background: #f9fafb; border-color: #9ca3af; }
      .v-btn-back { font-weight: 600; }
      .v-filename { font-size: 14px; font-weight: 600; color: #1a1a2e; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .v-webview { flex: 1; border: none; background: #fff; }
      .v-error { display: flex; align-items: center; justify-content: center; height: 100%; color: #ef4444; font-size: 15px; flex-direction: column; gap: 8px; }
      .v-error-icon { font-size: 48px; opacity: 0.6; }
    `;
    document.head.appendChild(style);
  }

  async function openFile(filePath, fileName) {
    if (!filePath || typeof filePath !== 'string') {
      container.innerHTML = `<div class="v-error"><div class="v-error-icon">⚠️</div><div>无效的文件路径</div></div>`;
      return;
    }
    if (!window.electronAPI) {
      container.innerHTML = `<div class="v-error"><div class="v-error-icon">⚠️</div><div>Electron 环境未就绪</div></div>`;
      return;
    }
    const result = await window.electronAPI.readFile(filePath);

    if (!result.success) {
      container.innerHTML = `<div class="v-error"><div class="v-error-icon">⚠️</div><div>读取文件失败：${escapeHtml(result.error)}</div></div>`;
      return;
    }

    let html;
    if (window.MDReaderCore && window.MDReaderCore.renderToHtml) {
      html = window.MDReaderCore.renderToHtml(result.content, {
        includeKatexCss: true,
        includeHighlightCss: true,
        includeBaseCss: true,
      });
    } else {
      html = `<html><body style="font-family:'Microsoft YaHei',sans-serif;padding:24px"><pre>${escapeHtml(result.content)}</pre></body></html>`;
    }

    let tocEntries = [];
    if (window.MDReaderCore && window.MDReaderCore.getTokenStream && window.MDReaderCore.extractToc) {
      try {
        const tokenStream = window.MDReaderCore.getTokenStream(result.content);
        tocEntries = window.MDReaderCore.extractToc(tokenStream);
      } catch(e) {
        tocEntries = extractHeadingsFromRaw(result.content);
      }
    } else {
      tocEntries = extractHeadingsFromRaw(result.content);
    }

    renderViewer(fileName, html, tocEntries);
  }

  function extractHeadingsFromRaw(md) {
    const entries = [];
    const lines = md.split('\n');
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[#*`~_\[\]()]/g, '').trim();
        const anchor = text.toLowerCase().replace(/[^\w\u4e00-\u9fff-]+/g, '-').replace(/^-+|-+$/g, '');
        entries.push({ level, text, anchor, children: [] });
      }
    }
    return entries;
  }

  function renderViewer(fileName, html, tocEntries) {
    container.innerHTML = `
      <div class="v-layout">
        <div class="v-toc" id="v-toc">
          <div class="v-toc-title">📑 目录</div>
          <div id="toc-content">${renderToc(tocEntries)}</div>
        </div>
        <div class="v-main">
          <div class="v-toolbar">
            <button class="v-btn v-btn-back" id="v-back">← 返回</button>
            <span class="v-filename">${escapeHtml(fileName)}</span>
            <button class="v-btn" id="v-toc-toggle">☰ 目录</button>
          </div>
          <iframe class="v-webview" id="v-frame" sandbox="allow-scripts"></iframe>
        </div>
      </div>`;

    const frame = document.getElementById('v-frame');
    frame.srcdoc = html;

    document.getElementById('v-back').addEventListener('click', () => {
      window.App.showFileManager();
    });

    let tocVisible = true;
    document.getElementById('v-toc-toggle').addEventListener('click', () => {
      tocVisible = !tocVisible;
      document.getElementById('v-toc').classList.toggle('hidden', !tocVisible);
    });

    container.querySelectorAll('.v-toc-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const anchor = link.dataset.anchor;
        const frame = document.getElementById('v-frame');
        if (frame) {
          try { frame.contentWindow.location.hash = anchor; } catch {}
        }
      });
    });
  }

  function renderToc(entries) {
    if (!entries || entries.length === 0) {
      return '<p style="color:#9ca3af;font-size:13px;text-align:center;padding:20px 0;">暂无标题</p>';
    }
    let html = '<ul class="v-toc-list">';
    for (const entry of entries) {
      html += `<li class="v-toc-item">`;
      html += `<a href="#${entry.anchor}" class="v-toc-link" data-anchor="${entry.anchor}">${escapeHtml(entry.text)}</a>`;
      if (entry.children && entry.children.length > 0) {
        html += renderToc(entry.children);
      }
      html += `</li>`;
    }
    html += '</ul>';
    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  window.Viewer = { init, openFile };
})();

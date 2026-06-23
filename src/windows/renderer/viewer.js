// viewer.js - Markdown 查看页面
(function () {
  const container = document.getElementById('viewer-page');
  if (!container) return;
  let mermaidLoadPromise = null;
  let currentRenderToken = 0;

  function init() {
    ensureStaticAssets();

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
      .v-content { flex: 1; overflow: auto; background: #fff; }
      .v-doc { min-height: 100%; padding: 20px 24px 48px; }
      .v-doc-body {
        font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.8;
        color: #1a1a2e;
        max-width: 860px;
        margin: 0 auto;
        word-wrap: break-word;
      }
      .v-doc-body h1, .v-doc-body h2, .v-doc-body h3, .v-doc-body h4, .v-doc-body h5, .v-doc-body h6 { margin-top: 32px; margin-bottom: 16px; font-weight: 700; line-height: 1.3; }
      .v-doc-body h1 { font-size: 2em; border-bottom: 2px solid #0366d6; padding-bottom: 12px; }
      .v-doc-body h2 { font-size: 1.5em; border-bottom: 1px solid #e1e4e8; padding-bottom: 8px; }
      .v-doc-body h3 { font-size: 1.25em; color: #0366d6; }
      .v-doc-body h4 { font-size: 1.05em; }
      .v-doc-body p { margin-bottom: 16px; }
      .v-doc-body a { color: #0366d6; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
      .v-doc-body a:hover { border-bottom-color: #0366d6; }
      .v-doc-body code { background: #f0f2f5; border-radius: 4px; font-family: "Cascadia Code", "Fira Code", "SF Mono", Consolas, monospace; font-size: 85%; padding: 2px 6px; }
      .v-doc-body pre { background: #1e1e2e; color: #cdd6f4; border-radius: 12px; padding: 20px; overflow-x: auto; margin: 20px 0; }
      .v-doc-body pre code { background: none; padding: 0; font-size: 14px; color: inherit; }
      .v-doc-body blockquote { border-left: 4px solid #0366d6; background: #f0f5ff; color: #1a1a2e; padding: 12px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
      .v-doc-body table { border-collapse: collapse; width: 100%; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
      .v-doc-body table th, .v-doc-body table td { border: 1px solid #e1e4e8; padding: 10px 16px; text-align: left; }
      .v-doc-body table th { background: #f0f5ff; font-weight: 700; color: #0366d6; }
      .v-doc-body table tr:nth-child(even) td { background: #f8f9fa; }
      .v-doc-body img { max-width: 100%; border-radius: 8px; }
      .v-doc-body ul, .v-doc-body ol { padding-left: 2em; margin-bottom: 16px; }
      .v-doc-body li { margin-bottom: 6px; }
      .v-doc-body hr { border: none; border-top: 2px solid #e1e4e8; margin: 32px 0; }
      .v-doc-body .contains-task-list { list-style: none; padding-left: 0.4em; }
      .v-doc-body .task-list-item { display: flex; align-items: flex-start; gap: 8px; }
      .v-doc-body .task-list-item + .task-list-item { margin-top: 6px; }
      .v-doc-body .task-list-item-checkbox { margin-top: 0.35em; }
      .v-doc-body .math-block { display: block; text-align: center; padding: 20px 0; overflow-x: auto; }
      .v-doc-body .math-inline { display: inline; }
      .v-doc-body .mermaid-container { margin: 20px 0; text-align: center; overflow-x: auto; background: #f8f9fa; border-radius: 12px; padding: 16px; }
      .v-doc-body .mermaid-error { color: #d73a49; background: #ffeef0; padding: 12px 16px; border-radius: 8px; border: 1px solid #d73a49; font-family: monospace; white-space: pre-wrap; }
      .v-doc-body .katex-error { color: #d73a49; }
      .v-error { display: flex; align-items: center; justify-content: center; height: 100%; color: #ef4444; font-size: 15px; flex-direction: column; gap: 8px; }
      .v-error-icon { font-size: 48px; opacity: 0.6; }
    `;
    document.head.appendChild(style);
  }

  function ensureStaticAssets() {
    ensureStylesheet('v-katex-css', 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
    ensureStylesheet('v-highlight-css', 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css');
  }

  function ensureStylesheet(id, href) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureMermaidScript() {
    if (window.mermaid) {
      return Promise.resolve(window.mermaid);
    }
    if (mermaidLoadPromise) {
      return mermaidLoadPromise;
    }

    mermaidLoadPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById('v-mermaid-script');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.mermaid), { once: true });
        existing.addEventListener('error', () => reject(new Error('Mermaid script load failed')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'v-mermaid-script';
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';
      script.onload = () => resolve(window.mermaid);
      script.onerror = () => {
        mermaidLoadPromise = null;
        reject(new Error('Mermaid script load failed'));
      };
      document.head.appendChild(script);
    });

    return mermaidLoadPromise;
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

    let bodyHtml;
    if (window.MDReaderCore && window.MDReaderCore.renderBodyOnly) {
      bodyHtml = window.MDReaderCore.renderBodyOnly(result.content);
    } else {
      bodyHtml = `<pre>${escapeHtml(result.content)}</pre>`;
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

    await renderViewer(fileName, bodyHtml, tocEntries);
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

  async function renderViewer(fileName, bodyHtml, tocEntries) {
    const renderToken = ++currentRenderToken;
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
          <div class="v-content" id="v-content">
            <div class="v-doc">
              <div class="v-doc-body" id="v-doc-body">${bodyHtml}</div>
            </div>
          </div>
        </div>
      </div>`;
    const contentEl = document.getElementById('v-content');
    const docBodyEl = document.getElementById('v-doc-body');
    assignHeadingIds(docBodyEl, tocEntries);
    await renderMermaid(docBodyEl, renderToken);

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
        const target = docBodyEl.querySelector(`#${escapeSelector(anchor)}`);
        if (target && contentEl) {
          const contentRect = contentEl.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const targetTop = contentEl.scrollTop + targetRect.top - contentRect.top - 20;
          contentEl.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
      });
    });
  }

  async function renderMermaid(root, renderToken) {
    if (!root) return;

    const placeholders = root.querySelectorAll('.mermaid-placeholder');
    if (placeholders.length === 0) return;

    try {
      const mermaid = await ensureMermaidScript();
      if (renderToken !== currentRenderToken || !mermaid) return;

      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
      for (const placeholder of placeholders) {
        const code = decodeURIComponent(placeholder.getAttribute('data-mermaid-code') || '');
        if (!code) {
          placeholder.innerHTML = '<pre class="mermaid-error">Mermaid source is empty</pre>';
          continue;
        }

        try {
          const svgId = (placeholder.id || `mermaid-${Date.now()}`) + '-svg';
          const result = await mermaid.render(svgId, code);
          if (renderToken !== currentRenderToken) return;
          placeholder.innerHTML = result.svg;
          placeholder.classList.add('mermaid-container');

          // Clean up any lingering elements Mermaid might have appended to the body
          ['', 'd', 'i'].forEach(prefix => {
            const el = document.getElementById(prefix + svgId);
            if (el && el.parentNode === document.body) {
              el.remove();
            }
          });
        } catch (err) {
          placeholder.innerHTML = `<pre class="mermaid-error">${escapeHtml(err && err.message ? err.message : 'Mermaid parse error')}</pre>`;
        }
      }
    } catch {
      placeholders.forEach((placeholder) => {
        placeholder.innerHTML = '<pre class="mermaid-error">Mermaid 加载失败</pre>';
      });
    }
  }

  function assignHeadingIds(root, tocEntries) {
    if (!root) return;

    const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const flatEntries = flattenToc(tocEntries);
    if (headings.length === 0) return;

    if (flatEntries.length === headings.length) {
      headings.forEach((heading, index) => {
        if (flatEntries[index] && flatEntries[index].anchor) {
          heading.id = flatEntries[index].anchor;
        }
      });
      return;
    }

    const used = new Map();
    headings.forEach((heading) => {
      const base = slugify(heading.textContent || '') || 'heading';
      const count = used.get(base) || 0;
      heading.id = count === 0 ? base : `${base}-${count}`;
      used.set(base, count + 1);
    });
  }

  function flattenToc(entries) {
    const flat = [];
    for (const entry of entries || []) {
      flat.push(entry);
      if (entry.children && entry.children.length > 0) {
        flat.push(...flattenToc(entry.children));
      }
    }
    return flat;
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf-]+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return String(value || '').replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
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

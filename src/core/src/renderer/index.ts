import { parseMarkdown } from '../parser';

interface RenderOptions {
  includeKatexCss?: boolean;
  includeHighlightCss?: boolean;
  includeBaseCss?: boolean;
}

const BASE_CSS = `
* { box-sizing: border-box; }
body {
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.8;
  color: #1a1a2e;
  padding: 24px 32px;
  max-width: 860px;
  margin: 0 auto;
  background: #fff;
}
h1, h2, h3, h4, h5, h6 { margin-top: 32px; margin-bottom: 16px; font-weight: 700; line-height: 1.3; }
h1 { font-size: 2em; border-bottom: 2px solid #0366d6; padding-bottom: 12px; }
h2 { font-size: 1.5em; border-bottom: 1px solid #e1e4e8; padding-bottom: 8px; }
h3 { font-size: 1.25em; color: #0366d6; }
h4 { font-size: 1.05em; }
p { margin-bottom: 16px; }
a { color: #0366d6; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
a:hover { border-bottom-color: #0366d6; }
code { background: #f0f2f5; border-radius: 4px; font-family: "Cascadia Code", "Fira Code", "SF Mono", Consolas, monospace; font-size: 85%; padding: 2px 6px; }
pre { background: #1e1e2e; color: #cdd6f4; border-radius: 12px; padding: 20px; overflow-x: auto; margin: 20px 0; }
pre code { background: none; padding: 0; font-size: 14px; color: inherit; }
blockquote { border-left: 4px solid #0366d6; background: #f0f5ff; color: #1a1a2e; padding: 12px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
table { border-collapse: collapse; width: 100%; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
table th, table td { border: 1px solid #e1e4e8; padding: 10px 16px; text-align: left; }
table th { background: #f0f5ff; font-weight: 700; color: #0366d6; }
table tr:nth-child(even) td { background: #f8f9fa; }
img { max-width: 100%; border-radius: 8px; }
ul, ol { padding-left: 2em; margin-bottom: 16px; }
li { margin-bottom: 6px; }
hr { border: none; border-top: 2px solid #e1e4e8; margin: 32px 0; }
.math-block { display: block; text-align: center; padding: 20px 0; overflow-x: auto; }
.math-inline { display: inline; }
.mermaid-container { margin: 20px 0; text-align: center; overflow-x: auto; background: #f8f9fa; border-radius: 12px; padding: 16px; }
.mermaid-error { color: #d73a49; background: #ffeef0; padding: 12px 16px; border-radius: 8px; border: 1px solid #d73a49; font-family: monospace; white-space: pre-wrap; }
.katex-error { color: #d73a49; }
`;

export function renderToHtml(markdown: string, options: RenderOptions = {}): string {
  const {
    includeKatexCss = true,
    includeHighlightCss = true,
    includeBaseCss = true,
  } = options;

  const body = parseMarkdown(markdown);

  const parts: string[] = ['<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'];

  if (includeBaseCss) {
    parts.push(`<style>${BASE_CSS}</style>`);
  }

  if (includeKatexCss) {
    parts.push('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">');
  }

  if (includeHighlightCss) {
    parts.push('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">');
  }

  // Escape </script> to prevent breaking the inline script tag
  const safeBody = body.replace(/<\/script>/gi, '<\\/script>');

  parts.push('</head><body><div class="markdown-body">');
  parts.push(safeBody);
  parts.push('</div>');
  parts.push('<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>');
  parts.push(`
<script>
(function() {
  if (typeof mermaid === 'undefined') return;
  mermaid.initialize({ startOnLoad: false, securityLevel: 'sandbox' });
  var placeholders = document.querySelectorAll('.mermaid-placeholder');
  if (placeholders.length === 0) return;
  placeholders.forEach(function(p) {
    var code = decodeURIComponent(p.getAttribute('data-mermaid-code') || '');
    if (!code) return;
    try {
      mermaid.render(p.id, code)
        .then(function(result) { p.innerHTML = result.svg; p.classList.add('mermaid-container'); })
        .catch(function() { p.innerHTML = '<pre class="mermaid-error">Mermaid parse error</pre>'; });
    } catch(e) {
      p.innerHTML = '<pre class="mermaid-error">Mermaid render failed</pre>';
    }
  });
})();
</script>`);

  parts.push('</body></html>');

  return parts.join('\n');
}

export function renderBodyOnly(markdown: string): string {
  return parseMarkdown(markdown);
}

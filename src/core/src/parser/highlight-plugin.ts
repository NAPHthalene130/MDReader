import type MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightPlugin(md: MarkdownIt): void {
  md.options.highlight = (str: string, lang: string, _attrs: string): string => {
    if (!lang) {
      return `<pre><code>${escapeHtml(str)}</code></pre>`;
    }

    if (lang === 'mermaid') {
      return '';
    }

    try {
      if (hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(str, { language: lang }).value;
        return `<pre><code class="hljs language-${escapeHtml(lang)}">${highlighted}</code></pre>`;
      }
    } catch {
      // fall through to auto-detect
    }

    try {
      const highlighted = hljs.highlightAuto(str).value;
      return `<pre><code class="hljs">${highlighted}</code></pre>`;
    } catch {
      return `<pre><code>${escapeHtml(str)}</code></pre>`;
    }
  };
}

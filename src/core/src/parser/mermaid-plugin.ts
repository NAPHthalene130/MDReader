import type MarkdownIt from 'markdown-it';

export function mermaidPlugin(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info !== 'mermaid') {
      if (defaultFence) {
        return defaultFence(tokens, idx, options, env, slf);
      }
      return `<pre><code>${escapeHtml(token.content)}</code></pre>`;
    }

    const encoded = encodeURIComponent(token.content);
    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
    return `<div class="mermaid-placeholder" data-mermaid-code="${encoded}" id="${id}">
      <pre class="mermaid-error">Loading diagram...</pre>
    </div>`;
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

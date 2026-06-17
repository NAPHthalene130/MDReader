import type MarkdownIt from 'markdown-it';
import katex from 'katex';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
  } catch {
    return `<span class="katex-error">${escapeHtml(latex)}</span>`;
  }
}

export function latexPlugin(md: MarkdownIt): void {
  // Block math: $$...$$
  md.renderer.rules.math_block = (tokens, idx) => {
    const content = tokens[idx].content;
    return `<div class="math-block">${renderLatex(content, true)}</div>`;
  };

  // Inline math: $...$
  md.renderer.rules.math_inline = (tokens, idx) => {
    const content = tokens[idx].content;
    return `<span class="math-inline">${renderLatex(content, false)}</span>`;
  };

  // Custom rule to detect $$...$$ blocks
  const defaultBlock = md.renderer.rules.code_block;
  md.renderer.rules.code_block = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    // Check if this is a math block (starts and ends with $$)
    if (token.content.startsWith('$$') && token.content.endsWith('$$')) {
      const latex = token.content.slice(2, -2).trim();
      return `<div class="math-block">${renderLatex(latex, true)}</div>`;
    }
    if (defaultBlock) {
      return defaultBlock(tokens, idx, options, env, slf);
    }
    return `<pre><code>${escapeHtml(token.content)}</code></pre>`;
  };

  // Process inline math $...$ in text
  // This is handled via a post-processing step on the HTML output
  // because markdown-it does not natively support inline math
  const defaultText = md.renderer.rules.text;
  md.renderer.rules.text = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    if (token.content.includes('$') && token.content !== '$') {
      const parts = token.content.split(/(\$[^$]+\$)/g);
      const result = parts.map((part) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1);
          return `<span class="math-inline">${renderLatex(latex, false)}</span>`;
        }
        return escapeHtml(part);
      });
      return result.join('');
    }
    if (defaultText) {
      return defaultText(tokens, idx, options, env, slf);
    }
    return escapeHtml(token.content);
  };
}

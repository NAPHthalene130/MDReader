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
  // Block math rule for $$...$$
  md.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
    let start = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    if (start + 2 > max) {
      return false;
    }

    if (state.src.charCodeAt(start) !== 0x24 /* $ */ || state.src.charCodeAt(start + 1) !== 0x24 /* $ */) {
      return false;
    }

    if (silent) {
      return true;
    }

    let nextLine = startLine;
    let autoClosed = false;

    // Check if it's closed on the same line
    if (start + 3 <= max) {
      const lineText = state.src.slice(start, max);
      if (lineText.trim().endsWith('$$') && lineText.trim().length >= 4) {
        nextLine = startLine;
        autoClosed = true;
      }
    }

    if (!autoClosed) {
      let haveEndMarker = false;
      for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
        start = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (start < max && state.tShift[nextLine] < state.blkIndent) {
          // non-empty line with negative indent should stop the list
        }

        const lineText = state.src.slice(start, max).trim();
        if (lineText.endsWith('$$')) {
          haveEndMarker = true;
          break;
        }
      }
      if (!haveEndMarker) {
        // Unclosed block math is valid up to end of document
        nextLine = endLine - 1;
      }
    }

    state.line = nextLine + 1;
    const token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = state.getLines(startLine, nextLine + 1, state.blkIndent, false);
    token.map = [startLine, state.line];
    token.markup = '$$';

    return true;
  }, { alt: [ 'paragraph', 'reference', 'blockquote', 'list' ] });

  // Renderer for block math
  md.renderer.rules.math_block = (tokens, idx) => {
    let content = tokens[idx].content.trim();
    if (content.startsWith('$$')) content = content.slice(2);
    if (content.endsWith('$$')) content = content.slice(0, -2);
    content = content.trim();
    return `<div class="math-block">${renderLatex(content, true)}</div>`;
  };

  // Process inline math $...$ in text
  // This is a post-processing step on text tokens
  const defaultText = md.renderer.rules.text;
  md.renderer.rules.text = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    if (token.content.includes('$') && token.content !== '$') {
      const parts = token.content.split(/(\$[^$]+\$)/g);
      const result = parts.map((part) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 1) {
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

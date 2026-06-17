export interface TocEntry {
  level: number;
  text: string;
  anchor: string;
  children: TocEntry[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf-]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function extractToc(tokenStream: { type: string; tag?: string; content?: string }[]): TocEntry[] {
  const headings: TocEntry[] = [];
  const stack: TocEntry[] = [];

  for (let i = 0; i < tokenStream.length; i++) {
    const token = tokenStream[i];
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag!.slice(1), 10);
      const contentToken = tokenStream[i + 1];

      if (contentToken && contentToken.type === 'inline') {
        const text = (contentToken.content || '').replace(/<[^>]+>/g, '').trim();
        const anchor = slugify(text) || `heading-${i}`;

        const entry: TocEntry = {
          level,
          text,
          anchor,
          children: [],
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          headings.push(entry);
        } else {
          stack[stack.length - 1].children.push(entry);
        }

        stack.push(entry);
      }
    }
  }

  return headings;
}

export function renderTocHtml(entries: TocEntry[]): string {
  if (entries.length === 0) return '';

  let html = '<ul class="toc-list">';
  for (const entry of entries) {
    html += '<li class="toc-item">';
    html += `<a href="#${entry.anchor}" class="toc-link" data-anchor="${entry.anchor}">${escapeHtml(entry.text)}</a>`;
    if (entry.children.length > 0) {
      html += renderTocHtml(entry.children);
    }
    html += '</li>';
  }
  html += '</ul>';
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

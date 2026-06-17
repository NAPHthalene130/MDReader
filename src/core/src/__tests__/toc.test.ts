import { describe, it, expect } from 'vitest';
import { extractToc, renderTocHtml, TocEntry } from '../indexer/toc';

describe('toc-extraction', () => {
  function mockTokenStream(headings: Array<{ level: number; text: string }>): any[] {
    const tokens: any[] = [];
    for (const h of headings) {
      tokens.push({
        type: 'heading_open',
        tag: `h${h.level}`,
      });
      tokens.push({
        type: 'inline',
        content: h.text,
      });
      tokens.push({
        type: 'heading_close',
        tag: `h${h.level}`,
      });
    }
    return tokens;
  }

  it('extracts flat headings', () => {
    const tokens = mockTokenStream([
      { level: 1, text: 'Title' },
      { level: 2, text: 'Section 1' },
      { level: 2, text: 'Section 2' },
    ]);
    const toc = extractToc(tokens);
    expect(toc).toHaveLength(1);
    expect(toc[0].text).toBe('Title');
    expect(toc[0].children).toHaveLength(2);
    expect(toc[0].children[0].text).toBe('Section 1');
    expect(toc[0].children[1].text).toBe('Section 2');
  });

  it('extracts nested headings', () => {
    const tokens = mockTokenStream([
      { level: 1, text: 'Chapter' },
      { level: 2, text: 'Section' },
      { level: 3, text: 'Subsection' },
      { level: 2, text: 'Section 2' },
    ]);
    const toc = extractToc(tokens);
    expect(toc).toHaveLength(1);
    expect(toc[0].children).toHaveLength(2);
    expect(toc[0].children[0].children).toHaveLength(1);
    expect(toc[0].children[0].children[0].text).toBe('Subsection');
  });

  it('returns empty array for empty document', () => {
    const tokens = mockTokenStream([]);
    const toc = extractToc(tokens);
    expect(toc).toHaveLength(0);
  });

  it('generates anchor IDs', () => {
    const tokens = mockTokenStream([
      { level: 1, text: 'Hello World' },
    ]);
    const toc = extractToc(tokens);
    expect(toc[0].anchor).toBe('hello-world');
  });

  it('renders TOC as HTML', () => {
    const entries: TocEntry[] = [
      { level: 1, text: 'Title', anchor: 'title', children: [
        { level: 2, text: 'Section', anchor: 'section', children: [] },
      ]},
    ];
    const html = renderTocHtml(entries);
    expect(html).toContain('<a href="#title"');
    expect(html).toContain('<a href="#section"');
    expect(html).toContain('Title');
    expect(html).toContain('Section');
  });

  it('returns empty string for empty TOC', () => {
    const html = renderTocHtml([]);
    expect(html).toBe('');
  });
});

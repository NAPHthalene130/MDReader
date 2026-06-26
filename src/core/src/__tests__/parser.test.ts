import { describe, it, expect } from 'vitest';
import { parseMarkdown, getTokenStream } from '../parser';

describe('markdown-parser', () => {
  describe('standard Markdown', () => {
    it('parses headings', () => {
      const html = parseMarkdown('# Heading 1\n## Heading 2\n### Heading 3');
      expect(html).toContain('<h1>Heading 1</h1>');
      expect(html).toContain('<h2>Heading 2</h2>');
      expect(html).toContain('<h3>Heading 3</h3>');
    });

    it('parses bold and italic', () => {
      const html = parseMarkdown('**bold** and *italic* and ~~strikethrough~~');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<s>strikethrough</s>');
    });

    it('parses unordered lists', () => {
      const html = parseMarkdown('- item 1\n- item 2\n  - nested');
      expect(html).toContain('<li>item 1</li>');
      expect(html).toContain('item 2');
      expect(html).toContain('<li>nested</li>');
    });

    it('parses ordered lists', () => {
      const html = parseMarkdown('1. first\n2. second\n3. third');
      expect(html).toContain('<li>first</li>');
      expect(html).toContain('<li>second</li>');
    });

    it('parses tables', () => {
      const md = '| a | b |\n| --- | --- |\n| 1 | 2 |';
      const html = parseMarkdown(md);
      expect(html).toContain('<table>');
      expect(html).toContain('<th>a</th>');
      expect(html).toContain('<td>1</td>');
    });

    it('parses task lists', () => {
      const html = parseMarkdown('- [ ] todo\n- [x] done');
      expect(html).toContain('todo');
      expect(html).toContain('done');
    });

    it('parses blockquotes', () => {
      const html = parseMarkdown('> quoted text');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('quoted text');
    });

    it('parses links', () => {
      const html = parseMarkdown('[link](https://example.com)');
      expect(html).toContain('<a href="https://example.com">link</a>');
    });

    it('parses images', () => {
      const html = parseMarkdown('![alt](img.png)');
      expect(html).toContain('<img src="img.png" alt="alt"');
    });

    it('parses inline code', () => {
      const html = parseMarkdown('use `const x = 1` here');
      expect(html).toContain('<code>const x = 1</code>');
    });

    it('parses horizontal rules', () => {
      const html = parseMarkdown('---');
      expect(html).toContain('<hr');
    });

    it('escapes raw HTML from markdown input', () => {
      const html = parseMarkdown('<img src=x onerror="window.electronAPI.readFile(`/etc/passwd`)">\n\n<script>alert(1)</script>');
      expect(html).not.toContain('<img src=x');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;img');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('LaTeX math', () => {
    it('renders inline math $...$', () => {
      const html = parseMarkdown('Formula $E = mc^2$ inline');
      expect(html).toContain('math-inline');
    });

    it('renders block math $$...$$', () => {
      const html = parseMarkdown('$$\n\\sum_{i=1}^{n} x_i\n$$');
      console.log('TEST OUTPUT:', html);
      // Block math should produce a math-block div or similar
      expect(html).toContain('math');
    });

    it('handles unclosed $ as plain text', () => {
      const html = parseMarkdown('$E = mc^2 is not closed');
      // Should not crash - just render as text
      expect(html).toBeDefined();
    });
  });

  describe('Mermaid diagrams', () => {
    it('detects mermaid code block', () => {
      const md = '```mermaid\ngraph TD\n  A --> B\n```';
      const html = parseMarkdown(md);
      expect(html).toContain('mermaid');
    });

    it('handles invalid mermaid syntax gracefully', () => {
      const md = '```mermaid\ninvalid syntax here\n```';
      const html = parseMarkdown(md);
      expect(html).toContain('mermaid');
    });
  });

  describe('Code highlighting', () => {
    it('highlights JavaScript code block', () => {
      const md = '```javascript\nconst x = 42;\n```';
      const html = parseMarkdown(md);
      expect(html).toContain('hljs');
      expect(html).toContain('language-javascript');
    });

    it('renders code block without language', () => {
      const md = '```\nplain code\n```';
      const html = parseMarkdown(md);
      expect(html).toContain('<pre>');
      expect(html).toContain('plain code');
    });

    it('handles unknown language gracefully', () => {
      const md = '```nonexistent\nsome code\n```';
      const html = parseMarkdown(md);
      expect(html).toContain('some');
      expect(html).toContain('code');
      expect(html).toContain('<pre>');
    });
  });

  describe('mixed content', () => {
    it('parses mixed content document', () => {
      const md = `# Title

Some text with $formula$ inline.

## Section

\`\`\`javascript
const x = 1;
\`\`\`

\`\`\`mermaid
graph LR
  A --> B
\`\`\`

More text.`;
      const html = parseMarkdown(md);
      expect(html).toContain('<h1>Title</h1>');
      expect(html).toContain('<h2>Section</h2>');
      expect(html).toContain('const');
      expect(html).toContain('mermaid');
    });
  });
});

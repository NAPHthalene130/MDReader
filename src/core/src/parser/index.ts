import MarkdownIt from 'markdown-it';
import { mermaidPlugin } from './mermaid-plugin';
import { latexPlugin } from './latex-plugin';
import { highlightPlugin } from './highlight-plugin';

let md: MarkdownIt | null = null;

function getParser(): MarkdownIt {
  if (!md) {
    md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: false,
    })
      .use(mermaidPlugin)
      .use(latexPlugin)
      .use(highlightPlugin);
  }
  return md;
}

export function parseMarkdown(raw: string): string {
  const parser = getParser();
  return parser.render(raw);
}

export function getTokenStream(raw: string): ReturnType<MarkdownIt['parse']> {
  const parser = getParser();
  return parser.parse(raw, {});
}

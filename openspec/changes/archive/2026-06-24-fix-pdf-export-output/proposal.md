## Why

The PDF export feature shipped in `add-export-button` produces broken output: the exported PDF contains the on-screen "正在生成 PDF…" status toast, and Mermaid diagrams render as the error text "Syntax error in text mermaid version 10.9.0" instead of the expected SVG. Both defects make the exported PDF unusable for its intended purpose.

## What Changes

- Hide the export status toast (`.v-export-status`) and export dropdown menu (`.v-export-menu`) in `@media print` so they are never captured by `printToPDF`.
- Change the viewer's Mermaid `securityLevel` from `'strict'` to `'loose'` so valid diagrams render successfully (the `strict` level applies DOMPurify sanitization that causes Mermaid 10.9.0 to reject valid diagram text with "Syntax error in text").
- Initialize Mermaid only once instead of re-calling `mermaid.initialize()` on every document render, preventing internal-state corruption that contributes to render failures.
- Ensure the exported PDF preserves rendered Mermaid SVG diagrams with no error placeholders.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `document-export`: Two requirements need correction — (1) the "Exported PDF contains only document content" requirement must also exclude the export status toast and dropdown menu, and (2) the "User can export the rendered document to PDF" requirement must guarantee Mermaid diagrams are rendered (not error placeholders) in the exported PDF.

## Impact

- **`src/windows/renderer/viewer.js`**: add `.v-export-status` and `.v-export-menu` to the `@media print` hide list; change Mermaid `securityLevel` from `'strict'` to `'loose'`; add a one-time initialization guard so `mermaid.initialize()` runs only once.
- **No main process or preload changes** — the IPC contract and `printToPDF` call are correct; the fixes are renderer-only.
- **No core package changes** — the core renderer already uses `securityLevel: 'sandbox'`; this change aligns the viewer's Mermaid configuration.

## Context

The `add-export-button` change shipped PDF export for the Windows viewer. Two defects make the output unusable:

1. **Status toast leak**: `exportToPdf()` (viewer.js:435) calls `showExportStatus('正在生成 PDF…', 'busy')` which appends a `.v-export-status` element to `document.body` before invoking the IPC. The main process then calls `mainWindow.webContents.printToPDF()`, which captures the live DOM — including the toast. The `@media print` block (viewer.js:86-93) hides `.v-toc` and `.v-toolbar` but omits `.v-export-status` and `.v-export-menu`.

2. **Mermaid render failure**: `renderMermaid()` (viewer.js:263) initializes Mermaid with `securityLevel: 'strict'` (viewer.js:273). In Mermaid 10.9.0, `strict` applies DOMPurify HTML sanitization during the parse/render pipeline, which causes valid diagrams to fail with "Syntax error in text". The core renderer (index.ts:81) uses `securityLevel: 'sandbox'` and renders correctly. Additionally, `mermaid.initialize()` is re-called on every document render, which can corrupt Mermaid's internal state on subsequent renders in 10.x.

Both fixes are renderer-only — the IPC contract and `printToPDF` call in the main process are correct.

## Goals / Non-Goals

**Goals:**
- Ensure the exported PDF never contains the export status toast or format dropdown menu.
- Ensure Mermaid diagrams render as SVG (not error text) in both the viewer and the exported PDF.
- Keep changes minimal and renderer-scoped.

**Non-Goals:**
- Changing the PDF generation method (`printToPDF` is correct).
- Modifying the core package's Mermaid rendering (it already uses `sandbox`).
- Adding new export formats or changing the export UI.
- Addressing the `ELECTRON_RUN_AS_NODE` dev-launch environment issue (pre-existing, unrelated).

## Decisions

### Decision 1: Hide export UI elements via `@media print`
Add `.v-export-status, .v-export-menu` to the existing `@media print` hide list alongside `.v-toc` and `.v-toolbar`.

**Rationale:** This is the same mechanism already used for toolbar/TOC. It is zero-cost, requires no timing coordination between renderer and main process, and works because Chromium applies `@media print` rules during `printToPDF`. The toast is a fixed-position overlay — without this rule it would appear on every PDF page.

**Alternatives considered:**
- Remove the toast before calling IPC, re-add after → rejected: the main process calls `printToPDF` asynchronously; the renderer cannot reliably know when capture begins/ends, risking a flash of no-feedback or re-capture.
- Move toast to a separate `BrowserWindow` → rejected: over-engineered for a bugfix.

### Decision 2: Change Mermaid `securityLevel` from `'strict'` to `'loose'`
Set `securityLevel: 'loose'` in the viewer's `mermaid.initialize()` call.

**Rationale:** The `strict` level in Mermaid 10.9.0 applies DOMPurify sanitization during rendering, which is the direct cause of "Syntax error in text" for valid diagrams. The `loose` level renders in the main document (no iframe) and does not apply the problematic sanitization, so diagrams render successfully and the resulting SVG is captured by `printToPDF`. The core renderer uses `sandbox` (iframe-based), but `sandbox` would complicate print/PDF capture because the SVG lives inside an iframe that `@media print` rules on the parent may not reach. `loose` is the right choice for the viewer's in-document rendering + print-to-PDF workflow.

**Alternatives considered:**
- `securityLevel: 'sandbox'` → matches the core renderer, but renders inside an iframe that may not be captured by `printToPDF` or may need separate print rules. Rejected for the viewer.
- Keep `strict` and escape/sanitize diagram text manually → rejected: the error originates in Mermaid's internal pipeline, not in the input text; no amount of input escaping fixes it.

### Decision 3: Initialize Mermaid only once
Add a `mermaidInitialized` flag. Call `mermaid.initialize()` only when the flag is false; skip on subsequent renders.

**Rationale:** Re-calling `mermaid.initialize()` on every render (viewer.js:273) can reset Mermaid's internal state mid-pipeline in 10.x, contributing to intermittent render failures. Mermaid's configuration is static (`startOnLoad: false`, `securityLevel: 'loose'`), so a single initialization is sufficient and safer.

**Alternatives considered:**
- Re-initialize every time with the same config → current behavior; rejected because it's a contributing factor to the bug.
- Move initialization to `ensureMermaidScript()` → viable but changes the function's single responsibility (script loading). The flag approach is less invasive.

## Risks / Trade-offs

- **[Mermaid `loose` allows HTML in labels]** → In the viewer, diagram text comes from parsed Markdown files the user opens locally; the risk of malicious HTML in Mermaid labels is low and equivalent to the risk of opening any local HTML. Acceptable for a desktop Markdown reader.
- **[One-time init flag could become stale if Mermaid script is reloaded]** → `ensureMermaidScript()` caches the promise and never reloads, so the flag stays valid for the session. If a future change reloads Mermaid, the flag must be reset.
- **[Print CSS must stay in sync with new overlay elements]** → If future export UI adds new fixed/absolute elements, they must be added to the `@media print` hide list. Low risk; documented in the spec's exclusion requirement.

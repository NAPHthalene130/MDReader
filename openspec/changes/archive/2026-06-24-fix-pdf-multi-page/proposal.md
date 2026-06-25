## Why

The PDF export feature clips document content to a single viewport: only the first page of the exported PDF contains content while all subsequent pages are blank. This makes exporting any document longer than one screen unusable.

## What Changes

- Add `@media print` rules that reset the ancestor layout containers (`body`, `#app`, and `.page`) so their `height: 100vh` and `overflow: hidden` constraints do not clip content during `printToPDF`.
- The existing print rules already flatten the viewer's internal elements (`.v-layout`, `.v-main`, `.v-content`, `.v-doc`); this change extends the same treatment to the outer containers defined in `index.html` that currently restrict the document to a single screen height.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `document-export`: The "Exported PDF contains only document content" requirement must guarantee that the entire document body (not just the first viewport) is captured across multiple PDF pages.

## Impact

- **`src/windows/renderer/viewer.js`**: extend the existing `@media print` block with rules for `body`, `#app`, and `.page` (reset `height` to `auto`, `overflow` to `visible`, and `display` to `block`).
- **No `index.html` change** — the app-shell styles are needed for the interactive layout; print overrides are applied from viewer.js's injected stylesheet via `!important`.
- **No main process or core package changes** — the `printToPDF` call and IPC contract are correct.

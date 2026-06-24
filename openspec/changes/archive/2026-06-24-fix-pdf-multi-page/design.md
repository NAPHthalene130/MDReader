## Context

The Windows viewer's app shell (`src/windows/renderer/index.html`) uses a full-viewport layout for interactive use:
- `body { height: 100vh; overflow: hidden; }` — prevents page scroll; the viewer scrolls internally.
- `#app { height: 100vh; display: flex; flex-direction: column; }` — column flex filling the screen.
- `.page { flex: 1; overflow: hidden; }` — each page (file manager / viewer) fills remaining space and clips overflow.

The existing `@media print` block in `viewer.js` (lines 87-94) resets the viewer's *internal* elements (`.v-layout`, `.v-main`, `.v-content`, `.v-doc`) to block flow with `overflow: visible` and `height: auto`. However, it does **not** reset the *ancestor* containers `body`, `#app`, and `.page` (`#viewer-page`). During `printToPDF`, Chromium renders the page with these ancestors still at `height: 100vh` and `overflow: hidden`, so the document is clipped to a single viewport. The first PDF page captures the visible portion; all subsequent pages are blank.

## Goals / Non-Goals

**Goals:**
- Ensure the exported PDF captures the entire document body across as many pages as needed, with no blank pages and no clipped content.

**Non-Goals:**
- Changing the interactive app-shell layout in `index.html` — it must keep `overflow: hidden` for normal scrolling behavior.
- Changing the `printToPDF` options or IPC contract — they are correct.
- Adjusting page margins, orientation, or headers/footers.

## Decisions

### Decision 1: Reset ancestor containers in `@media print`
Extend the existing `@media print` block in `viewer.js` with rules for `body`, `#app`, and `.page`:
- `body { height: auto !important; overflow: visible !important; }`
- `#app { height: auto !important; display: block !important; }`
- `.page { display: block !important; overflow: visible !important; height: auto !important; }`

**Rationale:** `printToPDF` uses Chromium's print pipeline, which applies `@media print` styles. Resetting the ancestors removes the `100vh` height cap and `overflow: hidden` clipping so the full document flows naturally across pages. The `!important` is required to override the `index.html` inline styles (which have equal specificity but appear earlier in the cascade).

**Why viewer.js and not index.html:** The app-shell styles are needed for the interactive layout and must not be split into a print media query inside `index.html` (that would couple app-shell concerns with export concerns). The viewer is the only page that triggers PDF export, so it owns the print overrides. Since viewer.js appends its `<style>` to `<head>`, the rules apply globally with `!important` precedence.

**Alternatives considered:**
- Add a separate `@media print` block to `index.html` → rejected: scatters print/export logic across two files; index.html has no knowledge of export.
- Clone document content into an offscreen element before `printToPDF` → rejected: complex, duplicates DOM, and Mermaid/KaTeX SVGs may not clone cleanly.
- Use `printToPDF` with a dedicated print-only `BrowserWindow` → rejected: significant architecture change for a CSS fix; the print rules already work for the internal elements.

### Decision 2: Use `display: block` for `#app` and `.page` in print
Switch `#app` from `display: flex` and `.page` from `display: flex` to `display: block` in print mode.

**Rationale:** Flex containers with `flex-direction: column` and `flex: 1` children impose height-distribution behavior that fights the `height: auto` reset — a flex child with `flex: 1` tries to fill the flex container, which is still constrained by its own ancestor. Converting to `display: block` removes the flex sizing model entirely, letting the document body expand to its natural height. This is consistent with the existing print rules that already set `.v-layout`, `.v-main`, etc. to `display: block`.

## Risks / Trade-offs

- **[Print rules must cover all ancestor clip points]** → If a future layout change adds another `overflow: hidden` or `height: 100vh` ancestor between `body` and `.v-doc`, the clip could recur. Mitigation: the print rules target the three known ancestors (`body`, `#app`, `.page`); any new ancestor must be added to the print block. Low risk given the stable app shell.
- **[`!important` specificity]** → Required to override inline `index.html` styles. Acceptable here because print mode is a distinct rendering context where the interactive layout constraints are intentionally overridden.
- **[File manager page also affected by `.page` print rule]** → The `.page` rule applies to both `#file-manager-page` and `#viewer-page`. In print mode only the active page is visible (the inactive page has `display: none` from `.page` base style, which `!important` does not override because `.page` base already sets `display: none` and `.page.active` sets it to flex; the print rule sets `.page` to `display: block !important`). Since only one page is active at a time and the viewer is the export origin, this is correct. If the file manager ever needs export, the same block-flow reset is appropriate.

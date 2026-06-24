## Context

The Android viewer's image export (`exportToImage` in `ViewerFragment.kt`) uses `webView.capturePicture()` to capture the full WebView content, then draws the `Picture` to a `Bitmap`. On devices running Android 5.0+ (API 21+), hardware acceleration is enabled by default for all windows. `WebView.capturePicture()` is a deprecated API that captures the WebView's software display list — but with hardware-accelerated rendering, the WebView renders via GPU and the software display list is empty. As a result, `capturePicture()` returns a `Picture` with the correct width/height but no drawable content, producing a blank white image (since the bitmap is pre-filled with `Color.WHITE`).

PDF export is unaffected because `PrintManager` + `createPrintDocumentAdapter()` renders through the Android print framework's own pipeline, which does not depend on the WebView's display list.

A secondary concern: `awaitRenderCompletion` only checks for `.mermaid-placeholder` count. A document without Mermaid diagrams returns count 0 immediately, which is correct for the common case (the page has loaded and rendered synchronously via the template's IIFE). However, adding a body-content check provides extra safety against capturing a page that hasn't loaded.

## Goals / Non-Goals

**Goals:**
- Ensure JPG/PNG image export on Android produces visible document content, not a blank image.
- Keep the fix minimal and confined to `ViewerFragment.kt`.
- Avoid permanent performance degradation from disabling hardware acceleration on the WebView.

**Non-Goals:**
- Replacing `capturePicture()` with a fundamentally different capture approach (e.g., `PixelCopy`, scroll-and-stitch) — the software-layer-type fix is the minimal change that makes `capturePicture()` work.
- Changing PDF export (it already works).
- Modifying the viewer template or layout.

## Decisions

### Decision 1: Temporarily switch WebView to software layer type before `capturePicture()`
In `exportToImage()`, before calling `webView.capturePicture()`:
1. Save the current layer type: `val originalLayerType = webView.layerType`
2. Set software mode: `webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)`
3. Post a runnable via `webView.post { ... }` to wait for the WebView to invalidate and re-render in software mode
4. Inside the posted runnable, call `webView.capturePicture()`, process the picture into a bitmap, then restore: `webView.setLayerType(originalLayerType, null)`

**Rationale:** `capturePicture()` only captures content from the software rendering path. Setting `LAYER_TYPE_SOFTWARE` forces the WebView to render into a software bitmap, which `capturePicture()` can then capture. The `View.post()` ensures the runnable runs after the next layout/render cycle, giving the WebView time to invalidate and re-render in software mode. Restoring the original layer type afterward ensures normal scrolling and rendering performance is unaffected.

**Alternatives considered:**
- Set `android:layerType="software"` permanently in the layout XML → simplest but permanently disables GPU rendering for the WebView, degrading scrolling performance. Rejected for the performance trade-off.
- Use `PixelCopy` API → only captures the visible viewport, not the full document. Would require scroll-and-stitch logic. Rejected as too complex for this bugfix.
- Use `webView.draw(Canvas)` after resizing to content height → `View.draw()` with hardware acceleration has the same GPU/software issue; also requires manual content-height measurement and view resizing. Rejected.
- Call `WebView.enableSlowWholeDocumentDraw()` → must be called before any WebView is created in the process; affects all WebViews globally with performance implications. Rejected as too invasive.

### Decision 2: Use a single `View.post()` for the re-render delay
After `setLayerType(LAYER_TYPE_SOFTWARE)`, use one `webView.post { ... }` call to defer the capture to the next UI thread cycle. This runs after the view's `invalidate()` has been processed and the view has had a chance to re-render in software mode.

**Rationale:** `View.post()` enqueues the runnable on the view's message queue, which runs after the current event processing and the next layout pass. This is sufficient for the layer-type change to take effect. A single `post()` is simpler and more reliable than a fixed `postDelayed()` delay, and avoids guessing a delay duration.

**Alternatives considered:**
- `postDelayed(200)` → fixed delay is fragile (too short on slow devices, unnecessarily slow on fast ones). Rejected.
- `ViewTreeObserver.OnPreDrawListener` → more complex setup and teardown. Rejected — `post()` is sufficient.

### Decision 3: Strengthen `awaitRenderCompletion` with a body-content check
Add a check that `document.body` has non-trivial content (e.g., `document.body.innerHTML.length > 0` or `document.getElementById('content').children.length > 0`) alongside the existing Mermaid-placeholder check. Only proceed when both conditions are met (or timeout).

**Rationale:** If the user taps export before the page has loaded, `capturePicture()` would capture a blank WebView. Adding a body-content check prevents this race. The existing polling mechanism (300ms intervals, up to ~5 seconds) handles the async wait.

## Risks / Trade-offs

- **[Software layer type flicker during capture]** → Setting `LAYER_TYPE_SOFTWARE` may cause a brief visual flicker on the WebView. Mitigation: the layer-type change and `post()` happen quickly; the capture itself is instantaneous. The flicker, if any, is momentary and only during export.
- **[`post()` timing may not be enough on some devices]** → On very slow devices, a single `post()` cycle might not be sufficient for the WebView to fully re-render in software mode. Mitigation: if this occurs, a fallback to `postDelayed(100)` inside the first `post()` can be added. Start with the simpler approach.
- **[Layer type restoration failure]** → If an exception occurs after setting software mode but before restoration, the WebView stays in software mode. Mitigation: wrap the capture + restore in try/finally so the layer type is always restored.

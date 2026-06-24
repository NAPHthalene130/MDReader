## Why

The Android JPG/PNG image export produces blank output — the exported image is entirely white with no document content. This makes the image export feature unusable on Android. PDF export via `PrintManager` is unaffected because the print framework renders through its own pipeline.

## What Changes

- Fix `capturePicture()` returning blank content by temporarily switching the WebView to software layer type (`LAYER_TYPE_SOFTWARE`) before capture and restoring it afterward. Android enables hardware acceleration by default since API 21; `capturePicture()` captures the software display list, which is empty when GPU rendering is active.
- Add a `View.post()` cycle between setting the software layer type and calling `capturePicture()` so the WebView has time to invalidate and re-render in software mode before the picture is captured.
- Strengthen `awaitRenderCompletion` to also verify the page body has rendered content (not just that Mermaid placeholders are gone), preventing premature capture of a page that hasn't finished loading.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `document-export`: The "User can export the rendered document to JPG" and "User can export the rendered document to PNG" requirements must guarantee that the exported image contains visible document content, not a blank image. A new scenario is added for non-blank export output.

## Impact

- **`src/android/app/src/main/java/com/mdreader/app/ViewerFragment.kt`**: modify `exportToImage()` to switch to software layer type + `View.post()` before `capturePicture()` and restore afterward; strengthen `awaitRenderCompletion()` to check page body content.
- **No layout, manifest, or dependency changes** — the fix is entirely in the Kotlin fragment logic.

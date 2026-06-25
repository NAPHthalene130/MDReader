## 1. Fix: software layer type for capturePicture

- [x] 1.1 In `exportToImage()` in `src/android/app/src/main/java/com/mdreader/app/ViewerFragment.kt`, before calling `webView.capturePicture()`, save the current layer type (`webView.layerType`) and set the WebView to software mode (`webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)`)
- [x] 1.2 Wrap the `capturePicture()` call and bitmap processing inside `webView.post { ... }` so the WebView has time to re-render in software mode before capture
- [x] 1.3 Wrap the capture + processing logic in try/finally so the original layer type is always restored (`webView.setLayerType(originalLayerType, null)`) even if an exception occurs

## 2. Fix: strengthen render-completion check

- [x] 2.1 In `awaitRenderCompletion()`, add a check that the page body has rendered content (e.g., `document.getElementById('content').children.length > 0`) alongside the existing `.mermaid-placeholder` count check; only proceed when both conditions pass (or timeout)

## 3. Verification

- [x] 3.1 Run `gradlew assembleDebug` and confirm it compiles without errors
- [ ] 3.2 Launch the app, open a Markdown file with code + blockquote, export to JPG, and confirm the image contains visible document content (not blank/white)
- [ ] 3.3 Export to PNG and confirm the image contains visible document content (not blank/white)
- [ ] 3.4 Open a file with a Mermaid diagram, export to JPG, and confirm the Mermaid SVG is visible in the image
- [ ] 3.5 Confirm the WebView scrolls and renders normally after export (layer type was restored correctly)

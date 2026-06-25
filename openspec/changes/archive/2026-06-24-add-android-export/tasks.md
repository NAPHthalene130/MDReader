## 1. UI: export button and format menu resources

- [x] 1.1 Add string resources to `src/android/app/src/main/res/values/strings.xml`: `export` ("导出"), `export_pdf` ("PDF"), `export_jpg` ("JPG"), `export_png` ("PNG"), `export_generating` ("正在生成…"), `export_success` ("已导出"), `export_failed` ("导出失败"), `export_no_content` ("导出内容为空")
- [x] 1.2 Create `src/android/app/src/main/res/menu/export_menu.xml` with three items (`pdf`, `jpg`, `png`) referencing the string resources
- [x] 1.3 Add an "导出" button (`@+id/viewer_export`) to the toolbar in `src/android/app/src/main/res/layout/fragment_viewer.xml`, positioned left of `@+id/viewer_toc_toggle`, using `Widget.MaterialComponents.Button.TextButton` style matching the existing buttons

## 2. ViewerFragment: export button wiring and format menu

- [x] 2.1 In `ViewerFragment.kt`, find the export button via `root.findViewById<Button>(R.id.viewer_export)` and set a click listener that shows a `PopupMenu` inflated from `R.menu.export_menu` anchored to the button
- [x] 2.2 Set the PopupMenu's `OnMenuItemClickListener` to route `pdf` → `exportToPdf()`, `jpg` → `exportToImage("jpg")`, `png` → `exportToImage("png")`
- [x] 2.3 Add a `deriveBaseName(fileName: String): String` helper that strips `.md/.markdown/.mdown/.mkd` extensions (mirrors the Windows renderer logic)

## 3. ViewerFragment: render-completion check

- [x] 3.1 Add a `awaitRenderCompletion(onReady: () -> Unit)` method that evaluates JS `document.querySelectorAll('.mermaid-placeholder').length` and polls every 300ms (up to ~5 seconds) until the count is 0 or timeout, then calls `onReady` on the UI thread

## 4. ViewerFragment: PDF export via PrintManager

- [x] 4.1 Add `exportToPdf()` that calls `awaitRenderCompletion`, then gets `PrintManager` from the activity, creates a print adapter via `webView.createPrintDocumentAdapter("MDReader_${baseName}")`, and launches the print job with `printManager.print(jobName, adapter, PrintAttributes.Builder().build())`
- [x] 4.2 Show a brief toast ("正在生成…") before launching the print dialog; no file cleanup needed (PrintManager handles output)

## 5. ViewerFragment: image export (JPG/PNG) via capturePicture + SAF

- [x] 5.1 Register an `ActivityResultLauncher<String>` using `registerForActivityResult(ActivityResultContracts.CreateDocument())` in `onCreate` (or `onCreateView`) that on result opens the returned `Uri` OutputStream and writes the pending compressed image bytes; store the pending `Bitmap` and format in fragment fields
- [x] 5.2 Add `exportToImage(format: String)` that calls `awaitRenderCompletion`, captures the full page via `webView.capturePicture()`, creates a `Bitmap` with white background + dimension cap (max 8000px, proportional scale), compresses to JPEG (quality 90) or PNG, stores the compressed bytes + format, then launches the SAF `CreateDocument` with the appropriate MIME type (`image/jpeg` or `image/png`) and default filename
- [x] 5.3 In the SAF result callback, write the stored compressed `ByteArray` to the `Uri` OutputStream, close the stream, clear the pending bytes, and show a success or error toast
- [x] 5.4 Add error handling: if `capturePicture()` returns an empty Picture (width/height ≤ 0) or bitmap creation fails, show an error toast and abort; handle `OutputStream` write exceptions with an error toast

## 6. Verification

- [x] 6.1 Run the Android build (`npm run build:android` or `gradlew assembleDebug`) and confirm it compiles without errors
- [ ] 6.2 Launch the app, open a Markdown file with Mermaid + code + blockquote, and confirm the "导出" button appears left of "目录" in the toolbar
- [ ] 6.3 Tap "导出" and confirm the PopupMenu lists PDF, JPG, PNG; tap outside to dismiss
- [ ] 6.4 Select PDF and confirm the system print dialog opens showing the full rendered document with Mermaid diagrams; cancel it and confirm no error
- [ ] 6.5 Select JPG, choose a save location, and confirm the saved image contains the full document with backgrounds, code highlighting, blockquote, and Mermaid SVG, with no clipping
- [ ] 6.6 Select PNG, choose a save location, and confirm the saved image has the same fidelity as JPG
- [ ] 6.7 Confirm canceling the image save dialog writes no file and shows no error

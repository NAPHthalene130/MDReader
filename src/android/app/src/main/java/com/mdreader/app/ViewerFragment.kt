package com.mdreader.app

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.print.PrintAttributes
import android.print.PrintManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.PopupMenu
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream

class ViewerFragment : Fragment() {

    private lateinit var webView: WebView
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var tocContent: ScrollView
    private lateinit var tocTextView: TextView
    private lateinit var fileNameView: TextView
    private var currentFilePath: String? = null
    private val gson by lazy { com.google.gson.Gson() }
    private val mainHandler by lazy { Handler(Looper.getMainLooper()) }
    private var pendingImageBytes: ByteArray? = null
    private lateinit var createJpgLauncher: ActivityResultLauncher<String>
    private lateinit var createPngLauncher: ActivityResultLauncher<String>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createJpgLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("image/jpeg")) { uri ->
            handleImageResult(uri)
        }
        createPngLauncher = registerForActivityResult(ActivityResultContracts.CreateDocument("image/png")) { uri ->
            handleImageResult(uri)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val root = inflater.inflate(R.layout.fragment_viewer, container, false)

        webView = root.findViewById(R.id.viewer_webview)
        drawerLayout = root.findViewById(R.id.drawer_layout)
        tocContent = root.findViewById(R.id.toc_content)
        tocTextView = root.findViewById(R.id.toc_text)
        fileNameView = root.findViewById(R.id.viewer_filename)
        val backBtn = root.findViewById<Button>(R.id.viewer_back)
        val tocBtn = root.findViewById<Button>(R.id.viewer_toc_toggle)
        val exportBtn = root.findViewById<Button>(R.id.viewer_export)

        backBtn.setOnClickListener {
            (activity as? MainActivity)?.showFileList()
        }

        tocBtn.setOnClickListener {
            if (drawerLayout.isDrawerOpen(tocContent)) {
                drawerLayout.closeDrawer(tocContent)
            } else {
                drawerLayout.openDrawer(tocContent)
            }
        }

        exportBtn.setOnClickListener { anchor ->
            val popup = PopupMenu(requireContext(), anchor)
            popup.menuInflater.inflate(R.menu.export_menu, popup.menu)
            popup.setOnMenuItemClickListener { item ->
                val baseName = deriveBaseName(fileNameView.text?.toString() ?: "")
                when (item.itemId) {
                    R.id.export_pdf -> { exportToPdf(baseName); true }
                    R.id.export_jpg -> { exportToImage("jpg", baseName); true }
                    R.id.export_png -> { exportToImage("png", baseName); true }
                    else -> false
                }
            }
            popup.show()
        }

        setupWebView()
        currentFilePath?.let { path ->
            val name = fileNameView.text?.toString() ?: ""
            if (name.isNotEmpty()) loadFile(path, name)
        }
        return root
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.javaScriptEnabled = true
        webView.settings.allowFileAccess = false
        webView.addJavascriptInterface(TocBridge(), "AndroidToc")

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                webView.evaluateJavascript("""
                    (function() {
                        var headings = [];
                        var elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                        elements.forEach(function(el) {
                            headings.push({
                                level: parseInt(el.tagName.substring(1)),
                                text: el.textContent.trim(),
                                anchor: el.id || ''
                            });
                        });
                        return JSON.stringify(headings);
                    })();
                """.trimIndent()) { result ->
                    if (result != null && result != "null") {
                        updateToc(result)
                    }
                }
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                webView.loadData("<html><body><p>加载页面失败</p></body></html>", "text/html", "UTF-8")
            }
        }
    }

    private fun updateToc(json: String) {
        try {
            val cleaned = json.trim('"')
            val listType = object : com.google.gson.reflect.TypeToken<List<Map<String, Any>>>() {}.type
            val headings: List<Map<String, Any>> = gson.fromJson(cleaned, listType)

            val sb = StringBuilder()
            for (h in headings) {
                val level = (h["level"] as? Number)?.toInt() ?: 1
                val text = h["text"] as? String ?: ""
                val anchor = h["anchor"] as? String ?: ""
                val indent = "  ".repeat(level - 1)
                sb.append("$indent<a href=\"#$anchor\" style=\"color:#586069;text-decoration:none;display:block;padding:2px 0;\">${text}</a><br>")
            }

            tocTextView.text = if (sb.isEmpty()) {
                "暂无标题"
            } else {
                android.text.Html.fromHtml(sb.toString(), android.text.Html.FROM_HTML_MODE_LEGACY)
            }
        } catch (e: Exception) {
            tocTextView.text = "目录解析错误"
        }
    }

    fun loadFile(filePath: String, fileName: String) {
        currentFilePath = filePath
        if (!::webView.isInitialized) {
            fileNameView.text = fileName
            return
        }
        fileNameView.text = fileName

        val content = readFileContent(filePath)
        if (content != null) {
            val template = loadViewerTemplate()
            val safeContent = content.replace("</script>", "<\\/script>").replace("<!--", "<!\\--")
            val html = template.replace("<!-- MARKDOWN_CONTENT -->", safeContent)
            webView.loadDataWithBaseURL("file:///android_asset/", html, "text/html", "UTF-8", null)
        } else {
            webView.loadData(
                "<html><body><p>读取文件失败</p></body></html>",
                "text/html",
                "UTF-8"
            )
        }
    }

    private fun readFileContent(path: String): String? {
        return try {
            if (path.startsWith("content://")) {
                val uri = android.net.Uri.parse(path)
                requireContext().contentResolver.openInputStream(uri)?.use { stream ->
                    BufferedReader(InputStreamReader(stream)).readText()
                }
            } else {
                java.io.File(path).readText()
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun loadViewerTemplate(): String {
        return try {
            requireContext().assets.open("viewer-template.html")
                .bufferedReader().readText()
        } catch (e: Exception) {
            "<html><body><p>模板加载失败</p><pre><!-- MARKDOWN_CONTENT --></pre></body></html>"
        }
    }

    override fun onDestroyView() {
        webView.removeJavascriptInterface("AndroidToc")
        super.onDestroyView()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    private fun deriveBaseName(fileName: String): String {
        if (fileName.isBlank()) return "export"
        return fileName.replace(Regex("\\.(md|markdown|mdown|mkd)$", RegexOption.IGNORE_CASE), "")
    }

    private fun awaitRenderCompletion(onReady: () -> Unit) {
        var attempts = 0
        val maxAttempts = 16
        fun check() {
            webView.evaluateJavascript("(function(){ var mp = document.querySelectorAll('.mermaid-placeholder').length; var c = document.getElementById('content'); var ready = (mp === 0) && c && c.children.length > 0; return ready ? '1' : '0'; })()") { result ->
                val ready = result?.trim('"') == "1"
                attempts++
                if (ready || attempts >= maxAttempts) {
                    mainHandler.post { onReady() }
                } else {
                    mainHandler.postDelayed({ check() }, 300)
                }
            }
        }
        check()
    }

    @SuppressLint("SetTextI18s")
    private fun exportToPdf(baseName: String) {
        val ctx = context ?: return
        Toast.makeText(ctx, R.string.export_generating, Toast.LENGTH_SHORT).show()
        awaitRenderCompletion {
            val printManager = ctx.getSystemService(Activity.PRINT_SERVICE) as? PrintManager
            if (printManager == null) {
                mainHandler.post { Toast.makeText(ctx, R.string.export_failed, Toast.LENGTH_SHORT).show() }
                return@awaitRenderCompletion
            }
            val adapter = webView.createPrintDocumentAdapter("MDReader_$baseName")
            val attrs = PrintAttributes.Builder().build()
            printManager.print("MDReader_$baseName", adapter, attrs)
        }
    }

    private fun exportToImage(format: String, baseName: String) {
        val ctx = context ?: return
        val isJpg = format == "jpg"
        val ext = if (isJpg) "jpg" else "png"
        awaitRenderCompletion {
            val originalLayerType = webView.layerType
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
            webView.post {
                try {
                    val picture = webView.capturePicture()
                    if (picture.width <= 0 || picture.height <= 0) {
                        Toast.makeText(ctx, R.string.export_no_content, Toast.LENGTH_SHORT).show()
                        return@post
                    }

                    val maxDim = 8000
                    var w = picture.width
                    var h = picture.height
                    if (w > maxDim || h > maxDim) {
                        val scale = maxDim.toFloat() / maxOf(w, h)
                        w = (w * scale).toInt().coerceAtLeast(1)
                        h = (h * scale).toInt().coerceAtLeast(1)
                    }

                    val bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
                    val canvas = Canvas(bitmap)
                    canvas.drawColor(Color.WHITE)
                    canvas.drawPicture(picture, android.graphics.Rect(0, 0, w, h))

                    val out = java.io.ByteArrayOutputStream()
                    val compressed = if (isJpg) {
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
                    } else {
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                    }
                    bitmap.recycle()
                    if (!compressed) {
                        Toast.makeText(ctx, R.string.export_failed, Toast.LENGTH_SHORT).show()
                        return@post
                    }

                    pendingImageBytes = out.toByteArray()
                    if (isJpg) {
                        createJpgLauncher.launch("$baseName.$ext")
                    } else {
                        createPngLauncher.launch("$baseName.$ext")
                    }
                } catch (e: Exception) {
                    Toast.makeText(ctx, R.string.export_failed, Toast.LENGTH_SHORT).show()
                } finally {
                    webView.setLayerType(originalLayerType, null)
                }
            }
        }
    }

    private fun handleImageResult(uri: Uri?) {
        if (uri != null) {
            writePendingImageToUri(uri)
        } else {
            pendingImageBytes = null
        }
    }

    private fun writePendingImageToUri(uri: Uri) {
        val ctx = context
        val bytes = pendingImageBytes
        pendingImageBytes = null
        if (ctx == null || bytes == null) return
        try {
            ctx.contentResolver.openOutputStream(uri)?.use { stream: OutputStream ->
                stream.write(bytes)
                stream.flush()
            }
            Toast.makeText(ctx, R.string.export_success, Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(ctx, R.string.export_failed, Toast.LENGTH_SHORT).show()
        }
    }

    inner class TocBridge {
        @JavascriptInterface
        fun onHeadingClick(anchor: String) {
            activity?.runOnUiThread {
                drawerLayout.closeDrawer(tocContent)
            }
        }
    }
}

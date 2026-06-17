package com.mdreader.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.ScrollView
import android.widget.TextView
import androidx.drawerlayout.widget.DrawerLayout
import androidx.fragment.app.Fragment
import java.io.BufferedReader
import java.io.InputStreamReader

class ViewerFragment : Fragment() {

    private lateinit var webView: WebView
    private lateinit var drawerLayout: DrawerLayout
    private lateinit var tocContent: ScrollView
    private lateinit var tocTextView: TextView
    private lateinit var fileNameView: TextView
    private var currentFilePath: String? = null
    private val gson by lazy { com.google.gson.Gson() }

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

    inner class TocBridge {
        @JavascriptInterface
        fun onHeadingClick(anchor: String) {
            activity?.runOnUiThread {
                drawerLayout.closeDrawer(tocContent)
            }
        }
    }
}

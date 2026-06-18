import SwiftUI
import WebKit

struct MarkdownWebView: View {
    let fileURL: URL

    var body: some View {
        MarkdownWebViewRepresentable(fileURL: fileURL)
            .ignoresSafeArea(edges: .bottom)
    }
}

private struct MarkdownWebViewRepresentable: UIViewRepresentable {
    let fileURL: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.isScrollEnabled = true
        webView.isOpaque = false
        webView.backgroundColor = .white

        loadContent(into: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        loadContent(into: webView)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    private func loadContent(into webView: WKWebView) {
        guard let content = try? String(contentsOf: fileURL, encoding: .utf8) else {
            webView.loadHTMLString("<html><body><p>读取文件失败</p></body></html>", baseURL: nil)
            return
        }

        guard let bundlePath = Bundle.main.path(forResource: "core-bundle", ofType: "js"),
              let bundleScript = try? String(contentsOfFile: bundlePath) else {
            let escaped = content
                .replacingOccurrences(of: "&", with: "&amp;")
                .replacingOccurrences(of: "<", with: "&lt;")
                .replacingOccurrences(of: ">", with: "&gt;")
            webView.loadHTMLString("<html><body style=\"font-family:-apple-system,sans-serif;padding:24px\"><pre>\(escaped)</pre></body></html>", baseURL: nil)
            return
        }

        let safeContent = content
            .replacingOccurrences(of: "</script>", with: "<\\/script>")
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "`", with: "\\`")
            .replacingOccurrences(of: "$", with: "\\$")

        let html = """
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
        <style>
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, "PingFang SC", "Helvetica Neue", sans-serif;
          line-height: 1.8; color: #1a1a2e;
          padding: 20px 24px; max-width: 100%;
          margin: 0; word-wrap: break-word; background: #fff;
        }
        h1, h2, h3, h4, h5, h6 { margin-top: 28px; margin-bottom: 14px; font-weight: 700; line-height: 1.3; }
        h1 { font-size: 1.8em; border-bottom: 2px solid #0366d6; padding-bottom: 10px; }
        h2 { font-size: 1.4em; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        h3 { font-size: 1.15em; color: #0366d6; }
        p { margin-bottom: 14px; }
        a { color: #0366d6; text-decoration: none; }
        code { background: #f0f2f5; border-radius: 4px; font-family: "SF Mono", monospace; font-size: 85%; padding: 2px 6px; }
        pre { background: #1e1e2e; color: #cdd6f4; border-radius: 10px; padding: 16px; overflow-x: auto; margin: 16px 0; }
        pre code { background: none; padding: 0; font-size: 13px; color: inherit; }
        blockquote { border-left: 4px solid #0366d6; background: #f0f5ff; padding: 10px 16px; margin: 14px 0; border-radius: 0 8px 8px 0; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; border-radius: 6px; overflow: hidden; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        th { background: #f0f5ff; font-weight: 700; color: #0366d6; }
        tr:nth-child(even) td { background: #f9fafb; }
        img { max-width: 100%; border-radius: 8px; }
        ul, ol { padding-left: 1.8em; margin-bottom: 14px; }
        li { margin-bottom: 4px; }
        hr { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }
        .math-block { text-align: center; padding: 16px 0; overflow-x: auto; }
        .mermaid-container { margin: 16px 0; text-align: center; background: #f9fafb; border-radius: 10px; padding: 12px; }
        .mermaid-error { color: #ef4444; background: #fef2f2; padding: 10px; border-radius: 8px; border: 1px solid #ef4444; font-family: monospace; }
        </style>
        </head>
        <body>
        <div id="content">\(safeContent)</div>
        <script>\(bundleScript)</script>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
        <script>
        (function() {
          var raw = document.getElementById('content').textContent;
          if (typeof MDReaderCore !== 'undefined' && MDReaderCore.renderBodyOnly) {
            document.getElementById('content').innerHTML = MDReaderCore.renderBodyOnly(raw);
          }
          document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(function(h) {
            if (!h.id) {
              h.id = h.textContent.toLowerCase().replace(/[^\\w\\u4e00-\\u9fff-]+/g, '-').replace(/^-+|-+$/g, '');
            }
          });
          if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ startOnLoad: false, securityLevel: 'sandbox' });
            document.querySelectorAll('.mermaid-placeholder').forEach(function(p) {
              var code = decodeURIComponent(p.getAttribute('data-mermaid-code') || '');
              if (!code) return;
              try {
                mermaid.render(p.id, code)
                  .then(function(r) { p.innerHTML = r.svg; p.classList.add('mermaid-container'); })
                  .catch(function() { p.innerHTML = '<pre class="mermaid-error">Mermaid parse error</pre>'; });
              } catch(e) {}
            });
          }
        })();
        </script>
        </body>
        </html>
        """

        webView.loadHTMLString(html, baseURL: fileURL.deletingLastPathComponent())
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            webView.loadHTMLString("<html><body><p>页面加载失败</p></body></html>", baseURL: nil)
        }
    }
}

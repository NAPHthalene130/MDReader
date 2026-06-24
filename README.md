# MDReader

一个跨平台的 Markdown 阅读器，顺手写的，支持 Windows、Android 和 iOS。

写这个的原因很简单——我在不同设备上看 .md 文件的需求挺多，但每个平台都要折腾不同的工具。干脆自己搞一个，渲染引擎共用，各端只做壳。

## 能干什么

- **Markdown 渲染**，基于 markdown-it，支持 CommonMark 和 GFM（表格、任务列表、删除线那些都有）
- **LaTeX 数学公式**，行内和块级都支持，用 KaTeX 渲染
- **Mermaid 图表**，把 mermaid 代码块直接转成 SVG
- **代码高亮**，highlight.js，常见的语言都认
- **目录导航**，自动提取标题生成侧栏目录，点击能跳
- **最近阅读**，记录你打开过的文件，方便接着看
- **本地文件**，打开设备上的 .md 或 .markdown 文件

## 项目结构

```
src/
  core/      共享的 TypeScript 渲染引擎，所有平台都靠它
  windows/   Electron 桌面端
  android/   Kotlin + WebView 的 Android 端
  ios/       SwiftUI + WKWebView 的 iOS 端
  scripts/   构建用的辅助脚本
  demo/      Web 端的演示页
```

## 各平台进展

Core 部分已经比较稳了，26 个测试用例全过。

Windows 端之前有些小毛病（Electron IPC 和 preload 相关），修了 5 处，现在能用。

Android 和 iOS 端代码逻辑没问题，CI 也能正常构建出 APK 和 .app。但说实话，还没在真机上完整跑过，如果有人愿意帮忙测一下那就太好了。

## 跑起来

### 环境要求

- Node.js 18+
- JDK 17+（Android）
- Android SDK（Android）
- Xcode 15.4+（iOS）

### 步骤

先把 Core 构建了，这是所有端的前置：

```bash
cd src/core && npm install && npm run build
```

然后看你要跑哪个端：

```bash
# Windows
cd src/windows && npm install && npm run dev

# Android
npm run build:android

# iOS
npm run build:ios
```

## CI / CD

push 或者提 PR 到 main 分支的时候，GitHub Actions 会自动构建，产物命名长这样：

- `MDReader-v{version}-setup.exe`
- `MDReader-v{version}.apk`
- `MDReader-v{version}-ios.app.zip`

## 用到的轮子

| 轮子 | 版本 | 干什么的 |
|------|------|----------|
| markdown-it | 14.x | Markdown 解析渲染 |
| KaTeX | 0.16.9 | 数学公式渲染 |
| Mermaid | 10.9.0 | 流程图/图表 |
| highlight.js | 11.9 | 代码语法高亮 |

Core 用 TypeScript 写，Webpack 打包成 core-bundle.js，测试用的 Vitest。

## 许可证

MIT，随便用。

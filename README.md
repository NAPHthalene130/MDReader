# MDReader

> 跨平台 Markdown 阅读器 · Windows / Android / iOS

## 项目背景

Markdown 在技术写作、文档管理、笔记记录这些场景里几乎成了标配，但一个尴尬的现实是——不同平台上想找个好用的 .md 阅读器并不容易。桌面端和移动端的工具割裂，体验也不统一。

MDReader 尝试解决这个问题：**一套渲染引擎，三个平台共用**。核心逻辑用 TypeScript 写一次，打包成独立的 JS bundle，各平台只负责提供容器和本地文件读写能力。这样既避免了重复造轮子，也保证了渲染结果在 Windows、Android、iOS 上完全一致。

## 功能

- **完整的 GFM 支持**：表格、任务列表、删除线、脚注等，基于 markdown-it
- **LaTeX 数学公式**：行内 `$...$` 和块级 `$$...$$`，KaTeX 渲染
- **Mermaid 图表**：在文档里直接写流程图、时序图、类图，自动转 SVG
- **代码语法高亮**：highlight.js，覆盖主流编程语言
- **自动目录生成**：从标题层级提取，侧栏展示，支持点击跳转
- **最近阅读记录**：本地持久化打开过的文件列表

## 架构设计

```
┌─────────────────────────────────────┐
│            core (TypeScript)         │
│   markdown-it + KaTeX + Mermaid     │
│          → core-bundle.js           │
└──────────┬──────┬───────┬───────────┘
           │      │       │
      ┌────┘      │       └────┐
      ▼           ▼            ▼
  ┌────────┐ ┌────────┐ ┌──────────┐
  │Windows │ │Android │ │   iOS    │
  │Electron│ │WebView │ │ WKWebView│
  └────────┘ └────────┘ └──────────┘
```

核心思路是**渲染与平台解耦**。Core 层不依赖任何平台 API，纯粹接收 Markdown 字符串，吐出 HTML。各端拿到 HTML 后灌进 WebView / BrowserWindow，再通过各自的原生能力处理文件选择、本地存储这类事情。

这样做的几个好处：
- 渲染一致性有保证，不会出现桌面端和手机端显示效果不一样的情况
- 新增功能只需要改 Core，三个平台同时受益
- 各端代码量很少，维护成本低

## 项目结构

```
src/
  core/       TypeScript 渲染引擎，Webpack 打包
  windows/    Electron 桌面应用，IPC + preload 模式
  android/    Kotlin 原生壳 + WebView 加载
  ios/        SwiftUI 原生壳 + WKWebView 加载
  scripts/    构建辅助
  demo/       Web 端在线演示
```

## 开发状态

| 模块 | 状态 | 备注 |
|------|------|------|
| Core | 已完成 | 26 个测试用例，Vitest |
| Windows | 已完成 | 修复了 5 处 IPC 安全问题 |
| Android | 可构建 | 逻辑验证通过，待真机测试 |
| iOS | 可构建 | 逻辑验证通过，待真机测试 |

Windows 端在开发过程中遇到的主要问题是 Electron 的 preload 脚本与渲染进程之间的通信安全——最初用了 `contextIsolation: false` 的简化方案，后来改为 preload + `contextBridge` 的标准做法，修复了 5 处相关漏洞。

移动端目前可以在模拟器上跑通，CI 构建也正常。真机测试受限于开发者账号和设备，是后续计划的一部分。

## 构建 & 运行

环境依赖：
- Node.js 18+
- JDK 17+（Android 构建需要）
- Android SDK（Android 构建需要）
- Xcode 15.4+（iOS 构建需要）

```bash
# 1. 先构建 Core（所有端的公共步骤）
cd src/core
npm install
npm run build

# 2. 选择目标平台
# Windows
cd src/windows && npm install && npm run dev

# Android
npm run build:android

# iOS
npm run build:ios
```

## CI/CD

通过 GitHub Actions 在 push 或 PR 到 main 分支时自动触发构建，产出：

- `MDReader-v{version}-setup.exe` — Windows 安装包
- `MDReader-v{version}.apk` — Android 安装包
- `MDReader-v{version}-ios.app.zip` — iOS 应用包

## 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| markdown-it | 14.x | Markdown 解析 |
| KaTeX | 0.16.9 | 数学公式渲染 |
| Mermaid | 10.9.0 | 图表渲染（CDN 加载） |
| highlight.js | 11.9 | 代码高亮 |

构建工具链：TypeScript → Webpack → 单文件 bundle，测试框架 Vitest。

## 许可证

MIT

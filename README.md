# MDReader

> 跨平台 Markdown 阅读器 · Windows / Android / iOS

## 功能

- **完整的 GFM 支持**：表格、任务列表、删除线、脚注等，基于 markdown-it
- **LaTeX 数学公式**：行内 `$...$` 和块级 `$$...$$`，KaTeX 渲染
- **Mermaid 图表**：在文档里直接写流程图、时序图、类图，自动转 SVG
- **代码语法高亮**：highlight.js，覆盖主流编程语言
- **自动目录生成**：从标题层级提取，侧栏展示，支持点击跳转
- **最近阅读记录**：本地持久化打开过的文件列表

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
npm run build:windows

# Android
npm run build:android

# iOS
npm run build:ios
```

## 许可证

MIT

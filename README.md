# Force New Tab Opener (强制新标签页打开)

[English](#english) | [中文](#chinese)

<a name="chinese"></a>
## 🚀 中文说明

这是一个强大的 Chrome 扩展插件，旨在攻克现代网页（尤其是单页应用 SPA）中难以拦截的跳转行为。它能确保所有链接和点击动作都在新标签页中打开，而不会刷新或覆盖当前页面。

### 🌟 核心特性
- **全局拦截**：支持所有网站，包括 YouTube、GitHub 等。
- **攻克 SPA & 硬跳转**：利用 Chrome 原生 **Navigation API**，完美拦截那些不使用 `<a>` 标签、通过 `window.location` 强制跳转的“假链接”。
- **系统级权限**：通过 Background Service Worker 绕过浏览器的弹窗拦截器（Popup Blocker）。
- **智能控制**：
  - **总开关**：一键开启或关闭全局拦截功能。
  - **白名单管理**：支持将当前网站一键加入白名单，白名单内的网站将保持原生行为，不受插件干扰。
- **绕过 CSP 限制**：通过 Manifest V3 的 `MAIN` world 注入技术，突破高安全性网站的内容安全策略。

### 🛠️ 安装方法
1. **下载代码**：点击 `Code` -> `Download ZIP` 并解压，或使用 `git clone`。
2. **扩展管理**：在 Chrome 地址栏访问 `chrome://extensions/`。
3. **开发者模式**：开启右上角的“开发者模式 (Developer mode)”。
4. **加载插件**：点击“加载已解压的扩展程序 (Load unpacked)”，选择本项目文件夹。

### 📄 使用说明
- 点击地址栏旁边的插件图标即可看到控制面板。
- 只有在手动点击或鼠标操作后的 1.5 秒内触发的跳转会被拦截，防止网页自动加载时乱跳。

---

<a name="english"></a>
## 🚀 English Description

A powerful Chrome extension designed to intercept stubborn navigation behaviors in modern web applications (especially SPAs). It ensures that all links and click actions open in a new tab without refreshing or overwriting the current page.

### 🌟 Key Features
- **Global Interception**: Supports all websites, including YouTube, GitHub, etc.
- **SPA & Hard Navigation Support**: Utilizes the native Chrome **Navigation API** to perfectly intercept "fake links" that bypass `<a>` tags and use `window.location` for hard redirects.
- **System-level Execution**: Uses a Background Service Worker to bypass browser Popup Blockers.
- **Smart Control**:
  - **Master Switch**: One-click to enable or disable global interception.
  - **Whitelist Management**: Easily add the current site to a whitelist. Whitelisted sites will maintain their original behavior.
- **Bypass CSP Restrictions**: Uses Manifest V3 `MAIN` world injection to bypass Content Security Policy (CSP) on high-security websites.

### 🛠️ Installation
1. **Download**: Click `Code` -> `Download ZIP` and extract it, or use `git clone`.
2. **Extensions Page**: Navigate to `chrome://extensions/` in your Chrome browser.
3. **Developer Mode**: Enable "Developer mode" in the top right corner.
4. **Load Extension**: Click "Load unpacked" and select this project folder.

### 📄 Usage Notes
- Click the extension icon next to the address bar to access the control panel.
- Only navigations triggered within 1.5 seconds of a manual click or mouse action will be intercepted, preventing accidental popups during background auto-loading.

## 📄 License
MIT License
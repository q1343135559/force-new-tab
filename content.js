// content.js
console.log("🛡️ [ForceNewTab] 隔离环境脚本就绪");

let isEnabled = true;
let whitelist = [];
const currentHostname = window.location.hostname;

// 智能白名单匹配（支持去掉 www. 及泛子域名匹配）
function isDomainWhitelisted(whitelistArray, hostname) {
    const cleanHost = hostname.replace(/^www\./, '');
    return whitelistArray.some(domain => {
        const cleanDomain = domain.replace(/^www\./, '');
        return cleanHost === cleanDomain || cleanHost.endsWith('.' + cleanDomain);
    });
}

function loadConfig() {
    try {
        chrome.storage.local.get({ isEnabled: true, whitelist: [] }, (result) => {
            isEnabled = result.isEnabled;
            whitelist = result.whitelist;

            const isWhitelisted = isDomainWhitelisted(whitelist, currentHostname);
            const isPluginActive = isEnabled && !isWhitelisted;

            document.documentElement.dataset.forceNewTabActive = isPluginActive;
        });
    } catch (e) {
        console.warn("⚠️ [ForceNewTab] 无法读取配置，插件可能正在更新中，请刷新网页。");
    }
}

// 页面加载时初始化配置
loadConfig();

// 监听来自 Popup 的配置更新消息
try {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "updateConfig") {
            loadConfig();
        }
    });
} catch (e) { }

// ==========================================
// 🛡️ 新增：请求去重防抖机制 (解决一次点击打开两个标签的Bug)
// ==========================================
let lastSentUrl = "";
let lastSentTime = 0;

// 安全发送消息的封装函数
function safeSendMessage(url) {
    // 1. 基本清理
    let cleanUrl = url.split('#')[0];

    // 2. 针对 YouTube 等平台的参数清理 (可选，增强鲁棒性)
    // 如果包含 watch?v=，只保留 v 参数进行对比去重
    if (cleanUrl.includes('youtube.com/watch')) {
        const urlObj = new URL(cleanUrl);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) cleanUrl = `yt_video_${videoId}`;
    }

    if (cleanUrl === lastSentUrl && (Date.now() - lastSentTime) < 1000) {
        console.log("🛡️ [防重复拦截] 1秒内已打开过，忽略:", cleanUrl);
        return;
    }

    lastSentUrl = cleanUrl;
    lastSentTime = Date.now();

    try {
        chrome.runtime.sendMessage({ action: "openNewTab", url: url });
    } catch (e) {
        // ... 原有的错误处理 ...
    }
}

// 处理正规的 <a> 标签
document.addEventListener('click', function (event) {
    if (document.documentElement.dataset.forceNewTabActive !== 'true') return;

    const targetLink = event.target.closest('a');
    if (!targetLink || !targetLink.hasAttribute('href')) return;

    // --- 🚀 通用语义化识别逻辑 ---
    // 只要点击发生在“导航性质”的容器内，就不强制新标签打开
    const isNavigationUI = targetLink.closest(
        'nav, aside, ' +                             // HTML5 语义标签
        '[role="navigation"], [role="complementary"], ' + // ARIA 标准角色
        '[data-e2e*="nav"], [data-e2e*="side"], ' +   // TikTok/抖音 常用属性模式
        '[data-testid*="nav"], [aria-label*="导航"]'    // 其他常见通用模式
    );

    if (isNavigationUI) {
        console.log("🛡️ [通用适配] 检测到侧边栏/导航区点击，放行原位跳转");
        return;
    }

    const rawHref = targetLink.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;
    if (targetLink.hasAttribute('download')) return;

    const role = targetLink.getAttribute('role');
    if (role && ['button', 'tab'].includes(role)) return;

    const currentUrlWithoutHash = window.location.href.split('#')[0];
    const targetUrlWithoutHash = targetLink.href.split('#')[0];
    if (currentUrlWithoutHash === targetUrlWithoutHash) return;

    // 确定要拦截后，取消默认行为
    event.preventDefault();
    event.stopPropagation();

    // 使用容错函数发送请求
    safeSendMessage(targetLink.href);
}, true);

// 接收来自 inject.js 的求助信号
window.addEventListener("ForceNewTab_RequestOpen", (event) => {
    if (event.detail && event.detail.url) {
        safeSendMessage(event.detail.url);
    }
});
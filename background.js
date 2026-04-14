// background.js
const lastOpened = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openNewTab" && request.url) {
        const tabId = sender.tab ? sender.tab.id : 'unknown';
        const now = Date.now();
        const cleanUrl = request.url.split('#')[0];

        // --- 核心修复逻辑 ---
        if (lastOpened[tabId]) {
            const timeDiff = now - lastOpened[tabId].time;
            const isSameUrl = lastOpened[tabId].url === cleanUrl;

            // 如果 800ms 内同一个标签页再次请求，无论 URL 是否完全一致（处理 YouTube 动态参数），都拦截
            if (timeDiff < 800) {
                console.log("🛡️ [后台去重] 拦截到并发触发 (时间锁):", cleanUrl);
                return;
            }

            // 如果 2秒内 URL 完全一致，继续拦截（防止连击）
            if (isSameUrl && timeDiff < 2000) {
                console.log("🛡️ [后台去重] 拦截到重复 URL (URL 匹配):", cleanUrl);
                return;
            }
        }

        lastOpened[tabId] = { url: cleanUrl, time: now };
        chrome.tabs.create({ url: request.url, active: true });
    }
});
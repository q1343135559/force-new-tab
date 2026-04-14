// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openNewTab" && request.url) {
        // 使用原生 API 强行打开新标签页
        chrome.tabs.create({ url: request.url, active: true });
    }
});
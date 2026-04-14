// content.js
let isEnabled = true; // 默认开启

// 1. 页面加载时读取存储的状态
chrome.storage.local.get({ isEnabled: true }, (result) => {
    isEnabled = result.isEnabled;
    // 将状态刻在网页的最外层，方便 inject.js 读取
    document.documentElement.dataset.forceNewTabEnabled = isEnabled;
});

// 2. 监听来自右上角开关的【实时更新】消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateState") {
        isEnabled = request.isEnabled;
        document.documentElement.dataset.forceNewTabEnabled = isEnabled;
    }
});

// 3. 处理正规的 <a> 标签
document.addEventListener('click', function (event) {
    if (!isEnabled) return; // 【新增】开关关闭时，直接放行！

    const targetLink = event.target.closest('a');
    if (!targetLink || !targetLink.hasAttribute('href')) return;

    const rawHref = targetLink.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;
    if (targetLink.hasAttribute('download')) return;

    const role = targetLink.getAttribute('role');
    if (role && ['button', 'tab'].includes(role)) return;

    const currentUrlWithoutHash = window.location.href.split('#')[0];
    const targetUrlWithoutHash = targetLink.href.split('#')[0];
    if (currentUrlWithoutHash === targetUrlWithoutHash) return;

    event.preventDefault();
    event.stopPropagation();
    chrome.runtime.sendMessage({ action: "openNewTab", url: targetLink.href });
}, true);

// 4. 接收来自 inject.js 的求助信号
window.addEventListener("ForceNewTab_RequestOpen", (event) => {
    if (event.detail && event.detail.url) {
        chrome.runtime.sendMessage({ action: "openNewTab", url: event.detail.url });
    }
});
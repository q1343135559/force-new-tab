// content.js
console.log("🛡️ [ForceNewTab] 隔离环境脚本就绪，负责普通链接与通讯桥梁");

// 1. 处理正规的 <a> 标签
document.addEventListener('click', function (event) {
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

    // 通知后台开新页面
    chrome.runtime.sendMessage({ action: "openNewTab", url: targetLink.href });
}, true);

// 2. 接收来自 inject.js (MAIN 环境) 的求助信号，并转发给后台！(这是你之前漏掉的)
window.addEventListener("ForceNewTab_RequestOpen", (event) => {
    if (event.detail && event.detail.url) {
        console.log("📨 [ForceNewTab] 收到 MAIN 环境请求，发给后台:", event.detail.url);
        chrome.runtime.sendMessage({ action: "openNewTab", url: event.detail.url });
    }
});
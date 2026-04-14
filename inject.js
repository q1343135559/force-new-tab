// inject.js
console.log("🔥 [ForceNewTab] 启动 Chrome 原生 Navigation API 拦截盾！");

let lastClickTime = 0;

// 记录用户所有的鼠标点击动作
['mousedown', 'click', 'pointerdown'].forEach(type => {
    window.addEventListener(type, () => {
        lastClickTime = Date.now();
    }, true);
});

// 调用 Chrome 官方的系统级导航拦截 API (专门克制 window.location 跳转)
if (window.navigation) {
    window.navigation.addEventListener('navigate', (event) => {
        // 如果是浏览器底层不可取消的动作，直接放行
        if (!event.cancelable) return;

        const targetUrl = event.destination.url;
        const currentUrl = window.location.href.split('#')[0];
        const targetUrlWithoutHash = targetUrl.split('#')[0];

        // 排除同一页面内的锚点刷新
        if (currentUrl === targetUrlWithoutHash) return;

        // 核心判断：只有鼠标操作后 1.5 秒内触发的跳转，才会被拦截
        const isUserAction = (Date.now() - lastClickTime) < 1500 || event.userInitiated;

        if (isUserAction) {
            console.log(`💥 [Navigation API] 成功截获底层硬跳转 -> ${targetUrl}`);

            // 1. 系统级指令：彻底取消当前页面的跳走与卸载！原网页稳如泰山！
            event.preventDefault();

            // 2. 发送信号给 content.js，让后台去新标签打开该网址
            window.dispatchEvent(new CustomEvent("ForceNewTab_RequestOpen", {
                detail: { url: targetUrl }
            }));
        }
    });
} else {
    console.log("❌ 浏览器版本过低，不支持 Navigation API");
}

// 兜底防御：防止它用原生的 window.open 强制替换当前窗口
const originalOpen = window.open;
window.open = function (url, target, features) {
    if (!target || target === '_self' || target === window.name) {
        if ((Date.now() - lastClickTime) < 1500) {
            target = '_blank';
            console.log(`💥 [拦截成功] 强行修改 window.open 为新标签 -> ${url}`);
        }
    }
    return originalOpen.call(this, url, target, features);
};
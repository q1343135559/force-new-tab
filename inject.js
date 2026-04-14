// inject.js
console.log("🔥 [ForceNewTab] 启动 Chrome 原生 Navigation API 拦截盾！(包含 UI 按钮防误杀机制)");

let lastClickTime = 0;
let lastClickTarget = null;

function isPluginActive() {
    return document.documentElement.dataset.forceNewTabActive === 'true';
}

['mousedown', 'click', 'pointerdown'].forEach(type => {
    window.addEventListener(type, (e) => {
        lastClickTime = Date.now();
        lastClickTarget = e.target;
    }, true);
});

if (window.navigation) {
    window.navigation.addEventListener('navigate', (event) => {
        if (!isPluginActive()) return;
        if (!event.cancelable) return;

        const targetUrl = event.destination.url;
        const currentUrl = window.location.href.split('#')[0];
        const targetUrlWithoutHash = targetUrl.split('#')[0];

        if (currentUrl === targetUrlWithoutHash) return;

        if (lastClickTarget) {
            const isUiControl = lastClickTarget.closest(
                'button, [role="button"], [role="tab"], [role="menuitem"], ' +
                'nav, aside, [role="navigation"], ' +        // 这里的增加能覆盖 TikTok/Douyin
                '[data-e2e*="nav"], [data-e2e*="side"], ' +   // 完美匹配 TikTok 侧边栏
                'yt-touch-feedback-shape, tp-yt-paper-item'   // 仅保留极少数无法语义化的 YouTube 特例
            );

            if (isUiControl) {
                console.log("🛡️ [防误杀] 语义化命中导航控件:", isUiControl);
                return;
            }
        }

        const isUserAction = (Date.now() - lastClickTime) < 1500 || event.userInitiated;

        if (isUserAction) {
            console.log(`💥 [Navigation API] 成功截获底层硬跳转 -> ${targetUrl}`);
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("ForceNewTab_RequestOpen", {
                detail: { url: targetUrl }
            }));
        }
    });
} else {
    console.log("❌ 浏览器版本过低，不支持 Navigation API");
}

const originalOpen = window.open;
window.open = function (url, target, features) {
    if (isPluginActive() && (!target || target === '_self' || target === window.name)) {
        if ((Date.now() - lastClickTime) < 1500) {
            target = '_blank';
        }
    }
    return originalOpen.call(this, url, target, features);
};
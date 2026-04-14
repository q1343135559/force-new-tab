// inject.js
let lastClickTime = 0;

// 【新增】检查插件开关是否开启
function isPluginEnabled() {
    return document.documentElement.dataset.forceNewTabEnabled !== 'false';
}

['mousedown', 'click', 'pointerdown'].forEach(type => {
    window.addEventListener(type, () => { lastClickTime = Date.now(); }, true);
});

if (window.navigation) {
    window.navigation.addEventListener('navigate', (event) => {
        if (!isPluginEnabled()) return; // 【新增】开关关闭时，不管它，放行！
        if (!event.cancelable) return;

        const targetUrl = event.destination.url;
        const currentUrl = window.location.href.split('#')[0];
        const targetUrlWithoutHash = targetUrl.split('#')[0];

        if (currentUrl === targetUrlWithoutHash) return;

        const isUserAction = (Date.now() - lastClickTime) < 1500 || event.userInitiated;

        if (isUserAction) {
            event.preventDefault();
            window.dispatchEvent(new CustomEvent("ForceNewTab_RequestOpen", {
                detail: { url: targetUrl }
            }));
        }
    });
}

const originalOpen = window.open;
window.open = function (url, target, features) {
    // 【新增】加入 isPluginEnabled() 判断
    if (isPluginEnabled() && (!target || target === '_self' || target === window.name)) {
        if ((Date.now() - lastClickTime) < 1500) {
            target = '_blank';
        }
    }
    return originalOpen.call(this, url, target, features);
};
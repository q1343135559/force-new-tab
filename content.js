// content.js

// 监听整个 document 的 click 事件
// 注意第三个参数 true：开启“捕获阶段 (Capture phase)”
// 这意味着事件从最外层往下传递时，我们就先拦截它，而不是等它冒泡上来
document.addEventListener('click', function (event) {

    // 1. 寻找被点击元素最近的 <a> 标签 (处理点击在图标或文字上的情况)
    const targetLink = event.target.closest('a');

    // 如果没点到链接，或者链接没有 href 属性，直接放行
    if (!targetLink || !targetLink.href) return;

    // 2. 获取原始的 href 属性值
    const rawHref = targetLink.getAttribute('href');

    // 3. 排除一些特殊链接（例如 JavaScript 动作、页内锚点跳转、发邮件）
    if (!rawHref ||
        rawHref.startsWith('javascript:') ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:')) {
        return;
    }

    // 4. 核心防御：阻止默认的跳转行为，并阻止事件继续向下或向上级传播
    // 这一步彻底干掉了 YouTube 等前端框架的路由拦截机制
    event.preventDefault();
    event.stopPropagation();

    // 5. 强制在新标签页打开目标链接
    window.open(targetLink.href, '_blank');

}, true);
// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggleSwitch');

    // 初始化：读取当前存储的开关状态，默认为开启 (true)
    chrome.storage.local.get({ isEnabled: true }, (result) => {
        toggleSwitch.checked = result.isEnabled;
    });

    // 当用户点击开关时
    toggleSwitch.addEventListener('change', () => {
        const isEnabled = toggleSwitch.checked;

        // 1. 保存状态到数据库
        chrome.storage.local.set({ isEnabled: isEnabled }, () => {

            // 2. 实时通知所有打开的网页：状态变了！
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, { action: "updateState", isEnabled: isEnabled }).catch(() => {
                        // 忽略某些系统页面无法接收消息的报错
                    });
                });
            });
        });
    });
});
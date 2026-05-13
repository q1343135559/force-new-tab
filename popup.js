// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const addWhitelistBtn = document.getElementById('addWhitelistBtn');
    const currentDomainInfo = document.getElementById('currentDomainInfo');
    const whitelistItemsContainer = document.getElementById('whitelistItems');

    let currentDomain = '';

    // 主机名归一化：统一小写（不删除 www，以保留用户视觉上的真实域名）
    function normalizeHost(host) {
        return (host || '').toLowerCase();
    }

    // 用于判断白名单是否已经包含某个域名（严格精确匹配，仅 www. 前缀视为等同）
    function isAlreadyInWhitelist(whitelist, host) {
        const cleanHost = normalizeHost(host).replace(/^www\./, '');
        return whitelist.some(d => normalizeHost(d).replace(/^www\./, '') === cleanHost);
    }

    // 1. 获取当前页面的域名
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                // 排除 chrome:// 等内部页面
                if (url.protocol.startsWith('http')) {
                    currentDomain = normalizeHost(url.hostname);
                    currentDomainInfo.textContent = currentDomain;
                } else {
                    currentDomainInfo.textContent = "无法在此页面加入受控白名单";
                    addWhitelistBtn.style.display = 'none';
                }
            } catch (e) {
                currentDomainInfo.textContent = "无效的 URL";
                addWhitelistBtn.style.display = 'none';
            }
        }
    });

    // 2. 初始化：读取总开关和白名单数据
    chrome.storage.local.get({ isEnabled: true, whitelist: [] }, (result) => {
        toggleSwitch.checked = result.isEnabled;
        renderWhitelist(result.whitelist);
        updateAddButtonState(result.whitelist);
    });

    // 3. 监听总开关变化
    toggleSwitch.addEventListener('change', () => {
        const isEnabled = toggleSwitch.checked;
        chrome.storage.local.set({ isEnabled: isEnabled }, () => {
            notifyTabsUpdate();
        });
    });

    // 4. 添加当前域名到受控白名单
    addWhitelistBtn.addEventListener('click', () => {
        if (!currentDomain) return;
        chrome.storage.local.get({ whitelist: [] }, (result) => {
            const whitelist = result.whitelist;
            if (!isAlreadyInWhitelist(whitelist, currentDomain)) {
                whitelist.push(currentDomain);
                chrome.storage.local.set({ whitelist: whitelist }, () => {
                    renderWhitelist(whitelist);
                    updateAddButtonState(whitelist);
                    notifyTabsUpdate();
                });
            }
        });
    });

    // 5. 渲染白名单列表
    function renderWhitelist(whitelist) {
        whitelistItemsContainer.innerHTML = '';
        if (whitelist.length === 0) {
            whitelistItemsContainer.innerHTML = '<div class="empty-text">暂无受控白名单网站</div>';
            return;
        }

        whitelist.forEach(domain => {
            const item = document.createElement('div');
            item.className = 'whitelist-item';
            item.innerHTML = `
                <span class="domain-text" title="${domain}">${domain}</span>
                <button class="remove-btn" data-domain="${domain}">移除</button>
            `;
            whitelistItemsContainer.appendChild(item);
        });

        // 绑定移除按钮事件
        const removeBtns = document.querySelectorAll('.remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const domainToRemove = e.target.getAttribute('data-domain');
                removeFromWhitelist(domainToRemove);
            });
        });
    }

    // 6. 从白名单移除
    function removeFromWhitelist(domain) {
        chrome.storage.local.get({ whitelist: [] }, (result) => {
            const whitelist = result.whitelist.filter(d => d !== domain);
            chrome.storage.local.set({ whitelist: whitelist }, () => {
                renderWhitelist(whitelist);
                updateAddButtonState(whitelist);
                notifyTabsUpdate();
            });
        });
    }

    // 7. 更新“添加”按钮状态（如果已在受控白名单，则置灰/不可点）
    function updateAddButtonState(whitelist) {
        if (currentDomain && isAlreadyInWhitelist(whitelist, currentDomain)) {
            addWhitelistBtn.textContent = "已在受控白名单中";
            addWhitelistBtn.disabled = true;
            addWhitelistBtn.style.opacity = '0.5';
            addWhitelistBtn.style.cursor = 'not-allowed';
        } else {
            addWhitelistBtn.textContent = "加入受控白名单";
            addWhitelistBtn.disabled = false;
            addWhitelistBtn.style.opacity = '1';
            addWhitelistBtn.style.cursor = 'pointer';
        }
    }

    // 8. 通知所有页面更新配置
    function notifyTabsUpdate() {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: "updateConfig" }).catch(() => { });
            });
        });
    }
});
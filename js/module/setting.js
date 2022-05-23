import { getCurrentTab } from "./utils.js";

function switch_setting(data) {
    switch (data.action) {
        case "mute":
            muteTab(true);
            break;
        case "pin":
            pinTab(true);
            break;
        case "unmute":
            muteTab(false);
            break;
        case "unpin":
            pinTab(false);
            break;
        case "create-bookmark":
            createBookmark();
            break;
        case "reload":
            reloadTab();
            break;
        case "incognito":
            openIncognito();
            break;
        case "history":
            openTab("chrome://history/");
            break;
        case "bookmark":
            openTab("chrome://bookmarks/");
            break;
        case "downloads":
            openTab("chrome://downloads/");
            break;
        case "extensions":
            openTab("chrome://extensions/");
            break;
        case "extensions_shortcuts":
            openTab("chrome://extensions/shortcuts");
            break;
        case "settings":
            openTab("chrome://settings/");
            break;
        case "go-back":
            goBack();
            break;
        case "go-forward":
            goForward();
            break;
        case "duplicate-tab":
            duplicateTab();
            break;
        case "close-tab":
            closeCurrentTab();
            break;
        case "close-window":
            closeWindow();
            break;
        case "manage-data":
            openTab("chrome://settings/clearBrowserData");
            break;
        case "remove-all":
            clearAllData();
            break;
        case "remove-history":
            clearHistory();
            break;
        case "remove-cookies":
            clearCookies();
            break;
        case "remove-cache":
            clearCache();
            break;
        case "remove-local-storage":
            clearLocalStorage();
            break;
        case "remove-passwords":
            clearPasswords();
            break;
        default:
            break;
    }
}

function muteTab(mute) {
    getCurrentTab().then((response) => {
        chrome.tabs.update(response.id, { "muted": mute })

        if (pin) {
            chrome.tabs.sendMessage(response.id, { method: "msg", msg: "静音成功！" });
        } else {
            chrome.tabs.sendMessage(response.id, { method: "msg", msg: "取消静音成功！" });
        }
    });
}

function pinTab(pin) {
    getCurrentTab().then((response) => {
        chrome.tabs.update(response.id, { "pinned": pin })

        if (pin) {
            chrome.tabs.sendMessage(response.id, { method: "msg", msg: "固定成功！" });
        } else {
            chrome.tabs.sendMessage(response.id, { method: "msg", msg: "取消固定成功！" });
        }
    });
}

function createBookmark() {
    getCurrentTab().then((response) => {
        chrome.bookmarks.create({
            title: response.title,
            url: response.url
        });

        chrome.tabs.sendMessage(response.id, { method: "msg", msg: "添加新的书签成功！" });
    })
}

function reloadTab() {
    chrome.tabs.reload();
}

function openTab(url) {
    chrome.tabs.create({
        url: url
    })
}

function openIncognito() {
    chrome.windows.create({ "incognito": true });
}

function goBack() {
    getCurrentTab().then((response) => {
        chrome.tabs.goBack({
            tabs: response.id
        })
    })
}

function goForward() {
    getCurrentTab().then((response) => {
        chrome.tabs.goForward({
            tabs: response.id
        })
    })
}

function duplicateTab() {
    getCurrentTab().then((response) => {
        chrome.tabs.duplicate(response.id);
    })
}

function closeWindow() {
    getCurrentTab().then((response) => {
        chrome.windows.remove(response.id);
    })
}

function closeCurrentTab() {
    getCurrentTab().then((response) => {
        chrome.tabs.remove(response.id);
    })
}

function clearAllData() {
    chrome.browsingData.remove({
        "since": (new Date()).getTime()
    }, {
        "appcache": true,
        "cache": true,
        "cacheStorage": true,
        "cookies": true,
        "downloads": true,
        "fileSystems": true,
        "formData": true,
        "history": true,
        "indexedDB": true,
        "localStorage": true,
        "passwords": true,
        "serviceWorkers": true,
        "webSQL": true
    });
}

function clearHistory() {
    chrome.browsingData.removeHistory({ "since": 0 });
}

function clearCookies() {
    chrome.browsingData.removeCookies({ "since": 0 });
}

function clearCache() {
    chrome.browsingData.removeCache({ "since": 0 });
}

function clearLocalStorage() {
    chrome.browsingData.removeLocalStorage({ "since": 0 });
}

function clearPasswords() {
    chrome.browsingData.removePasswords({ "since": 0 });
}

export { switch_setting }
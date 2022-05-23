import { getCurrentTab } from "./utils.js";

function openMain() {
    getCurrentTab().then((response) => {
        if (!response.url.includes("chrome://") && !response.url.includes("chrome.google.com")) {
            chrome.tabs.sendMessage(response.id, { method: "open" });
        } else {
            chrome.tabs.create({
                url: '/tips.html'
            })
        }
    })
}

function closeMain() {
    getCurrentTab().then((response) => {
        if (!response.url.includes("chrome://") && !response.url.includes("chrome.google.com")) {
            chrome.tabs.sendMessage(response.id, { method: "close" });
        } else {
            chrome.tabs.create({
                url: '/tips.html'
            })
        }
    })
}

function switchTab(data) {
    closeMain();

    chrome.tabs.highlight({
        tabs: data.tab_index,
        windowId: data.tab_windowId
    })

    chrome.windows.update(
        data.tab_windowId,
        { focused: true }
    )
}

function openOptions() {
    chrome.tabs.create({
        url: '/options.html'
    })
}

function search(keywords) {
    chrome.search.query(
        { text: keywords }
    )
}

export { openMain, closeMain, switchTab, openOptions, search }
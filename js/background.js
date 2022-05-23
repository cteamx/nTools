import { getData } from "./module/data.js";
import { switch_setting } from "./module/setting.js";
import { switch_remove } from "./module/remove.js";
import { openMain, switchTab, openOptions } from "./module/action.js";

chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case "open_main":
            openMain();
            break;
        default:
            break;
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { method: "open" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.method) {
        case "get-all-data":
            getData().then((response) => {
                sendResponse(response)
            })
            return true;
        case "switch-tab":
            switchTab(message.data);
            break;
        case "open-options":
            openOptions();
            break;
        case "remove":
            switch_remove(message.data);
            break;
        case "settings":
            switch_setting(message.data);
            break;
        case "curr_so":
            chrome.search.query({ text: message.data })
            break;
        default:
            break;
    }
});
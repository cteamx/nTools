import { getCurrentTab } from "./utils.js";

function switch_remove(data) {
    switch (data.desc) {
        case "Chrome 标签":
            closeTab(data.tab_id);
            break;
        case "书签":
            removeBookmark(data.bookmark_id);
            break;
        default:
            break;
    }
}

function closeTab(id) {
    chrome.tabs.remove(id);

    getCurrentTab().then((response) => {
        chrome.tabs.sendMessage(response.id, { method: "msg", msg: "关闭标签成功！" });
    })
}

function removeBookmark(id) {
    chrome.bookmarks.remove(id);

    getCurrentTab().then((response) => {
        chrome.tabs.sendMessage(response.id, { method: "msg", msg: "删除书签成功！" });
    })
}

export { switch_remove }
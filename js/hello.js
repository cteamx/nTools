const version = "v0.1"
const version_number = 1
var isOpen = false;
var listData = null;
var listSoData = null;

$.get(chrome.runtime.getURL('/hello.html'), function (data) {
    $("body").append(data);
    $("#ntools-logo").attr("src", chrome.runtime.getURL("images/logo.png"));
});

document.onkeydown = (e) => {
    if (e.key == "Escape" && isOpen) {
        closeMain();
    }

    if (e.key == "ArrowDown") {
        if ($(".ntools-item-active").nextAll("div").not(":hidden").first().length) {
            var next = $(".ntools-item-active").nextAll("div").not(":hidden").first();
            $(".ntools-item-active").removeClass("ntools-item-active");
            next.addClass("ntools-item-active");
            next[0].scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    if (e.key == "ArrowUp") {
        if ($(".ntools-item-active").prevAll("div").not(":hidden").first().length) {
            var previous = $(".ntools-item-active").prevAll("div").not(":hidden").first();
            $(".ntools-item-active").removeClass("ntools-item-active");
            previous.addClass("ntools-item-active");
            previous[0].scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    }

    if (e.key == "Enter") {
        var context = analysis();
        action($(".ntools-item-active").attr("data-uuid"), context["keywords"]);
    }
}

document.onmouseover = (e) => {
    if (typeof (e.target.dataset.uuid) != "undefined") {
        $(".ntools-item-active").removeClass("ntools-item-active");
        e.target.setAttribute("class", "ntools-data-list ntools-item-active");
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.method === "open") {
        if (isOpen) {
            closeMain();
        } else {
            getDataList(true);
            openMain();
        }
    } else if (message.method === "close") {
        closeMain();
    } else if (message.method === "msg") {
        show_tips("✅ " + message.msg)
    }
    return true;
});

function show_tips(msg) {
    $("#ntools-tips").text(msg);
    $("#ntools-tips").show();
    setTimeout(() => {
        $("#ntools-tips").hide();
    }, 2000);
}

function openMain() {
    $.get("https://v2.jinrishici.com/one.svg", function (data) {
        var text = $(data).children("svg").children("g").children("text")[0].textContent;
        $("#ntools-gushi").text(text);
    });

    $.get("https://assets.5a8.org/ntools/ntools.json", function (data) {
        if (data.number > version_number) {
            show_tips("📣 发现 " + data.version + " 新版本，更新内容：" + data.text + "");
        }
    });

    isOpen = true;
    $("#ntools-extension").addClass("ntools-show");
    $(".ntools-input").focus();
}

function closeMain() {
    isOpen = false;
    $("#ntools-extension").removeClass("ntools-show");
}

function getDataList(is = true) {
    chrome.runtime.sendMessage({ method: "get-all-data" }, (response) => {
        listData = response;
        if (is) {
            soDataList();
        } else {
            so();
        }
    });
}

var curr_so = { "uuid": "curr_so", "title": "", "desc": "搜索当前内容，采用浏览器默认搜索引擎", "type": "curr_so", "emoji": true, "emojiChar": "🔍", "keycheck": false, "tags": "" };

function soDataList(keywords = null, type = null) {

    if (keywords == null || keywords === "") {
        if (type == null) {
            listSoData = listData.list;
        } else {
            if (type === "标签") {
                listSoData = listData.dict.tabs;
            } else if (type === "书签") {
                listSoData = listData.dict.book;
            } else if (type === "历史") {
                listSoData = listData.dict.historys;
            } else if (type === "删除") {
                var remove_data = [];

                listData.dict.tabs.forEach(e => {
                    e.type = "remove"
                    remove_data.push(e)
                });

                listData.dict.book.forEach(e => {
                    e.type = "remove"
                    remove_data.push(e)
                });

                listSoData = remove_data;
            } else if (type === "操作") {
                listSoData = listData.dict.settings;
            } else if (type === "搜索") {
                listSoData = listData.dict.so;
            } else if (type === "动作") {
                listSoData = listData.dict.action;
            } else if (type === "网站") {
                listSoData = listData.dict.web;
            }
        }
    } else {
        var so_data = null;
        var is_so = true;

        if (type == null) {
            so_data = listData.list;
        } else {
            if (type === "标签") {
                so_data = listData.dict.tabs;
            } else if (type === "书签") {
                so_data = listData.dict.book;
            } else if (type === "历史") {
                so_data = listData.dict.historys;
            } else if (type === "删除") {
                var remove_data = [];

                listData.dict.tabs.forEach(e => {
                    e.type = "remove"
                    remove_data.push(e)
                });

                listData.dict.book.forEach(e => {
                    e.type = "remove"
                    remove_data.push(e)
                });

                so_data = remove_data;
            } else if (type === "操作") {
                so_data = listData.dict.settings;
            } else if (type === "搜索") {
                is_so = false;
                so_data = listData.dict.so;
            } else if (type === "动作") {
                so_data = listData.dict.action;
            } else if (type === "网站") {
                so_data = listData.dict.web;
            }
        }

        if (is_so) {
            const fuse = new Fuse(so_data, {
                includeScore: true,
                keys: ['title', 'desc', 'url', 'tags']
            })

            var all_so_result = []

            const result = fuse.search(keywords)

            if (type == null) {
                curr_so["title"] = "“ " + keywords + " ”"
                all_so_result.push(curr_so);
            }

            result.forEach(data => {
                all_so_result.push(data.item)
            });

            listSoData = all_so_result;
        } else {
            curr_so["title"] = "“ " + keywords + " ”"
            so_data.unshift(curr_so);
            listSoData = so_data;
        }
    }

    var _h = '';

    listSoData.forEach(data => {
        var item_active = "";

        if (_h == "") {
            item_active = "ntools-item-active";
        }

        if (data.emoji) {
            _h += `<div class="ntools-data-list ` + item_active + `" data-uuid="` + data.uuid + `">
<div class="ntools-data-list-icon">` + data.emojiChar + `</div> 
<div class="ntools-data-list-content"><div class="ntools-data-list-title">` + data.title + `</div>
<div class="ntools-data-list-desc">` + data.desc + `</div></div>`;
            if (data.keycheck) {
                _h += `<div class="ntools-data-list-enter">选择<div class="ntools-kbd-enter">` + data.keys.join("+") + `</div></div></div>`;
            } else {
                _h += `<div class="ntools-data-list-enter">选择<div class="ntools-kbd-enter">⏎</div></div></div>`;
            }
        } else {
            _h += `<div class="ntools-data-list ` + item_active + `" data-uuid="` + data.uuid + `">
<div class="ntools-data-list-icon"><img src="`+ data.icon + `"></div> 
<div class="ntools-data-list-content"><div class="ntools-data-list-title">` + data.title + `</div>
<div class="ntools-data-list-desc">` + data.desc + `</div></div>`;
            if (data.keycheck) {
                _h += `<div class="ntools-data-list-enter">选择<div class="ntools-kbd-enter">1</div></div></div>`;
            } else {
                _h += `<div class="ntools-data-list-enter">选择<div class="ntools-kbd-enter">⏎</div></div></div>`;
            }
        }
    });

    $(".ntools-result").html(_h);

    $(".ntools-data-list").on("click", function (e) {
        action(this.dataset.uuid, keywords);
    });
}

function action(uuid, keywords) {
    listSoData.forEach(data => {
        if (data.uuid == uuid) {
            if (data.type === "tab") {
                chrome.runtime.sendMessage({ method: "switch-tab", data: data });
            } else if (data.type === "bookmark") {
                window.open(data.url);
            } else if (data.type === "history") {
                window.open(data.url);
            } else if (data.type === "top") {
                window.open(data.url);
            } else if (data.type === "remove") {
                chrome.runtime.sendMessage({ method: "remove", data: data });
                getDataList(false);
            } else if (data.type === "setting") {
                switch (data.action) {
                    case "new-tab":
                        window.open("");
                        break;

                    case "fullscreen":
                        var elem = document.documentElement;
                        elem.requestFullscreen();
                        break;

                    case "email":
                        window.open("mailto:");
                        break;

                    case "print":
                        closeMain();
                        window.print();
                        break;

                    case "scroll-bottom":
                        window.scrollTo(0, document.body.scrollHeight);
                        break;

                    case "scroll-top":
                        window.scrollTo(0, 0);
                        break;

                    default:
                        chrome.runtime.sendMessage({ method: "settings", data: data });
                        getDataList(false);
                        break;
                }
            } else if (data.type === "so") {
                window.open(data.url + keywords);
            } else if (data.type === "curr_so") {
                chrome.runtime.sendMessage({ method: "curr_so", data: keywords });
            } else if (data.type === "action") {
                window.open(data.url);
            } else if (data.type === "web") {
                window.open(data.url);
            }
        }
    });
}

function analysis() {
    var so_text = $(".ntools-input").val().toLowerCase();
    var new_so_text = $.trim(so_text);

    if (new_so_text.startsWith("/标签")) {
        var tempvalue = $.trim(new_so_text.replace("/标签", ""));
        return { keywords: tempvalue, type: "标签" }
    } else if (new_so_text.startsWith("/书签")) {
        var tempvalue = $.trim(new_so_text.replace("/书签", ""));
        return { keywords: tempvalue, type: "书签" }
    } else if (new_so_text.startsWith("/历史")) {
        var tempvalue = $.trim(new_so_text.replace("/历史", ""));
        return { keywords: tempvalue, type: "历史" }
    } else if (new_so_text.startsWith("/删除")) {
        var tempvalue = $.trim(new_so_text.replace("/删除", ""));
        return { keywords: tempvalue, type: "删除" }
    } else if (new_so_text.startsWith("/操作")) {
        var tempvalue = $.trim(new_so_text.replace("/操作", ""));
        return { keywords: tempvalue, type: "操作" }
    } else if (new_so_text.startsWith("/搜索")) {
        var tempvalue = $.trim(new_so_text.replace("/搜索", ""));
        return { keywords: tempvalue, type: "搜索" }
    } else if (new_so_text.startsWith("/动作")) {
        var tempvalue = $.trim(new_so_text.replace("/动作", ""));
        return { keywords: tempvalue, type: "动作" }
    } else if (new_so_text.startsWith("/网站")) {
        var tempvalue = $.trim(new_so_text.replace("/网站", ""));
        return { keywords: tempvalue, type: "网站" }
    } else {
        return { keywords: new_so_text, type: null }
    }
}

function so() {
    var context = analysis();
    soDataList(keywords = context["keywords"], type = context["type"]);
}

// 需要延迟，有些功能才会生效
window.setTimeout(() => {

    // LOGO 增加点击事件
    $(".ntools-logo").click(function () {
        // chrome.runtime.sendMessage({ method: "open-options" });
        window.open("https://n.tools");
    })

    // 增加黑色背景点击，关闭事件
    $("#ntools-extension").click(function (e) {
        if (e.target.id === "ntools-extension") {
            closeMain();
        }
    })

    // 搜索框，获取焦点，进行搜索
    $(".ntools-input").keyup(function (e) {
        if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "Enter") {
            return false;
        }

        var el = $(".ntools-input");
        var so_text = $(".ntools-input").val().toLowerCase();
        var new_so_text = $.trim(so_text);

        if (new_so_text != "") {
            if (e.key != "Backspace") {
                if (new_so_text == "/ta" || new_so_text == "/标") {
                    el.val("/标签 ");
                } else if (new_so_text == "/bo" || new_so_text == "/书") {
                    el.val("/书签 ");
                } else if (new_so_text == "/hi" || new_so_text == "/历") {
                    el.val("/历史 ");
                } else if (new_so_text == "/re" || new_so_text == "/删") {
                    el.val("/删除 ");
                } else if (new_so_text == "/se" || new_so_text == "/操") {
                    el.val("/操作 ");
                } else if (new_so_text == "/so" || new_so_text == "/搜") {
                    el.val("/搜索 ");
                } else if (new_so_text == "/ac" || new_so_text == "/动") {
                    el.val("/动作 ");
                } else if (new_so_text == "/we" || new_so_text == "/网") {
                    el.val("/网站 ");
                }
            } else {
                if (so_text == "/标签"
                    || so_text == "/书签"
                    || so_text == "/历史"
                    || so_text == "/删除"
                    || so_text == "/操作"
                    || so_text == "/搜索"
                    || so_text == "/动作"
                    || so_text == "/网站"
                ) {
                    el.val("");
                }
            }

            getDataList(false);
        }
    });
}, 100);
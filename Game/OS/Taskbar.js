"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Icons_1 = require("../Core/Icons");
const ContextMenu_1 = require("./ContextMenu");
const Window_1 = require("./Window");
const Utils_1 = require("../Core/Utils");
class TaskbarButton {
}
exports.TaskbarButton = TaskbarButton;
class Taskbar {
    static Init() {
        $("#taskbar").on("mousedown", () => {
            ContextMenu_1.default.CloseAllContextMenus();
        });
        $(window).on("resize", (_event) => {
            let targetWidth = $("#taskbar").outerWidth() - 40;
            $("#taskbar > .item").each((_i, ele) => {
                targetWidth -= $(ele).outerWidth();
            });
            $("#taskbar > .itemGroup").css("width", targetWidth + "px");
        });
        let iconElement = $("#menu > .icon");
        let icon = Icons_1.AllIcons.Frog.large.dark;
        iconElement.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
        iconElement.css("width", icon.width + "px");
        iconElement.css("height", icon.height + "px");
        Taskbar.Buttons = {};
    }
    static ToggleButton(windowId, dontNotifyOthers) {
        let buttonObj = Taskbar.Buttons[windowId];
        if (!buttonObj)
            return;
        if (buttonObj.element.hasClass("borderGroove")) {
            buttonObj.element.removeClass("borderGroove");
            buttonObj.element.addClass("borderRidge");
            //activate window
            console.log("Activate taskbar btn " + windowId);
            if (!dontNotifyOthers) {
                let window = Window_1.default.AllWindows[windowId];
                if (window) {
                    window.ActivateWindow(true);
                }
                else {
                    console.log("Can't find window " + windowId);
                }
                ContextMenu_1.default.CloseAllContextMenus();
            }
        }
        else {
            buttonObj.element.addClass("borderGroove");
            buttonObj.element.removeClass("borderRidge");
            //minimize window
            console.log("Deactivate taskbar btn " + windowId);
            if (!dontNotifyOthers) {
                Window_1.default.AllWindows[windowId].MinimizeWindow(true);
                ContextMenu_1.default.CloseAllContextMenus();
            }
        }
    }
    static RemoveButton(windowId) {
        let buttonObj = Taskbar.Buttons[windowId];
        if (!buttonObj)
            return;
        buttonObj.element.remove();
        delete Taskbar.Buttons[windowId];
    }
    static AddButtonForWindow(windowId, options) {
        let itmButton = $("<div></div>");
        itmButton.addClass("item borderGroove");
        if (options && options.highlight) {
            itmButton.addClass("highlight");
        }
        if (options && options.icon) {
            var iconElement = $("<div></div>");
            iconElement.addClass("icon");
            var icon = options.icon.large.dark;
            iconElement.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
            iconElement.css("width", icon.width + "px");
            iconElement.css("height", icon.height + "px");
            itmButton.append(iconElement);
        }
        if (options && options.title) {
            var titleElement = $("<div></div>");
            titleElement.addClass("title");
            titleElement.text(options.title);
            itmButton.append(titleElement);
        }
        itmButton.on("click", (_e) => {
            Taskbar.ToggleButton(windowId, false);
        });
        $(".appButtons").append(itmButton);
        let buttonObj = new TaskbarButton();
        buttonObj.element = itmButton;
        Taskbar.Buttons[windowId] = buttonObj;
    }
}
exports.default = Taskbar;
//# sourceMappingURL=Taskbar.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Core/Utils");
class ContextMenu {
    static CloseAllContextMenus() {
        for (let i = 0; i < ContextMenu.AllContextMenus.length; i++) {
            let ele = ContextMenu.AllContextMenus[i];
            ele.remove();
        }
    }
    static CreateContextMenu(options, items) {
        let parentDiv = $("<div class=\"contextMenu borderGroove\"></div>");
        options.y = options.y - items.map((item) => { return item.divider ? 4 : 25; })
            .reduce((total, amount) => { return total + amount; }) - 4;
        parentDiv.css("top", options.y + "px");
        parentDiv.css("left", options.x + "px");
        for (let i = 0; i < items.length; i++) {
            let itemObj = items[i];
            let itemEle = $("<div></div>");
            itemEle.addClass("item");
            if (itemObj.divider) {
                itemObj.title = " ";
                itemObj.icon = null;
                itemEle.addClass("divider borderRidge");
            }
            else {
                itemEle.on("mousedown", (e) => {
                    if (itemObj.click)
                        itemObj.click(e);
                    if (itemObj.app)
                        itemObj.app.ActivateOrCreate();
                    ContextMenu.CloseAllContextMenus();
                });
            }
            if (itemObj.icon) {
                let iconEle = $("<div></div>");
                iconEle.addClass("icon");
                let icon = itemObj.icon.small.dark;
                iconEle.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
                iconEle.css("width", icon.width);
                iconEle.css("height", icon.height);
                iconEle.css("position", "relative");
                iconEle.css("top", "3px");
                itemEle.append(iconEle);
            }
            let titleEle = $("<div></div>");
            titleEle.addClass("title");
            titleEle.text(itemObj.title);
            titleEle.css("position", "relative");
            titleEle.css("top", itemObj.icon ? "2px" : "3px");
            itemEle.append(titleEle);
            parentDiv.append(itemEle);
        }
        parentDiv.on("mousedown", function (e) {
            e.stopImmediatePropagation();
        });
        $("#desktop").append(parentDiv);
        ContextMenu.AllContextMenus.push(parentDiv);
    }
    static TreatAsContextMenu(element) {
        ContextMenu.AllContextMenus.push(element);
    }
}
ContextMenu.AllContextMenus = [];
exports.default = ContextMenu;
//# sourceMappingURL=ContextMenu.js.map
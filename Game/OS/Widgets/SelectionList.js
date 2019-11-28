"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const Utils_1 = require("../../Core/Utils");
class SelectionListWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.element = $("<div class=\"selectionList borderRidge\"></div>");
        this.element.css("width", options.width);
        this.element.css("height", options.height);
        this.selectedIndex = -1;
        this.dataList = [];
        for (let i = 0; i < options.items.length; i++) {
            let itemObj = options.items[i];
            let itemDiv = $("<div></div>");
            itemDiv.addClass("item");
            if (itemObj.icon) {
                let iconEle = $("<div></div>");
                iconEle.addClass("icon");
                let icon = itemObj.icon.small.dark;
                iconEle.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
                iconEle.css("width", icon.width);
                iconEle.css("height", icon.height);
                itemDiv.append(iconEle);
            }
            let titleEle = $("<div></div>");
            titleEle.addClass("title");
            titleEle.text(itemObj.title);
            itemDiv.append(titleEle);
            itemDiv.attr("title", itemObj.tooltip);
            itemDiv.on("click", (e) => {
                this.SetSelection(i, false);
            });
            let itemData = {
                id: i,
                title: itemObj.title,
                value: itemObj.value,
                div: itemDiv,
                onSelect: itemObj.onSelect,
                onDeselect: itemObj.onDeselect,
                selected: false
            };
            this.dataList.push(itemData);
            if (!options.hiddenOptions || !options.hiddenOptions[i]) {
                this.element.append(itemDiv);
            }
        }
    }
    SetSelection(choiceId, dontNotifyOthers) {
        if (choiceId != this.selectedIndex) {
            if (this.selectedIndex >= 0) {
                this.dataList[this.selectedIndex].selected = false;
                this.dataList[this.selectedIndex].div.removeClass("selected");
                if (!dontNotifyOthers && this.dataList[this.selectedIndex].onDeselect)
                    this.dataList[this.selectedIndex].onDeselect();
            }
            this.selectedIndex = choiceId;
            this.dataList[this.selectedIndex].selected = true;
            this.dataList[this.selectedIndex].div.addClass("selected");
            this.value = this.dataList[this.selectedIndex].value || this.dataList[this.selectedIndex].title;
            if (!dontNotifyOthers) {
                if (this.dataList[this.selectedIndex].onSelect)
                    this.dataList[this.selectedIndex].onSelect();
                this.trigger("selectionChanged", choiceId);
            }
        }
    }
    ;
}
exports.default = SelectionListWidget;
//# sourceMappingURL=SelectionList.js.map
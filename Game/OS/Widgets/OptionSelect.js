"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const Utils_1 = require("../../Core/Utils");
const Icons_1 = require("../../Core/Icons");
const SelectionList_1 = require("./SelectionList");
const ContextMenu_1 = require("../ContextMenu");
class OptionSelectWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        options.defaultIndex = options.defaultIndex || 0;
        this.valueTitle = options.items[options.defaultIndex].title;
        this.valueTooltip = options.items[options.defaultIndex].tooltip;
        this.valueIcon = options.items[options.defaultIndex].icon;
        this.value = options.items[options.defaultIndex].value || this.valueTitle;
        this.element = $("<div class=\"borderRidge optionSelect\"></div>");
        this.valueIconEle = $("<div class=\"icon itemIcon\"></div>");
        this.element.append(this.valueIconEle);
        this.valueEle = $("<div></div>");
        this.valueEle.addClass("title");
        this.element.append(this.valueEle);
        this.divotEle = $("<div class=\"icon divotIcon\"></div>");
        let icon = Icons_1.AllIcons.Dropdown.small.dark;
        this.divotEle.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
        this.divotEle.css("width", icon.width);
        this.divotEle.css("height", icon.height);
        this.element.append(this.divotEle);
        this.element.on("click", (event) => {
            let popupData = new SelectionList_1.default(options);
            popupData.element.css("position", "absolute");
            popupData.element.removeClass("borderRidge");
            popupData.element.addClass("borderGroove");
            popupData.element.css("left", event.pageX);
            popupData.element.css("top", event.pageY);
            popupData.element.css("z-index", 10000);
            $("#absoluteObjects").prepend(popupData.element);
            popupData.on("selectionChanged", (index) => {
                if (options.selectionChanged) {
                    options.selectionChanged(options.items[index]);
                }
                else {
                    this.valueTitle = options.items[index].title;
                    this.valueTooltip = options.items[index].tooltip;
                    this.valueIcon = options.items[index].icon;
                    this.value = options.items[index].value || this.valueTitle;
                    this.UpdateDisplay();
                }
                this.trigger("selectionChanged");
                popupData.element.remove();
            });
            ContextMenu_1.default.TreatAsContextMenu(popupData.element);
        });
        this.UpdateDisplay();
    }
    UpdateDisplay() {
        this.valueEle.text(this.valueTitle);
        this.element.attr("title", this.valueTooltip);
        if (this.valueIcon) {
            this.valueIconEle.css("background-image", "url(\"" + Utils_1.AssetLocation + this.valueIcon.small.dark.id + "\")");
            this.valueIconEle.css("width", this.valueIcon.small.dark.width);
            this.valueIconEle.css("height", this.valueIcon.small.dark.height);
        }
    }
    ;
}
exports.default = OptionSelectWidget;
//# sourceMappingURL=OptionSelect.js.map
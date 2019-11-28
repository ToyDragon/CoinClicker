"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const React = require("react");
class LabelWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.options = options;
    }
    GetElement() {
        return this.labelRef.current;
    }
    SetTitle(title) {
        this.labelRef.current.innerText = title;
    }
    render() {
        const styles = {};
        if (this.options.color) {
            styles["color"] = this.options.color;
        }
        if (this.options.margin) {
            styles["margin"] = this.options.margin + "px";
        }
        if (this.options.size) {
            styles["fontSize"] = this.options.size;
        }
        if (this.options.light) {
            styles["color"] = "gray";
        }
        for (let option in this.options.style) {
            styles[option] = this.options.style[option];
        }
        this.labelRef = React.createRef();
        return (React.createElement("div", { className: "label", style: styles, title: this.options.tooltip || "", ref: this.labelRef }, this.options.title));
    }
}
exports.default = LabelWidget;
//# sourceMappingURL=Label.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const Utils_1 = require("../../Core/Utils");
const React = require("react");
class IconWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.options = options;
    }
    render() {
        let styles = {
            backgroundImage: "url(\"" + Utils_1.AssetLocation + this.options.icon.dark.id + "\")",
            width: this.options.icon.dark.width,
            height: this.options.icon.dark.height,
        };
        this.iconRef = React.createRef();
        return React.createElement("div", { className: "icon", title: this.options.tooltip || "", style: styles, ref: this.iconRef });
    }
    componentDidMount() {
        $(this.iconRef.current).on("click", () => {
            if (this.options.onClick) {
                this.options.onClick();
            }
        });
    }
}
exports.default = IconWidget;
//# sourceMappingURL=Icon.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const Icons_1 = require("../../Core/Icons");
const Utils_1 = require("../../Core/Utils");
const React = require("react");
class ButtonWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        if (options.toggle) {
            this.toggleValue = !!options.toggleValue;
        }
        this.options = options;
        this.enabled = true;
    }
    VisiblyClick() {
        const root = $(this.rootRef.current);
        root.removeClass("borderGroove");
        root.addClass("borderRidge");
    }
    VisiblyUnclick() {
        const root = $(this.rootRef.current);
        root.addClass("borderGroove");
        root.removeClass("borderRidge");
    }
    componentDidMount() {
        const root = $(this.rootRef.current);
        root.on("click", (event) => {
            if (this.enabled) {
                if (this.options.onClick) {
                    this.options.onClick(event);
                }
                if (this.options.toggle) {
                    this.SetToggleValue(!this.toggleValue);
                }
                this.trigger("click", event);
            }
        });
        root.on("mousedown", (e) => {
            if (this.enabled && e.which === 1) { //1 is left mouse button
                if (!this.options.toggle) {
                    root.removeClass("borderGroove");
                    root.addClass("borderRidge");
                }
            }
        });
        root.on("mouseup mouseout", () => {
            if (!this.options.toggle) {
                root.addClass("borderGroove");
                root.removeClass("borderRidge");
            }
        });
        if (this.options.toggle) {
            if (this.toggleValue) {
                this.UpdateIcon(Icons_1.AllIcons.Check);
            }
            else {
                this.UpdateIcon(null);
            }
        }
    }
    UpdateToggleIcon() {
        if (this.toggleValue) {
            this.UpdateIcon(Icons_1.AllIcons.Check);
        }
        else {
            this.UpdateIcon(null);
        }
    }
    SetToggleValue(value) {
        this.toggleValue = value;
        this.UpdateToggleIcon();
    }
    GetToggleValue() {
        return this.toggleValue;
    }
    UpdateIcon(icon) {
        let newUrl = "";
        if (icon) {
            let sizedIcon;
            if (this.options.small) {
                sizedIcon = icon.small.dark;
            }
            else {
                sizedIcon = icon.large.dark;
            }
            newUrl = "url(\"" + Utils_1.AssetLocation + sizedIcon.id + "\")";
        }
        if (this.iconDivRef.current) {
            console.log(this.iconDivRef.current.style["backgroundImage"] + " changed to " + newUrl);
            this.iconDivRef.current.style["backgroundImage"] = newUrl;
        }
    }
    SetTitle(title) {
        $(this.titleRef.current).text(title);
    }
    SetEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            $(this.rootRef.current).removeClass("disabled");
        }
        else {
            $(this.rootRef.current).addClass("disabled");
        }
    }
    render() {
        const containerStyles = {};
        containerStyles["margin"] = "auto";
        if (this.options.contentWidth) {
            containerStyles["width"] = this.options.contentWidth;
        }
        const titleStyles = {};
        if (this.options.orientation == "horizontal") {
            titleStyles["display"] = "inline-block";
            titleStyles["fontSize"] = "22px";
            titleStyles["position"] = "relative";
            titleStyles["bottom"] = "6px";
        }
        if (this.options.fontSize) {
            titleStyles["fontSize"] = this.options.fontSize + "px";
        }
        const coreStyles = {};
        for (let option in this.options.style) {
            coreStyles[option] = this.options.style[option];
        }
        if (this.options.backgroundColor) {
            coreStyles["backgroundColor"] = this.options.backgroundColor;
        }
        let icon = null;
        let iconStyles = {};
        let iconDescriptor = this.options.icon;
        if (this.options.toggle) {
            iconDescriptor = Icons_1.AllIcons.Check;
        }
        if (iconDescriptor) {
            if (this.options.small) {
                icon = iconDescriptor.small.dark;
            }
            else {
                icon = iconDescriptor.large.dark;
            }
            iconStyles["backgroundImage"] = "url(\"" + Utils_1.AssetLocation + icon.id + "\")";
            iconStyles["width"] = icon.width;
            iconStyles["height"] = icon.height;
            if (this.options.iconStyle) {
                for (let prop in this.options.iconStyle) {
                    iconStyles[prop] = this.options.iconStyle[prop];
                }
            }
        }
        if (this.options.toggle) {
            coreStyles["paddingTop"] = "0";
            coreStyles["position"] = "relative";
            coreStyles["top"] = "2px";
            iconStyles["margin"] = "-4px -4px -2px -4px";
        }
        this.rootRef = React.createRef();
        this.titleRef = React.createRef();
        this.iconDivRef = React.createRef();
        return (React.createElement("div", { className: "button borderGroove widgetButton", ref: this.rootRef, style: coreStyles },
            React.createElement("div", { style: containerStyles }, [
                icon && React.createElement("div", { className: "icon", ref: this.iconDivRef, style: iconStyles, key: "1" }),
                React.createElement("div", { ref: this.titleRef, className: "title", style: titleStyles, key: "2", title: this.options.tooltip }, this.options.title)
            ])));
    }
}
exports.default = ButtonWidget;
//# sourceMappingURL=Button.js.map
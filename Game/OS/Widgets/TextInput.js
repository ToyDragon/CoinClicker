"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const React = require("react");
class TextInputWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.options = options;
    }
    AfterChange() {
        if (this.options.requireNumbers) {
            let numVal = $(this.inputRef.current).val() + "";
            let expectedVal = parseInt(numVal) || 0;
            if (isNaN(expectedVal)) {
                expectedVal = 0;
            }
            if (this.options.noDecimal) {
                expectedVal = Math.floor(expectedVal);
            }
            if (numVal !== expectedVal.toString()) {
                $(this.inputRef.current).val(expectedVal);
            }
        }
        this.trigger("changed");
    }
    SetValue(newValue) {
        $(this.inputRef.current).val(newValue);
        this.AfterChange();
    }
    SetDisabled(disabled) {
        if (disabled) {
            this.inputRef.current.setAttribute("disabled", "");
        }
        else {
            this.inputRef.current.removeAttribute("disabled");
        }
    }
    GetValue() {
        return this.inputEle.val() + "";
    }
    render() {
        const styles = {};
        const inputStyles = {};
        if (this.options.width) {
            styles["width"] = this.options.width + "px";
        }
        if (this.options.fontSize) {
            styles["height"] = (this.options.fontSize + 9) + "px";
            inputStyles["fontSize"] = this.options.fontSize;
        }
        if (this.options.backgroundColor) {
            styles["backgroundColor"] = this.options.backgroundColor;
        }
        if (this.options.style) {
            for (const field in this.options.style) {
                styles[field] = this.options.style[field];
            }
        }
        if (this.options.rightAlign) {
            inputStyles["textAlign"] = "right";
        }
        this.inputRef = React.createRef();
        return (React.createElement("div", { className: "textInput borderRidge", style: styles },
            React.createElement("input", { ref: this.inputRef, type: "text", style: inputStyles, spellCheck: false }),
            React.createElement("div", { className: "inputLabel " + (this.options.rightAlign ? "right" : "") }, this.options.placeholder)));
    }
    componentDidMount() {
        this.inputEle = $(this.inputRef.current);
        this.inputEle.val(this.options.defaultValue);
        this.inputEle.attr("placeholder", this.options.placeholder);
        this.inputEle.on("keyup", (e) => {
            this.AfterChange();
            if (e.which === 13) {
                if (this.options.submit) {
                    this.options.submit();
                }
            }
        });
        if (this.options.disabled) {
            this.SetDisabled(true);
        }
    }
}
exports.default = TextInputWidget;
//# sourceMappingURL=TextInput.js.map
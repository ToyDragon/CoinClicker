"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDom = require("react-dom");
const React = require("react");
const Window_1 = require("./Window");
const Icons_1 = require("../Core/Icons");
const Button_1 = require("./Widgets/Button");
const TextInput_1 = require("./Widgets/TextInput");
const Label_1 = require("./Widgets/Label");
var PromptType;
(function (PromptType) {
    PromptType[PromptType["notification"] = 0] = "notification";
    PromptType[PromptType["text"] = 1] = "text";
})(PromptType = exports.PromptType || (exports.PromptType = {}));
class Popup {
    constructor(options) {
        this.options = options;
        this.done = false;
        this.window = new Window_1.default({
            innerWidth: 350,
            height: 160,
            title: options.title,
            icon: options.icon || Icons_1.AllIcons.Letter,
        });
        let contentDiv = $("<div></div>");
        contentDiv.css("position", "relative");
        contentDiv.css("width", "100%");
        contentDiv.css("height", "100%");
        let content = [];
        this.textInputRef = React.createRef();
        if (this.options.content) {
            content.push(this.options.content);
        }
        else {
            content.push(React.createElement("div", { key: "message" },
                React.createElement(Label_1.default, { title: options.text })));
        }
        if (options.type === PromptType.text) {
            content.push(React.createElement("div", { key: "textinput", style: { width: "100%" } },
                React.createElement(TextInput_1.default, { defaultValue: this.options.defaultText, placeholder: this.options.placeholder, ref: this.textInputRef, width: 342, backgroundColor: "#FFFFFF" })));
        }
        if (options.type === PromptType.notification) {
            content.push(React.createElement("div", { key: "actions", style: { position: "absolute", bottom: 0, right: this.options.rightOffset } },
                React.createElement(Button_1.default, { title: options.actionName || "OK", onClick: () => { this.Accept(); this.window.CloseWindow(false); } })));
        }
        else {
            content.push(React.createElement("div", { key: "actions", style: { position: "absolute", bottom: 0, right: this.options.rightOffset } },
                React.createElement(Button_1.default, { title: options.actionName || "Accept", onClick: () => { this.Accept(); this.window.CloseWindow(false); } }),
                React.createElement(Button_1.default, { title: "Cancel", onClick: () => { this.Cancel(); this.window.CloseWindow(false); } })));
        }
        ReactDom.render(content, contentDiv[0]);
        this.window.contentDiv.append(contentDiv);
        this.window.on("close", () => { this.Cancel(); });
        this.window.ActivateWindow(false);
    }
    IsClosed() {
        return !this.window || this.window.closed;
    }
    Activate() {
        if (this.window && !this.window.closed) {
            this.window.ActivateWindow(false);
        }
    }
    Cancel() {
        if (this.done)
            return;
        this.done = true;
        if (this.options.cancel) {
            this.options.cancel();
        }
    }
    Accept() {
        if (this.done)
            return;
        this.done = true;
        if (this.options.accept) {
            let value = null;
            if (this.options.type === PromptType.text) {
                value = this.textInputRef.current.GetValue();
            }
            this.options.accept(value);
        }
    }
}
exports.default = Popup;
//# sourceMappingURL=Popup.js.map
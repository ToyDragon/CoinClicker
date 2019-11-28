"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualPage_1 = require("./VirtualPage");
const ReactDom = require("react-dom");
const React = require("react");
class NoPageFoundPage extends VirtualPage_1.default {
    constructor() {
        super();
    }
    MatchesAddress(_address) {
        return true;
    }
    Render(contentDiv) {
        ReactDom.render([
            React.createElement("style", { key: "a", dangerouslySetInnerHTML: { __html: `
            ` } }),
            React.createElement("div", { className: "pageRoot", key: "b" },
                React.createElement("h1", null, "Error 404: Page Not Found"),
                React.createElement("a", { "data-destination": "home.net" }, "Go Home"))
        ], contentDiv[0]);
    }
    Cleanup() {
    }
}
exports.default = NoPageFoundPage;
//# sourceMappingURL=NoPageFound.js.map
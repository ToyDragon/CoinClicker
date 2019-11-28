"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualPage_1 = require("./VirtualPage");
const ReactDom = require("react-dom");
const React = require("react");
const Utils_1 = require("../../../Core/Utils");
const OS_1 = require("../../../OS/OS");
class DebugPage extends VirtualPage_1.default {
    constructor() {
        super();
    }
    GetURL() {
        return "www.webos.gov";
    }
    MatchesAddress(address) {
        return /^(www\.)?webos\.gov/i.test(address);
    }
    Render(contentDiv) {
        const rootRef = React.createRef();
        ReactDom.render([
            React.createElement("style", { key: "a", dangerouslySetInnerHTML: { __html: `
                .coal{
                    background-image: url("` + Utils_1.AssetLocation + `icons/Coal128.png");
                    width: 128px;
                    height: 128px;
                    display: inline-block;
                    position: absolute;
                    right: 25px;
                }
                
                .pageTitle{
                    display: inline-block;
                    font-size: 50px;
                }
                
                .pageSubtitle{
                    margin-left: 2px;
                    font-size: 18px;
                }
                
                .pageRoot{
                    background-color: #353F40;
                }
                
                .shopItems{
                    margin-top:32px;
                }
                
                .shopItem{
                    border-bottom: 1px dotted #816116;
                    height: 64px;
                    padding: 5px;
                    z-index: 1;
                    position: relative;
                }
                
                .shopItem:hover{
                    background-color: #d1b470;
                }
                
                .shopItemIcon{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                }
                
                .shopItemTitleSection{
                    display: inline-block;
                    width: 230px;
                    position: relative;
                    top: -11px;
                    left: 10px;
                }
                
                .shopItemTitle{
                    font-size: 24px;
                }
                
                .shopItemSubTitle{
                    height: 32px;
                }
                
                .shopItemPrice{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    text-align: right;
                    vertical-align: middle;
                    font-size: 24px;
                }
                
                .shopItemPriceSymbol{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    vertical-align: middle;
                    font-size: 24px;
                }
                
                .pageTitleSection{
                    padding-left: 40px;
                    display: inline-block;
                }
                
                .headerSection{
                    padding-top: 15px;
                    padding-bottom: 15px;
                }
            ` } }),
            React.createElement("div", { className: "pageRoot", key: "b" },
                React.createElement("div", { className: "headerSection" },
                    React.createElement("div", { className: "pageTitleSection" },
                        React.createElement("div", { className: "pageTitle" }, "webos.gov"),
                        React.createElement("div", { className: "pageSubtitle" }, "Get the fuck out of my debug page you nerd")),
                    React.createElement("div", { className: "coal" })),
                React.createElement("div", null,
                    React.createElement("h1", null, "Shared Data"),
                    this.GetSharedDataElements()))
        ], contentDiv[0]);
    }
    GetSharedDataElements() {
        let data = [];
        let key = 0;
        for (let prop in OS_1.OS.SharedData) {
            data.push(React.createElement("div", { key: key++ },
                React.createElement("label", null, prop + ": " + JSON.stringify(OS_1.OS.SharedData[prop]))));
        }
        return data;
    }
    Cleanup() {
    }
}
exports.default = DebugPage;
//# sourceMappingURL=Debug.js.map
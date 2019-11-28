"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("../App");
const ReactDom = require("react-dom");
const React = require("react");
const Window_1 = require("../../OS/Window");
const Icons_1 = require("../../Core/Icons");
const Button_1 = require("../../OS/Widgets/Button");
const TextInput_1 = require("../../OS/Widgets/TextInput");
const AlphaWolf_1 = require("./VirtualPages/AlphaWolf");
const Home_1 = require("./VirtualPages/Home");
const NoPageFound_1 = require("./VirtualPages/NoPageFound");
const Mojave_1 = require("./VirtualPages/Mojave");
const Coal_1 = require("./VirtualPages/Coal");
const Debug_1 = require("./VirtualPages/Debug");
const Doors_1 = require("./VirtualPages/Doors");
class Browser extends App_1.default {
    constructor() {
        super();
        this.availablePages = [
            new Home_1.default(),
            new AlphaWolf_1.default(),
            new Mojave_1.default(),
            new Coal_1.default(),
            new Doors_1.default(),
            new Debug_1.default(),
            new NoPageFound_1.default()
        ];
    }
    CleanUp() {
    }
    CreateWindow() {
        console.log("Creating browser window");
        this.windowObj = new Window_1.default({
            width: 500,
            height: 500,
            icon: Icons_1.AllIcons.Browser,
            title: "Web Browser"
        });
        const contentRef = React.createRef();
        const textRef = React.createRef();
        const btnHomeStyles = { width: "28px", height: "28px", marginTop: "0", marginBottom: "-4px", marginLeft: "0" };
        const btnGoStyles = { width: "28px", height: "28px", marginTop: "0", marginBottom: "-4px" };
        const btnIconStyles = { marginLeft: "-2px", marginTop: "-3px" };
        ReactDom.render([
            React.createElement("div", { className: "browserNavBar", key: "1" },
                React.createElement(Button_1.default, { icon: Icons_1.AllIcons.House, tooltip: "go home", onClick: () => { this.GoHome(); }, style: btnHomeStyles, iconStyle: btnIconStyles }),
                React.createElement(TextInput_1.default, { placeholder: "Address", defaultValue: "home.net", style: { "flexGrow": "1" }, ref: textRef, submit: () => { this.GotoPage(); } }),
                React.createElement(Button_1.default, { icon: Icons_1.AllIcons.Go, tooltip: "go to page", onClick: () => { this.GotoPage(); }, style: btnGoStyles, iconStyle: btnIconStyles })),
            React.createElement("div", { className: "browserContent", key: "2", ref: contentRef })
        ], this.windowObj.contentDiv[0]);
        this.addressField = textRef.current;
        this.pageContent = $(contentRef.current);
        //this.windowObj.contentDiv.append(navBar);
        //this.windowObj.contentDiv.append(this.pageContent);
        this.hist = [];
        this.GotoPage();
    }
    SetURL(url) {
        this.addressField.inputEle.val(url);
    }
    GotoPage() {
        console.log("Navigating browser");
        let target = this.addressField.inputEle.val().toString().replace(/[^a-zA-Z./]/g, "");
        if (this.prevtarget) {
            this.hist.push(this.prevtarget);
        }
        if (this.activePage) {
            this.activePage.Cleanup();
        }
        ReactDom.unmountComponentAtNode(this.pageContent[0]);
        this.pageContent.empty();
        this.activePage = null;
        for (let page of this.availablePages) {
            if (page.MatchesAddress(target)) {
                this.activePage = page;
                page.Render(this.pageContent);
                this.PageRendered();
                break;
            }
        }
        if (this.activePage) {
            console.log("Found page to render");
        }
        else {
            console.log("No page found for \"" + target + "\"");
        }
    }
    PageRendered() {
        this.pageContent.find("a").on("click", (e) => {
            var dest = $(e.target).attr("data-destination");
            if (dest) {
                this.addressField.inputEle.val(dest);
                this.GotoPage();
            }
        });
    }
    GoHome() {
        this.addressField.inputEle.val("home.net");
        this.GotoPage();
    }
    GoBack() {
        console.log(JSON.stringify(this.hist));
        var page = this.hist.pop();
        if (!page) {
            page = "home.net";
        }
        console.log("to " + page);
        this.addressField.inputEle.val(page);
        this.GotoPage();
        this.hist.pop();
    }
}
exports.default = Browser;
//# sourceMappingURL=WebBrowser.js.map
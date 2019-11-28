"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDom = require("react-dom");
const React = require("react");
const App_1 = require("../App");
const Icons_1 = require("../../Core/Icons");
const Window_1 = require("../../OS/Window");
const Label_1 = require("../../OS/Widgets/Label");
const Icon_1 = require("../../OS/Widgets/Icon");
class EmailApp extends App_1.default {
    constructor() {
        super();
        this.allEmails = [];
        this.allEmails.push({
            sender: EmailApp.SenderJoffBuzzo,
            content: (React.createElement("div", null,
                React.createElement("p", null,
                    "Welcome to the ",
                    React.createElement("span", { className: "properNoun" }, "Webos Crypto Exchange Coorporation"),
                    "! I started this company in my garage in 2056, and have grown it to be worth over 943 trillion CSH. We have 52 multi-national mining offices with just under 700,000 coin exchange staff, of which you are the newest recruit. Blah blah blah."),
                React.createElement("p", null, "World building"),
                React.createElement("p", null, "Call to action. Go read the other email from the IT staff."))),
            subject: "Welcome!"
        });
        this.allEmails.push({
            sender: EmailApp.SenderITHelper,
            content: (React.createElement("div", null,
                React.createElement("p", null,
                    "Before you can get up and running you need to setup you ",
                    React.createElement("span", { className: "properNoun" }, "Webos Crypto Exchange Coorporation"),
                    " personal computer."),
                React.createElement("p", null, "World building"),
                React.createElement("p", null, "Call to action. Go to the website and buy the miner, and exchange. Maybe that's two steps with another email from like an exchange guy."))),
            subject: "PC Setup"
        });
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            width: 450,
            height: 450,
            icon: Icons_1.AllIcons.Letter,
            title: "Email"
        });
        this.windowObj.on("close", function () {
            this.windowObj = null;
        });
        this.DrawWindowContent();
    }
    DrawWindowContent() {
        if (!this.windowObj)
            return;
        this.windowObj.contentDiv.empty();
        let rootDiv = $("<div></div>");
        rootDiv.css("padding", "4px");
        const listRef = React.createRef();
        const contentRef = React.createRef();
        ReactDom.render([
            React.createElement("style", { key: "a", dangerouslySetInnerHTML: { __html: `
                .emailList{
                    position: absolute;
                    left: 0;
                    width: 135px;
                    height: 100%;
                    border-right: 2px solid white;
                }

                .email:hover{
                    background-color: white;
                }

                .emailContent{
                    position: absolute;
                    right: 0;
                    width: 299px;
                    height: 100%;
                    border-left: 2px solid #818180;
                }` } }),
            React.createElement("div", { key: "b", className: "emailList", ref: listRef }, this.GetListEmails()),
            React.createElement("div", { key: "c", className: "emailContent", ref: contentRef })
        ], this.windowObj.contentDiv[0]);
        this.windowObj.contentDiv.find(".email").on("click", (e) => {
            let ix = $(e.currentTarget).attr("data-emailindex");
            this.RenderEmail(Number(ix));
        });
        this.emailList = listRef.current;
        this.emailContent = contentRef.current;
    }
    RenderEmail(ix) {
        if (ix < 0 || ix >= this.allEmails.length)
            return;
        ReactDom.unmountComponentAtNode(this.emailContent);
        ReactDom.render(this.allEmails[ix].content, this.emailContent);
    }
    GetListEmails() {
        let eles = [];
        for (let i = 0; i < this.allEmails.length; i++) {
            let email = this.allEmails[i];
            let ele = (React.createElement("div", { className: "email", key: i, style: { padding: "4px" }, "data-emailindex": i },
                React.createElement(Label_1.default, { title: email.subject, tooltip: "Subject" }),
                React.createElement("div", null,
                    React.createElement("div", { style: { display: "inline-block" } },
                        React.createElement(Icon_1.default, { icon: email.sender.icon.small })),
                    React.createElement("div", { style: { display: "inline-block", width: "7px" } }),
                    React.createElement("div", { style: { display: "inline-block" } },
                        React.createElement(Label_1.default, { title: email.sender.name, tooltip: "Sender", size: 12, light: true })))));
            eles.push(ele);
        }
        return eles;
    }
}
EmailApp.SenderJoffBuzzo = {
    icon: Icons_1.AllIcons.Frog,
    name: "Joff Buzzo",
    subtitle: "CEO and Founder"
};
EmailApp.SenderITHelper = {
    icon: Icons_1.AllIcons.Frog,
    name: "IT",
    subtitle: "Your helpful friend"
};
exports.EmailApp = EmailApp;
//# sourceMappingURL=Email.js.map
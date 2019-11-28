"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualPage_1 = require("./VirtualPage");
const ReactDom = require("react-dom");
const React = require("react");
const Utils_1 = require("../../../Core/Utils");
const OS_1 = require("../../../OS/OS");
class HomePage extends VirtualPage_1.default {
    constructor() {
        super();
    }
    MatchesAddress(address) {
        return /^(www\.)?home\.net/i.test(address);
    }
    Render(contentDiv) {
        ReactDom.render([
            React.createElement("style", { key: "a", dangerouslySetInnerHTML: { __html: `
                .cactus{
                    background-image: url("` + Utils_1.AssetLocation + `icons/Mojave64.png");
                }
                
                .coal{
                    background-image: url("` + Utils_1.AssetLocation + `icons/Coal64.png");
                }
                
                .wolf{
                    background-image: url("` + Utils_1.AssetLocation + `icons/AlphaWolf64.png");
                }
                
                .headerSection{
                    padding-top: 15px;
                    padding-bottom: 30px;
                }
                
                .pageRoot{
                    background-color: #ffe4cc;
                }
                
                .pageTitle{
                    display: inline-block;
                    font-size: 50px;
                }
                
                .homeIcon{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    margin-bottom: -14px;
                    background-image: url("` + Utils_1.AssetLocation + `icons/Browser64.png");
                }
                
                .linkTextSection{
                    display: inline-block;
                    position: relative;
                    top: -10px;
                }
                
                .linkTitle{
                    font-size: 24px;
                }
                
                .linkIcon{
                    width: 64px;
                    height: 64px;
                    display: inline-block;
                    margin-left: 30px;
                }
            ` } }),
            React.createElement("div", { className: "pageRoot", key: "b" },
                React.createElement("div", { className: "headerSection" },
                    React.createElement("div", { className: "homeIcon" }),
                    React.createElement("div", { className: "pageTitle" }, "Home Page")),
                React.createElement("div", { className: "links" }, this.GetShopElements().map((data, index) => { return this.ShopDataToShopElement(data, index); })))
        ], contentDiv[0]);
    }
    ShopDataToShopElement(data, index) {
        return (React.createElement("div", { className: "homeLink", key: index },
            React.createElement("div", { className: "linkIcon " + data.iconClass }),
            React.createElement("div", { className: "linkTextSection" },
                React.createElement("a", { href: "#", "data-destination": data.destination, className: "linkTitle" }, data.title),
                React.createElement("div", { className: "linkSubtitle" }, data.subtitle))));
    }
    GetShopElements() {
        let data = [];
        data.push({
            destination: "mojave.com",
            iconClass: "cactus",
            subtitle: "Mining Tool Shop",
            title: "Mojave"
        });
        data.push({
            destination: "doors.com",
            iconClass: "cactus",
            subtitle: "Pickaxe Upgrades",
            title: "Doors"
        });
        if (OS_1.OS.getSharedData("hasACNMiner0")) {
            data.push({
                destination: "alphawolf.org",
                iconClass: "wolf",
                subtitle: "ACN Mining Upgrades",
                title: "Alpha Wolf"
            });
            data.push({
                destination: "coal.io",
                iconClass: "coal",
                subtitle: "Minigames",
                title: "Coal"
            });
        }
        else {
            console.log("No ACN miner 0 :( " + OS_1.OS.getSharedData("hasACNMiner0"));
        }
        data.push({
            destination: "webos.gov",
            iconClass: "cactus",
            subtitle: "Debug tools for development",
            title: "Debug"
        });
        return data;
    }
    Cleanup() {
    }
}
exports.default = HomePage;
//# sourceMappingURL=Home.js.map
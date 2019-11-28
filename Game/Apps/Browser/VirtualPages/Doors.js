"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualPage_1 = require("./VirtualPage");
const ReactDOM = require("react-dom");
const React = require("react");
const Utils_1 = require("../../../Core/Utils");
const OS_1 = require("../../../OS/OS");
const Icons_1 = require("../../../Core/Icons");
const Wallet_1 = require("../../Crypto/Wallet");
class ShopItem {
}
class DoorsPage extends VirtualPage_1.default {
    constructor() {
        super();
    }
    MatchesAddress(address) {
        return /^(www\.)?doors\.com/i.test(address);
    }
    Render(contentDiv) {
        let rootRef = React.createRef();
        ReactDOM.render([
            React.createElement("style", { key: "a", dangerouslySetInnerHTML: { __html: `
                .cactus{
                    background-image: url("` + Utils_1.AssetLocation + `icons/Mojave128.png");
                    width: 128px;
                    height: 128px;
                    display: inline-block;
                    position: relative;
                    left: 70px;
                    margin-bottom: -82px;
                }
                
                .pageTitle{
                    display: inline-block;
                    font-size: 50px;
                }
                
                .headerSection{
                    padding-top: 15px;
                    padding-bottom: 15px;
                }
                
                .pageSubtitle{
                    margin-left: 2px;
                    font-size: 18px;
                    width: 220px;
                }
                
                .pageRoot{
                    background-color: #b38418;
                }
                
                .shopItems{
                    margin-top:32px;
                }
                
                .shopItem{
                    border-bottom: 1px dotted #816116;
                    height: 64px;
                    padding: 5px;
                    padding-right: 0;
                    width: 460px;
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
                    width: 87px;
                    height: 64px;
                    text-align: right;
                    vertical-align: middle;
                    font-size: 24px;
                    margin-right: 4px;
                }
                
                .shopItemPriceSymbol{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    vertical-align: middle;
                    font-size: 24px;
                }
            ` } }),
            React.createElement("div", { className: "pageRoot", key: "b" },
                React.createElement("div", { className: "headerSection" },
                    React.createElement("div", null,
                        React.createElement("div", { className: "pageTitle" }, "Doors.com"),
                        React.createElement("div", { className: "cactus" })),
                    React.createElement("div", { className: "pageSubtitle" }, "Click-based mining upgrades.")),
                React.createElement("div", { id: "shopItems", ref: rootRef }))
        ], contentDiv[0]);
        this.rootDiv = $(rootRef.current);
        this.UpdateItems();
    }
    GetAllItems() {
        const items = [];
        let speedNames = [
            "+0.5 Voltage Boost",
            "Larger Transitors",
            "Smaller Transitors",
            "RAM Disk Pagefile",
            "Racing Stripes on Case",
            "Second Graphics Card",
            "Fire Decals",
            "Cubic Bezier Curves",
            "Wheels on Case",
            "LED Lights",
            "Poptart Cat Song",
            "Box Fan",
            "Jet Engine",
            "Running Shoes",
        ];
        let price = 150;
        for (let i = 0; i < speedNames.length; i++) {
            const boostAmt = i + 1;
            items.push({
                hasVar: "hasClickUpgrade" + i,
                subtitle: "+" + Utils_1.default.DisplayNumber(boostAmt) + " Block Size",
                action: (item) => {
                    OS_1.OS.PickaxeApp.AddBoost({
                        coinAdds: boostAmt,
                        name: item.title,
                        icon: item.icon,
                        subtitle: item.subtitle
                    });
                },
                title: speedNames[i],
                icon: Icons_1.AllIcons.AlphaCoin,
                price: price,
                symbol: "CSH"
            });
            price *= 1.4;
        }
        return items;
    }
    GetAvailableItems() {
        var items = this.GetAllItems();
        for (var i = items.length - 1; i >= 0; i--) {
            if (OS_1.OS.getSharedData(items[i].hasVar)) {
                items.splice(i, 1);
            }
        }
        if (items.length > 3) {
            items = items.splice(0, 3);
        }
        return items;
    }
    CreateShopRow(item) {
        var rowDiv = $("<div></div>");
        rowDiv.addClass("shopItem");
        var iconDiv = $("<div></div>");
        iconDiv.addClass("shopItemIcon");
        iconDiv.css("background-image", "url(\"" + Utils_1.AssetLocation + item.icon.veryLarge.dark.id + "\")");
        rowDiv.append(iconDiv);
        var titleSectionDiv = $("<div></div>");
        titleSectionDiv.addClass("shopItemTitleSection");
        var titleDiv = $("<div></div>");
        titleDiv.addClass("shopItemTitle");
        titleDiv.text(item.title);
        titleSectionDiv.append(titleDiv);
        var subtitleDiv = $("<div></div>");
        subtitleDiv.addClass("shopItemSubTitle");
        subtitleDiv.text(item.subtitle);
        titleSectionDiv.append(subtitleDiv);
        rowDiv.append(titleSectionDiv);
        var priceDiv = $("<div></div>");
        priceDiv.addClass("shopItemPrice");
        priceDiv.text(Utils_1.default.DisplayNumber(item.price));
        rowDiv.append(priceDiv);
        var symbolDiv = $("<div></div>");
        symbolDiv.addClass("shopItemPriceSymbol");
        symbolDiv.text(item.symbol);
        rowDiv.append(symbolDiv);
        rowDiv.on("click", () => {
            Wallet_1.Wallet.TryBuy(item.hasVar, item.price, item.symbol).then(() => {
                item.action(item);
                this.UpdateItems();
            });
        });
        return rowDiv;
    }
    UpdateItems() {
        if (!this.rootDiv)
            return;
        this.rootDiv.empty();
        var items = this.GetAvailableItems();
        for (var i = 0; i < items.length; i++) {
            var itemObj = items[i];
            var rowDiv = this.CreateShopRow(itemObj);
            this.rootDiv.append(rowDiv);
        }
    }
    Cleanup() {
    }
}
exports.default = DoorsPage;
//# sourceMappingURL=Doors.js.map
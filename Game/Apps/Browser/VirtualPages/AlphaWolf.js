"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualPage_1 = require("./VirtualPage");
const ReactDOM = require("react-dom");
const React = require("react");
const Utils_1 = require("../../../Core/Utils");
const Icons_1 = require("../../../Core/Icons");
const OS_1 = require("../../../OS/OS");
const Wallet_1 = require("../../Crypto/Wallet");
const Miner_1 = require("../../Crypto/Miner");
class ShopItem {
}
class AlphaWolfPage extends VirtualPage_1.default {
    constructor() {
        super();
        this.mainSymbol = "ACN";
    }
    MatchesAddress(address) {
        return /^(www\.)?alphawolf\.org/i.test(address);
    }
    Cleanup() {
    }
    Render(contentDiv) {
        let rootRef = React.createRef();
        ReactDOM.render([
            React.createElement("style", { key: "a", dangerouslySetInnerHTML: { __html: `
                .wolf{
                    background-image: url("` + Utils_1.AssetLocation + `icons/AlphaWolf64.png");
                    width: 64px;
                    height: 64px;
                    display: inline-block;
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
                    background-color: #ffffff;
                }
                
                .shopItems{
                    margin-top:32px;
                }
                
                .pageTitleSection{
                    padding-left: 40px;
                    display: inline-block;
                }
                
                .headerSection{
                    padding-top: 15px;
                }
                
                .shopItem{
                    border-bottom: 1px dotted #dddddd;
                    height: 64px;
                    padding: 5px;
                    padding-right: 0;
                    width: 460px;
                }
                
                .shopItem:hover{
                    background-color: #F4CB07;
                }
                
                .shopItems{
                    margin-top:32px;
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
                    font-size: 20px;
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
                    React.createElement("div", { className: "pageTitleSection" },
                        React.createElement("div", { className: "pageTitle" }, "AlphaWolf.org"),
                        React.createElement("div", { className: "pageSubtitle" }, "Alpha Coin Enhancements")),
                    React.createElement("div", { className: "wolf" })),
                React.createElement("div", { id: "shopItems", ref: rootRef }))
        ], contentDiv[0]);
        this.rootDiv = $(rootRef.current);
        this.UpdateItems();
    }
    UpdateItems() {
        if (!this.rootDiv) {
            return;
        }
        this.rootDiv.empty();
        let items = this.GetAvailableItems();
        for (let i = 0; i < items.length; i++) {
            let itemObj = items[i];
            let rowDiv = this.CreateShopRow(itemObj);
            this.rootDiv.append(rowDiv);
        }
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
        rowDiv.on("click", function () { item.action(); });
        return rowDiv;
    }
    GetAvailableItems() {
        var items = this.GetAllItems();
        for (var i = items.length - 1; i >= 0; i--) {
            if (this.AlreadyHasItem(items[i].track, items[i].trackIndex)) {
                items.splice(i, 1);
            }
        }
        if (items.length > 4) {
            items = items.slice(0, 4);
        }
        return items;
    }
    GetAllItems() {
        let items = [];
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
        let boostNames = [
            "Transaction Compression",
            "Complex Hashing",
            "Transaction Grouping",
            "More GPU RAM",
            "3D Transactions",
            "Pythagorean Theorem",
            "Visual Basic GUI",
            "Imaginary Numbers",
            "USB Pet Rock",
            "Storage Expansion",
            "Lint Trap",
            "",
            "",
            ""
        ];
        for (let i = 0; i < (speedNames.length + boostNames.length); i++) {
            let track = i % 2;
            let trackIndex = Math.floor(i / 2);
            let boostVal = this.GetUpgradeBoost(track, trackIndex);
            let item = new ShopItem();
            if (track) {
                item.title = boostNames[trackIndex];
                item.subtitle = this.GetBlockDisplay(boostVal);
                item.action = this.CreateTryBuyUpgrade(track, trackIndex, this.GetPrice(i), { name: item.title, blockMultiplier: boostVal });
            }
            else {
                item.title = speedNames[trackIndex];
                item.subtitle = this.GetSpeedDisplay(boostVal);
                item.action = this.CreateTryBuyUpgrade(track, trackIndex, this.GetPrice(i), { name: item.title, speedBoost: boostVal });
            }
            item.track = track;
            item.trackIndex = trackIndex;
            item.icon = track ? Icons_1.AllIcons.ComputerBoardPower : Icons_1.AllIcons.ComputerBoardSpeed;
            item.price = this.GetPrice(i);
            item.symbol = "CSH";
            items.push(item);
        }
        return items;
    }
    TryBuyUpgrade(track, trackNumber, price, boostObj, ignoreCheck) {
        if (!ignoreCheck) {
            if (this.AlreadyHasItem(track, trackNumber)) {
                console.log("Already has " + track + ":" + trackNumber);
                return;
            }
            var cshWallet = Wallet_1.Wallet.AllWallets["CSH"];
            if (cshWallet.amount < price)
                return;
            cshWallet.ChangeValue(-price);
            let hasVar = this.GetUpgradeName(track, trackNumber);
            OS_1.OS.setSharedData(hasVar, true);
        }
        boostObj.symbol = this.mainSymbol;
        Miner_1.default.AddBonus(boostObj);
        this.UpdateItems();
    }
    CreateTryBuyUpgrade(track, trackNumber, price, boostObj) {
        return (ignoreCheck) => {
            this.TryBuyUpgrade(track, trackNumber, price, boostObj, ignoreCheck);
        };
    }
    GetSpeedDisplay(speed) {
        var percent = (speed - 1) * 100;
        return "+" + percent + "% Mining Speed";
    }
    GetBlockDisplay(boost) {
        var percent = (boost - 1) * 100;
        return "+" + percent + "% Block Size";
    }
    GetUpgradeBoost(track, trackNumber) {
        var speeds = [2, 2, 2.2, 1.9, 1.5, 1.6, 2.6, 2.2, 1.5, 2, 2, 1.5, 2, 1.75, 1.5, 2];
        var blockBoosts = speeds.reverse();
        if (track == 0) {
            return speeds[trackNumber % speeds.length];
        }
        return blockBoosts[trackNumber % blockBoosts.length];
    }
    GetPrice(trackNumber) {
        if (trackNumber == 0)
            return 250;
        let multiplier = [1.4, 1.9, 1.6][trackNumber % 3];
        let newPrice = multiplier * this.GetPrice(trackNumber - 1);
        newPrice = Math.round(newPrice * 100) / 100;
        return newPrice;
    }
    GetUpgradeName(track, trackNumber) {
        return "has" + this.mainSymbol + "Upgrade" + track + "_" + trackNumber;
    }
    AlreadyHasItem(track, trackNumber) {
        let hasUpgrade = this.GetUpgradeName(track, trackNumber);
        return OS_1.OS.getSharedData(hasUpgrade);
    }
    RestoreState() {
        var items = this.GetAllItems();
        for (var i = 0; i < items.length; i++) {
            if (this.AlreadyHasItem(items[i].track, items[i].trackIndex)) {
                items[i].action(true);
            }
        }
    }
}
exports.default = AlphaWolfPage;
//# sourceMappingURL=AlphaWolf.js.map
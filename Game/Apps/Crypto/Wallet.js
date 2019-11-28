"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDom = require("react-dom");
const React = require("react");
const App_1 = require("../App");
const Utils_1 = require("../../Core/Utils");
const Icons_1 = require("../../Core/Icons");
const Observable_1 = require("../../Core/Observable");
const Window_1 = require("../../OS/Window");
const OS_1 = require("../../OS/OS");
class Wallet extends Observable_1.default {
    constructor(options) {
        super();
        this.symbol = options.symbol;
        this.name = options.name;
        this.amount = options.amount || 0;
        this.icon = options.icon;
        this.on("afterChangeValue", (args) => { this.ValueChanged(args); });
        Wallet.AllWallets[options.symbol] = this;
    }
    static TryBuy(itemKey, amount, symbol) {
        return new Promise((resolve, reject) => {
            if (OS_1.OS.getSharedData(itemKey)) {
                console.log("Tried to buy existing upgrade " + itemKey);
                reject();
            }
            else {
                const wallet = Wallet.AllWallets[symbol];
                if (!wallet || wallet.amount < amount) {
                    console.log("Amount check failed " + (wallet && wallet.amount) + "/" + amount);
                    reject();
                }
                else {
                    wallet.ChangeValue(-amount);
                    OS_1.OS.setSharedData(itemKey, true);
                    resolve();
                }
            }
        });
    }
    static MakeMoneyDoodad(amount, symbol) {
        if (amount <= 0) {
            return;
        }
        let doodadDiv = $("<div class=\"moneyDoodad\"></div>");
        doodadDiv.css("position", "absolute");
        doodadDiv.text(Utils_1.default.DisplayNumber(amount) + " " + symbol);
        $(".item.money > .icon").append(doodadDiv);
        doodadDiv.animate({ bottom: "200px" }, 700, null, () => {
            doodadDiv.remove();
        });
    }
    static ClearAllWallets() {
        for (let symbol in Wallet.AllWallets) {
            Wallet.AllWallets[symbol].ChangeValue(-Wallet.AllWallets[symbol].amount);
        }
    }
    static AnimatedAdd(symbol, amount, chunk, delay) {
        let addedSoFar = 0;
        let rightWallet = Wallet.AllWallets[symbol];
        return new Promise((resolve, _reject) => {
            let processNextState = () => {
                if (addedSoFar >= amount) {
                    resolve();
                }
                else {
                    let amtToAdd = Math.min(amount - addedSoFar, chunk);
                    addedSoFar += amtToAdd;
                    rightWallet.ChangeValue(amtToAdd);
                    setTimeout(() => {
                        processNextState();
                    }, delay);
                }
            };
            processNextState();
        });
    }
    ValueChanged(eventInfo) {
        Wallet.MakeMoneyDoodad(eventInfo[1], eventInfo[0].symbol);
    }
    ChangeValue(amount) {
        this.amount += amount;
        this.trigger("afterChangeValue", [this, amount]);
    }
    CreateCurrencyDisplay() {
        let mainDiv = $("<div class=\"wallet\"></div>");
        let icon = Icons_1.AllIcons.Wallet.large.dark;
        let iconStyles = {
            "backgroundImage": "url(\"" + Utils_1.AssetLocation + icon.id + "\")",
            "width": icon.width + "px",
            "height": icon.height + "px"
        };
        ReactDom.render([
            React.createElement("div", { className: "mainIcon", key: "a", style: iconStyles }),
            React.createElement("div", { className: "symbol", key: "b" }, this.symbol),
            React.createElement("div", { className: "value", key: "c" }, Utils_1.default.DisplayNumber(this.amount))
        ], mainDiv[0]);
        return mainDiv;
    }
}
Wallet.AllWallets = {};
exports.Wallet = Wallet;
class WalletApp extends App_1.default {
    constructor() {
        super();
        let walletCSH = new Wallet({
            symbol: "CSH",
            name: "Cash",
            amount: 0,
            icon: Icons_1.AllIcons.AlphaCoin
        });
        walletCSH.on("afterChangeValue", () => {
            this.DrawWindowContent();
        });
        let walletACN = new Wallet({
            symbol: "ACN",
            name: "Alpha Coin",
            amount: 0,
            icon: Icons_1.AllIcons.ComputerBoard
        });
        walletACN.on("afterChangeValue", () => {
            this.DrawWindowContent();
        });
        let iconElement = $(".item.money > .icon");
        let icon = Icons_1.AllIcons.Wallet.large.dark;
        iconElement.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
        iconElement.css("width", icon.width + "px");
        iconElement.css("height", icon.height + "px");
        iconElement.on("click", () => {
            this.ActivateOrCreate();
        });
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            width: 430,
            height: 149,
            icon: Icons_1.AllIcons.Wallet,
            title: "Wallet"
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
        for (let symbol in Wallet.AllWallets) {
            let valueDiv = Wallet.AllWallets[symbol].CreateCurrencyDisplay();
            rootDiv.append(valueDiv);
        }
        this.windowObj.contentDiv.append(rootDiv);
    }
}
exports.WalletApp = WalletApp;
//# sourceMappingURL=Wallet.js.map
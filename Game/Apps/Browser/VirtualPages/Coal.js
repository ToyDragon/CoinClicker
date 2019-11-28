"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualPage_1 = require("./VirtualPage");
const ReactDom = require("react-dom");
const React = require("react");
const Utils_1 = require("../../../Core/Utils");
const Icons_1 = require("../../../Core/Icons");
const OS_1 = require("../../../OS/OS");
const Wallet_1 = require("../../Crypto/Wallet");
const Snake_1 = require("../../Minigames/Snake");
const Digger_1 = require("../../Minigames/Digger");
class CoalPage extends VirtualPage_1.default {
    constructor() {
        super();
    }
    MatchesAddress(address) {
        return /^(www\.)?coal\.io/i.test(address);
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
                        React.createElement("div", { className: "pageTitle" }, "Coal.io"),
                        React.createElement("div", { className: "pageSubtitle" }, "Get your game on!")),
                    React.createElement("div", { className: "coal" })),
                React.createElement("div", { id: "shopItems", ref: rootRef }))
        ], contentDiv[0]);
        this.rootDiv = $(rootRef.current);
        this.UpdateItems();
    }
    createShopRow(itemObj) {
        var rowDiv = $("<div></div>");
        rowDiv.addClass("shopItem");
        var iconDiv = $("<div></div>");
        iconDiv.addClass("shopItemIcon");
        iconDiv.css("background-image", "url(\"" + Utils_1.AssetLocation + itemObj.icon.veryLarge.dark.id + "\")");
        rowDiv.append(iconDiv);
        var titleSectionDiv = $("<div></div>");
        titleSectionDiv.addClass("shopItemTitleSection");
        var titleDiv = $("<div></div>");
        titleDiv.addClass("shopItemTitle");
        titleDiv.text(itemObj.title);
        titleSectionDiv.append(titleDiv);
        var subtitleDiv = $("<div></div>");
        subtitleDiv.addClass("shopItemSubTitle");
        subtitleDiv.text(itemObj.subtitle);
        titleSectionDiv.append(subtitleDiv);
        rowDiv.append(titleSectionDiv);
        var priceDiv = $("<div></div>");
        priceDiv.addClass("shopItemPrice");
        priceDiv.text(itemObj.price);
        rowDiv.append(priceDiv);
        var symbolDiv = $("<div></div>");
        symbolDiv.addClass("shopItemPriceSymbol");
        symbolDiv.text(itemObj.symbol);
        rowDiv.append(symbolDiv);
        rowDiv.on("click", function () { itemObj.action(); });
        return rowDiv;
    }
    getAvailableItems() {
        var items = [];
        /*
        if(!OS.SharedData.hasMusicPlayer){
            items.push({
                title: "Music Player",
                subtitle: "Really sets the atmosphere",
                icon: AllIcons.music,
                price: 125,
                symbol: "CSH",
                action: tryBuyMusic
            });
        }
        */
        if (!OS_1.OS.getSharedData("hasSnake")) {
            items.push({
                title: "Snake",
                subtitle: "Snakes like apples, right?",
                icon: Icons_1.AllIcons.Snake,
                price: 4999,
                symbol: "CSH",
                action: () => { this.tryBuySnake(); }
            });
        }
        /*
        if(!OS.SharedData.hasPinball){
            items.push({
                title: "Plunko",
                subtitle: "What a clasic",
                icon: AllIcons.Balls,
                price: 1,//450,
                symbol: "CSH",
                action: () => {this.tryBuyPinball();}
            });
        }
        */
        if (!OS_1.OS.getSharedData("hasDigger")) {
            items.push({
                title: "Digger",
                subtitle: "Like minecraft, but way worse!",
                icon: Icons_1.AllIcons.Shovel,
                price: 449,
                symbol: "ACN",
                action: () => { this.tryBuyDigger(); }
            });
        }
        return items;
    }
    UpdateItems() {
        this.rootDiv.empty();
        var items = this.getAvailableItems();
        for (var i = 0; i < items.length; i++) {
            var itemObj = items[i];
            var rowDiv = this.createShopRow(itemObj);
            this.rootDiv.append(rowDiv);
        }
    }
    tryBuySnake() {
        if (OS_1.OS.getSharedData("hasSnake"))
            return;
        var cshWallet = Wallet_1.Wallet.AllWallets["CSH"];
        if (cshWallet.amount < 4999)
            return;
        cshWallet.ChangeValue(-4999);
        OS_1.OS.setSharedData("hasSnake", true);
        OS_1.OS.CreateDesktopItem({
            title: "Snake",
            icon: Icons_1.AllIcons.Snake,
            app: new Snake_1.default({ title: "Snake" })
        });
        this.UpdateItems();
    }
    /*
    function tryBuyMusic(){
        if(os.sharedData.hasMusicPlayer) return;
        
        var cshWallet = wallet.allWallets["CSH"];
        if(cshWallet.amount < 125)return;
        cshWallet.changeValue(-125);
        
        os.sharedData.hasMusicPlayer = true;
        os.createDesktopItem({
            title: "Music Player",
            icon: core.icons.music,
            click: musicplayer.activateOrLaunch
        });
        
        updateItems();
    }
    
    private tryBuyPinball(): void{
        if(!OS.SharedData.hasPinball){
            OS.SharedData.hasPinball = true;
            OS.CreateDesktopItem({
                title: "Plunko",
                icon: AllIcons.Balls,
                app: new Pinball({title: "Plunko", symbol: "ACN"})
            });
            
            this.UpdateItems();
        }
    }
    */
    tryBuyDigger() {
        if (!OS_1.OS.getSharedData("hasDigger")) {
            var cshWallet = Wallet_1.Wallet.AllWallets["ACN"];
            if (cshWallet.amount < 449)
                return;
            cshWallet.ChangeValue(-449);
            OS_1.OS.setSharedData("hasDigger", true);
            OS_1.OS.CreateDesktopItem({
                title: "Doug the Digger",
                icon: Icons_1.AllIcons.Shovel,
                app: new Digger_1.default({ title: "Doug the Digger" })
            });
            this.UpdateItems();
        }
    }
    Cleanup() {
    }
}
exports.default = CoalPage;
//# sourceMappingURL=Coal.js.map
import VirtualPage from "./VirtualPage";
import * as ReactDOM from "react-dom";
import * as React from "react";
import Utils, { AssetLocation } from "../../../Core/Utils";
import { OS, SharedDataKeys } from "../../../OS/OS";
import { AllIcons, IconDescriptor } from "../../../Core/Icons";
import { Wallet } from "../../Crypto/Wallet";
import Exchange from "../../Crypto/Exchange/Exchange";
import Miner from "../../Crypto/Miner";

export interface MojaveSharedDataKeys extends SharedDataKeys{
    hasACNExchange: boolean;
    hasACNAdvancedSell: boolean;
    hasACNBuy: boolean;
    hasACNSellOrders: boolean;
    hasACNBuyOrders: boolean;

    hasACNMiner0: boolean;
    hasACNMiner1: boolean;
    hasACNMiner2: boolean;
    hasACNMiner3: boolean;
    hasACNMiner4: boolean;
}

class ShopItem{
    track?: number;
    trackIndex?: number;
    subtitle: string;
    action: Function;
    title: string;
    icon: IconDescriptor;
    price: number;
    symbol: string;
    hasVar: keyof MojaveSharedDataKeys;
}

export default class MojavePage extends VirtualPage{

    public rootDiv: JQuery;

    public constructor(){
        super();
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?mojave\.com/i.test(address);
    }

    public Render(contentDiv: JQuery): void{

        let rootRef = React.createRef<HTMLDivElement>();

        ReactDOM.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `
                .cactus{
                    background-image: url("` + AssetLocation + `icons/Mojave128.png");
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
            `}}></style>,
            <div className="pageRoot" key="b">
                <div className="headerSection">
                    <div>
                        <div className="pageTitle">Mojave.com</div>
                        <div className="cactus"></div>
                    </div>
                    <div className="pageSubtitle">Your one stop shop for crypto currency tools.</div>
                </div>
                <div id="shopItems" ref={rootRef}>
                </div>
            </div>
        ]
        , contentDiv[0]);

        this.rootDiv = $(rootRef.current);
        this.UpdateItems();
    }

    private GetAllItems(): ShopItem[]{
		const items: ShopItem[] = [];
        
        items.push({
            hasVar: "hasACNExchange",
            title: "Alpha Exchange",
            subtitle: "Sell Alpha Coin For Cash",
            icon: AllIcons.AlphaExchange,
            price: 5,
            symbol: "ACN",
            action: () => {
                let exchange =  new Exchange({
                    symbol: "ACN",
                    initialrate: 50,
                    icon: AllIcons.AlphaExchange,
                    growth: 1.002,
                    disasterRate: 3,
                    disasterRange: 0.8,
                    disasterLength: 30,
                    blessingRate: 2,
                    blessingRange: 1.35,
                    blessingLength: 15
                })
                
                OS.CreateDesktopItem({
                    title: exchange.title,
                    icon: exchange.icon,
                    app: exchange
                });
            }
        });

		var symbol = "ACN";
		var baseTitle = "Alpha Coin Miner";
		var subtitles = [
			"Always Allot Alpha",
			"Alliteration Always Advances",
			"Angry Angsty Awfuls",
			"Apples Aid All Ailments",
			"Another Altruistic Action"
        ];
        
		for(let i = 0; i < subtitles.length; i++){
            let price = 100 * Math.pow(15, i*2);
            if(i == 0){
                price = 20; //Super low to make sure it can be afforded no matter what on the first sale.
            }
			items.push({
				hasVar: ("has" + symbol + "Miner" + i) as any,
				title: baseTitle,
				subtitle: subtitles[i],
				icon: AllIcons.ComputerBoard,
				price: price,
				symbol: "CSH",
                action: () => {
                    let title = "Alpha Miner";
                    if(i > 0){
                        title += " " + (i+1);
                    }
                    
                    const app = new Miner({
                        title: title,
                        icon: AllIcons.ComputerBoard,
                        symbol: "ACN",
                        block: i+1
                    });
                    OS.CreateDesktopItem({
                        title: title,
                        icon: AllIcons.ComputerBoardOutline,
                        app: app
                    });
                }
            });
            
            if(i == 0){
                items.push({
                    hasVar: "hasACNBuy",
                    title: "ACN Purchasing",
                    subtitle: "Buy Alpha Coins",
                    icon: AllIcons.AlphaExchange,
                    price: 1999,
                    symbol: "CSH",
                    action: () => { 
                        Wallet.TryBuy<MojaveSharedDataKeys>("hasACNBuy", 1999, "CSH").then(() => {});
                    }
                });

                items.push({
                    hasVar: "hasACNAdvancedSell",
                    title: "ACN Selling",
                    subtitle: "Sell sAlpha Coins",
                    icon: AllIcons.AlphaExchange,
                    price: 2499,
                    symbol: "CSH",
                    action: () => { 
                        Wallet.TryBuy<MojaveSharedDataKeys>("hasACNAdvancedSell", 2499, "CSH").then(() => {});
                    }
                });

                items.push({
                    hasVar: "hasACNBuyOrders",
                    title: "ACN Buy Orders",
                    subtitle: "Auto-buy at specified prices",
                    icon: AllIcons.AlphaExchange,
                    price: 9999,
                    symbol: "CSH",
                    action: () => { 
                        Wallet.TryBuy<MojaveSharedDataKeys>("hasACNBuyOrders", 9999, "CSH").then(() => {});
                    }
                });
                
                items.push({
                    hasVar: "hasACNSellOrders",
                    title: "ACN Sell Orders",
                    subtitle: "Auto-sell at specified prices",
                    icon: AllIcons.AlphaExchange,
                    price: 19999,
                    symbol: "CSH",
                    action: () => { 
                        Wallet.TryBuy<MojaveSharedDataKeys>("hasACNSellOrders", 19999, "CSH").then(() => {});
                    }
                });
            }
		}
		
		return items;
    }

    private GetAvailableItems(): ShopItem[]{
		var items = this.GetAllItems();
		
		for(var i = items.length-1; i >= 0; i--){
			if(OS.getSharedData<MojaveSharedDataKeys>(items[i].hasVar)){
				items.splice(i, 1);
			}
		}
		
		if(items.length > 3){
			items = items.splice(0,3);
		}
		
		return items;
    }

    private CreateShopRow(item: ShopItem): JQuery{
        var rowDiv = $("<div></div>");
        rowDiv.addClass("shopItem");
        
        var iconDiv = $("<div></div>");
        iconDiv.addClass("shopItemIcon");
        iconDiv.css("background-image", "url(\"" + AssetLocation + item.icon.veryLarge.dark.id +"\")");
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
        priceDiv.text(Utils.DisplayNumber(item.price));
        rowDiv.append(priceDiv);
        
        var symbolDiv = $("<div></div>");
        symbolDiv.addClass("shopItemPriceSymbol");
        symbolDiv.text(item.symbol);
        rowDiv.append(symbolDiv);
        rowDiv.on("click", () => {
            Wallet.TryBuy<MojaveSharedDataKeys>(item.hasVar, item.price, item.symbol).then(() => {
                item.action();
                this.UpdateItems();
            });
        });
        
        return rowDiv;
    }

    private UpdateItems(): void{
		if(!this.rootDiv) return;
		this.rootDiv.empty();
		var items = this.GetAvailableItems();
		for(var i = 0; i < items.length; i++){
			var itemObj = items[i];
			var rowDiv = this.CreateShopRow(itemObj);
			this.rootDiv.append(rowDiv);
		}
    }

    public Cleanup(): void{

    }
}
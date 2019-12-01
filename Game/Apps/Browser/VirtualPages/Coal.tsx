import VirtualPage from "./VirtualPage";
import * as ReactDom from "react-dom";
import * as React from "react";
import { AssetLocation } from "../../../Core/Utils";
import { IconDetails, AllIcons } from "../../../Core/Icons";
import { OS, SharedDataKeys } from "../../../OS/OS";
import { Wallet } from "../../Crypto/Wallet";
import Snake from "../../Minigames/Snake";
import Pinball from "../../Minigames/Pinball";
import DiggerGame from "../../Minigames/Digger";
import GA from "../../../Core/GA";
import { IHasSaveData } from "../../../OS/StateController";

interface ShopItem{
    title: string;
    subtitle: string;
    icon: IconDetails;
    price: number;
    symbol: string;
    action: (fromSave: boolean) => void;
}

export interface CoalSharedDataKeys extends SharedDataKeys{
    hasSnake: boolean;
    hasDigger: boolean;
}

export default class CoalPage extends VirtualPage implements IHasSaveData{

    public GetStateKey(): string {
        return "Coal";
    }

    public GetState(): { nState?: any; sState?: any; } {
        return null;
    }

    public LoadState(_nState: any, _sState: any): void {
        
    }

    public AfterStateLoaded(): void {
        this.tryBuyDigger(true);
        this.tryBuySnake(true);
    }

    private rootDiv: JQuery<HTMLElement>;
    private snakeApp: Snake;
    private dougApp: DiggerGame;

    public constructor(){
        super();
        OS.StateController.AddTrackedObject(this);
        this.snakeApp = new Snake({title: "Snake"});
        this.dougApp = new DiggerGame({title: "Doug the Digger"});
    }

    public GetURL(): string {
        return "www.coal.io";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?coal\.io/i.test(address);
    }

    public Render(contentDiv: JQuery): void{
        const rootRef = React.createRef<HTMLDivElement>();

        ReactDom.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `
                .coal{
                    background-image: url("` + AssetLocation + `icons/Coal128.png");
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
            `}}></style>,
            <div className="pageRoot" key="b">
                <div className="headerSection">
                    <div className="pageTitleSection">
                        <div className="pageTitle">Coal.io</div>
                        <div className="pageSubtitle">Get your game on!</div>
                    </div>
                    <div className="coal"></div>
                </div>
                <div id="shopItems" ref={rootRef}>
                </div>
            </div>
        ]
        , contentDiv[0]);

        this.rootDiv = $(rootRef.current);
        this.UpdateItems();
    }

    private createShopRow(itemObj): JQuery<HTMLElement>{
		var rowDiv = $("<div></div>");
		rowDiv.addClass("shopItem");
		
		var iconDiv = $("<div></div>");
		iconDiv.addClass("shopItemIcon");
        iconDiv.css("background-image", "url(\"" + AssetLocation + itemObj.icon.veryLarge.dark.id +"\")");
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
		rowDiv.on("click", () => { itemObj.action(false); });
		
		return rowDiv;
	}
	
	private getAvailableItems(): ShopItem[]{
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
		if(!OS.getSharedData<CoalSharedDataKeys>("hasSnake")){
			items.push({
				title: "Snake",
				subtitle: "Snakes like apples, right?",
				icon: AllIcons.Snake,
				price: 4999,
				symbol: "CSH",
				action: (fromSave: boolean) => {this.tryBuySnake(fromSave);}
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
		
		if(!OS.getSharedData<CoalSharedDataKeys>("hasDigger")){
			items.push({
				title: "Digger",
				subtitle: "Like minecraft, but way worse!",
				icon: AllIcons.Shovel,
				price: 449,
				symbol: "ACN",
				action: (fromSave: boolean) => {this.tryBuyDigger(fromSave);}
			});
        }
		
		return items;
	}
	
	private UpdateItems(): void{
        if(this.rootDiv){
            this.rootDiv.empty();
            var items = this.getAvailableItems();
            for(var i = 0; i < items.length; i++){
                var itemObj = items[i];
                var rowDiv = this.createShopRow(itemObj);
                this.rootDiv.append(rowDiv);
            }
        }
	}
	
	private tryBuySnake(fromSave: boolean): void{
        if(!fromSave){
            if(OS.getSharedData<CoalSharedDataKeys>("hasSnake")){
                return;
            }

            const cshWallet = Wallet.AllWallets["CSH"];
            if(cshWallet.GetAmount() < 4999){
                return;
            }
            cshWallet.ChangeValue(-4999);
            OS.setSharedData<CoalSharedDataKeys>("hasSnake", "1");
        }else if(!OS.getSharedData<CoalSharedDataKeys>("hasSnake")){
            return;
        }
		
		OS.CreateDesktopItem({
			title: "Snake",
            icon: AllIcons.Snake,
            app: this.snakeApp
		});
		
        this.UpdateItems();

        if(!fromSave){
            GA.Event(GA.Events.CoalBuy, {label: "Snake"});
        }
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
        //TODO GA
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
            //TODO GA
		}
    }
    */
	
	private tryBuyDigger(fromSave: boolean): void{
        if(!fromSave){
            if(OS.getSharedData<CoalSharedDataKeys>("hasDigger")){
                return; 
            }
            const cshWallet = Wallet.AllWallets["ACN"];
            if(cshWallet.GetAmount() < 449){
                return;
            }
            cshWallet.ChangeValue(-449);
            OS.setSharedData<CoalSharedDataKeys>("hasDigger", "1");
        }else if(!OS.getSharedData<CoalSharedDataKeys>("hasDigger")){
            return;
        }

        OS.CreateDesktopItem({
            title: "Doug the Digger",
            icon: AllIcons.Shovel,
            app: this.dougApp
        });
        
        this.UpdateItems();

        if(!fromSave){
            GA.Event(GA.Events.CoalBuy, {label: "Doug the Digger"});
		}
    }

    public Cleanup(): void{

    }
}
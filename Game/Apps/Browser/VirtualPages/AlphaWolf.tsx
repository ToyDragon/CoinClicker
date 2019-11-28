import VirtualPage from "./VirtualPage";
import * as ReactDOM from "react-dom";
import * as React from "react";
import Utils, { AssetLocation } from "../../../Core/Utils";
import { AllIcons, IconDescriptor } from "../../../Core/Icons";
import { OS } from "../../../OS/OS";
import { Wallet } from "../../Crypto/Wallet";
import Miner, { BoostItem } from "../../Crypto/Miner";

class ShopItem{
    track: number;
    trackIndex: number;
    subtitle: string;
    action: Function;
    title: string;
    icon: IconDescriptor;
    price: number;
    symbol: string;
    hasVar: string;
}

export default class AlphaWolfPage extends VirtualPage{

    public rootDiv: JQuery;
    public mainSymbol: string;

    public constructor(){
        super();

        this.mainSymbol = "ACN";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?alphawolf\.org/i.test(address);
    }

    public Cleanup(): void{

    }

    public Render(contentDiv: JQuery): void{

        let rootRef = React.createRef<HTMLDivElement>();

        ReactDOM.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `
                .wolf{
                    background-image: url("` + AssetLocation + `icons/AlphaWolf64.png");
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
            `}}></style>,
            <div className="pageRoot" key="b">
                <div className="headerSection">
                    <div className="pageTitleSection">
                        <div className="pageTitle">AlphaWolf.org</div>
                        <div className="pageSubtitle">Alpha Coin Enhancements</div>
                    </div>
                    <div className="wolf"></div>
                </div>
                <div id="shopItems" ref={rootRef}>
                </div>
            </div>
        ]
        , contentDiv[0]);

        this.rootDiv = $(rootRef.current);
        this.UpdateItems();
    }
	
	private UpdateItems(): void{
        if(!this.rootDiv)
        {
            return;
        }
		this.rootDiv.empty();
		let items = this.GetAvailableItems();
		for(let i = 0; i < items.length; i++){
			let itemObj = items[i];
			let rowDiv = this.CreateShopRow(itemObj);
			this.rootDiv.append(rowDiv);
		}
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
        
		rowDiv.on("click", function(){ item.action(); });
		
		return rowDiv;
    }
    
    private GetAvailableItems(): ShopItem[]{
		var items = this.GetAllItems();
		for(var i = items.length-1; i >= 0; i--){
			if(this.AlreadyHasItem(items[i].track, items[i].trackIndex)){
				items.splice(i,1);
			}
		}
		
		if(items.length > 4){
			items = items.slice(0,4);
		}
		
		return items;
    }

    private GetAllItems(): ShopItem[]{
		let items: ShopItem[] = [];
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
		
		for(let i = 0; i < (speedNames.length + boostNames.length); i++){
			let track = i%2;
			let trackIndex = Math.floor(i/2);
			let boostVal = this.GetUpgradeBoost(track, trackIndex);
			let item = new ShopItem();
			if(track){
                item.title = boostNames[trackIndex];
                item.subtitle = this.GetBlockDisplay(boostVal);
                item.action = this.CreateTryBuyUpgrade(track, trackIndex, this.GetPrice(i), {name: item.title, blockMultiplier: boostVal});
			} else {
                item.title = speedNames[trackIndex];
                item.subtitle = this.GetSpeedDisplay(boostVal); 
                item.action = this.CreateTryBuyUpgrade(track, trackIndex, this.GetPrice(i), {name: item.title, speedBoost: boostVal});
			}
			
			item.track = track;
			item.trackIndex = trackIndex;
			item.icon = track ? AllIcons.ComputerBoardPower : AllIcons.ComputerBoardSpeed;
			item.price = this.GetPrice(i);
			item.symbol = "CSH";
			
			items.push(item);
		}
		
		return items;
    }

    public TryBuyUpgrade(track: number, trackNumber: number, price: number, boostObj: BoostItem, ignoreCheck: boolean): void{
        if(!ignoreCheck){
            if(this.AlreadyHasItem(track, trackNumber)){
                console.log("Already has " + track + ":" + trackNumber);
                return;
            }
        
            var cshWallet = Wallet.AllWallets["CSH"];
            if(cshWallet.amount < price) return;
            cshWallet.ChangeValue(-price);
        
            let hasVar = this.GetUpgradeName(track, trackNumber);
            OS.setSharedData(hasVar, true);
        }
        
        boostObj.symbol = this.mainSymbol;
        Miner.AddBonus(boostObj);
        
        this.UpdateItems();
    }

	public CreateTryBuyUpgrade(track: number, trackNumber: number, price: number, boostObj: BoostItem): Function{
		return (ignoreCheck) => {
            this.TryBuyUpgrade(track, trackNumber, price, boostObj, ignoreCheck);
		}
	}
	
	public GetSpeedDisplay(speed: number): string{
		var percent = (speed - 1)*100;
		return "+"+percent+"% Mining Speed"
	}
	
	public GetBlockDisplay(boost: number): string{
		var percent = (boost - 1)*100;
		return "+"+percent+"% Block Size"
	}

    private GetUpgradeBoost(track: number, trackNumber: number): number{
		var speeds = [2,2,2.2,1.9,1.5,1.6,2.6,2.2,1.5,2,2,1.5,2,1.75,1.5,2];
		var blockBoosts = speeds.reverse();
		if(track == 0){
			return speeds[trackNumber%speeds.length];
		}
		return blockBoosts[trackNumber%blockBoosts.length];
    }

    private GetPrice(trackNumber: number): number{
		if(trackNumber == 0) return 250;
		let multiplier = [1.4,1.9,1.6][trackNumber%3];
		let newPrice = multiplier * this.GetPrice(trackNumber-1);
		newPrice = Math.round(newPrice * 100)/100;
		return newPrice;
    }

    private GetUpgradeName(track: number, trackNumber: number): string{
		return "has" + this.mainSymbol + "Upgrade" + track + "_" + trackNumber;
    }
	
	private AlreadyHasItem(track: number, trackNumber: number): boolean{
		let hasUpgrade = this.GetUpgradeName(track, trackNumber);
		return OS.getSharedData(hasUpgrade);
    }
    
    public RestoreState(): void{
		var items = this.GetAllItems();
		for(var i = 0; i < items.length; i++){
			if(this.AlreadyHasItem(items[i].track, items[i].trackIndex)){
				items[i].action(true);
			}
		}
	}
}
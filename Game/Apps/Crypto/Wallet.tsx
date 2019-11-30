import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../App";
import Utils, { AssetLocation } from "../../Core/Utils";
import { IconDescriptor, AllIcons } from "../../Core/Icons";
import Observable from "../../Core/Observable";
import WebosWindow from "../../OS/Window";
import { OS, SharedDataKeys } from "../../OS/OS";
import GA from "../../Core/GA";

interface WalletOptions{
    symbol: string;
    name: string;
    amount: number;
    icon: IconDescriptor;
}

interface WalletEvents{
    afterChangeValue;
}

export class Wallet extends Observable<WalletEvents>{

    public static TryBuy<WalletData extends SharedDataKeys>(itemKey: keyof WalletData, amount: number, symbol: string): Promise<void>{
        return new Promise((resolve, reject) =>{
            if(OS.getSharedData(itemKey as string)){
                console.log("Tried to buy existing upgrade " + itemKey);
                reject();
            }else{
                const wallet = Wallet.AllWallets[symbol];
                if(!wallet || wallet.amount < amount){
                    console.log("Amount check failed " + (wallet && wallet.amount) + "/" + amount);
                    reject();
                }else{
                    wallet.ChangeValue(-amount);
                    OS.setSharedData(itemKey as string, true);
                    resolve();
                }
            }
        });
    }

    public static MakeMoneyDoodad(amount: number, symbol: string): void{
        if(amount <= 0)
        {
            return;
        }

        let doodadDiv = $("<div class=\"moneyDoodad\"></div>");
        doodadDiv.css("position", "absolute");
        doodadDiv.text(Utils.DisplayNumber(amount) + " " + symbol);
        $(".item.money > .icon").append(doodadDiv);
        doodadDiv.animate(
            { bottom: "200px" }
            , 700
            , null
            , () => {
                doodadDiv.remove();
            }
        );
    }

    public static ClearAllWallets(): void{
		for(let symbol in Wallet.AllWallets){
			Wallet.AllWallets[symbol].ChangeValue(-Wallet.AllWallets[symbol].amount);
		}
    }

    public static AnimatedAdd(symbol: string, amount: number, chunk: number, delay: number): Promise<void>{
        let addedSoFar = 0;
        let rightWallet = Wallet.AllWallets[symbol];
        return new Promise((resolve, _reject) => {
            let processNextState = () => {
                if(addedSoFar >= amount){
                    resolve();
                }else{
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

    public static AllWallets: {[symbol: string]: Wallet} = {};

    public symbol: string;
    public name: string;
    public amount: number;
    public icon: IconDescriptor;

    public constructor(options: WalletOptions){
        super();
        
        this.symbol = options.symbol;
        this.name = options.name;
        this.amount = options.amount || 0;
        this.icon = options.icon;
        
        this.on("afterChangeValue", (args) => { this.ValueChanged(args); });

        Wallet.AllWallets[options.symbol] = this;
    }

    public ValueChanged(eventInfo: [Wallet, number]): void{
		Wallet.MakeMoneyDoodad(eventInfo[1], eventInfo[0].symbol);
    }
    
    public ChangeValue(amount): void{
        this.amount += amount;
        this.trigger("afterChangeValue", [this, amount]);
    }

    public CreateCurrencyDisplay(): JQuery{
        let mainDiv = $("<div class=\"wallet\"></div>");

        let icon = AllIcons.Wallet.large.dark;
        let iconStyles = {
            "backgroundImage": "url(\"" + AssetLocation + icon.id + "\")",
            "width": icon.width + "px",
            "height": icon.height + "px"
        };
        ReactDom.render([
            <div className="mainIcon" key="a" style={iconStyles}></div>,
            <div className="symbol" key="b">{this.symbol}</div>,
            <div className="value" key="c">{Utils.DisplayNumber(this.amount)}</div>
        ], mainDiv[0]);
        
        return mainDiv;
    }
}

export class WalletApp extends App<{}>{

    public constructor(){
        super();

        let walletCSH = new Wallet({
            symbol: "CSH",
            name: "Cash",
            amount: 0,
            icon: AllIcons.AlphaCoin
        });
        walletCSH.on("afterChangeValue", () => {
            this.DrawWindowContent();
        });

        let walletACN = new Wallet({
            symbol: "ACN",
            name: "Alpha Coin",
            amount: 0,
            icon: AllIcons.ComputerBoard
        });
        walletACN.on("afterChangeValue", () => {
            this.DrawWindowContent();
        });

		let iconElement = $(".item.money > .icon");
		let icon = AllIcons.Wallet.large.dark;
		iconElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
		iconElement.css("width", icon.width + "px");
		iconElement.css("height", icon.height + "px");
		
		iconElement.on("click", () => {
			this.ActivateOrCreate();
		});
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 250,
			height: 149,
			icon: AllIcons.Wallet,
            title: "Wallet",
            openEvent: GA.Events.WalletOpen,
            closeEvent: GA.Events.WalletClose
		});
		
		this.windowObj.on("close", function(){
			this.windowObj = null;
		});
		
		this.DrawWindowContent();
    }

    public DrawWindowContent(): void{
		if(!this.windowObj) return;
		this.windowObj.contentDiv.empty();

		let rootDiv = $("<div></div>");
		rootDiv.css("padding", "4px");
		
		for(let symbol in Wallet.AllWallets){
			let valueDiv = Wallet.AllWallets[symbol].CreateCurrencyDisplay();
			rootDiv.append(valueDiv);
		}

		this.windowObj.contentDiv.append(rootDiv);
    }
}
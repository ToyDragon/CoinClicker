import { OS, SharedDataKeys } from "../../../OS/OS";
import { AllIcons, IconDescriptor } from "../../../Core/Icons";
import { Wallet } from "../../Crypto/Wallet";
import Exchange from "../../Crypto/Exchange/Exchange";
import Miner from "../../Crypto/Miner";
import GA from "../../../Core/GA";
import { ShopItem, ShopPage } from "../ShopBase";

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

class MinerShopItem extends ShopItem{

    private tier: number;
    public miner: Miner;

    protected GetTotalBoostText(): string {
        return "";
    }

    public constructor(subtitle: string, price: number, symbol: string, tier: number, id: keyof MojaveSharedDataKeys){
        super();
        this.title = "Alpha Coin Miner";
        this.basePrice = price;
        this.subtitle = subtitle;
        this.tier = tier;
        this.icon = AllIcons.ComputerBoard;
        this.symbol = symbol;
        this.upgradeKey = id;
        this.maxCount = 1;
    }

    public AfterPurchaseComplete(): void{
        this.CreateMiner();
        this.miner.ActivateOrCreate();
        OS.setSharedData(this.upgradeKey, "1");
        GA.Event(GA.Events.MojaveBuy, { label: this.GetGALabel() });
    }

    private CreateMiner(): void{
        let title = "Alpha Miner";
        if(this.tier > 0){
            title += " " + (this.tier+1);
        }
        
        this.miner = new Miner({
            title: title,
            icon: AllIcons.ComputerBoard,
            symbol: "ACN",
            block: Math.pow(10,this.tier+1)
        });
        OS.CreateDesktopItem({
            title: title,
            icon: AllIcons.ComputerBoardOutline,
            app: this.miner
        });
    }

    public Restore(level: number): void{
        if(level === 1){
            this.level = level;
            this.CreateMiner();
        }
    }

    public AfterStateLoaded(): void{
        if(this.miner){
            this.miner.ActivateOrCreate();
        }
    }
}

class MojaveOneoffItem extends ShopItem{
    
    private gaLabel: string;

    public constructor(title: string, subtitle: string, icon: IconDescriptor, price: number, symbol: string, gaLabel: string, id: keyof MojaveSharedDataKeys){
        super();
        this.title = title;
        this.basePrice = price;
        this.subtitle = subtitle;
        this.icon = icon;
        this.symbol = symbol;
        this.gaLabel = gaLabel;
        this.upgradeKey = id;
        this.maxCount = 1;
    }

    public GetGALabel(): string{
        return this.gaLabel;
    }

    protected GetTotalBoostText(): string {
        return "";
    }

    public AfterPurchaseComplete(): void{
        OS.setSharedData(this.upgradeKey, "1");
        GA.Event(GA.Events.MojaveBuy, { value: this.level, label: this.GetGALabel() });
    }
}

class MojaveExchangeItem extends MojaveOneoffItem{
    private exchangeApp: Exchange;
    public constructor(){
        super("Alpha Exchange", "Sell Alpha Coin For Cash", AllIcons.AlphaExchange, 5, Wallet.Symbol.ACN, "exchange", "hasACNExchange");
        this.exchangeApp = new Exchange({
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
        });
    }

    private AddExchangeToDesktop(): void{
        OS.CreateDesktopItem({
            title: this.exchangeApp.title,
            icon: this.exchangeApp.icon,
            app: this.exchangeApp
        });
    }

    public AfterPurchaseComplete(): void{
        super.AfterPurchaseComplete();
        this.AddExchangeToDesktop();
    }

    public AfterStateLoaded(): void{
        if(this.level){
            this.AddExchangeToDesktop();
        }
    }
}

export default class MojavePage extends ShopPage{


    public GetStateKey(): string {
        return "Mojave";
    }

    public constructor(){
        super(AllIcons.Mojave, "Mojave.com", "Your one stop shop for crypto currency tools.", "#b38418", "#d1b470");
    }

    protected PopulateItems(): void{
        this.allItems.push(new MojaveExchangeItem());
        this.allItems.push(new MinerShopItem("Always Allot Alpha", 6000, Wallet.Symbol.CSH, 0, "hasACNMiner0"));
        this.allItems.push(new MinerShopItem("Alliteration Always Advances", 10000 * Math.pow(15, 2), Wallet.Symbol.CSH, 1, "hasACNMiner1"));
        this.allItems.push(new MinerShopItem("Angry Angsty Awfuls", 10000 * Math.pow(15, 4), Wallet.Symbol.CSH, 2, "hasACNMiner2"));
        this.allItems.push(new MinerShopItem("Apples Aid All Ailments", 10000 * Math.pow(15, 6), Wallet.Symbol.CSH, 3, "hasACNMiner3"));
        this.allItems.push(new MinerShopItem("Another Altruistic Action", 10000 * Math.pow(15, 8), Wallet.Symbol.CSH, 4, "hasACNMiner4"));


        
        // this.allItems.push(new MojaveOneoffItem("ACN Purchasing", "Buy Alpha Coins", AllIcons.AlphaExchange, 1999, Wallet.Symbol.CSH, "exchange_buy", "hasACNBuy"));
        // this.allItems.push(new MojaveOneoffItem("ACN Selling", "Sell Alpha Coins", AllIcons.AlphaExchange, 2499, Wallet.Symbol.CSH, "exchange_sell", "hasACNAdvancedSell"));
        // this.allItems.push(new MojaveOneoffItem("ACN Buy Orders", "Auto-buy at specified prices", AllIcons.AlphaExchange, 9999, Wallet.Symbol.CSH, "exchange_buy_orders", "hasACNBuyOrders"));
        // this.allItems.push(new MojaveOneoffItem("ACN Sell Orders", "Auto-sell at specified prices", AllIcons.AlphaExchange, 19999, Wallet.Symbol.CSH, "exchange_sell_orders", "hasACNSellOrders"));
    }

    public GetURL(): string {
        return "www.mojave.com";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?mojave\.com/i.test(address);
    }
}
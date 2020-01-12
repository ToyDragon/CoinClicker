import Utils from "../../../Core/Utils";
import { AllIcons } from "../../../Core/Icons";
import { Wallet } from "../../Crypto/Wallet";
import { ShopItem, ShopPage } from "../ShopBase";
import { MinerBoostItem } from "../../Crypto/Miner";
import GA from "../../../Core/GA";

class BlockBoostItem extends ShopItem{
    private blockIncrement: number;
    public constructor(title: string, basePrice: number, blockIncrement: number, id: number){
        super();
        this.title = title;
        this.basePrice = basePrice;
        this.blockIncrement = blockIncrement;
        this.subtitle = "+" + Utils.DisplayNumber(blockIncrement) + " Block Size";
        this.icon = AllIcons.ComputerBoardPower;
        this.symbol = Wallet.Symbol.ACN;
        this.upgradeKey = "BlockBoost_"+id;
        this.maxCount = 10;
    }

    public GetTotalBoostText(): string{
        return "+" + Utils.DisplayNumber(this.blockIncrement*this.level) + " Block Size";
    }

    public GetMinerBoost(): MinerBoostItem | null{
        return {
            blockBoost: this.blockIncrement * this.level,
            symbol: Wallet.Symbol.ACN,
            name: this.title
        };
    }
    
    protected AfterPurchaseComplete(): void{
        GA.Event(GA.Events.AlphaWolfBuy, { value: this.level, label: this.GetGALabel() });
    }
}

class BlockSpeedItem extends ShopItem{
    private speedIncrement: number;
    public constructor(title: string, basePrice: number, speedIncrement: number, id: number){
        super();
        this.title = title;
        this.basePrice = basePrice;
        this.speedIncrement = speedIncrement;
        this.subtitle = "+" + Utils.DisplayNumber(speedIncrement*100) + "% Mining Speed";
        this.icon = AllIcons.ComputerBoardSpeed;
        this.symbol = Wallet.Symbol.ACN;
        this.upgradeKey = "SpeedBoost_"+id;
        this.maxCount = 3;
    }

    public GetTotalBoostText(): string{
        return "+" + Utils.DisplayNumber(this.speedIncrement*this.level*100) + " % Mining Speed";
    }

    public GetMinerBoost(): MinerBoostItem | null{
        return {
            speedBoost: 1 + (this.speedIncrement * this.level),
            symbol: Wallet.Symbol.ACN,
            name: this.title
        };
    }
    
    protected AfterPurchaseComplete(): void{
        GA.Event(GA.Events.AlphaWolfBuy, { value: this.level, label: this.GetGALabel() });
    }
}

export default class AlphaWolfPage extends ShopPage{

    public GetStateKey(): string {
        return "AlphaWolf";
    }

    public constructor(){
        super(AllIcons.AlphaWolf, "AlphaWolf.org", "Alpha Coin Enhancements", "#fff7e1", "#F4CB07");
    }

    protected PopulateItems(): void{
        this.allItems.push(new BlockBoostItem("Transaction Compression", 5, 1, 1));
        this.allItems.push(new BlockSpeedItem("+0.5 Voltage Boost", 10, 0.10, 1));
        this.allItems.push(new BlockBoostItem("Complex Hashing", 20, 5, 2));
        this.allItems.push(new BlockSpeedItem("Larger Transitors", 100, 0.20, 2));
        this.allItems.push(new BlockBoostItem("Transaction Grouping", 500, 20, 3));
        this.allItems.push(new BlockSpeedItem("Smaller Transitors", 1000, 0.30, 3));
        this.allItems.push(new BlockBoostItem("More GPU RAM", 1500, 300, 4));
        this.allItems.push(new BlockSpeedItem("RAM Disk Pagefile", 3000, 0.40, 3));

        // let boostNames = [
        //     "Transaction Compression",
        //     "Complex Hashing",
        //     "Transaction Grouping",
        //     "More GPU RAM",
        //     "3D Transactions",
        //     "Pythagorean Theorem",
        //     "Visual Basic GUI",
        //     "Imaginary Numbers",
        //     "USB Pet Rock",
        //     "Storage Expansion",
        //     "Lint Trap",

		// let speedNames = [
		// 	"+0.5 Voltage Boost",
		// 	"Larger Transitors",
		// 	"Smaller Transitors",
		// 	"RAM Disk Pagefile",
		// 	"Racing Stripes on Case",
		// 	"Second Graphics Card",
		// 	"Fire Decals",
        //     "Cubic Bezier Curves",
        //     "Wheels on Case",
        //     "LED Lights",
        //     "Poptart Cat Song",
        //     "Box Fan",
        //     "Jet Engine",
        //     "Running Shoes",
    }

    public GetURL(): string {
        return "www.alphawolf.org";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?alphawolf\.org/i.test(address);
    }
}
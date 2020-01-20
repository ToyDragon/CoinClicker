import Utils from "../../../Core/Utils";
import { SharedDataKeys } from "../../../OS/OS";
import { AllIcons } from "../../../Core/Icons";
import { Wallet } from "../../Crypto/Wallet";
import GA from "../../../Core/GA";
import { ShopPage, ShopItem } from "../ShopBase";
import { PickaxeBoostItem } from "../../Crypto/Pickaxe";

export interface DoorsSharedDataKeys extends SharedDataKeys{

}

class PickaxeItem extends ShopItem{
    private blockIncrement: number;
    public constructor(title: string, basePrice: number, blockIncrement: number, tier: number){
        super();
        this.title = title;
        this.basePrice = basePrice;
        this.blockIncrement = blockIncrement;
        this.subtitle = "+" + Utils.DisplayNumber(blockIncrement) + " Block Size";
        this.icon = AllIcons.ComputerBoardPower;
        this.symbol = Wallet.Symbol.CSH;
        this.upgradeKey = "PickaxeBoost_"+tier;
        this.maxCount = 10;
    }

    public GetTotalBoostText(): string{
        return "+" + Utils.DisplayNumber(this.blockIncrement*this.level) + " Block Size";
    }

    public GetPickaxeBoost(): PickaxeBoostItem | null{
        return {
            coinAdds: this.blockIncrement * this.level,
            name: this.title,
            icon: this.icon,
            subtitle: this.subtitle
        };
    }
    
    protected AfterPurchaseComplete(): void{
        GA.Event(GA.Events.AlphaWolfBuy, { value: this.level, label: this.GetGALabel() });
    }
}

export default class DoorsPage extends ShopPage{

    public firstUpgrade: PickaxeItem;

    public GetStateKey(): string {
        return "Doors";
    }

    public GetURL(): string {
        return "www.doors.com";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?doors\.com/i.test(address);
    }

    public constructor(){
        super(AllIcons.Doors, "Doors.com", "Click-based mining upgrades.", "#b38418", "#d1b470");
    }

    protected PopulateItems(): void {
        this.firstUpgrade = new PickaxeItem("Cubic Bezier Curves", 650, 1, 0); 
        this.allItems.push(this.firstUpgrade);
        this.allItems.push(new PickaxeItem("Wheels on Case", 15000, 5, 1));
        this.allItems.push(new PickaxeItem("LED Lights", 55000, 25, 2));
        this.allItems.push(new PickaxeItem("Poptart Cat Song", 145000, 125, 3));
        this.allItems.push(new PickaxeItem("Jet Engine", 600000, 600, 4));
    }
}
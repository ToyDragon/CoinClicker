import * as React from "react";
import * as ReactDom from "react-dom";
import Miner, { MinerBoostItem } from "../Crypto/Miner";
import LoadingBarWidget, { TriggerPoint } from "../../OS/Widgets/LoadingBar";
import { IconDescriptor } from "../../Core/Icons";
import Utils, { AssetLocation } from "../../Core/Utils";
import { Wallet } from "../Crypto/Wallet";
import { PickaxeBoostItem } from "../Crypto/Pickaxe";
import { OS } from "../../OS/OS";
import GA from "../../Core/GA";
import IconWidget from "../../OS/Widgets/Icon";
import VirtualPage from "./VirtualPages/VirtualPage";
import { IHasSaveData } from "../../OS/StateController";

export abstract class ShopItem{

    public itemBar: React.RefObject<LoadingBarWidget>;
    public priceDiv: React.RefObject<HTMLDivElement>;
    public totalBonusDiv: React.RefObject<HTMLDivElement>;

    protected title: string;
    protected subtitle: string;
    protected level: number;
    protected basePrice: number;
    protected scalingFactor: number;
    protected maxCount: number;
    protected symbol: string;
    protected upgradeKey: string;
    protected icon: IconDescriptor;

    protected constructor(){
        this.level = 0;
    }

    public GetMaxCount(): number {return this.maxCount;}
    public GetSymbol(): string {return this.symbol;}
    public GetTitle(): string {return this.title;}
    public GetSubtitle(): string {return this.subtitle;}
    public GetIcon(): IconDescriptor {return this.icon;}
    public GetLevel(): number {return this.level;}
    public GetUpgradeKey(): string {return "Upgrade"+this.upgradeKey;}
    public GetGALabel(): string {return this.upgradeKey;}

    public GetPrice(): number {
        //I think no scaling on price would be more fun, but if not do this.
        //return Math.pow(this.scalingFactor, this.level) * this.basePrice;
        return this.basePrice;
    }

    public TryPurchase(): void{
        if(this.level >= this.maxCount){
            return;
        }

        const wallet = Wallet.AllWallets[this.symbol];
        const price = this.GetPrice();
        if(wallet.GetAmount() < price){
            return;
        }
        wallet.ChangeValue(-price);
        
        this.PurchaseComplete();
    }

    protected PurchaseComplete(): void{
        this.level += 1;
        let minerBoost = this.GetMinerBoost();
        if(minerBoost){
            Miner.RemoveBonus(minerBoost.symbol, minerBoost.name);
            Miner.AddBonus(minerBoost);
        }

        let pickBoost = this.GetPickaxeBoost();
        if(pickBoost){
            OS.PickaxeApp.RemoveBoost(pickBoost.name);
            OS.PickaxeApp.AddBoost(pickBoost);
        }

        this.AfterPurchaseComplete();
        this.UpdateDisplay();
    }

    protected AfterPurchaseComplete(): void{}

    public UpdateDisplay(): void{
        if(this.priceDiv && this.priceDiv.current){
            this.priceDiv.current.textContent = Utils.DisplayNumber(this.GetPrice());
        }

        if(this.itemBar && this.itemBar.current){
            this.itemBar.current.Restart();
            for(let i = 0; i < this.level; i++){
                this.itemBar.current.NextFrame();
            }
        }

        if(this.totalBonusDiv && this.totalBonusDiv.current){
            this.totalBonusDiv.current.textContent = this.GetTotalBoostText();
        }
    }

    public Restore(level: number): void{
        if(level > 0 && level <= this.maxCount){
            this.level = level;
            Miner.AddBonus(this.GetMinerBoost());
            OS.PickaxeApp.AddBoost(this.GetPickaxeBoost());
        }
    }

    public GetMinerBoost(): MinerBoostItem | null{
        return null;
    }
    public GetPickaxeBoost(): PickaxeBoostItem | null{
        return null;
    }
    public AfterStateLoaded(): void{
        
    }
    protected abstract GetTotalBoostText(): string;

    public CreateShopRow(): JQuery{
		var rowDiv = $("<div></div>");
        rowDiv.addClass("shopItem");
        rowDiv.css("border-bottom", "1px dotted #dddddd");
        rowDiv.css("height", "103px");
        rowDiv.css("padding", "5px");
        rowDiv.css("padding-right", "0");
        rowDiv.css("width", "460px");

        const tpoints: TriggerPoint[] = [];
        for(let i = 1; i <= this.GetMaxCount(); i++){
            tpoints.push({
                complete: () => {},
                value: i,
                pause: true
            });
        }
        
        ReactDom.render(
            <React.Fragment>
                <div>
                    <div>
                        <IconWidget icon={this.GetIcon().veryLarge} />
                        <div style={{display: "inline-block", width: "230px", position: "relative", top: "-11px", left: "10px"}}>
                            <div style={{fontSize: "20px"}}>{this.GetTitle()}</div>
                            <div style={{height: "32px"}}>{this.GetSubtitle()}</div>
                        </div>
                    </div>
                    <div className="borderRidge" style={{width:"250px", display: "inline-block", marginTop: "-18px"}}>
                        <LoadingBarWidget ref={this.itemBar = React.createRef<LoadingBarWidget>()} sparCount={this.GetMaxCount()-1} noAutoStart={true} totalDuration={this.GetMaxCount()} triggerPoints={tpoints} style={{margin: 0}} />
                    </div>
                    <div ref={this.totalBonusDiv = React.createRef<HTMLDivElement>()} style={{verticalAlign: "top", display: "inline-block", fontSize: "18px", position: "relative", top: "-11px", left: "5px"}}></div>
                </div>
                <div style={{position: "relative", left: "305px", top: "-76px"}}>
                    <div style={{display: "inline-block", width: "87px", height: "64px", textAlign: "right", verticalAlign: "middle", fontSize: "24px", marginRight: "4px"}} ref={this.priceDiv = React.createRef<HTMLDivElement>()}></div>
                    <div style={{display: "inline-block", width: "64px", height: "64px", verticalAlign: "middle", fontSize: "24px"}}>{this.GetSymbol()}</div>
                </div>
            </React.Fragment>
        , rowDiv[0]);
        
		rowDiv.on("click", () => {
            this.TryPurchase();
        });

		this.UpdateDisplay();
		return rowDiv;
    }
}


export abstract class ShopPage extends VirtualPage implements IHasSaveData{

    public abstract GetStateKey(): string;

    public GetState(): { nState?: any; sState?: any; } {
        let nState = {};
        for(let item of this.allItems){
            const level = item.GetLevel();
            if(level > 0){
                nState[item.GetUpgradeKey()] = level;   
            }
        }
        return {
            nState: nState
        };
    }

    public LoadState(nState: any, _sState: any): void {
        if(nState){
            for(let item of this.allItems){
                const level = nState[item.GetUpgradeKey()];
                if(level > 0){
                     item.Restore(level);
                }
            }
        }
    }
    
    public AfterStateLoaded(): void {
        for(let item of this.allItems){
            item.AfterStateLoaded();
        }
    }

    public RestoreState(): void{ }

    protected abstract PopulateItems(): void; 

    protected rootDiv: JQuery;
    protected allItems: ShopItem[];
    private icon: IconDescriptor;
    private backgroundColor: string;
    private hoverColor: string;
    private title: string;
    private subTitle: string;

    public constructor(icon: IconDescriptor, title: string, subTitle: string, backgroundColor: string, hoverColor: string){
        super();

        this.icon = icon;
        this.backgroundColor = backgroundColor;
        this.hoverColor = hoverColor;
        this.title = title;
        this.subTitle = subTitle;
        this.allItems = [];

        this.PopulateItems();
        OS.StateController.AddTrackedObject(this);
    }

    public Cleanup(): void{ }

    public Render(contentDiv: JQuery): void{

        let rootRef = React.createRef<HTMLDivElement>();

        ReactDom.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `                
                .pageTitle{
                    display: inline-block;
                    font-size: 50px;
                }
                
                .pageSubtitle{
                    margin-left: 2px;
                    font-size: 18px;
                }
                
                .pageRoot{
                    background-color: ` + this.backgroundColor + `;
                }
                
                .shopItems{
                    margin-top:32px;
                }
                
                .pageTitleSection{
                    padding-left: 17px;
                    display: inline-block;
                }
                
                .headerSection{
                    padding-top: 15px;
                }
                
                .shopItem:hover{
                    background-color: ` + this.hoverColor + `;
                }
            `}}></style>,
            <div className="pageRoot" key="b" style={{overflowX: "hidden", overflowY: "scroll"}}>
                <div className="headerSection">
                    <div className="pageTitleSection">
                        <div className="pageTitle">{this.title}</div>
                        <div className="pageSubtitle">{this.subTitle}</div>
                    </div>
                    <IconWidget icon={this.icon.veryLarge} />
                </div>
                <div ref={rootRef}>
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
		for(let item of this.allItems){
			let rowDiv = item.CreateShopRow();
			this.rootDiv.append(rowDiv);
		}
    }
}
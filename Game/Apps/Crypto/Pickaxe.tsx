import App from "../App";
import * as React from "react";
import * as ReactDom from "react-dom";
import WebosWindow from "../../OS/Window";
import { AllIcons, IconDescriptor } from "../../Core/Icons";
import ButtonWidget from "../../OS/Widgets/Button";
import LoadingBarWidget, { TriggerPoint } from "../../OS/Widgets/LoadingBar";
import { Wallet } from "./Wallet";
import { CSSProperties } from "react";
import LabelWidget from "../../OS/Widgets/Label";
import Utils from "../../Core/Utils";
import IconWidget from "../../OS/Widgets/Icon";
import { OS } from "../../OS/OS";

interface PickaxeEvents{
    boostChanged;
}

interface PickaxeOptions{

}


export interface BoostItem{
    clickReduction?: number;
    coinAdds?: number;
    coinMults?: number;
    name: string;
    icon: IconDescriptor;
    subtitle: string;
}

export default class Pickaxe extends App<PickaxeEvents>{

    private loadingBar: React.RefObject<LoadingBarWidget>;
    private btnMine: React.RefObject<ButtonWidget>;

    private coinAmtBase: number;
    private coinAmtAdd: number;
    private coinAmtMult: number;

    private allBoosts: BoostItem[] = [];
    private displayedBonuses: {[name: string]: boolean} = {};

    private lblBaseValue: React.RefObject<LabelWidget>;
    private lblAmtAdd: React.RefObject<LabelWidget>;
    private lblAmtMult: React.RefObject<LabelWidget>;
    private lblTotalAmt: React.RefObject<LabelWidget>;
    private divUpgradeSection: React.RefObject<HTMLDivElement>;
    private divNoUpgrades: React.RefObject<HTMLDivElement>;
    private upgradeList: React.RefObject<HTMLDivElement>;
    private lblDoorLink: React.RefObject<LabelWidget>;
    private lblDoorLink2: React.RefObject<LabelWidget>;

    private keyIsDown: boolean;

    public constructor(options: PickaxeOptions){
        super();
        this.coinAmtBase = 1;
        this.coinAmtAdd = 0;
        this.coinAmtMult = 1;
    }

    public AddBoost(boost: BoostItem): void{
        if(boost.coinAdds){
            this.coinAmtAdd += boost.coinAdds;
        }

        if(boost.coinMults){
            this.coinAmtMult += boost.coinMults;
        }

        this.allBoosts.push(boost);
        this.UpdateLabels();
    }

    private GetAmountPerBlock(): number{
        return (this.coinAmtBase + this.coinAmtAdd) * this.coinAmtMult;
    }

    private ToggleExpandDetails(): void{
        if(this.ToggleExpand()){
            this.windowObj.SetSize(400, 440, false);
        }else{
            this.windowObj.SetSize(400, 228, false);
        }   
    }

    public ToggleExpand(): boolean{
        if(this.divUpgradeSection.current){
            if(this.divUpgradeSection.current.className === ""){
                this.divUpgradeSection.current.className = "nodisp";
                return false;
                
            }else{
                this.divUpgradeSection.current.className = "";
                return true;
            }
        }
        return false;
    }

    private UpdateLabels(): void{
        this.lblBaseValue.current.SetTitle(Utils.DisplayNumber(this.coinAmtBase));
        this.lblAmtAdd.current.SetTitle("+"+Utils.DisplayNumber(this.coinAmtAdd));
        this.lblAmtMult.current.SetTitle("x"+Utils.DisplayNumber(this.coinAmtMult));
        this.lblTotalAmt.current.SetTitle("="+Utils.DisplayNumber(this.GetAmountPerBlock())+" ACN");

        let bonusDisplayed = false;
        for(let bonus of this.allBoosts){
            if(!this.displayedBonuses[bonus.name]){
                this.displayedBonuses[bonus.name] = true;
                this.upgradeList.current.appendChild(this.GetBonusEle(bonus));
            }
            bonusDisplayed = true;
        }
        if(bonusDisplayed){
            this.divNoUpgrades.current.className = "nodisp";
            this.upgradeList.current.className = "";
        }else{
            this.divNoUpgrades.current.className = "";
            this.upgradeList.current.className = "nodisp";
        }
    }

    private GetBonusEle(item: BoostItem): HTMLDivElement{
        const div = document.createElement("div");
        ReactDom.render([
            <div key={1} style={{display:"inline-block"}}>
                <IconWidget icon={item.icon.veryLarge} />
            </div>,
            <div key={2} style={{display:"inline-block", verticalAlign: "top", paddingTop: "9px"}}>
                <div><LabelWidget title={item.name} /></div>
                <div><LabelWidget title={item.subtitle} size={12} /></div>
            </div>
        ], div)
        return div;
    }

    private mine(): void{
        this.loadingBar.current.NextFrame();
    }

    public CreateWindow(): void{
        this.windowObj = new WebosWindow({
            width: 400,
            height: 228,
            resizable: false,
            icon: AllIcons.AlphaCoin,
            title: "Alpha Pickaxe"
        });
        
        const triggerPoints: TriggerPoint[] = [];
        for(let i = 0; i < 5; i++){
            if(i === 4){
                triggerPoints.push({
                    pause: true,
                    value: 100*(i+1),
                    complete: () => {
                        const amt = this.GetAmountPerBlock();
                        Wallet.AnimatedAdd("ACN", amt, amt, 1);
                        this.loadingBar.current.Restart();
                    }
                });
            } else {
                triggerPoints.push({
                    pause: true,
                    value: 100*(i+1),
                    complete: () => {}
                });
            }
        };

        const btnStyles = {width: "87%", marginLeft: "14px", padding: "23px 10px", textAlign: "center", marginTop: "9px"};
        const center: CSSProperties = {marginTop: "3px", position: "relative", left:"50%", transform: "translate(-50%)", display: "inline-block"};
        const blueSmall: CSSProperties = {backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block", position: "relative", top: "-2px"};
        const blue: CSSProperties = {backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block"};
        
        ReactDom.render(
            <React.Fragment>
                <LoadingBarWidget ref={this.loadingBar = React.createRef<LoadingBarWidget>()} totalDuration={500} triggerPoints={triggerPoints} noAutoStart={true} />
                <ButtonWidget ref={this.btnMine = React.createRef<ButtonWidget>()} onClick={() => {this.mine();}} title="Mine Alpha Coin" style={btnStyles} fontSize={22} />
                
                <div>
                    <div style={center}>
                        <div style={blueSmall} title="Base amount for pickaxe."><LabelWidget tooltip="Base amount for pickaxe." color="cyan" title="" ref={this.lblBaseValue = React.createRef<LabelWidget>()} size={12} /></div>
                        <div style={blueSmall} title="Added amount per block."><LabelWidget tooltip="Added amount per block." color="cyan" title="" ref={this.lblAmtAdd = React.createRef<LabelWidget>()} size={12} /></div>
                        <div style={blueSmall} title="Block size multipliers."><LabelWidget tooltip="Block size multipliers." color="cyan" title="" ref={this.lblAmtMult = React.createRef<LabelWidget>()} size={12} /></div>
                        <div style={blue} title="Effective coins per click."><LabelWidget tooltip="Effective coins per click." color="cyan" title="" ref={this.lblTotalAmt = React.createRef<LabelWidget>()} /></div>
                    </div>
                    <div key="infoBtn" style={{left: "356px", top: "146px", position: "absolute", display: "inline-block"}}>
                        <IconWidget icon={AllIcons.Info.large} tooltip="Bonus Info" onClick={()=>{ this.ToggleExpandDetails(); }} />
                    </div>
                    <div ref={this.divUpgradeSection = React.createRef<HTMLDivElement>()} className={"nodisp"} style={{borderTop:"1px solid gray"}}>
                        <div>
                            <div style={center}>
                                <LabelWidget title="Upgrades" />
                            </div>
                        </div>
                        <div style={{marginTop: "-7px"}}>
                            <div style={center}>
                                <LabelWidget title="Visit" size={12} /> <LabelWidget title="www.doors.com" ref={this.lblDoorLink = React.createRef<LabelWidget>()} size={12} /> <LabelWidget title="to upgrade your pickaxe" size={12} />
                            </div>
                        </div>
                        <div style={{overflowY:"scroll", height: "176px"}} ref={this.upgradeList = React.createRef<HTMLDivElement>()}></div>
                        <div ref={this.divNoUpgrades = React.createRef<HTMLDivElement>()}>
                            <div><div style={{display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%",  marginTop: "50px"}}><LabelWidget title="Visit"/></div></div>
                            <div><div style={{display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%"}}><LabelWidget title="www.doors.com" ref={this.lblDoorLink2 = React.createRef<LabelWidget>()} /></div></div>
                            <div><div style={{display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%"}}><LabelWidget title="to upgrade your pickaxe" /></div></div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        , this.windowObj.contentDiv[0]);

        this.displayedBonuses = {};
        this.UpdateLabels();

        let link = $(this.lblDoorLink.current.GetElement());
        link.on("click", () => {
            OS.BrowserApp.ActivateOrCreate();
            OS.BrowserApp.SetURL("doors.com");
            OS.BrowserApp.GotoPage();
        });
        link.css("color","blue");
        link.css("cursor","pointer");

        link = $(this.lblDoorLink2.current.GetElement());
        link.on("click", () => {
            OS.BrowserApp.ActivateOrCreate();
            OS.BrowserApp.SetURL("doors.com");
            OS.BrowserApp.GotoPage();
        });
        link.css("color","blue");
        link.css("cursor","pointer");

        this.windowObj.on("keydown", (key: JQuery.Event) => {
            if(key.keyCode == 32 && !this.keyIsDown){
                this.btnMine.current.VisiblyClick();
                this.keyIsDown = true;
            }
        });
        this.windowObj.on("keyup", (key: JQuery.Event) => {
            if(key.keyCode == 32 && this.keyIsDown){
                this.btnMine.current.VisiblyUnclick();
                this.mine();
                this.keyIsDown = false;
            }
        });
    }
}
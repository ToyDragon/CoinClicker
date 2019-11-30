import App from "../App";
import { IconDescriptor, AllIcons } from "../../Core/Icons";
import WebosWindow from "../../OS/Window";
import LoadingBarWidget from "../../OS/Widgets/LoadingBar";
import { Wallet } from "../Crypto/Wallet";
import * as React from "react";
import * as ReactDom from "react-dom";
import LabelWidget from "../../OS/Widgets/Label";
import IconWidget from "../../OS/Widgets/Icon";
import Popup, { PromptType } from "../../OS/Popup";
import { DetailedHTMLProps, CSSProperties } from "react";
import { OS } from "../../OS/OS";
import Utils from "../../Core/Utils";
import Widget from "../../OS/Widgets/Widget";
import Browser from "../Browser/WebBrowser";
import GA from "../../Core/GA";

export interface BoostItem{
    blockMultiplier?: number;
    blockBoost?: number;
    speedBoost?: number;
    symbol?: string;
    name: string;
}

interface MinerOptions{
    title?: string;
    block?: number;
    symbol?: string;
    time?: number;
    icon?: IconDescriptor;
    value?: number;
}

interface MinerEvents{
    boostChanged;
}

export default class Miner extends App<MinerEvents>{

    public static AmtMinersByTitle: {[title: string]: number} = {};
    public static BonusesBySymbol: {[symbol: string]: BoostItem[]} = {};
    public static AllBoosts: BoostItem[] = [];

    public static AddBonus(item: BoostItem){
        this.AllBoosts.push(item);
        this.BonusesBySymbol[item.symbol] = this.BonusesBySymbol[item.symbol] || [];
        this.BonusesBySymbol[item.symbol].push(item);
    }

    public static RemoveBonus(symbol: string, itemName: string): void{
        let bonuses = this.BonusesBySymbol[symbol] || [];
        for(let i = bonuses.length - 1; i >= 0; i--){
            if(bonuses[i].name === itemName){
                bonuses.splice(i, 1);
            }
        }
    }

    public title: string;
    public block: number;
    public symbol: string;
    public time: number;
    public icon: IconDescriptor;

    private totalMined: number = 0;
    private minedSinceLastEvent: number = 0;
    private eventTimer: NodeJS.Timeout;
    private boostedOptions: MinerOptions;
    private loadingBar: LoadingBarWidget;
    private bonusDetails: React.RefObject<BonusDetails>;

    public constructor(options: MinerOptions){
        super();
        
        this.eventTimer = setInterval(() => {this.LogEvent(); }, 2500);

		Miner.AmtMinersByTitle[options.title] = (Miner.AmtMinersByTitle[options.title] || 1);
		var amt = Miner.AmtMinersByTitle[options.title]++;
		var newTitle = options.title;
		if(amt > 1){
			newTitle += " " + amt;
        }
        
		this.title = newTitle;
		this.block = options.block || 1;
		this.symbol = options.symbol;
		this.time = options.time || 5000;
        this.icon  = options.icon;
        this.bonusDetails = React.createRef<BonusDetails>();
    }

    public ApplyBoosts(): MinerOptions{
		var newValue = this.block;
		var timeDivisor = 1;
		
		var allBonuses = Miner.BonusesBySymbol[this.symbol] || [];
		for(var i = 0; i < allBonuses.length; i++){
			if(allBonuses[i].blockBoost){
                newValue += allBonuses[i].blockBoost;
            }
            if(allBonuses[i].speedBoost){
                timeDivisor *= allBonuses[i].speedBoost;
            }
		}
		
		for(var i = 0; i < allBonuses.length; i++){
            if(allBonuses[i].blockMultiplier){
                newValue *= allBonuses[i].blockMultiplier;
            }
		}
		
		return {
			value: Math.round(newValue * 100) / 100,
			time: Math.round(this.time/timeDivisor) || 1
		}
    }

    public AfterComplete(): void{
        if(!this.windowObj || this.windowObj.closed){
            return;
        }
        this.boostedOptions = this.ApplyBoosts();
        
        Wallet.AllWallets[this.symbol].ChangeValue(this.boostedOptions.value);
        this.totalMined += this.boostedOptions.value;
        this.minedSinceLastEvent += this.boostedOptions.value;
        
        this.loadingBar.totalDuration = this.boostedOptions.time;
        this.loadingBar.UpdateTriggerPoints([
            {
                value: this.boostedOptions.time,
                complete: () => { this.AfterComplete(); }
            }
        ]);
        this.loadingBar.Restart();
        this.loadingBar.NextFrame();
        console.log("restarting miner bar");
        if(this.bonusDetails.current){
            this.bonusDetails.current.trigger("blockDone");
        }
    }

    private LogEvent(): void{
        if(this.minedSinceLastEvent > 0){
            this.minedSinceLastEvent = 0;

            GA.Event(GA.Events.MinerMine, {
                value: this.minedSinceLastEvent,
                metrics: {
                    TotalACNMined: this.totalMined
                }
            })
        }
    }

    public CreateWindow(): void{
        this.windowObj = new WebosWindow({
            width: 400,
            height: 189,
            resizable: false,
            icon: this.icon,
            title: this.title,
            closeWarning: "Miners only mine while open, are you sure you want to close?",
            openEvent: GA.Events.MinerOpen,
            closeEvent: GA.Events.MinerClose
        });
        
        var newOptions = this.ApplyBoosts();

        const barRef = React.createRef<LoadingBarWidget>();

        ReactDom.render(
            [
                <LoadingBarWidget key="a" totalDuration={newOptions.time} ref={barRef} triggerPoints={[
                    {
                        value: newOptions.time,
                        complete: () => { this.AfterComplete(); }
                    }
                ]} />,
                <BonusDetails key="b" miner={this} ref={this.bonusDetails} symbol={this.symbol} baseBlock={this.block} baseTime={this.time} />,
            ]
        , this.windowObj.contentDiv[0])

        this.loadingBar = barRef.current;
        
        this.windowObj.on("close", () => {
            this.loadingBar.Cancel();
        });
    }
}

interface BonusDetailsEvents{
    blockDone;
}

interface BonusDetailsOptions{
    symbol: string;
    baseBlock: number;
    baseTime: number;
    miner: Miner;
}

interface MiningDetails{
    blockBase: number;
    blockBoost: number;
    blockMult: number;
    blockSize: number;
    baseTime: number;
    timeDivisor: number;
    blockTime: number;
}

class BonusDetails extends Widget<BonusDetailsOptions, BonusDetailsEvents>{

    private options: BonusDetailsOptions;
    private displayedBonuses: {[name: string]: boolean};

    private upgradeList: React.RefObject<HTMLDivElement>;
    private divUpgradeSection: React.RefObject<HTMLDivElement>;
    private labelBlockBase: React.RefObject<LabelWidget>;
    private labelBlockBoost: React.RefObject<LabelWidget>;
    private labelBlockMult: React.RefObject<LabelWidget>;
    private labelBlockSize: React.RefObject<LabelWidget>;
    private labelBaseTime: React.RefObject<LabelWidget>;
    private labelTimeDivisor: React.RefObject<LabelWidget>;
    private labelBlockTime: React.RefObject<LabelWidget>;
    private alphawolfLink: React.RefObject<LabelWidget>;
    private alphawolfLink2: React.RefObject<LabelWidget>;
    private divNoUpgrades: React.RefObject<HTMLDivElement>;

    public constructor(options: BonusDetailsOptions){
        super(options);
        this.options = options;
        this.displayedBonuses = {};
    }

    public componentDidMount(): void{
        this.Update();
        
        this.on("blockDone", () => {
            this.Update();
        });


        let link = $(this.alphawolfLink.current.GetElement());
        link.on("click", () => {
            OS.BrowserApp.ActivateOrCreate();
            OS.BrowserApp.SetURL("alphawolf.org");
            OS.BrowserApp.GotoPage();
        });
        link.css("color","blue");
        link.css("cursor","pointer");

        link = $(this.alphawolfLink2.current.GetElement());
        link.on("click", () => {
            OS.BrowserApp.ActivateOrCreate();
            OS.BrowserApp.SetURL("alphawolf.org");
            OS.BrowserApp.GotoPage();
        });
        link.css("color","blue");
        link.css("cursor","pointer");
    }

    public ToggleExpand(): boolean{
        if(this.divUpgradeSection.current){
            if(this.divUpgradeSection.current.className === ""){
                this.divUpgradeSection.current.className = "nodisp";
                GA.Event(GA.Events.MinerCollapseDetails);
                return false;
                
            }else{
                GA.Event(GA.Events.MinerExpandDetails);
                this.divUpgradeSection.current.className = "";
                return true;
            }
        }
        return false;
    }

    private Update(): void{
        const details = this.CalcDetails();

        this.labelBlockBase.current.SetTitle(Utils.DisplayNumber(details.blockBase));
        this.labelBlockBoost.current.SetTitle("+" + Utils.DisplayNumber(details.blockBoost));
        this.labelBlockMult.current.SetTitle("x" + Utils.DisplayNumber(details.blockMult));
        this.labelBlockSize.current.SetTitle("=" + Utils.DisplayNumber(details.blockSize) + " " + this.options.symbol);

        this.labelBaseTime.current.SetTitle(Utils.DisplayNumber(details.baseTime));
        this.labelTimeDivisor.current.SetTitle("÷" + Utils.DisplayNumber(details.timeDivisor));
        this.labelBlockTime.current.SetTitle("=" + Utils.DisplayNumber(details.blockTime) + " ms");
        
        const bonuses = (Miner.BonusesBySymbol[this.options.symbol] || []);
        let bonusDisplayed = false;
        for(let bonus of bonuses){
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

    private CalcDetails(): MiningDetails {
        var blockBoost = 0;
        var blockMult = 1;
		var timeDivisor = 1;
		
		var allBonuses = Miner.BonusesBySymbol[this.options.symbol] || [];
		for(var i = 0; i < allBonuses.length; i++){
			if(allBonuses[i].blockBoost){
                blockBoost += allBonuses[i].blockBoost;
            }
            if(allBonuses[i].speedBoost){
                timeDivisor *= allBonuses[i].speedBoost;
            }
		}
		
		for(var i = 0; i < allBonuses.length; i++){
            if(allBonuses[i].blockMultiplier){
                blockMult *= allBonuses[i].blockMultiplier;
            }
        }
        
        const blockSize = Math.round((this.options.baseBlock + blockBoost) * blockMult * 100) / 100;
        const blockTime = Math.round(this.options.baseTime / timeDivisor);

        return {
            blockBase: this.options.baseBlock,
            blockBoost: blockBoost,
            blockMult: blockMult,
            blockSize: blockSize,
            baseTime: this.options.baseTime,
            timeDivisor: timeDivisor,
            blockTime: blockTime
        }
    }

    private ToggleExpandDetails(): void{
        if(this.ToggleExpand()){
            this.options.miner.windowObj.SetSize(400, 440, false);
        }else{
            this.options.miner.windowObj.SetSize(400, 189, false);
        }   
    }

    public render(): JSX.Element{
        this.upgradeList = React.createRef<HTMLDivElement>();
        this.labelBlockBase = React.createRef<LabelWidget>();
        this.labelBlockBoost = React.createRef<LabelWidget>();
        this.labelBlockMult = React.createRef<LabelWidget>();
        this.labelBlockSize = React.createRef<LabelWidget>();
        this.labelBaseTime = React.createRef<LabelWidget>();
        this.labelTimeDivisor = React.createRef<LabelWidget>();
        this.labelBlockTime = React.createRef<LabelWidget>();
        this.divNoUpgrades = React.createRef<HTMLDivElement>();
        this.divUpgradeSection = React.createRef<HTMLDivElement>();
        this.alphawolfLink = React.createRef<LabelWidget>();
        this.alphawolfLink2 = React.createRef<LabelWidget>();
        
        const halfWidth: CSSProperties = {width: "50%", verticalAlign: "top", display: "inline-block", position:"relative", paddingBottom: "5px"};
        const center: CSSProperties = {marginTop: "3px", position: "relative", left:"50%", transform: "translate(-50%)", display: "inline-block"};
        const blue: CSSProperties = {backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block"};
        const red: CSSProperties = {backgroundColor: "red", borderRadius: "5px", border: "1px solid pink", padding: "4px", margin: "2px", display: "inline-block"};

        return (
            <div style={{position: "relative", top: "-13px"}}>
                <div style={halfWidth}>
                    <div>
                        <div style={center}>
                            <LabelWidget title="Block Size" />
                        </div>
                    </div>
                    <div>
                        <div style={center}>
                            <div style={blue} title="Base value for miner."><LabelWidget tooltip="Base value for miner." color="cyan" title="" ref={this.labelBlockBase} size={12} /></div>
                            <div style={blue} title="Block size boosts."><LabelWidget tooltip="Block size boosts." color="cyan" title="" ref={this.labelBlockBoost} size={12} /></div>
                            <div style={blue} title="Block size multipliers."><LabelWidget tooltip="Block size multipliers." color="cyan" title="" ref={this.labelBlockMult} size={12} /></div>
                        </div>
                    </div>
                    <div>
                        <div style={center}>
                            <div style={blue} title="Effective block size."><LabelWidget tooltip="Effective block size." color="cyan" title="" ref={this.labelBlockSize} /></div>
                        </div>
                    </div>
                </div>
                <div style={halfWidth}>
                    <div>
                        <div style={center}>
                            <LabelWidget title="Mining Speed" />
                        </div>
                    </div>
                    <div>
                        <div style={center}>
                            <div style={red} title="Base block duration."><LabelWidget tooltip="Base block duration." color="pink" title="" ref={this.labelBaseTime} size={12} /></div>
                            <div style={red} title="Block duration divisor."><LabelWidget tooltip="Block duration divisor." color="pink" title="" ref={this.labelTimeDivisor} size={12} /></div>
                        </div>
                    </div>
                    <div>
                        <div style={center}>
                            <div style={red} title="Effective block speed."><LabelWidget tooltip="Effective block speed." color="pink" title="" ref={this.labelBlockTime} /></div>
                        </div>
                    </div>
                    <div key="infoBtn" style={{left: "161px", top: "78px", position: "absolute", display: "inline-block"}}>
                        <IconWidget icon={AllIcons.Info.large} tooltip="Bonus Info" onClick={()=>{ this.ToggleExpandDetails(); }} />
                    </div>
                </div>
                <div ref={this.divUpgradeSection} className={"nodisp"} style={{borderTop:"1px solid gray"}}>
                    <div>
                        <div style={center}>
                            <LabelWidget title="Upgrades" />
                        </div>
                    </div>
                    <div style={{marginTop: "-7px"}}>
                        <div style={center}>
                            <LabelWidget title="Visit" size={12} /> <LabelWidget title="www.alphawolf.org" ref={this.alphawolfLink2} size={12} /> <LabelWidget title="to upgrade your miners" size={12} />
                        </div>
                    </div>
                    <div style={{overflowY:"scroll", height: "207px"}} ref={this.upgradeList}></div>
                    <div ref={this.divNoUpgrades}>
                        <div><div style={{display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%",  marginTop: "50px"}}><LabelWidget title="Visit"/></div></div>
                        <div><div style={{display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%"}}><LabelWidget title="www.alphawolf.org" ref={this.alphawolfLink} /></div></div>
                        <div><div style={{display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%"}}><LabelWidget title="to upgrade your miners" /></div></div>
                    </div>
                </div>
            </div>);

    }

    private GetBonusEle(item: BoostItem): HTMLDivElement{
        let icon: IconDescriptor;
        let title: string;
        let effect: string;
        title = item.name;
        if(item.speedBoost > 1){
            icon = AllIcons.ComputerBoardSpeed;
            const val = Utils.DisplayNumber(item.speedBoost*100 - 100);
            effect = "+"+val+"% Mining Speed";
        }else if(item.blockMultiplier > 1) {
            icon = AllIcons.ComputerBoardPower;
            const val = Utils.DisplayNumber(item.blockMultiplier*100 - 100);
            effect = "+"+val+"% Block Size";
        }else {
            icon = AllIcons.ComputerBoardPower;
            const val = Utils.DisplayNumber(item.blockBoost);
            effect = "+"+val+" Block Coins";
        }
        
        const div = document.createElement("div");
        ReactDom.render([
            <div key={1} style={{display:"inline-block"}}>
                <IconWidget icon={icon.veryLarge} />
            </div>,
            <div key={2} style={{display:"inline-block", verticalAlign: "top", paddingTop: "9px"}}>
                <div><LabelWidget title={title} /></div>
                <div><LabelWidget title={effect} size={12} /></div>
            </div>
        ], div)
        return div;
    }
}
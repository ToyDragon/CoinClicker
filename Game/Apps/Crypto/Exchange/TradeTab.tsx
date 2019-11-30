import TextInputWidget from "../../../OS/Widgets/TextInput";
import Exchange from "./Exchange";
import * as React from "react";
import ButtonWidget from "../../../OS/Widgets/Button";
import { Wallet } from "../Wallet";
import Utils from "../../../Core/Utils";
import LabelWidget from "../../../OS/Widgets/Label";
import { ObservableComponent } from "../../../Core/Observable";
import { OS } from "../../../OS/OS";
import { MojaveSharedDataKeys } from "../../Browser/VirtualPages/Mojave";
import LoadingBarWidget, { TriggerPoint } from "../../../OS/Widgets/LoadingBar";
import GA from "../../../Core/GA";

interface TradeTabEvents{
    autosellChanged;
}

interface TradeTabProps {
    symbol: string;
    exchange: Exchange;
}

export class TradeTab extends ObservableComponent<TradeTabEvents, TradeTabProps>{
    private autosellEnabled: boolean;

    private btnToggleAutoSellSection: React.RefObject<ButtonWidget>;
    private loadingBarAutoSell: React.RefObject<LoadingBarWidget>;
    private btnToggleAutoSell: React.RefObject<ButtonWidget>;
    private inputSellQuantity: React.RefObject<TextInputWidget>;
    private inputBuyQuantity: React.RefObject<TextInputWidget>;
    private divAutoSellSection: React.RefObject<HTMLDivElement>;
    private divSellSection: React.RefObject<HTMLDivElement>;
    private divSellAdvanced: React.RefObject<HTMLDivElement>;
    private divBuyAdvanced: React.RefObject<HTMLDivElement>;
    private btnSell: React.RefObject<ButtonWidget>;
    private btnBuy: React.RefObject<ButtonWidget>;

    private updateAmounts(): void{
        let sellQty = Number(this.inputSellQuantity.current.GetValue());
        if(isNaN(sellQty)){
            sellQty = 0;
        }

        let sellAmt = sellQty * this.props.exchange.rate;
        if(sellQty > Wallet.AllWallets[this.props.symbol].amount){
            this.btnSell.current.SetEnabled(false);
        }else{
            this.btnSell.current.SetEnabled(true);
        }
        this.btnSell.current.SetTitle("Sell for " + Utils.DisplayNumber(sellAmt) + " CSH")

        let buyQty = Number(this.inputBuyQuantity.current.GetValue());
        if(isNaN(buyQty)){
            buyQty = 0;
        }

        let buyAmt = buyQty * this.props.exchange.rate;
        if(buyAmt > Wallet.AllWallets["CSH"].amount){
            this.btnBuy.current.SetEnabled(false);
        }else{
            this.btnBuy.current.SetEnabled(true);
        }
        this.btnBuy.current.SetTitle("Buy for " + Utils.DisplayNumber(buyAmt) + " CSH")
    }

    private updateQuantity(isSell: boolean, percentage: number): void{
        let max = 0;
        if(isSell){
            max = Wallet.AllWallets[this.props.symbol].amount;
        }else{
            max = Wallet.AllWallets["CSH"].amount / this.props.exchange.rate;
        }

        let count = Math.floor(percentage * max);

        if(isSell){
            this.inputSellQuantity.current.SetValue(count.toString());
        }else{
            this.inputBuyQuantity.current.SetValue(count.toString());
        }
    }

    private sellConfirmed(): void{
        let sellQty = Number(this.inputSellQuantity.current.GetValue());
        if(isNaN(sellQty) || sellQty < 0){
            return;
        }

        if(sellQty > Wallet.AllWallets[this.props.symbol].amount){
            return;
        }

        let sellAmt = sellQty * this.props.exchange.rate;

        Wallet.AllWallets["CSH"].ChangeValue(sellAmt);
        Wallet.AllWallets[this.props.symbol].ChangeValue(-sellQty);
        
        this.inputSellQuantity.current.SetValue("0");
        Exchange.totalACNSold += sellQty;
        Exchange.totalCSHEarned += sellAmt;
        GA.Event(GA.Events.ExchangeManualSell, {
            value: sellQty,
            metrics: {
                TotalACNSold: Exchange.totalACNSold,
                TotalCSHEarned: Exchange.totalCSHEarned
            }
        });
    }

    private buyConfirmed(): void{
        let buyQty = Number(this.inputBuyQuantity.current.GetValue());
        if(isNaN(buyQty) || buyQty < 0){
            return;
        }

        let buyAmt = buyQty * this.props.exchange.rate;
        if(buyAmt > Wallet.AllWallets["CSH"].amount){
            return;
        }

        Wallet.AllWallets["CSH"].ChangeValue(-buyAmt);
        Wallet.AllWallets[this.props.symbol].ChangeValue(buyQty);
        
        this.inputBuyQuantity.current.SetValue("0");
        Exchange.totalACNPurchased += buyQty;
        Exchange.totalCSHSpent += buyAmt;
        GA.Event(GA.Events.ExchangeManualBuy, {
            value: buyAmt,
            metrics: {
                TotalACNPurchased: Exchange.totalACNPurchased,
                TotalCSHSpent: Exchange.totalCSHSpent
            }
        });
    }

    public getAutoSellEnabled(): boolean{
        return this.autosellEnabled;
    }

    public componentDidMount(): void{
        this.inputBuyQuantity.current.on("changed", () => {this.updateAmounts();});
        this.inputSellQuantity.current.on("changed", () => {this.updateAmounts();});
        this.props.exchange.on("tick", () => {
            this.updateAmounts();
        });
        this.autosellChanged(); //triggers updateVisibleSections
        OS.on<MojaveSharedDataKeys>("hasACNBuy", () => {this.updateVisibleSections();});
        OS.on<MojaveSharedDataKeys>("hasACNAdvancedSell", () => {this.updateVisibleSections();});
    }

    private disableAutoSell(): void{
        this.autosellEnabled = false;
        this.autosellChanged();
        GA.Event(GA.Events.ExchangeDisableAutoSell);
    }

    private enableAutoSell(): void{
        this.autosellEnabled = true;
        this.autosellChanged();
        GA.Event(GA.Events.ExchangeEnableAutoSell);
    }

    private autosellChanged(): void{
        this.btnToggleAutoSell.current.SetToggleValue(false);
        this.btnToggleAutoSellSection.current.SetToggleValue(true);
        this.updateVisibleSections();
        this.trigger("autosellChanged");
    }

    private updateVisibleSections(): void{
        if(this.autosellEnabled){
            this.divAutoSellSection.current.classList.remove("nodisp");
            this.divSellSection.current.classList.add("nodisp");
            this.divBuyAdvanced.current.classList.add("nodisp");
        }else{
            this.divAutoSellSection.current.classList.add("nodisp");
            this.divSellSection.current.classList.remove("nodisp");
            if(OS.getSharedData<MojaveSharedDataKeys>("hasACNAdvancedSell")){
                this.divSellAdvanced.current.classList.remove("nodisp");
            }else{
                this.divSellAdvanced.current.classList.add("nodisp");
            }
            if(OS.getSharedData<MojaveSharedDataKeys>("hasACNBuy")){
                this.divBuyAdvanced.current.classList.remove("nodisp");
            }else{
                this.divBuyAdvanced.current.classList.add("nodisp");
            }
        }
    }

    public render(){
        //This should probably be in CSS somewhere
        const quickBtnOptions = {small: true, backgroundColor: "#bfbfbf", fontSize: 13};
        const titleOptions = {color: "white", margin: 3};
        const qtyInputOptions = {requireNumbers: true, noDecimal: true, placeholder:"quantity", defaultValue: "0", fontSize: 12, backgroundColor: "white", rightAlign: true, style: {"marginLeft": "4px", "marginBottom": "4px"}, width: 150};
        const confirmOptions = {small: true, backgroundColor: "#bfbfbf", fontSize: 15, style: {"width": "147px"}};

        this.autosellEnabled = true;

        const triggerPointsRestart: TriggerPoint[] = [
            {
                complete: () => {
                    this.loadingBarAutoSell.current.Restart();
                    this.loadingBarAutoSell.current.NextFrame();
                },
                value: 1000
            }
        ];

        return ( 
            <React.Fragment>
                <div className="autoSellSection" ref={this.divAutoSellSection = React.createRef<HTMLDivElement>()}>
                    <div style={{marginTop: "5px"}}>
                        <ButtonWidget ref={this.btnToggleAutoSellSection = React.createRef<ButtonWidget>()} toggle={true} toggleValue={true} small={true} onClick={()=>{this.disableAutoSell()}} style={{marginLeft: "10px"}} />
                        <LabelWidget title="auto-selling all mined ACN" {...titleOptions} style={{verticalAlign: "top"}} />
                    </div>
                    <LoadingBarWidget ref={this.loadingBarAutoSell = React.createRef<LoadingBarWidget>()} totalDuration={1000} triggerPoints={triggerPointsRestart}/>
                </div>
                <div className="buySellSection" ref={this.divSellSection = React.createRef<HTMLDivElement>()}>
                    <div>
                        <LabelWidget title="Sell" {...titleOptions} />
                        <div style={{display: "inline-block", float: "right"}}>
                            <ButtonWidget ref={this.btnToggleAutoSell = React.createRef<ButtonWidget>()} toggle={true} toggleValue={true} small={true} onClick={()=>{this.enableAutoSell()}}/>
                            <LabelWidget title="auto-sell" color="white" tooltip="automatically sell ACN as soon as it's mined" size={12} margin={3} />
                        </div>
                    </div>
                    <div ref={this.divSellAdvanced = React.createRef<HTMLDivElement>()}>
                        <TextInputWidget ref={this.inputSellQuantity = React.createRef<TextInputWidget>()} {...qtyInputOptions}/>
                        <div>
                            <ButtonWidget title="25%"  tooltip="set sell quantity to 25% of your stock"  onClick={()=>{this.updateQuantity(true, 0.25)}} {...quickBtnOptions}/>
                            <ButtonWidget title="50%"  tooltip="set sell quantity to 50% of your stock"  onClick={()=>{this.updateQuantity(true, 0.50)}} {...quickBtnOptions}/>
                            <ButtonWidget title="75%"  tooltip="set sell quantity to 75% of your stock"  onClick={()=>{this.updateQuantity(true, 0.75)}} {...quickBtnOptions}/>
                            <ButtonWidget title="100%" tooltip="set sell quantity to 100% of your stock" onClick={()=>{this.updateQuantity(true, 1.00)}} {...quickBtnOptions}/>
                        </div>
                        <div>
                            <ButtonWidget ref={this.btnSell = React.createRef<ButtonWidget>()} title="Sell for 0 CSH" tooltip="confirm your sale" onClick={()=>{this.sellConfirmed()}} {...confirmOptions}/>
                        </div>
                    </div>
                </div>
                <div className="buySellSection">
                    <div ref={this.divBuyAdvanced = React.createRef<HTMLDivElement>()}>
                        <div>
                            <LabelWidget title="Buy" {...titleOptions} />
                        </div>
                        <TextInputWidget ref={this.inputBuyQuantity = React.createRef<TextInputWidget>()}  {...qtyInputOptions}/>
                        <div>
                            <ButtonWidget title="25%"  tooltip="set buy quantity to 25% of what you can afford"  onClick={()=>{this.updateQuantity(false, 0.25)}} {...quickBtnOptions}/>
                            <ButtonWidget title="50%"  tooltip="set buy quantity to 50% of what you can afford"  onClick={()=>{this.updateQuantity(false, 0.50)}} {...quickBtnOptions}/>
                            <ButtonWidget title="75%"  tooltip="set buy quantity to 75% of what you can afford"  onClick={()=>{this.updateQuantity(false, 0.75)}} {...quickBtnOptions}/>
                            <ButtonWidget title="100%" tooltip="set buy quantity to 100% of what you can afford" onClick={()=>{this.updateQuantity(false, 1.00)}} {...quickBtnOptions}/>
                        </div>
                        <div>
                            <ButtonWidget ref={this.btnBuy = React.createRef<ButtonWidget>()} title="Buy for 0 CSH" tooltip="confirm your purchase" onClick={()=>{this.buyConfirmed()}} {...confirmOptions}/>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
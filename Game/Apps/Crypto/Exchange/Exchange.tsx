import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../../App";
import { IconDescriptor } from "../../../Core/Icons";
import Utils from "../../../Core/Utils";
import WebosWindow from "../../../OS/Window";
import { Wallet } from "../../Crypto/Wallet";
import ButtonWidget from "../../../OS/Widgets/Button";
import TextInputWidget from "../../../OS/Widgets/TextInput";
import SliderWidget from "../../../OS/Widgets/Slider";
import { OS } from "../../../OS/OS";
import { TradeTab } from "./TradeTab";
import { SellTab } from "./SellTab";
import { MojaveSharedDataKeys } from "../../Browser/VirtualPages/Mojave";
import GA from "../../../Core/GA";
import { IHasSaveData } from "../../../OS/StateController";

export interface ExchangeOptions{
    symbol: string;
    initialrate: number;
    icon: IconDescriptor;
    growth: number;
    disasterRate: number;
    disasterRange: number;
    disasterLength: number;
    blessingRate: number;
    blessingRange: number;
    blessingLength: number;
}

interface HistoryItem{
    rate: number;
    goodness: number;
    eventType: number;
}

interface BuySellOrder{
    amount: number;
    quantity: number;
}

interface Events{
    tick;
    orderCompleted;
}

export default class Exchange extends App<Events> implements IHasSaveData{

    public GetStateKey(): string {
        return "Exchange"
    }
    
    public GetState(): { nState?: any; sState?: any; } {
        return {
            sState: this.sState,
            nState: this.nState
        }
    }

    public LoadState(nState: any, sState: any): void {
        if(nState){
            for(let key in nState){
                this.nState[key] = nState[key];
            }
        }
        if(sState){
            for(let key in sState){
                this.sState[key] = sState[key];
            }
        }
    }
    
    public AfterStateLoaded(): void {
        
    }

    public static Ticker: NodeJS.Timeout;
    public static AllExchanges: Exchange[] = [];
    private static PointNum: number = 120;
    public static TickDelay: number = 5000;
    public static LastTick: number = -1;

    public static totalACNPurchased = 0;
    public static totalACNSold = 0;
    public static totalCSHEarned = 0;
    public static totalCSHSpent = 0;

    public static TickExchanges(): void{
        for(let exchange of this.AllExchanges){
            if(exchange){
                exchange.TickExchange();
            }
        }
    }
    
    public title: string;
    public canvas: HTMLCanvasElement;
    public width: number;
    public height: number;

    public blessingBar: number;
    public disasterBar: number;
    public symbol: string;
    public icon: IconDescriptor;
    public initialrate: number;
    public growth: number;
    public disasterRate: number;
    public disasterRange: number;
    public disasterLength: number;
    public blessingRate: number;
    public blessingRange: number;
    public blessingLength: number;

    private autosellEventTimout: NodeJS.Timeout;
    private autoSellEventQty: number = 0;

    private divBuyOrderTab: React.RefObject<HTMLDivElement>;
    private divTradeTab: React.RefObject<HTMLDivElement>;
    private divSellOrderTab: React.RefObject<HTMLDivElement>;
    private tradeTab: React.RefObject<TradeTab>;
    private sellTab: React.RefObject<SellTab>;

    public nState = {
        buyOrder: null as BuySellOrder,
        sellOrder: null as BuySellOrder,
        eventBase: 0,
        eventTicks: 0,
        eventType: 0,
        tickCount: 0,
        rate: 0,
        hist: [] as HistoryItem[]
    };

    public sState = {
        autosellEnabled: "1"
    };

    public constructor(options: ExchangeOptions){
        super();
        OS.StateController.AddTrackedObject(this);

        this.title = options.symbol + " Exchange";
        this.symbol = options.symbol;
        this.initialrate = options.initialrate;
        this.icon = options.icon;
        this.growth = options.growth; //typical multiplier per day
        this.disasterRate = options.disasterRate; //how many minutes per disaster on average
		this.disasterBar = 1-Math.pow(0.9,1/options.disasterRate);
        this.disasterRange = options.disasterRange; //minimum disaster multiplier
        this.disasterLength = options.disasterLength; //average disaster tick length
        this.blessingRate = options.blessingRate;
        this.blessingRange = options.blessingRange;
        this.blessingLength = options.blessingLength;
        this.blessingBar = 1-Math.pow(0.9,1/options.blessingRate);
		
		//this.start = new Date();
        //this.nState.hist = [];
        
        this.width = 500;
        this.height = 300;
        
        Exchange.AllExchanges.push(this);
        if(!Exchange.Ticker){
            Exchange.Ticker = setInterval(() => {
                Exchange.TickExchanges();
            }, Exchange.TickDelay);
        }

        this.nState.rate = this.initialrate;
        for(let i = 0; i < 200; i++){
            this.TickExchange();
        }

        this.on("tick", () => {
            this.OnTick();
        });

        Wallet.AllWallets["ACN"].on("afterChangeValue", (data: [Wallet, number]) => {
            setTimeout(
                () => {this.AutoSell();}
            , 150);
        });

        this.autosellEventTimout = setInterval(() => {this.SendAutoSellEvent();}, 2500);
    }

    private OnTick(): void{
        if(this.windowObj){
            this.UpdateCanvas();
        }
        if(this.tradeTab && this.tradeTab.current){
            if(!this.tradeTab.current.getAutoSellEnabled()){
                this.CheckOrders();
            }else{
                this.AutoSell();
            }
        }
        Exchange.LastTick = new Date().getTime();
    }

    private SendAutoSellEvent(): void{
        if(this.autoSellEventQty > 0){
            this.autoSellEventQty = 0;
            GA.Event(GA.Events.ExchangeAutoSell, {
                value: this.autoSellEventQty,
                metrics: {
                    TotalACNSold: Exchange.totalACNSold,
                    TotalCSHEarned: Exchange.totalCSHEarned
                }
            });
        }
    }

    public GetRate(): number{
        return this.nState.rate;
    }

    private AutoSell(): void{
        if(!this.tradeTab || !this.tradeTab.current || !this.tradeTab.current.getAutoSellEnabled()){
            return;
        }

        let sellQty = Wallet.AllWallets[this.symbol].GetAmount();
        if(isNaN(sellQty) || sellQty < 0.01){
            return;
        }

        let sellAmt = sellQty * this.nState.rate;

        Wallet.AllWallets["CSH"].ChangeValue(sellAmt);
        Wallet.AllWallets[this.symbol].ChangeValue(-sellQty);
        this.autoSellEventQty += sellQty;
        Exchange.totalACNSold += sellQty;
        Exchange.totalCSHEarned += sellAmt;
    }

    private CheckOrders(): void{
        if(this.nState.buyOrder && this.nState.buyOrder.amount >= this.nState.rate){
            Wallet.AllWallets[this.symbol].ChangeValue(this.nState.buyOrder.quantity);
            const total = this.nState.buyOrder.quantity * this.nState.buyOrder.amount;
            OS.MakeToast("Buy order completed for " + Utils.DisplayNumber(this.nState.buyOrder.quantity) + " " + this.symbol + " for a total of " + Utils.DisplayNumber(total) + " CSH.");
            Exchange.totalACNPurchased += this.nState.buyOrder.quantity;
            Exchange.totalCSHSpent += total;
            this.nState.buyOrder = null;
            this.trigger("orderCompleted");
            GA.Event(GA.Events.ExchangeCompleteBuyOrder, {
                value: this.nState.buyOrder.quantity,
                metrics: {
                    TotalACNPurchased: Exchange.totalACNPurchased,
                    TotalCSHSpent: Exchange.totalCSHSpent
                }
            });
        }
        if(this.nState.sellOrder && this.nState.sellOrder.amount <= this.nState.rate){
            const total = this.nState.sellOrder.quantity * this.nState.sellOrder.amount;
            Wallet.AllWallets["CSH"].ChangeValue(total);
            OS.MakeToast("Sell order completed for " + Utils.DisplayNumber(this.nState.sellOrder.quantity) + " " + this.symbol + " for a total of " + Utils.DisplayNumber(total) + " CSH.");
            Exchange.totalACNSold += this.nState.sellOrder.quantity;
            Exchange.totalCSHEarned += total;
            this.nState.sellOrder = null;
            this.trigger("orderCompleted");
            GA.Event(GA.Events.ExchangeCompleteSellOrder, {
                value: this.nState.sellOrder.quantity,
                metrics: {
                    TotalACNSold: Exchange.totalACNSold,
                    TotalCSHEarned: Exchange.totalCSHEarned
                }
            });
        }
    }

    private TickExchange(): void{
		this.nState.tickCount++;
		var rateMultiplier = 1;
		
		if(this.nState.eventTicks > 0){
			this.nState.eventTicks--;
			rateMultiplier = this.nState.eventBase + (Math.random() - 0.5)/40;
		}else{
            rateMultiplier = 1 + (Math.random() - 0.5)/40;

			this.nState.eventType = 0;
            const log2Constant = Math.log(2);
			const log2 = (a: number) => { return Math.log(a)/log2Constant; };
			
			let powDiff = log2(this.nState.rate) - log2(this.initialrate);
            let eventRate = Math.pow(0.7, Math.abs(powDiff));
            let val = Math.random();
            if(powDiff != 0 && val > eventRate){ 
                this.nState.eventBase = Math.pow(1.04, -powDiff + (Math.random()-0.5)/40);
                this.nState.eventTicks = Math.round(Math.random() * 10) + 20;
                this.nState.eventType = this.nState.eventBase > 1 ? 1 : -1;
            }else{
                this.nState.eventBase = rateMultiplier;
                this.nState.eventTicks = Math.round(Math.random() * 5) + 5;
                this.nState.eventType = 0;
            }
        }
        
		this.nState.rate *= rateMultiplier;
		this.nState.hist.push({
			rate: this.nState.rate,
			goodness: rateMultiplier,
			eventType: this.nState.eventType
		});
		if(this.nState.hist.length > 1000){
			this.nState.hist.shift();
		}
        this.trigger("tick");
    }

    private GetGoodnessColor(goodness: number): string{
        var color = "gray";
        if(goodness > 1.009) color = "darkgreen";
        if(goodness > 1.01) color = "green";
        if(goodness < 0.991) color = "red";
        if(goodness < 0.99) color = "darkred";
        return color;
    }

    private GetEventColor(eventType: number): string{
        var color = "#3d4849";
        if(eventType === 1){
            color = "#00ff00";
        }
        if(eventType === -1){
            color = "#ff0000";
        }
        return color;
    }

    private UpdateCanvas(): void{
        if(!this.canvas){
            return;
        }

        var context = this.canvas.getContext("2d");
            
        context.fillStyle = "#353f40";
        context.fillRect(0, 0, this.width, this.height);
        
        var displayedHist = [];
        var displayedCount = 0;
        var maxVal = -1;
        var minVal = -1;
        for(var i = this.nState.hist.length-1; i >= 0 && displayedCount < Exchange.PointNum; i--){
            displayedCount++;
            displayedHist.push(this.nState.hist[i]);
            var val = this.nState.hist[i].rate;
            if(i == this.nState.hist.length-1 || val > maxVal) maxVal = val;
            if(i == this.nState.hist.length-1 || val < minVal) minVal = val;
        }
        
        var boxXPos = [];
        var boxYPos = [];
        
        let now = new Date();
        context.beginPath();
        let firstMinuteMark = Math.floor(now.getSeconds()/5);
        for(var i = firstMinuteMark; i < displayedHist.length; i+=12){
            var xpos = (1 - (i / displayedHist.length)) * (this.width - 20) + 10;
            context.moveTo(xpos, 0);
            context.lineTo(xpos, this.height);
        }
        context.strokeStyle = "#3d4849";
        context.stroke();
        
        let firstFiveMinuteMark = firstMinuteMark + (now.getMinutes()%5)*12;
        context.beginPath();
        for(var i = firstFiveMinuteMark; i < displayedHist.length; i+=(12*5)){
            var xpos = (1 - (i / displayedHist.length)) * (this.width - 20) + 10;
            context.moveTo(xpos, 0);
            context.lineTo(xpos, this.height);
        }
        context.strokeStyle = "#cccccc";
        context.stroke();

        let mults = [0, .05, .1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5];
        for(let mult of mults){
            let rate = this.initialrate * mult;
            if(rate > minVal && rate < maxVal){
                context.beginPath();
                let balance = (rate - minVal)/(maxVal - minVal);
                let initY = (1 - balance) * (this.height - 80) + 30;
                context.moveTo(0, initY);
                context.lineTo(this.width, initY);
                context.strokeStyle = "#3d4849";
                if(mult === 0.8) context.strokeStyle = "#ff4849";
                if(mult === 1) context.strokeStyle = "#ffffff";
                if(mult === 1.2) context.strokeStyle = "#48ff48";
                context.stroke();
            }
        }
        
        for(var i = 0; i < displayedHist.length; i++){
            var balance = (displayedHist[i].rate-minVal) / (maxVal - minVal);
            boxXPos[i] = (1 - (i / displayedHist.length)) * (this.width - 20) + 10;
            boxYPos[i] = (1 - balance) * (this.height - 80) + 30;
            if(i == 0){
                context.beginPath();
                context.moveTo(boxXPos[i], boxYPos[i]);
            }else{
                context.lineTo(boxXPos[i], boxYPos[i]);
                context.strokeStyle = this.GetGoodnessColor(displayedHist[i].goodness);
                context.lineWidth = 5;
                context.stroke();
                if(i !== displayedHist.length){
                    context.beginPath();
                    context.moveTo(boxXPos[i], boxYPos[i]);
                }
            }
        }
        context.lineWidth = 1;
        
        var colWidth = 0;
        if(boxXPos.length > 1){
            colWidth = boxXPos[1]-boxXPos[0];
        }
        
        context.globalAlpha = 0.2;
        for(var i = 0; i < displayedHist.length; i++){
            let color = this.GetEventColor(displayedHist[i].eventType);
            if(color){
                context.fillStyle = color;
                context.fillRect(boxXPos[i] - 3, 0, colWidth, this.height);
            }
        }
        context.globalAlpha = 1;
        
        for(var i = firstFiveMinuteMark; i < displayedHist.length; i += (12*5)){
            var time = new Date();
            time.setSeconds(time.getSeconds() - i * 5);
            
            context.fillStyle = "white";
            context.font = "24px serif";
            var dispTime = Utils.DisplayTime(time,false);
            context.fillText(dispTime, boxXPos[i] - 58, this.height - 5);
        }
        

        context.fillStyle = "white";
        context.font = "24px serif";

        if(displayedHist && displayedHist.length){
            var dispRate = Utils.DisplayNumber(displayedHist[0].rate);
            context.fillText(dispRate + " CSH", boxXPos[0] - 95, boxYPos[0] + 30);
            
            //dispRate = Utils.DisplayNumber(minVal);
            //context.fillText(dispRate + " CSH", boxXPos[boxXPos.length-1], this.height - 30);
            
            //dispRate = Utils.DisplayNumber(maxVal);
            //context.fillText(dispRate + " CSH", boxXPos[boxXPos.length-1], 50);
        }
    }

    private updateVisibleSections(): void{
        this.divTradeTab.current.classList.add("nodisp"); //TODO: perma-disabled the trade tab
        if(this.tradeTab.current.getAutoSellEnabled()){
            this.divBuyOrderTab.current.classList.add("nodisp");
            this.divSellOrderTab.current.classList.add("nodisp");
        }else{
            if(OS.getSharedData<MojaveSharedDataKeys>("hasACNSellOrders")){
                this.divSellOrderTab.current.classList.remove("nodisp");
            }else{
                this.divSellOrderTab.current.classList.add("nodisp");
            }

            if(OS.getSharedData<MojaveSharedDataKeys>("hasACNBuyOrders")){
                this.divBuyOrderTab.current.classList.remove("nodisp");
            }else{
                this.divBuyOrderTab.current.classList.add("nodisp");
            }
        }
    }

    public CreateWindow(): void{
        this.windowObj = new WebosWindow({
            innerWidth: 500,
            innerHeight: 450,
            resizable: false,
            icon: this.icon,
            title: Wallet.AllWallets[this.symbol].name + " Exchange",
            openEvent: GA.Events.ExchangeOpen,
            closeEvent: GA.Events.ExchangeClose
        });

        this.windowObj.on("close", () => {
            this.canvas = null;
        });
            
        const mainDiv = $("<div></div>");

        const canvasRef = React.createRef<HTMLCanvasElement>();
        const tabstripRef = React.createRef<HTMLDivElement>();
        const tradeDivRef = React.createRef<HTMLDivElement>();
        const buyOrdersDivRef = React.createRef<HTMLDivElement>();
        const sellOrdersDivRef = React.createRef<HTMLDivElement>();

        const curRateRef = React.createRef<HTMLDivElement>();
        const avgRateRef = React.createRef<HTMLDivElement>();
        const maxRateRef = React.createRef<HTMLDivElement>();
        const minRateRef = React.createRef<HTMLDivElement>();

        const buyOrderAmountRef = React.createRef<SliderWidget>();
        const buyOrderQuantityRef = React.createRef<TextInputWidget>();
        const buyOrderBtnRef = React.createRef<ButtonWidget>();
        const buyOrderSectionDetails = React.createRef<HTMLDivElement>();
        const buyOrderSectionPlace = React.createRef<HTMLDivElement>();
        const buyOrderSectionSummary = React.createRef<HTMLDivElement>();
        const buyOrderSectionCancel = React.createRef<HTMLDivElement>();
        const buyOrderSummaryAmountRef = React.createRef<TextInputWidget>();
        const buyOrderSummaryQtyRef = React.createRef<TextInputWidget>();
        const buyOrderSummaryTotalRef = React.createRef<TextInputWidget>();
        const buyQtyD10Ref = React.createRef<ButtonWidget>();
        const buyQtyM10Ref = React.createRef<ButtonWidget>();
        let isMaxBuy = false;
        
        const sellOrderAmountRef = React.createRef<SliderWidget>();
        const sellOrderQuantityRef = React.createRef<TextInputWidget>();
        const sellOrderBtnRef = React.createRef<ButtonWidget>();
        const sellOrderSectionDetails = React.createRef<HTMLDivElement>();
        const sellOrderSectionPlace = React.createRef<HTMLDivElement>();
        const sellOrderSectionSummary = React.createRef<HTMLDivElement>();
        const sellOrderSectionCancel = React.createRef<HTMLDivElement>();
        const sellOrderSummaryAmountRef = React.createRef<TextInputWidget>();
        const sellOrderSummaryQtyRef = React.createRef<TextInputWidget>();
        const sellOrderSummaryTotalRef = React.createRef<TextInputWidget>();
        const sellQtyD10Ref = React.createRef<ButtonWidget>();
        const sellQtyM10Ref = React.createRef<ButtonWidget>();
        let isMaxSell = false;

        const updateBuyOrderQty = (mult: number) => {
            let qty = Number(buyOrderQuantityRef.current.GetValue());
            qty *= mult
            if(!isFinite(qty)) return;
            if(qty < 1){
                qty = 1;
            }
            buyOrderQuantityRef.current.SetValue(qty.toLocaleString("fullwide", {useGrouping:false}));
        };

        const updateSellOrderQty = (mult: number) => {
            let qty = Number(sellOrderQuantityRef.current.GetValue());
            qty *= mult
            if(!isFinite(qty)) return;
            if(qty < 1){
                qty = 1;
            }
            sellOrderQuantityRef.current.SetValue(qty.toLocaleString("fullwide", {useGrouping:false}));
        };

        ReactDom.render(
            [
                <canvas key="1" ref={canvasRef} width={this.width} height={this.height}/>,
                <div key="2" className="exchangeBottom">
                    <div className="rateSections">
                        <div className="rateSection">
                            <div className="rateDisplay" title={"value of each "+this.symbol+" coin right now"} ref={curRateRef}>{Utils.DisplayNumber(this.nState.rate)} CSH</div>
                            <div className="rateLabel" title={"value of each "+this.symbol+" coin right now"}>Current Rate</div>
                        </div>
                        <div className="rateSection">
                            <div className="rateDisplay initial" title={"expected value of each "+this.symbol+" coin"} ref={avgRateRef}>{Utils.DisplayNumber(this.initialrate)} CSH</div>
                            <div className="rateLabel" title={"expected value of each "+this.symbol+" coin"}>Average Rate</div>
                        </div>
                        <div className="rateSection">
                            <div className="smallRateSection">
                                <div className="rateDisplay initial" title={"lowest value of each "+this.symbol+" coin in the last 10 minutes"} ref={minRateRef}></div>
                                <div className="rateLabel" title={"lowest value of each "+this.symbol+" coin in the last 10 minutes"}>Min Rate</div>
                            </div>
                            <div className="smallRateSection">
                                <div className="rateDisplay initial" title={"highest value of each "+this.symbol+" coin in the last 10 minutes"} ref={maxRateRef}></div>
                                <div className="rateLabel" title={"highest value of each "+this.symbol+" coin in the last 10 minutes"} >Max Rate</div>
                            </div>
                        </div>
                    </div>
                    <div ref={tabstripRef} className="tabSection">
                        <div className="tabstrip">
                            <div className="tab active" data-tabname="Sell">Sell</div>
                            <div className="tab" data-tabname="Trade" ref={this.divTradeTab = React.createRef<HTMLDivElement>()}>Trade</div>
                            <div className="tab" data-tabname="BuyOrder" ref={this.divBuyOrderTab = React.createRef<HTMLDivElement>()}>Buy Order</div>
                            <div className="tab" data-tabname="SellOrder" ref={this.divSellOrderTab = React.createRef<HTMLDivElement>()}>Sell Order</div>
                        </div>
                        <div className="tabContent" data-tabname="Trade" ref={tradeDivRef}>
                            <SellTab symbol="ACN" exchange={this} ref={this.sellTab = React.createRef<SellTab>()} />
                        </div>
                        <div className="tabContent nodisp" data-tabname="Trade" ref={tradeDivRef}>
                            <TradeTab symbol="ACN" exchange={this} ref={this.tradeTab = React.createRef<TradeTab>()} />
                        </div>
                        <div className="tabContent nodisp" data-tabname="BuyOrder" ref={buyOrdersDivRef}>
                            <div className="orderSection" ref={buyOrderSectionDetails}>
                                <SliderWidget ref={buyOrderAmountRef} tooltip={"automatically buy when "+this.symbol+" reaches this rate"} min={this.initialrate * 0.25} max={this.initialrate * 1.75} suffix={" CSH"} label="buy rate"/>
                                <TextInputWidget ref={buyOrderQuantityRef} requireNumbers={true} noDecimal={true} placeholder="quantity" defaultValue="1" fontSize={12} backgroundColor="white" rightAlign={true} style={{"marginLeft": "4px", "marginBottom": "4px"}} width={150}/>
                                <div>
                                    <ButtonWidget title="÷10" tooltip="quickly divide quantity by 10" ref={buyQtyD10Ref} small={true} backgroundColor="#bfbfbf" fontSize={13} onClick={()=>{updateBuyOrderQty(0.10)}}/>
                                    <ButtonWidget title="x10" tooltip="quickly multiply quantity by 10" ref={buyQtyM10Ref} small={true} backgroundColor="#bfbfbf" fontSize={13} onClick={()=>{updateBuyOrderQty(10.0)}}/>
                                    <ButtonWidget title="max" tooltip="lock quantity to the max you can afford" small={true} backgroundColor="#bfbfbf" fontSize={13} onClick={()=>{toggleBuyQty()}} style={{marginLeft:"62px", marginRight: "0"}}/>
                                </div>
                            </div>
                            <div className="orderSection" ref={buyOrderSectionPlace}>
                                <ButtonWidget ref={buyOrderBtnRef} title="Place Buy Order For XXX CSH" tooltip={"reserve CSH to automatically buy "+this.symbol+" when the rate is reached"} small={true} backgroundColor="#bfbfbf" style={{width: "142px", padding: "10px", textAlign: "center", marginTop: "9px"}} fontSize={22} onClick={() => {toggleBuyOrder(true);}}/>
                            </div>
                            <div className="orderSection orderSummary" ref={buyOrderSectionSummary}>
                                <TextInputWidget ref={buyOrderSummaryAmountRef} placeholder="rate" fontSize={12} disabled={true} rightAlign={true} style={{"marginTop": "1px"}} width={150}/>
                                <TextInputWidget ref={buyOrderSummaryQtyRef} placeholder="quantity" fontSize={12} disabled={true} rightAlign={true} style={{"marginTop": "12px"}} width={150}/>
                                <TextInputWidget ref={buyOrderSummaryTotalRef} placeholder="total value" fontSize={12} disabled={true} rightAlign={true} style={{"marginTop": "12px"}} width={150}/>
                            </div>
                            <div className="orderSection" ref={buyOrderSectionCancel}>
                                <ButtonWidget title="Cancel Buy Order" tooltip={"cancel buy order to reclaim your CSH"} small={true} backgroundColor="#bfbfbf" style={{width: "142px", padding: "23px 10px", textAlign: "center", marginTop: "9px"}} fontSize={22} onClick={()=>{toggleBuyOrder(false);}}/>
                            </div>
                        </div>
                        <div className="tabContent nodisp" data-tabname="SellOrder" ref={sellOrdersDivRef}>
                            <div className="orderSection" ref={sellOrderSectionDetails}>
                                <SliderWidget ref={sellOrderAmountRef} tooltip={"automatically sell when "+this.symbol+" reaches this rate"}  min={this.initialrate * 0.25} max={this.initialrate * 1.75} suffix={" CSH"} label="min rate"/>
                                <TextInputWidget ref={sellOrderQuantityRef} requireNumbers={true} noDecimal={true} placeholder="quantity" defaultValue="1" fontSize={12} backgroundColor="white" rightAlign={true} style={{"marginLeft": "4px", "marginBottom": "4px"}} width={150}/>
                                <div>
                                    <ButtonWidget title="÷10" tooltip="quickly divide quantity by 10" ref={sellQtyD10Ref} small={true} backgroundColor="#bfbfbf" fontSize={13} onClick={()=>{updateSellOrderQty(0.10)}}/>
                                    <ButtonWidget title="x10" tooltip="quickly multiply quantity by 10" ref={sellQtyM10Ref} small={true} backgroundColor="#bfbfbf" fontSize={13} onClick={()=>{updateSellOrderQty(10.0)}}/>
                                    <ButtonWidget title="max" tooltip="lock quantity to the max you can sell" small={true} backgroundColor="#bfbfbf" fontSize={13} onClick={()=>{toggleSellQty()}} style={{marginLeft:"62px", marginRight: "0"}}/>
                                </div>
                            </div>
                            <div className="orderSection" ref={sellOrderSectionPlace}>
                                <ButtonWidget ref={sellOrderBtnRef} title="Place Sell Order For XXX CSH" tooltip={"reserve "+this.symbol+" to automatically sell when the rate is reached"} small={true} backgroundColor="#bfbfbf" style={{width: "142px", padding: "10px", textAlign: "center", marginTop: "9px"}} fontSize={22} onClick={() => {toggleSellOrder(true);}}/>
                            </div>
                            <div className="orderSection orderSummary" ref={sellOrderSectionSummary}>
                                <TextInputWidget ref={sellOrderSummaryAmountRef} placeholder="rate" fontSize={12} disabled={true} rightAlign={true} style={{"marginTop": "1px"}} width={150}/>
                                <TextInputWidget ref={sellOrderSummaryQtyRef} placeholder="quantity" fontSize={12} disabled={true} rightAlign={true} style={{"marginTop": "12px"}} width={150}/>
                                <TextInputWidget ref={sellOrderSummaryTotalRef} placeholder="total value" fontSize={12} disabled={true} rightAlign={true} style={{"marginTop": "12px"}} width={150}/>
                            </div>
                            <div className="orderSection" ref={sellOrderSectionCancel}>
                                <ButtonWidget title="Cancel Sell Order" tooltip={"cancel sell order to reclaim your "+this.symbol} small={true} backgroundColor="#bfbfbf" style={{width: "142px", padding: "23px 10px", textAlign: "center", marginTop: "9px"}} fontSize={22} onClick={()=>{toggleSellOrder(false);}}/>
                            </div>
                        </div>
                    </div>
                </div>
            ]
        , mainDiv[0]);

        Utils.SetupTabStrip(tabstripRef.current, (tabName: string) => {
            GA.Event(GA.Events.ExchangeChangeTab, {label: tabName});
        });

        OS.on<MojaveSharedDataKeys>("hasACNSellOrders", () => { this.updateVisibleSections(); });
        OS.on<MojaveSharedDataKeys>("hasACNBuyOrders", () => { this.updateVisibleSections(); });
        this.tradeTab.current.on("autosellChanged", () => { this.updateVisibleSections(); });
        this.updateVisibleSections();

        this.canvas = canvasRef.current;

        const toggleBuyOrder = (place: boolean) => {
            if(place && buyOrderAmountRef.current.GetOutOfRange()){
                return;
            }

            if(!place){
                const total = this.nState.buyOrder.amount * this.nState.buyOrder.quantity;
                Wallet.AllWallets["CSH"].ChangeValue(total);
                this.nState.buyOrder = null;
                GA.Event(GA.Events.ExchangeCancelBuyOrder, {value: this.nState.buyOrder.quantity});
            }else{
                this.nState.buyOrder = {
                    amount: buyOrderAmountRef.current.GetValue(),
                    quantity: Number(buyOrderQuantityRef.current.GetValue())
                };
                const total = this.nState.buyOrder.amount * this.nState.buyOrder.quantity;
                Wallet.AllWallets["CSH"].ChangeValue(-total);
                GA.Event(GA.Events.ExchangePlaceBuyOrder, {value: this.nState.buyOrder.quantity});
            }

            updateDisplayedBuySection();
        };
        
        const toggleSellOrder = (place: boolean) => {
            if(place && sellOrderAmountRef.current.GetOutOfRange()){
                return;
            }

            if(!place){
                Wallet.AllWallets[this.symbol].ChangeValue(this.nState.sellOrder.quantity);
                this.nState.sellOrder = null;
                GA.Event(GA.Events.ExchangeCancelSellOrder, {value: this.nState.sellOrder.quantity});
            }else{
                this.nState.sellOrder = {
                    amount: sellOrderAmountRef.current.GetValue(),
                    quantity: Number(sellOrderQuantityRef.current.GetValue())
                };
                Wallet.AllWallets[this.symbol].ChangeValue(-this.nState.sellOrder.quantity);
                GA.Event(GA.Events.ExchangePlaceSellOrder, {value: this.nState.sellOrder.quantity});
            }

            updateDisplayedSellSection();
        };

        const updateDisplayedSellSection = () => {
            if(this.nState.sellOrder){
                sellOrderSectionDetails.current.classList.add("nodisp");
                sellOrderSectionPlace.current.classList.add("nodisp");
                sellOrderSectionSummary.current.classList.remove("nodisp");
                sellOrderSectionCancel.current.classList.remove("nodisp");

                let total = this.nState.sellOrder.amount * this.nState.sellOrder.quantity;
                sellOrderSummaryAmountRef.current.SetValue(Utils.DisplayNumber(this.nState.sellOrder.amount) + " CSH");
                sellOrderSummaryQtyRef.current.SetValue(Utils.DisplayNumber(this.nState.sellOrder.quantity) + " " + this.symbol);
                sellOrderSummaryTotalRef.current.SetValue(Utils.DisplayNumber(total) + " CSH");
            }else{
                sellOrderSectionDetails.current.classList.remove("nodisp");
                sellOrderSectionPlace.current.classList.remove("nodisp");
                sellOrderSectionSummary.current.classList.add("nodisp");
                sellOrderSectionCancel.current.classList.add("nodisp");
            }
        };
        updateDisplayedSellSection();

        const updateDisplayedBuySection = () => {
            if(this.nState.buyOrder){
                buyOrderSectionDetails.current.classList.add("nodisp");
                buyOrderSectionPlace.current.classList.add("nodisp");
                buyOrderSectionSummary.current.classList.remove("nodisp");
                buyOrderSectionCancel.current.classList.remove("nodisp");

                let total = this.nState.buyOrder.amount * this.nState.buyOrder.quantity;
                buyOrderSummaryAmountRef.current.SetValue(Utils.DisplayNumber(this.nState.buyOrder.amount) + " CSH");
                buyOrderSummaryQtyRef.current.SetValue(Utils.DisplayNumber(this.nState.buyOrder.quantity) + " " + this.symbol);
                buyOrderSummaryTotalRef.current.SetValue(Utils.DisplayNumber(total) + " CSH");
            }else{
                buyOrderSectionDetails.current.classList.remove("nodisp");
                buyOrderSectionPlace.current.classList.remove("nodisp");
                buyOrderSectionSummary.current.classList.add("nodisp");
                buyOrderSectionCancel.current.classList.add("nodisp");
            }
        };
        updateDisplayedBuySection();

        this.on("orderCompleted", () => {
            updateDisplayedBuySection();
            updateDisplayedSellSection();
        });

        const updateSellQtyMax = () => {
            const qty = Wallet.AllWallets["ACN"].GetAmount() || 1;
            sellOrderQuantityRef.current.SetValue(qty.toString());
        };

        const toggleSellQty = () => {
            isMaxSell = !isMaxSell;
            sellOrderQuantityRef.current.SetDisabled(isMaxSell);
            sellQtyD10Ref.current.SetEnabled(!isMaxSell);
            sellQtyM10Ref.current.SetEnabled(!isMaxSell);
            updateSellQtyMax();
        };

        const updateBuyQtyMax = () => {
            const amt = buyOrderAmountRef.current.GetValue();
            const qty = Math.floor(Wallet.AllWallets["CSH"].GetAmount() / amt) || 1;
            buyOrderQuantityRef.current.SetValue(qty.toString());
        };

        const toggleBuyQty = () => {
            isMaxBuy = !isMaxBuy;
            buyOrderQuantityRef.current.SetDisabled(isMaxBuy);
            buyQtyD10Ref.current.SetEnabled(!isMaxBuy);
            buyQtyM10Ref.current.SetEnabled(!isMaxBuy);
            updateBuyQtyMax();
        };

        this.windowObj.contentDiv.append(mainDiv);
        this.windowObj.contentDiv.addClass("exchangeWindow");
        const updateOrderAmounts = () => {
            const bqty = Number(buyOrderQuantityRef.current.GetValue());
            const bamt = buyOrderAmountRef.current.GetValue();
            const bvalue = bamt * bqty;
            buyOrderBtnRef.current.SetTitle("Place Buy Order For " + Utils.DisplayNumber(bvalue) + " CSH");
            if(bvalue > Wallet.AllWallets["CSH"].GetAmount()){
                buyOrderBtnRef.current.SetEnabled(false);
            }else{
                buyOrderBtnRef.current.SetEnabled(true);
            }

            const sqty = Number(sellOrderQuantityRef.current.GetValue());
            const samt = sellOrderAmountRef.current.GetValue();
            const svalue = samt * sqty;
            sellOrderBtnRef.current.SetTitle("Place Sell Order For " + Utils.DisplayNumber(svalue) + " CSH");
            if(sqty > Wallet.AllWallets[this.symbol].GetAmount()){
                sellOrderBtnRef.current.SetEnabled(false);
            }else{
                sellOrderBtnRef.current.SetEnabled(true);
            }
        };

        updateOrderAmounts();
        buyOrderAmountRef.current.on("changed", () => {
            if(isMaxBuy){
                updateBuyQtyMax();
            }
            updateOrderAmounts();
        });
        buyOrderQuantityRef.current.on("changed", () => {
            updateOrderAmounts();
        });
        sellOrderAmountRef.current.on("changed", () => {
            if(isMaxSell){
                updateSellQtyMax();
            }
            updateOrderAmounts();
        });
        sellOrderQuantityRef.current.on("changed", () => {
            updateOrderAmounts();
        });
        Wallet.AllWallets["CSH"].on("afterChangeValue", () => { updateOrderAmounts(); });

        Wallet.AllWallets[this.symbol].on("afterChangeValue", () => { updateOrderAmounts(); });
        
        this.UpdateCanvas();

        const updateRates = () => {
            $(curRateRef.current).text(Utils.DisplayNumber(this.nState.rate) + " CSH");
            $(avgRateRef.current).text(Utils.DisplayNumber(this.initialrate) + " CSH");

            let max = this.nState.rate;
            let min = this.nState.rate;
            let checkedPoints = 0;
            for(let i = this.nState.hist.length-1; i >= 0 && checkedPoints < Exchange.PointNum; i--){
                checkedPoints++;
                let val = this.nState.hist[i].rate;
                if(i == this.nState.hist.length-1 || val > max) max = val;
                if(i == this.nState.hist.length-1 || val < min) min = val;
            }

            $(maxRateRef.current).text(Utils.DisplayNumber(max) + " CSH");
            $(minRateRef.current).text(Utils.DisplayNumber(min) + " CSH");
            buyOrderAmountRef.current.SetMaxAllowedValue(this.nState.rate);
            sellOrderAmountRef.current.SetMinAllowedValue(this.nState.rate);
            if(isMaxBuy){
                updateBuyQtyMax();
            }
            if(isMaxSell){
                updateSellQtyMax();
            }
        };
        updateRates();

        this.OnTick();
        this.AutoSell();
        this.on("tick", () => { updateRates(); });
    }
}
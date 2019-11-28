"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDom = require("react-dom");
const React = require("react");
const App_1 = require("../../App");
const Utils_1 = require("../../../Core/Utils");
const Window_1 = require("../../../OS/Window");
const Wallet_1 = require("../../Crypto/Wallet");
const Button_1 = require("../../../OS/Widgets/Button");
const TextInput_1 = require("../../../OS/Widgets/TextInput");
const Slider_1 = require("../../../OS/Widgets/Slider");
const OS_1 = require("../../../OS/OS");
const TradeTab_1 = require("./TradeTab");
class Exchange extends App_1.default {
    constructor(options) {
        super();
        this.title = options.symbol + " Exchange";
        this.symbol = options.symbol;
        this.initialrate = options.initialrate;
        this.icon = options.icon;
        this.growth = options.growth; //typical multiplier per day
        this.disasterRate = options.disasterRate; //how many minutes per disaster on average
        this.disasterBar = 1 - Math.pow(0.9, 1 / options.disasterRate);
        this.disasterRange = options.disasterRange; //minimum disaster multiplier
        this.disasterLength = options.disasterLength; //average disaster tick length
        this.blessingRate = options.blessingRate;
        this.blessingRange = options.blessingRange;
        this.blessingLength = options.blessingLength;
        this.blessingBar = 1 - Math.pow(0.9, 1 / options.blessingRate);
        this.start = new Date();
        this.tickCount = 0;
        this.hist = [];
        this.width = 500;
        this.height = 300;
        Exchange.AllExchanges.push(this);
        if (!Exchange.Ticker) {
            Exchange.Ticker = setInterval(() => {
                Exchange.TickExchanges();
            }, Exchange.TickDelay);
        }
        this.rate = this.initialrate;
        for (let i = 0; i < 200; i++) {
            this.TickExchange();
        }
        this.on("tick", () => {
            this.OnTick();
        });
        Wallet_1.Wallet.AllWallets["ACN"].on("afterChangeValue", (data) => {
            setTimeout(() => { this.AutoSell(); }, 150);
        });
    }
    static TickExchanges() {
        for (let exchange of this.AllExchanges) {
            if (exchange) {
                exchange.TickExchange();
            }
        }
    }
    OnTick() {
        if (this.windowObj) {
            this.UpdateCanvas();
        }
        if (!this.tradeTab.current.getAutoSellEnabled()) {
            this.CheckOrders();
        }
        else {
            this.AutoSell();
        }
        Exchange.LastTick = new Date().getTime();
    }
    AutoSell() {
        if (!this.tradeTab || !this.tradeTab.current || !this.tradeTab.current.getAutoSellEnabled()) {
            return;
        }
        let sellQty = Wallet_1.Wallet.AllWallets[this.symbol].amount;
        if (isNaN(sellQty) || sellQty < 0.01) {
            return;
        }
        let sellAmt = sellQty * this.rate;
        Wallet_1.Wallet.AllWallets["CSH"].ChangeValue(sellAmt);
        Wallet_1.Wallet.AllWallets[this.symbol].ChangeValue(-sellQty);
    }
    CheckOrders() {
        if (this.buyOrder && this.buyOrder.amount >= this.rate) {
            Wallet_1.Wallet.AllWallets[this.symbol].ChangeValue(this.buyOrder.quantity);
            const total = Utils_1.default.DisplayNumber(this.buyOrder.quantity * this.buyOrder.amount);
            OS_1.OS.MakeToast("Buy order completed for " + Utils_1.default.DisplayNumber(this.buyOrder.quantity) + " " + this.symbol + " for a total of " + total + " CSH.");
            this.buyOrder = null;
            this.trigger("orderCompleted");
        }
        if (this.sellOrder && this.sellOrder.amount <= this.rate) {
            const total = this.sellOrder.quantity * this.sellOrder.amount;
            Wallet_1.Wallet.AllWallets["CSH"].ChangeValue(total);
            OS_1.OS.MakeToast("Sell order completed for " + Utils_1.default.DisplayNumber(this.sellOrder.quantity) + " " + this.symbol + " for a total of " + Utils_1.default.DisplayNumber(total) + " CSH.");
            this.sellOrder = null;
            this.trigger("orderCompleted");
        }
    }
    TickExchange() {
        this.tickCount++;
        var rateMultiplier = 1;
        if (this.eventTicks > 0) {
            this.eventTicks--;
            rateMultiplier = this.eventBase + (Math.random() - 0.5) / 40;
        }
        else {
            rateMultiplier = 1 + (Math.random() - 0.5) / 40;
            this.eventType = 0;
            const log2Constant = Math.log(2);
            const log2 = (a) => { return Math.log(a) / log2Constant; };
            let powDiff = log2(this.rate) - log2(this.initialrate);
            let eventRate = Math.pow(0.7, Math.abs(powDiff));
            let val = Math.random();
            if (powDiff != 0 && val > eventRate) {
                this.eventBase = Math.pow(1.04, -powDiff + (Math.random() - 0.5) / 40);
                this.eventTicks = Math.round(Math.random() * 10) + 20;
                this.eventType = this.eventBase > 1 ? 1 : -1;
            }
            else {
                this.eventBase = rateMultiplier;
                this.eventTicks = Math.round(Math.random() * 5) + 5;
                this.eventType = 0;
            }
        }
        this.rate *= rateMultiplier;
        this.hist.push({
            rate: this.rate,
            goodness: rateMultiplier,
            eventType: this.eventType
        });
        if (this.hist.length > 1000) {
            this.hist.shift();
        }
        this.trigger("tick");
    }
    GetGoodnessColor(goodness) {
        var color = "gray";
        if (goodness > 1.009)
            color = "darkgreen";
        if (goodness > 1.01)
            color = "green";
        if (goodness < 0.991)
            color = "red";
        if (goodness < 0.99)
            color = "darkred";
        return color;
    }
    GetEventColor(eventType) {
        var color = "#3d4849";
        if (eventType === 1) {
            color = "#00ff00";
        }
        if (eventType === -1) {
            color = "#ff0000";
        }
        return color;
    }
    UpdateCanvas() {
        if (!this.canvas) {
            return;
        }
        var context = this.canvas.getContext("2d");
        context.fillStyle = "#353f40";
        context.fillRect(0, 0, this.width, this.height);
        var displayedHist = [];
        var displayedCount = 0;
        var maxVal = -1;
        var minVal = -1;
        for (var i = this.hist.length - 1; i >= 0 && displayedCount < Exchange.PointNum; i--) {
            displayedCount++;
            displayedHist.push(this.hist[i]);
            var val = this.hist[i].rate;
            if (i == this.hist.length - 1 || val > maxVal)
                maxVal = val;
            if (i == this.hist.length - 1 || val < minVal)
                minVal = val;
        }
        var boxXPos = [];
        var boxYPos = [];
        let now = new Date();
        context.beginPath();
        let firstMinuteMark = Math.floor(now.getSeconds() / 5);
        for (var i = firstMinuteMark; i < displayedHist.length; i += 12) {
            var xpos = (1 - (i / displayedHist.length)) * (this.width - 20) + 10;
            context.moveTo(xpos, 0);
            context.lineTo(xpos, this.height);
        }
        context.strokeStyle = "#3d4849";
        context.stroke();
        let firstFiveMinuteMark = firstMinuteMark + (now.getMinutes() % 5) * 12;
        context.beginPath();
        for (var i = firstFiveMinuteMark; i < displayedHist.length; i += (12 * 5)) {
            var xpos = (1 - (i / displayedHist.length)) * (this.width - 20) + 10;
            context.moveTo(xpos, 0);
            context.lineTo(xpos, this.height);
        }
        context.strokeStyle = "#cccccc";
        context.stroke();
        let mults = [0, .05, .1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5];
        for (let mult of mults) {
            let rate = this.initialrate * mult;
            if (rate > minVal && rate < maxVal) {
                context.beginPath();
                let balance = (rate - minVal) / (maxVal - minVal);
                let initY = (1 - balance) * (this.height - 80) + 30;
                context.moveTo(0, initY);
                context.lineTo(this.width, initY);
                context.strokeStyle = "#3d4849";
                if (mult === 0.8)
                    context.strokeStyle = "#ff4849";
                if (mult === 1)
                    context.strokeStyle = "#ffffff";
                if (mult === 1.2)
                    context.strokeStyle = "#48ff48";
                context.stroke();
            }
        }
        for (var i = 0; i < displayedHist.length; i++) {
            var balance = (displayedHist[i].rate - minVal) / (maxVal - minVal);
            boxXPos[i] = (1 - (i / displayedHist.length)) * (this.width - 20) + 10;
            boxYPos[i] = (1 - balance) * (this.height - 80) + 30;
            if (i == 0) {
                context.beginPath();
                context.moveTo(boxXPos[i], boxYPos[i]);
            }
            else {
                context.lineTo(boxXPos[i], boxYPos[i]);
                context.strokeStyle = this.GetGoodnessColor(displayedHist[i].goodness);
                context.lineWidth = 5;
                context.stroke();
                if (i !== displayedHist.length) {
                    context.beginPath();
                    context.moveTo(boxXPos[i], boxYPos[i]);
                }
            }
        }
        context.lineWidth = 1;
        var colWidth = 0;
        if (boxXPos.length > 1) {
            colWidth = boxXPos[1] - boxXPos[0];
        }
        context.globalAlpha = 0.2;
        for (var i = 0; i < displayedHist.length; i++) {
            let color = this.GetEventColor(displayedHist[i].eventType);
            if (color) {
                context.fillStyle = color;
                context.fillRect(boxXPos[i] - 3, 0, colWidth, this.height);
            }
        }
        context.globalAlpha = 1;
        for (var i = firstFiveMinuteMark; i < displayedHist.length; i += (12 * 5)) {
            var time = new Date();
            time.setSeconds(time.getSeconds() - i * 5);
            context.fillStyle = "white";
            context.font = "24px serif";
            var dispTime = Utils_1.default.DisplayTime(time, false);
            context.fillText(dispTime, boxXPos[i] - 58, this.height - 5);
        }
        context.fillStyle = "white";
        context.font = "24px serif";
        if (displayedHist && displayedHist.length) {
            var dispRate = Utils_1.default.DisplayNumber(displayedHist[0].rate);
            context.fillText(dispRate + " CSH", boxXPos[0] - 95, boxYPos[0] + 30);
            //dispRate = Utils.DisplayNumber(minVal);
            //context.fillText(dispRate + " CSH", boxXPos[boxXPos.length-1], this.height - 30);
            //dispRate = Utils.DisplayNumber(maxVal);
            //context.fillText(dispRate + " CSH", boxXPos[boxXPos.length-1], 50);
        }
    }
    updateVisibleSections() {
        if (this.tradeTab.current.getAutoSellEnabled()) {
            this.divBuyOrderTab.current.classList.add("nodisp");
            this.divSellOrderTab.current.classList.add("nodisp");
        }
        else {
            if (OS_1.OS.getSharedData("hasACNSellOrders")) {
                this.divSellOrderTab.current.classList.remove("nodisp");
            }
            else {
                this.divSellOrderTab.current.classList.add("nodisp");
            }
            if (OS_1.OS.getSharedData("hasACNBuyOrders")) {
                this.divBuyOrderTab.current.classList.remove("nodisp");
            }
            else {
                this.divBuyOrderTab.current.classList.add("nodisp");
            }
        }
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            innerWidth: 500,
            innerHeight: 450,
            resizable: false,
            icon: this.icon,
            title: Wallet_1.Wallet.AllWallets[this.symbol].name + " Exchange"
        });
        this.windowObj.on("close", () => {
            this.canvas = null;
        });
        const mainDiv = $("<div></div>");
        const canvasRef = React.createRef();
        const tabstripRef = React.createRef();
        const tradeDivRef = React.createRef();
        const buyOrdersDivRef = React.createRef();
        const sellOrdersDivRef = React.createRef();
        const curRateRef = React.createRef();
        const avgRateRef = React.createRef();
        const maxRateRef = React.createRef();
        const minRateRef = React.createRef();
        const buyOrderAmountRef = React.createRef();
        const buyOrderQuantityRef = React.createRef();
        const buyOrderBtnRef = React.createRef();
        const buyOrderSectionDetails = React.createRef();
        const buyOrderSectionPlace = React.createRef();
        const buyOrderSectionSummary = React.createRef();
        const buyOrderSectionCancel = React.createRef();
        const buyOrderSummaryAmountRef = React.createRef();
        const buyOrderSummaryQtyRef = React.createRef();
        const buyOrderSummaryTotalRef = React.createRef();
        const buyQtyD10Ref = React.createRef();
        const buyQtyM10Ref = React.createRef();
        let isMaxBuy = false;
        const sellOrderAmountRef = React.createRef();
        const sellOrderQuantityRef = React.createRef();
        const sellOrderBtnRef = React.createRef();
        const sellOrderSectionDetails = React.createRef();
        const sellOrderSectionPlace = React.createRef();
        const sellOrderSectionSummary = React.createRef();
        const sellOrderSectionCancel = React.createRef();
        const sellOrderSummaryAmountRef = React.createRef();
        const sellOrderSummaryQtyRef = React.createRef();
        const sellOrderSummaryTotalRef = React.createRef();
        const sellQtyD10Ref = React.createRef();
        const sellQtyM10Ref = React.createRef();
        let isMaxSell = false;
        const updateBuyOrderQty = (mult) => {
            let qty = Number(buyOrderQuantityRef.current.GetValue());
            qty *= mult;
            if (!isFinite(qty))
                return;
            if (qty < 1) {
                qty = 1;
            }
            buyOrderQuantityRef.current.SetValue(qty.toLocaleString("fullwide", { useGrouping: false }));
        };
        const updateSellOrderQty = (mult) => {
            let qty = Number(sellOrderQuantityRef.current.GetValue());
            qty *= mult;
            if (!isFinite(qty))
                return;
            if (qty < 1) {
                qty = 1;
            }
            sellOrderQuantityRef.current.SetValue(qty.toLocaleString("fullwide", { useGrouping: false }));
        };
        ReactDom.render([
            React.createElement("canvas", { key: "1", ref: canvasRef, width: this.width, height: this.height }),
            React.createElement("div", { key: "2", className: "exchangeBottom" },
                React.createElement("div", { className: "rateSections" },
                    React.createElement("div", { className: "rateSection" },
                        React.createElement("div", { className: "rateDisplay", title: "value of each " + this.symbol + " coin right now", ref: curRateRef },
                            Utils_1.default.DisplayNumber(this.rate),
                            " CSH"),
                        React.createElement("div", { className: "rateLabel", title: "value of each " + this.symbol + " coin right now" }, "Current Rate")),
                    React.createElement("div", { className: "rateSection" },
                        React.createElement("div", { className: "rateDisplay initial", title: "expected value of each " + this.symbol + " coin", ref: avgRateRef },
                            Utils_1.default.DisplayNumber(this.initialrate),
                            " CSH"),
                        React.createElement("div", { className: "rateLabel", title: "expected value of each " + this.symbol + " coin" }, "Average Rate")),
                    React.createElement("div", { className: "rateSection" },
                        React.createElement("div", { className: "smallRateSection" },
                            React.createElement("div", { className: "rateDisplay initial", title: "lowest value of each " + this.symbol + " coin in the last 10 minutes", ref: minRateRef }),
                            React.createElement("div", { className: "rateLabel", title: "lowest value of each " + this.symbol + " coin in the last 10 minutes" }, "Min Rate")),
                        React.createElement("div", { className: "smallRateSection" },
                            React.createElement("div", { className: "rateDisplay initial", title: "highest value of each " + this.symbol + " coin in the last 10 minutes", ref: maxRateRef }),
                            React.createElement("div", { className: "rateLabel", title: "highest value of each " + this.symbol + " coin in the last 10 minutes" }, "Max Rate")))),
                React.createElement("div", { ref: tabstripRef, className: "tabSection" },
                    React.createElement("div", { className: "tabstrip" },
                        React.createElement("div", { className: "tab active", "data-tabname": "Trade" }, "Trade"),
                        React.createElement("div", { className: "tab", "data-tabname": "BuyOrder", ref: this.divBuyOrderTab = React.createRef() }, "Buy Order"),
                        React.createElement("div", { className: "tab", "data-tabname": "SellOrder", ref: this.divSellOrderTab = React.createRef() }, "Sell Order")),
                    React.createElement("div", { className: "tabContent", "data-tabname": "Trade", ref: tradeDivRef },
                        React.createElement(TradeTab_1.TradeTab, { symbol: "ACN", exchange: this, ref: this.tradeTab = React.createRef() })),
                    React.createElement("div", { className: "tabContent nodisp", "data-tabname": "BuyOrder", ref: buyOrdersDivRef },
                        React.createElement("div", { className: "orderSection", ref: buyOrderSectionDetails },
                            React.createElement(Slider_1.default, { ref: buyOrderAmountRef, tooltip: "automatically buy when " + this.symbol + " reaches this rate", min: this.initialrate * 0.25, max: this.initialrate * 1.75, suffix: " CSH", label: "buy rate" }),
                            React.createElement(TextInput_1.default, { ref: buyOrderQuantityRef, requireNumbers: true, noDecimal: true, placeholder: "quantity", defaultValue: "1", fontSize: 12, backgroundColor: "white", rightAlign: true, style: { "marginLeft": "4px", "marginBottom": "4px" }, width: 150 }),
                            React.createElement("div", null,
                                React.createElement(Button_1.default, { title: "\u00F710", tooltip: "quickly divide quantity by 10", ref: buyQtyD10Ref, small: true, backgroundColor: "#bfbfbf", fontSize: 13, onClick: () => { updateBuyOrderQty(0.10); } }),
                                React.createElement(Button_1.default, { title: "x10", tooltip: "quickly multiply quantity by 10", ref: buyQtyM10Ref, small: true, backgroundColor: "#bfbfbf", fontSize: 13, onClick: () => { updateBuyOrderQty(10.0); } }),
                                React.createElement(Button_1.default, { title: "max", tooltip: "lock quantity to the max you can afford", small: true, backgroundColor: "#bfbfbf", fontSize: 13, onClick: () => { toggleBuyQty(); }, style: { marginLeft: "62px", marginRight: "0" } }))),
                        React.createElement("div", { className: "orderSection", ref: buyOrderSectionPlace },
                            React.createElement(Button_1.default, { ref: buyOrderBtnRef, title: "Place Buy Order For XXX CSH", tooltip: "reserve CSH to automatically buy " + this.symbol + " when the rate is reached", small: true, backgroundColor: "#bfbfbf", style: { width: "142px", padding: "10px", textAlign: "center", marginTop: "9px" }, fontSize: 22, onClick: () => { toggleBuyOrder(true); } })),
                        React.createElement("div", { className: "orderSection orderSummary", ref: buyOrderSectionSummary },
                            React.createElement(TextInput_1.default, { ref: buyOrderSummaryAmountRef, placeholder: "rate", fontSize: 12, disabled: true, rightAlign: true, style: { "marginTop": "1px" }, width: 150 }),
                            React.createElement(TextInput_1.default, { ref: buyOrderSummaryQtyRef, placeholder: "quantity", fontSize: 12, disabled: true, rightAlign: true, style: { "marginTop": "12px" }, width: 150 }),
                            React.createElement(TextInput_1.default, { ref: buyOrderSummaryTotalRef, placeholder: "total value", fontSize: 12, disabled: true, rightAlign: true, style: { "marginTop": "12px" }, width: 150 })),
                        React.createElement("div", { className: "orderSection", ref: buyOrderSectionCancel },
                            React.createElement(Button_1.default, { title: "Cancel Buy Order", tooltip: "cancel buy order to reclaim your CSH", small: true, backgroundColor: "#bfbfbf", style: { width: "142px", padding: "23px 10px", textAlign: "center", marginTop: "9px" }, fontSize: 22, onClick: () => { toggleBuyOrder(false); } }))),
                    React.createElement("div", { className: "tabContent nodisp", "data-tabname": "SellOrder", ref: sellOrdersDivRef },
                        React.createElement("div", { className: "orderSection", ref: sellOrderSectionDetails },
                            React.createElement(Slider_1.default, { ref: sellOrderAmountRef, tooltip: "automatically sell when " + this.symbol + " reaches this rate", min: this.initialrate * 0.25, max: this.initialrate * 1.75, suffix: " CSH", label: "min rate" }),
                            React.createElement(TextInput_1.default, { ref: sellOrderQuantityRef, requireNumbers: true, noDecimal: true, placeholder: "quantity", defaultValue: "1", fontSize: 12, backgroundColor: "white", rightAlign: true, style: { "marginLeft": "4px", "marginBottom": "4px" }, width: 150 }),
                            React.createElement("div", null,
                                React.createElement(Button_1.default, { title: "\u00F710", tooltip: "quickly divide quantity by 10", ref: sellQtyD10Ref, small: true, backgroundColor: "#bfbfbf", fontSize: 13, onClick: () => { updateSellOrderQty(0.10); } }),
                                React.createElement(Button_1.default, { title: "x10", tooltip: "quickly multiply quantity by 10", ref: sellQtyM10Ref, small: true, backgroundColor: "#bfbfbf", fontSize: 13, onClick: () => { updateSellOrderQty(10.0); } }),
                                React.createElement(Button_1.default, { title: "max", tooltip: "lock quantity to the max you can sell", small: true, backgroundColor: "#bfbfbf", fontSize: 13, onClick: () => { toggleSellQty(); }, style: { marginLeft: "62px", marginRight: "0" } }))),
                        React.createElement("div", { className: "orderSection", ref: sellOrderSectionPlace },
                            React.createElement(Button_1.default, { ref: sellOrderBtnRef, title: "Place Sell Order For XXX CSH", tooltip: "reserve " + this.symbol + " to automatically sell when the rate is reached", small: true, backgroundColor: "#bfbfbf", style: { width: "142px", padding: "10px", textAlign: "center", marginTop: "9px" }, fontSize: 22, onClick: () => { toggleSellOrder(true); } })),
                        React.createElement("div", { className: "orderSection orderSummary", ref: sellOrderSectionSummary },
                            React.createElement(TextInput_1.default, { ref: sellOrderSummaryAmountRef, placeholder: "rate", fontSize: 12, disabled: true, rightAlign: true, style: { "marginTop": "1px" }, width: 150 }),
                            React.createElement(TextInput_1.default, { ref: sellOrderSummaryQtyRef, placeholder: "quantity", fontSize: 12, disabled: true, rightAlign: true, style: { "marginTop": "12px" }, width: 150 }),
                            React.createElement(TextInput_1.default, { ref: sellOrderSummaryTotalRef, placeholder: "total value", fontSize: 12, disabled: true, rightAlign: true, style: { "marginTop": "12px" }, width: 150 })),
                        React.createElement("div", { className: "orderSection", ref: sellOrderSectionCancel },
                            React.createElement(Button_1.default, { title: "Cancel Sell Order", tooltip: "cancel sell order to reclaim your " + this.symbol, small: true, backgroundColor: "#bfbfbf", style: { width: "142px", padding: "23px 10px", textAlign: "center", marginTop: "9px" }, fontSize: 22, onClick: () => { toggleSellOrder(false); } })))))
        ], mainDiv[0]);
        Utils_1.default.SetupTabStrip(tabstripRef.current);
        OS_1.OS.on("hasACNSellOrders", () => { this.updateVisibleSections(); });
        OS_1.OS.on("hasACNBuyOrders", () => { this.updateVisibleSections(); });
        this.tradeTab.current.on("autosellChanged", () => { this.updateVisibleSections(); });
        this.updateVisibleSections();
        this.canvas = canvasRef.current;
        const toggleBuyOrder = (place) => {
            if (place && buyOrderAmountRef.current.GetOutOfRange()) {
                return;
            }
            if (!place) {
                const total = this.buyOrder.amount * this.buyOrder.quantity;
                Wallet_1.Wallet.AllWallets["CSH"].ChangeValue(total);
                this.buyOrder = null;
            }
            else {
                this.buyOrder = {
                    amount: buyOrderAmountRef.current.GetValue(),
                    quantity: Number(buyOrderQuantityRef.current.GetValue())
                };
                const total = this.buyOrder.amount * this.buyOrder.quantity;
                Wallet_1.Wallet.AllWallets["CSH"].ChangeValue(-total);
            }
            updateDisplayedBuySection();
        };
        const toggleSellOrder = (place) => {
            if (place && sellOrderAmountRef.current.GetOutOfRange()) {
                return;
            }
            if (!place) {
                Wallet_1.Wallet.AllWallets[this.symbol].ChangeValue(this.sellOrder.quantity);
                this.sellOrder = null;
            }
            else {
                this.sellOrder = {
                    amount: sellOrderAmountRef.current.GetValue(),
                    quantity: Number(sellOrderQuantityRef.current.GetValue())
                };
                Wallet_1.Wallet.AllWallets[this.symbol].ChangeValue(-this.sellOrder.quantity);
            }
            updateDisplayedSellSection();
        };
        const updateDisplayedSellSection = () => {
            if (this.sellOrder) {
                sellOrderSectionDetails.current.classList.add("nodisp");
                sellOrderSectionPlace.current.classList.add("nodisp");
                sellOrderSectionSummary.current.classList.remove("nodisp");
                sellOrderSectionCancel.current.classList.remove("nodisp");
                let total = this.sellOrder.amount * this.sellOrder.quantity;
                sellOrderSummaryAmountRef.current.SetValue(Utils_1.default.DisplayNumber(this.sellOrder.amount) + " CSH");
                sellOrderSummaryQtyRef.current.SetValue(Utils_1.default.DisplayNumber(this.sellOrder.quantity) + " " + this.symbol);
                sellOrderSummaryTotalRef.current.SetValue(Utils_1.default.DisplayNumber(total) + " CSH");
            }
            else {
                sellOrderSectionDetails.current.classList.remove("nodisp");
                sellOrderSectionPlace.current.classList.remove("nodisp");
                sellOrderSectionSummary.current.classList.add("nodisp");
                sellOrderSectionCancel.current.classList.add("nodisp");
            }
        };
        updateDisplayedSellSection();
        const updateDisplayedBuySection = () => {
            if (this.buyOrder) {
                buyOrderSectionDetails.current.classList.add("nodisp");
                buyOrderSectionPlace.current.classList.add("nodisp");
                buyOrderSectionSummary.current.classList.remove("nodisp");
                buyOrderSectionCancel.current.classList.remove("nodisp");
                let total = this.buyOrder.amount * this.buyOrder.quantity;
                buyOrderSummaryAmountRef.current.SetValue(Utils_1.default.DisplayNumber(this.buyOrder.amount) + " CSH");
                buyOrderSummaryQtyRef.current.SetValue(Utils_1.default.DisplayNumber(this.buyOrder.quantity) + " " + this.symbol);
                buyOrderSummaryTotalRef.current.SetValue(Utils_1.default.DisplayNumber(total) + " CSH");
            }
            else {
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
            const qty = Wallet_1.Wallet.AllWallets["ACN"].amount || 1;
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
            const qty = Math.floor(Wallet_1.Wallet.AllWallets["CSH"].amount / amt) || 1;
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
            buyOrderBtnRef.current.SetTitle("Place Buy Order For " + Utils_1.default.DisplayNumber(bvalue) + " CSH");
            if (bvalue > Wallet_1.Wallet.AllWallets["CSH"].amount) {
                buyOrderBtnRef.current.SetEnabled(false);
            }
            else {
                buyOrderBtnRef.current.SetEnabled(true);
            }
            const sqty = Number(sellOrderQuantityRef.current.GetValue());
            const samt = sellOrderAmountRef.current.GetValue();
            const svalue = samt * sqty;
            sellOrderBtnRef.current.SetTitle("Place Sell Order For " + Utils_1.default.DisplayNumber(svalue) + " CSH");
            if (sqty > Wallet_1.Wallet.AllWallets[this.symbol].amount) {
                sellOrderBtnRef.current.SetEnabled(false);
            }
            else {
                sellOrderBtnRef.current.SetEnabled(true);
            }
        };
        updateOrderAmounts();
        buyOrderAmountRef.current.on("changed", () => {
            if (isMaxBuy) {
                updateBuyQtyMax();
            }
            updateOrderAmounts();
        });
        buyOrderQuantityRef.current.on("changed", () => {
            updateOrderAmounts();
        });
        sellOrderAmountRef.current.on("changed", () => {
            if (isMaxSell) {
                updateSellQtyMax();
            }
            updateOrderAmounts();
        });
        sellOrderQuantityRef.current.on("changed", () => {
            updateOrderAmounts();
        });
        Wallet_1.Wallet.AllWallets["CSH"].on("afterChangeValue", () => { updateOrderAmounts(); });
        Wallet_1.Wallet.AllWallets[this.symbol].on("afterChangeValue", () => { updateOrderAmounts(); });
        this.UpdateCanvas();
        const updateRates = () => {
            $(curRateRef.current).text(Utils_1.default.DisplayNumber(this.rate) + " CSH");
            $(avgRateRef.current).text(Utils_1.default.DisplayNumber(this.initialrate) + " CSH");
            let max = this.rate;
            let min = this.rate;
            let checkedPoints = 0;
            for (let i = this.hist.length - 1; i >= 0 && checkedPoints < Exchange.PointNum; i--) {
                checkedPoints++;
                let val = this.hist[i].rate;
                if (i == this.hist.length - 1 || val > max)
                    max = val;
                if (i == this.hist.length - 1 || val < min)
                    min = val;
            }
            $(maxRateRef.current).text(Utils_1.default.DisplayNumber(max) + " CSH");
            $(minRateRef.current).text(Utils_1.default.DisplayNumber(min) + " CSH");
            buyOrderAmountRef.current.SetMaxAllowedValue(this.rate);
            sellOrderAmountRef.current.SetMinAllowedValue(this.rate);
            if (isMaxBuy) {
                updateBuyQtyMax();
            }
            if (isMaxSell) {
                updateSellQtyMax();
            }
        };
        updateRates();
        this.OnTick();
        this.AutoSell();
        this.on("tick", () => { updateRates(); });
    }
}
Exchange.AllExchanges = [];
Exchange.PointNum = 120;
Exchange.TickDelay = 5000;
Exchange.LastTick = -1;
exports.default = Exchange;
//# sourceMappingURL=Exchange.js.map
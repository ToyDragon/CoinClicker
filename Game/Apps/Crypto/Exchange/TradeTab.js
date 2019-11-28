"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TextInput_1 = require("../../../OS/Widgets/TextInput");
const React = require("react");
const Button_1 = require("../../../OS/Widgets/Button");
const Wallet_1 = require("../Wallet");
const Utils_1 = require("../../../Core/Utils");
const Label_1 = require("../../../OS/Widgets/Label");
const Observable_1 = require("../../../Core/Observable");
const OS_1 = require("../../../OS/OS");
const LoadingBar_1 = require("../../../OS/Widgets/LoadingBar");
class TradeTab extends Observable_1.ObservableComponent {
    updateAmounts() {
        let sellQty = Number(this.inputSellQuantity.current.GetValue());
        if (isNaN(sellQty)) {
            sellQty = 0;
        }
        let sellAmt = sellQty * this.props.exchange.rate;
        if (sellQty > Wallet_1.Wallet.AllWallets[this.props.symbol].amount) {
            this.btnSell.current.SetEnabled(false);
        }
        else {
            this.btnSell.current.SetEnabled(true);
        }
        this.btnSell.current.SetTitle("Sell for " + Utils_1.default.DisplayNumber(sellAmt) + " CSH");
        let buyQty = Number(this.inputBuyQuantity.current.GetValue());
        if (isNaN(buyQty)) {
            buyQty = 0;
        }
        let buyAmt = buyQty * this.props.exchange.rate;
        if (buyAmt > Wallet_1.Wallet.AllWallets["CSH"].amount) {
            this.btnBuy.current.SetEnabled(false);
        }
        else {
            this.btnBuy.current.SetEnabled(true);
        }
        this.btnBuy.current.SetTitle("Buy for " + Utils_1.default.DisplayNumber(buyAmt) + " CSH");
    }
    updateQuantity(isSell, percentage) {
        let max = 0;
        if (isSell) {
            max = Wallet_1.Wallet.AllWallets[this.props.symbol].amount;
        }
        else {
            max = Wallet_1.Wallet.AllWallets["CSH"].amount / this.props.exchange.rate;
        }
        let count = Math.floor(percentage * max);
        if (isSell) {
            this.inputSellQuantity.current.SetValue(count.toString());
        }
        else {
            this.inputBuyQuantity.current.SetValue(count.toString());
        }
    }
    sellConfirmed() {
        let sellQty = Number(this.inputSellQuantity.current.GetValue());
        if (isNaN(sellQty) || sellQty < 0) {
            return;
        }
        if (sellQty > Wallet_1.Wallet.AllWallets[this.props.symbol].amount) {
            return;
        }
        let sellAmt = sellQty * this.props.exchange.rate;
        Wallet_1.Wallet.AllWallets["CSH"].ChangeValue(sellAmt);
        Wallet_1.Wallet.AllWallets[this.props.symbol].ChangeValue(-sellQty);
        this.inputSellQuantity.current.SetValue("0");
    }
    buyConfirmed() {
        let buyQty = Number(this.inputBuyQuantity.current.GetValue());
        if (isNaN(buyQty) || buyQty < 0) {
            return;
        }
        let buyAmt = buyQty * this.props.exchange.rate;
        if (buyAmt > Wallet_1.Wallet.AllWallets["CSH"].amount) {
            return;
        }
        Wallet_1.Wallet.AllWallets["CSH"].ChangeValue(-buyAmt);
        Wallet_1.Wallet.AllWallets[this.props.symbol].ChangeValue(buyQty);
        this.inputBuyQuantity.current.SetValue("0");
    }
    getAutoSellEnabled() {
        return this.autosellEnabled;
    }
    componentDidMount() {
        this.inputBuyQuantity.current.on("changed", () => { this.updateAmounts(); });
        this.inputSellQuantity.current.on("changed", () => { this.updateAmounts(); });
        this.props.exchange.on("tick", () => {
            this.updateAmounts();
        });
        this.autosellChanged(); //triggers updateVisibleSections
        OS_1.OS.on("hasACNBuy", () => { this.updateVisibleSections(); });
        OS_1.OS.on("hasACNAdvancedSell", () => { this.updateVisibleSections(); });
    }
    disableAutoSell() {
        this.autosellEnabled = false;
        this.autosellChanged();
    }
    enableAutoSell() {
        this.autosellEnabled = true;
        this.autosellChanged();
    }
    autosellChanged() {
        this.btnToggleAutoSell.current.SetToggleValue(false);
        this.btnToggleAutoSellSection.current.SetToggleValue(true);
        this.updateVisibleSections();
        this.trigger("autosellChanged");
    }
    updateVisibleSections() {
        if (this.autosellEnabled) {
            this.divAutoSellSection.current.classList.remove("nodisp");
            this.divSellSection.current.classList.add("nodisp");
            this.divBuyAdvanced.current.classList.add("nodisp");
        }
        else {
            this.divAutoSellSection.current.classList.add("nodisp");
            this.divSellSection.current.classList.remove("nodisp");
            if (OS_1.OS.getSharedData("hasACNAdvancedSell")) {
                this.divSellAdvanced.current.classList.remove("nodisp");
            }
            else {
                this.divSellAdvanced.current.classList.add("nodisp");
            }
            if (OS_1.OS.getSharedData("hasACNBuy")) {
                this.divBuyAdvanced.current.classList.remove("nodisp");
            }
            else {
                this.divBuyAdvanced.current.classList.add("nodisp");
            }
        }
    }
    render() {
        //This should probably be in CSS somewhere
        const quickBtnOptions = { small: true, backgroundColor: "#bfbfbf", fontSize: 13 };
        const titleOptions = { color: "white", margin: 3 };
        const qtyInputOptions = { requireNumbers: true, noDecimal: true, placeholder: "quantity", defaultValue: "0", fontSize: 12, backgroundColor: "white", rightAlign: true, style: { "marginLeft": "4px", "marginBottom": "4px" }, width: 150 };
        const confirmOptions = { small: true, backgroundColor: "#bfbfbf", fontSize: 15, style: { "width": "147px" } };
        this.autosellEnabled = true;
        const triggerPointsRestart = [
            {
                complete: () => {
                    this.loadingBarAutoSell.current.Restart();
                    this.loadingBarAutoSell.current.NextFrame();
                },
                value: 1000
            }
        ];
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "autoSellSection", ref: this.divAutoSellSection = React.createRef() },
                React.createElement("div", { style: { marginTop: "5px" } },
                    React.createElement(Button_1.default, { ref: this.btnToggleAutoSellSection = React.createRef(), toggle: true, toggleValue: true, small: true, onClick: () => { this.disableAutoSell(); }, style: { marginLeft: "10px" } }),
                    React.createElement(Label_1.default, Object.assign({ title: "auto-selling all mined ACN" }, titleOptions, { style: { verticalAlign: "top" } }))),
                React.createElement(LoadingBar_1.default, { ref: this.loadingBarAutoSell = React.createRef(), totalDuration: 1000, triggerPoints: triggerPointsRestart })),
            React.createElement("div", { className: "buySellSection", ref: this.divSellSection = React.createRef() },
                React.createElement("div", null,
                    React.createElement(Label_1.default, Object.assign({ title: "Sell" }, titleOptions)),
                    React.createElement("div", { style: { display: "inline-block", float: "right" } },
                        React.createElement(Button_1.default, { ref: this.btnToggleAutoSell = React.createRef(), toggle: true, toggleValue: true, small: true, onClick: () => { this.enableAutoSell(); } }),
                        React.createElement(Label_1.default, { title: "auto-sell", color: "white", tooltip: "automatically sell ACN as soon as it's mined", size: 12, margin: 3 }))),
                React.createElement("div", { ref: this.divSellAdvanced = React.createRef() },
                    React.createElement(TextInput_1.default, Object.assign({ ref: this.inputSellQuantity = React.createRef() }, qtyInputOptions)),
                    React.createElement("div", null,
                        React.createElement(Button_1.default, Object.assign({ title: "25%", tooltip: "set sell quantity to 25% of your stock", onClick: () => { this.updateQuantity(true, 0.25); } }, quickBtnOptions)),
                        React.createElement(Button_1.default, Object.assign({ title: "50%", tooltip: "set sell quantity to 50% of your stock", onClick: () => { this.updateQuantity(true, 0.50); } }, quickBtnOptions)),
                        React.createElement(Button_1.default, Object.assign({ title: "75%", tooltip: "set sell quantity to 75% of your stock", onClick: () => { this.updateQuantity(true, 0.75); } }, quickBtnOptions)),
                        React.createElement(Button_1.default, Object.assign({ title: "100%", tooltip: "set sell quantity to 100% of your stock", onClick: () => { this.updateQuantity(true, 1.00); } }, quickBtnOptions))),
                    React.createElement("div", null,
                        React.createElement(Button_1.default, Object.assign({ ref: this.btnSell = React.createRef(), title: "Sell for 0 CSH", tooltip: "confirm your sale", onClick: () => { this.sellConfirmed(); } }, confirmOptions))))),
            React.createElement("div", { className: "buySellSection" },
                React.createElement("div", { ref: this.divBuyAdvanced = React.createRef() },
                    React.createElement("div", null,
                        React.createElement(Label_1.default, Object.assign({ title: "Buy" }, titleOptions))),
                    React.createElement(TextInput_1.default, Object.assign({ ref: this.inputBuyQuantity = React.createRef() }, qtyInputOptions)),
                    React.createElement("div", null,
                        React.createElement(Button_1.default, Object.assign({ title: "25%", tooltip: "set buy quantity to 25% of what you can afford", onClick: () => { this.updateQuantity(false, 0.25); } }, quickBtnOptions)),
                        React.createElement(Button_1.default, Object.assign({ title: "50%", tooltip: "set buy quantity to 50% of what you can afford", onClick: () => { this.updateQuantity(false, 0.50); } }, quickBtnOptions)),
                        React.createElement(Button_1.default, Object.assign({ title: "75%", tooltip: "set buy quantity to 75% of what you can afford", onClick: () => { this.updateQuantity(false, 0.75); } }, quickBtnOptions)),
                        React.createElement(Button_1.default, Object.assign({ title: "100%", tooltip: "set buy quantity to 100% of what you can afford", onClick: () => { this.updateQuantity(false, 1.00); } }, quickBtnOptions))),
                    React.createElement("div", null,
                        React.createElement(Button_1.default, Object.assign({ ref: this.btnBuy = React.createRef(), title: "Buy for 0 CSH", tooltip: "confirm your purchase", onClick: () => { this.buyConfirmed(); } }, confirmOptions)))))));
    }
}
exports.TradeTab = TradeTab;
//# sourceMappingURL=TradeTab.js.map
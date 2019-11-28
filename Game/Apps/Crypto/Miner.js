"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("../App");
const Icons_1 = require("../../Core/Icons");
const Window_1 = require("../../OS/Window");
const LoadingBar_1 = require("../../OS/Widgets/LoadingBar");
const Wallet_1 = require("../Crypto/Wallet");
const React = require("react");
const ReactDom = require("react-dom");
const Label_1 = require("../../OS/Widgets/Label");
const Icon_1 = require("../../OS/Widgets/Icon");
const OS_1 = require("../../OS/OS");
const Utils_1 = require("../../Core/Utils");
const Widget_1 = require("../../OS/Widgets/Widget");
class Miner extends App_1.default {
    constructor(options) {
        super();
        Miner.AmtMinersByTitle[options.title] = (Miner.AmtMinersByTitle[options.title] || 1);
        var amt = Miner.AmtMinersByTitle[options.title]++;
        var newTitle = options.title;
        if (amt > 1) {
            newTitle += " " + amt;
        }
        this.title = newTitle;
        this.block = options.block || 1;
        this.symbol = options.symbol;
        this.time = options.time || 5000;
        this.icon = options.icon;
        this.bonusDetails = React.createRef();
    }
    static AddBonus(item) {
        this.AllBoosts.push(item);
        this.BonusesBySymbol[item.symbol] = this.BonusesBySymbol[item.symbol] || [];
        this.BonusesBySymbol[item.symbol].push(item);
    }
    static RemoveBonus(symbol, itemName) {
        let bonuses = this.BonusesBySymbol[symbol] || [];
        for (let i = bonuses.length - 1; i >= 0; i--) {
            if (bonuses[i].name === itemName) {
                bonuses.splice(i, 1);
            }
        }
    }
    ApplyBoosts() {
        var newValue = this.block;
        var timeDivisor = 1;
        var allBonuses = Miner.BonusesBySymbol[this.symbol] || [];
        for (var i = 0; i < allBonuses.length; i++) {
            if (allBonuses[i].blockBoost) {
                newValue += allBonuses[i].blockBoost;
            }
            if (allBonuses[i].speedBoost) {
                timeDivisor *= allBonuses[i].speedBoost;
            }
        }
        for (var i = 0; i < allBonuses.length; i++) {
            if (allBonuses[i].blockMultiplier) {
                newValue *= allBonuses[i].blockMultiplier;
            }
        }
        return {
            value: Math.round(newValue * 100) / 100,
            time: Math.round(this.time / timeDivisor) || 1
        };
    }
    AfterComplete() {
        if (!this.windowObj || this.windowObj.closed) {
            return;
        }
        this.boostedOptions = this.ApplyBoosts();
        Wallet_1.Wallet.AllWallets[this.symbol].ChangeValue(this.boostedOptions.value);
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
        if (this.bonusDetails.current) {
            this.bonusDetails.current.trigger("blockDone");
        }
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            width: 400,
            height: 189,
            resizable: false,
            icon: this.icon,
            title: this.title
        });
        var newOptions = this.ApplyBoosts();
        const barRef = React.createRef();
        ReactDom.render([
            React.createElement(LoadingBar_1.default, { key: "a", totalDuration: newOptions.time, ref: barRef, triggerPoints: [
                    {
                        value: newOptions.time,
                        complete: () => { this.AfterComplete(); }
                    }
                ] }),
            React.createElement(BonusDetails, { key: "b", miner: this, ref: this.bonusDetails, symbol: this.symbol, baseBlock: this.block, baseTime: this.time }),
        ], this.windowObj.contentDiv[0]);
        this.loadingBar = barRef.current;
        this.windowObj.on("close", () => {
            this.loadingBar.Cancel();
        });
    }
}
Miner.AmtMinersByTitle = {};
Miner.BonusesBySymbol = {};
Miner.AllBoosts = [];
exports.default = Miner;
class BonusDetails extends Widget_1.default {
    constructor(options) {
        super(options);
        this.options = options;
        this.displayedBonuses = {};
    }
    componentDidMount() {
        this.Update();
        this.on("blockDone", () => {
            this.Update();
        });
        let link = $(this.alphawolfLink.current.GetElement());
        link.on("click", () => {
            OS_1.OS.BrowserApp.ActivateOrCreate();
            OS_1.OS.BrowserApp.SetURL("alphawolf.org");
            OS_1.OS.BrowserApp.GotoPage();
        });
        link.css("color", "blue");
        link.css("cursor", "pointer");
        link = $(this.alphawolfLink2.current.GetElement());
        link.on("click", () => {
            OS_1.OS.BrowserApp.ActivateOrCreate();
            OS_1.OS.BrowserApp.SetURL("alphawolf.org");
            OS_1.OS.BrowserApp.GotoPage();
        });
        link.css("color", "blue");
        link.css("cursor", "pointer");
    }
    ToggleExpand() {
        if (this.divUpgradeSection.current) {
            if (this.divUpgradeSection.current.className === "") {
                this.divUpgradeSection.current.className = "nodisp";
                return false;
            }
            else {
                this.divUpgradeSection.current.className = "";
                return true;
            }
        }
        return false;
    }
    Update() {
        const details = this.CalcDetails();
        this.labelBlockBase.current.SetTitle(Utils_1.default.DisplayNumber(details.blockBase));
        this.labelBlockBoost.current.SetTitle("+" + Utils_1.default.DisplayNumber(details.blockBoost));
        this.labelBlockMult.current.SetTitle("x" + Utils_1.default.DisplayNumber(details.blockMult));
        this.labelBlockSize.current.SetTitle("=" + Utils_1.default.DisplayNumber(details.blockSize) + " " + this.options.symbol);
        this.labelBaseTime.current.SetTitle(Utils_1.default.DisplayNumber(details.baseTime));
        this.labelTimeDivisor.current.SetTitle("÷" + Utils_1.default.DisplayNumber(details.timeDivisor));
        this.labelBlockTime.current.SetTitle("=" + Utils_1.default.DisplayNumber(details.blockTime) + " ms");
        const bonuses = (Miner.BonusesBySymbol[this.options.symbol] || []);
        let bonusDisplayed = false;
        for (let bonus of bonuses) {
            if (!this.displayedBonuses[bonus.name]) {
                this.displayedBonuses[bonus.name] = true;
                this.upgradeList.current.appendChild(this.GetBonusEle(bonus));
            }
            bonusDisplayed = true;
        }
        if (bonusDisplayed) {
            this.divNoUpgrades.current.className = "nodisp";
            this.upgradeList.current.className = "";
        }
        else {
            this.divNoUpgrades.current.className = "";
            this.upgradeList.current.className = "nodisp";
        }
    }
    CalcDetails() {
        var blockBoost = 0;
        var blockMult = 1;
        var timeDivisor = 1;
        var allBonuses = Miner.BonusesBySymbol[this.options.symbol] || [];
        for (var i = 0; i < allBonuses.length; i++) {
            if (allBonuses[i].blockBoost) {
                blockBoost += allBonuses[i].blockBoost;
            }
            if (allBonuses[i].speedBoost) {
                timeDivisor *= allBonuses[i].speedBoost;
            }
        }
        for (var i = 0; i < allBonuses.length; i++) {
            if (allBonuses[i].blockMultiplier) {
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
        };
    }
    ToggleExpandDetails() {
        if (this.ToggleExpand()) {
            this.options.miner.windowObj.SetSize(400, 440, false);
        }
        else {
            this.options.miner.windowObj.SetSize(400, 189, false);
        }
    }
    render() {
        this.upgradeList = React.createRef();
        this.labelBlockBase = React.createRef();
        this.labelBlockBoost = React.createRef();
        this.labelBlockMult = React.createRef();
        this.labelBlockSize = React.createRef();
        this.labelBaseTime = React.createRef();
        this.labelTimeDivisor = React.createRef();
        this.labelBlockTime = React.createRef();
        this.divNoUpgrades = React.createRef();
        this.divUpgradeSection = React.createRef();
        this.alphawolfLink = React.createRef();
        this.alphawolfLink2 = React.createRef();
        const halfWidth = { width: "50%", verticalAlign: "top", display: "inline-block", position: "relative", paddingBottom: "5px" };
        const center = { marginTop: "3px", position: "relative", left: "50%", transform: "translate(-50%)", display: "inline-block" };
        const blue = { backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block" };
        const red = { backgroundColor: "red", borderRadius: "5px", border: "1px solid pink", padding: "4px", margin: "2px", display: "inline-block" };
        return (React.createElement("div", { style: { position: "relative", top: "-13px" } },
            React.createElement("div", { style: halfWidth },
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Block Size" }))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: blue, title: "Base value for miner." },
                            React.createElement(Label_1.default, { tooltip: "Base value for miner.", color: "cyan", title: "", ref: this.labelBlockBase, size: 12 })),
                        React.createElement("div", { style: blue, title: "Block size boosts." },
                            React.createElement(Label_1.default, { tooltip: "Block size boosts.", color: "cyan", title: "", ref: this.labelBlockBoost, size: 12 })),
                        React.createElement("div", { style: blue, title: "Block size multipliers." },
                            React.createElement(Label_1.default, { tooltip: "Block size multipliers.", color: "cyan", title: "", ref: this.labelBlockMult, size: 12 })))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: blue, title: "Effective block size." },
                            React.createElement(Label_1.default, { tooltip: "Effective block size.", color: "cyan", title: "", ref: this.labelBlockSize }))))),
            React.createElement("div", { style: halfWidth },
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Mining Speed" }))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: red, title: "Base block duration." },
                            React.createElement(Label_1.default, { tooltip: "Base block duration.", color: "pink", title: "", ref: this.labelBaseTime, size: 12 })),
                        React.createElement("div", { style: red, title: "Block duration divisor." },
                            React.createElement(Label_1.default, { tooltip: "Block duration divisor.", color: "pink", title: "", ref: this.labelTimeDivisor, size: 12 })))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: red, title: "Effective block speed." },
                            React.createElement(Label_1.default, { tooltip: "Effective block speed.", color: "pink", title: "", ref: this.labelBlockTime })))),
                React.createElement("div", { key: "infoBtn", style: { left: "161px", top: "78px", position: "absolute", display: "inline-block" } },
                    React.createElement(Icon_1.default, { icon: Icons_1.AllIcons.Info.large, tooltip: "Bonus Info", onClick: () => { this.ToggleExpandDetails(); } }))),
            React.createElement("div", { ref: this.divUpgradeSection, className: "nodisp", style: { borderTop: "1px solid gray" } },
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Upgrades" }))),
                React.createElement("div", { style: { marginTop: "-7px" } },
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Visit", size: 12 }),
                        " ",
                        React.createElement(Label_1.default, { title: "www.alphawolf.org", ref: this.alphawolfLink2, size: 12 }),
                        " ",
                        React.createElement(Label_1.default, { title: "to upgrade your miners", size: 12 }))),
                React.createElement("div", { style: { overflowY: "scroll", height: "207px" }, ref: this.upgradeList }),
                React.createElement("div", { ref: this.divNoUpgrades },
                    React.createElement("div", null,
                        React.createElement("div", { style: { display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%", marginTop: "50px" } },
                            React.createElement(Label_1.default, { title: "Visit" }))),
                    React.createElement("div", null,
                        React.createElement("div", { style: { display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%" } },
                            React.createElement(Label_1.default, { title: "www.alphawolf.org", ref: this.alphawolfLink }))),
                    React.createElement("div", null,
                        React.createElement("div", { style: { display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%" } },
                            React.createElement(Label_1.default, { title: "to upgrade your miners" })))))));
    }
    GetBonusEle(item) {
        let icon;
        let title;
        let effect;
        title = item.name;
        if (item.speedBoost > 1) {
            icon = Icons_1.AllIcons.ComputerBoardSpeed;
            const val = Utils_1.default.DisplayNumber(item.speedBoost * 100 - 100);
            effect = "+" + val + "% Mining Speed";
        }
        else if (item.blockMultiplier > 1) {
            icon = Icons_1.AllIcons.ComputerBoardPower;
            const val = Utils_1.default.DisplayNumber(item.blockMultiplier * 100 - 100);
            effect = "+" + val + "% Block Size";
        }
        else {
            icon = Icons_1.AllIcons.ComputerBoardPower;
            const val = Utils_1.default.DisplayNumber(item.blockBoost);
            effect = "+" + val + " Block Coins";
        }
        const div = document.createElement("div");
        ReactDom.render([
            React.createElement("div", { key: 1, style: { display: "inline-block" } },
                React.createElement(Icon_1.default, { icon: icon.veryLarge })),
            React.createElement("div", { key: 2, style: { display: "inline-block", verticalAlign: "top", paddingTop: "9px" } },
                React.createElement("div", null,
                    React.createElement(Label_1.default, { title: title })),
                React.createElement("div", null,
                    React.createElement(Label_1.default, { title: effect, size: 12 })))
        ], div);
        return div;
    }
}
//# sourceMappingURL=Miner.js.map
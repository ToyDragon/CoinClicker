"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("../App");
const React = require("react");
const ReactDom = require("react-dom");
const Window_1 = require("../../OS/Window");
const Icons_1 = require("../../Core/Icons");
const Button_1 = require("../../OS/Widgets/Button");
const LoadingBar_1 = require("../../OS/Widgets/LoadingBar");
const Wallet_1 = require("./Wallet");
const Label_1 = require("../../OS/Widgets/Label");
const Utils_1 = require("../../Core/Utils");
const Icon_1 = require("../../OS/Widgets/Icon");
const OS_1 = require("../../OS/OS");
class Pickaxe extends App_1.default {
    constructor(options) {
        super();
        this.allBoosts = [];
        this.displayedBonuses = {};
        this.coinAmtBase = 1;
        this.coinAmtAdd = 0;
        this.coinAmtMult = 1;
    }
    AddBoost(boost) {
        if (boost.coinAdds) {
            this.coinAmtAdd += boost.coinAdds;
        }
        if (boost.coinMults) {
            this.coinAmtMult += boost.coinMults;
        }
        this.allBoosts.push(boost);
        this.UpdateLabels();
    }
    GetAmountPerBlock() {
        return (this.coinAmtBase + this.coinAmtAdd) * this.coinAmtMult;
    }
    ToggleExpandDetails() {
        if (this.ToggleExpand()) {
            this.windowObj.SetSize(400, 440, false);
        }
        else {
            this.windowObj.SetSize(400, 228, false);
        }
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
    UpdateLabels() {
        this.lblBaseValue.current.SetTitle(Utils_1.default.DisplayNumber(this.coinAmtBase));
        this.lblAmtAdd.current.SetTitle("+" + Utils_1.default.DisplayNumber(this.coinAmtAdd));
        this.lblAmtMult.current.SetTitle("x" + Utils_1.default.DisplayNumber(this.coinAmtMult));
        this.lblTotalAmt.current.SetTitle("=" + Utils_1.default.DisplayNumber(this.GetAmountPerBlock()) + " ACN");
        let bonusDisplayed = false;
        for (let bonus of this.allBoosts) {
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
    GetBonusEle(item) {
        const div = document.createElement("div");
        ReactDom.render([
            React.createElement("div", { key: 1, style: { display: "inline-block" } },
                React.createElement(Icon_1.default, { icon: item.icon.veryLarge })),
            React.createElement("div", { key: 2, style: { display: "inline-block", verticalAlign: "top", paddingTop: "9px" } },
                React.createElement("div", null,
                    React.createElement(Label_1.default, { title: item.name })),
                React.createElement("div", null,
                    React.createElement(Label_1.default, { title: item.subtitle, size: 12 })))
        ], div);
        return div;
    }
    mine() {
        this.loadingBar.current.NextFrame();
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            width: 400,
            height: 228,
            resizable: false,
            icon: Icons_1.AllIcons.AlphaCoin,
            title: "Alpha Pickaxe"
        });
        const triggerPoints = [];
        for (let i = 0; i < 5; i++) {
            if (i === 4) {
                triggerPoints.push({
                    pause: true,
                    value: 100 * (i + 1),
                    complete: () => {
                        const amt = this.GetAmountPerBlock();
                        Wallet_1.Wallet.AnimatedAdd("ACN", amt, amt, 1);
                        this.loadingBar.current.Restart();
                    }
                });
            }
            else {
                triggerPoints.push({
                    pause: true,
                    value: 100 * (i + 1),
                    complete: () => { }
                });
            }
        }
        ;
        const btnStyles = { width: "87%", marginLeft: "14px", padding: "23px 10px", textAlign: "center", marginTop: "9px" };
        const center = { marginTop: "3px", position: "relative", left: "50%", transform: "translate(-50%)", display: "inline-block" };
        const blueSmall = { backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block", position: "relative", top: "-2px" };
        const blue = { backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block" };
        ReactDom.render(React.createElement(React.Fragment, null,
            React.createElement(LoadingBar_1.default, { ref: this.loadingBar = React.createRef(), totalDuration: 500, triggerPoints: triggerPoints, noAutoStart: true }),
            React.createElement(Button_1.default, { ref: this.btnMine = React.createRef(), onClick: () => { this.mine(); }, title: "Mine Alpha Coin", style: btnStyles, fontSize: 22 }),
            React.createElement("div", null,
                React.createElement("div", { style: center },
                    React.createElement("div", { style: blueSmall, title: "Base amount for pickaxe." },
                        React.createElement(Label_1.default, { tooltip: "Base amount for pickaxe.", color: "cyan", title: "", ref: this.lblBaseValue = React.createRef(), size: 12 })),
                    React.createElement("div", { style: blueSmall, title: "Added amount per block." },
                        React.createElement(Label_1.default, { tooltip: "Added amount per block.", color: "cyan", title: "", ref: this.lblAmtAdd = React.createRef(), size: 12 })),
                    React.createElement("div", { style: blueSmall, title: "Block size multipliers." },
                        React.createElement(Label_1.default, { tooltip: "Block size multipliers.", color: "cyan", title: "", ref: this.lblAmtMult = React.createRef(), size: 12 })),
                    React.createElement("div", { style: blue, title: "Effective coins per click." },
                        React.createElement(Label_1.default, { tooltip: "Effective coins per click.", color: "cyan", title: "", ref: this.lblTotalAmt = React.createRef() }))),
                React.createElement("div", { key: "infoBtn", style: { left: "356px", top: "146px", position: "absolute", display: "inline-block" } },
                    React.createElement(Icon_1.default, { icon: Icons_1.AllIcons.Info.large, tooltip: "Bonus Info", onClick: () => { this.ToggleExpandDetails(); } })),
                React.createElement("div", { ref: this.divUpgradeSection = React.createRef(), className: "nodisp", style: { borderTop: "1px solid gray" } },
                    React.createElement("div", null,
                        React.createElement("div", { style: center },
                            React.createElement(Label_1.default, { title: "Upgrades" }))),
                    React.createElement("div", { style: { marginTop: "-7px" } },
                        React.createElement("div", { style: center },
                            React.createElement(Label_1.default, { title: "Visit", size: 12 }),
                            " ",
                            React.createElement(Label_1.default, { title: "www.doors.com", ref: this.lblDoorLink = React.createRef(), size: 12 }),
                            " ",
                            React.createElement(Label_1.default, { title: "to upgrade your pickaxe", size: 12 }))),
                    React.createElement("div", { style: { overflowY: "scroll", height: "176px" }, ref: this.upgradeList = React.createRef() }),
                    React.createElement("div", { ref: this.divNoUpgrades = React.createRef() },
                        React.createElement("div", null,
                            React.createElement("div", { style: { display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%", marginTop: "50px" } },
                                React.createElement(Label_1.default, { title: "Visit" }))),
                        React.createElement("div", null,
                            React.createElement("div", { style: { display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%" } },
                                React.createElement(Label_1.default, { title: "www.doors.com", ref: this.lblDoorLink2 = React.createRef() }))),
                        React.createElement("div", null,
                            React.createElement("div", { style: { display: "inline-block", transform: "translateX(-50%)", position: "relative", left: "50%" } },
                                React.createElement(Label_1.default, { title: "to upgrade your pickaxe" }))))))), this.windowObj.contentDiv[0]);
        this.displayedBonuses = {};
        this.UpdateLabels();
        let link = $(this.lblDoorLink.current.GetElement());
        link.on("click", () => {
            OS_1.OS.BrowserApp.ActivateOrCreate();
            OS_1.OS.BrowserApp.SetURL("doors.com");
            OS_1.OS.BrowserApp.GotoPage();
        });
        link.css("color", "blue");
        link.css("cursor", "pointer");
        link = $(this.lblDoorLink2.current.GetElement());
        link.on("click", () => {
            OS_1.OS.BrowserApp.ActivateOrCreate();
            OS_1.OS.BrowserApp.SetURL("doors.com");
            OS_1.OS.BrowserApp.GotoPage();
        });
        link.css("color", "blue");
        link.css("cursor", "pointer");
        this.windowObj.on("keydown", (key) => {
            if (key.keyCode == 32 && !this.keyIsDown) {
                this.btnMine.current.VisiblyClick();
                this.keyIsDown = true;
            }
        });
        this.windowObj.on("keyup", (key) => {
            if (key.keyCode == 32 && this.keyIsDown) {
                this.btnMine.current.VisiblyUnclick();
                this.mine();
                this.keyIsDown = false;
            }
        });
    }
}
exports.default = Pickaxe;
//# sourceMappingURL=Pickaxe.js.map
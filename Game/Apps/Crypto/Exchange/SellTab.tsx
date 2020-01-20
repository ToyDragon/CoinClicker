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
import AlphaWolfPage from "../../Browser/VirtualPages/AlphaWolf";

interface SellTabEvents{
}

interface SellTabProps {
    symbol: string;
    exchange: Exchange;
}

export class SellTab extends ObservableComponent<SellTabEvents, SellTabProps>{

    private btnSellAll: React.RefObject<ButtonWidget>;
    private btnSellTen: React.RefObject<ButtonWidget>;

    public componentDidMount(): void{
        this.props.exchange.on("tick", () => {
            this.UpdateButtons();
        });
        Wallet.AllWallets[this.props.symbol].on("afterChangeValue", () => {
            this.UpdateButtons();
        });
        this.UpdateButtons();
    }

    private UpdateButtons(): void{
        let rate = this.props.exchange.GetRate();
        let totalQty = Wallet.AllWallets[this.props.symbol].GetAmount();
        let cshAmt = rate * totalQty;
        let text = "Sell all " + this.props.symbol + " for " + Utils.DisplayNumber(cshAmt) + " CSH.";
        this.btnSellAll.current.SetTitle(text);

        let lowQty = Math.ceil(totalQty*0.1);
        cshAmt = rate * lowQty;
        text = "Sell " + Utils.DisplayNumber(lowQty) + " " + this.props.symbol + " for " + Utils.DisplayNumber(cshAmt) + " CSH.";
        this.btnSellTen.current.SetTitle(text);
    }

    private SellFraction(fraction: number): void{
        let rate = this.props.exchange.GetRate();
        let qty = Math.ceil(Wallet.AllWallets[this.props.symbol].GetAmount() * fraction);
        let cshAmt = rate * qty;

        let coinWallet = Wallet.AllWallets[this.props.symbol];
        if(coinWallet.GetAmount() > 0 && coinWallet.GetAmount() >= qty){
            let cshWallet = Wallet.AllWallets[Wallet.Symbol.CSH];
            coinWallet.ChangeValue(-qty);
            cshWallet.ChangeValue(cshAmt);
            this.UpdateButtons();
        }
    }

    public render(): JSX.Element{

        const half = {display: "inline-block", width: "50%", verticalAlign: "top", height: "100%"};
        const sellOptions = {backgroundColor:"#bfbfbf", style: {width: "142px", padding: "10px 10px", textAlign: "center", marginTop: "9px", height: "calc(100% - 39px)"}, fontSize:22};

        return (
            <React.Fragment>
                <div style={half}>
                    <ButtonWidget title="" ref={this.btnSellAll = React.createRef<ButtonWidget>()} onClick={()=>{this.SellFraction(1);}} {...sellOptions}/>
                </div>
                <div style={half}>
                    <ButtonWidget title="" ref={this.btnSellTen = React.createRef<ButtonWidget>()} onClick={()=>{this.SellFraction(0.1);}} {...sellOptions}/>
                </div>
            </React.Fragment>
        );
    }
}
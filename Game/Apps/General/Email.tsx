import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../App";
import Utils, { AssetLocation } from "../../Core/Utils"
import { IconDescriptor, AllIcons, IconDetails } from "../../Core/Icons";
import Observable from "../../Core/Observable";
import WebosWindow from "../../OS/Window";
import LabelWidget from "../../OS/Widgets/Label";
import IconWidget from "../../OS/Widgets/Icon";
import { OS } from "../../OS/OS";
import { Wallet } from "../Crypto/Wallet";
import GA from "../../Core/GA";
import { IHasSaveData } from "../../OS/StateController";

interface Sender{
    name: string;
    subtitle: string;
    icon: IconDescriptor;
}

interface Email{
    content: JSX.Element;
    subject: keyof typeof EmailData;
}

const EmailData = {
    "Welcome": (
        <div>
            Welcome to Coin Clicker! This is a game about mining and fake
            crypto currencies like Alpha Coin (ACN) to make Cash (CSH). Check out
            your other emails for help getting started, and consider joining
            the <a href="https://discord.gg/yADAGd8" target="_blank">discord</a>.
        </div>
    ),
    "Starting Out": (
        <div>
            <p style={{marginTop: 0}}>
                You can start mining Alpha Coin right away by clicking the "Alpha Pickaxe" app
                on your desktop. Click the button or press space bar to charge the bar,
                and when it fills up you will mine a block of Alpha Coin.
            </p>
            <p>
                You can track how much ACN or CSH you have in your wallet. Look for the Wallet app
                on your desktop, or click the wallet icon in your taskbar on the very bottom right of the screen.
            </p>
        </div>
    ),
    "Adblock": (
        <div>
            Most adblockers have a button to disable them for the current site
            only, <span style={{fontWeight: "bold"}}>please consider turning off adblock
            for this site</span>. Coin Clicker contains NO advertisements, we use google analytics
            to track which features engage users the most to guide development decisions. You can
            keep using adblock if you are paranoid, but disabling it will help us prioritize which
            parts of the game to work on going forward.
        </div>
    ),
    "Making Cash": (
        <div>
            <div>
                Now that you've got some ACN you can sell it at the Exchange for CSH. Open
                your the browser app on your desktop, navigate
                to <a href="#" data-destination="mojave.com">www.mojave.com</a>, and buy
                access to the Exchange app. You can use the Exchange app to sell your ACN
                for CSH at the current going rate.
            </div>
            <div>
                <img src="Assets/exchange.png" style={{width:"266px"}}/>
            </div>
            <div>
                <p>
                    A: The top graph section shows you how the price has changed over the last 10 minutes.
                </p>
                <p>
                    B: The bottom left section shows info about the going rate of ACN. The current rate is
                    the amount of CSH you will get per ACN sold right now. The average rate let's you know if
                    you're currently getting a good deal or not. The min and max rates are the
                    lowest and highest the rate has been in the last 10 minutes.
                </p>
                <p>
                    C: The bottom right section has buttons to sell all of your ACN for CSH, or if you just
                    need to top off you can sell 10% of your ACN for CSH.
                </p>
            </div>
        </div>
    ),
    "Auto-Miners": (
        <div>
            Auto-Miners can mine ACN without having click any pesky buttons. Purchase an auto-miner
            at <a href="#" data-destination="mojave.com">www.mojave.com</a>, and upgrades 
            at <a href="#" data-destination="alphawolf.org">www.alphawolf.org</a>. Upgrades
            can increase base block size, multiply total block size, decrease block duration,
            and divide total block duration. Combining all of these upgrades will lead to serious income!
        </div>
    ),
    // "Trading": (
    //     <div>
    //         Trading crypto currency can be extremely profitable if you take advantage of the
    //         advanced buy and sell features of the Exchange. Consider turning off auto-sell,
    //         and selling when the rate is high. If you're saving up for an expensive upgrade
    //         you can buy ACN while it's cheap, and flip it later for a profit.
    //     </div>
    // ),
    // "Orders": (
    //     <div>
    //         Exchange orders are a way to automatically buy ACN when the price drops low enough,
    //         or to automatically sell when it gets high enough. Use the slider in the top of the
    //         order tab to choose the rate to wait for, and use the fields below to choose the
    //         quantity. For buy orders the CSH well be held until the order is satisfied, or you
    //         cancel the order. Similarly for sell orders the ACN will be held until the order
    //         is complete or cancelled.
    //     </div>
    // ),
    "Doug": (
        <div>
            Doug is a game about mining resources, and selling them for profit! Control Doug
            with WASD or the arrow keys. Mining dirt and ore costs energy (NRG), and Doug can
            only carry so many ores in his inventory (INV). Take trips underground collecting
            resources and bring them back to the shop above ground. Purchase upgrades so you
            can dig deeper and carry more. Every 100 blocks or so is a green plutonium ore that
            will permanently increase the base block size of your miners, up to a
            maximum of +0.5 at 20 plutonium.
        </div>
    ),
    "Snake": (
        <div>
            Snake is a retro ASCII game where you try to eat as many apples as you can without
            crashing into your own tail. Control the snake with WASD or the arrow keys. While
            your snake is alive your miners will recieve a 25% mining speed bonus, and your
            high score will permanently add bonus coins to every mined block!
        </div>
    ),
    "Music": (
        <div>
            TODO: write info about the music player, and link to Corey's social media. 
        </div>
    ),
    "Online Stores": (
        <div>
            <p style={{marginTop: 0}}>
                There are various online stores where you can spend money to increase your rate of progression. 
            </p>
            <p>
                <a href="#" data-destination="doors.com">www.doors.com</a> sells upgrades for your Pickaxe app, so you can mine ACN coins faster.
            </p>
            <p>
                <a href="#" data-destination="mojave.com">www.mojave.com</a> sells automatic ACN miner applications.
            </p>
            <p>
                <a href="#" data-destination="alphawolf.org">www.alphawolf.org</a> sells upgrades for your automatic miner apps.
            </p>
            <p>
                <a href="#" data-destination="coal.io">www.coal.io</a> sells minigames that are great for killing time, and also boost the effectiveness of your automatic miners!
            </p>
        </div>
    ),
};

export class EmailApp extends App<{}> implements IHasSaveData{
    
    public GetStateKey(): string {
        return "Email";
    }

    public GetState(): { nState?: any; sState?: any; } {
        return {
            sState: this.sState
        };
    }

    public LoadState(_nState: any, sState: any): void {
        if(sState){
            this.sState = sState;
        }
    }

    public AfterStateLoaded(): void {
        for(let subject in EmailData){
            if(this.sState.shownEmails[subject]){
                this.AddEmailCore(subject as keyof typeof EmailData, true);
            }
        }

        this.AddEmail("Welcome");
        this.AddEmail("Starting Out");
    }

    private allEmails: Email[];
    private emailList: HTMLDivElement;
    private emailContent: HTMLDivElement;
    private activeIndex: number = -1;

    private sState = {
        readEmails: {} as {[subject: string]: "1" | "0"},
        shownEmails: {} as {[subject: string]: "1" | "0"},
    };

    public constructor(){
        super();

        this.allEmails = [];

        Wallet.AllWallets["ACN"].on("afterChangeValue", () => {
            if(Wallet.AllWallets["ACN"].GetAmount() >= 5){
                this.AddEmail("Making Cash");
            }
        });

        //OS.on<MojaveSharedDataKeys>("hasACNMiner0", () => { this.AddEmail("Auto-Miners"); });
        //OS.on<MojaveSharedDataKeys>("hasACNBuy", () => { this.AddEmail("Trading"); });
        //OS.on<MojaveSharedDataKeys>("hasACNBuyOrders", () => { this.AddEmail("Orders"); });

        OS.BrowserApp.Coal.dougItem.on("maxlevelreached", () => {
            this.AddEmail("Doug");
        });
        if(OS.BrowserApp.Coal.dougItem.GetLevel() === OS.BrowserApp.Coal.dougItem.GetMaxCount()){
            this.AddEmail("Doug");
        }

        OS.BrowserApp.Coal.snakeItem.on("maxlevelreached", () => {
            this.AddEmail("Snake");
        });
        if(OS.BrowserApp.Coal.snakeItem.GetLevel() === OS.BrowserApp.Coal.snakeItem.GetMaxCount()){
            this.AddEmail("Snake");
        }

        OS.BrowserApp.Coal.musicItem.on("maxlevelreached", () => {
            this.AddEmail("Music");
        });
        if(OS.BrowserApp.Coal.musicItem.GetLevel() === OS.BrowserApp.Coal.musicItem.GetMaxCount()){
            this.AddEmail("Music");
        }

        Wallet.AllWallets["CSH"].on("afterChangeValue", () => {
            if(Wallet.AllWallets["CSH"].GetAmount() >= 100){
                this.AddEmail("Online Stores");
            }
        });

		let emailElement = $(".item.email > .icon");
		emailElement.on("click", () => {
            this.ActivateOrCreate();
            for(let i = 0; i < this.allEmails.length; i++){
                if(!this.IsEmailRead(this.allEmails[i].subject)){
                    this.RenderEmail(i);
                    break;
                }
            }
        });

        OS.BrowserApp.Doors.firstUpgrade.on("maxlevelreached", () => {
            this.AddEmail("Auto-Miners");
        });
        if(OS.BrowserApp.Doors.firstUpgrade.GetLevel() == OS.BrowserApp.Doors.firstUpgrade.GetMaxCount()){
            this.AddEmail("Auto-Miners");
        }
        
        OS.StateController.AddTrackedObject(this);
    }

    public IsEmailRead(subject: string): boolean{
        return this.sState.readEmails[subject] === "1";
    }

    public AddAdblockEmail(): void{
        this.AddEmail("Adblock");
    }

    public AddEmail(subject: keyof typeof EmailData, silent?: boolean): void{
        if(this.sState.shownEmails[subject]){
            return;
        }
        this.AddEmailCore(subject, silent);
    }

    public AddEmailCore(subject: keyof typeof EmailData, silent?: boolean): void{
        this.sState.shownEmails[subject] = "1";
        let content = EmailData[subject];
        const email = {
            subject: subject,
            content: content
        };
        this.allEmails.push(email);
        if(!silent){
            OS.MakeToast("New Email!");
        }
        
        if(this.windowObj && this.emailList){
            const tempContainer = document.createElement("div");
            ReactDom.render(this.GetOneEmailDiv(email, this.allEmails.length - 1), tempContainer);
            const item = tempContainer.children[0];
            this.emailList.append(item);
            $(item).on("click", (e) => {
                let ix = $(e.currentTarget).attr("data-emailindex");
                this.RenderEmail(Number(ix));
            });

            if(!silent){
                this.RenderEmail(this.allEmails.length-1);
            }
        }

        this.UpdateEmailTaskbarButton();
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 472,
			height: 450,
			icon: AllIcons.Letter,
            title: "Email",
            openEvent: GA.Events.EmailOpen,
            closeEvent: GA.Events.EmailClose
        });
		
		this.DrawWindowContent();
    }

    public DrawWindowContent(): void{
		if(!this.windowObj) return;
		this.windowObj.contentDiv.empty();

		let rootDiv = $("<div></div>");
        rootDiv.css("padding", "4px");

        const listRef = React.createRef<HTMLDivElement>();
        const contentRef = React.createRef<HTMLDivElement>();
        
        ReactDom.render(
            [
            <style key="a" dangerouslySetInnerHTML={{__html: `
                .emailList{
                    position: absolute;
                    left: 0;
                    width: 157px;
                    height: 100%;
                    border-right: 2px solid white;
                }

                .email.active{
                    background-color: lightgray;
                }

                .email:hover, .email.active:hover{
                    background-color: white;
                }

                .emailContent{
                    position: absolute;
                    right: 0;
                    width: 299px;
                    height: 100%;
                    border-left: 2px solid #818180;
                    font-size: 18px;
                    line-height: 26px;
                    overflow-y: auto;
                }

                .emailContent > div{
                    padding: 4px 8px;
                }
                `}}></style>,
            <div key="b" className="emailList" ref={listRef}>{this.GetListEmails()}</div>,
            <div key="c" className="emailContent" ref={contentRef}></div>
            ]
        , this.windowObj.contentDiv[0]);

        this.windowObj.contentDiv.find(".email").on("click", (e) => {
            let ix = $(e.currentTarget).attr("data-emailindex");
            this.RenderEmail(Number(ix));
        });

        this.emailList = listRef.current;
        this.emailContent = contentRef.current;

        this.RenderEmail(0);
    }

    private RenderEmail(ix: number): void{
        if(ix === this.activeIndex) return;
        if(ix < 0 || ix >= this.allEmails.length) return;
        this.activeIndex = ix;
        const email = this.allEmails[ix];
        ReactDom.unmountComponentAtNode(this.emailContent);
        ReactDom.render(email.content, this.emailContent);
        GA.Event(GA.Events.EmailSelectEmail, {label: email.subject});
        this.sState.readEmails[email.subject] = "1";
        $(this.emailList).find(".email").removeClass("active");
        $(this.emailList).find(".email[data-emailindex=" + ix +"] > .unread").addClass("nodisp");
        $($(this.emailList).find(".email")[ix]).addClass("active");
        $(this.emailContent).find("a").on("click", (e) => {
            let destination = $(e.target).attr("data-destination");
            if(destination){
                OS.BrowserApp.ActivateOrCreate();
                OS.BrowserApp.SetURL(destination);
                OS.BrowserApp.GotoPage();
                e.preventDefault();
            }
        });
        $(this.emailContent).scrollTop(0);
        this.UpdateEmailTaskbarButton();
    }
    
	public UpdateEmailTaskbarButton(): void{
		let layoutElement = $(".item.email > .icon");

        for(let email of this.allEmails){
            if(!this.IsEmailRead(email.subject)){
                const icon = AllIcons.Letter.large.dark;
                layoutElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
                layoutElement.css("width", icon.width + "px");
                layoutElement.css("height", icon.height + "px");
                layoutElement.attr("title", "Unread Email");
                layoutElement.parent().removeClass("nodisp");
                return;
            }
        }

        layoutElement.css("background-image","");
        layoutElement.attr("title", "");
        layoutElement.parent().addClass("nodisp");
	}

    private GetListEmails(): JSX.Element[] {
        let eles = [];
        for(let i = 0; i < this.allEmails.length; i++){
            let email = this.allEmails[i];
            eles.push(this.GetOneEmailDiv(email, i));
        }

        return eles;
    }

    private GetOneEmailDiv(email: Email, index: number): JSX.Element{
        return (
            <div className="email" key={index} style={{padding: "4px"}} data-emailindex={index}>
                <LabelWidget title={email.subject} tooltip="Subject" />
                <div className={this.IsEmailRead(email.subject) ? "nodisp unread" : "unread"}>
                    <div style={{display:"inline-block"}}><IconWidget icon={AllIcons.Frog.small} /></div>
                    <div style={{display:"inline-block", width: "7px"}}></div>
                    <div style={{display:"inline-block", marginTop: "-3px"}}><LabelWidget title="Unread" tooltip="Unread" size={12} light={true}/></div>
                </div>
            </div>
        )
    }
}
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
import { MojaveSharedDataKeys } from "../Browser/VirtualPages/Mojave";
import { CoalSharedDataKeys } from "../Browser/VirtualPages/Coal";
import GA from "../../Core/GA";

interface Sender{
    name: string;
    subtitle: string;
    icon: IconDescriptor;
}

interface Email{
    content: JSX.Element;
    subject: keyof typeof EmailData;
    read?: boolean;
}

const EmailData = {
    "Welcome": (
        <div>
            Welcome to Coin Clicker! This is a game about mining and trading fake
            crypto currencies like Alpha Coin (ACN) to make Cash (CSH). Check out
            your other emails for help getting started, and consider joining
            the <a href="https://discord.gg/yADAGd8" target="_blank">discord</a>.
        </div>
    ),
    "Starting Out": (
        <div>
            You can start mining Alpha Coin right away by clicking the "Alpha Pickaxe" app
            on your desktop. Click the button or press space bar to charge the bar,
            and when it fills up you will mine a block of Alpha Coin. You'll start by
            getting one Alpha Coin per block you mine, once you sell your Alpha Coins for
            Cash you can purchase bonuses and multipliers from <a href="#" data-destination="doors.com">www.doors.com</a> to mine faster.
        </div>
    ),
    "Adblock": (
        <div>
            Most adblockers have a button to disable them for the current site only, 
            <span style={{fontWeight: "bold"}}>please consider turning off adblock
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
                access to the Exchange app. While the Exchange app is open it will
                automatically trade your ACN for CSH at the current market price.
            </div>
            <div>
                TODO: image of exchange
            </div>
            <div>
                The Exchange app contains three sections, the top graph section shows you how
                the price has changed over the last 10 minutes. The bottom left section shows
                info about the going rate of ACN. The current rate is the amount of
                CSH you will get per ACN sold right now. The average rate let's you know if
                you're currently getting a good deal or not. The min and max rates are the
                lowest and highest the rate has been in the last 10 minutes.
            </div>
        </div>
    ),
    "Auto-Miners": (
        <div>
            Auto-Miners will save you a lot of effort if you invest in them. They only mine
            while open, so make sure you keep them open all the time. Purchase upgrades for your miners 
            at  <a href="#" data-destination="alphawolf.org">www.alphawolf.org</a>. Upgrades
            can increase base block size, multiply total block size, decrease block duration,
            and divide total block duration. Combining all of these upgrades will lead to serious income!
        </div>
    ),
    "Trading": (
        <div>
            Trading crypto currency can be extremely profitable if you take advantage of the
            advanced buy and sell features of the Exchange. Consider turning off auto-sell,
            and selling when the rate is high. If you're saving up for an expensive upgrade
            you can buy ACN while it's cheap, and flip it later for a profit.
        </div>
    ),
    "Orders": (
        <div>
            Exchange orders are a way to automatically buy ACN when the price drops low enough,
            or to automatically sell when it gets high enough. Use the slider in the top of the
            order tab to choose the rate to wait for, and use the fields below to choose the
            quantity. For buy orders the CSH well be held until the order is satisfied, or you
            cancel the order. Similarly for sell orders the ACN will be held until the order
            is complete or cancelled.
        </div>
    ),
    "Doug": (
        <div>
            Doug is a game about mining resources, and selling them for profit! Control Doug
            with WASD or the arrow keys. Mining dirt and ore costs energy (NRG), and Doug can
            only carry so many ores in his inventory (INV). Take trips underground collecting
            resources and bring them back to the shop above ground. Purchase upgrades so you
            can dig deeper and carry more. Every 100 blocks or so is a green plutonium ore that
            will permanently increase the base block size of your miners by +0.1, up to a
            maximum of +2 at 20 plutonium.
        </div>
    ),
    "Snake": (
        <div>
            Snake is a retro ASCII game where you try to eat as many apples as you can without
            crashing into your own tail. Control the snake with WASD or the arrow keys. While
            your snake is alive your miners will recieve a 25% mining speed bonus, and your
            high score will permanently add bonus coins to every mined block! The max is 2 ACN
            added to the base size of every block at a high score of 40 apples.
        </div>
    ),
    "Online Stores": (
        <div>
            <div>
                There are various online stores where you can spend money to increase your rate of progression. 
            </div>
            <div>
                <a href="#" data-destination="mojave.com">www.mojave.com</a> sells automatic ACN miner applications, and Exchange upgrades.
            </div>
            <div>
                <a href="#" data-destination="doors.com">www.doors.com</a> sells upgrades for your Pickaxe app, so you can mine ACN coins faster.
            </div>
            <div>
                <a href="#" data-destination="alphawolf.org">www.alphawolf.org</a> sells upgrades for your automatic miner apps.
            </div>
            <div>
                <a href="#" data-destination="coal.io">www.coal.io</a> sells minigames that are great for killing time, and also boost the effectiveness of your automatic miners!
            </div>
        </div>
    ),
};

export class EmailApp extends App<{}>{

    private allEmails: Email[];
    private emailList: HTMLDivElement;
    private emailContent: HTMLDivElement;
    private hasEmail: {[subject: string]: boolean} = {};
    private activeIndex: number = -1;

    public constructor(){
        super();

        this.allEmails = [];

        this.AddEmail("Welcome");
        this.AddEmail("Starting Out");

        Wallet.AllWallets["ACN"].on("afterChangeValue", () => {
            if(Wallet.AllWallets["ACN"].amount >= 5){
                this.AddEmail("Making Cash");
            }
        });

        OS.on<MojaveSharedDataKeys>("hasACNMiner0", () => { this.AddEmail("Auto-Miners"); });
        OS.on<MojaveSharedDataKeys>("hasACNBuy", () => { this.AddEmail("Trading"); });
        OS.on<MojaveSharedDataKeys>("hasACNBuyOrders", () => { this.AddEmail("Orders"); });
        OS.on<CoalSharedDataKeys>("hasDigger", () => { this.AddEmail("Doug"); });
        OS.on<CoalSharedDataKeys>("hasSnake", () => { this.AddEmail("Snake"); });

        Wallet.AllWallets["CSH"].on("afterChangeValue", () => {
            if(Wallet.AllWallets["CSH"].amount >= 100){
                this.AddEmail("Online Stores");
            }
        });

        
		let emailElement = $(".item.email > .icon");
		emailElement.on("click", () => {
            this.ActivateOrCreate();
            for(let i = 0; i < this.allEmails.length; i++){
                if(!this.allEmails[i].read){
                    this.RenderEmail(i);
                    break;
                }
            }
		});
    }

    public AddAdblockEmail(): void{
        this.AddEmail("Adblock");
    }

    public AddEmail(subject: keyof typeof EmailData, silent?: boolean): void{
        if(this.hasEmail[subject]){
            return;
        }
        let content = EmailData[subject];
        if(this.hasEmail[subject]){
            return;
        }
        this.hasEmail[subject] = true;
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
                console.log("clicked hyper-email " + ix);
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
        email.read = true;
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
        this.UpdateEmailTaskbarButton();
    }
    
	public UpdateEmailTaskbarButton(): void{
		let layoutElement = $(".item.email > .icon");

        for(let email of this.allEmails){
            if(!email.read){
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
                <div className={!!email.read ? "nodisp unread" : "unread"}>
                    <div style={{display:"inline-block"}}><IconWidget icon={AllIcons.Frog.small} /></div>
                    <div style={{display:"inline-block", width: "7px"}}></div>
                    <div style={{display:"inline-block", marginTop: "-3px"}}><LabelWidget title="Unread" tooltip="Unread" size={12} light={true}/></div>
                </div>
            </div>
        )
    }
}
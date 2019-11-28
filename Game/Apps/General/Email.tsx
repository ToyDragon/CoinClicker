import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../App";
import Utils, { AssetLocation } from "../../Core/Utils"
import { IconDescriptor, AllIcons } from "../../Core/Icons";
import Observable from "../../Core/Observable";
import WebosWindow from "../../OS/Window";
import LabelWidget from "../../OS/Widgets/Label";
import IconWidget from "../../OS/Widgets/Icon";

interface Sender{
    name: string;
    subtitle: string;
    icon: IconDescriptor;
}

interface Email{
    content: JSX.Element;
    subject: string;
    sender: Sender;
    highPriority?: boolean;
    onOpen?: Function;
    read?: boolean;
}

export class EmailApp extends App<{}>{

    public static SenderJoffBuzzo: Sender = {
        icon: AllIcons.Frog,
        name: "Joff Buzzo",
        subtitle: "CEO and Founder"
    };

    public static SenderITHelper: Sender = {
        icon: AllIcons.Frog,
        name: "IT",
        subtitle: "Your helpful friend"
    };

    private allEmails: Email[];

    private emailList: HTMLDivElement;
    private emailContent: HTMLDivElement;

    public constructor(){
        super();

        this.allEmails = [];
        this.allEmails.push({
            sender: EmailApp.SenderJoffBuzzo,
            content: (
                <div>
                    <p>Welcome to the <span className="properNoun">Webos Crypto Exchange Coorporation</span>! I started this company in my garage in 2056, and have grown it to be worth over 943 trillion CSH. We have 52 multi-national mining offices with just under 700,000 coin exchange staff, of which you are the newest recruit. Blah blah blah.</p>
                    <p>World building</p>
                    <p>Call to action. Go read the other email from the IT staff.</p>
                </div>
            ),
            subject: "Welcome!"
        });
        
        this.allEmails.push({
            sender: EmailApp.SenderITHelper,
            content: (
                <div>
                    <p>Before you can get up and running you need to setup you <span className="properNoun">Webos Crypto Exchange Coorporation</span> personal computer.</p>
                    <p>World building</p>
                    <p>Call to action. Go to the website and buy the miner, and exchange. Maybe that's two steps with another email from like an exchange guy.</p>
                </div>
            ),
            subject: "PC Setup"
        });
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 450,
			height: 450,
			icon: AllIcons.Letter,
			title: "Email"
		});
		
		this.windowObj.on("close", function(){
			this.windowObj = null;
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
                    width: 135px;
                    height: 100%;
                    border-right: 2px solid white;
                }

                .email:hover{
                    background-color: white;
                }

                .emailContent{
                    position: absolute;
                    right: 0;
                    width: 299px;
                    height: 100%;
                    border-left: 2px solid #818180;
                }`}}></style>,
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
    }

    private RenderEmail(ix: number): void{
        if(ix < 0 || ix >= this.allEmails.length) return;
        ReactDom.unmountComponentAtNode(this.emailContent);
        ReactDom.render(this.allEmails[ix].content, this.emailContent);
    }

    private GetListEmails(): JSX.Element[] {
        let eles = [];
        for(let i = 0; i < this.allEmails.length; i++){
            let email = this.allEmails[i];
            let ele = (
                <div className="email" key={i} style={{padding: "4px"}} data-emailindex={i}>
                    <LabelWidget title={email.subject} tooltip="Subject" />
                    <div>
                        <div style={{display:"inline-block"}}><IconWidget icon={email.sender.icon.small} /></div>
                        <div style={{display:"inline-block", width: "7px"}}></div>
                        <div style={{display:"inline-block"}}><LabelWidget title={email.sender.name} tooltip="Sender" size={12} light={true}/></div>
                    </div>
                </div>
            );
            eles.push(ele);
        }

        return eles;
    }
}
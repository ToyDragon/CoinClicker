import App from "../App";
import * as ReactDom from "react-dom";
import * as React from "react";
import WebosWindow from "../../OS/Window";
import { AllIcons } from "../../Core/Icons";
import ButtonWidget from "../../OS/Widgets/Button";
import TextInputWidget from "../../OS/Widgets/TextInput";
import VirtualPage from "./VirtualPages/VirtualPage";
import AlphaWolfPage from "./VirtualPages/AlphaWolf";
import HomePage from "./VirtualPages/Home";
import NoPageFoundPage from "./VirtualPages/NoPageFound";
import MojavePage from "./VirtualPages/Mojave";
import CoalPage from "./VirtualPages/Coal";
import DebugPage from "./VirtualPages/Debug";
import DoorsPage from "./VirtualPages/Doors";
import Utils from "../../Core/Utils";
import GA from "../../Core/GA";

export default class Browser extends App<{}>{
    public prevtarget: string;
    public hist: string[];
    public addressField: TextInputWidget;
    public Doors: DoorsPage;
    public Coal: CoalPage;

    private availablePages: VirtualPage[];
    private activePage?: VirtualPage;
    private pageContent: JQuery;

    public constructor(){
        super();

        this.Doors = new DoorsPage();
        this.Coal = new CoalPage();
        this.availablePages = [
            new HomePage(),
            new AlphaWolfPage(),
            new MojavePage(),
            this.Coal,
            this.Doors
        ];

		if(Utils.DebugEnabled()){
            this.availablePages.push(new DebugPage());
        }

        this.availablePages.push(new NoPageFoundPage());
    }

    public CleanUp(): void{

    }

    public CreateWindow(): void{
        console.log("Creating browser window");
        this.windowObj = new WebosWindow({
            width: 500,
            height: 500,
            icon: AllIcons.Browser,
            title: "Web Browser",
            openEvent: GA.Events.BrowserOpen,
            closeEvent: GA.Events.BrowserClose
        });

        const contentRef = React.createRef<HTMLDivElement>();
        const textRef = React.createRef<TextInputWidget>();
        const btnHomeStyles = { width: "28px", height: "28px", marginTop: "0", marginBottom: "-4px", marginLeft: "0"};
        const btnGoStyles = { width: "28px", height: "28px", marginTop: "0", marginBottom: "-4px"};
        const btnIconStyles = { marginLeft: "-2px", marginTop: "-3px" };
        ReactDom.render(
            [
                <div className="browserNavBar" key="1">
                    <ButtonWidget icon={AllIcons.House} tooltip="go home" onClick={() => {this.GoHome()}} style={btnHomeStyles} iconStyle={btnIconStyles}/>
                    <TextInputWidget placeholder="Address" defaultValue="home.net" style={{"flexGrow": "1"}} ref={textRef} submit={()=>{this.GotoPage()}}/>
                    <ButtonWidget icon={AllIcons.Go} tooltip="go to page" onClick={() => {this.GotoPage()}} style={btnGoStyles} iconStyle={btnIconStyles}/>
                </div>,
                <div className="browserContent" key="2" ref={contentRef}></div>
            ]
        , this.windowObj.contentDiv[0])

        this.addressField = textRef.current;
        this.pageContent = $(contentRef.current);

        //this.windowObj.contentDiv.append(navBar);
        //this.windowObj.contentDiv.append(this.pageContent);

        this.hist = [];

        this.GotoPage();
    }

    public SetURL(url: string): void{
        this.addressField.inputEle.val(url);
    }

    public GotoPage(): void{
        console.log("Navigating browser");
        let target = this.addressField.inputEle.val().toString().replace(/[^a-zA-Z./]/g,"");
        if(this.prevtarget)
        {
            this.hist.push(this.prevtarget);
        }

        if(this.activePage)
        {
            this.activePage.Cleanup();
        }
        ReactDom.unmountComponentAtNode(this.pageContent[0]);
        this.pageContent.empty();
        this.activePage = null;
        for(let page of this.availablePages)
        {
            if(page.MatchesAddress(target))
            {
                this.activePage = page;
                page.Render(this.pageContent);
                this.PageRendered();
                break;
            }
        }

        if(this.activePage){
            console.log("Found page to render");
        }else{
            GA.Event(GA.Events.BrowserNavigate, {label: this.activePage.GetURL()})
            console.log("No page found for \"" + target + "\"");
        }
    }

    private PageRendered(): void{
        this.pageContent.find("a").on("click",(e) => {
            var dest = $(e.target).attr("data-destination");
            if(dest){
                this.addressField.inputEle.val(dest);
                this.GotoPage();
                e.preventDefault();
            }
        });
    }

    public GoHome(): void{
        this.addressField.inputEle.val("home.net");
        this.GotoPage();
    }

    public GoBack(): void{
        console.log(JSON.stringify(this.hist));
        var page = this.hist.pop();
        if(!page){
            page = "home.net";
        }
        console.log("to " + page);
        this.addressField.inputEle.val(page);
        this.GotoPage();
        this.hist.pop();
    }

}
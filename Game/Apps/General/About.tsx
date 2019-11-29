import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../App";
import Utils, { AssetLocation } from "../../Core/Utils"
import { IconDescriptor, AllIcons } from "../../Core/Icons";
import Observable from "../../Core/Observable";
import WebosWindow from "../../OS/Window";
import LabelWidget from "../../OS/Widgets/Label";
import IconWidget from "../../OS/Widgets/Icon";

interface Events{}

export class AboutApp extends App<Events>{

    public constructor(){
        super();
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 400,
			height: 300,
			icon: AllIcons.Frog,
			title: "About"
		});
		
		this.DrawWindowContent();
    }

    public DrawWindowContent(): void{
		if(!this.windowObj) return;
        this.windowObj.contentDiv.empty();
        
        const third = {
            width: "33%",
            display: "inline-block"
        };
        
        ReactDom.render(
            <React.Fragment>
                <div style={{fontSize:"20px", padding: "5px"}}>
                    <div style={{paddingLeft:"105px", marginBottom: "5px"}}>
                        <IconWidget icon={AllIcons.Frog.large} /><div style={{display: "inline-block", verticalAlign: "top", marginTop: "7px", marginLeft: "5px"}}>Coin Clicker</div>
                    </div>
                    <div style={{marginBottom: "10px"}}>
                        Coin Clicker is a work in progress and is changing frequently.
                    </div>
                    <div>
                        Visit the <a href="https://trello.com/b/teDiqgg5/coin-clicker" target="_blank">trello board</a> for development plans,
                        checkout the code on <a href="https://github.com/ToyDragon/CoinClicker" target="_blank">GitHub</a>, and ask questions
                        in <a href="https://discord.gg/yADAGd8" target="_blank">Discord</a>.
                    </div>
                    <div style={{position: "absolute", bottom: "15px", left: "0", width: "100%"}}>
                        <div style={third}><a href="https://github.com/ToyDragon/CoinClicker" target="_blank" className="githubLogo"></a></div>
                        <div style={third}><a href="https://discord.gg/yADAGd8" target="_blank" className="discordLogo"></a></div>
                        <div style={third}><a href="https://trello.com/b/teDiqgg5/coin-clicker" target="_blank" className="trelloLogo"></a></div>
                    </div>
                </div>
            </React.Fragment>
        , this.windowObj.contentDiv[0]);
    }
}
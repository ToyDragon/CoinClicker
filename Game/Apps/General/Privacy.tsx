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

export class PrivacyApp extends App<Events>{

    public constructor(){
        super();
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 400,
			height: 300,
			icon: AllIcons.Frog,
			title: "Privacy"
		});
		
		this.DrawWindowContent();
    }

    public DrawWindowContent(): void{
		if(!this.windowObj) return;
        this.windowObj.contentDiv.empty();
        
        ReactDom.render(
            <React.Fragment>
                <div style={{fontSize:"20px", padding: "5px"}}>
                    <div style={{paddingLeft:"105px", marginBottom: "5px"}}>
                        <IconWidget icon={AllIcons.Frog.large} /><div style={{display: "inline-block", verticalAlign: "top", marginTop: "7px", marginLeft: "5px"}}>Coin Clicker</div>
                    </div>
                    <div style={{marginBottom: "10px"}}>
                        TODO: write a privacy policy.
                    </div>
                </div>
            </React.Fragment>
        , this.windowObj.contentDiv[0]);
    }
}
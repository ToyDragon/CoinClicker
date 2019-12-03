import * as ReactDom from "react-dom";
import * as React from "react";
import App from "../App";
import Utils, { AssetLocation } from "../../Core/Utils"
import { IconDescriptor, AllIcons } from "../../Core/Icons";
import Observable from "../../Core/Observable";
import WebosWindow from "../../OS/Window";
import LabelWidget from "../../OS/Widgets/Label";
import IconWidget from "../../OS/Widgets/Icon";
import OptionSelectWidget from "../../OS/Widgets/OptionSelect";
import { OS } from "../../OS/OS";
import ButtonWidget from "../../OS/Widgets/Button";
import Popup, { PromptType } from "../../OS/Popup";

interface Events{}

export class SettingsApp extends App<Events>{

    private selectionList: React.RefObject<OptionSelectWidget>;
    private deletePopup: Popup;

    public constructor(){
        super();
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			width: 400,
			height: 300,
			icon: AllIcons.Frog, //TODO cog icon?
			title: "Settings"
        });
        
        this.windowObj.on("close", () => {
            if(this.deletePopup){
                this.deletePopup.Cancel();
            }
        });
		
		this.DrawWindowContent();
    }

    public DrawWindowContent(): void{
		if(!this.windowObj) return;
        this.windowObj.contentDiv.empty();

        const options = [
            {
                title: "Save 1",
                tooltip: "Save 1",
                icon: AllIcons.Frog
            },
            {
                title: "Save 2",
                tooltip: "Save 2",
                icon: AllIcons.Frog
            },
            {
                title: "Save 3",
                tooltip: "Save 3",
                icon: AllIcons.Frog
            },
            {
                title: "Save 4",
                tooltip: "Save 4",
                icon: AllIcons.Frog
            },
            {
                title: "Save 5",
                tooltip: "Save 5",
                icon: AllIcons.Frog
            },
        ];
        
        ReactDom.render(
            <React.Fragment>
                <div style={{fontSize:"20px", padding: "5px"}}>
                    <div style={{paddingLeft:"105px", marginBottom: "5px"}}>
                        <IconWidget icon={AllIcons.Frog.large} /><div style={{display: "inline-block", verticalAlign: "top", marginTop: "7px", marginLeft: "5px"}}>Settings</div>
                    </div>
                    <div style={{marginBottom: "10px"}}>
                        Active Save Slot:
                        <OptionSelectWidget ref={this.selectionList = React.createRef<OptionSelectWidget>()} defaultIndex={OS.StateController.GetCurrentSaveKey()}
                            items={options} width={145} height={24} selectionChanged={()=>{this.SelectionChanged();}} />
                    </div>
                    <div style={{marginBottom: "10px"}}>
                        <ButtonWidget title="Delete Save" onClick={()=>{
                            if(this.deletePopup){
                                this.deletePopup.Activate();
                            }else{
                                this.deletePopup = new Popup({
                                    accept: () => {OS.StateController.ClearSaveData();},
                                    cancel: () => {this.deletePopup = null;},
                                    title: "Delete?",
                                    text: "Are you sure you want to delete your save data?",
                                    type: PromptType.yesno,
                                    parent: this.windowObj
                                });
                            }
                        }} />
                    </div>
                </div>
            </React.Fragment>
        , this.windowObj.contentDiv[0]);
    }

    private SelectionChanged(): void{
        OS.StateController.SwitchSaveKey(this.selectionList.current.selectedIndex);
    }
}
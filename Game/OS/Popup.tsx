import * as ReactDom from "react-dom";
import * as React from "react";
import WebosWindow from "./Window";
import { AllIcons, IconDescriptor } from "../Core/Icons";
import ButtonWidget from "./Widgets/Button";
import TextInputWidget from "./Widgets/TextInput";
import LabelWidget from "./Widgets/Label";

interface PopupOptions{
    title: string;
    type: PromptType;
    icon?: IconDescriptor;

    text?: string;
    content?: JSX.Element;
    parent?: WebosWindow;

    accept?: Function;
    cancel?: Function;

    actionName?: string;
    valueLabel?: string;
    placeholder?: string;
    defaultText?: string;
    rightOffset?: string;
}

export enum PromptType{
    notification,
    text,
    yesno
}

export default class Popup{

    private options: PopupOptions;
    private done: boolean;
    private textInputRef: React.RefObject<TextInputWidget>;
    private window: WebosWindow;

    public constructor(options: PopupOptions){
        this.options = options;

        this.done = false;
        this.window = new WebosWindow({
            innerWidth: 350,
            height: 160,
            title: options.title,
            icon: options.icon || AllIcons.Letter,
            parent: options.parent
        });

        let contentDiv = $("<div></div>");
        contentDiv.css("position", "relative");
        contentDiv.css("width", "100%");
        contentDiv.css("height", "100%");
        let content: JSX.Element[] = [];
        this.textInputRef = React.createRef<TextInputWidget>();
        if(this.options.content){
            content.push(this.options.content);
        }else{
            content.push(<div key="message"><LabelWidget title={options.text}/></div>);
        }
        if(options.type === PromptType.text){
            content.push(<div key="textinput" style={{width:"100%"}}>
                <TextInputWidget defaultValue={this.options.defaultText} placeholder={this.options.placeholder} ref={this.textInputRef} width={342} backgroundColor="#FFFFFF" />
            </div>);
        }

        if(options.type === PromptType.notification){
            content.push(<div key="actions" style={{position:"absolute", bottom: 0, right: this.options.rightOffset}}>
                <ButtonWidget title={options.actionName || "OK"} onClick={() => { this.Accept(); this.window.CloseWindow(false); }} />
            </div>);
        }else{
            //all types other than notification yet accept/cancel buttons
            content.push(<div key="actions" style={{position:"absolute", bottom: 0, right: this.options.rightOffset}}>
                <ButtonWidget title={options.actionName || "Accept"} onClick={() => { this.Accept(); this.window.CloseWindow(false); }} />
                <ButtonWidget title="Cancel" onClick={() => { this.Cancel(); this.window.CloseWindow(false); }} />
            </div>);
        }
        ReactDom.render(
            content
        , contentDiv[0]);
        this.window.contentDiv.append(contentDiv);
        this.window.on("close", () => { this.Cancel(); });
        this.window.ActivateWindow(false);
    }

    public IsClosed(): boolean{
        return !this.window || this.window.closed;
    }

    public Activate(): void{
        if(this.window && !this.window.closed){
            this.window.ActivateWindow(false);
        }
    }

    private Cancel(): void{
        if(this.done) return;
        this.done = true;
        if(this.options.cancel){
            this.options.cancel();
        }
    }

    private Accept(): void{
        if(this.done) return;
        this.done = true;
        if(this.options.accept){
            let value = null;

            if(this.options.type === PromptType.text){
                value = this.textInputRef.current.GetValue();
            }

            this.options.accept(value);
        }
    }
}
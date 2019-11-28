import Widget from "./Widget";
import { IconDescriptor, IconDetails, AllIcons } from "../../Core/Icons";
import { AssetLocation } from "../../Core/Utils";
import * as React from "react";

interface ButtonOptions{
    contentWidth?: number;
    icon?: IconDescriptor;
    small?: boolean;
    orientation?: "horizontal" | "vertical";
    title?: string;
    onClick?: Function;
    fontSize?: number;
    backgroundColor?: string;
    style?: {[property: string]: string};
    iconStyle?: React.CSSProperties;
    tooltip?: string;
    toggle?: boolean;
    toggleValue?: boolean;
}

interface Events{
    click;
}

export default class ButtonWidget extends Widget<ButtonOptions, Events>{
    private options: ButtonOptions;
    private rootRef: React.RefObject<HTMLDivElement>;
    private titleRef: React.RefObject<HTMLDivElement>;
    private iconDivRef: React.RefObject<HTMLDivElement>;
    private enabled: boolean;
    private toggleValue: boolean;

    public constructor(options: ButtonOptions){
        super(options);
        if(options.toggle){
            this.toggleValue = !!options.toggleValue;
        }
        this.options = options;
        this.enabled = true;
    }

    public VisiblyClick(): void{
        const root = $(this.rootRef.current);
        
        root.removeClass("borderGroove");
        root.addClass("borderRidge");
    }

    public VisiblyUnclick(): void{
        const root = $(this.rootRef.current);

        root.addClass("borderGroove");
        root.removeClass("borderRidge");
    }

    public componentDidMount(): void{
        const root = $(this.rootRef.current);

        root.on("click", (event: JQuery.Event) => {
            if(this.enabled){
                if(this.options.onClick){
                    this.options.onClick(event);
                }
                if(this.options.toggle){
                    this.SetToggleValue(!this.toggleValue);
                }
                this.trigger("click", event);
            }
        });

        root.on("mousedown", (e: JQueryMouseEventObject) => {
            if(this.enabled && e.which === 1){ //1 is left mouse button
                if(!this.options.toggle){
                    root.removeClass("borderGroove");
                    root.addClass("borderRidge");
                }
            }
        });

        root.on("mouseup mouseout", () => {
            if(!this.options.toggle){
                root.addClass("borderGroove");
                root.removeClass("borderRidge");
            }
        });

        if(this.options.toggle){
            if(this.toggleValue){
                this.UpdateIcon(AllIcons.Check);
            }else{
                this.UpdateIcon(null);
            }
        }
    }

    public UpdateToggleIcon(): void{
        if(this.toggleValue){
            this.UpdateIcon(AllIcons.Check);
        }else{
            this.UpdateIcon(null);
        }
    }

    public SetToggleValue(value: boolean): void{
        this.toggleValue = value;
        this.UpdateToggleIcon();
    }

    public GetToggleValue(): boolean{
        return this.toggleValue;
    }

    private UpdateIcon(icon: IconDescriptor | null): void{
        let newUrl = "";
        if(icon){
            let sizedIcon: IconDetails;
            if(this.options.small){
                sizedIcon = icon.small.dark;
            }else{
                sizedIcon = icon.large.dark;
            }
            newUrl = "url(\"" + AssetLocation + sizedIcon.id + "\")";
        }

        if(this.iconDivRef.current){
            console.log(this.iconDivRef.current.style["backgroundImage"] + " changed to " + newUrl);
            this.iconDivRef.current.style["backgroundImage"] = newUrl;
        }
    }

    public SetTitle(title: string): void{
        $(this.titleRef.current).text(title);
    }

    public SetEnabled(enabled: boolean): void{
        this.enabled = enabled;
        if(enabled){
            $(this.rootRef.current).removeClass("disabled");
        }else{
            $(this.rootRef.current).addClass("disabled");
        }
    }

    public render(): JSX.Element {
        const containerStyles = {};
        containerStyles["margin"] = "auto";
        if(this.options.contentWidth){
            containerStyles["width"] = this.options.contentWidth;
        }

        const titleStyles = {};
        if(this.options.orientation == "horizontal"){
            titleStyles["display"] = "inline-block";
            titleStyles["fontSize"] = "22px";
            titleStyles["position"] = "relative";
            titleStyles["bottom"] = "6px";
        }

        if(this.options.fontSize){
            titleStyles["fontSize"] = this.options.fontSize + "px";
        }

        const coreStyles = {};
        for(let option in this.options.style){
            coreStyles[option] = this.options.style[option];
        }
        if(this.options.backgroundColor){
            coreStyles["backgroundColor"] = this.options.backgroundColor;
        }
        
        let icon: IconDetails | null = null;
        let iconStyles: React.CSSProperties = {};
        let iconDescriptor = this.options.icon;
        if(this.options.toggle){
            iconDescriptor = AllIcons.Check;
        }
        if(iconDescriptor){
            if(this.options.small){
                icon = iconDescriptor.small.dark;
            }else{
                icon = iconDescriptor.large.dark;
            }
            iconStyles["backgroundImage"] = "url(\"" + AssetLocation + icon.id + "\")";
            iconStyles["width"] = icon.width;
            iconStyles["height"] = icon.height;
            if(this.options.iconStyle){
                for(let prop in this.options.iconStyle){
                    iconStyles[prop] = this.options.iconStyle[prop];
                }
            }
        }

        if(this.options.toggle){
            coreStyles["paddingTop"] = "0";
            coreStyles["position"] = "relative";
            coreStyles["top"] = "2px";
            iconStyles["margin"] = "-4px -4px -2px -4px";
        }

        this.rootRef = React.createRef<HTMLDivElement>();
        this.titleRef = React.createRef<HTMLDivElement>();
        this.iconDivRef = React.createRef<HTMLDivElement>();

        return (
            <div className="button borderGroove widgetButton" ref={this.rootRef} style={coreStyles}>
                <div style={containerStyles}>
                    {[
                        icon && <div className="icon" ref={this.iconDivRef} style={iconStyles} key="1"></div>,
                        <div ref={this.titleRef} className="title" style={titleStyles} key="2" title={this.options.tooltip}>{this.options.title}</div>
                    ]}
                </div>
            </div>
        );
    }
}
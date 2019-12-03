import Widget from "./Widget";
import { IconDetails, IconLightAndDark } from "../../Core/Icons";
import { AssetLocation } from "../../Core/Utils";
import * as React from "react";

interface IconOptions{
    icon: IconLightAndDark;
    tooltip?: string;
    small?: boolean;
    light?: boolean;
    onClick?: Function;
}

export default class IconWidget extends Widget<IconOptions, {}>{

    private options: IconOptions;
    private iconRef: React.RefObject<HTMLDivElement>;

    public constructor(options: IconOptions){
        super(options);
        this.options = options;
    }

    public SetIcon(icon: IconLightAndDark): void{
        const ele = $(this.iconRef.current);
        if(icon){
            ele.css("background-image", "url(\"" + AssetLocation + icon.dark.id + "\")");
            ele.css("width", icon.dark.width + "px");
            ele.css("height", icon.dark.height + "px");
        }else{
            ele.css("background-image", "");
        }
    }

    public render(): JSX.Element{
        let styles = {
            backgroundImage: "url(\"" + AssetLocation + this.options.icon.dark.id + "\")",
            width: this.options.icon.dark.width,
            height: this.options.icon.dark.height,
        };
        this.iconRef = React.createRef<HTMLDivElement>();
        return <div className="icon" title={this.options.tooltip || ""} style={styles} ref={this.iconRef}></div>;
    }

    public componentDidMount(): void{
        $(this.iconRef.current).on("click", () => {
            if(this.options.onClick){
                this.options.onClick();
            }
        });
    }
}
import Widget from "./Widget";
import * as React from "react";

interface LabelOptions{
    title: string;
    tooltip?: string;
    color?: string;
    margin?: number;
    size?: number;
    light?: boolean;
    style?: {[property: string]: string};
}

export default class LabelWidget extends Widget<LabelOptions, {}>{

    private options: LabelOptions;
    private labelRef: React.RefObject<HTMLDivElement>;

    public constructor(options: LabelOptions){
        super(options);
        this.options = options;
    }

    public GetElement(): HTMLDivElement{
        return this.labelRef.current;
    }

    public SetTitle(title: string): void{
        this.labelRef.current.innerText = title;
    }

    public render(): JSX.Element{
        const styles = {};
        if(this.options.color){
            styles["color"] = this.options.color;
        }
        if(this.options.margin){
            styles["margin"] = this.options.margin + "px";
        }
        if(this.options.size){
            styles["fontSize"] = this.options.size;
        }
        if(this.options.light){
            styles["color"] = "gray";
        }
        for(let option in this.options.style){
            styles[option] = this.options.style[option];
        }
        this.labelRef = React.createRef<HTMLDivElement>();
        return (<div className="label" style={styles} title={this.options.tooltip || ""} ref={this.labelRef}>{this.options.title}</div>);
    }
}
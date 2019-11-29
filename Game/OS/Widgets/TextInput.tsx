import Widget from "./Widget";
import * as React from "react";

interface TextInputOptions{
    width?: number;
    defaultValue?: string;
    placeholder?: string;
    requireNumbers?: boolean;
    noDecimal?: boolean;
    style?: {[key: string]: string};
    fontSize?: number;
    backgroundColor?: string;
    rightAlign?: boolean;
    disabled?: boolean;
    submit?: Function;
}

interface Events{
    changed;
}

export default class TextInputWidget extends Widget<TextInputOptions, Events>{

    public inputEle: JQuery;

    private inputRef: React.RefObject<HTMLInputElement>;
    private options: TextInputOptions;

    public constructor(options: TextInputOptions){
        super(options);
        this.options = options;
    }

    private AfterChange(): void{
        if(this.options.requireNumbers){
            let numVal = $(this.inputRef.current).val() + "";
            let expectedVal = parseInt(numVal) || 0;
            if(isNaN(expectedVal)){
                expectedVal = 0;
            }
            if(this.options.noDecimal){
                expectedVal = Math.floor(expectedVal);
            }
            if(numVal !== expectedVal.toString()){
                $(this.inputRef.current).val(expectedVal);
            }
        }
        this.trigger("changed");
    }

    public SetValue(newValue: string): void{
        $(this.inputRef.current).val(newValue);
        this.AfterChange();
    }

    public SetDisabled(disabled: boolean): void{
        if(disabled){
            this.inputRef.current.setAttribute("disabled", "");
        }else{
            this.inputRef.current.removeAttribute("disabled");
        }
    }

    public GetValue(): string{
        return this.inputEle.val() + "";
    }

    public render(): JSX.Element {
        const styles: any = {};
        const inputStyles: any = {};
        if(this.options.width){
            styles["width"] = this.options.width + "px";
        }

        if(this.options.fontSize){
            styles["height"] = (this.options.fontSize + 9) + "px";
            inputStyles["fontSize"] = this.options.fontSize;
        }

        if(this.options.backgroundColor){
            styles["backgroundColor"] = this.options.backgroundColor;
        }

        if(this.options.style){
            for(const field in this.options.style){
                styles[field] = this.options.style[field];
            }
        }

        if(this.options.rightAlign){
            inputStyles["textAlign"] = "right";
        }

        this.inputRef = React.createRef<HTMLInputElement>();

        return (
            <div className="textInput borderRidge" style={styles}>
                <input ref={this.inputRef} type="text" style={inputStyles} spellCheck={false}/>
                <div className={"inputLabel " + (this.options.rightAlign ? "right" : "")}>{this.options.placeholder}</div>
            </div>
        );
    }

    public componentDidMount(): void{
        this.inputEle = $(this.inputRef.current);
        this.inputEle.val(this.options.defaultValue);
        this.inputEle.attr("placeholder", this.options.placeholder);        
        this.inputEle.on("keyup", (e) => {
            this.AfterChange();
            if(e.which === 13){
                if(this.options.submit){
                    this.options.submit();
                }
            }
        });
        if(this.options.disabled){
            this.SetDisabled(true);
        }
    }
}
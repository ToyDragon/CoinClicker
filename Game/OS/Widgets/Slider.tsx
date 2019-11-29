import Widget from "./Widget";
import * as React from "react";
import Utils from "../../Core/Utils";

interface SliderOptions{
    min: number;
    max: number;
    suffix: string;
    defaultValue?: number;
    label: string;
    tooltip?: string;
}

interface Events{
    changed;
}

export default class SliderWidget extends Widget<SliderOptions, Events>{

    private options: SliderOptions;
    private barRef: React.RefObject<HTMLDivElement>;
    private valueDisplayRef: React.RefObject<HTMLSpanElement>;
    private value: number;
    private minAllowedValue: number | null;
    private maxAllowedValue: number | null;
    private outOfRange: boolean;

    public constructor(options: SliderOptions){
        super(options);
        this.options = options;
    }

    public GetValue(): number{
        return this.value;
    }

    public GetOutOfRange(): boolean{
        return !!this.outOfRange;
    }

    public SetMinAllowedValue(min: number | null) : void{
        this.minAllowedValue = min;
        this.CheckRange();
    }

    public SetMaxAllowedValue(max: number | null) : void{
        this.maxAllowedValue = max;
        this.CheckRange();
    }

    private CheckRange(): void{
        this.outOfRange = false;
        if(this.minAllowedValue !== null && this.value <= this.minAllowedValue){
            this.outOfRange = true;
        }
        if(this.maxAllowedValue !== null && this.value >= this.maxAllowedValue){
            this.outOfRange = true;
        }

        if(this.outOfRange){
            $(this.valueDisplayRef.current).addClass("error");
        }else{
            $(this.valueDisplayRef.current).removeClass("error");
        }
    }

    public render(): JSX.Element{
        this.barRef = React.createRef<HTMLDivElement>();
        this.valueDisplayRef = React.createRef<HTMLSpanElement>();
        return (
            <div className="slider" title={this.options.tooltip}>
                <div className="bar borderGroove" ref={this.barRef}></div>
                <div className="horizontalbar"></div>
                <div className="valueDisplay"><span className="labelDisplay">{this.options.label}</span> <span ref={this.valueDisplayRef}></span></div>
            </div>
        );
    }

    public componentDidMount(): void{
        const barEle = $(this.barRef.current);
        let startX = -1, startOffset = -1;
        let dragging = false;
        barEle.on("mousedown", (event) => {
            startX = event.pageX;
            startOffset = barEle.offset().left - barEle.parent().offset().left;
            dragging = true;
        });

        $(document).on("mouseup", () => {
            dragging = false;
        });

        $(document).on("mousemove mousedrag", (event) => {
            if(dragging){
                let max = barEle.parent().innerWidth() - barEle.outerWidth();
                let newOffset = startOffset + (event.pageX - startX);
                if(newOffset < 0){
                    newOffset = 0;
                }else if(newOffset > max){
                    newOffset = max;
                }
                barEle.css("margin-left", newOffset + "px");

                let percentage = newOffset / max;
                this.value = percentage * (this.options.max - this.options.min) + this.options.min;
                $(this.valueDisplayRef.current).text(Utils.DisplayNumber(this.value) + this.options.suffix);
                this.CheckRange();

                this.trigger("changed");
            }
        });

        let max = 147; //lol shouldn't hard code this width
        let percentage = 0.5;
        if(this.options.defaultValue){
            percentage = this.options.defaultValue;
        }
        let newOffset = Math.floor(percentage * max);
        console.log("Start offset: " + percentage + " : " + newOffset);
        barEle.css("margin-left", newOffset + "px");
        this.value = percentage * (this.options.max - this.options.min) + this.options.min;
        $(this.valueDisplayRef.current).text(Utils.DisplayNumber(this.value) + this.options.suffix);
        this.CheckRange();
    }
}
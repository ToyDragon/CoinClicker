import Widget from "./Widget";
import * as React from "react";

interface LoadingBarOptions{
    sparCount?: number;
    totalDuration?: number;
    triggerPoints?: TriggerPoint[];
    noAutoStart?: boolean;
    style?: React.CSSProperties;
}

export interface TriggerPoint{
    value: number;
    complete: Function;
    pause?: boolean;
};
type BarFrame = {properties: object, duration: number};

export default class LoadingBarWidget extends Widget<LoadingBarOptions, {}>{

    public totalDuration: number;

    private blueBar: React.RefObject<HTMLDivElement>;
    private triggerPoints: TriggerPoint[];
    private frames: BarFrame[];
    private currentFrame: number;
    private cancelled: boolean;
    private options: LoadingBarOptions;

    public constructor(options: LoadingBarOptions){
        super(options);
        this.options = options;

        this.totalDuration = options.totalDuration || 1000;
        this.UpdateTriggerPoints(options.triggerPoints);
        this.currentFrame = -1;
    }

    public render(): JSX.Element{
        this.blueBar = React.createRef<HTMLDivElement>();
        let spars: JSX.Element[] = [];
        
        for(var i = 0; i < (this.options.sparCount || 10); i++){
            spars.push(<div className="spar" key={i}></div>)
        }
        
        return (
            <div className="loadingBar boarderRidge" style={this.options.style}>
                <div className="blueBar" style={{right: "100%"}} ref={this.blueBar}></div>
                {spars}
            </div>
        );
    }

    public componentDidMount(): void{
        if(!this.options.noAutoStart){
            this.NextFrame();
        }
    }

    public Restart(): void{
        $(this.blueBar.current).css("right","100%");
        this.currentFrame = -1;
    }

    public Cancel(): void{
        this.cancelled = true;
    }

    public FrameComplete(frameIndex: number): void{
        if(this.cancelled) return;
        let triggerPoint = this.triggerPoints[frameIndex];
        if(triggerPoint.complete){
            triggerPoint.complete();
        }
        if(!triggerPoint.pause && frameIndex < this.triggerPoints.length - 1){
            this.NextFrame();
        }
    }

    public NextFrame(): void{
        if(this.currentFrame === this.triggerPoints.length - 1){
            this.Restart();
        }
        $(this.blueBar.current).finish();
        this.currentFrame++;
        const frameAnchor = this.currentFrame;
        var frame = this.frames[frameAnchor];
        $(this.blueBar.current).animate(frame.properties, {
            duration: frame.duration,
            complete: () => { this.FrameComplete(frameAnchor); },
            easing: "linear"
        });
    }

    public UpdateTriggerPoints(triggerPoints): void{
        this.triggerPoints = triggerPoints || [];
        if(this.triggerPoints.length == 0 || this.triggerPoints[this.triggerPoints.length-1].value != this.totalDuration){
            this.triggerPoints.push({
                value: this.totalDuration,
                complete: null
            });
        }
        this.UpdateFrames();
    }

    public UpdateFrames(): void{
        this.frames = [];
        let currentEnd = 0;
        for(let i = 0; i < this.triggerPoints.length; i++){
            let duration = this.triggerPoints[i].value - currentEnd;
            currentEnd = this.triggerPoints[i].value;
            let percentage = Math.floor((1 - currentEnd / this.totalDuration) * 100);
            this.frames.push({
                properties: {
                    right: percentage + "%",
                },
                duration: duration
            });
        }
    }
}
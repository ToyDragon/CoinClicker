"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const React = require("react");
;
class LoadingBarWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.options = options;
        this.totalDuration = options.totalDuration || 1000;
        this.UpdateTriggerPoints(options.triggerPoints);
        this.currentFrame = -1;
    }
    render() {
        this.blueBar = React.createRef();
        let spars = [];
        for (var i = 0; i < (this.options.sparCount || 10); i++) {
            spars.push(React.createElement("div", { className: "spar", key: i }));
        }
        return (React.createElement("div", { className: "loadingBar boarderRidge" },
            React.createElement("div", { className: "blueBar", style: { right: "100%" }, ref: this.blueBar }),
            spars));
    }
    componentDidMount() {
        if (!this.options.noAutoStart) {
            this.NextFrame();
        }
    }
    Restart() {
        $(this.blueBar.current).css("right", "100%");
        this.currentFrame = -1;
    }
    Cancel() {
        this.cancelled = true;
    }
    FrameComplete(frameIndex) {
        if (this.cancelled)
            return;
        let triggerPoint = this.triggerPoints[frameIndex];
        if (triggerPoint.complete) {
            triggerPoint.complete();
        }
        if (!triggerPoint.pause && frameIndex < this.triggerPoints.length - 1) {
            this.NextFrame();
        }
    }
    NextFrame() {
        if (this.currentFrame === this.triggerPoints.length - 1) {
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
    UpdateTriggerPoints(triggerPoints) {
        this.triggerPoints = triggerPoints || [];
        if (this.triggerPoints.length == 0 || this.triggerPoints[this.triggerPoints.length - 1].value != this.totalDuration) {
            this.triggerPoints.push({
                value: this.totalDuration,
                complete: null
            });
        }
        this.UpdateFrames();
    }
    UpdateFrames() {
        this.frames = [];
        let currentEnd = 0;
        for (let i = 0; i < this.triggerPoints.length; i++) {
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
exports.default = LoadingBarWidget;
//# sourceMappingURL=LoadingBar.js.map
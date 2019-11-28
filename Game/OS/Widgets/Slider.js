"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const React = require("react");
const Utils_1 = require("../../Core/Utils");
class SliderWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.options = options;
    }
    GetValue() {
        return this.value;
    }
    GetOutOfRange() {
        return !!this.outOfRange;
    }
    SetMinAllowedValue(min) {
        this.minAllowedValue = min;
        this.CheckRange();
    }
    SetMaxAllowedValue(max) {
        this.maxAllowedValue = max;
        this.CheckRange();
    }
    CheckRange() {
        this.outOfRange = false;
        if (this.minAllowedValue !== null && this.value <= this.minAllowedValue) {
            this.outOfRange = true;
        }
        if (this.maxAllowedValue !== null && this.value >= this.maxAllowedValue) {
            this.outOfRange = true;
        }
        if (this.outOfRange) {
            $(this.valueDisplayRef.current).addClass("error");
        }
        else {
            $(this.valueDisplayRef.current).removeClass("error");
        }
    }
    render() {
        this.barRef = React.createRef();
        this.valueDisplayRef = React.createRef();
        return (React.createElement("div", { className: "slider", title: this.options.tooltip },
            React.createElement("div", { className: "bar borderGroove", ref: this.barRef }),
            React.createElement("div", { className: "horizontalbar" }),
            React.createElement("div", { className: "valueDisplay" },
                React.createElement("span", { className: "labelDisplay" }, this.options.label),
                " ",
                React.createElement("span", { ref: this.valueDisplayRef }))));
    }
    componentDidMount() {
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
            if (dragging) {
                let max = barEle.parent().innerWidth() - barEle.outerWidth();
                let newOffset = startOffset + (event.pageX - startX);
                if (newOffset < 0) {
                    newOffset = 0;
                }
                else if (newOffset > max) {
                    newOffset = max;
                }
                barEle.css("margin-left", newOffset + "px");
                let percentage = newOffset / max;
                this.value = percentage * (this.options.max - this.options.min) + this.options.min;
                $(this.valueDisplayRef.current).text(Utils_1.default.DisplayNumber(this.value) + this.options.suffix);
                this.CheckRange();
                this.trigger("changed");
            }
        });
        let max = 147; //lol shouldn't hard code this width
        let percentage = 0.5;
        if (this.options.defaultValue) {
            percentage = this.options.defaultValue;
        }
        let newOffset = Math.floor(percentage * max);
        console.log("Start offset: " + percentage + " : " + newOffset);
        barEle.css("margin-left", newOffset + "px");
        this.value = percentage * (this.options.max - this.options.min) + this.options.min;
        $(this.valueDisplayRef.current).text(Utils_1.default.DisplayNumber(this.value) + this.options.suffix);
        this.CheckRange();
    }
}
exports.default = SliderWidget;
//# sourceMappingURL=Slider.js.map
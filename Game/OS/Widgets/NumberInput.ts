import Widget from "./Widget";
import ButtonWidget from "./Button";
import { AllIcons } from "../../Core/Icons";

interface NumberInputOptions{
    min: number;
    max: number;
    initialValue: number;
}

interface Events{
    valueChanged;
}

export default class NumberInputWidget extends Widget<NumberInputOptions, Events>{

    public inputEle: JQuery;

    public locked: boolean;
    public increaseLocked: boolean;

    public value: number;

    private minusButton: ButtonWidget;
    private numberDisplay: JQuery;
    private plusButton: ButtonWidget;

    public constructor(options: NumberInputOptions){
        super(options);

		this.element = $("<div class=\"numberInput\"></div>");

		this.minusButton = new ButtonWidget({
            icon: AllIcons.Minus,
            small: true,
            onClick: () => {
                if(this.locked) return;
                let newValue = this.value - 1;
                if(newValue < options.min) newValue = options.min;
                if(newValue != this.value){
                    this.value = newValue;
                    this.UpdateDisplay();
                    this.trigger("valueChanged");
                }
            }
        });
        this.element.append(this.minusButton.element);

        this.numberDisplay = $("<div class=\"numberDisplay\"></div>");
        this.element.append(this.numberDisplay);

        this.plusButton = new ButtonWidget({
            icon: AllIcons.Plus,
            small: true,
            onClick: function(){
                if(this.locked || this.increaselocked) return;
                var newValue = this.value + 1;
                if(newValue > options.max) newValue = options.max;
                if(newValue != this.value){
                    this.value = newValue;
                    this.UpdateDisplay();
                    this.trigger("valueChanged");
                }
            }
        });
        this.element.append(this.plusButton.element);

        this.locked = false;
        this.increaseLocked = false;

        this.value = options.initialValue;
        this.UpdateDisplay();
    }

    public Lock(onlyLockIncrease: boolean): void{
        this.increaseLocked = true;
        if(!onlyLockIncrease)this.locked = true;
    }

    public Unlock(): void{
        this.locked = false;
        this.increaseLocked = false;
    }

    public UpdateDisplay(): void{
        this.numberDisplay.text(this.value);
    }
}
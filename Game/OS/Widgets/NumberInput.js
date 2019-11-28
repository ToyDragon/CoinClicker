"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Widget_1 = require("./Widget");
const Button_1 = require("./Button");
const Icons_1 = require("../../Core/Icons");
class NumberInputWidget extends Widget_1.default {
    constructor(options) {
        super(options);
        this.element = $("<div class=\"numberInput\"></div>");
        this.minusButton = new Button_1.default({
            icon: Icons_1.AllIcons.Minus,
            small: true,
            onClick: () => {
                if (this.locked)
                    return;
                let newValue = this.value - 1;
                if (newValue < options.min)
                    newValue = options.min;
                if (newValue != this.value) {
                    this.value = newValue;
                    this.UpdateDisplay();
                    this.trigger("valueChanged");
                }
            }
        });
        this.element.append(this.minusButton.element);
        this.numberDisplay = $("<div class=\"numberDisplay\"></div>");
        this.element.append(this.numberDisplay);
        this.plusButton = new Button_1.default({
            icon: Icons_1.AllIcons.Plus,
            small: true,
            onClick: function () {
                if (this.locked || this.increaselocked)
                    return;
                var newValue = this.value + 1;
                if (newValue > options.max)
                    newValue = options.max;
                if (newValue != this.value) {
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
    Lock(onlyLockIncrease) {
        this.increaseLocked = true;
        if (!onlyLockIncrease)
            this.locked = true;
    }
    Unlock() {
        this.locked = false;
        this.increaseLocked = false;
    }
    UpdateDisplay() {
        this.numberDisplay.text(this.value);
    }
}
exports.default = NumberInputWidget;
//# sourceMappingURL=NumberInput.js.map
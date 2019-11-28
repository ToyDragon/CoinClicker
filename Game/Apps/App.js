"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("../Core/Observable");
class App extends Observable_1.default {
    constructor() {
        super();
    }
    ActivateOrCreate() {
        console.log("App clicked");
        if (this.windowObj) {
            console.log("Activating existing window " + this.windowObj.id);
            this.windowObj.ActivateWindow(false);
        }
        else {
            console.log("Creating new window");
            this.CreateWindow();
            this.AfterCreateWindow();
        }
    }
    CreateWindow() { }
    AfterCreateWindow() {
        this.windowObj.on("close", () => {
            console.log("Removed window reference");
            this.windowObj = null;
        });
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map
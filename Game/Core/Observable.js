"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class Observable {
    constructor() {
        this.eventHandlers = {};
    }
    on(eventName, handler) {
        this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
        this.eventHandlers[eventName].splice(0, 0, handler);
    }
    trigger(eventName, eventInfo) {
        let handlers = this.eventHandlers[eventName] || [];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] && handlers[i].apply)
                handlers[i].apply(this, [eventInfo]);
        }
    }
}
exports.default = Observable;
class ObservableComponent extends React.Component {
    constructor(props) {
        super(props);
        this.eventHandlers = {};
    }
    on(eventName, handler) {
        this.eventHandlers[eventName] = this.eventHandlers[eventName] || [];
        this.eventHandlers[eventName].splice(0, 0, handler);
    }
    trigger(eventName, eventInfo) {
        let handlers = this.eventHandlers[eventName] || [];
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i] && handlers[i].apply)
                handlers[i].apply(this, [eventInfo]);
        }
    }
}
exports.ObservableComponent = ObservableComponent;
//# sourceMappingURL=Observable.js.map
import * as React from "react";

export default class Observable<K>{
    public eventHandlers: {[eventName: string]: Function[]};

    public constructor(){
        this.eventHandlers = {};
    }

    public on(eventName: keyof K, handler: Function): void{
        this.eventHandlers[eventName as string] = this.eventHandlers[eventName as string] || [];
        this.eventHandlers[eventName as string].splice(0, 0, handler);
    }

    public trigger(eventName: keyof K, eventInfo?: any): void{
        let handlers = this.eventHandlers[eventName as string] || [];
        for(var i = 0; i < handlers.length; i++){
            if(handlers[i] && handlers[i].apply) handlers[i].apply(this, [eventInfo]);
        }
    }
}

export class ObservableComponent<K, P = {}, S = {}, SS = any> extends React.Component<P, S, SS>{
    public eventHandlers: {[eventName: string]: Function[]};

    public constructor(props: P){
        super(props);
        this.eventHandlers = {};
    }

    public on(eventName: keyof K, handler: Function): void{
        this.eventHandlers[eventName as string] = this.eventHandlers[eventName as string] || [];
        this.eventHandlers[eventName as string].splice(0, 0, handler);
    }

    public trigger(eventName: keyof K, eventInfo?: any): void{
        let handlers = this.eventHandlers[eventName as string] || [];
        for(var i = 0; i < handlers.length; i++){
            if(handlers[i] && handlers[i].apply) handlers[i].apply(this, [eventInfo]);
        }
    }
}
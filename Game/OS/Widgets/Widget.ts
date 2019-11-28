import * as React from "react";

export default class Widget<P, K> extends React.Component<P>{

    public element: JQuery;
    public eventHandlers: {[eventName: string]: Function[]};

    public constructor(props: P){
        super(props)
        this.eventHandlers = {};
    }

    public off(eventName: keyof K): void{
        this.eventHandlers[eventName as string] = this.eventHandlers[eventName as string] || [];
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
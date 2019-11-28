import VirtualPage from "./VirtualPage";
import * as ReactDom from "react-dom";
import * as React from "react";

export default class NoPageFoundPage extends VirtualPage{

    public constructor(){
        super();
    }

    public MatchesAddress(_address: string): boolean{
        return true;
    }

    public Render(contentDiv: JQuery): void{
        ReactDom.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `
            `}}></style>,
            <div className="pageRoot" key="b">
                <h1>Error 404: Page Not Found</h1>
                <a data-destination="home.net">Go Home</a>
            </div>
        ]
        , contentDiv[0]);
    }

    public Cleanup(): void{

    }
}
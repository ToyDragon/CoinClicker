import VirtualPage from "./VirtualPage";
import * as ReactDom from "react-dom";
import * as React from "react";
import { AssetLocation } from "../../../Core/Utils";
import { IconDetails, AllIcons } from "../../../Core/Icons";
import { OS } from "../../../OS/OS";

export default class DebugPage extends VirtualPage{

    private rootDiv: JQuery<HTMLElement>;

    public constructor(){
        super();
    }

    public GetURL(): string{
        return "www.webos.gov";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?webos\.gov/i.test(address);
    }

    public Render(contentDiv: JQuery): void{
        const rootRef = React.createRef<HTMLDivElement>();

        ReactDom.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `
                .coal{
                    background-image: url("` + AssetLocation + `icons/Coal128.png");
                    width: 128px;
                    height: 128px;
                    display: inline-block;
                    position: absolute;
                    right: 25px;
                }
                
                .pageTitle{
                    display: inline-block;
                    font-size: 50px;
                }
                
                .pageSubtitle{
                    margin-left: 2px;
                    font-size: 18px;
                }
                
                .pageRoot{
                    background-color: #353F40;
                }
                
                .shopItems{
                    margin-top:32px;
                }
                
                .shopItem{
                    border-bottom: 1px dotted #816116;
                    height: 64px;
                    padding: 5px;
                    z-index: 1;
                    position: relative;
                }
                
                .shopItem:hover{
                    background-color: #d1b470;
                }
                
                .shopItemIcon{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                }
                
                .shopItemTitleSection{
                    display: inline-block;
                    width: 230px;
                    position: relative;
                    top: -11px;
                    left: 10px;
                }
                
                .shopItemTitle{
                    font-size: 24px;
                }
                
                .shopItemSubTitle{
                    height: 32px;
                }
                
                .shopItemPrice{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    text-align: right;
                    vertical-align: middle;
                    font-size: 24px;
                }
                
                .shopItemPriceSymbol{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    vertical-align: middle;
                    font-size: 24px;
                }
                
                .pageTitleSection{
                    padding-left: 40px;
                    display: inline-block;
                }
                
                .headerSection{
                    padding-top: 15px;
                    padding-bottom: 15px;
                }
            `}}></style>,
            <div className="pageRoot" key="b">
                <div className="headerSection">
                    <div className="pageTitleSection">
                        <div className="pageTitle">webos.gov</div>
                        <div className="pageSubtitle">Get the fuck out of my debug page you nerd</div>
                    </div>
                    <div className="coal"></div>
                </div>
                <div>
                    <h1>Shared Data</h1>
                    {this.GetSharedDataElements()}
                </div>
            </div>
        ]
        , contentDiv[0]);
    }

    private GetSharedDataElements(): JSX.Element[]{
        let data: JSX.Element[] = [];
        let key = 0;
        for(let prop in (OS as any).SharedData){
            data.push(
                <div key={key++}>
                    <label>{prop + ": " + JSON.stringify((OS as any).SharedData[prop])}</label>
                </div>
            );
        }
        return data;
    }

    public Cleanup(): void{

    }
}
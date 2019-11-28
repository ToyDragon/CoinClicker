import VirtualPage from "./VirtualPage";
import * as ReactDom from "react-dom";
import * as React from "react";
import Utils, { AssetLocation } from "../../../Core/Utils";
import { OS } from "../../../OS/OS";
import { MojaveSharedDataKeys } from "./Mojave";

interface ShopData{
    title: string;
    iconClass: string;
    destination: string;
    subtitle: string;    
}

export default class HomePage extends VirtualPage{

    public constructor(){
        super();
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?home\.net/i.test(address);
    }

    public Render(contentDiv: JQuery): void{
        ReactDom.render(
        [
            <style key="a" dangerouslySetInnerHTML={{__html: `
                .cactus{
                    background-image: url("` + AssetLocation + `icons/Mojave64.png");
                }
                
                .coal{
                    background-image: url("` + AssetLocation + `icons/Coal64.png");
                }
                
                .wolf{
                    background-image: url("` + AssetLocation + `icons/AlphaWolf64.png");
                }
                
                .headerSection{
                    padding-top: 15px;
                    padding-bottom: 30px;
                }
                
                .pageRoot{
                    background-color: #ffe4cc;
                }
                
                .pageTitle{
                    display: inline-block;
                    font-size: 50px;
                }
                
                .homeIcon{
                    display: inline-block;
                    width: 64px;
                    height: 64px;
                    margin-bottom: -14px;
                    background-image: url("` + AssetLocation + `icons/Browser64.png");
                }
                
                .linkTextSection{
                    display: inline-block;
                    position: relative;
                    top: -10px;
                }
                
                .linkTitle{
                    font-size: 24px;
                }
                
                .linkIcon{
                    width: 64px;
                    height: 64px;
                    display: inline-block;
                    margin-left: 30px;
                }
            `}}></style>,
            <div className="pageRoot" key="b">
                <div className="headerSection">
                    <div className="homeIcon"></div>
                    <div className="pageTitle">Home Page</div>
                </div>
                <div className="links">
                    {this.GetShopElements().map((data, index) => { return this.ShopDataToShopElement(data, index); })}
                </div>
            </div>
        ]
        , contentDiv[0]);
    }

    private ShopDataToShopElement(data: ShopData, index: number){
        return (
            <div className="homeLink" key={index}>
                <div className={"linkIcon "+data.iconClass}></div>
                <div className="linkTextSection">
                    <a href="#" data-destination={data.destination} className="linkTitle">{data.title}</a>
                    <div className="linkSubtitle">{data.subtitle}</div>
                </div>
            </div>
        );
    }

    private GetShopElements(): ShopData[]{
        let data: ShopData[] = [];
        
        data.push({
            destination: "mojave.com",
            iconClass: "cactus",
            subtitle: "Mining Tool Shop",
            title: "Mojave"
        });

        data.push({
            destination: "doors.com",
            iconClass: "cactus",
            subtitle: "Pickaxe Upgrades",
            title: "Doors"
        });

        if(OS.getSharedData<MojaveSharedDataKeys>("hasACNMiner0")){
            data.push({
                destination: "alphawolf.org",
                iconClass: "wolf",
                subtitle: "ACN Mining Upgrades",
                title: "Alpha Wolf"
            });
            
            data.push({
                destination: "coal.io",
                iconClass: "coal",
                subtitle: "Minigames",
                title: "Coal"
            });
        }
        
        if(Utils.DebugEnabled()){
            data.push({
                destination: "webos.gov",
                iconClass: "cactus",
                subtitle: "Debug tools for development",
                title: "Debug"
            });
        }

        return data;
    }

    public Cleanup(): void{

    }
}
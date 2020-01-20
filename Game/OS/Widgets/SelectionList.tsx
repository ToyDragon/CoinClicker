import * as ReactDom from "react-dom";
import * as React from "react";
import Widget from "./Widget";
import { AssetLocation } from "../../Core/Utils";
import { IconDescriptor } from "../../Core/Icons";
import IconWidget from "./Icon";

export interface SelectionListOptions{
    noreact?: boolean;

    defaultIndex?: number;
    items: SelectionItem[];
    selectionChanged?: Function;
    hiddenOptions?: boolean[];
    width: number;
    height: number;
}

interface SelectionItem{
    title: string;
    tooltip: string;
    icon: IconDescriptor;
    value?: string;
    onSelect?: Function;
    onDeselect?: Function;
}

interface SelectionItemDetails{
    id: number;
    title: string;
    value: string;
    div: JQuery;
    onSelect?: Function;
    onDeselect?: Function;
    selected: boolean;
}

interface Events{
    selectionChanged;
}

export default class SelectionListWidget extends Widget<SelectionListOptions, Events>{

    public selectedIndex: number;
    public dataList: SelectionItemDetails[];
    public value: string;

    private options: SelectionListOptions;
    private optionRefs: React.RefObject<HTMLDivElement>[];

    public constructor(options: SelectionListOptions){
        super(options);
        this.options = options;
        this.optionRefs = [];

        if(!options.noreact)
        {
            this.element = $("<div class=\"selectionList borderRidge\"></div>");
            //this.element.css("width", options.width);
            //this.element.css("height", options.height);

            if(this.options && typeof(this.options.defaultIndex) === "number"){
                this.selectedIndex = this.options.defaultIndex;
            }else{
                this.selectedIndex = -1;
            }
            
            this.dataList = [];

            for(let i = 0; i < options.items.length; i++){
                let itemObj = options.items[i];
                let itemDiv = $("<div></div>");
                itemDiv.addClass("item");

                if(itemObj.icon){
                    let iconEle = $("<div></div>");
                    iconEle.addClass("icon");
                    let icon = itemObj.icon.small.dark;
                    iconEle.css("background-image","url(\"" + AssetLocation + icon.id +"\")");
                    iconEle.css("width", icon.width);
                    iconEle.css("height", icon.height);
                    itemDiv.append(iconEle);
                }

                let titleEle = $("<div></div>");
                titleEle.addClass("title");
                titleEle.css("top","-2px");
                titleEle.text(itemObj.title);
                itemDiv.append(titleEle);

                itemDiv.attr("title",itemObj.tooltip);

                itemDiv.on("click", (e) => {
                    this.SetSelection(i, false);
                });

                let itemData: SelectionItemDetails = {
                    id: i,
                    title: itemObj.title,
                    value: itemObj.value,
                    div: itemDiv,
                    onSelect: itemObj.onSelect,
                    onDeselect: itemObj.onDeselect,
                    selected: false
                };
                this.dataList.push(itemData);

                if(!options.hiddenOptions || !options.hiddenOptions[i]){
                    this.element.append(itemDiv);
                }
            }
        }
    }
    
    public render(): JSX.Element {
        return (
            <div className="selectionList borderRidge" style={{width: this.options.width, height: this.options.height}}>
                {this.options.items.map((item, i) => {return this.RenderItem(item, i === this.options.defaultIndex)})}
            </div>
        );
    }

    private RenderItem(item: SelectionItem, selected: boolean): JSX.Element {
        const ref = React.createRef<HTMLDivElement>();
        this.optionRefs.push(ref);
        return (
            <div ref={ref} key={item.title} className={selected ? "item selected" : "item"}>
                <IconWidget icon={item.icon.small} />
                <div className="title" title={item.tooltip} style={{top: "-2px"}}>{item.title}</div>
            </div>
        );
    }

    public componentDidMount(): void{
        for(let i = 0; i < this.optionRefs.length; i++){
            const iAnchor = i;
            $(this.optionRefs[i].current).on("click", () => {
                this.SetSelection(iAnchor, false);
            });
        }
    }

    private ChangeVisualSelection(oldIndex: number, newIndex: number): void{
        if(oldIndex >= 0 && oldIndex < this.optionRefs.length){
            $(this.optionRefs[oldIndex].current).removeClass("selected");
        }
        
        if(newIndex >= 0 && newIndex < this.optionRefs.length){
            $(this.optionRefs[newIndex].current).addClass("selected");
        }
    }

    public SetSelection(choiceId: number, dontNotifyOthers: boolean): void{
        if(choiceId != this.selectedIndex){
            if(this.optionRefs){
                this.ChangeVisualSelection(this.selectedIndex, choiceId);
            }

            if(this.selectedIndex >= 0){
                this.dataList[this.selectedIndex].selected = false;
                this.dataList[this.selectedIndex].div.removeClass("selected");
                if(!dontNotifyOthers && this.dataList[this.selectedIndex].onDeselect) this.dataList[this.selectedIndex].onDeselect();
            }
            this.selectedIndex = choiceId;
            this.dataList[this.selectedIndex].selected = true;
            this.dataList[this.selectedIndex].div.addClass("selected");
            this.value = this.dataList[this.selectedIndex].value || this.dataList[this.selectedIndex].title;
            if(!dontNotifyOthers){
                if(this.dataList[this.selectedIndex].onSelect) this.dataList[this.selectedIndex].onSelect();
                this.trigger("selectionChanged", choiceId);
            }
        }
    };
}
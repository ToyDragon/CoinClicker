import Widget from "./Widget";
import { AssetLocation } from "../../Core/Utils";
import { IconDescriptor, AllIcons } from "../../Core/Icons";
import SelectionList, { SelectionListOptions } from "./SelectionList";
import ContextMenu from "../ContextMenu"

interface Events{
    selectionChanged;
}

export default class OptionSelectWidget extends Widget<SelectionListOptions, Events>{

    public valueTitle: string;
    public valueTooltip: string;
    public valueIcon: IconDescriptor;
    public value: string;

    public valueIconEle: JQuery;
    public valueEle: JQuery;
    public divotEle: JQuery;

    public constructor(options: SelectionListOptions){
        super(options);

        options.defaultIndex = options.defaultIndex || 0;

        this.valueTitle = options.items[options.defaultIndex].title;
        this.valueTooltip = options.items[options.defaultIndex].tooltip;
        this.valueIcon = options.items[options.defaultIndex].icon;
        this.value = options.items[options.defaultIndex].value || this.valueTitle;

        this.element = $("<div class=\"borderRidge optionSelect\"></div>");        

        this.valueIconEle = $("<div class=\"icon itemIcon\"></div>");
        this.element.append(this.valueIconEle);

        this.valueEle = $("<div></div>");
        this.valueEle.addClass("title");
        this.element.append(this.valueEle);

        this.divotEle = $("<div class=\"icon divotIcon\"></div>");
        let icon = AllIcons.Dropdown.small.dark;
        this.divotEle.css("background-image","url(\""+ AssetLocation + icon.id +"\")");
        this.divotEle.css("width", icon.width);
        this.divotEle.css("height", icon.height);
        this.element.append(this.divotEle);

        this.element.on("click", (event: JQuery.Event) => {
            let popupData = new SelectionList(options);
            popupData.element.css("position", "absolute");
            popupData.element.removeClass("borderRidge");
            popupData.element.addClass("borderGroove");
            popupData.element.css("left", event.pageX);
            popupData.element.css("top", event.pageY);
            popupData.element.css("z-index", 10000);
            $("#absoluteObjects").prepend(popupData.element);

            popupData.on("selectionChanged", (index) => {
                if(options.selectionChanged){
                    options.selectionChanged(options.items[index]);
                }else{
                    this.valueTitle = options.items[index].title;
                    this.valueTooltip = options.items[index].tooltip;
                    this.valueIcon = options.items[index].icon;
                    this.value = options.items[index].value || this.valueTitle;
                    this.UpdateDisplay();
                }

                this.trigger("selectionChanged");
                popupData.element.remove();
            });

            ContextMenu.TreatAsContextMenu(popupData.element);
        });

        this.UpdateDisplay();
    }

    public UpdateDisplay(): void{
        this.valueEle.text(this.valueTitle);
        this.element.attr("title", this.valueTooltip);

        if(this.valueIcon){
            this.valueIconEle.css("background-image","url(\""+ AssetLocation + this.valueIcon.small.dark.id +"\")");
            this.valueIconEle.css("width", this.valueIcon.small.dark.width);
            this.valueIconEle.css("height", this.valueIcon.small.dark.height);
        }
    };
}
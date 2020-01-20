import Widget from "./Widget";
import { AllIcons } from "../../Core/Icons";
import SelectionList, { SelectionListOptions } from "./SelectionList";
import ContextMenu from "../ContextMenu"
import IconWidget from "./Icon";
import * as React from "react";

interface Events{
    selectionChanged;
}

export default class OptionSelectWidget extends Widget<SelectionListOptions, Events>{

    public selectedIndex: number;

    private options: SelectionListOptions;
    private selectedIcon: React.RefObject<IconWidget>;
    private divSelectedTitle: React.RefObject<HTMLDivElement>;
    private rootDiv: React.RefObject<HTMLDivElement>;

    public constructor(options: SelectionListOptions){
        super(options);
        this.options = options;
    }

    public UpdateDisplay(): void{
        const selectedItem = this.options.items[this.selectedIndex];
        $(this.divSelectedTitle.current).text(selectedItem.title);
        $(this.rootDiv.current).attr("title", selectedItem.tooltip || selectedItem.title);

        this.selectedIcon.current.SetIcon(selectedItem.icon.small);
    }
    
    public render(): JSX.Element {
        this.selectedIndex = this.options.defaultIndex || 0;
        const selectedItem = this.options.items[this.selectedIndex];

        return (
            <div className={"borderRidge optionSelect"} style={{width: this.options.width}} ref={this.rootDiv = React.createRef<HTMLDivElement>()}>
                <IconWidget ref={this.selectedIcon = React.createRef<IconWidget>()} icon={selectedItem.icon.small} />
                <div className={"title"} style={{marginLeft: 4}} ref={this.divSelectedTitle = React.createRef<HTMLDivElement>()}>{selectedItem.title}</div>
                <div style={{position: "absolute", right:5, top: 2}}>
                    <IconWidget icon={AllIcons.Dropdown.small} />
                </div>
            </div>
        );
    }

    public componentDidMount(): void{
        $(this.rootDiv.current).on("click", (event: JQuery.Event) => {
            let popupData = new SelectionList(this.options);
            popupData.element.css("position", "absolute");
            popupData.element.removeClass("borderRidge");
            popupData.element.addClass("borderGroove");
            popupData.element.css("left", event.pageX);
            popupData.element.css("top", event.pageY);
            popupData.element.css("z-index", 10000);
            $("#absoluteObjects").prepend(popupData.element);

            popupData.on("selectionChanged", (index) => {
                this.selectedIndex = index;

                if(this.options.selectionChanged){
                    this.options.selectionChanged();
                }

                this.trigger("selectionChanged");
                popupData.element.remove();

                this.UpdateDisplay();
            });

            ContextMenu.TreatAsContextMenu(popupData.element);
        });

        this.UpdateDisplay();
    }
}
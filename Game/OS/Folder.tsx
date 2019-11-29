import Observable from "../Core/Observable";
import Utils, { AssetLocation } from "../Core/Utils";
import { AllIcons, IconDescriptor } from "../Core/Icons"
import WebosWindow from "./Window";
import App from "../Apps/App"
import ContextMenu from "./ContextMenu";
import Popup, { PromptType } from "./Popup";
import { OS } from "./OS";

interface JQueryUI{
    helper: JQuery;
    item: JQuery;
    offset: {top: number, left: number};
    position: {top: number, left: number};
    ooriginalPosition : {top: number, left: number};
    sender: JQuery;
    placeholder: JQuery;
}

export let FoldersById: {[folderId: string]: Folder} = {};

export class FolderItem{
    public static ItemsById: {[itemId: string]: FolderItem} = {};

    public itmButton: JQuery;
    public id: string;
    public parentId: string;
    public canRename: boolean;
    public folderId: string;
    private options: FolderItemOptions;
    private app?: App<{}>;
    private titleSpan: JQuery<HTMLSpanElement>;

    public constructor(options: FolderItemOptions){
        this.options = options;
        this.folderId = options.folderId;
        options.icon = options.icon || AllIcons.Folder;

        this.canRename = !!options.canRename;

        this.itmButton = $("<div></div>");
        this.itmButton.addClass("item");

        this.id = "item_" + Utils.GetRandomString(10);
        FolderItem.ItemsById[this.id] = this;

        this.itmButton.attr("id", this.id);

        let iconElement = $("<div></div>");
        iconElement.addClass("icon");
        let icon = options.icon.large.dark;
        iconElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
        iconElement.css("width", icon.width + "px");
        iconElement.css("height", icon.height + "px");
        this.itmButton.append(iconElement);

        let titleContainer = $("<div></div>");
        titleContainer.addClass("titleContainer");
        this.itmButton.append(titleContainer);

        let titleElement = $("<div></div>");
        titleElement.addClass("titleElement");
        titleContainer.append(titleElement);

        this.titleSpan = $("<span></span>");
        this.titleSpan.addClass("title");
        this.titleSpan.text(options.title);
        titleElement.append(this.titleSpan);

        this.app = options.app;
    }

    public UpdateHandlers(): void{
        this.itmButton.on("click", (e) => {
            console.log("Clicked folder item " + this.id);
            if(this.app){
                console.log("With app");
                this.app.ActivateOrCreate();
            }else{
                console.log("With no app");                
            }
        });

        this.itmButton.on("contextmenu", (e) => {
            let actions = [
                {
                    title: "Open",
                    icon: this.options.icon,
                    click: () => {this.app.ActivateOrCreate();}
                }
            ];
            if(this.canRename){
                actions.push({
                    title: "Rename",
                    icon: this.options.icon,
                    click: () => {
                        new Popup({
                            actionName: "Rename",
                            icon: AllIcons.Folder,
                            title: "Rename Folder",
                            text: "Change name of  \"" + this.options.title + "\" to:",
                            placeholder: "Name",
                            defaultText: this.options.title,
                            type: PromptType.text,
                            accept: (newName) => {
                                if(typeof(newName) === "string" && newName.length > 0){
                                    console.log("Trying to rename to " + newName);
                                    this.options.title = newName;
                                    this.titleSpan.text(this.options.title);
                                }
                            }
                        });
                    }
                });
            }
            ContextMenu.CreateContextMenu(
                {
                    x: e.pageX,
                    y: e.pageY
                }, actions);
            e.preventDefault();

            console.log("Folder Context Menu");

            e.stopImmediatePropagation();
        });
    }
}

export interface FolderItemOptions extends FolderOptions{
    app?: App<any>;
    folderId?: string;
}

export interface FolderOptions{
    root?: JQuery;
    title?: string;
    icon?: IconDescriptor;
    canRename?: boolean;
}

interface FolderEvents{
    update;
}

export class Folder extends Observable<FolderEvents>{

    public static DesktopId: string;
    public static FoldersById: {[folderId: string]: Folder} = {};

    public items: FolderItem[];
    public id: string;
    public item: FolderItem;

    public root: JQuery;
    private clickTime: Date;

    public UpdateItems(): void{
        this.items.forEach((itemObj: FolderItem) => {
            itemObj.itmButton.remove();
            if(this.root){
                this.root.append(itemObj.itmButton);
                itemObj.UpdateHandlers();
            }
        });
    }

    public AddItem(item: FolderItem): void{
        this.items.push(item);
        item.parentId = this.id;
        item.itmButton.remove();
        this.UpdateItems();
    }

    public RemoveItem(itemId: string): void{
        for(var i = this.items.length-1; i >= 0; i--){
            if(this.items[i].id == itemId){
                this.items[i].itmButton.remove();
                this.items.splice(i, 1);
            }
        }
        this.UpdateItems();
    }

    private SortUpdate(event: Event, ui: JQueryUI): void{
        this.items = [];
        this.root.children().each((i, element) => {
            this.items.push(FolderItem.ItemsById[element.id]);
        });

        this.trigger("update");
    }

    private SortBeforeStop(event: Event, ui: JQueryUI): void{
        if(!this.clickTime)
        {
            return;
        }
        let elapsedMillis = new Date().getTime() - this.clickTime.getTime();
        if(elapsedMillis < 75){
            console.log("Quick drag click thing on " + ui.item.attr("id"));
            FolderItem.ItemsById[ui.item.attr("id")].itmButton.trigger("click");
        }
        let x = ui.item.parent().offset().left + ui.position.left + ui.item.outerWidth()/2;
        let y = ui.item.parent().offset().top + ui.position.top + ui.item.outerHeight()/2;
        let folderId = Folder.DesktopId;
        console.log("Dropped at " + x + ":" + y + " with time " + elapsedMillis);
        let targetWindow = WebosWindow.GetWindowAtPos(x, y);
        if(targetWindow){
            folderId = targetWindow.folderId;
            console.log("Dropped on window " + targetWindow.title);
        }

        const item = FolderItem.ItemsById[ui.item.attr("id")];
        if(folderId){
            let cancel = false;
            
            if(item.folderId){
                if(folderId === item.folderId){
                    cancel = true;
                }else if (Folder.FoldersById[folderId].IsChildOf(item.folderId)){
                    cancel = true;
                }
            }

            if(!cancel){
                this.RemoveItem(item.id);
                Folder.FoldersById[folderId].AddItem(item);
            }
        }
    }
    
    public IsChildOf(potentialParentFolderId: string): boolean{
        let parent = this.id;
        while(parent && Folder.FoldersById[parent] && Folder.FoldersById[parent].item && Folder.FoldersById[parent].item.parentId){
            parent = Folder.FoldersById[parent].item.parentId;
            
            if(parent === potentialParentFolderId){
                return true;
            }
            if(parent === Folder.DesktopId){
                return false;
            }
        }
        return false;
    }

    public UpdateRootElement(root: JQuery): void{
        this.root = this.root || root;
        if(!this.root)
        {
            return;
        }

        this.root.sortable();
        this.root.on("sortstart" as any, (_event: Event, _ui: JQueryUI) => {
            this.clickTime = new Date();
        });
        this.root.on("sortbeforestop" as any, (event: Event, ui: JQueryUI) => {
            this.SortBeforeStop(event, ui);
        });
        this.root.on("sortupdate" as any, (event: Event, ui: JQueryUI) => {
            this.SortUpdate(event, ui);
        });

        this.UpdateItems();
    }

    public constructor(options: FolderOptions){
        super();

        this.items = [];
        this.id = "folder_" + Utils.GetRandomString(10);
        Folder.FoldersById[this.id] = this;

        if(options.title){
            let itemOptions = options as FolderItemOptions;
            itemOptions.icon = itemOptions.icon || AllIcons.Folder;
            itemOptions.app = new FolderApp(itemOptions, this);
            itemOptions.folderId = this.id;
            this.item = new FolderItem(itemOptions);
        }else if(!Folder.DesktopId){
            this.UpdateRootElement(options.root); //root is only present for the desktop because the folder is "Always open"
            Folder.DesktopId = this.id;
        }
    }
}

export class FolderApp extends App<{}>{
    private itemOptions: FolderItemOptions;
    private folder: Folder;

    public constructor(itemOptions: FolderItemOptions, folder: Folder){
        super();

        this.itemOptions = itemOptions;
        this.folder = folder;
    }

    public CreateWindow(): void{
        this.windowObj = new WebosWindow({
            width: 500,
            height: 300,
            icon: this.itemOptions.icon,
            title: this.itemOptions.title,
            resizable: true, //not implemented yet
        });

        this.windowObj.folderId = this.folder.id;

        this.windowObj.on("close", () => {
            if(this.folder.root){
                this.folder.root.remove();
                this.folder.root = null;
            }
            this.folder.UpdateItems();
        });

        if(!this.folder.root){
            let root = $("<div></div>");
            root.addClass("folderRoot");
            this.folder.UpdateRootElement(root);
        }

        this.windowObj.contentDiv.append(this.folder.root);
    }
}

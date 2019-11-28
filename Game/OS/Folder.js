"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("../Core/Observable");
const Utils_1 = require("../Core/Utils");
const Icons_1 = require("../Core/Icons");
const Window_1 = require("./Window");
const App_1 = require("../Apps/App");
const ContextMenu_1 = require("./ContextMenu");
const Popup_1 = require("./Popup");
exports.FoldersById = {};
class FolderItem {
    constructor(options) {
        this.options = options;
        this.folderId = options.folderId;
        options.icon = options.icon || Icons_1.AllIcons.Folder;
        this.canRename = !!options.canRename;
        this.itmButton = $("<div></div>");
        this.itmButton.addClass("item");
        this.id = "item_" + Utils_1.default.GetRandomString(10);
        FolderItem.ItemsById[this.id] = this;
        this.itmButton.attr("id", this.id);
        let iconElement = $("<div></div>");
        iconElement.addClass("icon");
        let icon = options.icon.large.dark;
        iconElement.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
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
    UpdateHandlers() {
        this.itmButton.on("click", (e) => {
            console.log("Clicked folder item " + this.id);
            if (this.app) {
                console.log("With app");
                this.app.ActivateOrCreate();
            }
            else {
                console.log("With no app");
            }
        });
        this.itmButton.on("contextmenu", (e) => {
            let actions = [
                {
                    title: "Open",
                    icon: this.options.icon,
                    click: () => { this.app.ActivateOrCreate(); }
                }
            ];
            if (this.canRename) {
                actions.push({
                    title: "Rename",
                    icon: this.options.icon,
                    click: () => {
                        new Popup_1.default({
                            actionName: "Rename",
                            icon: Icons_1.AllIcons.Folder,
                            title: "Rename Folder",
                            text: "Change name of  \"" + this.options.title + "\" to:",
                            placeholder: "Name",
                            defaultText: this.options.title,
                            type: Popup_1.PromptType.text,
                            accept: (newName) => {
                                if (typeof (newName) === "string" && newName.length > 0) {
                                    console.log("Trying to rename to " + newName);
                                    this.options.title = newName;
                                    this.titleSpan.text(this.options.title);
                                }
                            }
                        });
                    }
                });
            }
            ContextMenu_1.default.CreateContextMenu({
                x: e.pageX,
                y: e.pageY
            }, actions);
            e.preventDefault();
            console.log("Folder Context Menu");
            e.stopImmediatePropagation();
        });
    }
}
FolderItem.ItemsById = {};
exports.FolderItem = FolderItem;
class Folder extends Observable_1.default {
    constructor(options) {
        super();
        this.items = [];
        this.id = "folder_" + Utils_1.default.GetRandomString(10);
        Folder.FoldersById[this.id] = this;
        if (options.title) {
            let itemOptions = options;
            itemOptions.icon = itemOptions.icon || Icons_1.AllIcons.Folder;
            itemOptions.app = new FolderApp(itemOptions, this);
            itemOptions.folderId = this.id;
            this.item = new FolderItem(itemOptions);
        }
        else if (!Folder.DesktopId) {
            this.UpdateRootElement(options.root); //root is only present for the desktop because the folder is "Always open"
            Folder.DesktopId = this.id;
        }
    }
    UpdateItems() {
        this.items.forEach((itemObj) => {
            itemObj.itmButton.remove();
            if (this.root) {
                this.root.append(itemObj.itmButton);
                itemObj.UpdateHandlers();
            }
        });
    }
    AddItem(item) {
        this.items.push(item);
        item.parentId = this.id;
        item.itmButton.remove();
        this.UpdateItems();
    }
    RemoveItem(itemId) {
        for (var i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].id == itemId) {
                this.items[i].itmButton.remove();
                this.items.splice(i, 1);
            }
        }
        this.UpdateItems();
    }
    SortUpdate(event, ui) {
        this.items = [];
        this.root.children().each((i, element) => {
            this.items.push(FolderItem.ItemsById[element.id]);
        });
        this.trigger("update");
    }
    SortBeforeStop(event, ui) {
        if (!this.clickTime) {
            return;
        }
        let elapsedMillis = new Date().getTime() - this.clickTime.getTime();
        if (elapsedMillis < 75) {
            console.log("Quick drag click thing on " + ui.item.attr("id"));
            FolderItem.ItemsById[ui.item.attr("id")].itmButton.trigger("click");
        }
        let x = ui.item.parent().offset().left + ui.position.left + ui.item.outerWidth() / 2;
        let y = ui.item.parent().offset().top + ui.position.top + ui.item.outerHeight() / 2;
        let folderId = Folder.DesktopId;
        console.log("Dropped at " + x + ":" + y + " with time " + elapsedMillis);
        let targetWindow = Window_1.default.GetWindowAtPos(x, y);
        if (targetWindow) {
            folderId = targetWindow.folderId;
            console.log("Dropped on window " + targetWindow.title);
        }
        const item = FolderItem.ItemsById[ui.item.attr("id")];
        if (folderId) {
            let cancel = false;
            if (item.folderId) {
                if (folderId === item.folderId) {
                    cancel = true;
                }
                else if (Folder.FoldersById[folderId].IsChildOf(item.folderId)) {
                    cancel = true;
                }
            }
            if (!cancel) {
                this.RemoveItem(item.id);
                Folder.FoldersById[folderId].AddItem(item);
            }
        }
    }
    IsChildOf(potentialParentFolderId) {
        let parent = this.id;
        while (parent && Folder.FoldersById[parent] && Folder.FoldersById[parent].item && Folder.FoldersById[parent].item.parentId) {
            parent = Folder.FoldersById[parent].item.parentId;
            if (parent === potentialParentFolderId) {
                return true;
            }
            if (parent === Folder.DesktopId) {
                return false;
            }
        }
        return false;
    }
    UpdateRootElement(root) {
        this.root = this.root || root;
        if (!this.root) {
            return;
        }
        this.root.sortable();
        this.root.on("sortstart", (_event, _ui) => {
            this.clickTime = new Date();
        });
        this.root.on("sortbeforestop", (event, ui) => {
            this.SortBeforeStop(event, ui);
        });
        this.root.on("sortupdate", (event, ui) => {
            this.SortUpdate(event, ui);
        });
        this.UpdateItems();
    }
}
Folder.FoldersById = {};
exports.Folder = Folder;
class FolderApp extends App_1.default {
    constructor(itemOptions, folder) {
        super();
        this.itemOptions = itemOptions;
        this.folder = folder;
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            width: 500,
            height: 300,
            icon: this.itemOptions.icon,
            title: this.itemOptions.title,
            resizable: true,
        });
        this.windowObj.folderId = this.folder.id;
        this.windowObj.on("close", () => {
            if (this.folder.root) {
                this.folder.root.remove();
                this.folder.root = null;
            }
            this.folder.UpdateItems();
        });
        if (!this.folder.root) {
            let root = $("<div></div>");
            root.addClass("folderRoot");
            this.folder.UpdateRootElement(root);
        }
        this.windowObj.contentDiv.append(this.folder.root);
    }
}
exports.FolderApp = FolderApp;
//# sourceMappingURL=Folder.js.map
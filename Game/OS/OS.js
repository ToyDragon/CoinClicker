"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDom = require("react-dom");
const React = require("react");
const Folder_1 = require("./Folder");
const Icons_1 = require("../Core/Icons");
const Utils_1 = require("../Core/Utils");
const Wallet_1 = require("../Apps/Crypto/Wallet");
const Pickaxe_1 = require("../Apps/Crypto/Pickaxe");
const WebBrowser_1 = require("../Apps/Browser/WebBrowser");
const Window_1 = require("./Window");
const ContextMenu_1 = require("./ContextMenu");
const Taskbar_1 = require("./Taskbar");
const Email_1 = require("../Apps/General/Email");
const App_1 = require("../Apps/App");
class OS {
    static getSharedData(key) {
        return OS.SharedData[key];
    }
    static setSharedData(key, value) {
        if (typeof (value) === "undefined") {
            value = true;
        }
        OS.SharedData[key] = value;
        const handlers = OS.SharedDataEventHandlers[key];
        if (handlers) {
            for (let handler of handlers) {
                if (handler) {
                    handler();
                }
            }
        }
    }
    static on(key, handler) {
        OS.SharedDataEventHandlers[key] = OS.SharedDataEventHandlers[key] || [];
        OS.SharedDataEventHandlers[key].push(handler);
    }
    static init(root) {
        OS.InitUI(root);
        OS.InitDesktopItems();
        Taskbar_1.default.Init();
        Window_1.default.Init();
        // Wallet.AnimatedAdd("CSH", 80, 20, 250).then(() => {
        // 	Wallet.AnimatedAdd("CSH", 15, 5, 350).then(() => {
        // 		Wallet.AnimatedAdd("CSH", 5, 1, 450);
        // 	});
        // });
        Wallet_1.Wallet.AnimatedAdd("ACN", 4, 2, 200).then(() => {
            Wallet_1.Wallet.AnimatedAdd("ACN", 6, 1, 600);
        });
        OS.WalletApp.ActivateOrCreate();
    }
    static MakeToast(text) {
        let toastDiv = $("<div class=\"toast borderGroove\"></div>");
        toastDiv.text(text);
        $(".item.toasts").append(toastDiv);
        setTimeout(() => {
            toastDiv.remove();
        }, 5000);
    }
    static InitUI(root) {
        let UI = [
            React.createElement("div", { id: "absoluteObjects", key: "a" }),
            React.createElement("div", { id: "desktop", key: "b" },
                React.createElement("div", { className: "logo" }),
                React.createElement("div", { className: "desktopItems folderRoot" })),
            React.createElement("div", { id: "tbDivider", key: "c" }),
            React.createElement("div", { id: "taskbar", key: "d" },
                React.createElement("div", { id: "menu", className: "item borderGroove" },
                    React.createElement("div", { className: "icon" }),
                    React.createElement("div", { className: "title" }, "Coin Clicker")),
                React.createElement("div", { className: "divider item borderGroove" },
                    React.createElement("div", { className: "title" }, "\u00A0")),
                React.createElement("div", { className: "itemGroup appButtons" }),
                React.createElement("div", { className: "item layout" },
                    React.createElement("div", { className: "icon" })),
                React.createElement("div", { className: "item money" },
                    React.createElement("div", { className: "icon" })),
                React.createElement("div", { className: "divider item borderGroove" },
                    React.createElement("div", { className: "title" }, "\u00A0")),
                React.createElement("div", { className: "item clock" },
                    React.createElement("div", { className: "title" })),
                React.createElement("div", { className: "item toasts" }))
        ];
        ReactDom.render(UI, root);
    }
    static MakeDebugApp(cb) {
        const x = new App_1.default();
        x.ActivateOrCreate = () => {
            cb();
        };
        return x;
    }
    static CreateDesktopItem(options) {
        let newItem = new Folder_1.FolderItem(options);
        OS.RootFolder.AddItem(newItem);
    }
    static UpdateClock() {
        let dateObj = new Date();
        $(".clock .title").text(Utils_1.default.DisplayTime(dateObj, true));
    }
    static InitDesktopItems() {
        OS.RootFolder = new Folder_1.Folder({
            root: $(".desktopItems")
        });
        let recyclingBin = new Folder_1.Folder({
            title: "Recycling Bin",
            icon: Icons_1.AllIcons.Garbage,
        });
        OS.RootFolder.AddItem(recyclingBin.item);
        /*
        //Routine based miners
        var minerFolder = folder.createFolder({
            title: "Miners"
        });
        rootFolder.addItem(minerFolder.item);

        var simpleAMiner = miner.createMiner({name : "A (Jenkins)"});
        minerFolder.addItem(simpleAMiner.item);

        var routineFolder = folder.createFolder({
            title: "Routines"
        });
        rootFolder.addItem(routineFolder.item);
        */
        /*
        //Routine stuff
        var jumpItem = folder.createItem({
            title: "Routine- Jump",
            icon: core.icons.code,
            click: activateOrCreateRoutineEditorJump
        });
        routineFolder.addItem(jumpItem);

        var varsItem = folder.createItem({
            title: "Routine- Vars",
            icon: core.icons.code,
            click: activateOrCreateRoutineEditorVars
        });
        routineFolder.addItem(varsItem);

        var fibItem = folder.createItem({
            title: "Routine- Fib",
            icon: core.icons.code,
            click: activateOrCreateRoutineEditorFib
        });
        routineFolder.addItem(fibItem);

        var promptsItem = folder.createItem({
            title: "Routine- Prompts",
            icon: core.icons.code,
            click: activateOrCreateRoutineEditorPromps
        });
        routineFolder.addItem(promptsItem);
        */
        /*
        //RPG testing prompts
        createDesktopItem({
            title: "New Adventurer",
            icon: core.icons.knight,
            click: activateOrCreateNewCharacter
        });
        createDesktopItem({
            title: "Tile Test",
            icon: core.icons.combat,
            click: activateOrCreateTileTest
        });
        */
        OS.WalletApp = new Wallet_1.WalletApp();
        OS.CreateDesktopItem({
            title: "Wallet",
            icon: Icons_1.AllIcons.Wallet,
            app: OS.WalletApp
        });
        OS.BrowserApp = new WebBrowser_1.default();
        OS.CreateDesktopItem({
            title: "Web Browser",
            icon: Icons_1.AllIcons.Browser,
            app: OS.BrowserApp
        });
        OS.EmailApp = new Email_1.EmailApp();
        OS.CreateDesktopItem({
            title: "Email",
            icon: Icons_1.AllIcons.Letter,
            app: OS.EmailApp
        });
        OS.PickaxeApp = new Pickaxe_1.default({});
        OS.CreateDesktopItem({
            title: "Alpha Pickaxe",
            icon: Icons_1.AllIcons.AlphaCoin,
            app: OS.PickaxeApp
        });
        let debugFolder = new Folder_1.Folder({
            title: "Debug",
            canRename: true
        });
        OS.RootFolder.AddItem(debugFolder.item);
        debugFolder.AddItem(new Folder_1.FolderItem({
            title: "100 ACN",
            icon: Icons_1.AllIcons.Frog,
            app: OS.MakeDebugApp(() => { Wallet_1.Wallet.AnimatedAdd("ACN", 100, 100, 100); })
        }));
        debugFolder.AddItem(new Folder_1.FolderItem({
            title: "10000 CSH",
            icon: Icons_1.AllIcons.Frog,
            app: OS.MakeDebugApp(() => { Wallet_1.Wallet.AnimatedAdd("CSH", 10000, 10000, 100); })
        }));
        OS.ClockTimer = setInterval(OS.UpdateClock, 1000);
        OS.UpdateClock();
        $("html").on("keydown", (e) => {
            Window_1.default.NotifyKeydown(e);
        });
        $("html").on("keyup", (e) => {
            Window_1.default.NotifyKeyup(e);
        });
        $("#desktop").on("mousedown", () => {
            ContextMenu_1.default.CloseAllContextMenus();
        });
        $("#desktop").on("contextmenu", (e) => {
            ContextMenu_1.default.CloseAllContextMenus();
            var x = e.pageX;
            var y = e.pageY;
            ContextMenu_1.default.CreateContextMenu({
                x: x,
                y: y,
            }, [
                {
                    title: "New Folder",
                    icon: Icons_1.AllIcons.Folder,
                    click: () => {
                        let newFolder = new Folder_1.Folder({
                            title: "New Folder",
                            canRename: true
                        });
                        OS.RootFolder.AddItem(newFolder.item);
                    }
                }
            ]);
            e.preventDefault();
        });
        $("#menu").on("mousedown", (e) => {
            ContextMenu_1.default.CloseAllContextMenus();
            var x = e.pageX;
            var y = e.pageY;
            ContextMenu_1.default.CreateContextMenu({
                x: x,
                y: y
            }, [
                {
                    title: "Wallet",
                    icon: Icons_1.AllIcons.Wallet,
                    app: OS.WalletApp
                },
                {
                    title: "Web Browser",
                    icon: Icons_1.AllIcons.Browser,
                    app: OS.BrowserApp
                },
            ]);
            e.stopImmediatePropagation();
        });
        $(window).resize(() => { OS.UpdateDesktopHeight(); });
        OS.UpdateDesktopHeight();
    }
    static UpdateDesktopHeight() {
        let rawPadding = $(".desktopItems").css("padding-top");
        let padding = Number(rawPadding.split(/[^0-9.]/)[0]);
        let newHeight = $("#main").outerHeight() - $("#tbDivider").outerHeight() - $("#taskbar").outerHeight() - padding;
        $(".desktopItems").css("height", newHeight + "px");
    }
}
OS.SharedData = {};
OS.SharedDataEventHandlers = {};
exports.OS = OS;
//# sourceMappingURL=OS.js.map
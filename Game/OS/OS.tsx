import * as ReactDom from "react-dom";
import * as React from "react";
import { Folder, FolderItemOptions, FolderItem } from "./Folder";
import { AllIcons } from "../Core/Icons";
import Utils from "../Core/Utils";
import { Wallet, WalletApp } from "../Apps/Crypto/Wallet";
import Pickaxe from "../Apps/Crypto/Pickaxe";
import Browser from "../Apps/Browser/WebBrowser";
import WebosWindow from "./Window";
import ContextMenu from "./ContextMenu";
import Taskbar from "./Taskbar";
import { EmailApp } from "../Apps/General/Email";
import { AboutApp } from "../Apps/General/About";
import { MusicPlayerApp } from "../Apps/General/MusicPlayer";
import App from "../Apps/App";
import StateController from "./StateController";
import Miner from "../Apps/Crypto/Miner";
import { SettingsApp } from "../Apps/General/Settings";
import { PrivacyApp } from "../Apps/General/Privacy";

/* Base class for all shared data keys just to help restrict the intellisense */
export interface SharedDataKeys{
	__shiboleth: any; //TODO why did I add this?
}

export class OS{
	public static RootFolder: Folder;
	public static ClockTimer: NodeJS.Timeout;
	public static WalletApp: WalletApp;
	public static BrowserApp: Browser;
	public static EmailApp: EmailApp;
	public static PickaxeApp: Pickaxe;
	public static AboutApp: AboutApp;
	public static StateController: StateController;
	public static SettingsApp: SettingsApp;
	public static PrivacyApp: PrivacyApp;

	private static SharedData: {[value: string]: any} = {};
	public static SharedDataEventHandlers: {[key: string]: Function[]} = {};

	public static getSharedData(key: string): any;
	public static getSharedData<Keys extends SharedDataKeys>(key: keyof Keys): any;
	public static getSharedData<Keys extends SharedDataKeys, K extends keyof Keys>(key: K): Keys[K];

	public static getSharedData<Keys extends SharedDataKeys, K extends keyof Keys>(key: K | string): Keys[K] | any{
		return OS.SharedData[key as string];
	}

	public static setSharedData(key: string, value?: string): void;
	public static setSharedData<Keys extends SharedDataKeys>(key: keyof Keys, value?: string): void;
	public static setSharedData<Keys extends SharedDataKeys, K extends keyof Keys>(key: K, value?: Keys[K]): void;

	public static setSharedData<Keys extends SharedDataKeys, K extends keyof Keys>(key: K | string, value?: any): void{
		if(typeof(value) === "undefined"){
			value = "1";
		}
		OS.SharedData[key as string] = value;
		const handlers = OS.SharedDataEventHandlers[key as string];
		if(handlers){
			for(let handler of handlers){
				if(handler){
					handler();
				}
			}
		}
	}
	
	public static on<Keys extends SharedDataKeys>(key: keyof Keys, handler: Function): void{
		OS.SharedDataEventHandlers[key as string] = OS.SharedDataEventHandlers[key as string] || [];
		OS.SharedDataEventHandlers[key as string].push(handler);
	}

	public static init(root: HTMLElement): void{
		OS.StateController = new StateController();
		OS.InitUI(root);
		OS.InitDesktopItems();
		Taskbar.Init();
		WebosWindow.Init();

		OS.StateController.AddTrackedObject({
			AfterStateLoaded: () => { },
			GetState: () => {
				let sState = {
					TotalACNMined: Miner.totalMined,
					SharedData: {}
				};
				for(let key in OS.SharedData){
					sState.SharedData[key] = OS.SharedData[key];
				}
				return {
					sState: sState
				}
			},
			GetStateKey: () => { return "SharedData"; },
			LoadState: (_nState: any, sState: any) => {
				if(sState){
					if(sState.SharedData){
						for(let key in sState.SharedData){
							OS.SharedData[key] = sState.SharedData[key];
						}
					}
					Miner.totalMined = Number(sState.TotalACNMined);
				}
			}
			
		});

		OS.StateController.LoadData();

		OS.WalletApp.ActivateOrCreate();
		OS.EmailApp.ActivateOrCreate();

		window.onbeforeunload = () => {
			OS.StateController.SaveData();
		}

		setInterval(() => {
			OS.StateController.SaveData();
		}, 10000);
	}

	public static MakeToast(text: string): void{
		let toastDiv = $("<div class=\"toast borderGroove\"></div>");
		toastDiv.text(text);
		$(".item.toasts").append(toastDiv);
		setTimeout(() => {
			toastDiv.remove();
		}, 5000)
	}

	public static InitUI(root: HTMLElement): void{
		let UI = [
			<div id="absoluteObjects" key="a"></div>,
			<div id="desktop" key="b">
				<div className="logo"></div>
				<div className="desktopItems folderRoot"></div>
			</div>,
			<div id="tbDivider" key="c"></div>,
			<div id="taskbar" key="d">
				<div id="menu" className="item borderGroove">
					<div className="icon"></div>
					<div className="title">Coin Clicker</div>
				</div>
				<div className="divider item borderGroove">
					<div className="title">&nbsp;</div>
				</div>
				<div className="itemGroup appButtons">
				</div>
				<div className="item email compact">
					<div className="icon"></div>
				</div>
				<div className="item layout compact">
					<div className="icon"></div>
				</div>
				<div className="item money compact">
					<div className="icon"></div>
				</div>
				<div className="divider item borderGroove">
					<div className="title">&nbsp;</div>
				</div>
				<div className="item clock">
					<div className="title"></div>
				</div>
				<div className="item toasts">
				</div>
			</div>
		];

		ReactDom.render(UI, root);
	}

	private static MakeDebugApp(cb: Function){
		const x = new App();
		x.ActivateOrCreate = () => {
			cb();
		}
		return x;
	}

	public static CreateDesktopItem(options: FolderItemOptions): void{
		let newItem = new FolderItem(options);
		OS.RootFolder.AddItem(newItem);
	}

	public static UpdateClock(): void{
		let dateObj = new Date();
		$(".clock .title").text(Utils.DisplayTime(dateObj, true));
	}

	public static InitDesktopItems(): void{
		OS.RootFolder = new Folder({
			root: $(".desktopItems")
		});

		let recyclingBin = new Folder({
			title: "Recycling Bin",
			icon: AllIcons.Garbage,
		});
		OS.RootFolder.AddItem(recyclingBin.item);

		let metaFolder = new Folder({
			title: "Meta",
			canRename: false
		});
		OS.RootFolder.AddItem(metaFolder.item);

		OS.AboutApp = new AboutApp();
		metaFolder.AddItem(new FolderItem({
			title: "About",
			icon: AllIcons.Frog,
			app: OS.AboutApp
		}));

		OS.PrivacyApp = new PrivacyApp();
		metaFolder.AddItem(new FolderItem({
			title: "Privacy",
			icon: AllIcons.Frog,
			app: OS.PrivacyApp
		}));

		OS.SettingsApp = new SettingsApp();
		metaFolder.AddItem(new FolderItem({
			title: "Settings",
			icon: AllIcons.Frog,
			app: OS.SettingsApp
		}));

		OS.WalletApp = new WalletApp();
		OS.CreateDesktopItem({
			title: "Wallet",
			icon: AllIcons.Wallet,
			app: OS.WalletApp
		});

		OS.BrowserApp = new Browser();
		OS.CreateDesktopItem({
			title: "Web Browser",
			icon: AllIcons.Browser,
			app: OS.BrowserApp
		});

		OS.EmailApp = new EmailApp();
		OS.CreateDesktopItem({
			title: "Email",
			icon: AllIcons.Letter,
			app: OS.EmailApp
		});

		OS.PickaxeApp = new Pickaxe({});
		OS.CreateDesktopItem({
			title: "Alpha Pickaxe",
			icon: AllIcons.AlphaCoin,
			app: OS.PickaxeApp
		});

		if(Utils.DebugEnabled()){	
			let debugFolder = new Folder({
				title: "Debug",
				canRename: true
			});
			OS.RootFolder.AddItem(debugFolder.item);

			debugFolder.AddItem(new FolderItem({
				title: "100 ACN",
				icon: AllIcons.Frog,
				app: OS.MakeDebugApp(() => {Wallet.AnimatedAdd("ACN",100,100,100)})
			}));
			debugFolder.AddItem(new FolderItem({
				title: "10000 CSH",
				icon: AllIcons.Frog,
				app: OS.MakeDebugApp(() => {Wallet.AnimatedAdd("CSH",10000,10000,100)})
			}));
		}

		OS.ClockTimer = setInterval(OS.UpdateClock, 1000);
		OS.UpdateClock();

		$("html").on("keydown", (e) => {
			WebosWindow.NotifyKeydown(e);
		});
		$("html").on("keyup", (e) => {
			WebosWindow.NotifyKeyup(e);
		});
		$("#desktop").on("mousedown", () => {
			ContextMenu.CloseAllContextMenus();
		});
		$("#desktop").on("contextmenu", (e) => {
			ContextMenu.CloseAllContextMenus();
			var x = e.pageX;
			var y = e.pageY;

			ContextMenu.CreateContextMenu({
					x: x,
					y: y,
				}, [
				{
					title: "New Folder",
					icon: AllIcons.Folder,
					click: () => {
						let newFolder = new Folder({
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
			ContextMenu.CloseAllContextMenus();
			var x = e.pageX;
			var y = e.pageY;

			ContextMenu.CreateContextMenu({
				x: x,
				y: y
			},[
			{
				title: "Wallet",
				icon: AllIcons.Wallet,
				app: OS.WalletApp
			},
			{
				title: "Web Browser",
				icon: AllIcons.Browser,
				app: OS.BrowserApp
			},
			{
				title: "About",
				icon: AllIcons.Frog,
				app: OS.AboutApp
			},
			{
				title: "Privacy",
				icon: AllIcons.Frog,
				app: OS.PrivacyApp
			}
			/*{
				divider: true
			}
			,
			{
				title: "About Knightsway",
				icon: core.icons.knight,
				click: activateOrCreateAbout
			},
			{
				title: "Credits",
				icon: core.icons.knight
			},
			{
				title: "Clear Save",
				icon: core.icons.help,
				click: clearSaveData
			}
			*/
			]);
			e.stopImmediatePropagation();
		});

		$(window).resize(() => {OS.UpdateDesktopHeight();});
		OS.UpdateDesktopHeight();
	}

	private static UpdateDesktopHeight(): void{
		let rawPadding = $(".desktopItems").css("padding-top");
		let padding = Number(rawPadding.split(/[^0-9.]/)[0]);
		let newHeight = $("#main").outerHeight() - $("#tbDivider").outerHeight() - $("#taskbar").outerHeight() - padding;
		$(".desktopItems").css("height",newHeight + "px");
	}
}
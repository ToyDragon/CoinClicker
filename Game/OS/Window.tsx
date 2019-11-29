import { IconDescriptor, AllIcons, IconDetails } from "../Core/Icons";
import Observable from "../Core/Observable";
import Utils, { AssetLocation } from "../Core/Utils";
import Taskbar from "./Taskbar";
import ContextMenu from "./ContextMenu"
import { OS } from "./OS";
import { connect } from "net";

export interface WebosWindowOptions{
    width?: number;
    height?: number;
    icon: IconDescriptor;
    title: string;
    resizable?: boolean;
    noclose?: boolean;
    background?: boolean;
    highlight?: boolean;

    innerWidth?: number;
    innerHeight?: number;

    x?: number;
    y?: number;
}

class AnimationElement{
    public constructor(shiftX: number, shiftY: number, duration: number){
        this.shiftX = shiftX;
        this.shiftY = shiftY;
        this.duration = duration;
    }

    public shiftX: number;
    public shiftY: number;
    public duration: number;
}

interface Events{
	keydown;
	keyup;
	close;
	resize;
	deactivate;
	activate;
}

enum LayoutMode{
	Anarchy = 1,
	Order = 2
}

export default class WebosWindow extends Observable<Events>{

	public static WindowOrder: string[] = [];
    public static AllWindows: {[windowId: string]: WebosWindow} = {};
    public static HighestZIndex = 1;
    public static LastWindowId = 0;
    public static AutoPosCount = 0;
    public static AutoOffset = 60;
    public static InactiveX = -10000;
	public static InactiveY = -10000;
	public static layoutMode: LayoutMode;

    public static AnimationSmallBox(): AnimationElement[]{
        return [
			new AnimationElement(-50,-50, 400),
			new AnimationElement( 50,-50, 400),
			new AnimationElement( 50, 50, 400),
			new AnimationElement(-50, 50, 400),
		];
    }

    public static AnimationShakeBox(): AnimationElement[]{
        return [
			new AnimationElement(-10, 0, 50),
			new AnimationElement( 10, 0, 50),
			new AnimationElement(-10, 0, 50),
			new AnimationElement( 10, 0, 50),
			new AnimationElement(-10, 0, 50),
			new AnimationElement( 10, 0, 50),
		];
    }

	public static GetWindowsOrderedByZ(){
		let windowList = [];
		for(let id in WebosWindow.AllWindows){
			windowList.push(WebosWindow.AllWindows[id]);
		}
		windowList.sort((a,b) => {return (a.zindex > b.zindex || b.minimized);});
		return windowList;
    }

	public static GetWindowAtPos(x: number, y: number): WebosWindow{
		let windowList = WebosWindow.GetWindowsOrderedByZ();
		for(let i = windowList.length - 1; i >= 0; i--){
			let windowObj = windowList[i];
			let container = windowObj.windowContainer;
			if(x > container.offset().left && x < (container.offset().left + container.outerWidth())
			&& y > container.offset().top  && y < (container.offset().top  + container.outerHeight())){
				return windowObj;
			}
		}

		return null;
    }

	public static GetWindowById(windowId: string): WebosWindow{
		return WebosWindow.AllWindows[windowId];
	}

	public static GetWindowIdByTitle(title: string): string{
		for(let id in WebosWindow.AllWindows){
			let windowObj = WebosWindow.AllWindows[id];
			if(windowObj.title == title){
				return id;
			}
		}
		return "";
	}

	public static GetActiveWindow(): string{
		for(var windowId in WebosWindow.AllWindows){
			if(WebosWindow.AllWindows[windowId].active) return windowId;
		}
		return "";
	}

	public static ActivateNextWindow(reverse: boolean): void{
		let windowArr = WebosWindow.WindowOrder;
		if(!windowArr || windowArr.length === 0){
			windowArr = [];
			for(let windowId in WebosWindow.AllWindows){
				windowArr.push(windowId);
			}
		}

		let start = 0, direction = 1;
		if(reverse){
			start = windowArr.length-1;
			direction = -1;
		}

		let windowToActivate = "";
		let firstWindowId = "";
		let activateNext = false;
		for(let i = start; i < windowArr.length && i >= 0; i += direction){
			let windowId = windowArr[i];
			if(firstWindowId == ""){
				firstWindowId = windowId;
			}
			if(activateNext){
				windowToActivate = windowId;
				activateNext = false;
			}
			if(WebosWindow.AllWindows[windowId].active){
				activateNext=true;
			}
		}
		if(activateNext){
			windowToActivate = firstWindowId;
			activateNext = false;
		}

		if(windowToActivate){
			WebosWindow.AllWindows[windowToActivate].ActivateWindow(false);
		}
	}

    public static NotifyKeydown(event: JQuery.Event): void{
		if(event.keyCode == 9){
			WebosWindow.ActivateNextWindow(!!(window.event as any).shiftKey);
			event.preventDefault();
			return;
		}

		if(event.keyCode == 27){
			var activeId = WebosWindow.GetActiveWindow();
			if(activeId){
				WebosWindow.ActivateNextWindow(true);
				WebosWindow.AllWindows[activeId].CloseWindow(false);
			}
			event.preventDefault();
			return;
		}

		for(var windowId in WebosWindow.AllWindows){
			var windowObj = WebosWindow.AllWindows[windowId];
			if(windowObj.active){
				windowObj.trigger("keydown", event);
			}
		}
	}
	
    public static NotifyKeyup(event: JQuery.Event): void{
		for(var windowId in WebosWindow.AllWindows){
			var windowObj = WebosWindow.AllWindows[windowId];
			if(windowObj.active){
				windowObj.trigger("keyup", event);
			}
		}
	}

	public static RepositionWindows(): void{
		if(WebosWindow.layoutMode === LayoutMode.Order){
			WebosWindow.RepositionWindowsOrdered();
		}
	}

	public static RepositionWindowsOrdered(): void{
		let windowList: WebosWindow[] = [];
		for(let id in WebosWindow.AllWindows){
			const window = WebosWindow.AllWindows[id];
			if(!window.minimized){
				windowList.push(window);
			}
		}

		windowList.sort((a, b) => {
			const sizeA = a.GetSize();
			const sizeB = b.GetSize();
			if(sizeA.y > sizeB.y) return -1;
			if(sizeA.y < sizeB.y) return 1;

			if(sizeA.x > sizeB.x) return -1;
			if(sizeA.x < sizeB.x) return 1;

			return 0;
		});

		const desktopWidth = $("#desktop").outerWidth();
		const buffer = 5;
		const newRowLeftOffset = 96 + 20; //96 = desktop item width, 20 = item padding on left and right
		
		let rowTop = buffer;
		let rowBottom = buffer;
		let rowOffset = 0;

		let colLeft = desktopWidth; //Initialze to far right of screen so the first row hits the "New Row" code.
		let colRight = colLeft;
		//no colOffset because windows are always left aligned in the column

		WebosWindow.WindowOrder = [];

		while(windowList.length > 0){
			let window = windowList.splice(0, 1)[0];
			let size = window.GetSize();

			if(colRight + size.x <= desktopWidth){
				//New stack on this row
				colLeft = colRight + buffer;
			}else{
				//New stack on next row
				rowTop = rowBottom + buffer;
				rowBottom = rowTop + size.y;
				colLeft = newRowLeftOffset;
			}

			colRight = colLeft + size.x;
			rowOffset = size.y + buffer;
			window.SetPos(colLeft, rowTop);
			WebosWindow.WindowOrder.push(window.id);

			//Fill stack
			for(let i = 1; i < windowList.length; i++){
				window = windowList[i];
				size = window.GetSize();
				if(rowTop + rowOffset + size.y <= rowBottom){  //Window fits in stack
					window.SetPos(colLeft, rowTop + rowOffset + buffer);
					colRight = Math.max(colLeft + size.x, colRight);
					rowOffset += size.y + buffer;
					WebosWindow.WindowOrder.push(window.id);

					windowList.splice(i, 1);
					i--;
				}
			}
		}
	}

	public static UpdateLayoutButton(): void{
		let layoutElement = $(".item.layout > .icon");

		let icon: IconDetails;
		let tooltip: string = "";
		if(WebosWindow.layoutMode === LayoutMode.Order){
			icon = AllIcons.LayoutSquares.large.dark;
			tooltip = "Switch to Anarchy layout mode."
		}else{
			icon = AllIcons.LayoutSquaresDisabled.large.dark;
			tooltip = "Switch to Order layout mode."
		}
		layoutElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
		layoutElement.css("width", icon.width + "px");
		layoutElement.css("height", icon.height + "px");
		layoutElement.attr("title", tooltip);
	}
	
	public static Init(): void{
		let layoutElement = $(".item.layout > .icon");
		WebosWindow.layoutMode = LayoutMode.Order;

		$(window).on("resize", () => {this.RepositionWindows();});

		layoutElement.on("click", () => {
			if(WebosWindow.layoutMode == LayoutMode.Anarchy){
				WebosWindow.layoutMode = LayoutMode.Order;
			}else{
				WebosWindow.layoutMode = LayoutMode.Anarchy;
				WebosWindow.WindowOrder = [];
			}

			WebosWindow.RepositionWindows();
			WebosWindow.UpdateLayoutButton();
		});
		WebosWindow.UpdateLayoutButton();
	}

    public contentDiv: JQuery;
    public folderId: string;
    public title: string;
    public id: string;
    public animationData: RunningAnimationData;
    public active: boolean;
    public icon: IconDescriptor;

    public minimized: boolean;
    public closed: boolean;

    public zindex: number;

    public width: number;
    public height: number;

    public storedX: number;
    public storedY: number;
    
    public windowContainer: JQuery;
    public titleDiv: JQuery;
    public iconElement: JQuery;

    private locked: number;

    public Lock(): void{
        if(this.locked == 0){
            this.windowContainer.draggable("disable");
        }
        this.locked++;
    }

    public Unlock(): void{
        this.locked--;
        if(this.locked <= 0){
            this.locked = 0;
            this.windowContainer.draggable("enable");
        }
    }

    public UpdateTitle(): void{
        this.titleDiv.text(this.title);
    }

    public GetPos(): {x: number, y: number}{
		return {
			x: Utils.TrimUnit(this.windowContainer.css("left")),
			y: Utils.TrimUnit(this.windowContainer.css("top"))
		};
	}
	
    public SetPos(x: number, y: number){
		this.windowContainer.css("left", x);
		this.windowContainer.css("top", y);
    }
    
    public CloseWindow(dontNotifyOthers: boolean): void{
        if(this.locked || this.closed)
        {
            return;
        }
		this.windowContainer.remove();
		this.closed = true;
		delete WebosWindow.AllWindows[this.id];
		this.trigger("close");
		WebosWindow.RepositionWindows();

		if(!dontNotifyOthers){
			Taskbar.RemoveButton(this.id);
			ContextMenu.CloseAllContextMenus();
		}
    }

    public MinimizeWindow(dontNotifyOthers: boolean): void{
		if(this.locked) return;
		var pos = this.GetPos();
		this.storedX = pos.x;
		this.storedY = pos.y;
		this.minimized = true;
		this.windowContainer.css("left", WebosWindow.InactiveX + "px");
		this.windowContainer.css("top", WebosWindow.InactiveY + "px");
		if(!dontNotifyOthers){
			if(this.active){
				Taskbar.ToggleButton(this.id, true);
			}
			ContextMenu.CloseAllContextMenus();
		}
		this.active = false;
		WebosWindow.RepositionWindows();
    }

    public ActivateWindow(dontNotifyOthers: boolean): void{
		for(let otherWindowId in WebosWindow.AllWindows){
			if(otherWindowId == this.id) continue;
			let windowObject = WebosWindow.AllWindows[otherWindowId];
			if(windowObject.active){
				windowObject.active = false;
				windowObject.windowContainer.removeClass("active");
				windowObject.trigger("deactivate");
				Taskbar.ToggleButton(windowObject.id, true);
			}
		}
        if(this.active)
        {
            return;
        }
		var pos = this.GetPos();
		if(pos.x == WebosWindow.InactiveX && pos.y == WebosWindow.InactiveY){
			var newX = this.storedX || 400;
			var newY = this.storedY || 400;

			this.windowContainer.css("left", newX + "px");
			this.windowContainer.css("top", newY + "px");
		}
		if(this.minimized){
			this.minimized = false;
			WebosWindow.RepositionWindows();
		}
		this.active = true;
		this.windowContainer.addClass("active");
		this.zindex = WebosWindow.HighestZIndex++;
		this.windowContainer.css("z-index", this.zindex);
		this.trigger("activate");
		if(!dontNotifyOthers){
			Taskbar.ToggleButton(this.id, true);
			ContextMenu.CloseAllContextMenus();
		}
	}

	public GetSize(): {x: number, y: number}{
		return {
			x: Utils.TrimUnit(this.windowElement.css("width")),
			y: Utils.TrimUnit(this.windowElement.css("height")),
		};
	}
	
	public SetSize(width: number, height: number, isInner: boolean): void{
		this.width = width;
		this.height = height;

		if(isInner){
			this.width += 10;
			this.height += 40;
		}

		this.windowElement.css("width", this.width);
		this.windowElement.css("height", this.height);
		this.contentDiv.css("height", this.height - 40);
		this.contentDiv.css("width", this.width - 10);

		WebosWindow.RepositionWindows();
	}

	private windowElement: JQuery<HTMLDivElement>;

    public constructor(options: WebosWindowOptions){
        super();

		this.locked = 0;

		WebosWindow.LastWindowId++;
		this.id = WebosWindow.LastWindowId.toString();
        this.icon = options.icon;
		this.windowContainer = $("<div></div>");
		this.windowContainer.addClass("windowContainer");
		WebosWindow.AllWindows[this.id] = this;

		this.width = options.width || (options.innerWidth && (options.innerWidth + 10)) || 400;
		this.height = options.height || (options.innerHeight && (options.innerHeight + 40)) || 300;
		var y = options.y;
		var x = options.x;
		if(!x && !y){
			var yoffset = (WebosWindow.AutoPosCount % 4) * WebosWindow.AutoOffset - Math.floor(WebosWindow.AutoPosCount / 4) * WebosWindow.AutoOffset;
			var xoffset = Math.floor(WebosWindow.AutoPosCount / 4) * WebosWindow.AutoOffset + (WebosWindow.AutoPosCount % 4) * WebosWindow.AutoOffset;
			x = Math.floor(($("#desktop").outerWidth() - this.width)/2 + xoffset);
			y = Math.floor(($("#desktop").outerHeight() - this.height)/2 + yoffset);
			WebosWindow.AutoPosCount++;
			WebosWindow.AutoPosCount = WebosWindow.AutoPosCount % 16;
		}
		this.windowContainer.css("left", x);
		this.windowContainer.css("top", y);

		this.windowElement = $("<div></div>");
		this.windowElement.addClass("window borderGroove");
		this.windowElement.css("width", this.width);
		this.windowElement.css("height", this.height);
		this.windowContainer.append(this.windowElement);

		var titlebarElement = $("<div></div>");
		titlebarElement.addClass("titlebar");
		var iconElement = $("<div></div>");
		iconElement.addClass("icon");
		titlebarElement.append(iconElement);
		this.iconElement = iconElement;

		var titleDiv = $("<div></div>");
		titleDiv.addClass("title");
		titlebarElement.append(titleDiv);
		this.titleDiv = titleDiv;
		this.title = options.title;
		this.UpdateTitle();

		var endingSection = $("<div></div>");
		endingSection.addClass("end");
		titlebarElement.append(endingSection);

		var actionMinimize = $("<div></div>");
		actionMinimize.addClass("action minimize borderGroove");
		var minimizeTitle = $("<div></div>");
		minimizeTitle.text("_");
		minimizeTitle.addClass("title");
		actionMinimize.append(minimizeTitle);
		endingSection.append(actionMinimize);
		actionMinimize.on("mousedown", () => {
			this.MinimizeWindow(false);
		});

		if(!options.noclose){
			var actionClose = $("<div></div>");
			actionClose.addClass("action close borderGroove");
			var closeTitle = $("<div></div>");
			closeTitle.text("X");
			closeTitle.addClass("title");
			actionClose.append(closeTitle);
			endingSection.append(actionClose);
			actionClose.on("mousedown", () => {
				this.CloseWindow(false);
			});
		}

		this.windowElement.append(titlebarElement);

		this.contentDiv = $("<div></div>");
		this.contentDiv.addClass("content borderRidge");
		this.contentDiv.css("height", this.height - 40);
		this.contentDiv.css("width", this.width - 10);
		this.contentDiv.text(" ");
		this.windowElement.append(this.contentDiv);

		if(options.resizable){
			var dragIndicator = $("<div></div>");
			dragIndicator.addClass("dragIndicator");

			for(var i = 0; i < 5; i++){
				var dragLine = $("<div></div>");
				dragLine.addClass("dragLine");
				dragIndicator.append(dragLine);
			}

			var dragging = false;
			var lastX = 0;
			var lastY = 0;

			this.windowElement.append(dragIndicator);
			dragIndicator.on("mousedown", (e) => {
				dragging = true;

				lastX = e.pageX;
				lastY = e.pageY;
			});

			$("body").on("mouseup", (e) => {
				dragging = false;
			});

			$("body").on("mousemove", (e) => {
				if(dragging){
					var didResize = false;
					var dx = e.pageX - lastX;
					var oldWidth = Utils.TrimUnit(this.contentDiv.css("width"));
					if(oldWidth + dx >= 300 && oldWidth + dx <= 900){
						this.contentDiv.css("width", (oldWidth + dx) + "px");
						this.windowElement.css("width", (oldWidth + dx + 10) + "px");
						this.width = (oldWidth + dx + 10);
						didResize = true;
						lastX = e.pageX;
					}

					var dy = e.pageY - lastY;
					var oldHeight = Utils.TrimUnit(this.contentDiv.css("height"));
					if(oldHeight + dy >= 200 && oldHeight + dy <= 600){
						this.contentDiv.css("height", (oldHeight + dy) + "px");
						this.windowElement.css("height", (oldHeight + dy + 40) + "px");
						this.height = (oldHeight + dy + 40);
						didResize = true;
						lastY = e.pageY;
					}
					
					if(didResize){
						this.trigger("resize");
					}
				}
			});
		}

		Taskbar.AddButtonForWindow(this.id, {
			title: options.title,
			highlight: options.highlight,
			icon: options.icon
        });

		$("#desktop").append(this.windowContainer);
        this.windowContainer.draggable();
        let windowObject = this;
		this.windowElement.on("mousedown", function(e){
			ContextMenu.CloseAllContextMenus();

			var diff = e.pageY - $(this).offset().top;
			if(diff > 33){
				e.stopPropagation();
				//prevent drag from happening
			}
			windowObject.ActivateWindow(false);
		});

		this.windowContainer.on("contextmenu", (e) =>{
			e.stopPropagation();
		});
		this.windowContainer.find(".window > *").on("mousedown", (e) => {
			ContextMenu.CloseAllContextMenus();
			this.ActivateWindow(false);
		});
		this.windowContainer.find(".window > .content, .window > .titlebar .action").on("mousedown", (e) => {
			ContextMenu.CloseAllContextMenus();
			e.stopPropagation();
		});

		if(!options.background){
			this.ActivateWindow(false);
			WebosWindow.RepositionWindows();
		}

		this.UpdateIcon();
		WebosWindow.RepositionWindows();
        this.on("activate", () => { this.UpdateIcon(); });
        this.on("deactivate", () => { this.UpdateIcon(); });
    }

    public UpdateIcon(): void{
        var icon = this.active ? this.icon.small.light : this.icon.small.dark;
        this.iconElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
        this.iconElement.css("width", icon.width);
        this.iconElement.css("height", icon.height);
    }

    public CancelAnimation(): void{

    }

	public StartAnimation(animation: AnimationElement[]): void{
		if(this.animationData){
			this.CancelAnimation();
		}

		this.animationData = new RunningAnimationData(this);
		this.animationData.frames = animation;
		this.animationData.currentFrame = 0;
		this.Lock();
		this.animationData.StartFrame();
	}
}

class RunningAnimationData{
    public window: WebosWindow;
    public frames: AnimationElement[];
    public currentFrame: number;

    public constructor(window: WebosWindow){
        this.window = window;
    }
    
    public StartFrame(): void{
        if(this.currentFrame == this.frames.length){
            this.window.Unlock();
            return;
        }

        var frame = this.frames[this.currentFrame];

        this.window.windowContainer.animate({
                left: "+="+frame.shiftX,
                top: "+="+frame.shiftY,
            }, {
                duration: frame.duration,
                easing: "linear",
                complete: () => {
                    this.currentFrame++;
                    this.StartFrame();
                }
            }
        );
    }
}
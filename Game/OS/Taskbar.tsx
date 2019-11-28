import { IconDescriptor, AllIcons } from "../Core/Icons";
import ContextMenu from "./ContextMenu";
import WebosWindow from "./Window";
import { AssetLocation } from "../Core/Utils";

interface TaskbarOptions{
    title: string;
    icon: IconDescriptor;
    highlight?: boolean;
}

export class TaskbarButton{
    public element: JQuery;
}

export default class Taskbar{

    public static Buttons: {[ownerWindowId: string]: TaskbarButton}; 

    public static Init(): void{
		$("#taskbar").on("mousedown", () => {
			ContextMenu.CloseAllContextMenus();
		});
		
		$(window).on("resize", (_event: JQuery.Event) => {
			let targetWidth = $("#taskbar").outerWidth() - 40;
			$("#taskbar > .item").each((_i, ele) => {
				targetWidth -= $(ele).outerWidth();
			});
			$("#taskbar > .itemGroup").css("width", targetWidth + "px");
		});
		
		
		let iconElement = $("#menu > .icon");
		let icon = AllIcons.Frog.large.dark;
		iconElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
		iconElement.css("width", icon.width + "px");
        iconElement.css("height", icon.height + "px");
        
        Taskbar.Buttons = {};
    }

    public static ToggleButton(windowId: string, dontNotifyOthers: boolean): void{
		let buttonObj = Taskbar.Buttons[windowId];
		if(!buttonObj) return;
		if(buttonObj.element.hasClass("borderGroove")){
			buttonObj.element.removeClass("borderGroove");
			buttonObj.element.addClass("borderRidge");
            //activate window
            console.log("Activate taskbar btn " + windowId);
			if(!dontNotifyOthers){
                let window = WebosWindow.AllWindows[windowId];
                if(window){
                    window.ActivateWindow(true);
                }else{
                    console.log("Can't find window " + windowId);
                }
				ContextMenu.CloseAllContextMenus();
			}
		}else{
			buttonObj.element.addClass("borderGroove");
			buttonObj.element.removeClass("borderRidge");
            //minimize window
            console.log("Deactivate taskbar btn " + windowId);
			if(!dontNotifyOthers){
				WebosWindow.AllWindows[windowId].MinimizeWindow(true);
				ContextMenu.CloseAllContextMenus();
			}
		}
    }

    public static RemoveButton(windowId: string): void{
		let buttonObj = Taskbar.Buttons[windowId];
		if(!buttonObj) return;
		buttonObj.element.remove();
		delete Taskbar.Buttons[windowId];
    }

    public static AddButtonForWindow(windowId: string, options: TaskbarOptions): void{
		let itmButton = $("<div></div>");
		itmButton.addClass("item borderGroove");
		if(options && options.highlight){
			itmButton.addClass("highlight");
		}
		
		if(options && options.icon){
			var iconElement = $("<div></div>");
			iconElement.addClass("icon");
			var icon = options.icon.large.dark;
			iconElement.css("background-image","url(\"" + AssetLocation + icon.id + "\")");
			iconElement.css("width", icon.width + "px");
			iconElement.css("height", icon.height + "px");
			itmButton.append(iconElement);
		}
		
		if(options && options.title){
			var titleElement = $("<div></div>");
			titleElement.addClass("title");
			titleElement.text(options.title);
			itmButton.append(titleElement);
		}
		
		itmButton.on("click", (_e) => {
			Taskbar.ToggleButton(windowId, false);
		});
		
		$(".appButtons").append(itmButton);
		let buttonObj = new TaskbarButton();
		buttonObj.element = itmButton;
		Taskbar.Buttons[windowId] = buttonObj;
    }

}
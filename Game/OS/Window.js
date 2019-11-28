"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Icons_1 = require("../Core/Icons");
const Observable_1 = require("../Core/Observable");
const Utils_1 = require("../Core/Utils");
const Taskbar_1 = require("./Taskbar");
const ContextMenu_1 = require("./ContextMenu");
class AnimationElement {
    constructor(shiftX, shiftY, duration) {
        this.shiftX = shiftX;
        this.shiftY = shiftY;
        this.duration = duration;
    }
}
var LayoutMode;
(function (LayoutMode) {
    LayoutMode[LayoutMode["Anarchy"] = 1] = "Anarchy";
    LayoutMode[LayoutMode["Order"] = 2] = "Order";
})(LayoutMode || (LayoutMode = {}));
class WebosWindow extends Observable_1.default {
    constructor(options) {
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
        if (!x && !y) {
            var yoffset = (WebosWindow.AutoPosCount % 4) * WebosWindow.AutoOffset - Math.floor(WebosWindow.AutoPosCount / 4) * WebosWindow.AutoOffset;
            var xoffset = Math.floor(WebosWindow.AutoPosCount / 4) * WebosWindow.AutoOffset + (WebosWindow.AutoPosCount % 4) * WebosWindow.AutoOffset;
            x = Math.floor(($("#desktop").outerWidth() - this.width) / 2 + xoffset);
            y = Math.floor(($("#desktop").outerHeight() - this.height) / 2 + yoffset);
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
        if (!options.noclose) {
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
        if (options.resizable) {
            var dragIndicator = $("<div></div>");
            dragIndicator.addClass("dragIndicator");
            for (var i = 0; i < 5; i++) {
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
                if (dragging) {
                    var didResize = false;
                    var dx = e.pageX - lastX;
                    var oldWidth = Utils_1.default.TrimUnit(this.contentDiv.css("width"));
                    if (oldWidth + dx >= 300 && oldWidth + dx <= 900) {
                        this.contentDiv.css("width", (oldWidth + dx) + "px");
                        this.windowElement.css("width", (oldWidth + dx + 10) + "px");
                        this.width = (oldWidth + dx + 10);
                        didResize = true;
                        lastX = e.pageX;
                    }
                    var dy = e.pageY - lastY;
                    var oldHeight = Utils_1.default.TrimUnit(this.contentDiv.css("height"));
                    if (oldHeight + dy >= 200 && oldHeight + dy <= 600) {
                        this.contentDiv.css("height", (oldHeight + dy) + "px");
                        this.windowElement.css("height", (oldHeight + dy + 40) + "px");
                        this.height = (oldHeight + dy + 40);
                        didResize = true;
                        lastY = e.pageY;
                    }
                    if (didResize) {
                        this.trigger("resize");
                    }
                }
            });
        }
        Taskbar_1.default.AddButtonForWindow(this.id, {
            title: options.title,
            highlight: options.highlight,
            icon: options.icon
        });
        $("#desktop").append(this.windowContainer);
        this.windowContainer.draggable();
        let windowObject = this;
        this.windowElement.on("mousedown", function (e) {
            ContextMenu_1.default.CloseAllContextMenus();
            var diff = e.pageY - $(this).offset().top;
            if (diff > 33) {
                e.stopPropagation();
                //prevent drag from happening
            }
            windowObject.ActivateWindow(false);
        });
        this.windowContainer.on("contextmenu", (e) => {
            e.stopPropagation();
        });
        this.windowContainer.find(".window > *").on("mousedown", (e) => {
            ContextMenu_1.default.CloseAllContextMenus();
            this.ActivateWindow(false);
        });
        this.windowContainer.find(".window > .content, .window > .titlebar .action").on("mousedown", (e) => {
            ContextMenu_1.default.CloseAllContextMenus();
            e.stopPropagation();
        });
        if (!options.background) {
            this.ActivateWindow(false);
            WebosWindow.RepositionWindows();
        }
        this.UpdateIcon();
        WebosWindow.RepositionWindows();
        this.on("activate", () => { this.UpdateIcon(); });
        this.on("deactivate", () => { this.UpdateIcon(); });
    }
    static AnimationSmallBox() {
        return [
            new AnimationElement(-50, -50, 400),
            new AnimationElement(50, -50, 400),
            new AnimationElement(50, 50, 400),
            new AnimationElement(-50, 50, 400),
        ];
    }
    static AnimationShakeBox() {
        return [
            new AnimationElement(-10, 0, 50),
            new AnimationElement(10, 0, 50),
            new AnimationElement(-10, 0, 50),
            new AnimationElement(10, 0, 50),
            new AnimationElement(-10, 0, 50),
            new AnimationElement(10, 0, 50),
        ];
    }
    static GetWindowsOrderedByZ() {
        let windowList = [];
        for (let id in WebosWindow.AllWindows) {
            windowList.push(WebosWindow.AllWindows[id]);
        }
        windowList.sort((a, b) => { return (a.zindex > b.zindex || b.minimized); });
        return windowList;
    }
    static GetWindowAtPos(x, y) {
        let windowList = WebosWindow.GetWindowsOrderedByZ();
        for (let i = windowList.length - 1; i >= 0; i--) {
            let windowObj = windowList[i];
            let container = windowObj.windowContainer;
            if (x > container.offset().left && x < (container.offset().left + container.outerWidth())
                && y > container.offset().top && y < (container.offset().top + container.outerHeight())) {
                return windowObj;
            }
        }
        return null;
    }
    static GetWindowById(windowId) {
        return WebosWindow.AllWindows[windowId];
    }
    static GetWindowIdByTitle(title) {
        for (let id in WebosWindow.AllWindows) {
            let windowObj = WebosWindow.AllWindows[id];
            if (windowObj.title == title) {
                return id;
            }
        }
        return "";
    }
    static GetActiveWindow() {
        for (var windowId in WebosWindow.AllWindows) {
            if (WebosWindow.AllWindows[windowId].active)
                return windowId;
        }
        return "";
    }
    static ActivateNextWindow(reverse) {
        let windowArr = WebosWindow.WindowOrder;
        if (!windowArr || windowArr.length === 0) {
            windowArr = [];
            for (let windowId in WebosWindow.AllWindows) {
                windowArr.push(windowId);
            }
        }
        let start = 0, direction = 1;
        if (reverse) {
            start = windowArr.length - 1;
            direction = -1;
        }
        let windowToActivate = "";
        let firstWindowId = "";
        let activateNext = false;
        for (let i = start; i < windowArr.length && i >= 0; i += direction) {
            let windowId = windowArr[i];
            if (firstWindowId == "") {
                firstWindowId = windowId;
            }
            if (activateNext) {
                windowToActivate = windowId;
                activateNext = false;
            }
            if (WebosWindow.AllWindows[windowId].active) {
                activateNext = true;
            }
        }
        if (activateNext) {
            windowToActivate = firstWindowId;
            activateNext = false;
        }
        if (windowToActivate) {
            WebosWindow.AllWindows[windowToActivate].ActivateWindow(false);
        }
    }
    static NotifyKeydown(event) {
        if (event.keyCode == 9) {
            WebosWindow.ActivateNextWindow(!!window.event.shiftKey);
            event.preventDefault();
            return;
        }
        if (event.keyCode == 27) {
            var activeId = WebosWindow.GetActiveWindow();
            if (activeId) {
                WebosWindow.ActivateNextWindow(true);
                WebosWindow.AllWindows[activeId].CloseWindow(false);
            }
            event.preventDefault();
            return;
        }
        for (var windowId in WebosWindow.AllWindows) {
            var windowObj = WebosWindow.AllWindows[windowId];
            if (windowObj.active) {
                windowObj.trigger("keydown", event);
            }
        }
    }
    static NotifyKeyup(event) {
        for (var windowId in WebosWindow.AllWindows) {
            var windowObj = WebosWindow.AllWindows[windowId];
            if (windowObj.active) {
                windowObj.trigger("keyup", event);
            }
        }
    }
    static RepositionWindows() {
        if (WebosWindow.layoutMode === LayoutMode.Order) {
            WebosWindow.RepositionWindowsOrdered();
        }
    }
    static RepositionWindowsOrdered() {
        let windowList = [];
        for (let id in WebosWindow.AllWindows) {
            const window = WebosWindow.AllWindows[id];
            if (!window.minimized) {
                windowList.push(window);
            }
        }
        windowList.sort((a, b) => {
            const sizeA = a.GetSize();
            const sizeB = b.GetSize();
            if (sizeA.y > sizeB.y)
                return -1;
            if (sizeA.y < sizeB.y)
                return 1;
            if (sizeA.x > sizeB.x)
                return -1;
            if (sizeA.x < sizeB.x)
                return 1;
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
        while (windowList.length > 0) {
            let window = windowList.splice(0, 1)[0];
            let size = window.GetSize();
            if (colRight + size.x <= desktopWidth) {
                //New stack on this row
                colLeft = colRight + buffer;
            }
            else {
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
            for (let i = 1; i < windowList.length; i++) {
                window = windowList[i];
                size = window.GetSize();
                if (rowTop + rowOffset + size.y <= rowBottom) { //Window fits in stack
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
    static UpdateLayoutButton() {
        let layoutElement = $(".item.layout > .icon");
        let icon;
        let tooltip = "";
        if (WebosWindow.layoutMode === LayoutMode.Order) {
            icon = Icons_1.AllIcons.LayoutSquares.large.dark;
            tooltip = "Switch to Anarchy layout mode.";
        }
        else {
            icon = Icons_1.AllIcons.LayoutSquaresDisabled.large.dark;
            tooltip = "Switch to Order layout mode.";
        }
        layoutElement.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
        layoutElement.css("width", icon.width + "px");
        layoutElement.css("height", icon.height + "px");
        layoutElement.attr("title", tooltip);
    }
    static Init() {
        let layoutElement = $(".item.layout > .icon");
        WebosWindow.layoutMode = LayoutMode.Order;
        $(window).on("resize", () => { this.RepositionWindows(); });
        layoutElement.on("click", () => {
            if (WebosWindow.layoutMode == LayoutMode.Anarchy) {
                WebosWindow.layoutMode = LayoutMode.Order;
            }
            else {
                WebosWindow.layoutMode = LayoutMode.Anarchy;
                WebosWindow.WindowOrder = [];
            }
            WebosWindow.RepositionWindows();
            WebosWindow.UpdateLayoutButton();
        });
        WebosWindow.UpdateLayoutButton();
    }
    Lock() {
        if (this.locked == 0) {
            this.windowContainer.draggable("disable");
        }
        this.locked++;
    }
    Unlock() {
        this.locked--;
        if (this.locked <= 0) {
            this.locked = 0;
            this.windowContainer.draggable("enable");
        }
    }
    UpdateTitle() {
        this.titleDiv.text(this.title);
    }
    GetPos() {
        return {
            x: Utils_1.default.TrimUnit(this.windowContainer.css("left")),
            y: Utils_1.default.TrimUnit(this.windowContainer.css("top"))
        };
    }
    SetPos(x, y) {
        this.windowContainer.css("left", x);
        this.windowContainer.css("top", y);
    }
    CloseWindow(dontNotifyOthers) {
        if (this.locked || this.closed) {
            return;
        }
        this.windowContainer.remove();
        this.closed = true;
        delete WebosWindow.AllWindows[this.id];
        this.trigger("close");
        WebosWindow.RepositionWindows();
        if (!dontNotifyOthers) {
            Taskbar_1.default.RemoveButton(this.id);
            ContextMenu_1.default.CloseAllContextMenus();
        }
    }
    MinimizeWindow(dontNotifyOthers) {
        if (this.locked)
            return;
        var pos = this.GetPos();
        this.storedX = pos.x;
        this.storedY = pos.y;
        this.minimized = true;
        this.windowContainer.css("left", WebosWindow.InactiveX + "px");
        this.windowContainer.css("top", WebosWindow.InactiveY + "px");
        if (!dontNotifyOthers) {
            if (this.active) {
                Taskbar_1.default.ToggleButton(this.id, true);
            }
            ContextMenu_1.default.CloseAllContextMenus();
        }
        this.active = false;
        WebosWindow.RepositionWindows();
    }
    ActivateWindow(dontNotifyOthers) {
        for (let otherWindowId in WebosWindow.AllWindows) {
            if (otherWindowId == this.id)
                continue;
            let windowObject = WebosWindow.AllWindows[otherWindowId];
            if (windowObject.active) {
                windowObject.active = false;
                windowObject.windowContainer.removeClass("active");
                windowObject.trigger("deactivate");
                Taskbar_1.default.ToggleButton(windowObject.id, true);
            }
        }
        if (this.active) {
            return;
        }
        var pos = this.GetPos();
        if (pos.x == WebosWindow.InactiveX && pos.y == WebosWindow.InactiveY) {
            var newX = this.storedX || 400;
            var newY = this.storedY || 400;
            this.windowContainer.css("left", newX + "px");
            this.windowContainer.css("top", newY + "px");
        }
        if (this.minimized) {
            this.minimized = false;
            WebosWindow.RepositionWindows();
        }
        this.active = true;
        this.windowContainer.addClass("active");
        this.zindex = WebosWindow.HighestZIndex++;
        this.windowContainer.css("z-index", this.zindex);
        this.trigger("activate");
        if (!dontNotifyOthers) {
            Taskbar_1.default.ToggleButton(this.id, true);
            ContextMenu_1.default.CloseAllContextMenus();
        }
    }
    GetSize() {
        return {
            x: Utils_1.default.TrimUnit(this.windowElement.css("width")),
            y: Utils_1.default.TrimUnit(this.windowElement.css("height")),
        };
    }
    SetSize(width, height, isInner) {
        this.width = width;
        this.height = height;
        if (isInner) {
            this.width += 10;
            this.height += 40;
        }
        this.windowElement.css("width", this.width);
        this.windowElement.css("height", this.height);
        this.contentDiv.css("height", this.height - 40);
        this.contentDiv.css("width", this.width - 10);
        WebosWindow.RepositionWindows();
    }
    UpdateIcon() {
        var icon = this.active ? this.icon.small.light : this.icon.small.dark;
        this.iconElement.css("background-image", "url(\"" + Utils_1.AssetLocation + icon.id + "\")");
        this.iconElement.css("width", icon.width);
        this.iconElement.css("height", icon.height);
    }
    CancelAnimation() {
    }
    StartAnimation(animation) {
        if (this.animationData) {
            this.CancelAnimation();
        }
        this.animationData = new RunningAnimationData(this);
        this.animationData.frames = animation;
        this.animationData.currentFrame = 0;
        this.Lock();
        this.animationData.StartFrame();
    }
}
WebosWindow.WindowOrder = [];
WebosWindow.AllWindows = {};
WebosWindow.HighestZIndex = 1;
WebosWindow.LastWindowId = 0;
WebosWindow.AutoPosCount = 0;
WebosWindow.AutoOffset = 60;
WebosWindow.InactiveX = -10000;
WebosWindow.InactiveY = -10000;
exports.default = WebosWindow;
class RunningAnimationData {
    constructor(window) {
        this.window = window;
    }
    StartFrame() {
        if (this.currentFrame == this.frames.length) {
            this.window.Unlock();
            return;
        }
        var frame = this.frames[this.currentFrame];
        this.window.windowContainer.animate({
            left: "+=" + frame.shiftX,
            top: "+=" + frame.shiftY,
        }, {
            duration: frame.duration,
            easing: "linear",
            complete: () => {
                this.currentFrame++;
                this.StartFrame();
            }
        });
    }
}
//# sourceMappingURL=Window.js.map
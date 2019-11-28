"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLocation = "/Assets/";
class Utils {
    static TrimUnit(str) {
        return Number(str.replace(/[^0-9.-]/g, ""));
    }
    static GenerateName() {
        let names = ["Billy", "Jace", "Weasel", "Para", "Cobbler", "Taint", "Lawson", "Mario", "Harbin", "Sheriff", "Addler", "Donny", "Alchemer", "Froe", "Dooloo", "Fae", "Sherman", "Tank", "Harry", "Potter", "Cake", "Mupp", "Yooley", "Shade", "Buddy", "Cort", "Deev", "Mies", "Penny"];
        let name = names[Math.floor(Math.random() * names.length)];
        name += " ";
        if (Math.random() < 0.2) {
            name += "Mc";
        }
        name += names[Math.floor(Math.random() * names.length)];
        if (Math.random() < 0.2) {
            name += " " + names[Math.floor(Math.random() * names.length)];
        }
        if (Math.random() < 0.001) {
            name = "Crafty Matt";
        }
        return name;
    }
    static SetupTabStrip(rootEle) {
        const jRoot = $(rootEle);
        jRoot.find("> .tabstrip > .tab").on("click", (e) => {
            let ele = $(e.target);
            if (!ele.hasClass("active")) {
                jRoot.find("> .tabstrip > .tab").removeClass("active");
                ele.addClass("active");
                let name = ele.attr("data-tabname");
                jRoot.find("> .tabContent").addClass("nodisp");
                jRoot.find("> .tabContent[data-tabname=" + name + "]").removeClass("nodisp");
            }
        });
    }
    static ScrollIntoView(element) {
        let yToScroll = 0;
        let maxY = element.parent().outerHeight() - element.outerHeight();
        let distToTop = element.offset().top - element.parent().offset().top;
        if (distToTop < 0) {
            yToScroll = distToTop;
        }
        else if (distToTop > maxY) {
            yToScroll = distToTop - maxY;
        }
        if (yToScroll) {
            element.parent().animate({
                scrollTop: "+=" + yToScroll + "px"
            }, 100);
        }
    }
    static DisplayNumber(number) {
        if (number === 0) {
            return "0";
        }
        let digits = Math.floor(Math.log(number) / Math.log(10)) + 1;
        if (digits > 5 || digits < 0) {
            let rounded = number / Math.pow(10, digits - 1);
            let disp = (Math.floor(rounded * 10) / 10).toString();
            if (disp.length == "x".length) {
                disp += ".0";
            }
            disp += "e" + (digits - 1);
            return disp;
        }
        if (digits > 3) {
            return Math.floor(number).toString();
        }
        if (digits === 3) {
            return Math.floor(number).toString();
        }
        if (digits === 2) {
            let disp = (Math.floor(number * 10) / 10).toString();
            if ((disp + "").length != "xx.x".length) {
                disp += ".0";
            }
            return disp;
        }
        if (digits <= 1) {
            let disp = (Math.floor(number * 100) / 100).toString();
            if (disp.length === "x".length) {
                disp += ".0";
            }
            if (disp.length === "x.x".length) {
                disp += "0";
            }
            return disp;
        }
        return number.toString();
    }
    static DisplayTime(dateObj, includeSuffix) {
        let displayedHour = (dateObj.getHours() % 12) || 12;
        let displayedMinute = (dateObj.getMinutes() <= 9 ? "0" : "") + dateObj.getMinutes();
        let clockString = displayedHour + ":" + displayedMinute;
        if (includeSuffix) {
            let displayableSuffix = dateObj.getHours() >= 12 ? "PM" : "AM";
            clockString += " " + displayableSuffix;
        }
        return clockString;
    }
    static GetRandomString(length) {
        let str = "";
        const chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        for (let i = 0; i < chars.length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }
}
exports.default = Utils;
//# sourceMappingURL=Utils.js.map
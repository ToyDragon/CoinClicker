"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IconDetails {
}
exports.IconDetails = IconDetails;
class IconLightAndDark {
}
exports.IconLightAndDark = IconLightAndDark;
class IconDescriptor {
}
exports.IconDescriptor = IconDescriptor;
class IconOptions {
}
exports.IconOptions = IconOptions;
function CreateStandardIcon(name, options) {
    options = options || {};
    if (typeof options.lightSuffix == "undefined")
        options.lightSuffix = "light";
    let iconObj = {
        large: {
            dark: {
                id: "icons/" + name + "32.png",
                width: 32,
                height: 32
            },
            light: {
                id: "icons/" + name + "32" + options.lightSuffix + ".png",
                width: 32,
                height: 32
            }
        },
        small: {
            dark: {
                id: "icons/" + name + "16.png",
                width: 16,
                height: 16
            },
            light: {
                id: "icons/" + name + "16" + options.lightSuffix + ".png",
                width: 16,
                height: 16
            }
        }
    };
    if (options.veryLarge) {
        iconObj.veryLarge = {
            dark: {
                id: "icons/" + name + "64.png",
                width: 64,
                height: 64
            },
            light: {
                id: "icons/" + name + "64" + options.lightSuffix + ".png",
                width: 64,
                height: 64
            }
        };
    }
    return iconObj;
}
exports.AllIcons = {
    /*
    "combat": CreateStandardIcon("combat", {lightSuffix: ""}),
    "disco": CreateStandardIcon("disco", {lightSuffix: ""}),
    "warning": CreateStandardIcon("warning", {lightSuffix: ""}),
    "miner": CreateStandardIcon("miner", {lightSuffix: ""}),
    "coins": CreateStandardIcon("coins", {lightSuffix: ""}),
    "help": CreateStandardIcon("help", {lightSuffix: ""}),
    "pinball": CreateStandardIcon("pinball", {veryLarge: true}),
    "exchange": CreateStandardIcon("exchange", {lightSuffix: "", veryLarge: true}),
    "music": CreateStandardIcon("music", {veryLarge: true}),
    "audioplay": CreateStandardIcon("audioplay"),
    "audioseekleft": CreateStandardIcon("audioseekleft"),
    "audiopause": CreateStandardIcon("audiopause"),
    "audioseekright": CreateStandardIcon("audioseekright"),
    "audiostop": CreateStandardIcon("audiostop"),
    "swordandshield": CreateStandardIcon("swordandshield"),
    "random": CreateStandardIcon("random"),
    "code": CreateStandardIcon("code"),
    "tag": CreateStandardIcon("tag"),
    "speech": CreateStandardIcon("speech"),
    "check": CreateStandardIcon("check"),
    "back": CreateStandardIcon("back"),
    */
    //"Knight": CreateStandardIcon("Knight"), //I don't own this icon, and need to replace it.
    "Frog": CreateStandardIcon("Frog", { veryLarge: true }),
    "Garbage": CreateStandardIcon("Trashcan"),
    "Clock": CreateStandardIcon("Clock"),
    "Plus": CreateStandardIcon("Plus"),
    "Minus": CreateStandardIcon("Minus"),
    "Dropdown": CreateStandardIcon("Dropdown"),
    "CaretUp": CreateStandardIcon("CaretUp"),
    "CaretLeft": CreateStandardIcon("CaretLeft"),
    "CaretDown": CreateStandardIcon("CaretDown"),
    "CaretRight": CreateStandardIcon("CaretRight"),
    "Check": CreateStandardIcon("Check", { veryLarge: true }),
    "ComputerBoard": CreateStandardIcon("ComputerBoard", { veryLarge: true }),
    "ComputerBoardOutline": CreateStandardIcon("ComputerBoardOutline", { veryLarge: true }),
    "ComputerBoardSpeed": CreateStandardIcon("ComputerBoardSpeed", { veryLarge: true }),
    "ComputerBoardPower": CreateStandardIcon("ComputerBoardPower", { veryLarge: true }),
    "LayoutSquares": CreateStandardIcon("LayoutSquares", { veryLarge: true }),
    "LayoutSquaresDisabled": CreateStandardIcon("LayoutSquaresDisabled", { veryLarge: true }),
    "House": CreateStandardIcon("House", { veryLarge: true }),
    "Go": CreateStandardIcon("Go", { veryLarge: true }),
    "Snake": CreateStandardIcon("Snake", { veryLarge: true }),
    "Letter": CreateStandardIcon("Letter"),
    "Shovel": CreateStandardIcon("Shovel", { veryLarge: true }),
    "Folder": CreateStandardIcon("Folder"),
    "Info": CreateStandardIcon("Info"),
    "Balls": CreateStandardIcon("Balls", { veryLarge: true }),
    "Wallet": CreateStandardIcon("WalletFlat"),
    "AlphaExchange": CreateStandardIcon("AlphaExchange", { veryLarge: true }),
    "Browser": CreateStandardIcon("Browser"),
    "AlphaCoin": CreateStandardIcon("AlphaCoin", { veryLarge: true }),
};
//# sourceMappingURL=Icons.js.map
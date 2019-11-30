"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OS_1 = require("./OS/OS");
const GA_1 = require("./Core/GA");
$(document).ready(() => {
    let root = document.getElementById("main");
    OS_1.OS.init(root);
});
const scriptEle = document.createElement("script");
scriptEle.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_1.default.GAID;
scriptEle.onerror = () => {
    OS_1.OS.EmailApp.AddAdblockEmail();
};
document.getElementsByTagName("head")[0].appendChild(scriptEle);
window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
window.gtag("js", new Date());
window.gtag("config", GA_1.default.GAID);
//# sourceMappingURL=Game.js.map
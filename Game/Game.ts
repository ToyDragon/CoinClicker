import { OS } from "./OS/OS";
import GA from "./Core/GA";
import Utils from "./Core/Utils";

$(document).ready(() => {
    let root = document.getElementById("main");
    OS.init(root);
});

(window as any).OS = OS;
(window as any).Utils = Utils;

declare global{
    interface Window{
        dataLayer: any[];
    }
}

const scriptEle = document.createElement("script");
scriptEle.src = "https://www.googletagmanager.com/gtag/js?id=" + GA.GAID;
scriptEle.onerror = () => {
    OS.EmailApp.AddAdblockEmail();
};
document.getElementsByTagName("head")[0].appendChild(scriptEle);
window.dataLayer = window.dataLayer || [];
window.gtag = function(){window.dataLayer.push(arguments);}
window.gtag("js", new Date());
window.gtag("config", GA.GAID);
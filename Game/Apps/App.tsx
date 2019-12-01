import Observable from "../Core/Observable";
import WebosWindow from "../OS/Window";
import { OS } from "../OS/OS";

export default class App<K> extends Observable<K>{
    public windowObj: WebosWindow;

    public constructor(){
        super();
    }

    public ActivateOrCreate(): void{
        if(!OS.StateController.loaded){
            throw "Creating window before initial statekeeper load.";
        }
        if(this.windowObj){
            console.log("Activating existing window " + this.windowObj.id);
            this.windowObj.ActivateWindow(false);
        }else{
            console.log("Creating new window");
            this.CreateWindow();
            this.AfterCreateWindow();
        }
    }

    public CreateWindow(): void{}

    public AfterCreateWindow(): void{
        this.windowObj.on("close", () => {
            console.log("Removed window reference");
            this.windowObj = null;
        });
    }
}
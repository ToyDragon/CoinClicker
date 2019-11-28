import Observable from "../Core/Observable";
import WebosWindow from "../OS/Window";

export default class App<K> extends Observable<K>{
    public windowObj: WebosWindow;

    public constructor(){
        super();
    }

    public ActivateOrCreate(): void{
        console.log("App clicked");
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
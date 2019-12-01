export interface IHasSaveData{
    GetStateKey(): string;
    GetState(): {nState?: any, sState?: any};
    LoadState(nState: any, sState: any): void;
    AfterStateLoaded(): void;
}

export default class StateController{

    public thingsWithData: IHasSaveData[];
    public loaded: boolean = false;

    public constructor(){
        this.thingsWithData = [];
        if(this.PreventSave()){
            localStorage.clear();
        }
    }

    public AddTrackedObject(obj: IHasSaveData): void{
        if(this.loaded){
            throw "Yikes, you should initialize your objects with save data before save data is loaded."
        }
        this.thingsWithData.push(obj);
    }

    public ClearSaveData(): void{
        localStorage.clear();
        localStorage.setItem("preventSave", "1");
    }

    private PreventSave(): boolean{
        return localStorage.getItem("preventSave") == "1";
    }

    public SaveData(): void{
        if(this.PreventSave()){
            return;
        }
        for(let thingWithData of this.thingsWithData){
            const key = thingWithData.GetStateKey();
            const state = thingWithData.GetState();
            let stateString = "";
            if(state){
                stateString = JSON.stringify(state);
            }
            if(!stateString){
                localStorage.removeItem(key);
            }else{
                localStorage.setItem(key, stateString);
            }
        }
    }

    public LoadData(): void{
        for(let thingWithData of this.thingsWithData){
            const key = thingWithData.GetStateKey();
            const stateString = localStorage.getItem(key) || "null";
            let state = JSON.parse(stateString);
            this.ConvertToNumber(state && state.nState);
            thingWithData.LoadState(state && state.nState, state && state.sState);
        }

        this.loaded = true;

        for(let thingWithData of this.thingsWithData){
            thingWithData.AfterStateLoaded();
        }
    }

    private ConvertToNumber(stateObj: any): void{
        if(stateObj){
            if(Array.isArray(stateObj)){
                for(let i = 0; i < stateObj.length; i++){
                    if(typeof(stateObj[i]) === "string"){
                        stateObj[i] = Number(stateObj[i]);
                    }else{
                        this.ConvertToNumber(stateObj[i]);
                    }
                }
            }
            if(typeof(stateObj) === "object"){
                for(let key in stateObj){
                    if(typeof(stateObj[key]) === "string"){
                        stateObj[key] = Number(stateObj[key]);
                    }else{
                        this.ConvertToNumber(stateObj[key]);
                    }
                }
            }
        }
    }
    
}
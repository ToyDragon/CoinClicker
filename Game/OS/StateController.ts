export interface IHasSaveData{
    GetStateKey(): string;
    GetState(): {nState?: any, sState?: any};
    LoadState(nState: any, sState: any): void;
    AfterStateLoaded(): void;

    GetGlobalState?(): any;
    LoadGlobalState?(gState: any): void;
}

export default class StateController implements IHasSaveData{

    public GetStateKey(): string {
        return "StateController";
    }

    public GetState(): { nState?: any; sState?: any;} {
        return {};
    }

    public GetGlobalState(): any{
        let data = {
            currentSaveKey: this.currentSaveKey
        };
        if(this.nextSaveKey >= 0){
            data.currentSaveKey = this.nextSaveKey;
        }
        return data;
    }

    public LoadGlobalState(gState: any): void{
        if(gState){
            this.currentSaveKey = gState.currentSaveKey;
        }
    }

    public LoadState(_nState: any, _sState: any): void { }
    public AfterStateLoaded(): void { }

    private currentSaveKey: number = 0;
    private nextSaveKey: number = -1;
    public thingsWithData: IHasSaveData[];
    public loaded: boolean = false;

    public constructor(){
        this.thingsWithData = [this];
        localStorage.removeItem("preventSave")
    }

    public SwitchSaveKey(key: number): void{
        if(this.currentSaveKey != key){
            this.nextSaveKey = key;
            this.SaveData();
        }
    }

    public AddTrackedObject(obj: IHasSaveData): void{
        if(this.loaded){
            throw "Yikes, you should initialize your objects with save data before save data is loaded.";
        }
        this.thingsWithData.push(obj);
    }

    public ClearSaveData(): void{
        for(let thingWithData of this.thingsWithData){
            let key = thingWithData.GetStateKey();
            localStorage.removeItem(key + "_" + this.currentSaveKey);
        }
        localStorage.setItem("preventSave", "1");
        document.location.reload();
    }

    private PreventSave(): boolean{
        return localStorage.getItem("preventSave") == "1";
    }

    public SaveData(): void{
        if(this.PreventSave()){
            return;
        }
        if(!this.loaded){
            throw "Can't save before initial state load.";
        }
        for(let thingWithData of this.thingsWithData){
            let key = thingWithData.GetStateKey();
            if(thingWithData.GetGlobalState){
                const gState = thingWithData.GetGlobalState();
                let gStateString = "";
                if(gState){
                    gStateString = JSON.stringify(gState);
                }
                if(!gStateString){
                    localStorage.removeItem(key + "_GLOBAL");
                }else{
                    localStorage.setItem(key + "_GLOBAL", gStateString);
                }
            }
            const state = thingWithData.GetState();
            let stateString = "";
            if(state){
                stateString = JSON.stringify(state);
            }
            if(!stateString){
                localStorage.removeItem(key + "_" + this.currentSaveKey);
            }else{
                localStorage.setItem(key + "_" + this.currentSaveKey, stateString);
            }
        }

        if(this.nextSaveKey >= 0){
            document.location.reload();
        }
    }

    public GetCurrentSaveKey(): number{
        return this.currentSaveKey;
    }

    public LoadData(): void{
        for(let thingWithData of this.thingsWithData){
            const key = thingWithData.GetStateKey();
            const gStateString = localStorage.getItem(key + "_GLOBAL");
            const gState = JSON.parse(gStateString);
            this.ConvertToNumber(gState);
            if(thingWithData.LoadGlobalState){
                thingWithData.LoadGlobalState(gState);
            }

            const stateString = localStorage.getItem(key + "_" + this.currentSaveKey) || "null";
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
import Observable from "../../../Core/Observable";

export default class VirtualPage extends Observable<{}>{
    public constructor(){
        super();
    }

    public GetURL(): string{
        return "";
    }

    public MatchesAddress(address: string): boolean{
        return false;
    }

    public Render(contentDiv: JQuery): void{

    }

    public Cleanup(): void{

    }
}
import Observable from "../../../Core/Observable";

export default abstract class VirtualPage extends Observable<{}>{
    public constructor(){
        super();
    }

    public abstract GetURL(): string;

    public MatchesAddress(address: string): boolean{
        return false;
    }

    public Render(contentDiv: JQuery): void{

    }

    public Cleanup(): void{

    }
}
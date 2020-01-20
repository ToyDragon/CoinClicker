import { OS, SharedDataKeys } from "../../../OS/OS";
import { AllIcons, IconDescriptor } from "../../../Core/Icons";
import { Wallet } from "../../Crypto/Wallet";
import GA from "../../../Core/GA";
import { ShopItem, ShopPage } from "../ShopBase";
import Snake from "../../Minigames/Snake";
import DiggerGame from "../../Minigames/Digger";
import { MusicPlayerApp } from "../../General/MusicPlayer";
import App from "../../App";

class CoalOneoffItem extends ShopItem{
    
    private gaLabel: string;
    private app: App<any>;

    public constructor(title: string, subtitle: string, icon: IconDescriptor, price: number, symbol: string, gaLabel: string, id: keyof CoalSharedDataKeys, app: App<any>){
        super();
        this.title = title;
        this.basePrice = price;
        this.subtitle = subtitle;
        this.icon = icon;
        this.symbol = symbol;
        this.gaLabel = gaLabel;
        this.upgradeKey = id;
        this.maxCount = 1;
        this.app = app;
    }

    public GetGALabel(): string{
        return this.gaLabel;
    }

    protected GetTotalBoostText(): string {
        return "";
    }

    public AfterPurchaseComplete(): void{
        OS.setSharedData(this.upgradeKey, "1");
        GA.Event(GA.Events.MojaveBuy, { value: this.level, label: this.GetGALabel() });
        
		OS.CreateDesktopItem({
			title: this.title,
			icon: this.icon,
			app: this.app
		});
    }

    public AfterStateLoaded(): void{
        if(this.level){
            OS.CreateDesktopItem({
                title: this.title,
                icon: this.icon,
                app: this.app
            });
        }
    }
}

export default class CoalPage extends ShopPage{

    public GetStateKey(): string {
        return "Coal";
    }

    private snakeApp: Snake;
    private dougApp: DiggerGame;
    private musicApp: MusicPlayerApp;

    public musicItem: CoalOneoffItem;
    public dougItem: CoalOneoffItem;
    public snakeItem: CoalOneoffItem;

    public constructor(){
        super(AllIcons.Coal, "Coal.io", "Get your game on!", "#353F40", "#707070", "white");
    }

    protected PopulateItems(): void{
        this.snakeApp = new Snake({title: "Snake"});
        this.dougApp = new DiggerGame({title: "Doug the Digger"});
        this.musicApp = new MusicPlayerApp();

        this.musicItem = new CoalOneoffItem("Music Player", "Hot tunes", AllIcons.Music, 4999, Wallet.Symbol.CSH, "hasMusic", "hasMusic", this.musicApp);
        this.snakeItem = new CoalOneoffItem("Snake", "Snakes like apples, right?", AllIcons.Snake, 25000, Wallet.Symbol.CSH, "hasSnake", "hasSnake", this.snakeApp);
        this.dougItem = new CoalOneoffItem("Digger", "Like minecraft, but way worse!", AllIcons.Shovel, 1250000, Wallet.Symbol.CSH, "hasDoug", "hasDigger", this.dougApp);

        this.allItems.push(this.musicItem);
        this.allItems.push(this.snakeItem);
        this.allItems.push(this.dougItem);
    }

    public GetURL(): string {
        return "www.coal.io";
    }

    public MatchesAddress(address: string): boolean{
        return /^(www\.)?coal\.io/i.test(address);
    }
}

interface CoalSharedDataKeys extends SharedDataKeys{
    hasSnake;
    hasDigger;
    hasMusic;
}
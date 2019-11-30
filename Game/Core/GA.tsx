
const Categories = {
    Window: "Window",
    Email: "Email",
    Miner: "Miner",
    Pickaxe: "Pickaxe",
    Exchange: "Exchange",
    Snake: "Snake",
    Doug: "Doug",
    Browser: "Browser",
    Mojave: "Mojave",
    Doors: "Doors",
    Coal: "Doors",
    AlphaWolf: "AlphaWolf",
};

export class EventData{
    public category: keyof typeof Categories;
    public action: string;

    public constructor(category: keyof typeof Categories, action: string){
        this.category = category;
        this.action = action;
    }
}

const Events = {
    EmailOpen: new EventData("Window", "EmailOpen"),
    EmailClose: new EventData("Window", "EmailClose"),
    EmailSelectEmail: new EventData("Email", "SelectEmail"),

    MinerOpen: new EventData("Window", "MinerOpen"),
    MinerClose: new EventData("Window", "MinerClose"),
    MinerExpandDetails: new EventData("Miner", "ExpandDetails"),
    MinerCollapseDetails: new EventData("Miner", "CollapseDetails"),
    MinerMine: new EventData("Miner", "Mine"),

    PickaxeOpen: new EventData("Window", "PickaxeOpen"),
    PickaxeClose: new EventData("Window", "PickaxeClose"),
    PickaxeExpandDetails: new EventData("Pickaxe", "ExpandDetails"),
    PickaxeCollapseDetails: new EventData("Pickaxe", "CollapseDetails"),
    PickaxeMine: new EventData("Pickaxe", "Mine"),

    ExchangeOpen: new EventData("Window", "ExchangeOpen"),
    ExchangeClose: new EventData("Window", "ExchangeClose"),
    ExchangeChangeTab: new EventData("Exchange", "ChangeTab"),

    ExchangeEnableAutoSell: new EventData("Exchange", "EnableAutoSell"),
    ExchangeDisableAutoSell: new EventData("Exchange", "DisableAutoSell"),
    ExchangeManualBuy: new EventData("Exchange", "ManualBuy"),
    ExchangeManualSell: new EventData("Exchange", "ManualSell"),
    ExchangeAutoSell: new EventData("Exchange", "AutoSell"),

    ExchangePlaceBuyOrder: new EventData("Exchange", "PlaceBuyOrder"),
    ExchangeCancelBuyOrder: new EventData("Exchange", "CancelBuyOrder"),
    ExchangeCompleteBuyOrder: new EventData("Exchange", "CompleteBuyOrder"),

    ExchangePlaceSellOrder: new EventData("Exchange", "PlaceSellOrder"),
    ExchangeCancelSellOrder: new EventData("Exchange", "CancelSellOrder"),
    ExchangeCompleteSellOrder: new EventData("Exchange", "CompleteSellOrder"),

    BrowserOpen: new EventData("Window", "BrowserOpen"),
    BrowserClose: new EventData("Window", "BrowserClose"),
    BrowserNavigate: new EventData("Browser", "Navigate"),

    WalletOpen: new EventData("Window", "WalletOpen"),
    WalletClose: new EventData("Window", "WalletClose"),

    MojaveBuy: new EventData("Mojave","Buy"),
    DoorsBuy: new EventData("Doors","Buy"),
    CoalBuy: new EventData("Coal","Buy"),
    AlphaWolfBuy: new EventData("AlphaWolf","Buy"),

    SnakeOpen: new EventData("Window", "SnakeOpen"),
    SnakeClose: new EventData("Window", "SnakeClose"),
    SnakeFinishGame: new EventData("Snake", "FinishGame"),

    DougOpen: new EventData("Window", "DougOpen"),
    DougClose: new EventData("Window", "DougClose"),
    DougShopSell: new EventData("Doug", "ShopSell"),
    DougShopBuy: new EventData("Doug", "ShopBuy"),
};

interface EventParams<Labels>{
    label?: keyof Labels;
    value?: number;
    metrics?: GAMetrics;
}

export default class GA{
    public static Events = Events;
    public static GAID = "UA-83955368-2";

    public static Event<Labels>(event: EventData, options?: EventParams<Labels>): void{
        const data: any = {};

        if(options){
            if(options.label){
                data.event_label = options.label;
            }

            if(typeof(options.value) !== undefined && Number(options.value) >= 0){
                data.value = Number(options.value);
            }

            if(options.metrics){
                for(let key in options.metrics){
                    const metric = MetricMap[key];
                    if(metric){
                        data[metric] = options.metrics[key];
                    }
                }
            }
        }
        data.event_category = event.category;

        gtag("event", event.action, data);
    }
}

interface GAMetrics{
    TotalACNMined?: number;
    TotalACNPurchased?: number;
    TotalACNSold?: number;
    TotalCSHEarned?: number;
    TotalCSHSpent?: number;
};

const MetricMap = {
    "TotalACNMined": "metric1",
    "TotalACNPurchased": "metric2",
    "TotalACNSold": "metric3",
    "TotalCSHEarned": "metric4",
    "TotalCSHSpent": "metric5",
}
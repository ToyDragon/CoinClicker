import App from "../App";
import WebosWindow from "../../OS/Window";
import { AllIcons } from "../../Core/Icons";
import Miner, { MinerBoostItem } from "../Crypto/Miner";
import GA from "../../Core/GA";
import { OS } from "../../OS/OS";
import { IHasSaveData } from "../../OS/StateController";

interface SnakeOptions{
    title: string;
}

interface Pos{
    x: number;
    y: number;
}

export default class Snake extends App<{}> implements IHasSaveData{

    public GetStateKey(): string {
        return "Snake";
    }

    public GetState(): { nState?: any; sState?: any; } {
        return {
            nState: this.nState
        };
    }

    public LoadState(nState: any, _sState: any): void {
        if(nState){
            this.nState = nState;
        }
    }

    public AfterStateLoaded(): void{
        this.UpdateHighscoreBoost();
    }

    public width: number = 17;
    public height: number = 17;
    
    private tickInterval: any;
    private tileSize: number = 20;
    private marginLeft: number = 6;
    private marginTop: number = 0;
    private applePos: Pos;
    private direction: Pos;
    private inputDirection: Pos;
    private snakePosList: Pos[];
    private sprites = {
        apple: "a",
        snakeTail: "o",
        snakeHead: "O",
        space: "."
    };
    private options: SnakeOptions;
    private dead: boolean;

    private nState = {
        highScore: 0,
    };

    private static maxApples: number = 40;
    private static maxBoost: number = 0.5;
    private static playingBonus: MinerBoostItem = {
        speedBoost: 1.25,
        name: "Snake Speed",
        symbol: "ACN"
    };

    public constructor(options: SnakeOptions){
        super();
        this.options = options;

        OS.StateController.AddTrackedObject(this);
    }

    private ComparePoints(p1: Pos, p2: Pos): boolean{
        return p1.x === p2.x && p1.y === p2.y;
    }

    private IsSnakePos(pos: Pos, ignoreButt: boolean): boolean{
        for(var i = 0; i < this.snakePosList.length; i++){
            if(i === this.snakePosList.length-1 && ignoreButt) continue;
            if(this.ComparePoints(pos, this.snakePosList[i])) return true;
        }
        return false;
    }

    private RenderDisplay(): void{
        this.windowObj.contentDiv.empty();
        this.windowObj.contentDiv.css("background-color", "black");
        this.windowObj.contentDiv.css("color", "white");
        
        const getMessageChar = (pos) => {
            var GAME = "GAME OVER";
            var startX = Math.floor(this.width/2 - GAME.length/2);
            if(pos.y == 4 && pos.x >= startX && pos.x < startX + GAME.length){
                return GAME[pos.x-startX];
            }
            var POINTS = "POINTS:" + (this.snakePosList.length - 3);
            startX = Math.floor(this.width/2 - POINTS.length/2);
            if(pos.y == 6 && pos.x >= startX && pos.x < startX + POINTS.length){
                return POINTS[pos.x-startX];
            }
            return "";
        }
        
        for(var y = 0; y < this.height; y++){
            for(var x = 0; x < this.width; x++){
                var tile = $("<div></div>");
                var pos = {x: x, y: y};
                
                if(this.dead && getMessageChar(pos)){
                    tile.text(getMessageChar(pos));
                    tile.css("color","red");
                }else if(this.ComparePoints(pos, this.applePos)){
                    tile.text(this.sprites.apple);
                    tile.css("color","red");
                }else if(this.ComparePoints(pos, this.snakePosList[0])){
                    tile.text(this.sprites.snakeHead);
                    tile.css("color","green");
                    tile.css("font-weight","bold");
                }else if(this.IsSnakePos(pos, false)){
                    tile.text(this.sprites.snakeTail);
                    tile.css("color","darkgreen");
                    tile.css("font-weight","bold");
                }else{
                    tile.text(this.sprites.space);
                }
                
                tile.css("position", "absolute");
                tile.css("top", y * this.tileSize + this.marginTop + "px");
                tile.css("left", x * this.tileSize + this.marginLeft + "px");
                this.windowObj.contentDiv.append(tile);
            }
        }
    }

    public CreateWindow(): void{
		this.applePos = {x: 8, y: 12};
		this.direction = {x: 0, y: 1};
		this.inputDirection = {x: 0, y: 1};
		this.snakePosList = [
			{x: 8, y: 5},
			{x: 8, y: 4},
			{x: 8, y: 3},
        ];
        this.dead = false;
		
		this.windowObj = new WebosWindow({
			innerWidth: this.width * this.tileSize,
			innerHeight: this.height * this.tileSize,
			icon: AllIcons.Snake,
            title: this.options.title,
            openEvent: GA.Events.SnakeOpen,
            closeEvent: GA.Events.SnakeClose,
		});
		
		this.windowObj.on("keydown", (e) => {
			if(e.keyCode == 38 || e.keyCode == 87){
				this.inputDirection = {x: 0, y: -1};
			}
			if(e.keyCode == 37 || e.keyCode == 65){
				this.inputDirection = {x: -1, y: 0};
			}
			if(e.keyCode == 40 || e.keyCode == 83){
				this.inputDirection = {x: 0, y: 1};
			}
			if(e.keyCode == 39 || e.keyCode == 68){
				this.inputDirection = {x: 1, y: 0};
			}
        });

        this.windowObj.on("close", () => {
            Miner.RemoveBonus(Snake.playingBonus.symbol, Snake.playingBonus.name);
            if(this.tickInterval){
                clearInterval(this.tickInterval);
                this.tickInterval = null;
            }
        });
        
        this.tickInterval = setInterval(() => {this.tick();}, 300);
        this.RenderDisplay();

        Miner.AddBonus(Snake.playingBonus);
    }

    private tick(): void{
        if(this.dead){
            this.RenderDisplay();
            return;
        }
        
        if(this.inputDirection.x != this.direction.x * -1
        && this.inputDirection.y != this.direction.y * -1){
            this.direction = this.inputDirection;
        }
        
        var headPos = this.snakePosList[0];
        var newPos = {x: headPos.x + this.direction.x, y: headPos.y + this.direction.y};
        
        if(this.IsSnakePos(newPos, true)){
            this.dead = true;
        }
        if(newPos.x < 0 || newPos.x >= this.width
        || newPos.y < 0 || newPos.y >= this.height){
            this.dead = true;
        }
        
        if(this.dead){
            Miner.RemoveBonus(Snake.playingBonus.symbol, Snake.playingBonus.name);
            const points = (this.snakePosList.length - 3);
            if(this.nState.highScore < points){
                this.nState.highScore = points;
                this.UpdateHighscoreBoost();
            }
            GA.Event(GA.Events.SnakeFinishGame, {
                value: points
            });
            return;
        }
        
        this.snakePosList.splice(0,0,newPos);
        var snakeButt = this.snakePosList.pop();
        
        if(this.ComparePoints(newPos, this.applePos)){
            this.snakePosList.push(snakeButt);
            while(this.IsSnakePos(this.applePos, false)){
                this.applePos.x = Math.floor(Math.random()*this.width);
                this.applePos.y = Math.floor(Math.random()*this.height);
            }
        }
        
        this.RenderDisplay();
    }

    private UpdateHighscoreBoost(): void{
        Miner.RemoveBonus("ACN", "Snake Highscore Bonus");
        if(this.nState.highScore > 0){
            Miner.AddBonus({
                blockBoost: Snake.maxBoost * Math.min(this.nState.highScore / Snake.maxApples, 1),
                name: "Snake Highscore Bonus",
                symbol: "ACN"
            });
        }
    }
}
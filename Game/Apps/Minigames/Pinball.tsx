import App from "../App";
import WebosWindow from "../../OS/Window";
import { AllIcons } from "../../Core/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import ButtonWidget from "../../OS/Widgets/Button";
import { Wallet } from "../Crypto/Wallet";

interface PinballOptions{
    title: string;
    symbol: string;
    debugShowCollision?: boolean;
}

class Vector{
    x: number;
    y: number;

    public constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    public Scale(scalor: number): Vector{
        return new Vector(this.x * scalor, this.y * scalor);
    }

    public Add(ov: Vector): Vector{
        return new Vector(this.x + ov.x, this.y + ov.y);
    }

    public Middle(ov: Vector): Vector{
        return new Vector((this.x + ov.x)/2,(this.y + ov.y)/2);
    }

    public Reflect(normal: Vector): Vector{
        let a = Math.atan2(-this.y, -this.x);
        let normalA = Math.atan2(normal.y, normal.x);
        let diff = normalA-a;
        let newA = a + diff*2;
        let len = this.Length();
        return new Vector(len * Math.cos(newA), len * Math.sin(newA));
    }

    public Length(): number{
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    public static GetNormalInDirection(v: Vector): Vector{
        let normal = new Vector(v.x, v.y);
        return normal;
    }
}

class Ball{
    public gravity: Vector;
    public pos: Vector;
    public vel: Vector;
    public friction: number;

    public constructor(vel: Vector){
        this.gravity = new Vector(0, 0.25);
        this.friction = 0.98;
        this.pos = new Vector(200, 85);
        this.vel = vel;
    }

    public Tick(collideables: Collideable[]): void{
        this.vel = this.vel.Add(this.gravity);
        this.vel = this.vel.Scale(this.friction);
        let stepVel = this.vel.Scale(0.2);
        let collided = false;
        let newPos = this.pos;
        for(let i = 0; i < 5; i++){
            newPos = newPos.Add(stepVel);
            for(let collideable of collideables){
                let normal = collideable.GetCollideVector(newPos);
                if(normal){
                    let lastNormal = normal;
                    while(true){
                        newPos = newPos.Add(normal);
                        normal = collideable.GetCollideVector(newPos);
                        if(normal){
                            lastNormal = normal;
                        }else{
                            break;
                        }
                    }
                    this.vel = this.vel.Reflect(lastNormal);
                    collideable.OnCollide(this);
                    collided = true;
                    break;
                }
            }
            if(collided){break;}
        }
        this.pos = newPos;
    }
}

interface Collideable{
    Draw(context: CanvasRenderingContext2D, showDebug: boolean): void;
    GetCollideVector(pos: Vector): Vector | null;
    OnCollide(ball: Ball): void;
}

class CircleBarrier implements Collideable{
    private lastHit: number;
    public pos: Vector;
    public radius: number;

    public constructor(pos: Vector, radius: number){
        this.pos = pos;
        this.radius = radius;

        this.lastHit = 0;
    }

    public Draw(context: CanvasRenderingContext2D, _showDebug: boolean): void {
        let ellapsed = new Date().getTime() - this.lastHit;
        let others = "81";
        if(ellapsed < 1000){
            others = Math.round(0x81 * (ellapsed / 1000)).toString(16);
            if(others.length === 1){
                others = "0" + others;
            }
        }
        context.fillStyle = "black";
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        context.fill();
        
        context.fillStyle = "#81" + others + others;
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius - 2, 0, 2 * Math.PI);
        context.fill();
    }

    public GetCollideVector(pos: Vector): Vector {
        const diff = this.pos.Scale(-1).Add(pos);
        if(diff.Length() <= (this.radius + 3)){ //ball width
            const angle = Math.atan2(diff.y, diff.x);
            const normal = new Vector(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
            return normal;
        }else{
            return null;
        }
    }

    public OnCollide(_ball: Ball): void {
        this.lastHit = new Date().getTime();
    }
}

class Barrier implements Collideable{
    public p1: Vector;
    public p2: Vector;
    public width: number;
    public normal: Vector;
    
    public min: Vector;
    public max: Vector;

    private width2: number;
    private m: number;
    private mi: number;
    private b: number;

    public constructor(p1: Vector, p2: Vector){
        this.p1 = p1;
        this.p2 = p2;

        if(this.p2.x == this.p1.x){
            this.p2.x += 0.99;
        }

        if(this.p2.y == this.p1.y){
            this.p2.y += 0.99;
        }

        this.width = 4;

        this.min = new Vector(Math.min(p1.x, p2.x) - this.width, Math.min(p1.y, p2.y) - this.width);
        this.max = new Vector(Math.max(p1.x, p2.x) + this.width, Math.max(p1.y, p2.y) + this.width);

        this.m = (p2.y - p1.y) / (p2.x - p1.x);
        this.mi = -1/this.m;
        this.b = p1.y - this.m*this.p1.x;
        this.UpdateNormal();
    }

    protected UpdateNormal(): void{
        this.width2 = Math.pow(this.width, 2);
        let angle = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
        angle += Math.PI/2;
        this.normal = new Vector(Math.cos(angle),Math.sin(angle));
    }

    public GetCollideVector(pos: Vector): Vector | null{
        const b2 = pos.y - this.mi*pos.x;
        const collX = (b2 - this.b)/(this.m - this.mi);
        const collY = this.m*collX + this.b;

        if((collX < this.min.x) || (collX > this.max.x)){
            return null;
        }
        if((collY < this.min.y) || (collY > this.max.y)){
            return null;
        }

        const dist2 = Math.pow(pos.y - collY, 2) + Math.pow(pos.x - collX, 2);
        if(dist2 <= this.width2){
            return this.normal;
        }else{
            return null;
        }
    }

    public Draw(context: CanvasRenderingContext2D, showDebug: boolean): void{
        context.beginPath();
        context.moveTo(this.p1.x - 1, this.p1.y - 1);
        context.lineTo(this.p2.x - 1, this.p2.y - 1);
        context.lineWidth = this.width - 1;
        context.strokeStyle = "black"; //"#818180";
        context.stroke();
        
        context.beginPath();
        context.moveTo(this.p1.x + 1, this.p1.y + 1);
        context.lineTo(this.p2.x + 1, this.p2.y + 1);
        context.lineWidth = this.width - 2;
        context.strokeStyle = "white";
        context.stroke();

        if(showDebug){
            context.beginPath();
            const start = this.p1.Middle(this.p2);
            const end = start.Add(this.normal.Scale(15));
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
            context.strokeStyle = "#0000FF";
            context.lineWidth = 2;
            context.stroke();
        }
    }

    public OnCollide(ball: Ball): void{

    }
}

class Paddle extends Barrier{

    private angleInitial: number;
    private isFlicking: boolean;
    private animationStart: number;
    private maxExtension: number;
    private length: number;
    private isClockwise: boolean;

    public constructor(p1: Vector, p2: Vector, clockwise: boolean){
        super(p1, p2);

        if(clockwise){
            this.angleInitial = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        }else{
            this.angleInitial = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        }
        this.width = 15;
        this.isFlicking = false;
        this.maxExtension = Math.PI/3;
        this.length = Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
        this.isClockwise = clockwise;
    }

    public Flick(): void{
        if(!this.isFlicking){
            this.animationStart = new Date().getTime();
            this.isFlicking = true;
        }
    }

    public Tick(): void{
        if(!this.isFlicking){
            return;
        }

        let ellapsedMillis = new Date().getTime() - this.animationStart;
        let diff: number = 0;
        if(ellapsedMillis < 100){
            //extending
            diff = this.maxExtension * (1-(ellapsedMillis / 100));
        } else if (ellapsedMillis < 150){
            //retracting
            diff = this.maxExtension * ((ellapsedMillis-100) / 150);
        }else{
            this.isFlicking = false;

            if(this.isClockwise){
                this.p2 = new Vector(this.p1.x + Math.cos(this.angleInitial)*this.length, this.p1.y + Math.sin(this.angleInitial)*this.length)
            }else{
                this.p1 = new Vector(this.p2.x + Math.cos(this.angleInitial)*this.length, this.p2.y + Math.sin(this.angleInitial)*this.length)
            }
            this.UpdateNormal();
            return;
        }
        let angle = this.angleInitial;
        if(this.isClockwise){
            angle += diff;
            this.p2 = new Vector(this.p1.x + Math.cos(angle)*this.length, this.p1.y + Math.sin(angle)*this.length)
        }else{
            angle -= diff;
            this.p1 = new Vector(this.p2.x + Math.cos(angle)*this.length, this.p2.y + Math.sin(angle)*this.length)
        }
        this.UpdateNormal();
    }

    public OnCollide(ball: Ball): void{
        ball.vel = ball.vel.Add(this.normal.Scale(5));
    }
}

export default class Pinball extends App<{}>{

    private allCollideables: Collideable[];
    private leftPaddle: Paddle;
    private rightPaddle: Paddle;
    private allBalls: Ball[];
    private options: PinballOptions;
    private canvas: JQuery<HTMLCanvasElement>;
    private tickTimer: any;
    private mousePos: Vector;
    private tick: number;
    private pointsByBlock: number[];
    private totalPoints: number;
    private totalBalls: number;
    private pendingPlays: number;
    private lastDrop: number;
    private symbol: string;

    private btnPlayOne: ButtonWidget;
    private btnPlayFive: ButtonWidget;

    public constructor(options: PinballOptions){
        super();
        this.allBalls = [];
        this.options = options;
        this.tick = 0;
        this.totalPoints = 0;
        this.totalBalls = 0;
        this.lastDrop = 0;
        this.pendingPlays = 0;
        this.symbol = options.symbol;
        this.pointsByBlock = [5, 10, 20, 10, 5];
    }

    private Tick(): void{
        if(this.pendingPlays > 0 && (new Date().getTime() - this.lastDrop) > 150){
            this.pendingPlays--;
            this.lastDrop = new Date().getTime();
            this.allBalls.push(new Ball(new Vector(Math.random() * 6 - 3, -3)));
            this.UpdateUIElements();
        }

        if(this.leftPaddle){
            this.leftPaddle.Tick();
            this.rightPaddle.Tick();
        }

        const barriersAndPaddles = [];
        for(let collideable of this.allCollideables){
            barriersAndPaddles.push(collideable);
        }

        if(this.leftPaddle){
            barriersAndPaddles.push(this.leftPaddle);
            barriersAndPaddles.push(this.rightPaddle);
        }

        const gap = 372 / 5;
        for(let ballI = this.allBalls.length - 1; ballI >= 0; ballI--){
            this.allBalls[ballI].Tick(barriersAndPaddles);
            if(this.allBalls[ballI].pos.y > 600){
                let block = Math.floor((this.allBalls[ballI].pos.x - 15)/gap);
                Wallet.AllWallets[this.symbol].ChangeValue(this.pointsByBlock[block]);
                this.totalPoints += this.pointsByBlock[block];
                this.allBalls.splice(ballI, 1);
                this.totalBalls++;

                console.log(Math.round(this.totalPoints / this.totalBalls) + " Avg over " + this.totalBalls + " balls");
            }
        }

        this.tick++;
        this.Render();
    }

    private DrawBall(context: CanvasRenderingContext2D, pos: Vector): void{
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = "#0000FF";
        context.beginPath();
        context.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
        context.fill();
    }

    private Render(): void{
        const context = this.canvas[0].getContext("2d");
        context.fillStyle = "#bfbfbf";
        context.fillRect(0, 0, 400, 600);

        for(let barrier of this.allCollideables){
            barrier.Draw(context, false);
        }

        if(this.leftPaddle){
            this.leftPaddle.Draw(context, false);
            this.rightPaddle.Draw(context, false);
        }

        for(let ball of this.allBalls){
            this.DrawBall(context, ball.pos);

            if(this.options.debugShowCollision){
                context.fillStyle = "#0000FF";
                context.beginPath();
                context.moveTo(ball.pos.x, ball.pos.y);
                context.lineTo(ball.pos.x + ball.vel.x*10, ball.pos.y + ball.vel.y*10);
                context.stroke();
            }
        }

        const gap = 370 / 5;
        for(let x = 0; x < 5; x++){
            let offset = 15 + x * gap;
            context.fillStyle = "#000000";
            context.font = "30px Arial";
            const bonus = this.pointsByBlock[x].toString().length === 1 ? 5 : 0;
            context.fillText(this.pointsByBlock[x].toString(), offset + gap/3 - 3 + bonus , 550);
        }
        
        if(this.mousePos){
            context.fillStyle = "#FFFFFF";
            context.font = "12px Arial";
            context.fillText(this.mousePos.x.toString(), 300, 30);
            context.fillText(this.mousePos.y.toString(), 300, 40);

            context.fillStyle = "#00FF00";
            context.fillRect(this.mousePos.x, this.mousePos.y, 1, 1);
        }

        if(this.pendingPlays > 0){
            this.DrawBall(context, new Vector(21, 75));
    
            context.fillStyle = "#000000";
            context.font = "24px Arial";
            context.fillText("x" + this.pendingPlays, 33, 82);
        }
    }

    private SetupStage(): void{
        const midX = (215 - 160)/2 + 160;  

        this.leftPaddle = new Paddle(new Vector(midX - 10, 545), new Vector(midX - 55, 515), false);
        this.rightPaddle = new Paddle(new Vector(midX + 55, 515), new Vector(midX + 10, 545), true);

        this.allCollideables = [];

        //outline
        this.allCollideables.push(new Barrier(new Vector(15, 15), new Vector(355, 15)));
        this.allCollideables.push(new Barrier(new Vector(355, 15), new Vector(385, 45)));
        this.allCollideables.push(new Barrier(new Vector(385, 45), new Vector(385, 300)));
        this.allCollideables.push(new Barrier(new Vector(385, 300), new Vector(370, 300)));
        this.allCollideables.push(new Barrier(new Vector(370, 300), new Vector(370, 100)));
        this.allCollideables.push(new Barrier(new Vector(370, 100), new Vector(360, 100)));
        this.allCollideables.push(new Barrier(new Vector(360, 100), new Vector(360, 450)));
        this.allCollideables.push(new Barrier(new Vector(360, 450), new Vector(215, 585)));
        this.allCollideables.push(new Barrier(new Vector(160, 585), new Vector(15, 450)));
        this.allCollideables.push(new Barrier(new Vector(15, 450), new Vector(15, 15)));

        //paddle blockers 
        this.allCollideables.push(new Barrier(new Vector(midX - 55, 515), new Vector(midX - 55, 475)));
        this.allCollideables.push(new Barrier(new Vector(midX - 55, 475), new Vector(midX - 120, 450)));
        this.allCollideables.push(new Barrier(new Vector(midX - 120, 450), new Vector(midX - 55, 515)));

        this.allCollideables.push(new Barrier(new Vector(midX + 55, 475), new Vector(midX + 55, 515)));
        this.allCollideables.push(new Barrier(new Vector(midX + 120, 450), new Vector(midX + 55, 475)));
        this.allCollideables.push(new Barrier(new Vector(midX + 55, 515), new Vector(midX + 120, 450)));
    }

    private SetupPlinko(): void{
        this.allCollideables = [];
        //outline
        this.allCollideables.push(new Barrier(new Vector(15, 15), new Vector(385, 15)));
        this.allCollideables.push(new Barrier(new Vector(385, 15), new Vector(385, 600)));
        this.allCollideables.push(new Barrier(new Vector(15, 600), new Vector(15, 15)));

        const size = (350 / 8) / 5;
        const gap = 350 / 8;

        const vGap = 500 / 12;

        for(let y = 0; y < 8; y++){
            for(let x = 0; x <= y; x++){
                const offset = 200 - (gap * y * .5);
                let base = new Vector(x * gap + offset, y * vGap + 100);

                this.allCollideables.push(new Barrier(base.Add(new Vector(0, -size)), base.Add(new Vector(-size, 0))));
                this.allCollideables.push(new Barrier(base.Add(new Vector(-size, 0)), base.Add(new Vector(0, size))));
                this.allCollideables.push(new Barrier(base.Add(new Vector(0, size)), base.Add(new Vector(size, 0))));
                this.allCollideables.push(new Barrier(base.Add(new Vector(size, 0)), base.Add(new Vector(0, -size))));
            }
        }
    }

    private SetupPlinkoRound(): void{
        this.allCollideables = [];
        //outline
        this.allCollideables.push(new Barrier(new Vector(385, 385), new Vector(385, 475)));
        this.allCollideables.push(new Barrier(new Vector(15, 385), new Vector(200, 35)));
        this.allCollideables.push(new Barrier(new Vector(200, 35), new Vector(385, 385)));
        this.allCollideables.push(new Barrier(new Vector(15, 475), new Vector(15, 385)));

        const size = (350 / 8) / 5;
        let gap = 350 / 8;

        const vGap = 500 / 12;

        for(let y = 1; y < 9; y++){
            for(let x = 0; x <= y; x++){
                const offset = 200 - (gap * y * .5);
                let base = new Vector(x * gap + offset, y * vGap + 50);

                this.allCollideables.push(new CircleBarrier(base, size));
            }
        }

        gap = 372 / 5;
        for(let x = 0; x < 5; x++){
            let offset = 14 + x * gap;
            if(x === 0){
                this.allCollideables.push(new Barrier(new Vector(offset, 600), new Vector(offset, 475)))
            }else{
                this.allCollideables.push(new Barrier(new Vector(offset + 3, 600), new Vector(offset, 475)))
            }
            
            if(x === 4){
                this.allCollideables.push(new Barrier(new Vector(offset + gap, 475), new Vector(offset + gap, 600)))
            }else{
                this.allCollideables.push(new Barrier(new Vector(offset + gap, 475), new Vector(offset + gap - 3, 600)))
            }
        }
    }

    private AddPlays(amt: number): void{
        const wallet = Wallet.AllWallets[this.symbol];
        if(wallet.GetAmount() >= amt * 10){
            wallet.ChangeValue(amt * -10);
            this.pendingPlays += amt;
            this.UpdateUIElements();
        }
    }

    private UpdateUIElements(): void{
        const wallet = Wallet.AllWallets[this.symbol];
        this.btnPlayOne.SetEnabled(wallet.GetAmount() >= 10)
        this.btnPlayFive.SetEnabled(wallet.GetAmount() >= 50)
    }

    public CreateWindow(): void{
		this.windowObj = new WebosWindow({
			innerWidth: 400,
			innerHeight: 600,
			icon: AllIcons.Balls,
			title: this.options.title
        });

        this.SetupPlinkoRound();

        const canvasRef = React.createRef<HTMLCanvasElement>();
        const ui = $("<div></div>");
        ui.css("width","100%");
        ui.css("height","100%");

        const playOneRef = React.createRef<ButtonWidget>();
        const playFiveRef = React.createRef<ButtonWidget>();

        ReactDOM.render(
            [
                <canvas width="400" height="600" className="pinballCanvas" ref={canvasRef} key="a"/>,
                <div className="pinballOverlay" key="b">
                    <div>
                        <ButtonWidget title={"Play (10 " + this.symbol + ")"} ref={playOneRef} onClick={()=>{this.AddPlays(1)}} />
                    </div>
                    <div>
                        <ButtonWidget title={"Play x5 (50 " + this.symbol + ")"} ref={playFiveRef} onClick={()=>{this.AddPlays(5)}} />
                    </div>
                </div>
            ]
        , ui[0]);

        this.btnPlayOne = playOneRef.current;
        this.btnPlayFive = playFiveRef.current;
        this.canvas = $(canvasRef.current);

        this.windowObj.contentDiv.append(ui);
        this.tickTimer = setInterval(() => {this.Tick()}, 25);

        Wallet.AllWallets[this.symbol].on("afterChangeValue", () => {
            this.UpdateUIElements();
        });
        this.UpdateUIElements();

        this.canvas.on("click", (event) => {
            this.mousePos = new Vector(event.offsetX, event.offsetY);
            if(this.leftPaddle){
                this.leftPaddle.Flick();
            }
        });

        this.canvas.on("contextmenu", (event) => {
            this.mousePos = new Vector(event.offsetX, event.offsetY);
            if(this.rightPaddle){
                this.rightPaddle.Flick();
            }
        });

        this.windowObj.on("close", () => {
            if(this.tickTimer){
                clearInterval(this.tickTimer);
                this.tickTimer = null;
            }
        });
    }
}
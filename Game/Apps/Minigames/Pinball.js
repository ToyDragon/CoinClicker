"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("../App");
const Window_1 = require("../../OS/Window");
const Icons_1 = require("../../Core/Icons");
const React = require("react");
const ReactDOM = require("react-dom");
const Button_1 = require("../../OS/Widgets/Button");
const Wallet_1 = require("../Crypto/Wallet");
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    Scale(scalor) {
        return new Vector(this.x * scalor, this.y * scalor);
    }
    Add(ov) {
        return new Vector(this.x + ov.x, this.y + ov.y);
    }
    Middle(ov) {
        return new Vector((this.x + ov.x) / 2, (this.y + ov.y) / 2);
    }
    Reflect(normal) {
        let a = Math.atan2(-this.y, -this.x);
        let normalA = Math.atan2(normal.y, normal.x);
        let diff = normalA - a;
        let newA = a + diff * 2;
        let len = this.Length();
        return new Vector(len * Math.cos(newA), len * Math.sin(newA));
    }
    Length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    static GetNormalInDirection(v) {
        let normal = new Vector(v.x, v.y);
        return normal;
    }
}
class Ball {
    constructor(vel) {
        this.gravity = new Vector(0, 0.25);
        this.friction = 0.98;
        this.pos = new Vector(200, 85);
        this.vel = vel;
    }
    Tick(collideables) {
        this.vel = this.vel.Add(this.gravity);
        this.vel = this.vel.Scale(this.friction);
        let stepVel = this.vel.Scale(0.2);
        let collided = false;
        let newPos = this.pos;
        for (let i = 0; i < 5; i++) {
            newPos = newPos.Add(stepVel);
            for (let collideable of collideables) {
                let normal = collideable.GetCollideVector(newPos);
                if (normal) {
                    let lastNormal = normal;
                    while (true) {
                        newPos = newPos.Add(normal);
                        normal = collideable.GetCollideVector(newPos);
                        if (normal) {
                            lastNormal = normal;
                        }
                        else {
                            break;
                        }
                    }
                    this.vel = this.vel.Reflect(lastNormal);
                    collideable.OnCollide(this);
                    collided = true;
                    break;
                }
            }
            if (collided) {
                break;
            }
        }
        this.pos = newPos;
    }
}
class CircleBarrier {
    constructor(pos, radius) {
        this.pos = pos;
        this.radius = radius;
        this.lastHit = 0;
    }
    Draw(context, _showDebug) {
        let ellapsed = new Date().getTime() - this.lastHit;
        let others = "81";
        if (ellapsed < 1000) {
            others = Math.round(0x81 * (ellapsed / 1000)).toString(16);
            if (others.length === 1) {
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
    GetCollideVector(pos) {
        const diff = this.pos.Scale(-1).Add(pos);
        if (diff.Length() <= (this.radius + 3)) { //ball width
            const angle = Math.atan2(diff.y, diff.x);
            const normal = new Vector(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
            return normal;
        }
        else {
            return null;
        }
    }
    OnCollide(_ball) {
        this.lastHit = new Date().getTime();
    }
}
class Barrier {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        if (this.p2.x == this.p1.x) {
            this.p2.x += 0.99;
        }
        if (this.p2.y == this.p1.y) {
            this.p2.y += 0.99;
        }
        this.width = 4;
        this.min = new Vector(Math.min(p1.x, p2.x) - this.width, Math.min(p1.y, p2.y) - this.width);
        this.max = new Vector(Math.max(p1.x, p2.x) + this.width, Math.max(p1.y, p2.y) + this.width);
        this.m = (p2.y - p1.y) / (p2.x - p1.x);
        this.mi = -1 / this.m;
        this.b = p1.y - this.m * this.p1.x;
        this.UpdateNormal();
    }
    UpdateNormal() {
        this.width2 = Math.pow(this.width, 2);
        let angle = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
        angle += Math.PI / 2;
        this.normal = new Vector(Math.cos(angle), Math.sin(angle));
    }
    GetCollideVector(pos) {
        const b2 = pos.y - this.mi * pos.x;
        const collX = (b2 - this.b) / (this.m - this.mi);
        const collY = this.m * collX + this.b;
        if ((collX < this.min.x) || (collX > this.max.x)) {
            return null;
        }
        if ((collY < this.min.y) || (collY > this.max.y)) {
            return null;
        }
        const dist2 = Math.pow(pos.y - collY, 2) + Math.pow(pos.x - collX, 2);
        if (dist2 <= this.width2) {
            return this.normal;
        }
        else {
            return null;
        }
    }
    Draw(context, showDebug) {
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
        if (showDebug) {
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
    OnCollide(ball) {
    }
}
class Paddle extends Barrier {
    constructor(p1, p2, clockwise) {
        super(p1, p2);
        if (clockwise) {
            this.angleInitial = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        }
        else {
            this.angleInitial = Math.atan2(p1.y - p2.y, p1.x - p2.x);
        }
        this.width = 15;
        this.isFlicking = false;
        this.maxExtension = Math.PI / 3;
        this.length = Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
        this.isClockwise = clockwise;
    }
    Flick() {
        if (!this.isFlicking) {
            this.animationStart = new Date().getTime();
            this.isFlicking = true;
        }
    }
    Tick() {
        if (!this.isFlicking) {
            return;
        }
        let ellapsedMillis = new Date().getTime() - this.animationStart;
        let diff = 0;
        if (ellapsedMillis < 100) {
            //extending
            diff = this.maxExtension * (1 - (ellapsedMillis / 100));
        }
        else if (ellapsedMillis < 150) {
            //retracting
            diff = this.maxExtension * ((ellapsedMillis - 100) / 150);
        }
        else {
            this.isFlicking = false;
            if (this.isClockwise) {
                this.p2 = new Vector(this.p1.x + Math.cos(this.angleInitial) * this.length, this.p1.y + Math.sin(this.angleInitial) * this.length);
            }
            else {
                this.p1 = new Vector(this.p2.x + Math.cos(this.angleInitial) * this.length, this.p2.y + Math.sin(this.angleInitial) * this.length);
            }
            this.UpdateNormal();
            return;
        }
        let angle = this.angleInitial;
        if (this.isClockwise) {
            angle += diff;
            this.p2 = new Vector(this.p1.x + Math.cos(angle) * this.length, this.p1.y + Math.sin(angle) * this.length);
        }
        else {
            angle -= diff;
            this.p1 = new Vector(this.p2.x + Math.cos(angle) * this.length, this.p2.y + Math.sin(angle) * this.length);
        }
        this.UpdateNormal();
    }
    OnCollide(ball) {
        ball.vel = ball.vel.Add(this.normal.Scale(5));
    }
}
class Pinball extends App_1.default {
    constructor(options) {
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
    Tick() {
        if (this.pendingPlays > 0 && (new Date().getTime() - this.lastDrop) > 150) {
            this.pendingPlays--;
            this.lastDrop = new Date().getTime();
            this.allBalls.push(new Ball(new Vector(Math.random() * 6 - 3, -3)));
            this.UpdateUIElements();
        }
        if (this.leftPaddle) {
            this.leftPaddle.Tick();
            this.rightPaddle.Tick();
        }
        const barriersAndPaddles = [];
        for (let collideable of this.allCollideables) {
            barriersAndPaddles.push(collideable);
        }
        if (this.leftPaddle) {
            barriersAndPaddles.push(this.leftPaddle);
            barriersAndPaddles.push(this.rightPaddle);
        }
        const gap = 372 / 5;
        for (let ballI = this.allBalls.length - 1; ballI >= 0; ballI--) {
            this.allBalls[ballI].Tick(barriersAndPaddles);
            if (this.allBalls[ballI].pos.y > 600) {
                let block = Math.floor((this.allBalls[ballI].pos.x - 15) / gap);
                Wallet_1.Wallet.AllWallets[this.symbol].ChangeValue(this.pointsByBlock[block]);
                this.totalPoints += this.pointsByBlock[block];
                this.allBalls.splice(ballI, 1);
                this.totalBalls++;
                console.log(Math.round(this.totalPoints / this.totalBalls) + " Avg over " + this.totalBalls + " balls");
            }
        }
        this.tick++;
        this.Render();
    }
    DrawBall(context, pos) {
        context.fillStyle = "#000000";
        context.beginPath();
        context.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = "#0000FF";
        context.beginPath();
        context.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
        context.fill();
    }
    Render() {
        const context = this.canvas[0].getContext("2d");
        context.fillStyle = "#bfbfbf";
        context.fillRect(0, 0, 400, 600);
        for (let barrier of this.allCollideables) {
            barrier.Draw(context, false);
        }
        if (this.leftPaddle) {
            this.leftPaddle.Draw(context, false);
            this.rightPaddle.Draw(context, false);
        }
        for (let ball of this.allBalls) {
            this.DrawBall(context, ball.pos);
            if (this.options.debugShowCollision) {
                context.fillStyle = "#0000FF";
                context.beginPath();
                context.moveTo(ball.pos.x, ball.pos.y);
                context.lineTo(ball.pos.x + ball.vel.x * 10, ball.pos.y + ball.vel.y * 10);
                context.stroke();
            }
        }
        const gap = 370 / 5;
        for (let x = 0; x < 5; x++) {
            let offset = 15 + x * gap;
            context.fillStyle = "#000000";
            context.font = "30px Arial";
            const bonus = this.pointsByBlock[x].toString().length === 1 ? 5 : 0;
            context.fillText(this.pointsByBlock[x].toString(), offset + gap / 3 - 3 + bonus, 550);
        }
        if (this.mousePos) {
            context.fillStyle = "#FFFFFF";
            context.font = "12px Arial";
            context.fillText(this.mousePos.x.toString(), 300, 30);
            context.fillText(this.mousePos.y.toString(), 300, 40);
            context.fillStyle = "#00FF00";
            context.fillRect(this.mousePos.x, this.mousePos.y, 1, 1);
        }
        if (this.pendingPlays > 0) {
            this.DrawBall(context, new Vector(21, 75));
            context.fillStyle = "#000000";
            context.font = "24px Arial";
            context.fillText("x" + this.pendingPlays, 33, 82);
        }
    }
    SetupStage() {
        const midX = (215 - 160) / 2 + 160;
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
    SetupPlinko() {
        this.allCollideables = [];
        //outline
        this.allCollideables.push(new Barrier(new Vector(15, 15), new Vector(385, 15)));
        this.allCollideables.push(new Barrier(new Vector(385, 15), new Vector(385, 600)));
        this.allCollideables.push(new Barrier(new Vector(15, 600), new Vector(15, 15)));
        const size = (350 / 8) / 5;
        const gap = 350 / 8;
        const vGap = 500 / 12;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x <= y; x++) {
                const offset = 200 - (gap * y * .5);
                let base = new Vector(x * gap + offset, y * vGap + 100);
                this.allCollideables.push(new Barrier(base.Add(new Vector(0, -size)), base.Add(new Vector(-size, 0))));
                this.allCollideables.push(new Barrier(base.Add(new Vector(-size, 0)), base.Add(new Vector(0, size))));
                this.allCollideables.push(new Barrier(base.Add(new Vector(0, size)), base.Add(new Vector(size, 0))));
                this.allCollideables.push(new Barrier(base.Add(new Vector(size, 0)), base.Add(new Vector(0, -size))));
            }
        }
    }
    SetupPlinkoRound() {
        this.allCollideables = [];
        //outline
        this.allCollideables.push(new Barrier(new Vector(385, 385), new Vector(385, 475)));
        this.allCollideables.push(new Barrier(new Vector(15, 385), new Vector(200, 35)));
        this.allCollideables.push(new Barrier(new Vector(200, 35), new Vector(385, 385)));
        this.allCollideables.push(new Barrier(new Vector(15, 475), new Vector(15, 385)));
        const size = (350 / 8) / 5;
        let gap = 350 / 8;
        const vGap = 500 / 12;
        for (let y = 1; y < 9; y++) {
            for (let x = 0; x <= y; x++) {
                const offset = 200 - (gap * y * .5);
                let base = new Vector(x * gap + offset, y * vGap + 50);
                this.allCollideables.push(new CircleBarrier(base, size));
            }
        }
        gap = 372 / 5;
        for (let x = 0; x < 5; x++) {
            let offset = 14 + x * gap;
            if (x === 0) {
                this.allCollideables.push(new Barrier(new Vector(offset, 600), new Vector(offset, 475)));
            }
            else {
                this.allCollideables.push(new Barrier(new Vector(offset + 3, 600), new Vector(offset, 475)));
            }
            if (x === 4) {
                this.allCollideables.push(new Barrier(new Vector(offset + gap, 475), new Vector(offset + gap, 600)));
            }
            else {
                this.allCollideables.push(new Barrier(new Vector(offset + gap, 475), new Vector(offset + gap - 3, 600)));
            }
        }
    }
    AddPlays(amt) {
        const wallet = Wallet_1.Wallet.AllWallets[this.symbol];
        if (wallet.amount >= amt * 10) {
            wallet.ChangeValue(amt * -10);
            this.pendingPlays += amt;
            this.UpdateUIElements();
        }
    }
    UpdateUIElements() {
        const wallet = Wallet_1.Wallet.AllWallets[this.symbol];
        this.btnPlayOne.SetEnabled(wallet.amount >= 10);
        this.btnPlayFive.SetEnabled(wallet.amount >= 50);
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            innerWidth: 400,
            innerHeight: 600,
            icon: Icons_1.AllIcons.Balls,
            title: this.options.title
        });
        this.SetupPlinkoRound();
        const canvasRef = React.createRef();
        const ui = $("<div></div>");
        ui.css("width", "100%");
        ui.css("height", "100%");
        const playOneRef = React.createRef();
        const playFiveRef = React.createRef();
        ReactDOM.render([
            React.createElement("canvas", { width: "400", height: "600", className: "pinballCanvas", ref: canvasRef, key: "a" }),
            React.createElement("div", { className: "pinballOverlay", key: "b" },
                React.createElement("div", null,
                    React.createElement(Button_1.default, { title: "Play (10 " + this.symbol + ")", ref: playOneRef, onClick: () => { this.AddPlays(1); } })),
                React.createElement("div", null,
                    React.createElement(Button_1.default, { title: "Play x5 (50 " + this.symbol + ")", ref: playFiveRef, onClick: () => { this.AddPlays(5); } })))
        ], ui[0]);
        this.btnPlayOne = playOneRef.current;
        this.btnPlayFive = playFiveRef.current;
        this.canvas = $(canvasRef.current);
        this.windowObj.contentDiv.append(ui);
        this.tickTimer = setInterval(() => { this.Tick(); }, 25);
        Wallet_1.Wallet.AllWallets[this.symbol].on("afterChangeValue", () => {
            this.UpdateUIElements();
        });
        this.UpdateUIElements();
        this.canvas.on("click", (event) => {
            this.mousePos = new Vector(event.offsetX, event.offsetY);
            if (this.leftPaddle) {
                this.leftPaddle.Flick();
            }
        });
        this.canvas.on("contextmenu", (event) => {
            this.mousePos = new Vector(event.offsetX, event.offsetY);
            if (this.rightPaddle) {
                this.rightPaddle.Flick();
            }
        });
        this.windowObj.on("close", () => {
            if (this.tickTimer) {
                clearInterval(this.tickTimer);
                this.tickTimer = null;
            }
        });
    }
}
exports.default = Pinball;
//# sourceMappingURL=Pinball.js.map
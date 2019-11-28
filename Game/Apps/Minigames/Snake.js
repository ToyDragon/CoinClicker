"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("../App");
const Window_1 = require("../../OS/Window");
const Icons_1 = require("../../Core/Icons");
const Miner_1 = require("../Crypto/Miner");
class Snake extends App_1.default {
    constructor(options) {
        super();
        this.width = 17;
        this.height = 17;
        this.tileSize = 20;
        this.marginLeft = 6;
        this.marginTop = 0;
        this.sprites = {
            apple: "a",
            snakeTail: "o",
            snakeHead: "O",
            space: "."
        };
        this.options = options;
    }
    ComparePoints(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }
    IsSnakePos(pos, ignoreButt) {
        for (var i = 0; i < this.snakePosList.length; i++) {
            if (i === this.snakePosList.length - 1 && ignoreButt)
                continue;
            if (this.ComparePoints(pos, this.snakePosList[i]))
                return true;
        }
        return false;
    }
    RenderDisplay() {
        this.windowObj.contentDiv.empty();
        this.windowObj.contentDiv.css("background-color", "black");
        this.windowObj.contentDiv.css("color", "white");
        const getMessageChar = (pos) => {
            var GAME = "GAME OVER";
            var startX = Math.floor(this.width / 2 - GAME.length / 2);
            if (pos.y == 4 && pos.x >= startX && pos.x < startX + GAME.length) {
                return GAME[pos.x - startX];
            }
            var POINTS = "POINTS:" + (this.snakePosList.length - 3);
            startX = Math.floor(this.width / 2 - POINTS.length / 2);
            if (pos.y == 6 && pos.x >= startX && pos.x < startX + POINTS.length) {
                return POINTS[pos.x - startX];
            }
            return "";
        };
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var tile = $("<div></div>");
                var pos = { x: x, y: y };
                if (this.dead && getMessageChar(pos)) {
                    tile.text(getMessageChar(pos));
                    tile.css("color", "red");
                }
                else if (this.ComparePoints(pos, this.applePos)) {
                    tile.text(this.sprites.apple);
                    tile.css("color", "red");
                }
                else if (this.ComparePoints(pos, this.snakePosList[0])) {
                    tile.text(this.sprites.snakeHead);
                    tile.css("color", "green");
                    tile.css("font-weight", "bold");
                }
                else if (this.IsSnakePos(pos, false)) {
                    tile.text(this.sprites.snakeTail);
                    tile.css("color", "darkgreen");
                    tile.css("font-weight", "bold");
                }
                else {
                    tile.text(this.sprites.space);
                }
                tile.css("position", "absolute");
                tile.css("top", y * this.tileSize + this.marginTop + "px");
                tile.css("left", x * this.tileSize + this.marginLeft + "px");
                this.windowObj.contentDiv.append(tile);
            }
        }
    }
    CreateWindow() {
        this.applePos = { x: 8, y: 12 };
        this.direction = { x: 0, y: 1 };
        this.inputDirection = { x: 0, y: 1 };
        this.snakePosList = [
            { x: 8, y: 5 },
            { x: 8, y: 4 },
            { x: 8, y: 3 },
        ];
        this.dead = false;
        this.windowObj = new Window_1.default({
            innerWidth: this.width * this.tileSize,
            innerHeight: this.height * this.tileSize,
            icon: Icons_1.AllIcons.Snake,
            title: this.options.title
        });
        this.windowObj.on("keydown", (e) => {
            if (e.keyCode == 38 || e.keyCode == 87) {
                this.inputDirection = { x: 0, y: -1 };
            }
            if (e.keyCode == 37 || e.keyCode == 65) {
                this.inputDirection = { x: -1, y: 0 };
            }
            if (e.keyCode == 40 || e.keyCode == 83) {
                this.inputDirection = { x: 0, y: 1 };
            }
            if (e.keyCode == 39 || e.keyCode == 68) {
                this.inputDirection = { x: 1, y: 0 };
            }
        });
        this.windowObj.on("close", () => {
            Miner_1.default.RemoveBonus(Snake.playingBonus.symbol, Snake.playingBonus.name);
            if (this.tickInterval) {
                clearInterval(this.tickInterval);
                this.tickInterval = null;
            }
        });
        this.tickInterval = setInterval(() => { this.tick(); }, 300);
        this.RenderDisplay();
        Miner_1.default.AddBonus(Snake.playingBonus);
    }
    tick() {
        if (this.dead) {
            this.RenderDisplay();
            return;
        }
        if (this.inputDirection.x != this.direction.x * -1
            && this.inputDirection.y != this.direction.y * -1) {
            this.direction = this.inputDirection;
        }
        var headPos = this.snakePosList[0];
        var newPos = { x: headPos.x + this.direction.x, y: headPos.y + this.direction.y };
        if (this.IsSnakePos(newPos, true)) {
            this.dead = true;
        }
        if (newPos.x < 0 || newPos.x >= this.width
            || newPos.y < 0 || newPos.y >= this.height) {
            this.dead = true;
        }
        if (this.dead) {
            Miner_1.default.RemoveBonus(Snake.playingBonus.symbol, Snake.playingBonus.name);
            const points = (this.snakePosList.length - 3);
            if (Snake.highScore < points) {
                Snake.highScore = points;
                Miner_1.default.RemoveBonus("ACN", "Snake Highscore Bonus");
                Miner_1.default.AddBonus({
                    blockBoost: Snake.maxBoost * Math.min(points / Snake.maxApples, 1),
                    name: "Snake Highscore Bonus",
                    symbol: "ACN"
                });
            }
            return;
        }
        this.snakePosList.splice(0, 0, newPos);
        var snakeButt = this.snakePosList.pop();
        if (this.ComparePoints(newPos, this.applePos)) {
            this.snakePosList.push(snakeButt);
            while (this.IsSnakePos(this.applePos, false)) {
                this.applePos.x = Math.floor(Math.random() * this.width);
                this.applePos.y = Math.floor(Math.random() * this.height);
            }
        }
        this.RenderDisplay();
    }
}
Snake.highScore = 0;
Snake.maxApples = 40;
Snake.maxBoost = 2;
Snake.playingBonus = {
    speedBoost: 1.25,
    name: "Snake Speed",
    symbol: "ACN"
};
exports.default = Snake;
//# sourceMappingURL=Snake.js.map
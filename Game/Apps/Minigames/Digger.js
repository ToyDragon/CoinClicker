"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDom = require("react-dom");
const React = require("react");
const App_1 = require("../App");
const Window_1 = require("../../OS/Window");
const Icons_1 = require("../../Core/Icons");
const Utils_1 = require("../../Core/Utils");
const OS_1 = require("../../OS/OS");
const Label_1 = require("../../OS/Widgets/Label");
const Miner_1 = require("../Crypto/Miner");
const Icon_1 = require("../../OS/Widgets/Icon");
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    Multiply(scalar) {
        return new Point(this.x * scalar, this.y * scalar);
    }
    Add(other) {
        return new Point(this.x + other.x, this.y + other.y);
    }
    Floor() {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    }
    Equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
class Rectangle {
    constructor(topLeft, widthAndHeight) {
        this.topLeft = topLeft;
        this.widthAndHeight = widthAndHeight;
    }
    Multiply(scalar) {
        return new Rectangle(this.topLeft.Multiply(scalar), this.widthAndHeight.Multiply(scalar));
    }
    Add(offset) {
        return new Rectangle(this.topLeft.Add(offset), this.widthAndHeight);
    }
}
class Drawable {
    constructor(layer, type, miningStats) {
        this.layer = layer;
        this.type = type;
        this.miningStats = miningStats;
        this.topLeft = new Point(0, 0);
    }
    Equals(other) {
        return this.layer === other.layer
            && this.type === other.type
            && this.topLeft.Equals(other.topLeft);
    }
    GetPosition() {
        return this.topLeft.Multiply(1 / DiggerGame.tileSize).Floor();
    }
    MoveTo(topLeft) {
        this.topLeft = topLeft;
    }
}
Drawable.SCALE = 2;
class SkyDrawable extends Drawable {
    constructor() {
        super(0 /* background */, 0);
    }
    Draw(_rect, canvas) {
        canvas.fillStyle = "#2cb4e0";
        canvas.fillRect(0, 0, 360, 240);
    }
    CloneTo(topLeft) {
        return this;
    }
}
class EnergyDrawable extends Drawable {
    constructor() {
        super(4 /* hud */, 1);
        this.numberIndices = [
            new Point(0, 4), new Point(1, 4), new Point(2, 4), new Point(3, 4), new Point(4, 4), new Point(5, 4), new Point(6, 4), new Point(7, 4), new Point(8, 4), new Point(9, 4)
        ];
    }
    CloneTo(topLeft) {
        return this;
    }
    Draw(_rect, canvas) {
        const s = Drawable.SCALE;
        const width = 112;
        canvas.fillStyle = "white";
        canvas.fillRect(5 * s, 2 * s, (width + 17) * s, 11 * s);
        canvas.fillStyle = "black";
        canvas.fillRect(19 * s, 3 * s, 114 * s, 9 * s);
        this.DrawLabels(canvas);
        const nrgWidth = width * (DiggerGame.player.energy / DiggerGame.player.maxEnergy);
        canvas.fillStyle = "red";
        canvas.fillRect(20 * s, 4 * s, nrgWidth * s, 3 * s);
        const remainingNRGWidth = width - nrgWidth;
        canvas.fillStyle = "white";
        canvas.fillRect((20 + nrgWidth) * s, 4 * s, remainingNRGWidth * s, 3 * s);
        const invWidth = width * (DiggerGame.player.inventory / DiggerGame.player.maxInventory);
        canvas.fillStyle = "green";
        canvas.fillRect(20 * s, 8 * s, invWidth * s, 3 * s);
        const remainingINVWidth = width - invWidth;
        canvas.fillStyle = "white";
        canvas.fillRect((20 + invWidth) * s, 8 * s, remainingINVWidth * s, 3 * s);
        const t = DiggerGame.tileSize;
        if (DiggerGame.player.hasPlutonium) {
            this.DrawSprite(canvas, new Point(9, 1), 15 * t, 2 * s + t);
        }
        this.DrawSprite(canvas, new Point(4, 3), 15 * t, 2 * s);
        const depth = Math.max(DiggerGame.player.position.y - DiggerGame.grassRow, 0);
        for (let digit = 0; digit < 5; digit++) {
            const demoninator = Math.pow(10, digit);
            if (depth < demoninator && demoninator > 1) {
                break;
            }
            const value = Math.floor(depth / demoninator) % 10;
            this.DrawSprite(canvas, this.numberIndices[value], (29 - digit) * t / 2, 2 * s);
        }
    }
    DrawSprite(canvas, index, x, y) {
        const t = DiggerGame.tileSize;
        canvas.drawImage(SpritesheetDrawable.ele, index.x * t, index.y * t, t, t, x, y, t, t);
    }
    DrawLabels(canvas) {
        const s = Drawable.SCALE;
        //N
        let x = 5, y = 2;
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, 4 * s);
        canvas.fillRect((x + 4) * s, (y + 1) * s, s, 4 * s);
        canvas.fillRect((x + 2) * s, (y + 2) * s, s, s);
        canvas.fillRect((x + 3) * s, (y + 3) * s, s, s);
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, s);
        //R
        x = 10;
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, 4 * s);
        canvas.fillRect((x + 2) * s, (y + 1) * s, 2 * s, s);
        canvas.fillRect((x + 3) * s, (y + 2) * s, s, s);
        canvas.fillRect((x + 2) * s, (y + 3) * s, s, s);
        canvas.fillRect((x + 3) * s, (y + 4) * s, s, s);
        //G
        x = 14;
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, 4 * s);
        canvas.fillRect((x + 2) * s, (y + 1) * s, 2 * s, s);
        canvas.fillRect((x + 2) * s, (y + 4) * s, 2 * s, s);
        canvas.fillRect((x + 3) * s, (y + 3) * s, s, s);
        //I
        x = 5, y = 7;
        canvas.fillRect((x + 1) * s, (y + 1) * s, 3 * s, s);
        canvas.fillRect((x + 1) * s, (y + 4) * s, 3 * s, s);
        canvas.fillRect((x + 2) * s, (y + 2) * s, s, 2 * s);
        //N
        x = 9;
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, 4 * s);
        canvas.fillRect((x + 4) * s, (y + 1) * s, s, 4 * s);
        canvas.fillRect((x + 2) * s, (y + 2) * s, s, s);
        canvas.fillRect((x + 3) * s, (y + 3) * s, s, s);
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, s);
        //V
        x = 14;
        canvas.fillRect((x + 1) * s, (y + 1) * s, s, 3 * s);
        canvas.fillRect((x + 3) * s, (y + 1) * s, s, 3 * s);
        canvas.fillRect((x + 2) * s, (y + 4) * s, s, s);
    }
}
class SpritesheetDrawable extends Drawable {
    constructor(index, layer = 1 /* tile */, miningStats) {
        super(layer, 2, miningStats);
        this.index = index;
        if (SpritesheetDrawable.ele === null) {
            SpritesheetDrawable.ele = document.createElement("img");
            SpritesheetDrawable.ele.src = SpritesheetDrawable.url;
        }
    }
    Draw(rect, canvas) {
        const s = DiggerGame.tileSize;
        let bottomRight = rect.topLeft.Add(rect.widthAndHeight);
        if (this.topLeft.x + 2 * s >= rect.topLeft.x
            && this.topLeft.x - s <= bottomRight.x
            && this.topLeft.y + 2 * s >= rect.topLeft.y
            && this.topLeft.y - s <= bottomRight.y) {
            canvas.drawImage(SpritesheetDrawable.ele, this.index.x * s, this.index.y * s, s, s, this.topLeft.x - rect.topLeft.x, this.topLeft.y - rect.topLeft.y, s, s);
        }
        else {
            console.log("Hiding because " + this.topLeft.x + "," + this.topLeft.y + " is not in the bounds of "
                + rect.topLeft.x + "," + rect.topLeft.y + " to "
                + bottomRight.x + "," + bottomRight.y);
        }
    }
    CloneTo(topLeft) {
        const newEle = new SpritesheetDrawable(this.index, this.layer, this.miningStats);
        newEle.topLeft = topLeft;
        return newEle;
    }
}
SpritesheetDrawable.ele = null;
SpritesheetDrawable.url = Utils_1.AssetLocation + "icons/DiggerIcons.png";
class BigSpritesheetDrawable extends SpritesheetDrawable {
    constructor(index, size, layer = 1 /* tile */) {
        super(index, layer);
        this.size = size;
        this.type = 3;
    }
    Draw(rect, canvas) {
        const originalIndex = this.index;
        const originalPos = this.topLeft;
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                this.index = originalIndex.Add(new Point(x, y));
                this.topLeft = originalPos.Add(new Point(x, y).Multiply(DiggerGame.tileSize));
                super.Draw(rect, canvas);
            }
        }
        this.index = originalIndex;
        this.topLeft = originalPos;
    }
    CloneTo(topLeft) {
        const newEle = new BigSpritesheetDrawable(this.index, this.size, this.layer);
        newEle.topLeft = topLeft;
        return newEle;
    }
}
const Drawables = {
    Grass0: new SpritesheetDrawable(new Point(0, 0)),
    Grass1: new SpritesheetDrawable(new Point(1, 0)),
    Grass2: new SpritesheetDrawable(new Point(2, 0)),
    Grass3: new SpritesheetDrawable(new Point(3, 0)),
    GrassOverlay0: new SpritesheetDrawable(new Point(4, 0), 2 /* tileOverlay */),
    GrassOverlay1: new SpritesheetDrawable(new Point(5, 0), 2 /* tileOverlay */),
    GrassOverlay2: new SpritesheetDrawable(new Point(6, 0), 2 /* tileOverlay */),
    Dirt0: new SpritesheetDrawable(new Point(7, 0), 1 /* tile */, { energyCost: 1, value: 0, weight: 0 }),
    DirtDeco0: new SpritesheetDrawable(new Point(8, 0), 1 /* tile */, { energyCost: 0, value: 0, weight: 0 }),
    DirtDeco1: new SpritesheetDrawable(new Point(9, 0), 1 /* tile */, { energyCost: 0, value: 0, weight: 0 }),
    Ore0: new SpritesheetDrawable(new Point(1, 1), 1 /* tile */, { energyCost: 0, value: 2, weight: 1 }),
    Ore1: new SpritesheetDrawable(new Point(0, 1), 1 /* tile */, { energyCost: 0, value: 4, weight: 2 }),
    Ore2: new SpritesheetDrawable(new Point(9, 2), 1 /* tile */, { energyCost: 2, value: 12, weight: 4 }),
    BreakOverlay0: new SpritesheetDrawable(new Point(7, 2), 1 /* tile */, { energyCost: -1, value: 0, weight: 0 }),
    Stone0: new SpritesheetDrawable(new Point(6, 2), 1 /* tile */, { energyCost: 2, value: 0, weight: 0 }),
    Concrete0: new SpritesheetDrawable(new Point(7, 3), 1 /* tile */, { energyCost: 4, value: 0, weight: 0 }),
    Plutonium0: new SpritesheetDrawable(new Point(8, 1), 1 /* tile */, { energyCost: 0, value: 0, weight: 0, isPlutonium: true }),
    /*plutonium overlay included in HUD*/
    ShopAura0: new SpritesheetDrawable(new Point(2, 1), 2 /* tileOverlay */),
    ShopAura1: new SpritesheetDrawable(new Point(3, 1), 2 /* tileOverlay */),
    ShopFloor0: new SpritesheetDrawable(new Point(4, 1), 2 /* tileOverlay */),
    ShopFloor1: new SpritesheetDrawable(new Point(5, 1), 2 /* tileOverlay */),
    ShopArrow0: new SpritesheetDrawable(new Point(6, 1), 2 /* tileOverlay */),
    ShopSign0: new SpritesheetDrawable(new Point(0, 2), 2 /* tileOverlay */),
    ShopSign1: new SpritesheetDrawable(new Point(1, 2), 2 /* tileOverlay */),
    ShopSign2: new SpritesheetDrawable(new Point(2, 2), 2 /* tileOverlay */),
    ShopSign3: new SpritesheetDrawable(new Point(3, 2), 2 /* tileOverlay */),
    ShopSign4: new SpritesheetDrawable(new Point(0, 3), 2 /* tileOverlay */),
    ShopSign5: new SpritesheetDrawable(new Point(1, 3), 2 /* tileOverlay */),
    ShopSign6: new SpritesheetDrawable(new Point(2, 3), 2 /* tileOverlay */),
    NRGLabel0: new SpritesheetDrawable(new Point(7, 2), 2 /* tileOverlay */),
    NRGLabel1: new SpritesheetDrawable(new Point(8, 2), 2 /* tileOverlay */),
    Player0: new SpritesheetDrawable(new Point(7, 1), 3 /* entity */),
    Player1: new SpritesheetDrawable(new Point(8, 2), 3 /* entity */),
    Player2: new SpritesheetDrawable(new Point(9, 3), 3 /* entity */),
    Player3: new SpritesheetDrawable(new Point(8, 3), 3 /* entity */),
    OutOfNRG0: new BigSpritesheetDrawable(new Point(4, 5), new Point(3, 1), 4 /* hud */),
    OutOfINV0: new BigSpritesheetDrawable(new Point(0, 5), new Point(4, 1), 4 /* hud */),
};
class Player {
    constructor() {
        this.money = 0;
        this.inventroyValue = 0;
        this.maxEnergy = 10;
        this.diggingPower = 1;
        this.energy = this.maxEnergy;
        this.inventory = 0;
        this.maxInventory = 4;
        this.position = new Point(4, DiggerGame.grassRow - 1);
        this.drawable = Drawables.Player0.CloneTo(this.position.Multiply(DiggerGame.tileSize));
    }
    MoveTo(newPos) {
        this.position = newPos;
        this.drawable.MoveTo(newPos.Multiply(DiggerGame.tileSize));
    }
    UpdateShovelIcon() {
        if (this.diggingPower > 7) {
            this.drawable = Drawables.Player3.CloneTo(this.position.Multiply(DiggerGame.tileSize));
        }
        else if (this.diggingPower > 3) {
            this.drawable = Drawables.Player2.CloneTo(this.position.Multiply(DiggerGame.tileSize));
        }
        else if (this.diggingPower > 1) {
            this.drawable = Drawables.Player1.CloneTo(this.position.Multiply(DiggerGame.tileSize));
        }
        else {
            this.drawable = Drawables.Player0.CloneTo(this.position.Multiply(DiggerGame.tileSize));
        }
    }
}
class DrawableList {
    constructor() {
        this.drawables = [];
    }
    Add(drawable) {
        let added = false;
        for (let i = 0; i < this.drawables.length; i++) {
            if (this.drawables[i].layer > drawable.layer) {
                this.drawables.splice(i, 0, drawable);
                added = true;
                break;
            }
        }
        if (!added) {
            this.drawables.push(drawable);
        }
    }
    Remove(drawable) {
        for (let i = 0; i < this.drawables.length; i++) {
            if (this.drawables[i].Equals(drawable)) {
                this.drawables.splice(i, 1);
                break;
            }
        }
    }
}
class DiggerGame extends App_1.default {
    constructor(options) {
        super();
        this.shop = new DiggerShop({
            game: this
        });
        this.options = options;
        DiggerGame.player = new Player();
        this.hud = [];
        this.background = [];
        this.tiles = [];
        for (let y = 0; y < DiggerGame.height; y++) {
            const row = [];
            for (let x = 0; x < DiggerGame.width; x++) {
                row.push(new DrawableList());
            }
            this.tiles.push(row);
        }
        this.screen = new Rectangle(new Point(0, 0), new Point(DiggerGame.screenWidth, DiggerGame.screenHeight)).Multiply(DiggerGame.tileSize);
        this.AddDrawable(new SkyDrawable());
        this.AddDrawable(new EnergyDrawable());
        this.InitShop();
        this.InitGrass();
        this.InitUnderground();
    }
    AddDrawable(drawable) {
        if (drawable.layer === 0 /* background */) {
            this.background.push(drawable);
        }
        else if (drawable.layer === 4 /* hud */) {
            this.hud.push(drawable);
        }
        else {
            const position = drawable.GetPosition();
            if (position.y < 0 || position.y > this.tiles.length || position.x < 0 || position.x > this.tiles[position.y].length) {
                console.log("Error adding drawable of type " + drawable.type + " to position " + position.x + "," + position.y);
            }
            if (!this.tiles[position.y][position.x]) {
                console.log("No drawableList for drawable of type " + drawable.type + " to position " + position.x + "," + position.y + " with topLeft " + drawable.topLeft.x + "," + drawable.topLeft.y);
            }
            this.tiles[position.y][position.x].Add(drawable);
        }
    }
    RemoveDrawable(drawable) {
        if (drawable.layer === 0 /* background */) {
            for (let i = 0; i < this.background.length; i++) {
                if (this.background[i].Equals(drawable)) {
                    this.background.splice(i, 1);
                    break;
                }
            }
        }
        else if (drawable.layer === 4 /* hud */) {
            for (let i = 0; i < this.hud.length; i++) {
                if (this.hud[i].Equals(drawable)) {
                    this.hud.splice(i, 1);
                    break;
                }
            }
        }
        else {
            const position = drawable.GetPosition();
            if (position.y < 0 || position.y > this.tiles.length || position.x < 0 || position.x > this.tiles[position.y].length) {
                console.log("Error removing drawable of type " + drawable.type + " to position " + position.x + "," + position.y);
            }
            if (!this.tiles[position.y][position.x]) {
                console.log("No drawableList for drawable of type " + drawable.type + " to position " + position.x + "," + position.y + " with topLeft " + drawable.topLeft.x + "," + drawable.topLeft.y);
            }
            this.tiles[position.y][position.x].Remove(drawable);
        }
    }
    InitUnderground() {
        for (let y = DiggerGame.grassRow + 1; y < DiggerGame.height; y++) {
            let plutoniumCol = -1;
            if ((y - DiggerGame.grassRow) % 25 === 0) {
                plutoniumCol = Math.floor(Math.random() * DiggerGame.width);
            }
            for (let x = 0; x < DiggerGame.width; x++) {
                let sprite = Drawables.Dirt0;
                if (y > (100 + DiggerGame.grassRow)) {
                    sprite = Drawables.Stone0;
                }
                if (y > (200 + DiggerGame.grassRow)) {
                    sprite = Drawables.Concrete0;
                }
                this.AddDrawable(sprite.CloneTo(new Point(x, y).Multiply(DiggerGame.tileSize)));
                const r = Math.random();
                sprite = null;
                if (x === plutoniumCol) {
                    sprite = Drawables.Plutonium0;
                }
                else if (r > 0.85) {
                    sprite = Drawables.DirtDeco0;
                    if (r > 0.875) {
                        sprite = Drawables.DirtDeco1;
                        if (r > 0.9) {
                            if (y >= 150) {
                                sprite = Drawables.Ore1;
                                if (r > 0.95) {
                                    sprite = Drawables.Ore2;
                                }
                            }
                            else if (y >= 50) {
                                sprite = Drawables.Ore0;
                                if (r > 0.91) {
                                    sprite = Drawables.Ore1;
                                }
                            }
                            else {
                                sprite = Drawables.Ore0;
                                if (r > 0.95) {
                                    sprite = Drawables.Ore1;
                                }
                            }
                        }
                    }
                }
                if (sprite) {
                    this.AddDrawable(sprite.CloneTo(new Point(x, y).Multiply(DiggerGame.tileSize)));
                }
            }
        }
    }
    InitGrass() {
        //Layer of grass on top of ground
        for (let i = 0; i < DiggerGame.width; i++) {
            if (i === 7 || i === 8) {
                //Gap in surface
                continue;
            }
            const r = Math.random();
            let sprite = Drawables.Grass2;
            if (r > 0.4) {
                sprite = Drawables.Grass1;
                if (r > 0.6) {
                    sprite = Drawables.Grass0;
                    if (r > 0.8) {
                        sprite = Drawables.Grass3;
                    }
                }
            }
            this.AddDrawable(sprite.CloneTo(new Point(i, DiggerGame.grassRow).Multiply(DiggerGame.tileSize)));
        }
        //Grass overlay over first row of dirt
        for (let x = 0; x < DiggerGame.width; x++) {
            if (x === 7 || x === 8) {
                //Gap in surface
                continue;
            }
            let sprite = Drawables.GrassOverlay0;
            if (x % 3 === 1) {
                sprite = Drawables.GrassOverlay1;
            }
            if (x % 3 === 2) {
                sprite = Drawables.GrassOverlay2;
            }
            this.AddDrawable(sprite.CloneTo(new Point(x, DiggerGame.grassRow + 1).Multiply(DiggerGame.tileSize)));
        }
    }
    InitShop() {
        this.AddDrawable(Drawables.ShopFloor0.CloneTo(new Point(0, DiggerGame.grassRow).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopFloor1.CloneTo(new Point(1, DiggerGame.grassRow).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopAura0.CloneTo(new Point(0, DiggerGame.grassRow - 1).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopAura1.CloneTo(new Point(1, DiggerGame.grassRow - 1).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign0.CloneTo(new Point(0.5, 2.3).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign1.CloneTo(new Point(1.5, 2.3).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign2.CloneTo(new Point(2.5, 2.3).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign3.CloneTo(new Point(3.5, 2.3).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign4.CloneTo(new Point(0.5, 3.3).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign5.CloneTo(new Point(1.5, 3.3).Multiply(DiggerGame.tileSize)));
        this.AddDrawable(Drawables.ShopSign6.CloneTo(new Point(2.5, 3.3).Multiply(DiggerGame.tileSize)));
    }
    RenderDisplay() {
        const ctx = this.canvas.getContext("2d");
        for (let drawable of this.background) {
            drawable.Draw(this.screen, ctx);
        }
        const topLeftRounded = this.screen.topLeft.Multiply(1 / DiggerGame.tileSize).Floor();
        const startingRow = topLeftRounded.y;
        const startingColumn = topLeftRounded.x;
        for (let y = startingRow - 1; y < startingRow + DiggerGame.screenHeight + 1; y++) {
            for (let x = startingColumn - 1; x < startingColumn + DiggerGame.screenWidth + 1; x++) {
                if (y < 0 || y >= this.tiles.length || x < 0 || x >= this.tiles[y].length) {
                    continue;
                }
                for (let drawable of this.tiles[y][x].drawables) {
                    drawable.Draw(this.screen, ctx);
                }
            }
        }
        DiggerGame.player.drawable.Draw(this.screen, ctx);
        for (let drawable of this.hud) {
            drawable.Draw(this.screen, ctx);
        }
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            innerWidth: DiggerGame.screenWidth * DiggerGame.tileSize,
            innerHeight: DiggerGame.screenHeight * DiggerGame.tileSize,
            icon: Icons_1.AllIcons.Shovel,
            title: this.options.title
        });
        this.windowObj.on("keydown", (e) => {
            this.ProcessInput(e);
        });
        this.windowObj.on("close", () => {
            if (this.tickInterval) {
                clearInterval(this.tickInterval);
                this.tickInterval = null;
            }
            this.windowObj = null;
            if (this.shop.windowObj) {
                this.shop.windowObj.CloseWindow(false);
            }
        });
        this.tickInterval = setInterval(() => { this.RenderDisplay(); }, 300);
        this.canvas = document.createElement("canvas");
        this.canvas.width = DiggerGame.screenWidth * DiggerGame.tileSize;
        this.canvas.height = DiggerGame.screenHeight * DiggerGame.tileSize;
        this.windowObj.contentDiv.append(this.canvas);
        this.RenderDisplay();
    }
    ProcessInput(e) {
        let inputDirection = null;
        if (e.keyCode === 38 || e.keyCode === 87) {
            inputDirection = new Point(0, -1);
        }
        if (e.keyCode === 37 || e.keyCode === 65) {
            inputDirection = new Point(-1, 0);
        }
        if (e.keyCode === 40 || e.keyCode === 83) {
            inputDirection = new Point(0, 1);
        }
        if (e.keyCode === 39 || e.keyCode === 68) {
            inputDirection = new Point(1, 0);
        }
        if (inputDirection) {
            let newPos = DiggerGame.player.position.Add(inputDirection);
            if (this.TryMoveToPosition(newPos)) {
                this.UpdateScreen();
                this.RenderDisplay();
            }
        }
    }
    UpdateScreen() {
        this.screen = new Rectangle(new Point(0, DiggerGame.player.position.y + 1 - DiggerGame.grassRow).Multiply(DiggerGame.tileSize), this.screen.widthAndHeight);
    }
    TryMoveToPosition(pos) {
        if (pos.y < (DiggerGame.grassRow - 1) || pos.y >= DiggerGame.height || pos.x < 0 || pos.x >= DiggerGame.width) {
            return false;
        }
        let totalCost = 0;
        let unbreakable = false;
        let totalWeight = 0;
        let isPlutonium = false;
        let totalValue = 0;
        for (let i = this.tiles[pos.y][pos.x].drawables.length - 1; i >= 0; i--) {
            const drawable = this.tiles[pos.y][pos.x].drawables[i];
            if (drawable.layer === 1 /* tile */) {
                if (drawable.miningStats) {
                    totalCost += drawable.miningStats.energyCost;
                    totalWeight += drawable.miningStats.weight;
                    totalValue += drawable.miningStats.value;
                    isPlutonium = isPlutonium || !!drawable.miningStats.isPlutonium;
                }
                else {
                    unbreakable = true;
                    break;
                }
            }
        }
        let remainingInv = DiggerGame.player.maxInventory - DiggerGame.player.inventory;
        const requiredEnergy = Math.min(1, totalCost);
        if (unbreakable) {
            return false;
        }
        if (DiggerGame.player.energy < requiredEnergy) {
            const banner = Drawables.OutOfNRG0.CloneTo(pos.Add(new Point(0.5, 0.5)).Multiply(DiggerGame.tileSize));
            this.AddDrawable(banner);
            setTimeout(() => {
                this.RemoveDrawable(banner);
                this.UpdateScreen();
            }, 1000);
            this.UpdateScreen();
            return false;
        }
        if (totalWeight > remainingInv || isPlutonium && DiggerGame.player.hasPlutonium) {
            const banner = Drawables.OutOfINV0.CloneTo(pos.Add(new Point(0.5, 0.5)).Multiply(DiggerGame.tileSize));
            this.AddDrawable(banner);
            setTimeout(() => {
                this.RemoveDrawable(banner);
                this.UpdateScreen();
            }, 1000);
            this.UpdateScreen();
            return false;
        }
        const effectivePower = Math.min(DiggerGame.player.diggingPower, DiggerGame.player.energy);
        if (totalCost <= effectivePower) {
            for (let i = this.tiles[pos.y][pos.x].drawables.length - 1; i >= 0; i--) {
                const drawable = this.tiles[pos.y][pos.x].drawables[i];
                if (drawable.layer === 1 /* tile */) {
                    this.tiles[pos.y][pos.x].drawables.splice(i, 1);
                }
            }
            DiggerGame.player.energy -= totalCost;
            DiggerGame.player.inventory += totalWeight;
            DiggerGame.player.inventroyValue += totalValue;
            DiggerGame.player.hasPlutonium = DiggerGame.player.hasPlutonium || isPlutonium;
            DiggerGame.player.MoveTo(pos);
            if (pos.x <= 1 && pos.y === DiggerGame.grassRow - 1) {
                DiggerGame.player.energy = DiggerGame.player.maxEnergy;
                if (DiggerGame.player.inventroyValue > 0) {
                    OS_1.OS.MakeToast("Sold ore for " + DiggerGame.player.inventroyValue + "!");
                }
                if (DiggerGame.player.hasPlutonium) {
                    if (DiggerGame.bonusPoints >= DiggerGame.maxPoints) {
                        OS_1.OS.MakeToast("Maximum plutonium bonus reached!");
                    }
                    else {
                        OS_1.OS.MakeToast("Increased plutonium mining bonus!");
                        DiggerGame.bonusPoints++;
                        Miner_1.default.RemoveBonus("ACN", "Plutonium Boost");
                        Miner_1.default.AddBonus({
                            symbol: "ACN",
                            blockBoost: DiggerGame.maxBonus * Math.min(DiggerGame.bonusPoints / DiggerGame.maxPoints, 1),
                            name: "Plutonium Boost"
                        });
                    }
                }
                DiggerGame.player.hasPlutonium = false;
                DiggerGame.player.money += DiggerGame.player.inventroyValue;
                DiggerGame.player.inventory = 0;
                DiggerGame.player.inventroyValue = 0;
                this.shop.ActivateOrCreate();
            }
            else {
                if (this.shop.windowObj) {
                    this.shop.windowObj.CloseWindow(false);
                }
            }
        }
        else {
            for (let i = 0; i < effectivePower; i++) {
                this.AddDrawable(Drawables.BreakOverlay0.CloneTo(pos.Multiply(DiggerGame.tileSize)));
            }
            DiggerGame.player.energy -= effectivePower;
        }
        return true;
    }
}
DiggerGame.width = 16;
DiggerGame.height = 2048;
DiggerGame.tileSize = 20;
DiggerGame.screenHeight = 12;
DiggerGame.screenWidth = 16;
DiggerGame.grassRow = 5;
DiggerGame.bonusPoints = 0;
DiggerGame.maxBonus = 2;
DiggerGame.maxPoints = 20;
exports.default = DiggerGame;
class DiggerShop extends App_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.items = [
            { label: "Granola Bars", energy: 1 },
            { label: "Extra Pockets", inventory: 1 },
            { label: "Swim Practice", energy: 1, inventory: 1 },
            { label: "All-terrain Skateboard", energy: 1 },
            { label: "Red Wagon", inventory: 1 },
            { label: "Knee Pads", energy: 1 },
            { label: "Become Mole-man", inventory: 1, energy: 1 },
            { label: "Photosynthsis", energy: 1 },
            { label: "Cargo Shorts", inventory: 1 },
            { label: "Mom's PB&J", energy: 1 },
            { label: "Helium Balloons", inventory: 1 },
            { label: "Aerodynamic Suit", energy: 1, inventory: 1 },
            { label: "Shovel Hoodie", inventory: 1 },
            { label: "Morning Pep-talk", energy: 1 },
            { label: "Minivan", inventory: 1 },
            { label: "New Sneakers", energy: 1 },
            { label: "Fanny Pack", inventory: 1 },
            { label: "Vanilla Icecream", energy: 1, inventory: 1 },
            { label: "Third Arm", inventory: 1 },
            { label: "Mysterious Pills", energy: 1 },
            { label: "To-go Cup", inventory: 1 },
            { label: "Crystall Ball", energy: 1 },
            { label: "Back Pack", inventory: 1 },
            { label: "Coffee", energy: 1, inventory: 1 },
            { label: "Shopping Cart", inventory: 1 },
            { label: "AA Battery", energy: 1 },
            { label: "Overalls", inventory: 1 },
            { label: "Energy Drink", energy: 1 },
            { label: "Big Green Tractor", inventory: 1 },
            { label: "Rocket Fuel", energy: 1, inventory: 1 },
        ].map((a, i) => {
            const growth = 1.3;
            a.cost = Math.floor(12 * Math.pow(growth, i));
            if (a.energy) {
                a.energy = Math.floor(10 * Math.pow(growth, i));
            }
            if (a.inventory) {
                a.inventory = Math.floor(5 * Math.pow(growth, i));
            }
            if (a.energy && a.inventory) {
                a.tooltip = "+" + a.energy + " and +" + a.inventory;
            }
            else if (a.energy) {
                a.tooltip = "+" + a.energy;
            }
            else if (a.inventory) {
                a.tooltip = "+" + a.inventory;
            }
            return a;
        });
        this.equips = [
            { cost: 200, label: "Mjolnir Shovel", tooltip: "+1 Digging Power", diggingPower: 1 },
            { cost: 1000, label: "Adamantium Shovel", tooltip: "+2 Digging Power", diggingPower: 2 },
            { cost: 7000, label: "Bronze Spade", tooltip: "+4 Digging Power", diggingPower: 4 },
        ];
    }
    CreateWindow() {
        this.windowObj = new Window_1.default({
            innerWidth: 388,
            innerHeight: 277,
            icon: Icons_1.AllIcons.Shovel,
            title: "Digger Shop"
        });
        this.windowObj.on("keydown", (e) => {
            this.options.game.ProcessInput(e);
        });
        this.windowObj.on("close", () => {
            if (this.options.game.windowObj) {
                this.options.game.windowObj.ActivateWindow(false);
            }
        });
        const moneyLabelRef = React.createRef();
        const energyLabelRef = React.createRef();
        const inventoryLabelRef = React.createRef();
        const itemListRef = React.createRef();
        const tabstripRef = React.createRef();
        const equipListRef = React.createRef();
        const thirdWidth = { width: "33.3%", verticalAlign: "top", display: "inline-block", position: "relative" };
        const center = { marginTop: "3px", position: "relative", left: "50%", transform: "translate(-50%)", display: "inline-block" };
        const blue = { backgroundColor: "blue", borderRadius: "5px", border: "1px solid cyan", padding: "4px", margin: "2px", display: "inline-block" };
        const red = { backgroundColor: "red", borderRadius: "5px", border: "1px solid pink", padding: "4px", margin: "2px", display: "inline-block" };
        const green = { backgroundColor: "green", borderRadius: "5px", border: "1px solid teal", padding: "4px", margin: "2px", display: "inline-block" };
        ReactDom.render(React.createElement("div", null,
            React.createElement("div", { style: thirdWidth },
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Money" }))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: blue },
                            React.createElement(Label_1.default, { ref: moneyLabelRef, tooltip: "Money", color: "cyan", title: Utils_1.default.DisplayNumber(DiggerGame.player.money) }))))),
            React.createElement("div", { style: thirdWidth },
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Energy" }))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: red },
                            React.createElement(Label_1.default, { ref: energyLabelRef, tooltip: "Energy", color: "pink", title: Utils_1.default.DisplayNumber(DiggerGame.player.maxEnergy) }))))),
            React.createElement("div", { style: thirdWidth },
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement(Label_1.default, { title: "Inventory" }))),
                React.createElement("div", null,
                    React.createElement("div", { style: center },
                        React.createElement("div", { style: green },
                            React.createElement(Label_1.default, { ref: inventoryLabelRef, tooltip: "Inventory", color: "lightgreen", title: Utils_1.default.DisplayNumber(DiggerGame.player.maxInventory) }))))),
            React.createElement("div", { ref: tabstripRef, className: "tabSection" },
                React.createElement("div", { className: "tabstrip" },
                    React.createElement("div", { className: "tab active", "data-tabname": "Upgrade" }, "Upgrades"),
                    React.createElement("div", { className: "tab", "data-tabname": "Equipment" }, "Equipment")),
                React.createElement("div", { className: "tabContent", "data-tabname": "Upgrade", style: { overflowY: "scroll", height: "180px" }, ref: itemListRef }),
                React.createElement("div", { className: "tabContent nodisp", "data-tabname": "Equipment", style: { overflowY: "scroll", height: "180px" }, ref: equipListRef }))), this.windowObj.contentDiv[0]);
        this.moneyLabel = moneyLabelRef.current;
        this.energyLabel = energyLabelRef.current;
        this.inventoryLabel = inventoryLabelRef.current;
        this.itemList = itemListRef.current;
        this.equipList = equipListRef.current;
        Utils_1.default.SetupTabStrip(tabstripRef.current);
        this.UpdateDisplay();
        tabstripRef.current.style.width = "calc(100% - 2px)";
    }
    RenderItem(item, index, isUpgrade) {
        return (React.createElement("div", { className: "shopItem", key: index, onClick: () => {
                if (DiggerGame.player.money >= item.cost) {
                    if (item.diggingPower) {
                        DiggerGame.player.diggingPower += item.diggingPower;
                        DiggerGame.player.UpdateShovelIcon();
                    }
                    if (item.energy)
                        DiggerGame.player.maxEnergy += item.energy;
                    if (item.inventory)
                        DiggerGame.player.maxInventory += item.inventory;
                    DiggerGame.player.energy = DiggerGame.player.maxEnergy;
                    DiggerGame.player.money -= item.cost;
                    if (isUpgrade) {
                        this.items.splice(index, 1);
                    }
                    else {
                        this.equips.splice(index, 1);
                    }
                    this.UpdateDisplay();
                }
            } },
            React.createElement(Icon_1.default, { icon: Icons_1.AllIcons.Shovel.veryLarge }),
            React.createElement("div", { className: "shopItemTitleSection" },
                React.createElement("div", null,
                    React.createElement(Label_1.default, { title: item.label })),
                React.createElement("div", null,
                    React.createElement(Label_1.default, { title: item.tooltip, size: 12 }))),
            React.createElement("div", { className: "shopItemPrice" },
                React.createElement(Label_1.default, { title: Utils_1.default.DisplayNumber(item.cost) }))));
    }
    UpdateDisplay() {
        this.moneyLabel.SetTitle(Utils_1.default.DisplayNumber(DiggerGame.player.money));
        this.energyLabel.SetTitle(Utils_1.default.DisplayNumber(DiggerGame.player.maxEnergy));
        this.inventoryLabel.SetTitle(Utils_1.default.DisplayNumber(DiggerGame.player.maxInventory));
        ReactDom.unmountComponentAtNode(this.itemList);
        ReactDom.render(this.items.map((item, i) => { return this.RenderItem(item, i, true); }), this.itemList);
        ReactDom.unmountComponentAtNode(this.equipList);
        ReactDom.render(this.equips.map((item, i) => { return this.RenderItem(item, i, false); }), this.equipList);
    }
}
//# sourceMappingURL=Digger.js.map
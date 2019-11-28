"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
module.exports = [
    {
        output: {
            filename: "gameBundle.js",
            path: Path.resolve(__dirname, "../bin/game"),
            libraryTarget: "commonjs"
        },
        entry: "./Game.js",
        mode: "development"
    }
];
//# sourceMappingURL=webpack.config.js.map
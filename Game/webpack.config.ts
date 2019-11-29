import * as Path from "path";

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
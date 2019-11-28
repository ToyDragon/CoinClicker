let express = require("express");
let compression = require("compression");
let path = require("path");
let app = express();
app.use(compression());
//Kind of silly to expose everything in the repo, but this is to mimic Github pages.
app.use(express.static(__dirname + "/.."));
/*
app.use(express.static(__dirname + "/../bin/game"));
app.use("/Assets", express.static(__dirname + "/../Assets"));
app.use("/Libs", express.static(__dirname + "/../Libs"));
app.get("/", (_req, res) => {
    res.sendFile(path.resolve(__dirname + "/../Assets/game.html"));
});
app.get("/favicon.ico", (_req, res) => {
    res.sendFile(path.resolve(__dirname + "/../Assets/Frog256.png"));
});
*/
let port = 80;
app.listen(port, () => {
    console.log("Listening on port " + port);
});
//# sourceMappingURL=Server.js.map
import * as express from "express";
let compression = require("compression");

let app = express();
app.use(compression());


//Kind of silly to expose everything in the repo, but this is to mimic Github pages.
app.use("/CoinClicker", express.static(__dirname + "/.."));

app.get("/", (_req, res) => {
    res.redirect("/CoinClicker/");
});

let port = 80;
app.listen(port, () => {
    console.log("Listening on port " + port);
})
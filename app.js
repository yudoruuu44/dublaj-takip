const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "gizli_anahtar",
    resave: false,
    saveUninitialized: true
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

const ADMIN = { username: "LyNex", password: "1234" };

app.get("/", (req, res) => {
    if (req.session.loggedIn) {
        res.redirect("/panel");
    } else {
        res.render("login");
    }
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN.username && password === ADMIN.password) {
        req.session.loggedIn = true;
        res.redirect("/panel");
    } else {
        res.send("Hatalı giriş");
    }
});

app.get("/panel", (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/");
    const kisiler = JSON.parse(fs.readFileSync("./data/kisiler.json", "utf8"));
    res.render("panel", { kisiler });
});

app.post("/ekle", (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/");
    const { isim } = req.body;
    const kisiler = JSON.parse(fs.readFileSync("./data/kisiler.json", "utf8"));
    kisiler.push({ isim, durum: false });
    fs.writeFileSync("./data/kisiler.json", JSON.stringify(kisiler, null, 2));
    res.redirect("/panel");
});

app.post("/guncelle", (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/");
    const { index } = req.body;
    const kisiler = JSON.parse(fs.readFileSync("./data/kisiler.json", "utf8"));
    kisiler[index].durum = !kisiler[index].durum;
    fs.writeFileSync("./data/kisiler.json", JSON.stringify(kisiler, null, 2));
    res.redirect("/panel");
});

app.post("/sil", (req, res) => {
    if (!req.session.loggedIn) return res.redirect("/");
    const { index } = req.body;
    const kisiler = JSON.parse(fs.readFileSync("./data/kisiler.json", "utf8"));
    kisiler.splice(index, 1);
    fs.writeFileSync("./data/kisiler.json", JSON.stringify(kisiler, null, 2));
    res.redirect("/panel");
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});

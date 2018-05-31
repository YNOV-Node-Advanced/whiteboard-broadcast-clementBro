const path = require("path");
const http = require("http");
const express = require("express");
const uuidv4 = require("uuid/v4");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const PUBLIC_FOLDER = path.join(__dirname, "../public");
const PORT = process.env.PORT || 5000;

// Completer ce fichier
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        console.log("received: %s", message);
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    //ws.send("something");
});

// Assign a random channel to people opening the application
app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:channel", (req, res, next) => {
    res.sendFile(path.join(PUBLIC_FOLDER, "index.html"), {}, err => {
    if (err) {
        next(err);
    }
});
});

app.use(express.static(PUBLIC_FOLDER));
server.listen(PORT);
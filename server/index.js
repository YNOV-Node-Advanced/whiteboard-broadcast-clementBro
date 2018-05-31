const path = require("path");
const http = require("http");
const express = require("express");
const uuidv4 = require("uuid/v4");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const PUBLIC_FOLDER = path.join(__dirname, "../public");
const PORT = process.env.PORT || 5000;

const socketsPerChannels = new Map();
const channelPerSocket = new WeakMap();

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

function subscribe(socket: WebSocket, channel: string): void{
    let socketSubscribed = socketsPerChannels.get(channel) || new Set();
    let channelSubscribed = channelPerSocket.get(socket) || new Set();

    socketsPerChannels.set(channel, socketSubscribed);
    channelPerSocket.set(socket,channelSubscribed);
};

function unSubscribe(socket: WebSocket, channel: string): void{
    let socketSubscribed = socketsPerChannels.get(channel) || new Set();
    let channelSubscribed = channelPerSocket.get(socket) || new Set();

    socketsPerChannels.delete(channel, socketSubscribed);
    channelPerSocket.delete(socket,channelSubscribed);
};

function unSubscribeAll(socket: WebSocket): void{
    let socketSubscribed = socketsPerChannels.get(channel) || new Set();
    let channelSubscribed = channelPerSocket.get(socket) || new Set();

    socketsPerChannels.delete(channel);
    channelPerSocket.delete(socket);
};

function broadcast(socketForm: WebSocket, data: Buffer, channel: string): void {
    const clients = socketsPerChannels.get(channel) || new Set();

    clients.forEach(client => {
        if(client == socket){
            return;
        }

        client.send(data);
    });
}
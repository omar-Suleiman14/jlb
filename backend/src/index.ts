import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// Register GameRoom
gameServer.define("game_room", GameRoom);

// Register colyseus monitor
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`[GameServer] Listening on Port: ${port}`);

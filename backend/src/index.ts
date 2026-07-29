import http from "http";
import express from "express";
import cors from "cors";
import { Server, matchMaker } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { monitor } from "@colyseus/monitor";
import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  })
});

// Register GameRoom
gameServer.define("game_room", GameRoom);

// REST endpoint to find a room by its 4-digit code
app.get("/find-room/:code", async (req, res) => {
  const code = req.params.code.toUpperCase();
  try {
    const rooms = await matchMaker.query({ name: "game_room" });
    const found = rooms.find((r: any) => r.metadata?.roomCode === code && r.clients < r.maxClients);
    if (found) {
      res.json({ roomId: found.roomId });
    } else {
      res.status(404).json({ error: "Room not found or full" });
    }
  } catch (e) {
    console.error("find-room error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// Register colyseus monitor
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`[GameServer] Listening on Port: ${port}`);

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
  console.log(`[GET /find-room/${code}] Request received`);
  try {
    const rooms = await matchMaker.query({ name: "game_room" });
    console.log(`[GET /find-room/${code}] Active rooms:`, rooms.map(r => ({ id: r.roomId, metadata: r.metadata })));
    const found = rooms.find((r: any) => r.metadata?.roomCode === code && r.clients < r.maxClients);
    if (found) {
      console.log(`[GET /find-room/${code}] Found match:`, found.roomId);
      res.json({ roomId: found.roomId });
    } else {
      console.log(`[GET /find-room/${code}] No match found`);
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

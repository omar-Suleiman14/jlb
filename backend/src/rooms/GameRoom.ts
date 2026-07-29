import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/GameState";

export class GameRoom extends Room<{ state: GameState }> {
  maxClients = 2;

  onCreate(options: any) {
    this.setState(new GameState());
    
    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    // Assign first player as jim, second as mary
    player.character = this.state.players.size === 0 ? "jim" : "mary";
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, code?: number) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}

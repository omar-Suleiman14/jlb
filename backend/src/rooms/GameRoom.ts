import { Room, Client } from "colyseus";
import { GameState, Player, Heart } from "./schema/GameState";

export class GameRoom extends Room<GameState> {
  maxClients = 2;

  onCreate(options: any) {
    this.setMetadata({ roomCode: options.roomCode });
    this.setState(new GameState());
    
    this.onMessage("update", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.anim = data.anim;
        player.flipX = data.flipX;
      }
    });

    this.onMessage("collect_heart", (client, heartId: string) => {
      if (!this.state.hearts.has(heartId)) {
        const h = new Heart();
        h.collected = true;
        this.state.hearts.set(heartId, h);
      }
    });

    // Host (first player = jim) sends this; server broadcasts countdown to all
    this.onMessage("start_game", (client, _data) => {
      const player = this.state.players.get(client.sessionId);
      if (player?.character === "jim") { // only host can trigger
        this.broadcast("game_starting", { countdown: 3 });
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player();
    // Assign first player as jim, second as pam
    let hasJim = false;
    this.state.players.forEach((p) => {
      if (p.character === "jim") hasJim = true;
    });
    player.character = hasJim ? "pam" : "jim";
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented?: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}

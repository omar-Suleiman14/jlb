import { Scene } from 'phaser';
import { Player } from '../objects/Player';

export class MainGame extends Scene {
  room: any;
  playerEntities: Map<string, Player> = new Map();
  platforms!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('MainGame');
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Add some static platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'platform').setScale(8, 2).refreshBody(); // Ground
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(200, 300, 'platform');
    this.platforms.create(750, 220, 'platform');

    // Display the room code
    this.add.text(16, 16, `Room Code: ${this.room?.metadata?.roomCode || 'Local'}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    if (this.room) {
      // Spawn local player immediately — the server has already assigned us a character
      const mySessionId = this.room.sessionId;
      const mySchema = this.getPlayerSchema(mySessionId);
      const myCharacter: string = mySchema?.character ?? 'jim';
      const localPlayer = new Player(this, myCharacter === 'jim' ? 100 : 700, 450, myCharacter, true);
      this.physics.add.collider(localPlayer, this.platforms);
      this.playerEntities.set(mySessionId, localPlayer);

      // Listen for remote players joining / state changes
      this.room.onStateChange((state: any) => {
        if (!state?.players) return;
        this.syncFromState(state);
      });
    }
  }

  private getPlayerSchema(sessionId: string): any {
    const players = this.room?.state?.players;
    if (!players) return null;
    if (typeof players.get === 'function') return players.get(sessionId);
    return players[sessionId] ?? null;
  }

  private syncFromState(state: any) {
    const players = state.players;
    const isMap = typeof players.get === 'function';
    const playerIds: string[] = isMap ? Array.from(players.keys()) : Object.keys(players);

    playerIds.forEach((sessionId: string) => {
      const schema = isMap ? players.get(sessionId) : players[sessionId];
      const isLocal = sessionId === this.room.sessionId;

      let sprite = this.playerEntities.get(sessionId);
      if (!sprite) {
        // Spawn a remote player we haven't seen yet
        const spawnX = schema.character === 'jim' ? 100 : 700;
        sprite = new Player(this, spawnX, 450, schema.character, false);
        this.physics.add.collider(sprite, this.platforms);
        this.playerEntities.set(sessionId, sprite);
      }

      if (!isLocal) {
        sprite.updateRemote(schema.x, schema.y, schema.anim, schema.flipX);
      }
    });

    // Remove sprites for players who left
    this.playerEntities.forEach((sprite, sessionId) => {
      const exists = isMap ? players.has(sessionId) : players[sessionId] !== undefined;
      if (!exists) {
        sprite.destroy();
        this.playerEntities.delete(sessionId);
      }
    });
  }

  update() {
    if (!this.room?.sessionId) return;

    const localPlayer = this.playerEntities.get(this.room.sessionId);
    if (!localPlayer) return;

    localPlayer.update();

    // Broadcast position + animation to server
    this.room.send('update', {
      x: localPlayer.x,
      y: localPlayer.y,
      anim: localPlayer.anims.currentAnim?.key ?? '',
      flipX: localPlayer.flipX
    });
  }
}

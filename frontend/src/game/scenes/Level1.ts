import Phaser from 'phaser';
import { Scene } from 'phaser';
import { Player } from '../objects/Player';

const LEVEL_W = 1024; // Single screen width
const LEVEL_H = 600;

export class Level1 extends Scene {
  room: any;

  // Characters
  private jim!: Player;
  private mary!: Player;

  // World
  private floor!: Phaser.GameObjects.Rectangle;

  // State
  private levelComplete = false;

  constructor() {
    super('Level1');
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    this.levelComplete = false;

    // ── Camera / world bounds ────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H);
    this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);

    // ── Background ───────────────────────────────────────────────────────
    this.add.rectangle(LEVEL_W / 2, LEVEL_H / 2, LEVEL_W, LEVEL_H, 0x87ceeb).setScrollFactor(0.1);

    // ── Floor ────────────────────────────────────────────────────────────
    this.floor = this.add.rectangle(LEVEL_W / 2, LEVEL_H - 16, LEVEL_W, 32, 0x5d8a3c);
    this.physics.add.existing(this.floor, true);

    // ── Players ──────────────────────────────────────────────────────────────
    const mySessionId = this.room?.sessionId;
    const mySchema = this.getMySchema(mySessionId);
    const myCharacter: string = mySchema?.character ?? 'jim';

    // Jim starts left, Mary starts right.
    const jimIsLocal = myCharacter === 'jim';
    const maryIsLocal = myCharacter === 'mary';

    this.jim = new Player(this, 100, LEVEL_H - 100, 'jim', jimIsLocal);
    this.jim.setScrollFactor(1);

    this.mary = new Player(this, LEVEL_W - 100, LEVEL_H - 100, 'mary', maryIsLocal);
    this.mary.setScrollFactor(1);

    // Colliders: players ↔ platforms
    this.physics.add.collider(this.jim, this.floor);
    this.physics.add.collider(this.mary, this.floor);

    // ── Camera follows local player (each player sees from their own perspective)
    const localSprite = jimIsLocal ? this.jim : this.mary;
    this.cameras.main.startFollow(localSprite, true, 0.1, 0.1);

    // ── Control hint labels (show which character you are) ─────────────────────
    this.drawControlHints(myCharacter);

    // ── HUD (parallel scene) ─────────────────────────────────────────────────
    this.scene.launch('HUD', { room: this.room, levelKey: 'Level1', maxHearts: 3 });
    this.time.delayedCall(100, () => {
      const hudScene = this.scene.get('HUD') as any;
      if (hudScene?.setLevelTitle) {
        hudScene.setLevelTitle('Level 1: First Meeting');
      }
    });

    // ── Network sync ─────────────────────────────────────────────────────────
    if (this.room) {
      this.room.onStateChange((state: any) => {
        if (!state?.players) return;
        const players = state.players;
        const isMap = typeof players.get === 'function';

        const remoteIds = isMap ? Array.from(players.keys()) : Object.keys(players);
        remoteIds.forEach((sid: string) => {
          if (sid === this.room.sessionId) return;
          const schema = isMap ? players.get(sid) : players[sid];
          if (schema?.character === 'jim') {
            this.jim.updateRemote(schema.x, schema.y, schema.anim, schema.flipX);
          } else if (schema?.character === 'mary') {
            this.mary.updateRemote(schema.x, schema.y, schema.anim, schema.flipX);
          }
        });
      });
    }
  }

  private drawControlHints(myCharacter: string) {
    const style = { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 };
    const { width } = this.scale;

    // Show "You are Jim" or "You are Mary" badge
    const charColor = myCharacter === 'jim' ? '#3498db' : '#e91e8c';
    const charName = myCharacter === 'jim' ? 'Jim' : 'Mary';
    this.add.text(width / 2, 20, `You are ${charName}`, {
      ...style,
      fontSize: '20px',
      color: charColor,
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Arrow key hints
    this.add.text(16, 60, '← → Move', style).setScrollFactor(0);
    this.add.text(16, 82, '↑ Jump', style).setScrollFactor(0);
  }

  // ─── Check level win condition ───────────────────────────────────────────────
  private checkWin() {
    if (this.levelComplete) return;
    const dx = this.jim.x - this.mary.x;
    const dy = this.jim.y - this.mary.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 60) {
      this.levelComplete = true;
      this.scene.pause('Level1');
      this.scene.launch('LevelComplete', { room: this.room, nextLevel: 'GameMenu' });
    }
  }

  // ─── Colyseus helper ────────────────────────────────────────────────────────
  private getMySchema(sessionId: string): any {
    const players = this.room?.state?.players;
    if (!players) return null;
    if (typeof players.get === 'function') return players.get(sessionId);
    return players[sessionId] ?? null;
  }

  // ─── Game loop ───────────────────────────────────────────────────────────────
  update(_time: number, _delta: number) {
    if (this.levelComplete) return;

    // Update player movement
    this.jim.update();
    this.mary.update();

    // Check victory
    this.checkWin();

    // Broadcast local player
    if (this.room?.sessionId) {
      const mySchema = this.getMySchema(this.room.sessionId);
      const myChar = mySchema?.character;
      const localPlayer = myChar === 'mary' ? this.mary : this.jim;
      if (localPlayer) {
        this.room.send('update', {
          x: localPlayer.x,
          y: localPlayer.y,
          anim: localPlayer.anims.currentAnim?.key ?? '',
          flipX: localPlayer.flipX
        });
      }
    }
  }
}


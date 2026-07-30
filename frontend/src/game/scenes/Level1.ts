import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Enemy } from '../objects/Enemy';

// ─── Level 1 Layout ─────────────────────────────────────────────────────────
// Jim starts bottom-left, Mary starts bottom-right.
// They must navigate platforms, avoid enemies & spikes, and reach each other.
// WASD = Jim, Arrow Keys = Mary.
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_W = 1800; // wider than the screen for slight scrolling
const LEVEL_H = 600;

export class Level1 extends Scene {
  room: any;

  // Characters
  private jim!: Player;
  private mary!: Player;

  // World
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private spikes!: Phaser.Physics.Arcade.StaticGroup;
  private hearts!: Phaser.Physics.Arcade.StaticGroup;
  private enemies: Enemy[] = [];

  // State
  private jimHP = 3;
  private maryHP = 3;
  private levelComplete = false;
  private hurtCooldown = 0; // ms

  // HUD ref
  private hud: any;

  constructor() {
    super('Level1');
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    this.levelComplete = false;
    this.jimHP = 3;
    this.maryHP = 3;
    this.hurtCooldown = 0;
    this.enemies = [];

    // ── Camera / world bounds ────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H);
    this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);

    // ── Sky background ───────────────────────────────────────────────────────
    this.add.rectangle(LEVEL_W / 2, LEVEL_H / 2, LEVEL_W, LEVEL_H, 0x87ceeb).setScrollFactor(0.1);
    this.drawBackground();

    // ── Platforms ────────────────────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup();
    this.buildLevel();

    // ── Spikes ───────────────────────────────────────────────────────────────
    this.spikes = this.physics.add.staticGroup();
    this.placeSpikes();

    // ── Hearts (collectibles) ────────────────────────────────────────────────
    this.hearts = this.physics.add.staticGroup();
    this.placeHearts();

    // ── Enemies ──────────────────────────────────────────────────────────────
    this.spawnEnemies();

    // ── Players ──────────────────────────────────────────────────────────────
    const mySessionId = this.room?.sessionId;
    const mySchema = this.getMySchema(mySessionId);
    const myCharacter: string = mySchema?.character ?? 'jim';

    // Jim is always WASD-controlled. If local player is Jim, they control Jim.
    // Mary uses Arrow Keys. If local player is Mary, they control Mary.
    const jimIsLocal = myCharacter === 'jim';
    this.jim = new Player(this, 80, LEVEL_H - 80, 'jim', jimIsLocal);
    this.jim.setScrollFactor(1);

    const maryIsLocal = myCharacter === 'mary';
    this.mary = new Player(this, LEVEL_W - 80, LEVEL_H - 80, 'mary', maryIsLocal);
    this.mary.setScrollFactor(1);

    // Override WASD for Jim vs Arrow keys for Mary
    if (jimIsLocal) {
      this.jim['cursors'] = this.buildWASD();
    } else if (maryIsLocal) {
      this.mary['cursors'] = this.input.keyboard?.createCursorKeys();
    }

    // Colliders: players ↔ platforms
    this.physics.add.collider(this.jim, this.platforms);
    this.physics.add.collider(this.mary, this.platforms);

    // Colliders: players ↔ spikes (instant KO)
    this.physics.add.overlap(this.jim, this.spikes, () => this.hurtPlayer('jim', 99));
    this.physics.add.overlap(this.mary, this.spikes, () => this.hurtPlayer('mary', 99));

    // Colliders: players ↔ hearts
    this.physics.add.overlap(this.jim, this.hearts, (_jim, heart) => {
      (heart as Phaser.GameObjects.GameObject).destroy();
      this.jimHP = Math.min(3, this.jimHP + 1);
      this.updateHUD();
    });
    this.physics.add.overlap(this.mary, this.hearts, (_mary, heart) => {
      (heart as Phaser.GameObjects.GameObject).destroy();
      this.maryHP = Math.min(3, this.maryHP + 1);
      this.updateHUD();
    });

    // ── Camera follows local player ───────────────────────────────────────────
    if (jimIsLocal) {
      this.cameras.main.startFollow(this.jim, true, 0.1, 0.1);
    } else if (maryIsLocal) {
      this.cameras.main.startFollow(this.mary, true, 0.1, 0.1);
    } else {
      // Spectator — follow Jim
      this.cameras.main.startFollow(this.jim, true, 0.1, 0.1);
    }

    // ── Control hint labels ───────────────────────────────────────────────────
    this.drawControlHints();

    // ── HUD (parallel scene) ─────────────────────────────────────────────────
    this.scene.launch('HUD', { room: this.room, levelKey: 'Level1', maxHearts: 3 });
    this.hud = this.scene.get('HUD') as any;
    this.time.delayedCall(100, () => {
      if (this.hud?.setLevelTitle) {
        this.hud.setLevelTitle('Level 1: First Meeting');
      }
      this.updateHUD();
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

  // ─── Level Layout ───────────────────────────────────────────────────────────
  private buildLevel() {
    const tileW = 32;
    const tileH = 32;
    const groundY = LEVEL_H - tileH;

    // Helper to place a horizontal strip of tiles
    const row = (startX: number, endX: number, y: number, type: string = 'tile-grass') => {
      for (let x = startX; x <= endX; x += tileW) {
        this.platforms.create(x + tileW / 2, y + tileH / 2, type).refreshBody();
      }
      // Dirt below
      if (type === 'tile-grass') {
        for (let x = startX; x <= endX; x += tileW) {
          for (let dy = tileH; dy <= tileH * 2; dy += tileH) {
            this.platforms.create(x + tileW / 2, y + tileH / 2 + dy, 'tile-dirt').refreshBody();
          }
        }
      }
    };

    // Ground (full width)
    row(0, LEVEL_W - tileW, groundY - tileH);

    // Left section platforms (Jim's side)
    row(160, 320, groundY - tileH * 4);         // low platform
    row(100, 260, groundY - tileH * 8);          // mid platform

    // Center platforms (danger zone with gaps)
    row(500, 620, groundY - tileH * 5);
    row(700, 820, groundY - tileH * 3);
    row(900, 980, groundY - tileH * 6);

    // Right section platforms (Mary's side)
    row(LEVEL_W - 340, LEVEL_W - 200, groundY - tileH * 4);
    row(LEVEL_W - 300, LEVEL_W - 160, groundY - tileH * 8);

    // Middle "meeting" platform
    row(840, 960, groundY - tileH * 9);
  }

  private placeSpikes() {
    // Spike groups: dangerous gaps
    const spikePositions = [350, 360, 370, 380, 640, 650, 830, 840];
    const groundY = LEVEL_H - 32;
    spikePositions.forEach(x => {
      const s = this.spikes.create(x, groundY - 30, 'spike') as Phaser.Physics.Arcade.Image;
      s.refreshBody();
    });
  }

  private placeHearts() {
    const positions: [number, number][] = [
      [200, LEVEL_H - 200],
      [560, LEVEL_H - 250],
      [760, LEVEL_H - 180],
      [LEVEL_W - 260, LEVEL_H - 200],
      [LEVEL_W / 2 - 30, LEVEL_H - 380], // center top reward
    ];
    positions.forEach(([x, y]) => {
      const h = this.hearts.create(x, y, 'coin') as Phaser.Physics.Arcade.Image;
      h.refreshBody();
      // Gentle bob animation via tweens on the image
      this.tweens.add({ targets: h, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }

  private spawnEnemies() {
    const groundY = LEVEL_H - 70;
    const data: [number, number, number, number][] = [
      [400, groundY, 300, 490],    // left side patrol
      [700, groundY - 96, 500, 820],
      [1100, groundY, 1000, 1200], // right side patrol
    ];
    data.forEach(([x, y, l, r]) => {
      const e = new Enemy(this, x, y, l, r);
      this.enemies.push(e);
      this.physics.add.collider(e, this.platforms);

      // Player ↔ enemy: stomp from above = kill enemy; side hit = hurt player
      this.physics.add.overlap(this.jim, e, (jimObj) => {
        const jim = jimObj as Player;
        if (jim.body!.velocity.y > 0 && jim.y < e.y - 10) {
          e.stomp();
          jim.setVelocityY(-200); // bounce up
        } else {
          this.hurtPlayer('jim', 1);
        }
      });
      this.physics.add.overlap(this.mary, e, (maryObj) => {
        const mary = maryObj as Player;
        if (mary.body!.velocity.y > 0 && mary.y < e.y - 10) {
          e.stomp();
          mary.setVelocityY(-200);
        } else {
          this.hurtPlayer('mary', 1);
        }
      });
    });
  }

  private drawBackground() {
    // Clouds (slow scroll)
    const g = this.add.graphics().setScrollFactor(0.2);
    g.fillStyle(0xffffff, 0.85);
    [[200, 60], [500, 40], [850, 70], [1200, 50], [1500, 65]].forEach(([x, y]) => {
      g.fillEllipse(x, y, 120, 50);
      g.fillEllipse(x + 35, y - 12, 80, 40);
      g.fillEllipse(x - 30, y - 8, 70, 35);
    });

    // Rolling hills
    const hills = this.add.graphics().setScrollFactor(0.3);
    hills.fillStyle(0x5aad3d, 1);
    [[300, LEVEL_H - 60, 500, 200], [800, LEVEL_H - 40, 450, 180], [1300, LEVEL_H - 55, 480, 190]].forEach(([hx, hy, w, h]) => {
      hills.fillEllipse(hx, hy, w, h);
    });

    // Trees (mid scroll)
    const trees = this.add.graphics().setScrollFactor(0.5);
    [[100, 380], [280, 365], [650, 375], [960, 360], [1150, 378], [1450, 367], [1650, 372]].forEach(([tx, ty]) => {
      trees.fillStyle(0x8b4513, 1); trees.fillRect(tx - 5, ty, 10, 25);
      trees.fillStyle(0x2e7d32, 1); trees.fillEllipse(tx, ty - 8, 48, 40);
      trees.fillStyle(0x388e3c, 1); trees.fillEllipse(tx, ty - 20, 36, 32);
    });

    // House left (decorative, slow scroll)
    this.drawHouseAt(350, LEVEL_H - 120, 0.4, 0xf5e6c8, 0xe6b800);
    this.drawHouseAt(1300, LEVEL_H - 120, 0.5, 0xd2b48c, 0xa0522d);
  }

  private drawHouseAt(x: number, y: number, scrollFactor: number, wall: number, roof: number) {
    const g = this.add.graphics().setScrollFactor(scrollFactor);
    g.fillStyle(wall, 1); g.fillRect(x - 40, y - 45, 80, 55);
    g.fillStyle(roof, 1); g.fillTriangle(x - 50, y - 45, x + 50, y - 45, x, y - 90);
    g.fillStyle(0x8b4513, 1); g.fillRect(x - 10, y - 20, 20, 30);
    g.fillStyle(0x87ceeb, 1); g.fillRect(x - 32, y - 37, 18, 15);
  }

  private drawControlHints() {
    // Jim hints (WASD) — near left
    const style = { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 };
    const jimLabel = this.add.text(80, 60, 'Jim', { ...style, fontSize: '18px', color: '#3498db' }).setScrollFactor(0);
    this.add.text(68, 82, '[W]', style).setScrollFactor(0);
    this.add.text(44, 102, '[A]  [D]', style).setScrollFactor(0);

    // Mary hints (Arrows) — near right
    const { width } = this.scale;
    this.add.text(width - 110, 60, 'Mary', { ...style, fontSize: '18px', color: '#e91e8c' }).setScrollFactor(0);
    this.add.text(width - 88, 82, '[▲]', style).setScrollFactor(0);
    this.add.text(width - 112, 102, '[◄][▼][►]', style).setScrollFactor(0);
  }

  // ─── Hurt a player ──────────────────────────────────────────────────────────
  private hurtPlayer(who: 'jim' | 'mary', dmg: number) {
    if (this.levelComplete) return;
    if (this.hurtCooldown > 0) return;
    this.hurtCooldown = 1200; // 1.2s invincibility

    if (who === 'jim') {
      this.jimHP = Math.max(0, this.jimHP - dmg);
    } else {
      this.maryHP = Math.max(0, this.maryHP - dmg);
    }
    this.updateHUD();

    // Flash the player
    const target = who === 'jim' ? this.jim : this.mary;
    this.tweens.add({ targets: target, alpha: 0.2, duration: 100, yoyo: true, repeat: 5, onComplete: () => target.setAlpha(1) });

    if (this.jimHP <= 0 || this.maryHP <= 0) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.scene.pause('Level1');
    this.scene.launch('GameOver', { room: this.room, levelKey: 'Level1' });
  }

  private updateHUD() {
    const hudScene = this.scene.get('HUD') as any;
    if (hudScene?.setHearts) {
      const lowestHP = Math.min(this.jimHP, this.maryHP);
      hudScene.setHearts(lowestHP);
    }
  }

  // ─── Check level win condition ───────────────────────────────────────────────
  private checkWin() {
    if (this.levelComplete) return;
    const dist = Phaser.Math.Distance.Between(this.jim.x, this.jim.y, this.mary.x, this.mary.y);
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

  private buildWASD(): Phaser.Types.Input.Keyboard.CursorKeys {
    const kb = this.input.keyboard!;
    return {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      shift: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    } as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  // ─── Game loop ───────────────────────────────────────────────────────────────
  update(_time: number, delta: number) {
    if (this.levelComplete) return;

    // Tick cooldown
    if (this.hurtCooldown > 0) this.hurtCooldown -= delta;

    // Update player movement
    this.jim.update();
    this.mary.update();

    // Update enemies
    this.enemies.forEach(e => { if (!e.isDead()) e.update(); });

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

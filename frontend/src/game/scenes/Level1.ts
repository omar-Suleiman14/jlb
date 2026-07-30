
import { Scene } from 'phaser';
import { Player } from '../objects/Player';

let LEVEL_W = 1024; // Single screen width
let LEVEL_H = 600;

export class Level1 extends Scene {
  room: any;

  // Characters
  private jim!: Player;
  private pam!: Player;



  // State
  private levelComplete = false;
  private heartsGroup!: Phaser.Physics.Arcade.Group;
  private heartsMap: Map<string, Phaser.GameObjects.Image> = new Map();
  private collectedHeartsCount = 0;

  constructor() {
    super('Level1');
  }

  init(data: any) {
    this.room = data.room || this.registry.get('colyseus_room');
  }

  create() {
    this.levelComplete = false;
    this.collectedHeartsCount = 0;
    this.heartsMap.clear();

    // Load LDtk JSON
    const levelData = this.cache.json.get('levelData');
    const l0 = levelData.levels[0];
    LEVEL_W = l0.pxWid;
    LEVEL_H = l0.pxHei;

    // ── Camera / world bounds ────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H);
    this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H);

    // ── Background color ──────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor(l0.__bgColor || '#87ceeb');

    // ── Parse LDtk Layers ─────────────────────────────────────────────────
    const bgLayer = l0.layerInstances.find((l: any) => l.__identifier === 'Background');
    const midLayer = l0.layerInstances.find((l: any) => l.__identifier === 'Midground');
    const groundLayer = l0.layerInstances.find((l: any) => l.__identifier === 'Ground');
    const colLayer = l0.layerInstances.find((l: any) => l.__identifier === 'Collision');
    const entLayer = l0.layerInstances.find((l: any) => l.__identifier === 'Entities');

    // Draw tiles
    [bgLayer, midLayer, groundLayer].forEach(layer => {
      if (!layer) return;
      const isBg = layer.__identifier === 'Background';
      const prefix = isBg ? 'bg_tile_' : 'tile_';
      layer.gridTiles.forEach((tile: any) => {
         this.add.image(tile.px[0], tile.px[1], prefix + tile.t).setOrigin(0, 0);
      });
    });

    // ── Collisions ────────────────────────────────────────────────────────
    const collisions = this.physics.add.staticGroup();
    if (colLayer) {
      const csv = colLayer.intGridCsv;
      const w = colLayer.__cWid;
      const size = colLayer.__gridSize;
      for (let i = 0; i < csv.length; i++) {
        if (csv[i] !== 0) {
          const cx = (i % w) * size + size / 2;
          const cy = Math.floor(i / w) * size + size / 2;
          const rect = this.add.rectangle(cx, cy, size, size, 0xff0000, 0);
          this.physics.add.existing(rect, true); // true = static body
          collisions.add(rect);
        }
      }
    }

    // ── Players ──────────────────────────────────────────────────────────────
    const mySessionId = this.room?.sessionId;
    const mySchema = this.getMySchema(mySessionId);
    const myCharacter: string = (mySchema?.character && mySchema.character !== '') ? mySchema.character : 'jim';

    const jimIsLocal = myCharacter === 'jim';
    const pamIsLocal = myCharacter === 'pam';

    let jimX = 100, jimY = LEVEL_H - 100;
    let pamX = LEVEL_W - 100, pamY = LEVEL_H - 100;
    if (entLayer) {
      const jEnt = entLayer.entityInstances.find((e: any) => e.__identifier === 'Jim');
      if (jEnt) { jimX = jEnt.px[0]; jimY = jEnt.px[1]; }
      const pEnt = entLayer.entityInstances.find((e: any) => e.__identifier === 'Pam');
      if (pEnt) { pamX = pEnt.px[0]; pamY = pEnt.px[1]; }
    }

    this.jim = new Player(this, jimX, jimY, 'jim', jimIsLocal);
    this.pam = new Player(this, pamX, pamY, 'pam', pamIsLocal);
    this.pam.setFlipX(true); // Pam starts facing left towards Jim

    // Colliders: players ↔ platforms
    this.physics.add.collider(this.jim, collisions);
    this.physics.add.collider(this.pam, collisions);
    
    // Collider: player ↔ player (so they can bump and get close)
    this.physics.add.collider(this.jim, this.pam);

    // ── Hearts ──────────────────────────────────────────────────────────────
    this.heartsGroup = this.physics.add.group({ allowGravity: false });
    if (entLayer) {
      entLayer.entityInstances.forEach((e: any) => {
        if (e.__identifier === 'Heart') {
          const hId = `${e.px[0]}_${e.px[1]}`;
          const h = this.add.image(e.px[0], e.px[1], 'tile_44').setOrigin(0.5).setScale(2);
          this.physics.add.existing(h, true);
          this.heartsGroup.add(h);
          this.heartsMap.set(hId, h);
        }
      });
    }

    const collectHeart = (_player: any, heart: any) => {
      // Find the ID by matching the object in the map
      for (const [hId, hObj] of this.heartsMap.entries()) {
        if (hObj === heart) {
          if (this.room) this.room.send('collect_heart', hId);
          break;
        }
      }
    };
    this.physics.add.overlap(this.jim, this.heartsGroup, collectHeart, undefined, this);
    this.physics.add.overlap(this.pam, this.heartsGroup, collectHeart, undefined, this);

    // ── Camera follows local player
    const localSprite = jimIsLocal ? this.jim : this.pam;
    this.cameras.main.startFollow(localSprite, true, 0.1, 0.1);

    // ── Control hint labels
    this.drawControlHints(myCharacter);

    // ── HUD
    this.scene.launch('HUD', { room: this.room, levelKey: 'Level1', maxHearts: 3 });
    this.time.delayedCall(100, () => {
      const hudScene = this.scene.get('HUD') as any;
      if (hudScene?.setLevelTitle) {
        hudScene.setLevelTitle('Level 1: First Meeting');
      }
    });

    // ── Network sync (delay 1s so remote player shows at their real position)
    if (this.room) {
      this.time.delayedCall(1000, () => {
        this.room.onStateChange((state: any) => {
          if (!state?.players) return;
          const players = state.players;
          const isMap = typeof players.get === 'function';
          const remoteIds = isMap ? Array.from(players.keys()) : Object.keys(players);

          remoteIds.forEach((sid: any) => {
            if (sid === this.room.sessionId) return;
            const schema = isMap ? players.get(sid) : players[sid];
            if (schema?.character === 'jim') {
              this.jim.updateRemote(schema.x, schema.y, schema.anim, schema.flipX);
            } else if (schema?.character === 'pam') {
              this.pam.updateRemote(schema.x, schema.y, schema.anim, schema.flipX);
            }
          });

          // Sync Hearts
          if (state.hearts) {
            const heartsMap = typeof state.hearts.get === 'function';
            const heartIds = heartsMap ? Array.from(state.hearts.keys()) : Object.keys(state.hearts);
            let newCollectedCount = 0;
            heartIds.forEach((hId: any) => {
              const hSchema = heartsMap ? state.hearts.get(hId) : state.hearts[hId];
              if (hSchema?.collected) {
                newCollectedCount++;
                const localHeart = this.heartsMap.get(hId);
                if (localHeart) {
                  localHeart.destroy();
                  this.heartsMap.delete(hId);
                }
              }
            });

            if (newCollectedCount !== this.collectedHeartsCount) {
              this.collectedHeartsCount = newCollectedCount;
              const hud = this.scene.get('HUD') as any;
              if (hud?.setHearts) hud.setHearts(this.collectedHeartsCount);
            }
          }
        });
      }); // end delayedCall
    }
  }

  private drawControlHints(myCharacter: string) {
    const style = { fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 };
    const { width } = this.scale;

    // Show "You are Jim" or "You are Pam" badge
    const charColor = myCharacter === 'jim' ? '#3498db' : '#e91e8c';
    const charName = myCharacter === 'jim' ? 'Jim' : 'Pam';
    this.add.text(width / 2, 20, `You are ${charName}`, {
      ...style,
      fontSize: '20px',
      color: charColor,
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Arrow key hints
    this.add.text(16, 60, '← → Move', style).setScrollFactor(0);
    this.add.text(16, 82, '↑ Jump', style).setScrollFactor(0);
  }

  private checkWin() {
    if (this.levelComplete) return;
    const dx = this.jim.x - this.pam.x;
    const dy = this.jim.y - this.pam.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Only win if close AND all 3 hearts are collected
    if (dist < 60 && this.collectedHeartsCount >= 3) {
      this.levelComplete = true;
      
      this.jim.play('jim_kiss', true);
      this.pam.play('pam_kiss', true);
      this.jim.setVelocity(0, 0);
      this.pam.setVelocity(0, 0);

      // Spawn a heart between them to cover the gap
      const kissHeart = this.add.image((this.jim.x + this.pam.x) / 2, this.jim.y - 10, 'tile_44').setScale(0);
      this.tweens.add({
          targets: kissHeart,
          scale: 1.5,
          y: kissHeart.y - 30,
          duration: 1000,
          ease: 'Back.easeOut'
      });
      
      this.time.delayedCall(2000, () => {
        this.scene.pause('Level1');
        this.scene.launch('LevelComplete', { room: this.room, nextLevel: 'GameMenu' });
      });
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
    this.pam.update();

    // Check victory
    this.checkWin();

    // Broadcast local player
    if (this.room?.sessionId) {
      const mySchema = this.getMySchema(this.room.sessionId);
      const myChar = mySchema?.character;
      const localPlayer = myChar === 'pam' ? this.pam : this.jim;
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


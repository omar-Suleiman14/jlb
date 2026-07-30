import { Scene } from 'phaser';

export class GameMenu extends Scene {
  room: any;
  private isHost = false;
  private countdownActive = false;

  constructor() {
    super('GameMenu');
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    const { width, height } = this.scale;

    // ── Simple background ──────────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#2c3e50');

    // ── LOGO ────────────────────────────────────────────────────────────────
    this.add.text(width / 2, 120, 'Jim Loves\n   Mary', {
      fontFamily: 'Georgia, serif',
      fontSize: '56px',
      fontStyle: 'bold italic',
      color: '#f5c518',
      align: 'center',
    }).setOrigin(0.5);

    // ── Determine if this player is the host (jim = first joiner) ────────────
    this.detectHost();

    // ── Room code display ───────────────────────────────────────────────────
    if (this.room?.metadata?.roomCode) {
      this.add.text(16, height - 30, `Room: ${this.room.metadata.roomCode}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      });
    }

    // ── Listen for server countdown broadcast ────────────────────────────────
    if (this.room) {
      this.room.onMessage('game_starting', () => {
        if (!this.countdownActive) {
          this.countdownActive = true;
          this.startCountdown();
        }
      });
    }
  }

  private detectHost() {
    const { width } = this.scale;

    let playBtn: Phaser.GameObjects.Container | null = null;
    let waitText: Phaser.GameObjects.Text | null = null;
    let badgeText: Phaser.GameObjects.Text | null = null;

    // Credits visible to both (always shown immediately)
    this.createWoodenButton(width / 2, 370, 'Credits', 220, () => this.showCredits());

    const applyRole = (myChar: string) => {
      this.isHost = myChar === 'jim';

      playBtn?.destroy();
      waitText?.destroy();
      badgeText?.destroy();

      if (this.isHost) {
        this.createWoodenButton(width / 2, 300, 'Play Game', 220, () => {
          if (this.countdownActive) return;
          this.room.send('start_game', {});
        });
      } else {
        const wt = this.add.text(width / 2, 300, 'Waiting for host...', {
          fontFamily: 'Georgia, serif',
          fontSize: '22px',
          color: '#ffffff',
        }).setOrigin(0.5);
        waitText = wt;
      }

      const color = this.isHost ? '#f5c518' : '#aaaaaa';
      const label = this.isHost ? '👑 Host' : '🎮 Player 2';
      badgeText = this.add.text(width - 10, this.scale.height - 30, label, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color,
      }).setOrigin(1, 1);
    };

    const tryNow = () => {
      const players = this.room?.state?.players;
      if (!players) return false;
      const mySessionId = this.room?.sessionId;
      const schema = typeof players.get === 'function' ? players.get(mySessionId) : players[mySessionId];
      if (!schema) return false;
      applyRole(schema.character ?? 'spectator');
      return true;
    };

    if (!tryNow()) {
      if (!this.room) {
        applyRole('jim');
        return;
      }

      const wt = this.add.text(width / 2, 300, 'Connecting...', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#cccccc',
      }).setOrigin(0.5);
      waitText = wt;

      const unsub = this.room.onStateChange((state: any) => {
        if (!state?.players) return;
        const mySessionId = this.room?.sessionId;
        const isMap = typeof state.players.get === 'function';
        const schema = isMap ? state.players.get(mySessionId) : state.players[mySessionId];
        if (schema) {
          applyRole(schema.character ?? 'spectator');
          unsub();
        }
      });
    }
  }

  private startCountdown() {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);

    const countText = this.add.text(width / 2, height / 2, '3', {
      fontFamily: 'Georgia, serif',
      fontSize: '140px',
      fontStyle: 'bold',
      color: '#f5c518',
    }).setOrigin(0.5);

    const label = this.add.text(width / 2, height / 2 - 120, 'Get Ready!', {
      fontFamily: 'Georgia, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    let count = 3;
    const tick = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--;
        if (count <= 0) {
          tick.remove();
          overlay.destroy();
          countText.destroy();
          label.destroy();
          this.scene.start('Level1', { room: this.room, level: 1 });
        } else {
          countText.setText(String(count));
          this.tweens.add({ targets: countText, scaleX: 1.3, scaleY: 1.3, duration: 100, yoyo: true });
        }
      }
    });

    this.tweens.add({ targets: countText, scaleX: 1.2, scaleY: 1.2, duration: 300, yoyo: true });
  }

  private createWoodenButton(x: number, y: number, label: string, bw: number, callback: () => void) {
    const bh = 48;
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(x - bw / 2, y - bh / 2, bw, bh);

    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, bw, bh).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { bg.setAlpha(0.8); text.setScale(1.05); });
    zone.on('pointerout', () => { bg.setAlpha(1); text.setScale(1); });
    zone.on('pointerup', callback);
  }

  private showCredits() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setInteractive();
    this.add.rectangle(width / 2, height / 2, 420, 260, 0x2c3e50, 1);
    this.add.text(width / 2, height / 2 - 90, 'Credits', {
      fontFamily: 'Arial', fontSize: '32px', fontStyle: 'bold', color: '#f5c518'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, 'Jim Loves Mary\n\nCreated with ❤️\nPowered by Phaser & Colyseus', {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5);
    const closeBtn = this.add.text(width / 2, height / 2 + 100, '[ Close ]', {
      fontFamily: 'Arial', fontSize: '22px', color: '#f5c518'
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    closeBtn.on('pointerup', () => { this.scene.restart({ room: this.room }); });
    overlay.on('pointerup', () => { this.scene.restart({ room: this.room }); });
  }
}

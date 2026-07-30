import Phaser from 'phaser';
import { Scene } from 'phaser';

export class GameMenu extends Scene {
  room: any;
  private isHost = false;
  private countdownActive = false;

  constructor() {
    super('GameMenu');
  }

  init(data: any) {
    this.room = data.room || this.registry.get('colyseus_room');
  }

  create() {
    const { width, height } = this.scale;

    // ── Gradient background ─────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e, 1);
    bg.fillRect(0, 0, width, height);

    // ── Floating particle dots ─────────────────────────────────────────────
    for (let i = 0; i < 30; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.04, 0.12));
      dot.fillCircle(0, 0, Phaser.Math.Between(1, 3));
      dot.x = Phaser.Math.Between(0, width);
      dot.y = Phaser.Math.Between(0, height);
      this.tweens.add({
        targets: dot,
        y: dot.y - Phaser.Math.Between(60, 180),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 9000),
        delay: Phaser.Math.Between(0, 5000),
        repeat: -1,
        onRepeat: () => {
          dot.x = Phaser.Math.Between(0, width);
          dot.y = height + 10;
          dot.setAlpha(Phaser.Math.FloatBetween(0.04, 0.12));
        }
      });
    }

    // ── Glowing heart accent ──────────────────────────────────────────────
    const glow = this.add.graphics();
    glow.fillStyle(0xe91e8c, 0.08);
    glow.fillCircle(width / 2, height / 2 - 60, 220);
    this.tweens.add({ targets: glow, alpha: 0.2, duration: 2000, yoyo: true, repeat: -1 });

    // ── Title ──────────────────────────────────────────────────────────────
    const titleSub = this.add.text(width / 2, height / 2 - 210, 'A love story', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '16px',
      fontStyle: 'italic',
      color: '#ff69b4',
    }).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(width / 2, height / 2 - 175, '💕 Jim Loves Pam', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '44px',
      fontStyle: 'bold italic',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [titleSub, title], alpha: 1, duration: 1200, ease: 'Sine.easeOut' });

    // ── Glass card panel ─────────────────────────────────────────────────
    const cardX = width / 2 - 170;
    const cardY = height / 2 - 115;
    const cardW = 340;
    const cardH = 230;

    const card = this.add.graphics();
    card.fillStyle(0xffffff, 0.07);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 24);
    card.lineStyle(1, 0xffffff, 0.18);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 24);
    card.setAlpha(0);
    this.tweens.add({ targets: card, alpha: 1, duration: 900, delay: 300, ease: 'Sine.easeOut' });

    // ── Status text (connecting / waiting) ────────────────────────────────
    const statusText = this.add.text(width / 2, height / 2 - 75, 'Connecting...', {
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff80',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: statusText, alpha: 1, duration: 900, delay: 400 });

    // ── Room code pill ────────────────────────────────────────────────────
    if (this.room?.metadata?.roomCode) {
      const pill = this.add.graphics();
      pill.fillStyle(0xffffff, 0.1);
      pill.fillRoundedRect(width / 2 - 80, height / 2 + 70, 160, 32, 16);
      this.add.text(width / 2, height / 2 + 86, `Room: ${this.room.metadata.roomCode}`, {
        fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
        fontSize: '13px',
        color: '#ffffffcc',
      }).setOrigin(0.5);
    }

    // ── Credits button ─────────────────────────────────────────────────────
    const creditsBtn = this.createAppleButton(width / 2, height / 2 + 125, 'Credits', false);
    creditsBtn.zone.on('pointerup', () => this.showCredits());

    // ── Listen for server countdown ────────────────────────────────────────
    if (this.room) {
      this.room.onMessage('game_starting', () => {
        if (!this.countdownActive) {
          this.countdownActive = true;
          this.startCountdown();
        }
      });
    }

    // ── Role detection ─────────────────────────────────────────────────────
    let playBtn: any = null;
    let badgeEl: any = null;

    const applyRole = (myChar: string) => {
      console.log('[GameMenu] applyRole called with:', myChar, 'sessionId:', this.room?.sessionId);
      this.isHost = myChar === 'jim';

      playBtn?.destroy();
      badgeEl?.destroy();

      statusText.setVisible(false);

      if (this.isHost) {
        const charLabel = this.add.text(width / 2, height / 2 - 72, '👑 You are Jim', {
          fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
          fontSize: '14px',
          color: '#f5c518cc',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: charLabel, alpha: 1, duration: 400 });
        badgeEl = charLabel;

        const waitingOther = this.add.text(width / 2, height / 2 - 45, 'Waiting for Player 2...', {
          fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
          fontSize: '18px',
          color: '#ffffffaa',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: waitingOther, alpha: 1, duration: 600, delay: 200 });

        // Check if player 2 is already in room
        const checkP2 = () => {
          const players = this.room?.state?.players;
          if (!players) return;
          let count = 0;
          if (typeof players.forEach === 'function') players.forEach(() => count++);
          else count = Object.keys(players).length;
          if (count >= 2) {
            waitingOther.destroy();
            showPlayButton();
          }
        };

        const showPlayButton = () => {
          const btn = this.createAppleButton(width / 2, height / 2 + 20, '▶  Play Game', true);
          btn.zone.on('pointerup', () => {
            if (this.countdownActive) return;
            this.room.send('start_game', {});
          });
          playBtn = btn.container;
        };

        checkP2();
        this.room?.onStateChange(() => checkP2());

      } else {
        const charLabel = this.add.text(width / 2, height / 2 - 72, '🎮 You are Pam', {
          fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
          fontSize: '14px',
          color: '#ff69b4cc',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: charLabel, alpha: 1, duration: 400 });
        badgeEl = charLabel;

        const waitText = this.add.text(width / 2, height / 2 - 20, 'Waiting for host\nto start the game...', {
          fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
          fontSize: '18px',
          color: '#ffffffaa',
          align: 'center',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: waitText, alpha: 1, duration: 600, delay: 200 });

        // Pulsing dots
        const dotsText = this.add.text(width / 2, height / 2 + 35, '● ● ●', {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ff69b4',
        }).setOrigin(0.5);
        this.tweens.add({ targets: dotsText, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });
        playBtn = { destroy: () => { waitText.destroy(); dotsText.destroy(); } };
      }
    };

    const tryNow = () => {
      const players = this.room?.state?.players;
      if (!players) return false;
      const mySessionId = this.room?.sessionId;
      const schema = typeof players.get === 'function' ? players.get(mySessionId) : players[mySessionId];
      if (!schema || !schema.character) return false;
      applyRole(schema.character);
      return true;
    };

    if (!tryNow()) {
      if (!this.room) {
        applyRole('jim');
        return;
      }
      const unsub = this.room.onStateChange((state: any) => {
        if (!state?.players) return;
        const mySessionId = this.room?.sessionId;
        const isMap = typeof state.players.get === 'function';
        const schema = isMap ? state.players.get(mySessionId) : state.players[mySessionId];
        if (schema && schema.character) {
          applyRole(schema.character);
          unsub();
        }
      });
    }
  }

  private createAppleButton(x: number, y: number, label: string, primary: boolean) {
    const bw = 220, bh = 50;
    const bg = this.add.graphics();
    if (primary) {
      bg.fillStyle(0xe91e8c, 1);
    } else {
      bg.fillStyle(0xffffff, 0.1);
      bg.lineStyle(1, 0xffffff, 0.25);
      bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, bh / 2);
    }
    bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, bh / 2);

    const txt = this.add.text(x, y, label, {
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, bw, bh).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { bg.setAlpha(0.8); txt.setScale(1.03); });
    zone.on('pointerout',  () => { bg.setAlpha(1);   txt.setScale(1); });

    const container = this.add.container(0, 0, [bg, txt]);

    return { zone, container };
  }

  private startCountdown() {
    const { width, height } = this.scale;

    // Full blur overlay with darkened bg
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Glassmorphism card
    const card = this.add.graphics();
    card.fillStyle(0xffffff, 0.08);
    card.fillRoundedRect(width / 2 - 150, height / 2 - 140, 300, 280, 28);
    card.lineStyle(1, 0xffffff, 0.2);
    card.strokeRoundedRect(width / 2 - 150, height / 2 - 140, 300, 280, 28);

    const label = this.add.text(width / 2, height / 2 - 90, 'Get Ready!', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: label, alpha: 1, duration: 400 });

    const countText = this.add.text(width / 2, height / 2 + 20, '3', {
      fontFamily: 'Georgia, serif',
      fontSize: '120px',
      fontStyle: 'bold',
      color: '#e91e8c',
    }).setOrigin(0.5).setScale(0.5);

    this.tweens.add({ targets: countText, scale: 1, duration: 400, ease: 'Back.easeOut' });

    let count = 3;
    const tick = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--;
        if (count <= 0) {
          tick.remove();
          this.scene.start('Level1', { room: this.room, level: 1 });
        } else {
          countText.setText(String(count));
          countText.setScale(0.4);
          this.tweens.add({ targets: countText, scale: 1, duration: 400, ease: 'Back.easeOut' });
        }
      }
    });

    // Keep overlay reference to avoid GC
    void overlay;
    void card;
  }

  private showCredits() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setInteractive();

    const card = this.add.graphics();
    card.fillStyle(0x0a0a1a, 0.98);
    card.fillRoundedRect(width / 2 - 200, height / 2 - 130, 400, 260, 24);
    card.lineStyle(1, 0xffffff, 0.15);
    card.strokeRoundedRect(width / 2 - 200, height / 2 - 130, 400, 260, 24);

    this.add.text(width / 2, height / 2 - 88, 'Credits', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, 'Jim Loves Pam\n\nCreated with ❤️\nPowered by Phaser & Colyseus', {
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffffaa',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    const closeBtn = this.add.text(width / 2, height / 2 + 100, '✕  Close', {
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      color: '#e91e8c',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    const closeAll = () => {
      overlay.destroy();
      card.destroy();
      closeBtn.destroy();
    };
    closeBtn.on('pointerup', closeAll);
    overlay.on('pointerup', closeAll);
  }
}

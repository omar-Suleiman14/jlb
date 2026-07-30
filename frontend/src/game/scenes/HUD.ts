import { Scene } from 'phaser';

// HUD runs as a parallel scene overlaid on top of Level1
export class HUD extends Scene {
  private heartImages: Phaser.GameObjects.Image[] = [];
  private maxHearts = 3;
  private levelText!: Phaser.GameObjects.Text;
  private pauseBtn!: Phaser.GameObjects.Text;
  private retryBtn!: Phaser.GameObjects.Text;
  private menuBtn!: Phaser.GameObjects.Text;
  private room: any;
  private levelKey: string = 'Level1';

  constructor() {
    super({ key: 'HUD', active: false });
  }

  init(data: any) {
    this.room = data.room;
    this.levelKey = data.levelKey ?? 'Level1';
    this.maxHearts = data.maxHearts ?? 3;
  }

  create() {
    const { width } = this.scale;

    // ── Hearts (top-left) ──────────────────────────────────────────────────
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x8b4513, 0.7);
    panelBg.fillRoundedRect(8, 8, this.maxHearts * 38 + 12, 44, 10);

    for (let i = 0; i < this.maxHearts; i++) {
      const img = this.add.image(26 + i * 38, 30, 'heart-full').setScale(0.9);
      this.heartImages.push(img);
    }

    // ── Level title (center) ───────────────────────────────────────────────
    this.levelText = this.add.text(width / 2, 28, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f5c518',
      stroke: '#5a3000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // ── Top-right buttons ──────────────────────────────────────────────────
    this.menuBtn = this.createIconBtn(width - 150, 30, '☰', 'Pause', () => {
      this.scene.pause(this.levelKey);
      this.scene.launch('PauseMenu', { room: this.room, levelKey: this.levelKey });
    });
    this.retryBtn = this.createIconBtn(width - 105, 30, '↩', 'Retry', () => {
      this.scene.stop('HUD');
      this.scene.stop(this.levelKey);
      this.scene.start(this.levelKey, { room: this.room });
    });
    this.createIconBtn(width - 60, 30, '🔊', 'Sound', () => {});
    this.createIconBtn(width - 15, 30, '🎵', 'Music', () => {});
  }

  setHearts(current: number) {
    this.heartImages.forEach((img, i) => {
      img.setTexture(i < current ? 'heart-full' : 'heart-empty');
    });
  }

  setLevelTitle(title: string) {
    this.levelText.setText(title);
    // Show then fade out after 3 seconds
    this.levelText.setAlpha(1);
    this.tweens.add({
      targets: this.levelText,
      alpha: 0,
      delay: 3000,
      duration: 1000
    });
  }

  private createIconBtn(x: number, y: number, icon: string, _label: string, cb: () => void) {
    const bg = this.add.graphics();
    bg.fillStyle(0xc8832a, 0.9);
    bg.fillCircle(x, y, 20);
    bg.lineStyle(2, 0x8b4513, 1);
    bg.strokeCircle(x, y, 20);
    const txt = this.add.text(x, y + 2, icon, { fontSize: '16px' }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 40, 40).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => bg.setAlpha(0.6));
    zone.on('pointerout', () => bg.setAlpha(1));
    zone.on('pointerup', cb);
    return txt;
  }
}

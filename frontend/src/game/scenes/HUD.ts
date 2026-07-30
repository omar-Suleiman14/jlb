import { Scene } from 'phaser';

// HUD runs as a parallel scene overlaid on top of Level1
export class HUD extends Scene {
  private heartIcons: Phaser.GameObjects.Image[] = [];
  private maxHearts = 3;
  private levelText!: Phaser.GameObjects.Text;



  constructor() {
    super({ key: 'HUD', active: false });
  }
  init(data: any) {
    this.maxHearts = data.maxHearts ?? 3;
  }

  create() {
    const { width, height } = this.scale;

    // ── Hearts (top-left) ──────────────────────────────────────────────────
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x8b4513, 0.7);
    panelBg.fillRoundedRect(8, 8, this.maxHearts * 38 + 12, 44, 10);

    for (let i = 0; i < this.maxHearts; i++) {
      const img = this.add.image(26 + i * 38, 30, 'tile_44').setScale(2).setOrigin(0.5);
      img.setScrollFactor(0);
      img.setAlpha(0.3); // Start empty
      this.heartIcons.push(img);
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

    // ── Mobile Controls ────────────────────────────────────────────────────
    const leftBtn = this.add.circle(60, height - 60, 40, 0xffffff, 0.3).setInteractive();
    this.add.text(60, height - 60, '◀', { fontSize: '32px' }).setOrigin(0.5);
    
    const rightBtn = this.add.circle(160, height - 60, 40, 0xffffff, 0.3).setInteractive();
    this.add.text(160, height - 60, '▶', { fontSize: '32px' }).setOrigin(0.5);

    const jumpBtn = this.add.circle(width - 80, height - 60, 40, 0xffffff, 0.3).setInteractive();
    this.add.text(width - 80, height - 60, '▲', { fontSize: '32px' }).setOrigin(0.5);

    const duckBtn = this.add.circle(width - 180, height - 60, 40, 0xffffff, 0.3).setInteractive();
    this.add.text(width - 180, height - 60, '▼', { fontSize: '32px' }).setOrigin(0.5);

    const setInput = (key: string, isDown: boolean) => this.registry.set(`input_${key}`, isDown);

    leftBtn.on('pointerdown', () => setInput('left', true));
    leftBtn.on('pointerup', () => setInput('left', false));
    leftBtn.on('pointerout', () => setInput('left', false));

    rightBtn.on('pointerdown', () => setInput('right', true));
    rightBtn.on('pointerup', () => setInput('right', false));
    rightBtn.on('pointerout', () => setInput('right', false));

    jumpBtn.on('pointerdown', () => setInput('jump', true));
    jumpBtn.on('pointerup', () => setInput('jump', false));
    jumpBtn.on('pointerout', () => setInput('jump', false));

    duckBtn.on('pointerdown', () => setInput('down', true));
    duckBtn.on('pointerup', () => setInput('down', false));
    duckBtn.on('pointerout', () => setInput('down', false));
  }

  setHearts(current: number) {
    this.heartIcons.forEach((img, i) => {
      img.setAlpha(i < current ? 1 : 0.3);
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

}

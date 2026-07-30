import { Scene } from 'phaser';

export class LevelComplete extends Scene {
  private room: any;
  private nextLevel: string = 'Level1';

  constructor() {
    super({ key: 'LevelComplete', active: false });
  }

  init(data: any) {
    this.room = data.room;
    this.nextLevel = data.nextLevel ?? 'GameMenu';
  }

  create() {
    const { width, height } = this.scale;

    // Overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55).setInteractive();

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x3a2010, 1);
    panel.fillRoundedRect(width / 2 - 190, height / 2 - 150, 380, 300, 18);
    panel.lineStyle(4, 0xf5c518, 1);
    panel.strokeRoundedRect(width / 2 - 190, height / 2 - 150, 380, 300, 18);

    // Animated hearts
    for (let i = 0; i < 5; i++) {
      const heart = this.add.text(
        Phaser.Math.Between(width / 2 - 140, width / 2 + 140),
        height / 2 - 200,
        '❤️',
        { fontSize: '24px' }
      );
      this.tweens.add({
        targets: heart,
        y: heart.y - Phaser.Math.Between(40, 100),
        alpha: 0,
        duration: Phaser.Math.Between(1000, 2000),
        delay: Phaser.Math.Between(0, 500),
        repeat: -1
      });
    }

    this.add.text(width / 2, height / 2 - 105, '❤️ Level Clear!', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f5c518',
      stroke: '#5a3000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 55, 'Jim and Mary are closer!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.createBtn(width / 2, height / 2 + 20, 'Next Level', 0x4caf50, () => {
      this.scene.stop('LevelComplete');
      this.scene.stop('HUD');
      this.scene.start(this.nextLevel, { room: this.room });
    });

    this.createBtn(width / 2, height / 2 + 85, 'Main Menu', 0xc8832a, () => {
      this.scene.stop('LevelComplete');
      this.scene.stop('HUD');
      this.scene.start('GameMenu', { room: this.room });
    });
  }

  private createBtn(x: number, y: number, label: string, color: number, cb: () => void) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - 120, y - 22, 240, 44, 10);

    const txt = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 3
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 240, 44).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { bg.setAlpha(0.75); txt.setScale(1.05); });
    zone.on('pointerout', () => { bg.setAlpha(1); txt.setScale(1); });
    zone.on('pointerup', cb);
  }
}

import { Scene } from 'phaser';

export class GameOver extends Scene {
  private room: any;
  private levelKey: string = 'Level1';

  constructor() {
    super({ key: 'GameOver', active: false });
  }

  init(data: any) {
    this.room = data.room;
    this.levelKey = data.levelKey ?? 'Level1';
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setInteractive();

    const panel = this.add.graphics();
    panel.fillStyle(0x1a0a00, 1);
    panel.fillRoundedRect(width / 2 - 180, height / 2 - 140, 360, 280, 18);
    panel.lineStyle(4, 0xe74c3c, 1);
    panel.strokeRoundedRect(width / 2 - 180, height / 2 - 140, 360, 280, 18);

    this.add.text(width / 2, height / 2 - 95, '💔 Game Over', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#5a0000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 45, 'Jim and Mary need your help!', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.createBtn(width / 2, height / 2 + 20, 'Try Again', 0xe74c3c, () => {
      this.scene.stop('GameOver');
      this.scene.stop('HUD');
      this.scene.start(this.levelKey, { room: this.room });
    });

    this.createBtn(width / 2, height / 2 + 80, 'Main Menu', 0xc8832a, () => {
      this.scene.stop('GameOver');
      this.scene.stop('HUD');
      this.scene.start('GameMenu', { room: this.room });
    });
  }

  private createBtn(x: number, y: number, label: string, color: number, cb: () => void) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - 110, y - 22, 220, 44, 10);

    const txt = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 3
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 220, 44).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { bg.setAlpha(0.75); txt.setScale(1.05); });
    zone.on('pointerout', () => { bg.setAlpha(1); txt.setScale(1); });
    zone.on('pointerup', cb);
  }
}

import { Scene } from 'phaser';

export class PauseMenu extends Scene {
  private room: any;
  private levelKey: string = 'Level1';

  constructor() {
    super({ key: 'PauseMenu', active: false });
  }

  init(data: any) {
    this.room = data.room;
    this.levelKey = data.levelKey ?? 'Level1';
  }

  create() {
    const { width, height } = this.scale;

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setInteractive();

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x3a2010, 1);
    panel.fillRoundedRect(width / 2 - 160, height / 2 - 130, 320, 260, 16);
    panel.lineStyle(3, 0xc8832a, 1);
    panel.strokeRoundedRect(width / 2 - 160, height / 2 - 130, 320, 260, 16);

    this.add.text(width / 2, height / 2 - 95, '⏸ Paused', {
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#f5c518',
      stroke: '#5a3000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.createMenuBtn(width / 2, height / 2 - 30, 'Resume', () => {
      this.scene.stop('PauseMenu');
      this.scene.resume(this.levelKey);
    });

    this.createMenuBtn(width / 2, height / 2 + 30, 'Retry Level', () => {
      this.scene.stop('PauseMenu');
      this.scene.stop('HUD');
      this.scene.stop(this.levelKey);
      this.scene.start(this.levelKey, { room: this.room });
    });

    this.createMenuBtn(width / 2, height / 2 + 90, 'Main Menu', () => {
      this.scene.stop('PauseMenu');
      this.scene.stop('HUD');
      this.scene.stop(this.levelKey);
      this.scene.start('GameMenu', { room: this.room });
    });
  }

  private createMenuBtn(x: number, y: number, label: string, cb: () => void) {
    const bg = this.add.graphics();
    bg.fillStyle(0xc8832a, 1);
    bg.fillRoundedRect(x - 110, y - 20, 220, 40, 8);
    bg.lineStyle(2, 0x8b4513, 1);
    bg.strokeRoundedRect(x - 110, y - 20, 220, 40, 8);

    const txt = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#5a3000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 220, 40).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { bg.setAlpha(0.75); txt.setScale(1.05); });
    zone.on('pointerout', () => { bg.setAlpha(1); txt.setScale(1); });
    zone.on('pointerup', cb);
  }
}

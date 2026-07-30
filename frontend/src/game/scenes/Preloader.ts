import { Scene } from 'phaser';

export class Preloader extends Scene {
  room: any;

  constructor() {
    super('Preloader');
  }

  init(data: any) {
    this.room = data.room;
  }

  preload() {
    this.load.spritesheet('jim', 'assets/jim.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('mary', 'assets/mary.png', { frameWidth: 64, frameHeight: 64 });

    // Create Platform texture (gray rectangle)
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x7f8c8d, 1);
    platformGraphics.fillRect(0, 0, 128, 32);
    platformGraphics.generateTexture('platform', 128, 32);
    platformGraphics.destroy();
  }

  create() {
    this.scene.start('MainGame', { room: this.room });
  }
}

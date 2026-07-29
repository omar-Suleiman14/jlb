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
    // We don't have image assets yet, so we'll just generate textures dynamically
    // for Jim and Mary using Phaser Graphics
    
    // Create Jim texture (blue square)
    const jimGraphics = this.add.graphics();
    jimGraphics.fillStyle(0x3498db, 1);
    jimGraphics.fillRect(0, 0, 32, 32);
    jimGraphics.generateTexture('jim', 32, 32);
    jimGraphics.destroy();

    // Create Mary texture (pink circle)
    const maryGraphics = this.add.graphics();
    maryGraphics.fillStyle(0xe74c3c, 1);
    maryGraphics.fillCircle(16, 16, 16);
    maryGraphics.generateTexture('mary', 32, 32);
    maryGraphics.destroy();

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

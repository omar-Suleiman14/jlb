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
    // Load character spritesheets
    this.load.spritesheet('jim', 'assets/jim.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('mary', 'assets/mary.png', { frameWidth: 64, frameHeight: 64 });

    // Show loading progress bar
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333);
    const bar = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0xf39c12);
    bar.setOrigin(0, 0.5);
    this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      bar.width = 400 * v;
    });
  }

  create() {
    // Generate tile textures
    this.generateTileTextures();

    // Generate platform texture for backwards compat
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x7f8c8d, 1);
    platformGraphics.fillRect(0, 0, 128, 32);
    platformGraphics.generateTexture('platform', 128, 32);
    platformGraphics.destroy();

    // Generate heart texture
    this.generateHeart();

    // Generate spike texture
    this.generateSpike();

    // Generate enemy texture
    this.generateEnemy();

    // Go to the in-game main menu (not the React lobby)
    this.scene.start('GameMenu', { room: this.room });
  }

  private generateTileTextures() {
    // Grass tile (top of platform)
    const grass = this.add.graphics();
    grass.fillStyle(0x5d8a3c, 1);         // dark green grass
    grass.fillRect(0, 0, 32, 10);
    grass.fillStyle(0x3a2010, 1);         // brown dirt
    grass.fillRect(0, 10, 32, 22);
    // Dirt texture lines
    grass.lineStyle(1, 0x2a1808, 0.4);
    for (let y = 12; y < 32; y += 6) {
      grass.lineBetween(2, y, 30, y);
    }
    grass.generateTexture('tile-grass', 32, 32);
    grass.destroy();

    // Dirt tile (below ground)
    const dirt = this.add.graphics();
    dirt.fillStyle(0x3a2010, 1);
    dirt.fillRect(0, 0, 32, 32);
    dirt.lineStyle(1, 0x2a1808, 0.4);
    for (let y = 6; y < 32; y += 6) {
      dirt.lineBetween(2, y, 30, y);
    }
    dirt.generateTexture('tile-dirt', 32, 32);
    dirt.destroy();

    // Sky background tile (gradient-ish)
    const sky = this.add.graphics();
    sky.fillStyle(0x87ceeb, 1);
    sky.fillRect(0, 0, 32, 32);
    sky.generateTexture('tile-sky', 32, 32);
    sky.destroy();

    // Coin/collectible heart  (small)
    const coin = this.add.graphics();
    coin.fillStyle(0xff2255, 1);
    coin.fillCircle(8, 8, 8);
    coin.generateTexture('coin', 16, 16);
    coin.destroy();
  }

  private generateHeart() {
    const g = this.add.graphics();
    // Full heart (red)
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(10, 9, 9);
    g.fillCircle(22, 9, 9);
    g.fillTriangle(1, 13, 31, 13, 16, 30);
    g.generateTexture('heart-full', 32, 32);
    g.clear();
    // Empty heart (grey)
    g.lineStyle(2, 0xaaaaaa, 1);
    g.strokeCircle(10, 9, 9);
    g.strokeCircle(22, 9, 9);
    g.strokeTriangle(1, 13, 31, 13, 16, 30);
    g.generateTexture('heart-empty', 32, 32);
    g.destroy();
  }

  private generateSpike() {
    const g = this.add.graphics();
    g.fillStyle(0xaaaaaa, 1);
    // Draw 3 spikes
    for (let i = 0; i < 3; i++) {
      const baseX = i * 10 + 2;
      g.fillTriangle(baseX, 30, baseX + 5, 2, baseX + 10, 30);
    }
    g.generateTexture('spike', 32, 32);
    g.destroy();
  }

  private generateEnemy() {
    // Simple grandma-style enemy - grey with a body
    const g = this.add.graphics();
    // Body
    g.fillStyle(0x9b59b6, 1);
    g.fillRect(6, 14, 20, 20);
    // Head
    g.fillStyle(0xfad7a0, 1);
    g.fillCircle(16, 10, 10);
    // Eyes (angry)
    g.fillStyle(0x000000, 1);
    g.fillCircle(12, 9, 2);
    g.fillCircle(20, 9, 2);
    // Weapon (rolling pin)
    g.fillStyle(0xd4a76a, 1);
    g.fillRect(24, 12, 6, 16);
    g.generateTexture('enemy', 32, 32);
    g.destroy();
  }
}

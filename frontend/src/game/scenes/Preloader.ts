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
    // Show loading progress bar
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333);
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
    // Generate basic texture for players
    const g = this.add.graphics();
    g.fillStyle(0x3498db, 1);
    g.fillRect(0, 0, 32, 48);
    g.generateTexture('jim', 32, 48);
    g.clear();
    
    g.fillStyle(0xe91e8c, 1);
    g.fillRect(0, 0, 32, 48);
    g.generateTexture('mary', 32, 48);
    g.destroy();

    // Go to the in-game main menu (not the React lobby)
    this.scene.start('GameMenu', { room: this.room });
  }
}

import { Scene } from 'phaser';

export class Preloader extends Scene {
  room: any;

  constructor() {
    super('Preloader');
  }

  init() {
    this.room = this.registry.get('colyseus_room');
  }

  preload() {
    // Assets are already pre-loaded into the browser cache by React's LoadingScreen.
    // Phaser will just quickly parse them into its own cache.

    // Load LDtk JSON
    this.load.json('levelData', 'assets/jlp.ldtk');

    // Load character spritesheets (using placeholders or full images for now)
    this.load.spritesheet('jim', 'assets/jim.png', { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('pam', 'assets/pam.png', { frameWidth: 48, frameHeight: 64 });

    // Load jim individual animation frames
    for (let i = 0; i <= 4; i++) {
      this.load.image(`jim_idle_${i}`, `assets/jim_idle/jim_idle_${i}.png`);
    }
    for (let i = 0; i <= 2; i++) {
      this.load.image(`jim_run_${i}`, `assets/jim_run/jim_run_${i}.png`);
    }
    // Jump frames (note: file naming is mixed — jim_jump_0, jim_jumb_1, jim_jump_2, jim_jump_3)
    this.load.image('jim_jump_0', 'assets/jim_jump/jim_jump_0.png');
    this.load.image('jim_jump_1', 'assets/jim_jump/jim_jumb_1.png'); // typo in filename
    this.load.image('jim_jump_2', 'assets/jim_jump/jim_jump_2.png');
    this.load.image('jim_jump_3', 'assets/jim_jump/jim_jump_3.png');
    for (let i = 0; i <= 2; i++) {
      this.load.image(`jim_fall_${i}`, `assets/jim_fall/jim_fall_${i}.png`);
    }
    this.load.image('jim_kiss_0', 'assets/jim_kiss/jim_kiss.png');

    // Load pam individual animation frames
    for (let i = 0; i <= 3; i++) {
      this.load.image(`pam_idle_${i}`, `assets/pam_idle/pam_idle_${i}.png`);
    }
    for (let i = 0; i <= 2; i++) {
      this.load.image(`pam_run_${i}`, `assets/pam_run/pam_run_${i}.png`);
    }
    for (let i = 0; i <= 2; i++) {
      this.load.image(`pam_jump_${i}`, `assets/pam_jump/pam_jump_${i}.png`);
    }
    for (let i = 0; i <= 2; i++) {
      this.load.image(`pam_fall_${i}`, `assets/pam_fall/pam_fall_${i}.png`);
    }
    for (let i = 0; i <= 3; i++) {
      this.load.image(`pam_duck_${i}`, `assets/pam_duck/pam_duck_${i}.png`);
    }
    this.load.image('pam_kiss_0', 'assets/pam_kiss/pam_kiss.png');

    // Load ground tiles
    for (let i = 0; i <= 179; i++) {
      const idx = i.toString().padStart(4, '0');
      this.load.image(`tile_${i}`, `assets/Tiles/tile_${idx}.png`);
    }

    // Load background tiles
    for (let i = 0; i <= 23; i++) {
      const idx = i.toString().padStart(4, '0');
      this.load.image(`bg_tile_${i}`, `assets/Tiles/Backgrounds/tile_${idx}.png`);
    }
  }

  create() {

    // Go to the in-game main menu (not the React lobby)
    this.scene.start('GameMenu', { room: this.room });
  }
}

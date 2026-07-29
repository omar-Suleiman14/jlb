import { Scene } from 'phaser';

export class MainGame extends Scene {
  room: any;

  constructor() {
    super('MainGame');
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Add some static platforms
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, 'platform').setScale(8, 2).refreshBody(); // Ground
    platforms.create(600, 400, 'platform');
    platforms.create(200, 300, 'platform');
    platforms.create(750, 220, 'platform');

    // Display the room ID for debug
    this.add.text(16, 16, `Room Code: ${this.room?.metadata?.roomCode || 'Local'}`, {
      fontSize: '24px',
      color: '#ffffff'
    });

    // In a real multiplayer setup, we'd listen to Colyseus state here
    // and spawn players accordingly. For now, just spawn placeholders.
    const jim = this.physics.add.sprite(100, 450, 'jim');
    jim.setBounce(0.2);
    jim.setCollideWorldBounds(true);
    this.physics.add.collider(jim, platforms);

    const mary = this.physics.add.sprite(700, 450, 'mary');
    mary.setBounce(0.2);
    mary.setCollideWorldBounds(true);
    this.physics.add.collider(mary, platforms);
  }
}

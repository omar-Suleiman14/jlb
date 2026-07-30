import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private dir: number = 1;
  private speed: number = 80;
  private leftBound: number;
  private rightBound: number;
  private alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, leftBound: number, rightBound: number) {
    super(scene, x, y, 'enemy');
    this.leftBound = leftBound;
    this.rightBound = rightBound;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.body!.setSize(28, 30);
    this.body!.setOffset(2, 2);

    // Start moving right
    this.setVelocityX(this.speed);
    this.setFlipX(false);
  }

  isDead() { return !this.alive; }

  stomp() {
    if (!this.alive) return;
    this.alive = false;
    this.setVelocity(0, -100);
    this.setAlpha(0.5);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 50,
      duration: 400,
      onComplete: () => this.destroy()
    });
  }

  update() {
    if (!this.alive || !this.body) return;

    if (this.x <= this.leftBound) {
      this.dir = 1;
    } else if (this.x >= this.rightBound) {
      this.dir = -1;
    }

    this.setVelocityX(this.speed * this.dir);
    this.setFlipX(this.dir < 0);
  }
}

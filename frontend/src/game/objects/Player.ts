import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    characterName: string;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    isCurrentPlayer: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, characterName: string, isCurrentPlayer: boolean = false) {
        super(scene, x, y, characterName);

        this.characterName = characterName;
        this.isCurrentPlayer = isCurrentPlayer;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.1);
        this.setCollideWorldBounds(true);
        // Adjust hitbox (width, height, offsetX, offsetY)
        this.body?.setSize(32, 48);
        this.body?.setOffset(16, 16);

        this.createAnimations();

        if (this.isCurrentPlayer) {
            this.cursors = scene.input.keyboard?.createCursorKeys();
        }

        this.play(`${this.characterName}-idle`);
    }

    createAnimations() {
        // Idle: row 0, frames 0-3
        this.scene.anims.create({
            key: `${this.characterName}-idle`,
            frames: this.scene.anims.generateFrameNumbers(this.characterName, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // Walk: row 1, frames 8-15
        this.scene.anims.create({
            key: `${this.characterName}-walk`,
            frames: this.scene.anims.generateFrameNumbers(this.characterName, { start: 8, end: 15 }),
            frameRate: 12,
            repeat: -1
        });

        // Jump: row 2, frames 16-19
        this.scene.anims.create({
            key: `${this.characterName}-jump`,
            frames: this.scene.anims.generateFrameNumbers(this.characterName, { start: 16, end: 19 }),
            frameRate: 10,
            repeat: 0
        });

        // Duck: row 3, frames 24-25
        this.scene.anims.create({
            key: `${this.characterName}-duck`,
            frames: this.scene.anims.generateFrameNumbers(this.characterName, { start: 24, end: 25 }),
            frameRate: 8,
            repeat: 0
        });
    }

    updateRemote(x: number, y: number, anim: string, flipX: boolean) {
        if (this.isCurrentPlayer) return;
        
        this.setX(x);
        this.setY(y);
        this.setFlipX(flipX);
        if (anim && this.anims.currentAnim?.key !== anim) {
            this.play(anim, true);
        }
    }

    update() {
        if (!this.isCurrentPlayer || !this.cursors || !this.body) return;

        const speed = 160;
        const jumpVelocity = -330;

        // Reset velocity
        this.setVelocityX(0);

        const isGrounded = this.body.touching.down || this.body.blocked.down;

        if (this.cursors.left.isDown) {
            this.setVelocityX(-speed);
            this.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(speed);
            this.setFlipX(false);
        }

        if (this.cursors.up.isDown && isGrounded) {
            this.setVelocityY(jumpVelocity);
        }

        const isDucking = this.cursors.down.isDown && isGrounded;
        
        // Handle Animations
        if (!isGrounded) {
            this.play(`${this.characterName}-jump`, true);
        } else if (isDucking) {
            this.play(`${this.characterName}-duck`, true);
            this.setVelocityX(0); // Stop moving while ducking
        } else if (this.body.velocity.x !== 0) {
            this.play(`${this.characterName}-walk`, true);
        } else {
            this.play(`${this.characterName}-idle`, true);
        }
    }
}

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



        if (this.isCurrentPlayer) {
            this.cursors = scene.input.keyboard?.createCursorKeys();
            // Add WASD as fallback so either scheme works for local player
            this.scene.input.keyboard?.addKeys('W,S,A,D'); // just to register them
        }


    }

    updateRemote(x: number, y: number, _anim: string, flipX: boolean) {
        if (this.isCurrentPlayer) return;
        
        this.setX(x);
        this.setY(y);
        this.setFlipX(flipX);
    }

    update() {
        if (!this.isCurrentPlayer || !this.cursors || !this.body) return;

        const speed = 160;
        const jumpVelocity = -330;

        // Reset velocity
        this.setVelocityX(0);

        const isGrounded = this.body.touching.down || this.body.blocked.down;
        const kb = this.scene.input.keyboard;
        
        const leftDown = this.cursors.left.isDown || (kb && kb.addKey('A').isDown);
        const rightDown = this.cursors.right.isDown || (kb && kb.addKey('D').isDown);
        const upDown = this.cursors.up.isDown || (kb && kb.addKey('W').isDown);
        const downDown = this.cursors.down.isDown || (kb && kb.addKey('S').isDown);

        if (leftDown) {
            this.setVelocityX(-speed);
            this.setFlipX(true);
        } else if (rightDown) {
            this.setVelocityX(speed);
            this.setFlipX(false);
        }

        if (upDown && isGrounded) {
            this.setVelocityY(jumpVelocity);
        }

        const isDucking = downDown && isGrounded;
        
        // Handle Animations
        if (isDucking) {
            this.setVelocityX(0); // Stop moving while ducking
        }
    }
}

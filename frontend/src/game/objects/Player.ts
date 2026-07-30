import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    characterName: string;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    isCurrentPlayer: boolean;
    debugRect!: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, characterName: string, isCurrentPlayer: boolean = false) {
        // Start Jim on his first idle frame, and Pam on hers
        const startTexture = characterName === 'jim' ? 'jim_idle_0' : 'pam_idle_0';
        super(scene, x, y, startTexture);

        this.characterName = characterName;
        this.isCurrentPlayer = isCurrentPlayer;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.1);
        this.setCollideWorldBounds(true);

        this.setScale(0.45);
        if (characterName === 'jim') {
            this.body?.setSize(20, 150); // extremely thin (20) so they can stand super close
            this.body?.setOffset(30, 5); // 80/2 - 20/2 = 30
        } else {
            this.body?.setSize(20, 150);
            this.body?.setOffset(30, 5);
        }

        this.createAnimations();

        if (this.isCurrentPlayer) {
            this.cursors = scene.input.keyboard?.createCursorKeys();
            this.scene.input.keyboard?.addKeys('W,S,A,D');
        }

        this.debugRect = scene.add.graphics();
        this.debugRect.setDepth(100);

        // Hide remote player until first position sync from server
        if (!this.isCurrentPlayer) {
            this.setVisible(false);
            this.debugRect.setVisible(false);
            if (this.body) this.body.enable = false;
        }
    }

    private createAnimations() {
        if (!this.scene.anims.exists(`${this.characterName}_idle`)) {
            if (this.characterName === 'jim') {
                // Jim: all individual PNG frames per animation folder
                this.scene.anims.create({
                    key: 'jim_idle',
                    frames: [0,1,2,3,4].map(i => ({ key: `jim_idle_${i}` })),
                    frameRate: 6, repeat: -1
                });
                this.scene.anims.create({
                    key: 'jim_walk',
                    frames: [0,1,2].map(i => ({ key: `jim_run_${i}` })),
                    frameRate: 6, repeat: -1
                });
                this.scene.anims.create({
                    key: 'jim_jump',
                    frames: [0,1,2,3].map(i => ({ key: `jim_jump_${i}` })),
                    frameRate: 8, repeat: 0
                });
                this.scene.anims.create({
                    key: 'jim_fall',
                    frames: [0,1,2].map(i => ({ key: `jim_fall_${i}` })),
                    frameRate: 8, repeat: -1
                });
                this.scene.anims.create({
                    key: 'jim_duck',
                    frames: [{ key: 'jim_idle_0' }], // placeholder until duck folder added
                    frameRate: 1
                });
                this.scene.anims.create({
                    key: 'jim_kiss',
                    frames: [{ key: 'jim_kiss_0' }],
                    frameRate: 1, repeat: -1
                });
            } else {
                // Pam: all individual PNG frames per animation folder
                this.scene.anims.create({
                    key: 'pam_idle',
                    frames: [0,1,2,3].map(i => ({ key: `pam_idle_${i}` })),
                    frameRate: 6, repeat: -1
                });
                this.scene.anims.create({
                    key: 'pam_walk',
                    frames: [0,1,2].map(i => ({ key: `pam_run_${i}` })),
                    frameRate: 6, repeat: -1
                });
                this.scene.anims.create({
                    key: 'pam_jump',
                    frames: [0,1,2].map(i => ({ key: `pam_jump_${i}` })),
                    frameRate: 8, repeat: 0
                });
                this.scene.anims.create({
                    key: 'pam_fall',
                    frames: [0,1,2].map(i => ({ key: `pam_fall_${i}` })),
                    frameRate: 8, repeat: -1
                });
                this.scene.anims.create({
                    key: 'pam_duck',
                    frames: [0,1,2,3].map(i => ({ key: `pam_duck_${i}` })),
                    frameRate: 8, repeat: -1 // loop for crawling
                });
                this.scene.anims.create({
                    key: 'pam_kiss',
                    frames: [{ key: 'pam_kiss_0' }],
                    frameRate: 1, repeat: -1
                });
            }
        }
        this.play(`${this.characterName}_idle`);
    }

    updateRemote(x: number, y: number, anim: string, flipX: boolean) {
        if (this.isCurrentPlayer) return;

        if (!this.visible) {
            this.setVisible(true);
            this.debugRect.setVisible(true);
            if (this.body) {
                this.body.enable = true;
                this.setScale(0.45);
                if (this.characterName === 'jim') {
                    this.body.setSize(20, 150);
                    this.body.setOffset(30, 5);
                } else {
                    this.body.setSize(20, 150);
                    this.body.setOffset(30, 5);
                }
            }
        }

        this.setX(x);
        this.setY(y);
        this.setFlipX(flipX);
        if (anim && anim !== this.anims.currentAnim?.key) {
            this.play(anim, true);
        }
    }

    update() {
        if (this.body) {
            this.debugRect.clear();
            // Debug drawing removed as per user request
        }

        if (!this.isCurrentPlayer || !this.cursors || !this.body) return;

        const speed = 160;
        let jumpVelocity = -330;

        // Jim jumps 1.1x higher
        if (this.characterName === 'jim') {
            jumpVelocity = -330 * 1.1;
        }

        // Reset X velocity
        this.setVelocityX(0);

        const isGrounded = this.body.touching.down || this.body.blocked.down;
        const kb = this.scene.input.keyboard;

        const leftDown  = this.cursors.left.isDown  || (kb && kb.addKey('A').isDown) || this.scene.registry.get('input_left');
        const rightDown = this.cursors.right.isDown || (kb && kb.addKey('D').isDown) || this.scene.registry.get('input_right');
        const upDown    = this.cursors.up.isDown    || (kb && kb.addKey('W').isDown) || this.scene.registry.get('input_jump');
        const downDown  = this.cursors.down.isDown  || (kb && kb.addKey('S').isDown) || this.scene.registry.get('input_down');

        // Pam-only ducking
        const isDucking = downDown && isGrounded && this.characterName === 'pam';

        // ── Movement ──────────────────────────────────────────────────────────
        let currentAnim = `${this.characterName}_idle`;

        if (leftDown) {
            this.setVelocityX(isDucking ? -speed * 0.5 : -speed);
            this.setFlipX(true);
            if (isGrounded && !isDucking) currentAnim = `${this.characterName}_walk`;
        } else if (rightDown) {
            this.setVelocityX(isDucking ? speed * 0.5 : speed);
            this.setFlipX(false);
            if (isGrounded && !isDucking) currentAnim = `${this.characterName}_walk`;
        }

        if (upDown && isGrounded && !isDucking) {
            this.setVelocityY(jumpVelocity);
        }

        // ── Animation state ───────────────────────────────────────────────────
        if (!isGrounded) {
            // Jump plays once on the way up, fall loops on the way down
            currentAnim = this.body.velocity.y < 0
                ? `${this.characterName}_jump`
                : `${this.characterName}_fall`;
        } else if (isDucking) {
            currentAnim = `${this.characterName}_duck`;
        }

        this.play(currentAnim, true);

        // ── Pam ducking scale and hitbox ────────────────────────────────────────
        const wasDucking = this.scale < 0.3; // 0.225 is ducking, 0.45 is normal

        if (isDucking && !wasDucking) {
            this.setScale(0.225); // 50% of 0.45
            this.y += 17.4375; // Shift down to keep feet on the floor
        } else if (!isDucking && wasDucking) {
            this.setScale(0.45);
            this.y -= 17.4375; // Shift back up
        }

        if (this.characterName === 'jim') {
            this.body.setSize(20, 150);
            this.body.setOffset(30, 5);
        } else {
            // Pam uses the same unscaled hitbox, it naturally scales to 50% when ducking!
            this.body.setSize(20, 150);
            this.body.setOffset(30, 5);
        }
    }
}

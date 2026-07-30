import { Scene } from 'phaser';

export class GameMenu extends Scene {
  room: any;

  constructor() {
    super('GameMenu');
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    const { width, height } = this.scale;

    // ── Sky gradient background ──────────────────────────────────────────────
    this.add.rectangle(width / 2, height * 0.3, width, height * 0.6, 0x87ceeb);
    this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, 0x4caf50);

    // ── Rolling hills ───────────────────────────────────────────────────────
    this.drawHills(width, height);

    // ── Decorative clouds ───────────────────────────────────────────────────
    this.drawCloud(150, 80, 0.9);
    this.drawCloud(420, 50, 1.1);
    this.drawCloud(680, 90, 0.8);
    this.drawCloud(900, 60, 1.0);

    // ── Decorative trees ────────────────────────────────────────────────────
    this.drawTree(80, 380);
    this.drawTree(190, 360);
    this.drawTree(750, 370);
    this.drawTree(870, 355);
    this.drawTree(950, 375);

    // ── Houses ──────────────────────────────────────────────────────────────
    this.drawHouse(120, 430, 0xf5e6c8, 0xe6b800); // left house (yellow roof)
    this.drawHouse(800, 420, 0xd2b48c, 0xa0522d); // right house (brown roof)

    // ── Enemy decorations ───────────────────────────────────────────────────
    this.drawEnemyDecoration(200, 510, -1); // grandma left
    this.drawEnemyDecoration(750, 510, 1);  // villain right 1
    this.drawEnemyDecoration(820, 510, 1);  // villain right 2

    // ── Ground strip ────────────────────────────────────────────────────────
    const ground = this.add.graphics();
    ground.fillStyle(0x4caf50, 1);
    ground.fillRect(0, height - 80, width, 80);
    ground.fillStyle(0x5d8a3c, 1);
    ground.fillRect(0, height - 80, width, 10);

    // ── LOGO ────────────────────────────────────────────────────────────────
    // Outer glow ring
    const logoShadow = this.add.text(width / 2 + 3, 123, 'Jim Loves\n   Mary', {
      fontFamily: 'Georgia, serif',
      fontSize: '56px',
      fontStyle: 'bold italic',
      color: '#4a2000',
      align: 'center',
    }).setOrigin(0.5);

    const logo = this.add.text(width / 2, 120, 'Jim Loves\n   Mary', {
      fontFamily: 'Georgia, serif',
      fontSize: '56px',
      fontStyle: 'bold italic',
      color: '#f5c518',
      stroke: '#8b4513',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    // Bounce animation for logo
    this.tweens.add({
      targets: [logo, logoShadow],
      y: '+=8',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ── Wooden signpost ─────────────────────────────────────────────────────
    // Post
    const post = this.add.graphics();
    post.fillStyle(0x8b4513, 1);
    post.fillRect(width / 2 - 8, 240, 16, 200);
    post.fillStyle(0xa0522d, 1);
    post.fillRect(width / 2 - 6, 242, 4, 196);  // highlight

    // ── Buttons ─────────────────────────────────────────────────────────────
    this.createWoodenButton(width / 2, 300, 'Play Game', 220, () => {
      this.scene.start('Level1', { room: this.room, level: 1 });
    });

    this.createWoodenButton(width / 2, 370, 'Credits', 220, () => {
      this.showCredits();
    });

    // ── Sound / Music toggles ───────────────────────────────────────────────
    this.createCircleButton(width - 100, 40, '🔊', () => {});
    this.createCircleButton(width - 50, 40, '🎵', () => {});

    // ── Room code display ───────────────────────────────────────────────────
    if (this.room?.metadata?.roomCode) {
      this.add.text(16, height - 30, `Room: ${this.room.metadata.roomCode}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      });
    }
  }

  private drawHills(width: number, height: number) {
    const g = this.add.graphics();
    g.fillStyle(0x5aad3d, 1);
    // Left hill
    g.fillEllipse(150, height - 50, 400, 220);
    // Center hill
    g.fillEllipse(530, height - 30, 480, 200);
    // Right hill
    g.fillEllipse(920, height - 55, 380, 210);
    // Darker overlay to create depth
    g.fillStyle(0x4a9530, 1);
    g.fillEllipse(150, height - 30, 360, 150);
    g.fillEllipse(530, height - 10, 440, 130);
    g.fillEllipse(920, height - 35, 340, 140);
  }

  private drawCloud(x: number, y: number, scale: number) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(x, y, 80 * scale, 40 * scale);
    g.fillEllipse(x + 30 * scale, y - 10 * scale, 60 * scale, 35 * scale);
    g.fillEllipse(x - 25 * scale, y - 5 * scale, 55 * scale, 30 * scale);
  }

  private drawTree(x: number, y: number) {
    const g = this.add.graphics();
    // Trunk
    g.fillStyle(0x8b4513, 1);
    g.fillRect(x - 6, y, 12, 30);
    // Leaves (layered)
    g.fillStyle(0x2e7d32, 1);
    g.fillEllipse(x, y - 10, 55, 45);
    g.fillStyle(0x388e3c, 1);
    g.fillEllipse(x, y - 25, 42, 38);
    g.fillStyle(0x43a047, 1);
    g.fillEllipse(x + 5, y - 38, 30, 28);
  }

  private drawHouse(x: number, y: number, wallColor: number, roofColor: number) {
    const g = this.add.graphics();
    // Wall
    g.fillStyle(wallColor, 1);
    g.fillRect(x - 45, y - 50, 90, 60);
    // Roof
    g.fillStyle(roofColor, 1);
    g.fillTriangle(x - 55, y - 50, x + 55, y - 50, x, y - 100);
    // Door
    g.fillStyle(0x8b4513, 1);
    g.fillRect(x - 12, y - 22, 24, 32);
    g.fillStyle(0xf5deb3, 1);
    g.fillCircle(x + 8, y - 8, 3); // doorknob
    // Window
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(x - 35, y - 42, 22, 18);
    g.lineStyle(2, 0x8b4513, 1);
    g.strokeRect(x - 35, y - 42, 22, 18);
    // Chimney
    g.fillStyle(0xd2691e, 1);
    g.fillRect(x + 15, y - 100, 12, 25);
  }

  private drawEnemyDecoration(x: number, y: number, facing: number) {
    const g = this.add.graphics();
    if (facing < 0) {
      // Grandma silhouette
      g.fillStyle(0xc8c8c8, 1); // grey hair
      g.fillCircle(x, y - 55, 18);
      g.fillStyle(0x87ceef, 1); // dress
      g.fillRect(x - 14, y - 38, 28, 40);
      // Rolling pin
      g.fillStyle(0xd4a76a, 1);
      g.fillRect(x - 30, y - 30, 20, 7);
      g.fillRect(x - 35, y - 33, 8, 13);
    } else {
      // Villain silhouette
      g.fillStyle(0x4a3020, 1);
      g.fillCircle(x, y - 55, 16);
      g.fillStyle(0x2d5a27, 1);
      g.fillRect(x - 12, y - 38, 24, 38);
      // Pitchfork
      g.fillStyle(0xaaaaaa, 1);
      g.fillRect(x + 14, y - 52, 5, 52);
      g.fillRect(x + 12, y - 52, 5, 10);
      g.fillRect(x + 20, y - 52, 5, 10);
    }
  }

  private createWoodenButton(x: number, y: number, label: string, bw: number, callback: () => void) {
    const bh = 48;
    // Arrow shape (pointed right)
    const bg = this.add.graphics();
    bg.fillStyle(0xc8832a, 1); // dark wood
    bg.fillRect(x - bw / 2, y - bh / 2, bw + 20, bh);
    bg.fillTriangle(x + bw / 2 + 20, y - bh / 2, x + bw / 2 + 20, y + bh / 2, x + bw / 2 + 40, y);
    // Highlight
    bg.fillStyle(0xe6a035, 1);
    bg.fillRect(x - bw / 2 + 4, y - bh / 2 + 4, bw, 10);

    const text = this.add.text(x + 10, y, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#5a3000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Interactive zone
    const zone = this.add.zone(x + 10, y, bw + 60, bh).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => {
      bg.setAlpha(0.85);
      text.setScale(1.05);
    });
    zone.on('pointerout', () => {
      bg.setAlpha(1);
      text.setScale(1);
    });
    zone.on('pointerup', callback);

    // Wobble on hover
    this.tweens.add({
      targets: [bg, text],
      x: '+=3',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createCircleButton(x: number, y: number, emoji: string, callback: () => void) {
    const bg = this.add.graphics();
    bg.fillStyle(0xc8832a, 1);
    bg.fillCircle(x, y, 22);
    bg.lineStyle(2, 0x8b4513, 1);
    bg.strokeCircle(x, y, 22);

    this.add.text(x, y + 2, emoji, { fontSize: '18px' }).setOrigin(0.5);

    const zone = this.add.zone(x, y, 44, 44).setInteractive({ cursor: 'pointer' });
    zone.on('pointerup', callback);
    zone.on('pointerover', () => bg.setAlpha(0.7));
    zone.on('pointerout', () => bg.setAlpha(1));
  }

  private showCredits() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setInteractive();
    const panel = this.add.rectangle(width / 2, height / 2, 420, 280, 0x3a2010, 1);
    this.add.text(width / 2, height / 2 - 100, 'Credits', {
      fontFamily: 'Georgia, serif', fontSize: '32px', fontStyle: 'bold', color: '#f5c518'
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, 'Jim Loves Mary\n\nCreated with ❤️\nPowered by Phaser & Colyseus', {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5);
    const closeBtn = this.add.text(width / 2, height / 2 + 110, '[ Close ]', {
      fontFamily: 'Arial', fontSize: '22px', color: '#f5c518'
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });
    closeBtn.on('pointerup', () => {
      overlay.destroy(); panel.destroy(); closeBtn.destroy();
      this.children.list
        .filter(c => c.getData?.('credits'))
        .forEach(c => c.destroy());
    });
    overlay.on('pointerup', () => {
      overlay.destroy(); panel.destroy(); closeBtn.destroy();
    });
  }
}

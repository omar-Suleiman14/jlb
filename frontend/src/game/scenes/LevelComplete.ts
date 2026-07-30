import Phaser, { Scene } from 'phaser';

export class LevelComplete extends Scene {
  private room: any;
  private nextLevel: string = 'Level1';

  constructor() {
    super({ key: 'LevelComplete', active: false });
  }

  init(data: any) {
    this.room = data.room || this.registry.get('colyseus_room');
    this.nextLevel = data.nextLevel ?? 'GameMenu';
  }

  create() {
    const { width, height } = this.scale;

    // ── Dark blur overlay ────────────────────────────────────────────────────
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0).setInteractive();
    this.tweens.add({ targets: overlay, fillAlpha: 0.65, duration: 600, ease: 'Sine.easeOut' });

    // ── Glassmorphism panel ──────────────────────────────────────────────────
    const panW = 380, panH = 320;
    const panX = width / 2 - panW / 2;
    const panY = height / 2 - panH / 2;

    const panel = this.add.graphics().setAlpha(0);
    panel.fillStyle(0x0d0d1a, 0.92);
    panel.fillRoundedRect(panX, panY, panW, panH, 28);
    panel.lineStyle(1.5, 0xff69b4, 0.35);
    panel.strokeRoundedRect(panX, panY, panW, panH, 28);

    // Inner soft glow top
    const topGlow = this.add.graphics().setAlpha(0);
    topGlow.fillStyle(0xff69b4, 0.06);
    topGlow.fillRoundedRect(panX + 4, panY + 4, panW - 8, panH / 2, 28);

    this.tweens.add({ targets: [panel, topGlow], alpha: 1, duration: 600, delay: 200, ease: 'Sine.easeOut' });

    // ── Floating heart particles ─────────────────────────────────────────────
    for (let i = 0; i < 8; i++) {
      const heart = this.add.text(
        Phaser.Math.Between(panX + 20, panX + panW - 20),
        panY + panH + 20,
        '💕',
        { fontSize: '16px' }
      ).setAlpha(0);

      this.tweens.add({
        targets: heart,
        y: panY - Phaser.Math.Between(40, 120),
        alpha: { from: 0.9, to: 0 },
        duration: Phaser.Math.Between(1800, 3200),
        delay: Phaser.Math.Between(300, 1200),
        ease: 'Sine.easeOut',
        repeat: -1,
        onRepeat: () => {
          heart.x = Phaser.Math.Between(panX + 20, panX + panW - 20);
          heart.y = panY + panH + 20;
        }
      });
    }

    // ── Headline ─────────────────────────────────────────────────────────────
    const headline = this.add.text(width / 2, panY + 58, 'Level Complete  ✓', {
      fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: headline, alpha: 1, duration: 500, delay: 400 });

    // Thin divider line
    const divider = this.add.graphics().setAlpha(0);
    divider.lineStyle(1, 0xffffff, 0.12);
    divider.lineBetween(panX + 30, panY + 92, panX + panW - 30, panY + 92);
    this.tweens.add({ targets: divider, alpha: 1, duration: 500, delay: 500 });

    // ── Subtitle ─────────────────────────────────────────────────────────────
    const subtitle = this.add.text(width / 2, panY + 130, 'Jim & Pam shared a kiss! 💋\nThey\'re one step closer...', {
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffffaa',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 500, delay: 600 });

    // ── Buttons ───────────────────────────────────────────────────────────────
    const nextBtn = this.createAppleButton(width / 2, panY + 222, 'Next Level', true);
    nextBtn.zone.on('pointerup', () => {
      this.scene.stop('LevelComplete');
      this.scene.stop('HUD');
      this.scene.stop('Level1');
      this.scene.start(this.nextLevel, { room: this.room });
    });

    const menuBtn = this.createAppleButton(width / 2, panY + 282, 'Main Menu', false);
    menuBtn.zone.on('pointerup', () => {
      this.scene.stop('LevelComplete');
      this.scene.stop('HUD');
      this.scene.stop('Level1');
      this.scene.start('GameMenu', { room: this.room });
    });

    // Slide panel in from below
    const elements = [panel, topGlow, divider, headline, subtitle, nextBtn.bg, nextBtn.txt, menuBtn.bg, menuBtn.txt];
    elements.forEach(el => { if (el) el.setY((el.y ?? 0) + 40); });
    this.tweens.add({
      targets: elements,
      y: '-=40',
      duration: 600,
      delay: 200,
      ease: 'Back.easeOut'
    });

    void overlay;
  }

  private createAppleButton(x: number, y: number, label: string, primary: boolean) {
    const bw = 280, bh = 48;

    const bg = this.add.graphics().setAlpha(0);
    if (primary) {
      bg.fillStyle(0xe91e8c, 1);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, bh / 2);
    } else {
      bg.fillStyle(0xffffff, 0.1);
      bg.fillRoundedRect(x - bw / 2, y - bh / 2, bw, bh, bh / 2);
      bg.lineStyle(1, 0xffffff, 0.2);
      bg.strokeRoundedRect(x - bw / 2, y - bh / 2, bw, bh, bh / 2);
    }
    this.tweens.add({ targets: bg, alpha: 1, duration: 500, delay: primary ? 700 : 800 });

    const txt = this.add.text(x, y, label, {
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: primary ? '#ffffff' : '#ffffffcc',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: txt, alpha: 1, duration: 500, delay: primary ? 700 : 800 });

    const zone = this.add.zone(x, y, bw, bh).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { bg.setAlpha(primary ? 0.8 : 0.7); txt.setScale(1.03); });
    zone.on('pointerout',  () => { bg.setAlpha(1); txt.setScale(1); });

    return { zone, bg, txt };
  }
}

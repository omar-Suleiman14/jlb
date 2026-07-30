import fs from 'fs';
import { createCanvas } from 'canvas';

function createDummySprite(name, colorStr) {
    const frameWidth = 64;
    const frameHeight = 64;
    const cols = 8;
    const rows = 4;
    
    const canvas = createCanvas(cols * frameWidth, rows * frameHeight);
    const ctx = canvas.getContext('2d');

    // Draw simple colored blocks to represent frames
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let exists = true;
            if (r === 0 && c >= 4) exists = false; // Idle: 4 frames
            if (r === 2 && c >= 4) exists = false; // Jump: 4 frames
            if (r === 3 && c >= 4) exists = false; // Duck/Hurt: 4 frames

            if (exists) {
                const cx = c * frameWidth;
                const cy = r * frameHeight;
                
                // Outline
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.strokeRect(cx, cy, frameWidth, frameHeight);

                // Body
                const bob = (r === 1) ? (c % 2 === 0 ? 0 : 2) : 0;
                const isDuck = (r === 3 && c < 2);
                const isHurt = (r === 3 && c >= 2);
                const h = isDuck ? 32 : (isHurt ? 24 : 48); 
                const w = isHurt ? 48 : 32;
                
                const bodyX = cx + (frameWidth - w) / 2;
                const bodyY = cy + (frameHeight - h) - bob;

                ctx.fillStyle = colorStr;
                ctx.fillRect(bodyX, bodyY, w, h);
                
                // Eyes
                ctx.fillStyle = 'black';
                if (!isHurt) {
                    ctx.fillRect(bodyX + w - 10, bodyY + 8, 4, 4);
                    ctx.fillRect(bodyX + w - 20, bodyY + 8, 4, 4);
                } else {
                    // X eyes
                    ctx.fillText('x', bodyX + w/2 - 10, bodyY + 15);
                    ctx.fillText('x', bodyX + w/2 + 5, bodyY + 15);
                }
            }
        }
    }
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`public/assets/${name}.png`, buffer);
    console.log(`Created ${name}.png`);
}

createDummySprite('jim', '#e74c3c'); // Red
createDummySprite('mary', '#3498db'); // Blue

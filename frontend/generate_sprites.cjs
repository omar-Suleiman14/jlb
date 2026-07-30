const Jimp = require('jimp');

async function createDummySprite(name, color) {
    const frameWidth = 64;
    const frameHeight = 64;
    const cols = 8;
    const rows = 4;
    
    // Create new transparent image
    const image = await new Promise((resolve, reject) => {
        new Jimp(cols * frameWidth, rows * frameHeight, 0x00000000, (err, image) => {
            if (err) reject(err);
            else resolve(image);
        });
    });

    // Draw simple colored blocks to represent frames
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Determine if frame exists for this animation
            let exists = true;
            if (r === 0 && c >= 4) exists = false; // Idle: 4 frames
            if (r === 2 && c >= 4) exists = false; // Jump: 4 frames
            if (r === 3 && c >= 4) exists = false; // Duck/Hurt: 4 frames

            if (exists) {
                // Draw frame border
                for (let x = c * frameWidth; x < (c + 1) * frameWidth; x++) {
                    for (let y = r * frameHeight; y < (r + 1) * frameHeight; y++) {
                        // Outline
                        if (x === c * frameWidth || x === (c + 1) * frameWidth - 1 || 
                            y === r * frameHeight || y === (r + 1) * frameHeight - 1) {
                            image.setPixelColor(0xFFFFFFFF, x, y);
                        } else {
                            // Body
                            // Make them bob up and down based on frame index (c)
                            const bob = (r === 1) ? (c % 2 === 0 ? 0 : 2) : 0;
                            const h = r === 3 ? 32 : 48; // Duck is shorter
                            const w = 32;
                            const cx = c * frameWidth + 16;
                            const cy = r * frameHeight + (64 - h) - bob;

                            if (x >= cx && x < cx + w && y >= cy && y < cy + h) {
                                image.setPixelColor(color, x, y);
                            }
                        }
                    }
                }
            }
        }
    }
    
    await image.writeAsync(`frontend/public/assets/${name}.png`);
    console.log(`Created ${name}.png`);
}

async function main() {
    await createDummySprite('jim', 0xFF0000FF); // Red
    await createDummySprite('mary', 0x0000FFFF); // Blue
}

main().catch(console.error);

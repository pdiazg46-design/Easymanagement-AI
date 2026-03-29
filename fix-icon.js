const sharp = require('sharp');
const fs = require('fs');

async function fix() {
  try {
    const input = 'public/logo_at_sit.png';
    const outputFiles = [
      'src/app/icon.png',
      'src/app/apple-icon.png',
      'public/icon-512x512.png'
    ];
    
    const buffer = await sharp(input)
      .resize({
        width: 380,
        height: 380,
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer();

    for (const file of outputFiles) {
      await sharp({
        create: {
          width: 512, height: 512, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{ input: buffer, gravity: 'center' }])
      .png()
      .toFile(file);
      console.log(`Saved ${file}`);
    }

    if (fs.existsSync('public/favicon.svg')) {
      fs.unlinkSync('public/favicon.svg');
    }
    if (fs.existsSync('src/app/favicon.ico')) {
      fs.unlinkSync('src/app/favicon.ico');
    }

  } catch (e) {
    console.error(e);
  }
}

fix();

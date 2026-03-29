const sharp = require('sharp');

sharp('C:\\Users\\pdiaz\\Desarrollos\\icono_limpio.png')
  .resize({ 
    width: 380, 
    height: 380, 
    fit: 'contain', 
    background: { r: 255, g: 255, b: 255, alpha: 0 } 
  })
  .extend({
    top: 66, bottom: 66, left: 66, right: 66,
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .toFile('icono_elegante.png', (err, info) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log('Success:', info);
    }
  });

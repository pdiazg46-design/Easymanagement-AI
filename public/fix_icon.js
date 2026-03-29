const sharp = require('sharp');

sharp('C:\\Users\\pdiaz\\Desarrollos\\icono_limpio.png')
  .flatten({ background: '#ffffff' })
  .resize({ 
    width: 380, 
    height: 380, 
    fit: 'contain'
  })
  .extend({
    top: 66, bottom: 66, left: 66, right: 66,
    background: '#ffffff'
  })
  .toFile('icono_elegante.png', (err, info) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log('Success:', info);
    }
  });

const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

code = code.replace('<div className="bg-corporate-purple text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">Confidencial</div>', '<div className="bg-corporate-purple text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">Confidencial v2</div>');
fs.writeFileSync('src/app/page.tsx', code);
console.log('SUCCESS');

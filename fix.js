const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Update formatCurrency function
code = code.replace(
  /const formatCurrency = \(val: number \| string\) => \{[\s\S]*?return userCurrency === 'USD'[\s\S]*?maximumFractionDigits: 0 \}\)\.format\(n\);\s*\};/,
  `const formatCurrency = (val: number | string) => {
     const n = typeof val === 'string' ? parseFloat(val.replace(/[^\\d.-]/g, '')) : Number(val);
     if (isNaN(n)) return userCurrency === 'USD' ? 'USD 0' : '$ 0';
     const formattedNumber = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(n);
     return userCurrency === 'USD' ? \`USD \${formattedNumber}\` : \`$ \${formattedNumber}\`;
  };`
);

// 2. Fix all monetary fields
const replacements = [
  { search: /\$\{globalTotalUsd\.toLocaleString\('en-US'\)\}(<span className="text-xl">\s*USD<\/span>)/g, replace: '{formatCurrency(globalTotalUsd)}' },
  { search: /\$\{globalTotalUsd\.toLocaleString\('en-US'\)\}\s*USD/g, replace: '{formatCurrency(globalTotalUsd)}' },
  { search: /\$\{c\.totalValueUsd\.toLocaleString\('en-US'\)\}/g, replace: '{formatCurrency(c.totalValueUsd)}' },
  { search: /\$\{opp\.amountUsd\.toLocaleString\('en-US'\)\}/g, replace: '{formatCurrency(opp.amountUsd)}' },
  { search: /\$\{oppDetails\.amountUsd\?\.toLocaleString\('en-US'\) \|\| 0\}/g, replace: '{formatCurrency(oppDetails.amountUsd || 0)}' },
  { search: /\$\{item\.price\.toFixed\(2\)\}\s*USD/g, replace: '{formatCurrency(item.price)}' },
  { search: /\$29 <span/g, replace: '{formatCurrency(29)} <span' }
];

replacements.forEach(r => {
  code = code.replace(r.search, r.replace);
});
// Remove " USD" spans or texts next to the replaced values if any are left
code = code.replace(/\{formatCurrency\(globalTotalUsd\)\}\s*<span className="text-xl">\s*USD<\/span><\/h3>/g, '{formatCurrency(globalTotalUsd)}</h3>');

// 3. Fix microphones touching bottom
// Contextual Mic is bottom-10 right-6
// Let's modify the Contextual Mic
code = code.replace(
  'className="absolute bottom-10 right-6 z-20 flex flex-col items-end"',
  'className="absolute bottom-[90px] sm:bottom-[70px] right-6 z-20 flex flex-col items-end"'
);

// 4. Make Dashboard Task Cards Much More Compact
code = code.replace(
  /className=\{`flex flex-col gap-1 p-3 rounded-2xl border shadow-sm cursor-pointer hover:border-\[#1E3A8A\]\/30 hover:shadow-md transition-all active:scale-\[0\.98\] \$\{task\.completed \? 'bg-emerald-50\/40 border-emerald-200' : 'bg-\[#F8FAFC\] border-slate-200'\}`\}/g,
  'className={`flex flex-col gap-0 px-3 py-2 rounded-lg border shadow-sm cursor-pointer hover:border-[#1E3A8A]/30 hover:shadow-md transition-all active:scale-[0.98] ${task.completed ? \'bg-emerald-50/40 border-emerald-200\' : \'bg-[#F8FAFC] border-slate-200\'}`}'
);

code = code.replace(
  '<div className="flex justify-between items-start mb-0.5">',
  '<div className="flex justify-between items-center">'
);

code = code.replace(
  /<span className=\{`text-\[10px\] font-black uppercase tracking-widest mb-1 flex items-center gap-1\.5 \$\{task/g,
  '<span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 mb-0.5 ${task'
);

code = code.replace(
  /<span className=\{`font-black text-base leading-tight mb-1/g,
  '<span className={`font-black text-sm leading-tight mb-0.5'
);

code = code.replace(
  '<span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">',
  '<span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">'
);

code = code.replace(
  '<div className="flex flex-col gap-1 mt-1.5">',
  '<div className="flex flex-row flex-wrap gap-1 mt-1">'
);

code = code.replace(
  /<span className="text-\[9px\] text-(blue|corporate-purple)-600 uppercase tracking-widest font-black flex items-center gap-1/g,
  '<span className="text-[8px] text-$1-600 uppercase tracking-widest font-black flex items-center gap-0.5'
);

code = code.replace(
  /<span className=\{`text-\[9px\] uppercase tracking-widest font-black flex items-center gap-1/g,
  '<span className={`text-[8px] uppercase tracking-widest font-black flex items-center gap-0.5'
);

code = code.replace(
  /className=\{`w-8 h-8 rounded-full border-\[2px\] bg-white shrink-0 ml-3/g,
  'className={`w-6 h-6 rounded-full border-[2px] bg-white shrink-0 ml-2'
);

code = code.replace(
  /className=\{`w-4 h-4 rounded-full bg-emerald-500/g,
  'className={`w-3 h-3 rounded-full bg-emerald-500'
);

// For the "Day Tasks Modal" formatting:
code = code.replace(
  'className="flex flex-col gap-1 p-3 rounded-2xl border shadow-sm border-slate-200 relative overflow-hidden group hover:border-corporate-purple/30 cursor-pointer"',
  'className="flex flex-col gap-0 px-3 py-2 rounded-lg border shadow-sm border-slate-200 relative overflow-hidden group hover:border-corporate-purple/30 cursor-pointer"'
);

fs.writeFileSync('src/app/page.tsx', code);
console.log('SUCCESS');

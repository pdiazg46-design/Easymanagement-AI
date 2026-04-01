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
code = code.replace(/\{formatCurrency\(globalTotalUsd\)\}\s*USD<\/span>/g, '{formatCurrency(globalTotalUsd)}</span>');

// 3. Compact Calendar List Items
code = code.replace(
  /className=\{`flex flex-col gap-3 p-5 bg-white rounded-2xl border-2 shadow-sm cursor-pointer hover:border-\[#1E3A8A\]\/30 hover:shadow-md transition-all active:scale-\[0\.98\] \$\{task\.completed \? 'border-emerald-200 opacity-80 bg-emerald-50\/20' : 'border-slate-100'\}`\}/g,
  'className={`flex flex-col gap-0 px-3 py-2 bg-white rounded-xl border shadow-sm cursor-pointer hover:border-[#1E3A8A]/30 transition-all active:scale-[0.98] ${task.completed ? \'border-emerald-200 opacity-80 bg-emerald-50/20\' : \'border-slate-200\'}`}'
);

code = code.replace(
  /className="flex justify-between items-start w-full gap-3"/g,
  'className="flex justify-between items-center w-full min-h-[40px] gap-2"'
);

code = code.replace(
  /className=\{`flex flex-col items-start rounded-xl px-4 py-2 border self-start \$\{task\.completed \? 'bg-emerald-50\/80 border-emerald-100' : 'bg-amber-50\/80 border-amber-100'\}`\}/g,
  'className={`flex flex-col items-start rounded-md px-2 py-1 border ${task.completed ? \'bg-emerald-50/80 border-emerald-100\' : \'bg-amber-50/80 border-amber-100\'}`}'
);

code = code.replace(
  /className=\{`text-\[11px\] font-black uppercase tracking-widest flex items-center gap-1\.5 mb-0\.5 \$\{task\.completed \? 'text-emerald-600' : 'text-\[#F59E0B\]'\}`\}/g,
  'className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1 mb-0.5 ${task.completed ? \'text-emerald-600\' : \'text-[#F59E0B]\'}`}'
);

code = code.replace(
  /className=\{`font-black text-xl tracking-tight \$\{task\.completed \? 'text-emerald-700' : 'text-\[#D97706\]'\}`\}/g,
  'className={`font-black text-xs tracking-tight ${task.completed ? \'text-emerald-700\' : \'text-[#D97706]\'}`}'
);

code = code.replace(
  /className=\{`w-10 h-10 rounded-full border-\[3px\] bg-white shrink-0 transition-colors flex items-center justify-center group shadow-inner hover:border-emerald-500 hover:bg-emerald-50 \$\{task\.completed \? 'border-emerald-500' : 'border-slate-300'\}`\}/g,
  'className={`w-6 h-6 rounded-full border-[2px] bg-white shrink-0 transition-colors flex items-center justify-center group shadow-inner hover:border-emerald-500 hover:bg-emerald-50 ${task.completed ? \'border-emerald-500\' : \'border-slate-300\'}`}'
);

code = code.replace(
  /className=\{`w-5 h-5 rounded-full bg-emerald-500 transition-opacity flex items-center justify-center \$\{task\.completed \? 'opacity-100' : 'opacity-0 group-hover:opacity-100'\}`\}/g,
  'className={`w-3 h-3 rounded-full bg-emerald-500 transition-opacity flex items-center justify-center ${task.completed ? \'opacity-100\' : \'opacity-0 group-hover:opacity-100\'}`}'
);

fs.writeFileSync('src/app/page.tsx', code);
console.log('SUCCESS');

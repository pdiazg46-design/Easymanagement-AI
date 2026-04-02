const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Fix duplicated div from previous error
code = code.replace(/<div className="absolute bottom-6 sm:bottom-6 right-6 z-\[60\] flex flex-col items-end pointer-events-none">\s*<div className="mb-2 w-max text-right pointer-events-auto">\s*<div className="mb-2 w-max text-right">/,
`<div className="absolute bottom-6 sm:bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none">\n                  <div className="mb-2 w-max text-right pointer-events-auto">`);

// 2. Add pointer-events-auto to mic button
code = code.replace(/className={`w-\[68px\] h-\[68px\] text-white/, 'className={`w-[68px] h-[68px] pointer-events-auto text-white');
// Add pointer-events-auto to help button
code = code.replace(/className={`w-10 h-10 sm:w-11 sm:h-11 bg-white border/, 'className={`w-10 h-10 sm:w-11 sm:h-11 pointer-events-auto bg-white border');

// 3. Fix NLP Truncation logic
code = code.replace(/if\s*\(truncateIdx\s*>\s*0\s*&&\s*truncateIdx\s*<\s*actionStr\.length\)\s*\{\s*actionStr\s*=\s*actionStr\.substring\(0,\s*truncateIdx\)\.trim\(\);\s*\}/,
`if (truncateIdx > 0 && truncateIdx < actionStr.length) {
             actionStr = actionStr.substring(0, truncateIdx).trim();
          }
          let wordsArr = actionStr.split(/\\s+/);
          if (wordsArr.length > 3) { wordsArr = wordsArr.slice(0, 3); }
          const stopwords = ["a", "para", "al", "el", "la", "los", "las", "un", "una", "de", "del", "con", "en", "por", "y", "o"];
          if (wordsArr.length > 0 && stopwords.includes(wordsArr[wordsArr.length - 1].toLowerCase())) { wordsArr.pop(); }
          actionStr = wordsArr.join(" ");`);

// 4. Edit Target Button Fix
code = code.replace(/className="p-1 px-1\.5 text-slate-300 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded transition-colors"\s*title=\{lang === 'es' \? 'Editar Oportunidad' : 'Edit Opportunity'\}/g,
`className="p-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer block touch-manipulation relative z-10"
title={lang === 'es' ? 'Editar Oportunidad' : 'Edit Opportunity'}`);

// 5. Delete Target Button Fix
code = code.replace(/className="p-1 px-1\.5 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-colors"\s*title=\{lang === 'es' \? 'Eliminar Oportunidad' : 'Delete Opportunity'\}/g,
`className="p-2.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg shadow-sm transition-colors cursor-pointer block touch-manipulation relative z-10"
title={lang === 'es' ? 'Eliminar Oportunidad' : 'Delete Opportunity'}`);

// 6. Cuadratura por entidades Fix
code = code.replace(/<div className="text-xs font-bold text-slate-600 truncate pr-3 select-all">\s*\{opp\.title\}\s*<\/div>/g,
`<div className="flex flex-col truncate pr-3">
   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{opp.client?.name || ""}</span>
   <span className="text-xs font-bold text-slate-600 select-all">{opp.title}</span>
</div>`);

fs.writeFileSync('src/app/page.tsx', code);
console.log('Fixed applied');

const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldFunc1 = \  // Function to format money globally
  const formatCurrency = (val: number | string) => {
     const n = typeof val === 'string' ? parseFloat(val.replace(/[^\\\\d.-]/g, '')) : Number(val);
     if (isNaN(n)) return '';
     return userCurrency === 'USD' 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) + ' USD'
        : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  };\;

const oldFunc2 = \  // Function to format money globally
  const formatCurrency = (val: number | string) => {
     const n = typeof val === 'string' ? parseFloat(val.replace(/[^\\d.-]/g, '')) : Number(val);
     if (isNaN(n)) return '';
     return userCurrency === 'USD' 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) + ' USD'
        : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  };\;

const newFunc = \  // Function to format money globally
  const formatCurrency = (val: number | string) => {
     const n = typeof val === 'string' ? parseFloat(val.replace(/[^\\\\d.-]/g, '')) : Number(val);
     if (isNaN(n)) return userCurrency === 'USD' ? 'USD 0' : '$ 0';
     const formattedNumber = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(n);
     return userCurrency === 'USD' ? \\\USD \\\\\\ : \\\$ \\\\\\;
  };\;

if (code.includes(oldFunc1)) {
    code = code.replace(oldFunc1, newFunc);
} else if (code.includes(oldFunc2)) {
    code = code.replace(oldFunc2, newFunc);
} else {
    // Attempt fallback replace
    code = code.replace(/\\/\\/ Function to format money globally[\\s\\S]*?maximumFractionDigits: 0 \\}\\)\\.format\\(n\\);\\s*\\};/, newFunc);
}

// Global Total Usd (Line 3056, 3124)
code = code.replace(/\\$\\{globalTotalUsd\\.toLocaleString\\('en-US'\\)\\}(<span className="text-xl">\\s*USD<\\/span>)/g, "{formatCurrency(globalTotalUsd)}");
code = code.replace(/\\$\\{globalTotalUsd\\.toLocaleString\\('en-US'\\)\\}\\s*USD/g, "{formatCurrency(globalTotalUsd)}");

// c.totalValueUsd (Line 3102)
code = code.replace(/\\$\\{c\\.totalValueUsd\\.toLocaleString\\('en-US'\\)\\}/g, "{formatCurrency(c.totalValueUsd)}");

// opp.amountUsd (Line 2394, 3113)
code = code.replace(/\\$\\{opp\\.amountUsd\\.toLocaleString\\('en-US'\\)\\}/g, "{formatCurrency(opp.amountUsd)}");

// oppDetails.amountUsd (Line 2514)
code = code.replace(/\\$\\{oppDetails\\.amountUsd\\?\\.toLocaleString\\('en-US'\\) \\|\\| 0\\}/g, "{formatCurrency(oppDetails.amountUsd)}");

fs.writeFileSync('src/app/page.tsx', code);
console.log("SUCCESS");

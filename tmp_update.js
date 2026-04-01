const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add Lucide icons
code = code.replace(/Database, QrCode \} from 'lucide-react'/g, "Database, QrCode, HelpCircle } from 'lucide-react'");

// Add states
code = code.replace(
  "const [showDayTasksModal, setShowDayTasksModal] = useState(false);",
  "const [showDayTasksModal, setShowDayTasksModal] = useState(false);\n  const [showVoiceHelpModal, setShowVoiceHelpModal] = useState(false);\n  const [userCurrency, setUserCurrency] = useState('USD');"
);

// Add currency getter when loading user profile or onboarding
code = code.replace(
  "if (data.user.country) setUserCountry(getFlagCode(data.user.country));",
  "if (data.user.country) setUserCountry(getFlagCode(data.user.country));\n          const sc = localStorage.getItem('easy_currency');\n          if (sc) setUserCurrency(sc);"
);

let selectCountryBlock = \
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{lang === 'es' ? 'Moneda Local' : 'Local Currency'}</label>
                        <div className="relative">
                          <select 
                            value={userCurrency}
                            onChange={(e) => { setUserCurrency(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('easy_currency', e.target.value); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-5 pr-10 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:border-corporate-purple shadow-sm appearance-none cursor-pointer"
                          >
                            <option value="USD">USD ($ Dólares)</option>
                            <option value="LOCAL">LOCAL ($ Pesos)</option>
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                            ?
                          </div>
                        </div>
                     </div>
\;

code = code.replace("                     <div className=\\"space-y-2\\">\\n                        <label className=\\"text-xs font-bold text-slate-400 uppercase tracking-wider ml-2\\">{lang === 'es' ? 'URL del Mandante' : 'Client Website URL'}</label>", selectCountryBlock + "\\n                     <div className=\\"space-y-2\\">\\n                        <label className=\\"text-xs font-bold text-slate-400 uppercase tracking-wider ml-2\\">{lang === 'es' ? 'URL del Mandante' : 'Client Website URL'}</label>");

const formatFunc = \
  const formatCurrency = (val) => {
     const n = typeof val === 'string' ? parseFloat(val.replace(/[^\\\\d.-]/g, '')) : Number(val);
     if (isNaN(n)) return '';
     return userCurrency === 'USD' 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) + ' USD'
        : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  };
\;
code = code.replace("export default function Home() {", "export default function Home() {\\n" + formatFunc);

code = code.replace(/\\{totalPipeline\\.toLocaleString\\('en-US'\\)\\}\\s*<span[^>]*>USD<\\/span>/g, "{formatCurrency(totalPipeline)}");
code = code.replace(/\\{(\\w+)\\.toLocaleString\\('en-US'\\)\\}\\s*<span[^>]*>USD<\\/span>/g, "{formatCurrency()}");
code = code.replace(/\\{(\\w+\\.amountUsd)\\}\\s*<span[^>]*>USD<\\/span>/g, "{formatCurrency()}");
code = code.replace(/\\{c\\.totalValueUsd\\.toLocaleString\\('en-US'\\)\\}\\s*USD/g, "{formatCurrency(c.totalValueUsd)}");
code = code.replace(/\\{opp\\.amountUsd\\.toLocaleString\\('en-US'\\)\\}\\s*USD/g, "{formatCurrency(opp.amountUsd)}");
// Some amounts might be like \\ USD\ Note the backticks! Oh wait, they were in pure curly braces usually. Let's do a strict match on \USD\ in JSX text.
code = code.replace(/<p className="text-[#1E3A8A] text-\\[10px\\] font-extrabold uppercase tracking-tight pb-0 leading-none">\\{(\\w+\\.amountUsd)\\} USD<\\/p>/g, '<p className="text-[#1E3A8A] text-[10px] font-extrabold uppercase tracking-tight pb-0 leading-none">{formatCurrency()}</p>');


let mic1 = \
<div className="pointer-events-auto flex justify-center items-end relative mb-2 gap-4">
    <motion.button onClick={()=>setShowVoiceHelpModal(true)} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 z-10">
        <HelpCircle size={18} />
    </motion.button>
    <motion.button 
      onClick={() => handleMicClick('activity')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] bg-corporate-purple text-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgb(124,58,237,0.4)] z-10"
    >
       <Mic size={28} className="sm:w-8 sm:h-8" />
    </motion.button>
    
    <motion.button 
      onClick={() => setShowActionModal(true)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-slate-200 text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 z-10"
    >
       <Keyboard size={18} className="sm:w-5 sm:h-5" />
    </motion.button>
</div>
\;
code = code.replace(/<div className="pointer-events-auto flex items-end justify-center relative mb-2">[\\s\\S]*?<Keyboard size=\\{18\\} className="sm:w-5 sm:h-5" \\/>\\s*<\\/motion\\.button>\\s*<\\/div>/, mic1);


let contextualMicFind = \<div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
                  <div className="mb-2 w-max">
                     <span className={\\\	ext-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white border border-white/20 \\\\\\}>
                        {selectedOpportunity ? 'Nota Oportunidad' : 'Nota Cliente'}
                     </span>
                  </div>
                  <motion.button \;

let contextualMicRepl = \<div className="absolute bottom-10 right-6 z-20 flex flex-col items-end">
                  <div className="mb-2 w-max">
                     <span className={\\\	ext-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white border border-white/20 \\\\\\}>
                        {selectedOpportunity ? 'Nota Oportunidad' : 'Nota Cliente'}
                     </span>
                  </div>
                  <div className="flex items-center gap-3">
                      <motion.button onClick={()=>setShowVoiceHelpModal(true)} whileHover={{scale: 1.1}} whileTap={{scale: 0.9}} className="w-10 h-10 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 shadow-slate-400">
                          <HelpCircle size={18} />
                      </motion.button>
                      <motion.button \;

code = code.replace(contextualMicFind, contextualMicRepl);

code = code.replace('className="absolute bottom-0 left-0 w-full bg-gradient-to-t', 'className="absolute bottom-8 sm:bottom-4 left-0 w-full bg-gradient-to-t');


let voiceHelpModal = \
          {/* VOICE HELP MODAL */}
          {showVoiceHelpModal && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
               onClick={() => setShowVoiceHelpModal(false)}
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                 className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl flex flex-col relative border border-slate-100"
                 onClick={e => e.stopPropagation()}
               >
                 <button 
                    onClick={() => setShowVoiceHelpModal(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                 >
                    <X size={18} />
                 </button>
                 
                 <div className="w-10 h-10 bg-corporate-purple/10 rounded-full flex items-center justify-center mb-4">
                    <Mic size={20} className="text-corporate-purple" />
                 </div>
                 
                 <h3 className="text-[17px] font-black text-[#1E3A8A] uppercase tracking-wider mb-2">
                    {lang === 'es' ? 'Comandos de Voz' : 'Voice Commands'}
                 </h3>
                 <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-6">
                    {lang === 'es' 
                       ? 'Usa el micrófono para agilizar tus tareas. El sistema identificará clientes, fechas e intenciones automáticamente. Ejemplos:'
                       : 'Use the microphone to speed up your workflow. The system detects clients, dates, and intent automatically. Examples:'}
                 </p>

                 <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm relative overflow-hidden group">
                       <span className="text-[10px] text-corporate-purple font-black uppercase tracking-widest block mb-1">?? Agendar Cita</span>
                       <p className="text-[13px] font-bold text-slate-700 italic">"Reunión con Transportes JM el próximo martes al mediodía para revisar cotización."</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm relative overflow-hidden group">
                       <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest block mb-1">?? Registrar Actividad</span>
                       <p className="text-[13px] font-bold text-slate-700 italic">"Visité la bodega central. Me pidieron enviar detalles del panel solar MAÑANA."</p>
                    </div>
                 </div>
               </motion.div>
            </motion.div>
          )}
          
          {/* DAY TASKS MODAL */}
          {showDayTasksModal && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center sm:justify-center"
               onClick={() => setShowDayTasksModal(false)}
             >
                <motion.div
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-white w-full sm:max-w-md h-[70vh] sm:h-[60vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col relative"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden" />
                  <div className="flex items-center justify-between px-6 pt-2 pb-4 border-b border-slate-100">
                     <h3 className="font-extrabold text-[#1E3A8A] text-lg uppercase tracking-wider">{lang === 'es' ? 'Tareas del Día' : 'Daily Tasks'}</h3>
                     <button onClick={() => setShowDayTasksModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><X size={18} className="text-slate-500" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                     {selectedDayTasks.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm mt-8">{lang === 'es' ? 'No hay compromisos este día' : 'No tasks on this day'}</p>
                     ) : (
                        selectedDayTasks.map(task => {
                           const opp = opportunities.find(o => o.id === task.opportunityId);
                           const client = clients.find(c => c.id === task.clientId || (opp && opp.clientId === c.id));
                           return (
                               <motion.div key={task.id} className="flex flex-col gap-1 p-3 rounded-2xl border shadow-sm border-slate-200 relative overflow-hidden group hover:border-corporate-purple/30 cursor-pointer" onClick={() => { setShowDayTasksModal(false); setEditingTask(task); setDraftAction(task.title || ''); setDraftActivity(task.content || ''); setDraftDate(task.date || ''); setShowActionModal(true); }}>
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase tracking-widest mb-1 text-[#F59E0B]">COMPROMISO</span>
                                      <span className="font-black text-base text-[#1E3A8A] mb-1">{task.title}</span>
                                      {(client || opp) && (
                                         <div className="flex flex-col gap-1 mt-1.5">
                                            {client && <span className="text-[9px] text-blue-600 uppercase tracking-widest font-black flex items-center gap-1 bg-blue-100/50 px-1.5 py-0.5 rounded shrink-0 max-w-fit flex-wrap border border-blue-200/50">?? CLIENTE: {client.name}</span>}
                                            {opp && <span className="text-[9px] text-corporate-purple uppercase tracking-widest font-black flex items-center gap-1 bg-corporate-purple/10 px-1.5 py-0.5 rounded shrink-0 max-w-fit flex-wrap border border-corporate-purple/20">?? PROYECTO: {opp.title || opp.name}</span>}
                                            {opp && opp.status && <span className={\	ext-[9px] uppercase tracking-widest font-black flex items-center gap-1 px-1.5 py-0.5 rounded shrink-0 max-w-fit flex-wrap border \\}>?? ESTADO: {opp.status}</span>}
                                         </div>
                                      )}
                                   </div>
                               </motion.div>
                           );
                        })
                     )}
                  </div>
                </motion.div>
             </motion.div>
          )}
\;
code = code.replace("{/* VIRTUAL QR MODAL TO SHARE APP */}", voiceHelpModal + "\\n\\n          {/* VIRTUAL QR MODAL TO SHARE APP */}");

fs.writeFileSync('src/app/page.tsx', code);
console.log("REPLACEMENT COMPLETE");

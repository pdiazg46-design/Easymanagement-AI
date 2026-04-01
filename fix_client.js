const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const searchClient = `                                                 <div className="text-xs font-bold text-slate-600 pr-3 select-all flex flex-col items-start leading-tight" style={{wordBreak: "break-word"}}>
                                                    <span>{opp.title}</span>
                                                    {(() => {
                                                        const client = clients.find(cl => cl.id === opp.clientId);
                                                        return client ? <span className="text-[9px] font-semibold text-slate-400 mt-0.5 whitespace-normal leading-tight">{client.name}</span> : null;
                                                    })()}
                                                 </div>`;

const replaceClient = `                                                 <div className="text-xs font-bold text-slate-600 pr-3 select-all flex flex-col items-start leading-tight" style={{wordBreak: "break-word"}}>
                                                    <span>{opp.title}</span>
                                                    {opp.client?.name && (
                                                       <span className="text-[9px] font-semibold text-slate-400 mt-0.5 whitespace-normal leading-tight">
                                                          {opp.client.name}
                                                       </span>
                                                    )}
                                                 </div>`;

code = code.replace(searchClient, replaceClient);
fs.writeFileSync('src/app/page.tsx', code);
console.log('SUCCESS');

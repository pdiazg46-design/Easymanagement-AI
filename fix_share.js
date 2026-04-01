const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add Client Name
const searchClient = `                                                 <div className="text-xs font-bold text-slate-600 truncate pr-3 select-all">
                                                    {opp.title}
                                                 </div>`;
const replaceClient = `                                                 <div className="text-xs font-bold text-slate-600 pr-3 select-all flex flex-col items-start leading-tight" style={{wordBreak: "break-word"}}>
                                                    <span>{opp.title}</span>
                                                    {(() => {
                                                        const client = clients.find(cl => cl.id === opp.clientId);
                                                        return client ? <span className="text-[9px] font-semibold text-slate-400 mt-0.5 whitespace-normal leading-tight">{client.name}</span> : null;
                                                    })()}
                                                 </div>`;
code = code.replace(searchClient, replaceClient);


// 2. Fix the Share Action
const searchShare = `                                  if (navigator.share) {
                                      navigator.share({
                                          title: 'Informe Ejecutivo MACRO - Confidencial',
                                          text: 'Enlace cifrado del Informe de Gestión. Requiere contraseña para visualización en pantalla.',
                                          url: secureLink
                                      }).then(() => {
                                          setShowReportPasswordForm(false);
                                          setReportPassword('');
                                      }).catch((error) => {
                                          console.log("Share API error", error);
                                          navigator.clipboard.writeText(secureLink).then(() => {
                                             alert('Enlace copiado al portapapeles:\\n' + secureLink);
                                          });
                                          setShowReportPasswordForm(false);
                                      });
                                  } else {
                                      navigator.clipboard.writeText(secureLink).then(() => {
                                          alert('Enlace seguro copiado al portapapeles:\\n' + secureLink);
                                          setShowReportPasswordForm(false);
                                      }).catch(() => {
                                          alert('Tu navegador no soporta copiado. Enlace: ' + secureLink);
                                      });
                                  }`;

const replaceShare = `                                  const doFallback = async () => {
                                      try {
                                          await navigator.clipboard.writeText(secureLink);
                                          alert('Enlace cifrado copiado en tu portapapeles.\\n\\nPuedes pegarlo donde necesites.\\n\\nEnlace: ' + secureLink);
                                      } catch (e) {
                                          prompt('Tu navegador bloquea el copiado automático. Cópialo acá manualmente:', secureLink);
                                      }
                                      setShowReportPasswordForm(false);
                                      setReportPassword('');
                                  };

                                  if (navigator.share && typeof navigator.share === 'function') {
                                      try {
                                          await navigator.share({
                                              title: 'Informe Ejecutivo MACRO - Confidencial',
                                              text: 'Enlace cifrado del Informe de Gestión. Requiere contraseña para visualización en pantalla.',
                                              url: secureLink
                                          });
                                          setShowReportPasswordForm(false);
                                          setReportPassword('');
                                      } catch (error) {
                                          if (error && error.name === 'AbortError') {
                                              setShowReportPasswordForm(false);
                                              setReportPassword('');
                                          } else {
                                              await doFallback();
                                          }
                                      }
                                  } else {
                                      await doFallback();
                                  }`;

code = code.replace(searchShare, replaceShare);

// Ensure the onClick handler has async
code = code.replace(`                              onClick={() => {
                                 const secureToken = btoa(reportPassword).substring(0,12);`, `                              onClick={async () => {
                                 const secureToken = btoa(reportPassword).substring(0,12);`);

fs.writeFileSync('src/app/page.tsx', code);
console.log('SUCCESS');

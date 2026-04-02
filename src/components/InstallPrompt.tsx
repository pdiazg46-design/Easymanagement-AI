"use client";

import { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, ArrowUp, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Evita parpadeo inicial
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Detectar si está en PWA / Home Screen
    const isStandAloneMatch = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isStandAloneMatch);

    // Si no está instalada, mostramos el aviso tras 1.5s
    if (!isStandAloneMatch) {
       setTimeout(() => setShowPrompt(true), 1500);
    }

    // Android: Capturar evento de instalación nativo
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-[32px] p-8 max-w-[340px] w-full text-center shadow-2xl relative"
      >
        <button onClick={() => setShowPrompt(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600">
           <X className="w-5 h-5"/>
        </button>

        <div className="w-20 h-20 bg-indigo-100 rounded-3xl mx-auto flex items-center justify-center mb-6 ring-8 ring-indigo-50">
          <Download className="w-10 h-10 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Instala la App</h2>
        <p className="text-slate-600 mb-8 text-sm leading-relaxed">
          Para acceder al sistema corporativo y recibir notificaciones de seguridad, debes instalar Easy Management en tu celular.
        </p>

        {isIOS ? (
          <div className="bg-indigo-50/80 rounded-2xl p-5 text-left space-y-4 border border-indigo-100/50">
            <div className="flex items-center gap-3 text-indigo-900 border-b border-indigo-100 pb-3">
              <div className="min-w-[28px] h-7 bg-white rounded-lg flex items-center justify-center shadow-sm font-semibold text-sm">1</div>
              <p className="text-sm font-medium">Toca Compartir <Share2 className="inline w-4 h-4 ml-1 text-indigo-600" /></p>
            </div>
            <div className="flex items-center gap-3 text-indigo-900 border-b border-indigo-100 pb-3">
              <div className="min-w-[28px] h-7 bg-white rounded-lg flex items-center justify-center shadow-sm font-semibold text-sm">2</div>
              <p className="text-sm font-medium">Desliza abajo y toca<br/><strong className="text-indigo-700">"Agregar a Inicio"</strong> <PlusSquare className="inline w-4 h-4 ml-1 text-indigo-600" /></p>
            </div>
            <div className="flex items-center gap-3 text-indigo-900">
              <div className="min-w-[28px] h-7 bg-white rounded-lg flex items-center justify-center shadow-sm font-semibold text-sm">3</div>
              <p className="text-sm font-medium">Confirma tocando <br/><strong className="text-indigo-700">"Agregar"</strong></p>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold shadow-[0_8px_16px_-6px_rgba(79,70,229,0.4)] active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            Instalar Aplicación
          </button>
        )}

      </motion.div>
      
      {isIOS && (
        <motion.div 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: [0, 10, 0] }}
           transition={{ repeat: Infinity, duration: 1.5 }}
           className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 drop-shadow-lg flex flex-col items-center"
        >
           <span className="text-xs font-bold uppercase tracking-widest mb-1">Toca aquí</span>
           <ArrowUp className="w-8 h-8 rotate-180" />
        </motion.div>
      )}
    </div>
  );
}

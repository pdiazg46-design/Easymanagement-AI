"use client";
import { useState, useEffect, useRef } from 'react';
import { Mic, Keyboard, Edit2, Signal, Wifi, BatteryFull, Mail, Lock, Fingerprint, UploadCloud, Link as LinkIcon, ArrowRight, Eye, EyeOff, Map as MapIcon, List, Maximize2, Minimize2, X, Calendar, Navigation, Loader2, Phone, MessageCircle, UserX, UserCheck, MapPin, ChevronRight, Share2, FileText, Download, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

export default function Home() {
  const [lang, setLang] = useState<'es'|'en'>('es');
  const t = {
     es: { 
        pipeline: 'Pipeline Regional', activeProj: 'Proyectos Activos', history: 'Historial', opps: 'Oportunidades',
        summary: 'Resumen Global', execReport: 'INFORME EJECUTIVO', performance: 'Desempeño Regional',
        quickAdd: 'AGREGAR ACTIVIDAD RÁPIDA (VOZ O TEXTO)', listening: 'Te EScucho', stop: 'Detener Grabación',
        processing: 'Procesando Voz...',
        macroTitle: 'Informe de Gestión', totalLatam: 'Total Pipeline Latam', active: 'Proyectos Activos', heatmap: 'Mapa de Calor (Heatmap)', concentración: 'Concentración',
        high: 'Alta', med: 'Media', low: 'Baja', entitySquare: 'Cuadratura por Entidades', dist: 'Distribuidor', direct: 'Venta Directa',
        cliente: 'Cliente', totalCalc: 'Total Calculado', secureLink: 'Generar Enlace Seguro (PDF)', passText: 'Contraseña de Seguridad', cancel: 'Cancelar',
        reportWarning: '*El PDF en la nube no permitirá descargas ni copias. Solo habilitado para lectura en pantalla.',
        shareGen: 'Generar y Compartir Enlace', map: 'Mapa', 
        histWon: 'Proyectos Ganados Históricos', histSub: 'Análisis de negocios cerrados.',
        week: 'Semana en curso', month: 'Mes en curso', lastMonth: 'Mes anterior', year: 'Año en curso', lastYear: 'Año anterior', allTime: 'Todos los tiempos'
     },
     en: {
        pipeline: 'Regional Pipeline', activeProj: 'Active Projects', history: 'History', opps: 'Opportunities',
        summary: 'Global Summary', execReport: 'EXECUTIVE REPORT', performance: 'Regional Performance',
        quickAdd: 'QUICK LOG ACTIVITY (VOICE/TEXT)', listening: 'I am Listening', stop: 'Stop Recording',
        processing: 'Processing Voice...',
        macroTitle: 'Management Report', totalLatam: 'Total Latam Pipeline', active: 'Active Projects', heatmap: 'Regional Heatmap', concentración: 'Concentration',
        high: 'High', med: 'Medium', low: 'Low', entitySquare: 'Entity Breakdown', dist: 'Distributor', direct: 'Direct Sales',
        cliente: 'Client', totalCalc: 'Calculated Total', secureLink: 'Generate Secure Link (PDF)', passText: 'Security Password', cancel: 'Cancel',
        reportWarning: '*The cloud PDF will not allow downloads or copies. Screen-reading only.',
        shareGen: 'Generate and Share Link', map: 'Map',
        histWon: 'Historical Won Deals', histSub: 'Closed deals analysis.',
        week: 'Current Week', month: 'Current Month', lastMonth: 'Last Month', year: 'Current Year', lastYear: 'Last Year', allTime: 'All Time'
     }
  };
  const [currentView, setCurrentView] = useState<'login' | 'onboarding' | 'dashboard'>('login');
  
  // Login & Config states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isProUser, setIsProUser] = useState(false);


  const [userCountry, setUserCountry] = useState('cl');
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [historialViewMode, setHistorialViewMode] = useState<'list'|'map'>('list');
  const [historialTimeframe, setHistorialTimeframe] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportPasswordForm, setShowReportPasswordForm] = useState(false);
  const [reportPassword, setReportPassword] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleSignup = async () => {
    if (!password) {
       setAuthError('Debes ingresar una contraseña');
       return;
    }
    if (!isLoginMode && password !== confirmPassword) {
       setAuthError('Las contraseñas no coinciden. Intenta de nuevo.');
       return;
    }
    if (password.length < 6) {
       setAuthError('La contraseña debe tener al menos 6 caracteres');
       return;
    }
    
    setAuthError(lang === 'es' ? 'Validando en la nube...' : 'Validating in Cloud...');
    
    try {
      let res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data = await res.json();
      
      if (!res.ok) {
        if (data.error === "El usuario ya existe") {
           // Intentar Login
           res = await fetch('/api/auth/login', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email, password })
           });
           data = await res.json();
           
           if (!res.ok) {
              setAuthError(data.error || 'Contraseña incorrecta');
              return;
           }
        } else {
           setAuthError(data.error || 'Error al conectar');
           return;
        }
      }
      
      setAuthError('');
      const userIsPro = data.user?.isPro === true;
      setIsProUser(userIsPro);
      localStorage.setItem('easy_isPro', userIsPro ? 'true' : 'false');
      localStorage.setItem('easy_currentView', 'dashboard');
      setCurrentView('dashboard');
      
    } catch (e) {
      setAuthError('Error de red. Revisa tu conexión.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dashboard states
  const [activeTab, setActiveTab] = useState('oportunidades');
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [regionalViewMode, setRegionalViewMode] = useState<'list' | 'map'>('list');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  
  // Estados para el flujo de Voz IA (Local RAM)
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{name: string, country: string} | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{id: string, title: string, amount: string} | null>(null);
  const [newTimelineItems, setNewTimelineItems] = useState<any[]>([]);
  const [newCountryTimelineItems, setNewCountryTimelineItems] = useState<any[]>([]);
  const [uploadedCatalogs, setUploadedCatalogs] = useState<{name: string, size: string}[]>([]);
  
  // Estados para simular Inputs del Formulario Action Modal
  const [draftActivity, setDraftActivity] = useState("- Cliente solicita renovar equipamiento industrial de la planta norte.\n- Interesado en revisión de tableros.");
  const [draftAction, setDraftAction] = useState("Enviar propuesta con Kit Hubbell Industrial");

  // PERSISTENCIA DE DATOS DE LA SESIÓN DE PRUEBA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('easy_currentView');
      const savedPro = localStorage.getItem('easy_isPro');
      if (savedView === 'dashboard') setCurrentView('dashboard');
      else if (savedView === 'onboarding') setCurrentView('onboarding');
      setIsProUser(savedPro === 'true');

      const savedData = localStorage.getItem('easy_demo_data');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.clientLogo) setClientLogo(data.clientLogo);
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
          if (data.todayTasks) setTodayTasks(data.todayTasks);
          if (data.newTimelineItems) setNewTimelineItems(data.newTimelineItems);
          if (data.newCountryTimelineItems) setNewCountryTimelineItems(data.newCountryTimelineItems);
        } catch(e){}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('easy_demo_data', JSON.stringify({
        clientLogo, avatarUrl, todayTasks, newTimelineItems, newCountryTimelineItems
      }));
    }
  }, [clientLogo, avatarUrl, todayTasks, newTimelineItems, newCountryTimelineItems]);

  // Referencia para la API nativa del navegador
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  // Inicializar Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === 'es' ? 'es-CL' : 'en-US';
        
        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript + ' ';
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }
          
          if (currentFinal) {
             finalTranscriptRef.current += currentFinal;
          }
          setDraftActivity((finalTranscriptRef.current + currentInterim).trim());
        };

        recognition.onerror = (event: any) => {
          console.error("Mic error:", event.error);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  const handleMicClick = () => {
    setEditingTask(null);
    
    if (!isRecording) {
      setIsRecording(true);
      finalTranscriptRef.current = '';
      setDraftActivity("");
      setDraftAction(lang === 'es' ? "Acción registrada en terreno" : "Field recorded action");
      
      // Iniciar escucha real
      if (recognitionRef.current) {
         try { recognitionRef.current.start(); } catch(e){}
      }
    } else {
      setIsRecording(false);
      setIsProcessingVoice(true);
      
      // Detener escucha real
      if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e){}
      }

      // Simulamos latencia de procesamiento estructural de la IA
      setTimeout(() => {
        setIsProcessingVoice(false);
        if (!finalTranscriptRef.current && draftActivity.length === 0) {
           setDraftActivity(lang === 'es' ? "No se detectó audio (Permiso denegado o micrófono apagado). Escribe manualmente." : "No audio detected. Please type manually.");
        }
        setShowActionModal(true);
      }, 1500);
    }
  };

  const handleSaveLocal = () => {
    setShowActionModal(false);
    setShowToast(true);
    
    if (!editingTask) {
      // IA Cross-referencing: Si se generó un nuevo compromiso para "hoy", se inyecta dinámicamente
      setTodayTasks(prev => [{
        id: Date.now(),
        title: draftAction,
        time: 'Pendiente',
        type: 'Reunión'
      }, ...prev]);

      if (selectedClient) {
         setNewTimelineItems(prev => [{
            id: 4 + prev.length,
            title: draftAction,
            content: draftActivity
         }, ...prev]);
      } else if (selectedCountry) {
         // Si NO hay cliente específico pero SÍ hay un país, es una bitácora regional genérica
         const now = new Date();
         const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} hrs`;
         
         setNewCountryTimelineItems(prev => [{
            id: Date.now(),
            date: `Hoy, ${timeString}`,
            title: draftAction,
            content: draftActivity
         }, ...prev]);
      }

    } else {
      // Logic para actualizar la tarea existente iría aquí en el backend
      setEditingTask(null);
    }

    // Ocultar toast de confirmación luego de 3 segundos
    setTimeout(() => setShowToast(false), 3000);
  };

  // Lógica reutilizable del Mapa Geográfico
  const renderGeoMap = (isFullscreen: boolean) => {
    const activeMarkers = [
      { name: 'Chile', coordinates: [-71.54, -35.67], value: '$0' },
      { name: 'Perú', coordinates: [-75.01, -9.18], value: '$0' },
      { name: 'Colombia', coordinates: [-74.29, 4.57], value: '$0' },
      { name: 'Ecuador', coordinates: [-78.18, -1.83], value: '$0' }
    ];
    
    const minX = Math.min(...activeMarkers.map(m => m.coordinates[0]));
    const maxX = Math.max(...activeMarkers.map(m => m.coordinates[0]));
    const minY = Math.min(...activeMarkers.map(m => m.coordinates[1]));
    const maxY = Math.max(...activeMarkers.map(m => m.coordinates[1]));
    
    const autoCenterX = (minX + maxX) / 2;
    const autoCenterY = (minY + maxY) / 2;
    
    const maxSpread = Math.max(maxX - minX, maxY - minY);
    // Ajustamos el zoom dinámico: la vista fullscreen tiene formato retrato, requiere menos zoom para que no se corte arriba/abajo
    const autoZoom = maxSpread > 0 ? Math.min(isFullscreen ? 4 : 6, (isFullscreen ? 45 : 60) / maxSpread) : 2;

    return (
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: isFullscreen ? 320 : 280 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup 
          center={[autoCenterX, autoCenterY]} 
          zoom={autoZoom} 
          minZoom={1} 
          maxZoom={8} 
          translateExtent={[[-500, -500], [500, 500]]}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryData = [
                  { name: 'Chile', color: '#22C55E' },
                  { name: 'Peru', color: '#84CC16' },
                  { name: 'Colombia', color: '#F59E0B' },
                  { name: 'Ecuador', color: '#EF4444' }
                ].find(c => c.name === geo.properties.name);
                
                const fill = countryData ? countryData.color : "#E2E8F0"; 
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth={0.7 / autoZoom}
                    style={{
                      default: { outline: "none", transition: "all 300ms ease" },
                      hover: { filter: "brightness(1.1)", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {activeMarkers.map(({ name, coordinates, value }) => (
            <Marker key={name} coordinates={coordinates as [number, number]} onClick={() => setSelectedCountry(name)}>
              <g style={{ cursor: "pointer" }}>
                <rect x="-24" y="-15" width="48" height="28" fill="#ffffff" fillOpacity="0.95" rx="6" stroke="#cbd5e1" strokeWidth={0.5 / autoZoom} className="drop-shadow-sm" />
                <text textAnchor="middle" y="-3" style={{ fill: "#64748b", fontSize: 5.5, fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", pointerEvents: "none" }}>
                   {name}
                </text>
                <text textAnchor="middle" y={8.5} style={{ fill: "#0f172a", fontSize: 9, fontWeight: "900", letterSpacing: "-0.2px", pointerEvents: "none" }}>
                   {value}
                </text>
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-white flex flex-col font-sans relative shadow-2xl overflow-hidden">
        {/* CONTENEDOR DE VISTAS */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">

            {/* VISTA 1: CREAR CUENTA / LOGIN */}
            {currentView === 'login' && (
              <motion.div 
                key="login"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col items-center px-8 bg-white overflow-y-auto no-scrollbar pt-12 pb-8"
              >
                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="absolute left-6 top-10 bg-slate-100 text-[#1E3A8A] px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-slate-200 uppercase flex items-center gap-1 z-50">
                   🌐 {lang === 'es' ? 'ES' : 'EN'}
                </button>
                <div className="text-center w-full mb-8 mt-4">
                  <h1 className="text-[#1E3A8A] font-extrabold text-2xl tracking-widest mb-4">EASY MANAGEMENT AI</h1>
                  <img src="/logo_at_sit_full.png" alt="AT-SIT" className="h-16 mx-auto object-contain hover:scale-105 transition-transform" />
                  <p className="text-xs text-corporate-gray mt-2 font-medium tracking-wider">{lang === 'es' ? 'RESPALDO TECNOLÓGICO' : 'TECHNOLOGY BACKBONE'}</p>
                </div>
                
                <div className="w-full space-y-4">
                  <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                     <input 
                       type="email" 
                       placeholder={lang === 'es' ? 'Correo Electrónico' : 'Email Address'} 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-800 focus:outline-none focus:border-corporate-purple focus:ring-1 focus:ring-corporate-purple transition-all shadow-sm" 
                     />
                     {email === 'pdiazg46@gmail.com' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1E3A8A] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                           Admin
                        </div>
                     )}
                  </div>

                  <div className="relative">
                     <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                     <input 
                       type={showPassword ? "text" : "password"} 
                       placeholder={lang === 'es' ? 'Crea tu Contraseña' : 'Create Password'} 
                       value={password}
                       onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-800 focus:outline-none focus:border-corporate-purple focus:ring-1 focus:ring-corporate-purple transition-all shadow-sm" 
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-corporate-purple focus:outline-none"
                     >
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                  </div>

                  <AnimatePresence>
                    {!isLoginMode && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="relative"
                      >
                         <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                         <input 
                           type={showConfirmPassword ? "text" : "password"} 
                           placeholder={lang === 'es' ? 'Repite tu Contraseña' : 'Confirm Password'} 
                           value={confirmPassword}
                           onChange={(e) => { setConfirmPassword(e.target.value); setAuthError(''); }}
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-slate-800 focus:outline-none focus:border-corporate-purple focus:ring-1 focus:ring-corporate-purple transition-all shadow-sm" 
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-corporate-purple focus:outline-none"
                         >
                           {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-full flex justify-end mt-4 mb-3">
                  <span onClick={() => setIsLoginMode(!isLoginMode)} className="text-[11px] text-corporate-purple font-medium cursor-pointer">
                    {isLoginMode ? (lang === 'es' ? 'Crear cuenta nueva' : 'Create an account') : (lang === 'es' ? '¿Deseas iniciar sesión?' : 'Already have an account?')}
                  </span>
                </div>

                <AnimatePresence>
                  {authError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0, y: -5 }} 
                      animate={{ opacity: 1, height: 'auto', y: 0 }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs font-semibold w-full text-center mb-4 bg-red-50 py-2 rounded-lg border border-red-100"
                    >
                       ⚠️ {authError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignup} 
                  className={`w-full bg-corporate-purple text-white font-bold tracking-wide py-4 rounded-full shadow-[0_8px_25px_rgb(124,58,237,0.35)] flex items-center justify-center gap-2 ${authError ? 'mt-0' : 'mt-5'}`}
                >
                  {isLoginMode ? (lang === 'es' ? 'INICIAR SESIÓN' : 'LOGIN') : (lang === 'es' ? 'COMENZAR' : 'START NOW')}
                </motion.button>

                <div className="mt-8 flex flex-col items-center pb-6">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-3">Acceso Biométrico Rápido</span>
                  <motion.div whileHover={{ scale: 1.05 }} className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-corporate-purple cursor-pointer shadow-inner">
                    <Fingerprint size={32} strokeWidth={1.5} />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* VISTA 2: ONBOARDING (FIRST SETUP) */}
            {currentView === 'onboarding' && (
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 flex flex-col px-7 pt-12 bg-white overflow-y-auto pb-10 no-scrollbar"
              >
                 <div className="mb-6">
                   <div className="w-12 h-1 bg-corporate-purple rounded-full mb-6 relative">
                      <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="absolute -right-60 -top-2 bg-slate-100 text-[#1E3A8A] px-2 py-1 rounded-full text-[10px] font-bold shadow-sm border border-slate-200 uppercase flex items-center gap-1">
                         🌐 {lang === 'es' ? 'ES' : 'EN'}
                      </button>
                   </div>
                   <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2 tracking-tight">{lang === 'es' ? 'Configuración de Entorno' : 'Environment Setup'}</h1>
                   <p className="text-sm text-slate-500 leading-relaxed">{lang === 'es' ? 'Ajusta las variables de tu espacio de trabajo y personaliza tu panel de IA.' : 'Customize your workspace variables and set up your AI panel.'}</p>
                 </div>

                 <div className="space-y-5">
                    {/* Input Foto de Perfil */}
                    <div className="flex flex-col items-center justify-center pb-2">
                       <label className="relative w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group shadow-sm z-10 overflow-hidden">
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          {avatarUrl ? (
                             <>
                               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 size={16} className="text-white" />
                               </div>
                             </>
                          ) : (
                             <>
                               <UploadCloud size={20} className="mb-1 text-slate-300 group-hover:text-corporate-purple transition-colors" />
                               <span className="text-[9px] font-semibold text-slate-500 text-center leading-tight uppercase tracking-wider">Tu<br/>Foto</span>
                             </>
                          )}
                       </label>
                    </div>

                    {/* Input País Residencia */}
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{lang === 'es' ? 'País de Residencia' : 'Country of Residence'}</label>
                       <div className="relative">
                         <select 
                           value={userCountry}
                           onChange={(e) => setUserCountry(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-5 pr-10 text-sm font-semibold text-slate-800 transition-all focus:outline-none focus:border-corporate-purple shadow-sm appearance-none cursor-pointer"
                         >
                           <option value="cl">Chile</option>
                           <option value="pe">Perú</option>
                           <option value="co">Colombia</option>
                           <option value="ec">Ecuador</option>
                           <option value="mx">México</option>
                         </select>
                         <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                           ▼
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{lang === 'es' ? 'URL del Mandante' : 'Client Website URL'}</label>
                       <div className="relative">
                         <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-corporate-purple" size={18} />
                         <input type="url" placeholder="https://cliente.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-800 transition-all focus:outline-none focus:border-corporate-purple shadow-sm" />
                       </div>
                       <p className="text-[10px] text-slate-400 px-2 leading-tight">{lang === 'es' ? 'Esta URL será procesada por nuestro motor de IA para asistir tus gestiones.' : 'This URL will be processed by our AI engine to assist your daily management.'}</p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{lang === 'es' ? 'Logo Corporativo' : 'Corporate Logo'}</label>
                       <label className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden group h-36">
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          {clientLogo ? (
                             <>
                               <img src={clientLogo} alt="Logo Mandante" className="h-full w-full object-contain" />
                               <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 size={24} className="text-white mb-2" />
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">Cambiar Logo</span>
                               </div>
                             </>
                          ) : (
                             <>
                                <UploadCloud size={36} className="mb-3 text-slate-300 group-hover:text-corporate-purple transition-colors" />
                                <span className="text-sm font-semibold text-slate-600 mb-1">Subir Imagen</span>
                                <span className="text-[10px]">PNG o JPG (Max 2MB)</span>
                             </>
                          )}
                       </label>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                       <div className="flex justify-between items-center ml-2 mb-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><UploadCloud size={14}/> Base de Conocimiento (RAG)</label>
                         <span className="bg-corporate-purple/10 text-corporate-purple text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">NUEVO</span>
                       </div>
                       <p className="text-[10px] text-slate-500 px-2 leading-tight mb-3">Sube catálogos PDF o listas de precio. La IA los leerá para sugerirte productos y armar kits inteligentemente.</p>
                       
                       <label className="border-2 border-dashed border-corporate-purple/30 bg-corporate-purple/5 rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-corporate-purple/10 transition-colors">
                          <input type="file" accept=".pdf,.csv,.xlsx" className="hidden" multiple onChange={(e) => {
                             if(e.target.files && e.target.files.length > 0) {
                               const arr = Array.from(e.target.files).map(f => ({ name: f.name, size: '2.4 MB' }));
                               setUploadedCatalogs(prev => [...prev, ...arr]);
                             }
                          }} />
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-corporate-purple shrink-0">
                             <UploadCloud size={18} />
                          </div>
                          <div className="flex-1">
                             <span className="text-xs font-bold text-slate-700 block">Subir Documento</span>
                             <span className="text-[9px] text-slate-500 uppercase tracking-widest">PDF, Excel, CSV</span>
                          </div>
                       </label>
                       
                       {uploadedCatalogs.length > 0 && (
                          <div className="mt-2 space-y-2">
                             {uploadedCatalogs.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm">
                                   <div className="flex items-center gap-2 overflow-hidden">
                                      <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                         <span className="text-[8px] font-black">PDF</span>
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-700 truncate">{cat.name}</span>
                                   </div>
                                   <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{cat.size}</span>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="mt-8 mb-10 w-full flex justify-end shrink-0">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentView('dashboard')} 
                      className="bg-[#1E3A8A] text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-blue-900/20 flex items-center gap-2 tracking-wide"
                    >
                      FINALIZAR
                      <ArrowRight size={18} />
                    </motion.button>
                 </div>
              </motion.div>
            )}

            {/* VISTA 3: DASHBOARD */}
            {currentView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col bg-white"
              >
                {/* HEADER DUAL BRANDING */}
                <div className="px-5 pt-2 pb-4 flex justify-between items-center z-10 shrink-0">
                  <div className="relative group flex items-center w-1/3">
                    <div className="w-full h-12 flex items-center opacity-90 transition-opacity">
                       {clientLogo ? (
                          <img src={clientLogo} alt="Cliente" className="max-w-[110px] h-10 object-contain object-left" />
                       ) : (
                          <div className="w-14 h-14 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                             <span className="text-[10px] leading-tight text-center font-medium">Falta<br/>Logo</span>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Centro: Residencia y Avatar del Usuario */}
                  <div className="flex items-center justify-center gap-2 w-1/3">
                     <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 shadow-sm">
                        <img src={`https://flagcdn.com/w20/${userCountry}.png`} alt="Bandera" className="w-4 h-auto rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.2)]" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{userCountry}</span>
                     </div>
                     <div 
                        onClick={() => setCurrentView('onboarding')}
                        className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-200 transition-colors relative group"
                     >
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                          {avatarUrl ? (
                             <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-xs font-bold text-slate-600">P</span>
                          )}
                        </div>
                     </div>
                  </div>

                  <div className="w-1/3 flex justify-end items-center">
                    <img src="/logo_at_sit_full.png" alt="AT-SIT" className="h-11 max-w-[120px] object-contain object-right" />
                  </div>
                </div>

                {/* Título Central */}
                <div className="pb-4 shrink-0 bg-white flex flex-col items-center justify-center px-4 gap-2 pt-2">
                  <h1 className="text-[#1E3A8A] font-extrabold text-[18px] sm:text-xl tracking-wide text-center">EASY MANAGEMENT AI</h1>
                  <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="bg-slate-50 text-[#1E3A8A] px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border border-slate-200 uppercase flex items-center gap-1 transition-colors hover:bg-slate-100">
                     🌐 {lang === 'es' ? 'ES' : 'EN'}
                  </button>
                </div>

                {/* FREEMIUM TRIAL BANNER */}
                {!isProUser && (
                  <div 
                    onClick={() => setShowSubscriptionModal(true)}
                    className="bg-gradient-to-r from-[#009EE3] to-[#008CC9] text-white px-5 py-2.5 flex justify-between items-center shrink-0 cursor-pointer hover:opacity-90 transition-all shadow-inner mx-5 rounded-2xl mb-4"
                  >
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-tight">Prueba Activa</span>
                         <span className="text-xs font-black">Te quedan 7 días</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-[11px] font-black bg-white text-[#009EE3] px-3 py-1.5 rounded-full shadow-sm">
                         Pasar a PRO ✨
                     </div>
                  </div>
                )}

                {/* CONTENIDO PRINCIPAL SCROLLABLE */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24 flex flex-col gap-6">
                  


                  {/* ALERTA GPS AUTO-DETECCIÓN (SIMULACIÓN IDEAL) */}
                  {/* ALERTA GPS AUTO-DETECCIÓN (Lógica de Proximidad 300m) */}
                  {/* Este bloque solo se renderizará cuando la API devuelva un cliente < 300m. 
                      Por ahora, dejamos la UI completamente limpia cuando no hay nadie. */}
                  {/* 
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: -20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center shadow-lg shadow-emerald-500/10 cursor-pointer hover:bg-emerald-100 transition-all group shrink-0"
                  >
                     <p>Cliente detectado a X metros</p>
                  </motion.div>
                  */}

                  {/* CABECERA RESUMEN Y COMPARTIR */}
                  <div className="flex items-center justify-between mb-0 mt-2">
                     <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t[lang].summary}</h3>
                     <button 
                       onClick={() => setShowReportModal(true)}
                       className="flex items-center gap-1.5 text-[10px] font-bold text-[#1E3A8A] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                     >
                       <Share2 size={12} />
                       {t[lang].execReport}
                     </button>
                  </div>

                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPipelineModal(true)}
                    className="bg-corporate-purple rounded-3xl p-5 shadow-[0_8px_30px_rgb(124,58,237,0.3)] text-white w-full cursor-pointer overflow-hidden relative shrink-0"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 text-left">
                        <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">{t[lang].pipeline}</p>
                        <h2 className="text-3xl font-extrabold tracking-tight">$0 <span className="text-lg font-bold">USD</span></h2>
                      </div>
                      <div className="w-px h-12 bg-white/20 mx-4"></div>
                      <div className="text-center pr-2">
                        <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider mb-1 leading-tight w-20">{t[lang].activeProj.split(' ')[0]}<br/>{t[lang].activeProj.split(' ')[1]}</p>
                        <h2 className="text-3xl font-extrabold pb-0 leading-none">0</h2>
                      </div>
                    </div>
                  </motion.div>

                  <div className="bg-slate-100 rounded-full p-1 flex items-center justify-between w-full shadow-inner border border-slate-200/60 shrink-0">
                    <button 
                      onClick={() => setActiveTab('historial')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === 'historial' ? 'bg-[#1E3A8A] text-white shadow-md' : 'text-slate-500'}`}
                    >
                      {t[lang].history}
                    </button>
                    <button 
                      onClick={() => setActiveTab('oportunidades')}
                      className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === 'oportunidades' ? 'bg-corporate-purple text-white shadow-md' : 'text-slate-500'}`}
                    >
                      {t[lang].opps}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'oportunidades' ? (
                      <motion.div 
                        key="oportunidades" 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{t[lang].performance}</h3>
                            <button 
                              onClick={() => setRegionalViewMode(prev => prev === 'list' ? 'map' : 'list')}
                              className="text-slate-400 hover:text-corporate-purple transition-colors p-1"
                            >
                              {regionalViewMode === 'list' ? <MapIcon size={18} /> : <List size={18} />}
                            </button>
                          </div>
                          
                          {regionalViewMode === 'list' ? (
                            <div className="space-y-4">
                              <p className="text-[11px] text-slate-400 font-medium italic tracking-wide text-center py-4">{lang === 'es' ? 'No hay países con métricas activas' : 'No countries with active metrics'}</p>
                            </div>
                          ) : (
                             <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner cursor-pointer group">
                                {/* Botón Expandir a Pantalla Completa */}
                                <button 
                                   onClick={() => setIsMapFullscreen(true)}
                                   className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-[#1E3A8A] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Maximize2 size={16} strokeWidth={2.5} />
                                </button>
                                
                                {renderGeoMap(false)}
                             </div>
                          )}
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgb(0,0,0,0.04)] border border-slate-100">
                          <div className="flex justify-between items-center mb-5">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{lang === 'es' ? 'Tareas de Hoy (05 May)' : 'Today\'s Tasks (May 05)'}</h3>
                            <button className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-[#1E3A8A] rounded-full border border-slate-200 shadow-sm transition-colors hover:bg-slate-100">{lang === 'es' ? 'VER CALENDARIO' : 'VIEW CALENDAR'}</button>
                          </div>
                          
                          {todayTasks.length === 0 ? (
                            <p className="text-sm text-slate-400 italic text-center py-2">{lang === 'es' ? 'No hay compromisos pendientes para hoy.' : 'No pending tasks for today.'}</p>
                          ) : (
                            <div className="space-y-3">
                               {todayTasks.map((task) => (
                                  <motion.div 
                                    key={task.id} 
                                    onClick={() => {
                                      setEditingTask(task);
                                      setShowActionModal(true);
                                    }}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#1E3A8A]/30 hover:shadow-md transition-all active:scale-[0.98]"
                                  >
                                     <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-[#F59E0B] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Navigation size={10}/> {task.type}</span>
                                          <span className="font-bold text-[#1E3A8A] text-sm leading-tight">{task.title}</span>
                                        </div>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTodayTasks(prev => prev.filter(t => t.id !== task.id));
                                          }}
                                          className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white shadow-inner shrink-0 ml-3 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center group"
                                        >
                                           <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>
                                     </div>
                                  </motion.div>
                               ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="historial" 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-6"
                      >
                         <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                           <div className="flex flex-col gap-3 mb-4">
                             <div className="flex justify-between items-center">
                               <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wide">{lang === 'es' ? 'Proyectos Ganados' : 'Won Projects'}</h3>
                               <button 
                                 onClick={() => setHistorialViewMode(prev => prev === 'list' ? 'map' : 'list')}
                                 className="text-slate-400 hover:text-corporate-purple transition-colors p-1"
                               >
                                 {historialViewMode === 'list' ? <MapIcon size={18} /> : <List size={18} />}
                               </button>
                             </div>
                             
                             <div className="w-full relative">
                               <select 
                                 value={historialTimeframe}
                                 onChange={(e) => setHistorialTimeframe(e.target.value)}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 pr-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest appearance-none focus:outline-none focus:border-corporate-purple focus:ring-1 focus:ring-corporate-purple cursor-pointer"
                               >
                                 <option value="week">{lang === 'es' ? 'Semana en curso' : 'Current week'}</option>
                                 <option value="month">{lang === 'es' ? 'Mes en curso' : 'Current month'}</option>
                                 <option value="last_month">{lang === 'es' ? 'Mes anterior' : 'Last month'}</option>
                                 <option value="year">{lang === 'es' ? 'Año en curso' : 'Current year'}</option>
                                 <option value="last_year">{lang === 'es' ? 'Año anterior' : 'Last year'}</option>
                                 <option value="all">{lang === 'es' ? 'Todos los años históricos' : 'All historical years'}</option>
                               </select>
                               <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                             </div>
                           </div>

                          {historialViewMode === 'list' ? (
                            <div className="space-y-3">
                               <p className="text-[11px] text-slate-400 font-medium italic tracking-wide text-center py-4">{lang === 'es' ? 'No hay historial disponible' : 'No history available'}</p>
                            </div>
                          ) : (
                             <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner cursor-pointer group">
                                <button 
                                   onClick={() => setIsMapFullscreen(true)}
                                   className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-[#1E3A8A] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Maximize2 size={16} strokeWidth={2.5} />
                                </button>
                                {renderGeoMap(false)}
                             </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* FOOTER CREADOR DE ACTIVIDAD */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-12 pb-6 px-4 flex flex-col items-center pointer-events-none z-20">
                   <div className="pointer-events-auto flex items-end justify-center relative mb-2">
                      <motion.button 
                        onClick={handleMicClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-[72px] h-[72px] bg-corporate-purple text-white rounded-full flex items-center justify-center shadow-[0_8px_25px_rgb(124,58,237,0.4)] z-10"
                      >
                         <Mic size={32} />
                      </motion.button>
                      
                      <motion.button 
                        onClick={() => setShowActionModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute -right-12 bottom-2 w-11 h-11 bg-white border border-slate-200 text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 z-0"
                      >
                         <Keyboard size={20} />
                      </motion.button>
                   </div>
                   <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{lang === 'es' ? 'Agregar Actividad Rápida (Voz o Texto)' : 'Quick Add Activity (Voice/Text)'}</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* MODALS GLOBALES DEL DASHBOARD */}
        <AnimatePresence>
          {showPipelineModal && currentView === 'dashboard' && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/40 z-50 flex items-end overflow-hidden"
               onClick={() => setShowPipelineModal(false)}
            >
               <motion.div 
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-white w-full h-[70%] rounded-t-3xl shadow-2xl flex flex-col items-start px-6 pt-6 pb-12 cursor-default"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Flujo Esperado (Fechas de Cierre)</h2>
                  <p className="text-sm text-slate-500 mb-8">Proyección estimada de ingresos Q2 y Q3.</p>

                  <div className="w-full flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center relative overflow-hidden p-4">
                     {/* <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                       <path d="M 0 80 Q 25 20, 50 60 T 100 10" fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
                       <path d="M 0 80 Q 25 20, 50 60 T 100 10 L 100 100 L 0 100 Z" fill="rgba(124,58,237,0.1)" />
                     </svg> */}
                     <span className="text-[11px] text-slate-400 font-medium italic tracking-wide text-center py-4">{lang === 'es' ? 'No hay flujo disponible' : 'No flow available'}</span>
                     <div className="absolute w-full h-full flex justify-between items-end pb-2 px-6 top-0 left-0 pointer-events-none text-[10px] text-slate-400 font-medium">
                        <span>MAY</span><span>JUN</span><span>JUL</span><span>AGO</span>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
          )}

          {selectedCountry && currentView === 'dashboard' && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 z-50 flex items-end overflow-hidden backdrop-blur-sm"
               onClick={() => setSelectedCountry(null)}
            >
               <motion.div 
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-white w-full h-[85%] rounded-t-3xl shadow-2xl flex flex-col px-6 pt-6 pb-8 cursor-default relative"
                  onClick={e => e.stopPropagation()}
               >
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
                  <h2 className="text-xl font-bold text-corporate-blue mb-1">{lang === 'es' ? 'Mercado' : 'Market'}: {selectedCountry}</h2>
                  <p className="text-sm text-slate-500 mb-6">{lang === 'es' ? 'Selecciona un distribuidor o agrega una nota general.' : 'Select a distributor or add a general note.'}</p>

                  <div className="flex-1 overflow-y-auto w-full no-scrollbar pb-6 flex flex-col gap-6">
                     
                     {/* Bítácora Regional (Notas Generales) */}
                     {newCountryTimelineItems.length > 0 && (
                        <div>
                           <h3 className="text-[11px] font-extrabold text-[#1E3A8A] uppercase tracking-widest mb-3 pl-1 flex items-center gap-1.5 opacity-80">
                             <List size={12} /> {lang === 'es' ? 'Novedades Regionales' : 'Regional Updates'}
                           </h3>
                           <div className="space-y-3">
                             {newCountryTimelineItems.map(item => (
                               <motion.div key={item.id} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-blue-50/70 p-4 rounded-[20px] border border-blue-100 shadow-[0_2px_10px_rgb(30,58,138,0.03)] text-left">
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-extrabold text-[#1E3A8A] text-[13px] uppercase tracking-wider">{item.title}</h4>
                                    <Mic size={14} className="text-blue-400" />
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"><Calendar size={10}/> {item.date}</p>
                                  <p className="text-[12px] text-slate-600 font-medium leading-relaxed">{item.content}</p>
                               </motion.div>
                             ))}
                           </div>
                        </div>
                     )}

                     {/* Distribuidores */}
                     <div>
                       <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">{lang === 'es' ? 'Distribuidores Locales' : 'Local Distributors'}</h3>
                       <div className="space-y-3">
                         <p className="text-[11px] text-slate-400 font-medium italic tracking-wide px-1">{lang === 'es' ? 'No hay distribuidores registrados.' : 'No distributors registered.'}</p>
                         {[].map((i: any) => (
                           <div 
                             key={i} 
                             onClick={() => setSelectedClient({ name: lang === 'es' ? `Distribuidor Local ${i} S.A.` : `Local Distributor ${i} S.A.`, country: selectedCountry })}
                             className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex justify-between items-center active:bg-slate-100 cursor-pointer hover:border-corporate-purple/30 hover:shadow-sm transition-all shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                           >
                             <div>
                               <h4 className="font-bold text-[#1E3A8A] text-[15px] mb-1">{lang === 'es' ? `Distribuidor Local ${i} S.A.` : `Local Distributor ${i} S.A.`}</h4>
                               <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1"><MapIcon size={10} /> {lang === 'es' ? 'Sede Central' : 'Headquarters'}</span>
                             </div>
                             <div className="text-right flex flex-col items-end">
                               <div className="font-extrabold text-[#7C3AED] text-[15px]">$ {(i * 35).toFixed(0)}K</div>
                               <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm mt-1">{lang === 'es' ? 'Seguimiento' : 'Tracking'}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>

                  {/* Botón flotante para Registro General de País (Regional) */}
                  <div className="absolute bottom-6 right-6 z-20">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMicClick}
                      className="w-[66px] h-[66px] bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(30,58,138,0.4)] border-[5px] border-slate-50"
                    >
                       <Mic size={28} />
                    </motion.button>
                  </div>
               </motion.div>
            </motion.div>
          )}

          {/* VISTA MAPA FULLSCREEN */}
          {isMapFullscreen && currentView === 'dashboard' && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="absolute inset-0 bg-slate-50 z-50 flex flex-col overflow-hidden"
            >
               <div className="pt-12 pb-4 px-6 flex justify-between items-center bg-white shadow-[0_4px_25px_rgb(0,0,0,0.05)] shrink-0 z-10 rounded-b-3xl">
                 <div>
                   <h2 className="text-xl font-bold text-[#1E3A8A] tracking-wider uppercase mb-1">Mapa Estratégico</h2>
                   <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Resumen Geoespacial CALA</p>
                 </div>
                 <button 
                   onClick={() => setIsMapFullscreen(false)} 
                   className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors shadow-inner"
                 >
                   <Minimize2 size={24} />
                 </button>
               </div>
               
               <div className="flex-1 w-full relative">
                  {renderGeoMap(true)}
               </div>
            </motion.div>
          )}

          {/* VISTA: FICHA DEL CLIENTE / BITÁCORA */}
          {selectedClient && currentView === 'dashboard' && (
             <motion.div 
               initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="absolute inset-0 bg-slate-50 z-[75] flex flex-col overflow-hidden"
            >
               {/* Header Client Ficha */}
               <div className="pt-12 pb-5 px-6 bg-white shadow-sm shrink-0 border-b border-slate-100 rounded-b-3xl relative z-10">
                  <div className="flex items-start gap-4 mb-5">
                     <button onClick={() => setSelectedClient(null)} className="p-2.5 bg-slate-50 shadow-inner rounded-full hover:bg-slate-200 text-[#1E3A8A] transition-colors border border-slate-200 mt-1 shrink-0">
                       <ArrowRight size={20} className="rotate-180" />
                     </button>
                     <div>
                       <div className="flex flex-wrap items-center gap-2 mb-1">
                         <h2 className="text-xl font-extrabold text-[#1E3A8A] leading-tight break-words">{selectedClient.name}</h2>
                       </div>
                       <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1.5 bg-slate-100 w-max px-2.5 py-1 rounded-md border border-slate-200">
                          <MapIcon size={12} className="text-[#1E3A8A]"/> {selectedClient.country}
                       </p>
                     </div>
                  </div>

                  {/* KPI Quick Stats */}
                  <div className="flex gap-3">
                     <div className="flex-1 bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] rounded-[16px] p-4 flex flex-col items-center shadow-lg relative overflow-hidden group">
                       <div className="absolute right-0 bottom-0 opacity-10">
                         <Signal size={60} />
                       </div>
                       <span className="text-[10px] uppercase font-bold text-blue-200 mb-0.5 tracking-widest relative z-10">{lang === 'es' ? 'Pipeline Actual' : 'Current Pipeline'}</span>
                       <span className="text-2xl font-black text-white relative z-10">$120K</span>
                     </div>
                     <div className="flex-1 bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col items-center shadow-sm">
                       <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest">{lang === 'es' ? 'Confianza' : 'Confidence'}</span>
                       <span className="text-2xl font-black text-emerald-600 flex items-center gap-1"><Fingerprint size={16}/> {lang === 'es' ? 'Alta' : 'High'}</span>
                     </div>
                  </div>
               </div>

               {/* Switcher entre Oportunidades vs Bitácora de Oportunidad */}
               {!selectedOpportunity ? (
                  <div className="flex-1 overflow-y-auto w-full p-6 pb-32 bg-[#F8FAFC]">
                     <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/60">
                       <h3 className="font-bold text-slate-800 uppercase tracking-widest text-[13px] flex items-center gap-2">
                          <Signal size={16} className="text-corporate-purple" /> {lang === 'es' ? 'Oportunidades Activas' : 'Active Opportunities'}
                       </h3>
                     </div>
                     <div className="space-y-4">
                        {[].map(opp => (
                           <div 
                              key={opp.id} 
                              onClick={() => setSelectedOpportunity(opp)}
                              className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-sm flex justify-between items-center cursor-pointer hover:border-corporate-purple/40 hover:shadow-md transition-all active:scale-[0.98]"
                           >
                              <div>
                                 <h4 className="font-extrabold text-[#1E3A8A] text-[15px] mb-1.5">{opp.title}</h4>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">{opp.status}</span>
                                    <span className="text-[11px] font-semibold text-slate-400">{opp.date}</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-[17px] font-black text-emerald-600 leading-none">{opp.amount}</span>
                                 <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">USD</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ) : (
                  <div className="flex-1 overflow-y-auto w-full p-6 pb-32 bg-[#F8FAFC]">
                     <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200/60">
                       <h3 className="font-bold text-[#1E3A8A] uppercase tracking-widest text-[13px] flex items-center gap-2 truncate pr-2">
                          <List size={16} className="text-corporate-purple shrink-0" /> {lang === 'es' ? 'Historial' : 'History'}: {selectedOpportunity.title}
                       </h3>
                       <button onClick={() => setSelectedOpportunity(null)} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 bg-slate-200/50 px-2 py-1 rounded shrink-0">
                           {lang === 'es' ? '← Volver' : '← Back'}
                       </button>
                     </div>

                  {/* The Timeline Vertical Line */}
                  <div className="relative pl-[26px] border-l-2 border-slate-200/80 space-y-9">
                     
                     {/* Dynamic Items (Recién Creados) */}
                     {newTimelineItems.map((item) => (
                        <motion.div key={item.id} initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="relative">
                           <div className="absolute -left-[35px] w-[26px] h-[26px] rounded-full bg-emerald-500 text-white shadow-sm flex items-center justify-center border-4 border-[#F8FAFC]">
                              <Signal size={10} strokeWidth={3} />
                           </div>
                           <div className="flex justify-between items-end mb-2 ml-1">
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded-full border border-slate-200/50">{lang === 'es' ? 'Registro Ágil' : 'Quick Log'}</p>
                             <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{lang === 'es' ? 'Justo Ahora' : 'Just Now'}</p>
                           </div>
                           
                           <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-extrabold text-slate-800 text-[15px] pr-2 leading-tight">{item.title}</h4>
                                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-emerald-100/50 shrink-0">#{item.id < 10 ? `0${item.id}` : item.id}</span>
                              </div>
                              <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">
                                {item.content}
                              </p>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex flex-col gap-1.5">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 opacity-90">
                                   <Edit2 size={11} strokeWidth={3} /> {lang === 'es' ? 'Nota Rápida:' : 'Quick Note:'}
                                 </span>
                                 <span className="text-[13.5px] font-bold text-slate-700 leading-tight">{lang === 'es' ? 'Sin compromisos asociados.' : 'No associated tasks.'}</span>
                              </div>
                           </div>
                        </motion.div>
                     ))}

                     {/* Timeline Item 1: MI COMPROMISO (Visita) */}
                     <div className="relative">
                        <div className="absolute -left-[35px] w-[26px] h-[26px] rounded-full bg-corporate-purple text-white shadow-sm flex items-center justify-center border-4 border-[#F8FAFC]">
                           <Mic size={10} strokeWidth={3} />
                        </div>
                        <div className="flex justify-between items-end mb-2 ml-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded-full border border-slate-200/50">{lang === 'es' ? 'Visita Presencial' : 'On-Site Visit'}</p>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{lang === 'es' ? 'Hoy, 16:45 hrs' : 'Today, 16:45 hrs'}</p>
                        </div>
                        
                        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7C3AED]"></div>
                           <div className="flex items-start justify-between mb-2">
                             <h4 className="font-extrabold text-slate-800 text-[15px] pr-2 leading-tight">{lang === 'es' ? 'Presentación Nueva Plana Directiva' : 'New Board Presentation'}</h4>
                             <span className="text-[11px] font-black text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-blue-100/50 shrink-0">#03</span>
                           </div>
                           
                           <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">
                             {lang === 'es' ? 'Acordamos revisar precios el próximo mes de la línea pesada. Pidieron que la propuesta se envíe rápidamente segmentando regiones por volumen de compra.' : 'Agreed to review heavy line prices next month. Requested prompt proposal segmented by regional purchase volume.'}
                           </p>
                           
                           {/* Mi Compromiso Container */}
                           <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/60 flex flex-col gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5 opacity-90">
                                <UserCheck size={11} strokeWidth={3} /> {lang === 'es' ? 'Mi Tarea Pendiente:' : 'My Pending Task:'}
                              </span>
                              <span className="text-[13.5px] font-bold text-amber-900 leading-tight">Enviar Propuesta Segmentada (05 May)</span>
                           </div>
                        </div>
                     </div>

                     {/* Timeline Item 2: COMPROMISO DEL CLIENTE (Mensaje) */}
                     <div className="relative opacity-95">
                        <div className="absolute -left-[35px] w-[26px] h-[26px] rounded-full bg-rose-500 text-white shadow-sm flex items-center justify-center border-4 border-[#F8FAFC]">
                           <MessageCircle size={10} strokeWidth={3} />
                        </div>
                        <div className="flex justify-between items-end mb-2 ml-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded-full border border-slate-200/50">WhatsApp / Mensaje</p>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">24 Abril 2026</p>
                        </div>

                        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                           <div className="flex items-start justify-between mb-2">
                             <h4 className="font-extrabold text-slate-700 text-[14px] leading-tight pr-2">Solicitud de Datos Bancarios</h4>
                             <span className="text-[11px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50 shrink-0">#02</span>
                           </div>
                           <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed mb-4">
                             El gerente de finanzas me escribió para pedir validación de la cuenta de cobro antes del cierre de quincena.
                           </p>

                           {/* Compromiso del Cliente Container */}
                           <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 flex flex-col gap-1.5">
                              <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1.5 opacity-90">
                                <UserX size={11} strokeWidth={3} /> Esperando al Cliente:
                              </span>
                              <span className="text-[13px] font-bold text-rose-900 leading-tight">Transferir Pago Retrasado (25 Abril)</span>
                           </div>
                        </div>
                     </div>

                     {/* Timeline Item 3: SIN COMPROMISOS (Llamada) */}
                     <div className="relative opacity-75">
                        <div className="absolute -left-[35px] w-[26px] h-[26px] rounded-full bg-slate-400 text-white shadow-sm flex items-center justify-center border-4 border-[#F8FAFC]">
                           <Phone size={10} strokeWidth={3} />
                        </div>
                        <div className="flex justify-between items-end mb-2 ml-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded-full border border-slate-200/50">Llamada de Control</p>
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">15 Marzo 2026</p>
                        </div>
                        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
                           <div className="flex items-start justify-between mb-1.5">
                             <h4 className="font-bold text-slate-700 text-[14px] leading-tight pr-2">Revisión de Inventario Q2</h4>
                             <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50 shrink-0">#01</span>
                           </div>
                           <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-3 mt-1.5">
                             Todo marcha según lo provisto en el contrato anual. El cliente no reporta problemas operativos adicionales.
                           </p>
                           <div className="mt-3 text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-1 bg-slate-50 w-max px-2.5 py-1.5 rounded-md border border-slate-100">
                             <Lock size={10} /> Ejecutada · Sin compromisos nuevos
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
               )}

               {/* Botón flotante de Grabación Consciente del Contexto */}
               <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
                  <div className="mb-2 w-max">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white border border-white/20 ${selectedOpportunity ? 'bg-amber-600' : 'bg-corporate-purple'}`}>
                        {selectedOpportunity ? 'Nota Oportunidad' : 'Nota de Cuenta'}
                     </span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMicClick}
                    className={`w-[68px] h-[68px] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-[5px] border-slate-50 transition-colors ${selectedOpportunity ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]' : 'bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]'}`}
                  >
                     <Mic size={30} />
                  </motion.button>
               </div>
            </motion.div>
          )}

          {/* VISTA CREAR REGISTRO Y ACCIÓN (IA DICTADO) */}
          {showActionModal && currentView === 'dashboard' && (
             <motion.div 
               initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="absolute inset-0 bg-[#F8FAFC] z-[100] flex flex-col overflow-y-auto pb-24"
            >
               {/* Header Registro */}
               <div className="pt-12 pb-4 px-6 flex justify-between items-center bg-white shadow-sm shrink-0 sticky top-0 z-20">
                 <div>
                   <h2 className="text-xl font-bold text-[#1E3A8A] tracking-wider uppercase mb-1">
                      {editingTask ? (lang === 'es' ? 'Editar Registro' : 'Edit Record') : (lang === 'es' ? 'Nuevo Registro' : 'New Record')}
                   </h2>
                   <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap ${editingTask ? 'text-slate-500' : 'text-corporate-purple'}`}>
                      {editingTask ? <><Edit2 size={12}/> {lang === 'es' ? 'Edición Manual' : 'Manual Edit'}</> : <><Mic size={12}/> {lang === 'es' ? 'Entrada por Voz' : 'Voice Input'}</>}
                   </p>
                 </div>
                 <button 
                   onClick={() => {
                     setShowActionModal(false);
                     setTimeout(() => setEditingTask(null), 300);
                   }} 
                   className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                 >
                   <X size={24} />
                 </button>
               </div>
               
               {/* Contenido Formulario Deslizante */}
               <div className="p-6 space-y-6">
                 
                 {/* Tarjeta: Detalle de Actividad */}
                 <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#7C3AED] to-[#5B21B6]"></div>
                    <div className="flex items-center gap-2 mb-4 pl-3">
                      <Mic size={20} className="text-corporate-purple" />
                      <h3 className="font-bold text-slate-800 text-[15px] tracking-wide uppercase">{lang === 'es' ? 'Detalle de Actividad' : 'Activity Detail'}</h3>
                    </div>
                    
                    {/* Fake text to simulate or show edited content */}
                    <div className="relative">
                      <textarea 
                        value={draftActivity}
                        onChange={(e) => setDraftActivity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 text-sm h-36 resize-none placeholder:text-slate-400 font-medium leading-relaxed shadow-inner"
                      ></textarea>
                    </div>
                    <div className="flex justify-between items-center mt-3 pl-3">
                       {editingTask ? (
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Edit2 size={12}/> {lang === 'es' ? 'Editando' : 'Editing'}</p>
                       ) : (
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1"><Signal size={12}/> {lang === 'es' ? 'Voz procesada' : 'Voice processed'}</p>
                       )}
                       <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{lang === 'es' ? 'Hoy, 16:45 hrs' : 'Today, 16:45 hrs'}</p>
                    </div>
                 </div>

                 {/* Tarjeta: Próximo Compromiso */}
                 <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F59E0B] to-[#D97706]"></div>
                    <div className="flex items-center gap-2 mb-5 pl-3">
                      <Navigation size={20} className="text-[#F59E0B] fill-[#F59E0B]/20" />
                      <h3 className="font-bold text-slate-800 text-[15px] tracking-wide uppercase">{lang === 'es' ? 'Próximo Compromiso' : 'Next Task'}</h3>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Campo Acción */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-widest pl-3 flex items-center gap-2">{lang === 'es' ? '¿Qué sigue?' : 'What\'s next?'}</label>
                        <input type="text" value={draftAction} onChange={(e) => setDraftAction(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 text-sm shadow-inner" />
                      </div>
                      
                      {/* Campo Fecha */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-widest pl-3 flex items-center gap-2">
                          <Calendar size={12} /> {lang === 'es' ? '¿Para cuándo?' : 'When?'}
                        </label>
                        <div className="relative">
                          <input type="date" defaultValue="2026-05-05" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 text-sm shadow-inner appearance-none" />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Tarjeta Simulación: Motor IA RAG sugerencias cross-selling */}
                 <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] rounded-[24px] shadow-lg border border-blue-800 p-6 relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                       <Signal size={100} />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                       <span className="bg-blue-900/50 text-blue-200 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-blue-400/20">🤖 {lang === 'es' ? 'Motor de Inteligencia' : 'Intelligence Engine'}</span>
                    </div>
                    <h3 className="font-extrabold text-white text-[15px] leading-tight mb-2 pr-4">{lang === 'es' ? 'La IA ha identificado posibles cruces con el Catálogo de Hubbell:' : 'AI has identified cross-selling opportunities from Hubbell Catalog:'}</h3>
                    
                    <div className="mt-4 space-y-3">
                       <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all flex justify-between items-center">
                          <div>
                             <h4 className="text-white text-sm font-bold">Kit Iluminación + Tablero NEMA</h4>
                             <p className="text-blue-200 text-[10px] mt-0.5">85% Tasa de éxito en plantas M.R.</p>
                          </div>
                          <button className="bg-white text-[#1E3A8A] text-[10px] font-bold px-3 py-1.5 rounded-full shadow">+ Agregar</button>
                       </div>
                       <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all flex justify-between items-center">
                          <div>
                             <h4 className="text-white text-sm font-bold">Conectores Industriales Pin & Sleeve</h4>
                             <p className="text-blue-200 text-[10px] mt-0.5">Complemento ideal para tableros.</p>
                          </div>
                          <button className="bg-white text-[#1E3A8A] text-[10px] font-bold px-3 py-1.5 rounded-full shadow">+ Agregar</button>
                       </div>
                    </div>
                 </div>

                 {/* Botón de Confirmación (Integrado al flujo) */}
                 <div className="pt-2 pb-6">
                    <button onClick={handleSaveLocal} className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#1e40af] text-white rounded-[20px] py-4 font-bold tracking-widest uppercase shadow-[0_8px_30px_rgb(30,58,138,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all pointer-events-auto border-2 border-[#1E3A8A]/50">
                      <UploadCloud size={20} />
                      {lang === 'es' ? 'Guardar Registro' : 'Save Record'}
                    </button>
                 </div>

               </div>
            </motion.div>
          )}

          {/* OVERLAY DE GRABACIÓN DE VOZ (FLUJO IA 1) */}
          {isRecording && currentView === 'dashboard' && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/85 z-[90] backdrop-blur-md flex flex-col items-center justify-center p-6"
            >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.5)] cursor-pointer mb-8"
                  onClick={handleMicClick}
                >
                  <Mic size={52} className="text-white" />
                </motion.div>
                <h3 className="text-white text-2xl font-bold uppercase tracking-wider mb-3">{lang === 'es' ? 'Te Escucho' : 'I am listening'}</h3>
                <p className="text-slate-300 text-center text-[13px] font-medium mb-12 max-w-[280px] leading-relaxed">
                  {lang === 'es' ? 'Menciona los detalles de la visita y la próxima acción a tomar.' : 'Mention the details of the visit and the next action to take.'}
                </p>
                
                <button onClick={handleMicClick} className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full px-8 py-3 font-semibold backdrop-blur-sm transition-colors uppercase tracking-widest text-xs flex items-center gap-2">
                   <div className="w-2 h-2 bg-red-400 rounded-sm animate-pulse"></div> {lang === 'es' ? 'Detener Grabación' : 'Stop Recording'}
                </button>
            </motion.div>
          )}

          {/* OVERLAY DE PROCESAMIENTO RAM (FLUJO IA 2) */}
          {isProcessingVoice && currentView === 'dashboard' && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/90 z-[90] backdrop-blur-md flex flex-col items-center justify-center"
            >
                <div className="w-16 h-16 border-[5px] border-corporate-purple/20 border-t-corporate-purple rounded-full animate-spin mb-6"></div>
                <h3 className="text-white text-lg font-bold uppercase tracking-widest animate-pulse">{lang === 'es' ? 'Procesando Voz...' : 'Processing Voice...'}</h3>
                <p className="text-slate-400 text-xs mt-3 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                   <Fingerprint size={12}/> {lang === 'es' ? 'Motor IA en Memoria RAM' : 'AI Engine on RAM'}
                </p>
            </motion.div>
          )}

          {/* TOAST DE SINCRONIZACIÓN OFFLINE-FIRST */}
          {showToast && (
             <motion.div
               initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
               className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white px-5 py-3.5 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-[80] flex items-center gap-3 whitespace-nowrap border border-slate-700/50"
            >
               <UploadCloud size={16} className="text-emerald-400" />
               <span className="text-[11px] font-bold tracking-wide uppercase">{lang === 'es' ? 'Guardado RAM. Sincronizando...' : 'Saved to RAM. Syncing...'}</span>
            </motion.div>
          )}

           {/* MODAL: MERCADO PAGO SUSCRIPCIÓN */}
           <AnimatePresence>
              {showSubscriptionModal && (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="fixed inset-0 bg-slate-900/70 z-[150] backdrop-blur-sm flex items-end sm:items-center justify-center overflow-hidden"
                   onClick={() => setShowSubscriptionModal(false)}
                 >
                    <motion.div 
                       initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                       transition={{ type: "spring", damping: 25, stiffness: 200 }}
                       className="bg-white w-full sm:w-[400px] sm:rounded-3xl rounded-t-[32px] shadow-2xl flex flex-col relative overflow-hidden"
                       onClick={e => e.stopPropagation()}
                    >
                       {/* Header Paywall */}
                       <div className="bg-gradient-to-br from-[#009EE3] to-[#008CC9] px-6 pt-8 pb-8 relative overflow-hidden">
                          <button onClick={() => setShowSubscriptionModal(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all">
                             <X size={16} />
                          </button>
                          <div className="absolute -right-10 -bottom-10 opacity-10">
                             <CreditCard size={120} />
                          </div>
                          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] items-center gap-1 text-white font-bold uppercase tracking-widest flex w-max mb-3 backdrop-blur-sm shadow-sm">
                            <ShieldCheck size={12}/> {lang === 'es' ? 'Pago Seguro' : 'Secure Payment'}
                          </span>
                          <h2 className="text-2xl font-black text-white leading-tight">Easy Management <span className="text-emerald-300">PRO</span></h2>
                          <p className="text-white/80 text-xs font-medium mt-1 leading-relaxed max-w-[85%]">
                             {lang === 'es' ? 'Potencia tus ventas con el Co-piloto de Inteligencia Artificial enfocado en pipelines de alto valor.' : 'Boost your sales with the AI Co-pilot focused on high-value pipelines.'}
                          </p>
                       </div>

                       <div className="p-6 space-y-6">
                          <div className="text-center">
                             <h3 className="text-4xl font-black text-slate-800 tracking-tight">
                                $29 <span className="text-lg text-slate-400 font-bold uppercase">USD / {lang === 'es' ? 'Mes' : 'Month'}</span>
                             </h3>
                             <p className="text-xs text-slate-500 font-semibold mt-1 bg-slate-50 px-3 py-1.5 rounded-full inline-block">
                                {lang === 'es' ? 'Facturación mensual canjeable localmente.' : 'Monthly billing locally exchangeable.'}
                             </p>
                          </div>

                          <ul className="space-y-3">
                             {['RAG Inteligencia Artificial ilimitado', 'Geofencing de Proyectos Activos', 'Grabación de Voz a CRM sin Límites', 'Reportes Ejecutivos Históricos'].map((feature, i) => (
                               <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex flex-shrink-0 items-center justify-center text-emerald-600">
                                     <Check size={12} strokeWidth={3}/>
                                  </div>
                                  {feature}
                               </li>
                             ))}
                          </ul>

                          <button 
                             onClick={() => {
                                alert("Redirigiendo a pasarela de Mercado Pago (Simulada)...\nMonto: $29 USD (Convertidos a Peso Chileno)");
                                setShowSubscriptionModal(false);
                             }}
                             className="w-full bg-[#009EE3] text-white py-4 rounded-[20px] font-black tracking-widest uppercase text-[12px] flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(0,158,227,0.3)] hover:scale-[1.02] active:scale-95 transition-all mt-4 mb-2"
                          >
                             <CreditCard size={18} /> {lang === 'es' ? 'Mercado Pago (Solo en Chile)' : 'Mercado Pago (Chile Only)'}
                          </button>
                          <button 
                             onClick={() => {
                                alert("Redirigiendo a Lemon Squeezy Checkout (Internacional)...\nMonto: $29 USD");
                                setShowSubscriptionModal(false);
                             }}
                             className="w-full bg-[#7047EB] text-white py-4 rounded-[20px] font-black tracking-widest uppercase text-[12px] flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(112,71,235,0.3)] hover:scale-[1.02] active:scale-95 transition-all mb-4"
                          >
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12A10 10 0 0 0 15 21.54A10 10 0 0 1 15 2.46A10 10 0 0 0 2 12Z"></path>
                             </svg>
                             {lang === 'es' ? 'Pago Global (Lemon Squeezy)' : 'Global Pay (Lemon Squeezy)'}
                          </button>
                          <p className="text-[10px] text-center text-slate-400 font-semibold px-4 cursor-pointer hover:underline">
                             {lang === 'es' ? 'Restaurar compras anteriores' : 'Restore purchases'}
                          </p>
                       </div>
                    </motion.div>
                 </motion.div>
              )}
           </AnimatePresence>

          {/* MODAL: INFORME EJECUTIVO (MAPA DE CALOR + TOTALES) */}
          {showReportModal && currentView === 'dashboard' && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 z-[120] backdrop-blur-sm flex items-end overflow-hidden"
               onClick={() => setShowReportModal(false)}
            >
               <motion.div 
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-[#F8FAFC] w-full h-[90%] rounded-t-[32px] shadow-2xl flex flex-col relative overflow-hidden"
                  onClick={e => e.stopPropagation()}
               >
                  {/* Header Informe */}
                  <div className="bg-white px-6 pt-6 pb-5 border-b border-slate-100 shrink-0 sticky top-0 z-20">
                     <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 shrink-0" />
                     
                     {/* Logos de co-branding */}
                     <div className="flex justify-between items-center mb-4">
                        {clientLogo ? (
                           <img src={clientLogo} alt="Mandante" className="h-5 object-contain" />
                        ) : (
                           <div className="h-5 flex items-center border border-slate-200 px-2 rounded text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">Sin Logo</div>
                        )}
                        <img src="/logo_at_sit_full.png" alt="AT-SIT" className="h-3.5 opacity-60 object-contain" />
                     </div>

                     <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[9px] font-black text-white bg-corporate-purple uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm">CONFIDENCIAL</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Corte al {new Date().toLocaleDateString()}</span>
                           </div>
                           <h2 className="text-2xl font-black text-[#1E3A8A] leading-tight flex items-center gap-2 tracking-tight">
                              <FileText size={22} className="text-corporate-purple"/> Informe de Gestión
                           </h2>
                        </div>
                        <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all -mt-1 shadow-sm">
                           <X size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Contenido Informe */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
                     
                     {/* Tarjeta 1: Total Pipeline */}
                     <div className="bg-corporate-purple rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-10">
                           <MapIcon size={120} />
                        </div>
                        <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-1">Total Pipeline Latam</p>
                        <h3 className="text-4xl font-extrabold tracking-tight mb-4">$3.5<span className="text-xl">M USD</span></h3>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full w-max text-xs font-semibold backdrop-blur-sm">
                          <Navigation size={12} className="text-emerald-300"/> 12 Proyectos Activos
                        </div>
                     </div>

                     {/* Tarjeta 2: Mapa de Calor */}
                     <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center gap-2"><MapIcon size={14}/> Mapa de Calor (Heatmap)</h4>
                        <div className="w-full aspect-[4/3] bg-slate-50 relative rounded-[16px] overflow-hidden shadow-inner border border-[#1E3A8A]/5">
                           {renderGeoMap(false)}
                           <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200/50">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Concentración</p>
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>Alta (CH, P)</div>
                                 <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-[#1E3A8A]/60"></div>Media (CO)</div>
                                 <div className="flex items-center gap-2 text-[10px] font-bold"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Baja (EC)</div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Tarjeta 3: Desglose MACRO (Cuadratura) */}
                     <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 flex items-center gap-2"><List size={14}/> Cuadratura por Entidades</h4>
                        <div className="space-y-6">
                           {/* CHILE */}
                           <div>
                              <div className="flex justify-between items-end mb-3">
                                 <div className="flex items-center gap-2">
                                    <img src="https://flagcdn.com/w40/cl.png" alt="Chile" className="w-4 shadow-sm rounded-sm" />
                                    <h5 className="text-sm font-bold text-[#1E3A8A]">Chile</h5>
                                 </div>
                                 <span className="text-sm font-extrabold text-slate-800">$1.5M</span>
                              </div>
                              <div className="pl-3 ml-2 border-l-2 border-slate-100 flex flex-col gap-4">
                                  
                                  {/* Distribuidor Layer */}
                                  <div>
                                     <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                          <UserCheck size={12} className="text-slate-400" />
                                          <span className="text-slate-700 font-bold">Distribuidor: Inteled</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600">$1.0M</span>
                                     </div>
                                     <div className="pl-3 ml-1.5 border-l border-slate-200">
                                        {/* Cliente Final Layer */}
                                        <div className="flex justify-between items-center mb-1 mt-1.5">
                                           <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5"><div className="w-1 h-1 bg-slate-400 rounded-full"></div> Cliente: Minera Escondida</span>
                                        </div>
                                        <div className="pl-3 ml-1 border-l border-slate-100 space-y-1.5 mt-1">
                                            {/* Proyecto Layer */}
                                            <div className="flex justify-between items-center">
                                               <span className="text-[10px] text-slate-400 font-medium tracking-tight">• Proyecto Sur (Datacenter)</span>
                                               <span className="text-[10px] text-emerald-600 font-black">$0.6M</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                               <span className="text-[10px] text-slate-400 font-medium tracking-tight">• Anexo Cobre</span>
                                               <span className="text-[10px] text-emerald-600 font-black">$0.4M</span>
                                            </div>
                                        </div>
                                     </div>
                                  </div>

                                  {/* Direct Sales Layer */}
                                  <div>
                                     <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                          <Signal size={12} className="text-corporate-purple" />
                                          <span className="text-slate-700 font-bold tracking-tight">Venta Directa</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600">$0.5M</span>
                                     </div>
                                     <div className="pl-3 ml-1.5 border-l border-slate-200">
                                        {/* Cliente Final Layer */}
                                        <div className="flex justify-between items-center mb-1 mt-1.5">
                                           <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5"><div className="w-1 h-1 bg-slate-400 rounded-full"></div> Cliente: Codelco</span>
                                        </div>
                                        <div className="pl-3 ml-1 border-l border-slate-100 space-y-1.5 mt-1">
                                            {/* Proyecto Layer */}
                                            <div className="flex justify-between items-center">
                                               <span className="text-[10px] text-slate-400 font-medium tracking-tight">• Expansión Norte</span>
                                               <span className="text-[10px] text-emerald-600 font-black">$0.5M</span>
                                            </div>
                                        </div>
                                     </div>
                                  </div>

                              </div>
                           </div>

                           {/* PERÚ */}
                           <div className="pt-2">
                              <div className="flex justify-between items-end mb-3">
                                 <div className="flex items-center gap-2">
                                    <img src="https://flagcdn.com/w40/pe.png" alt="Perú" className="w-4 shadow-sm rounded-sm" />
                                    <h5 className="text-sm font-bold text-[#1E3A8A]">Perú</h5>
                                 </div>
                                 <span className="text-sm font-extrabold text-slate-800">$1.0M</span>
                              </div>
                              <div className="pl-3 ml-2 border-l-2 border-slate-100 flex flex-col gap-4">
                                  <div>
                                     <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                          <UserCheck size={12} className="text-slate-400" />
                                          <span className="text-slate-700 font-bold">Distribuidor: Promart</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-600">$1.0M</span>
                                     </div>
                                     <div className="pl-3 ml-1.5 border-l border-slate-200">
                                        <div className="flex justify-between items-center mb-1 mt-1.5">
                                           <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5"><div className="w-1 h-1 bg-slate-400 rounded-full"></div> Cliente: Grupo Romero</span>
                                        </div>
                                        <div className="pl-3 ml-1 border-l border-slate-100 space-y-1.5 mt-1">
                                            <div className="flex justify-between items-center">
                                               <span className="text-[10px] text-slate-400 font-medium tracking-tight">• Masterplan Obras</span>
                                               <span className="text-[10px] text-emerald-600 font-black">$1.0M</span>
                                            </div>
                                        </div>
                                     </div>
                                  </div>
                              </div>
                           </div>

                           {/* COLOMBIA & ECUADOR COMPRESSED FOR SPACE */}
                           <div className="pt-2 flex flex-col gap-6">
                              {/* COLOMBIA */}
                              <div>
                                 <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                       <img src="https://flagcdn.com/w40/co.png" alt="Colombia" className="w-4 shadow-sm rounded-sm" />
                                       <h5 className="text-sm font-bold text-[#1E3A8A]">Colombia</h5>
                                    </div>
                                    <span className="text-sm font-extrabold text-slate-800">$0.6M</span>
                                 </div>
                                 <div className="pl-3 ml-2 border-l-2 border-slate-100">
                                    <span className="text-[10px] text-slate-500 font-semibold">↳ D. Melexa (Avianca - Datacenter)</span> <span className="text-[10px] text-emerald-600 font-bold float-right">$0.6M</span>
                                 </div>
                              </div>

                              {/* ECUADOR */}
                              <div>
                                 <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2">
                                       <img src="https://flagcdn.com/w40/ec.png" alt="Ecuador" className="w-4 shadow-sm rounded-sm" />
                                       <h5 className="text-sm font-bold text-[#1E3A8A]">Ecuador</h5>
                                    </div>
                                    <span className="text-sm font-extrabold text-slate-800">$0.4M</span>
                                 </div>
                                 <div className="pl-3 ml-2 border-l-2 border-slate-100">
                                    <span className="text-[10px] text-slate-500 font-semibold">↳ D. Diproel (Infra. Pública)</span> <span className="text-[10px] text-emerald-600 font-bold float-right">$0.4M</span>
                                 </div>
                              </div>
                           </div>

                           <div className="pt-5 mt-4 border-t border-slate-200 flex justify-between items-center">
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Calculado</span>
                              <span className="text-lg font-black text-corporate-purple">$3.5M USD</span>
                           </div>
                        </div>
                     </div>

                  </div>

                  {/* Footer Actions */}
                  <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-5 z-20 transition-all duration-300">
                     {showReportPasswordForm ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                           <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                 <Lock size={12} className="text-corporate-purple" /> 
                                 Contraseña de Seguridad
                              </label>
                              <button onClick={() => setShowReportPasswordForm(false)} className="text-[10px] text-slate-400 font-bold uppercase hover:text-red-500">Cancelar</button>
                           </div>
                           <input 
                              type="text" 
                              placeholder="Ej: XYZ-2026"
                              value={reportPassword}
                              onChange={(e) => setReportPassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-corporate-purple focus:ring-1 focus:ring-corporate-purple"
                           />
                           <button 
                              disabled={reportPassword.length < 3}
                              onClick={() => {
                                 if (navigator.share) {
                                     navigator.share({
                                         title: 'Informe Ejecutivo MACRO - Confidencial',
                                         text: 'Enlace cifrado del Informe de Gestión. Requiere contraseña para visualización en pantalla.',
                                         url: 'https://easymanagement.app/secure-report/' + btoa(reportPassword).substring(0,8)
                                     }).then(() => {
                                         setShowReportPasswordForm(false);
                                         setReportPassword('');
                                     }).catch(console.error);
                                 } else {
                                     alert('Link seguro generado: https://easymanagement.app/secure-report/xyz');
                                     setShowReportPasswordForm(false);
                                 }
                              }}
                              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold tracking-widest uppercase text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none hover:bg-emerald-700 transition-all"
                           >
                              <Share2 size={16} />
                              Generar y Compartir Enlace
                           </button>
                           <p className="text-[9px] text-slate-400 text-center leading-tight mt-2 px-4">
                              *El PDF en la nube no permitirá descargas ni copias. Solo habilitado para lectura en pantalla.
                           </p>
                        </motion.div>
                     ) : (
                        <button 
                           onClick={() => setShowReportPasswordForm(true)}
                           className="w-full bg-[#1E3A8A] text-white py-4 rounded-[20px] font-bold tracking-widest uppercase text-[12px] flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(30,58,138,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                           <Lock size={16} />
                           Generar Enlace Seguro (PDF)
                        </button>
                     )}
                  </div>
               </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
  );
}

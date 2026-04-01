"use client";
import { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, Keyboard, Edit2, Signal, Mail, Lock, Fingerprint, UploadCloud, Link as LinkIcon, ArrowRight, Eye, EyeOff, Map as MapIcon, List, Maximize2, Minimize2, X, Calendar, Navigation, MapPin, ChevronLeft, ChevronRight, ChevronDown, Share2, FileText, CreditCard, ShieldCheck, Check, LogOut, Sparkles, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { getActivities, createActivity, toggleActivityCompletion, getOpportunities, createOpportunity, updateOpportunityStatus, getClients, createClient, deleteActivity, updateActivity, updateOpportunityConfidence, deleteOpportunity, updateOpportunityDetails, getAllUsers, toggleUserProStatus } from './actions';

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
  const [clientWebsite, setClientWebsite] = useState('');
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [historialViewMode, setHistorialViewMode] = useState<'list'|'map'>('list');
  const [historialTimeframe, setHistorialTimeframe] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportPasswordForm, setShowReportPasswordForm] = useState(false);
  const [reportPassword, setReportPassword] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const loadUserProfile = async () => {
     try {
       const res = await fetch('/api/auth/me', { cache: 'no-store' });
       if (!res.ok) {
           console.log("Sesión inválida o expirada");
           localStorage.setItem('easy_currentView', 'login');
           setCurrentView('login');
           return;
       }
       const data = await res.json();
       if (data.user) {
          if (data.user.country) setUserCountry(getFlagCode(data.user.country));
          if (data.user.clientUrl) setClientWebsite(data.user.clientUrl);
          if (data.user.logoUrl) setClientLogo(data.user.logoUrl);
          if (data.user.avatarUrl) setAvatarUrl(data.user.avatarUrl);
          if (data.user.isPro) setIsProUser(true);
          if (data.user.email) setEmail(data.user.email);
          
          if (data.user.logoUrl && data.user.avatarUrl && currentView === 'onboarding') {
             setCurrentView('dashboard');
          }
       }
       
       // Recuperación transparente espejo (Nube)
       try {
          const stateRes = await fetch('/api/user/state', { cache: 'no-store' });
          if (stateRes.ok) {
             const stateData = await stateRes.json();
             if (stateData.demoData) {
                const parsed = typeof stateData.demoData === 'string' ? JSON.parse(stateData.demoData) : stateData.demoData;
                if (parsed.uploadedCatalogs) setUploadedCatalogs(parsed.uploadedCatalogs);
             }
          }
       } catch (e) {
          console.log("Error sincronizando estado de usuario:", e);
       }
     } catch(err) {
       console.log('Sin sesión activa aún...', err);
     }
  };

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
      
      // Hydrate profile securely from DB immediately after successful login
      await loadUserProfile();

      localStorage.setItem('easy_currentView', 'dashboard');
      setCurrentView('dashboard');
      
    } catch (e) {
      setAuthError('Error de red. Revisa tu conexión.');
    }
  };

  // Compresión en el cliente para Avatares y Logos
  const compressImage = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      if (event.target?.result) {
         img.src = event.target.result as string;
      }
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; // Resolución optimizada para cabecera
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Formato WEBP al 70% para reducir drásticamente el peso (Kilobytes en vez de Megabytes)
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        callback(dataUrl);
      };
    };
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => setClientLogo(base64));
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, (base64) => setAvatarUrl(base64));
    }
  };

  // Helpers para Banderas ISO
  const getFlagCode = (c: string) => {
    if (!c) return 'cl';
    const t = c.toLowerCase().trim();
    if (t === 'chile') return 'cl';
    if (t === 'perú' || t === 'peru') return 'pe';
    if (t === 'colombia') return 'co';
    if (t === 'ecuador') return 'ec';
    if (t === 'méxico' || t === 'mexico') return 'mx';
    if (t === 'argentina') return 'ar';
    return t; 
  };

  const getCountryName = (c: string) => {
    if (!c) return 'CHILE';
    const o: Record<string, string> = { cl: 'CHILE', pe: 'PERÚ', co: 'COLOMBIA', ec: 'ECUADOR', mx: 'MÉXICO', ar: 'ARGENTINA' };
    return o[c.toLowerCase().trim()] || c.toUpperCase();
  };

  // Dashboard states
  const [activeTab, setActiveTab] = useState('oportunidades');
  const [showPipelineModal, setShowPipelineModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [regionalViewMode, setRegionalViewMode] = useState<'list' | 'map'>('list');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  // Estados para el flujo de Voz IA (Local RAM)
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{id?: string, name: string, country: string} | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<{id: string, title: string, amount: string} | null>(null);
  const [marketOppFilter, setMarketOppFilter] = useState<'ACTIVOS' | 'GANADOS' | 'PERDIDOS'>('GANADOS');
  const [hoveredMapCountry, setHoveredMapCountry] = useState<string | null>(null);
  const [pendingLostOpp, setPendingLostOpp] = useState<any>(null);
  const [newTimelineItems, setNewTimelineItems] = useState<any[]>([]);
  const [expandedTimelineItems, setExpandedTimelineItems] = useState<string[]>([]);
  const [performanceScope, setPerformanceScope] = useState<string>('regional');
  const [newCountryTimelineItems, setNewCountryTimelineItems] = useState<any[]>([]);
  const [isOpeningMarket, setIsOpeningMarket] = useState(false);
  const [uploadedCatalogs, setUploadedCatalogs] = useState<{name: string, size: string}[]>([]);
  
  // Estados para simular Inputs del Formulario Action Modal
  const [draftActivity, setDraftActivity] = useState("");
  const [draftAction, setDraftAction] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [calendarViewMode, setCalendarViewMode] = useState<'grid' | 'list'>('grid');

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [draftOppTitle, setDraftOppTitle] = useState("");
  
  useEffect(() => {
     if (selectedCountry) setIsOpeningMarket(false);
  }, [selectedCountry]);
  const [draftOppAmount, setDraftOppAmount] = useState("");
  
  const [clients, setClients] = useState<any[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [draftClientName, setDraftClientName] = useState("");
  const [openClientFormId, setOpenClientFormId] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState("");
  const [inlineEditAmount, setInlineEditAmount] = useState("");
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [clientFilterMode, setClientFilterMode] = useState<'ACTIVOS' | 'INACTIVOS'>('ACTIVOS');

  const refreshOpportunities = async () => {
      const opps = await getOpportunities();
      setOpportunities(opps);
  };
  const refreshClients = async () => {
      const cls = await getClients();
      setClients(cls);
  };

  // 1. Cargar el Perfil del Usuario SIEMPRE al iniciar, para pre-llenar de ser posible si hay cookie
  useEffect(() => {
     loadUserProfile();
  }, []); // Run on mount

  // 2. Cargar datos de negocio cuando estamos en el dashboard
  useEffect(() => {
     if (currentView === 'onboarding' && email === 'pdiazg46@gmail.com') {
         getAllUsers().then(u => setAdminUsers(u)).catch(console.error);
     }
     if (currentView === 'dashboard') {
        // Cargar Tareas, Clientes y Oportunidades
        getActivities().then(activities => {
           const mapped = activities.map((a: any) => ({
              id: a.id,
              title: a.extractedAction || "Compromiso",
              content: a.rawAudioText || "",
              date: a.commitmentDate ? new Date(a.commitmentDate).toISOString().split('T')[0] : "",
              completed: a.completed,
              createdAt: a.createdAt,
              opportunityId: a.opportunityId,
              clientId: a.clientId
           }));
           setTodayTasks(mapped);
        }).catch(err => console.error("Error cargando actividades:", err));

        refreshOpportunities();
        refreshClients();
     }
  }, [currentView]);

  const baseCountries = [
      { name: 'México', coordinates: [-102.5528, 23.6345] },
      { name: 'Colombia', coordinates: [-74.2973, 4.5709] },
      { name: 'Perú', coordinates: [-75.0152, -9.1900] },
      { name: 'Chile', coordinates: [-71.5430, -35.6751] },
      { name: 'Argentina', coordinates: [-63.6167, -38.4161] },
      { name: 'Brasil', coordinates: [-51.9253, -14.2350] },
      { name: 'Ecuador', coordinates: [-78.1834, -1.8312] },
      { name: 'Bolivia', coordinates: [-63.5887, -16.2902] },
      { name: 'Paraguay', coordinates: [-58.4438, -23.4425] },
      { name: 'Uruguay', coordinates: [-55.7658, -32.5228] },
      { name: 'Venezuela', coordinates: [-66.5897, 6.4238] },
      { name: 'Panamá', coordinates: [-80.7821, 8.5380] },
      { name: 'Costa Rica', coordinates: [-83.7534, 9.7489] },
      { name: 'Guatemala', coordinates: [-90.2308, 15.7835] },
      { name: 'Honduras', coordinates: [-86.2419, 15.2000] },
      { name: 'El Salvador', coordinates: [-88.8965, 13.7942] },
      { name: 'Nicaragua', coordinates: [-85.2072, 12.8654] },
      { name: 'República Dominicana', coordinates: [-70.1627, 18.7357] },
      { name: 'Cuba', coordinates: [-79.8282, 21.5218] },
      { name: 'Puerto Rico', coordinates: [-66.5901, 18.2208] },
   ];

   const isHistorial = activeTab === 'historial';

   const isDateInTimeframe = (dateStr: string | null | undefined, timeframe: string) => {
      if (!dateStr) return true; 
      const date = new Date(dateStr);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const dateYear = date.getFullYear();
      const dateMonth = date.getMonth();

      switch (timeframe) {
         case 'week': {
            const startOfWeek = new Date(now);
            const currentDay = now.getDay() || 7;
            startOfWeek.setDate(now.getDate() - currentDay + 1);
            startOfWeek.setHours(0,0,0,0);
            return date.getTime() >= startOfWeek.getTime();
         }
         case 'month': return dateYear === currentYear && dateMonth === currentMonth;
         case 'last_month':
            if (currentMonth === 0) return dateYear === currentYear - 1 && dateMonth === 11;
            return dateYear === currentYear && dateMonth === currentMonth - 1;
         case 'year': return dateYear === currentYear;
         case 'last_year': return dateYear === currentYear - 1;
         case 'all': return true;
         default: return true;
      }
   };

   const pipelineOpps = opportunities.filter(o => {
      if (isHistorial) {
         if (o.status !== (marketOppFilter === 'PERDIDOS' ? 'PERDIDO' : 'GANADO')) return false;
         return isDateInTimeframe(o.statusUpdatedAt, historialTimeframe);
      } else {
         return o.status === 'PROSPECTO' || o.status === 'COTIZADO';
      }
   });

   const totalPipeline = pipelineOpps.reduce((acc, curr) => acc + curr.amountUsd, 0);
   const activeProjects = pipelineOpps.length;

   const activeCountriesMetrics = baseCountries.map(c => {
      const opps = opportunities.filter(o => {
         if (o.client?.country !== c.name) return false;
         if (isHistorial) {
            return o.status === (marketOppFilter === 'PERDIDOS' ? 'PERDIDO' : 'GANADO') && isDateInTimeframe(o.statusUpdatedAt, historialTimeframe);
         } else {
            return o.status === 'PROSPECTO' || o.status === 'COTIZADO';
         }
      });
      const totalValueUsd = opps.reduce((acc, curr) => acc + curr.amountUsd, 0);
      return {
         ...c,
         opps,
         totalValueUsd,
         totalProjects: opps.length,
         value: totalValueUsd > 0 ? `$${(totalValueUsd/1000).toFixed(0)}K` : '0',
         isActive: totalValueUsd > 0
      };
   }).filter(m => m.isActive).sort((a,b) => b.totalValueUsd - a.totalValueUsd);

   const globalActiveOpps = opportunities.filter(o => o.status === 'PROSPECTO' || o.status === 'COTIZADO');
   const globalTotalUsd = globalActiveOpps.reduce((acc, curr) => acc + curr.amountUsd, 0);
   const globalTotalProjects = globalActiveOpps.length;

   const getHistorialTitle = () => {
      const typeStrEs = marketOppFilter === 'PERDIDOS' ? 'PERDIDOS' : 'GANADOS';
      const typeStrEn = marketOppFilter === 'PERDIDOS' ? 'LOST' : 'WON';
      switch (historialTimeframe) {
         case 'week': return lang === 'es' ? `${typeStrEs} ESTA SEMANA` : `${typeStrEn} THIS WEEK`;
         case 'month': return lang === 'es' ? `${typeStrEs} ESTE MES` : `${typeStrEn} THIS MONTH`;
         case 'last_month': return lang === 'es' ? `${typeStrEs} MES ANTERIOR` : `${typeStrEn} LAST MONTH`;
         case 'year': return lang === 'es' ? `${typeStrEs} ESTE AÑO` : `${typeStrEn} THIS YEAR`;
         case 'last_year': return lang === 'es' ? `${typeStrEs} AÑO ANTERIOR` : `${typeStrEn} LAST YEAR`;
         case 'all': return lang === 'es' ? 'HISTORIAL COMPLETO' : 'ALL TIME HISTORICAL';
         default: return lang === 'es' ? `PROYECTOS ${typeStrEs}` : `${typeStrEn} PROJECTS`;
      }
   };

   // PERSISTENCIA HÍBRIDA: Perfil en PostgreSQL, Tareas en RAM temporal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('easy_currentView');
      const savedPro = localStorage.getItem('easy_isPro');
      if (savedView === 'dashboard') setCurrentView('dashboard');
      else if (savedView === 'onboarding') setCurrentView('onboarding');
      setIsProUser(savedPro === 'true');

      // La configuración ahora se carga en el useEffect que depende de currentView === 'dashboard'

      // 2. [DEPRECATED] Cargar Timeline desde caché. Se removió para evitar sobrescritura de la Nube (Race Condition). El Cloud ahora es Single-Source-of-Truth.
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentView === 'dashboard') {
      const stateObj = { uploadedCatalogs };
      localStorage.setItem('easy_demo_data', JSON.stringify(stateObj));
      fetch('/api/user/state', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ demoData: stateObj })
      }).catch(() => {});
    }
  }, [uploadedCatalogs]);

  // Referencia para la API nativa del navegador
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const activeMicFieldRef = useRef<'activity' | 'action'>('activity');
  const [recordingField, setRecordingField] = useState<'activity' | 'action' | null>(null);

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
          let finalStr = '';
          let interimStr = '';
          
          const mergeText = (currentFinal: string, newChunk: string) => {
             if (!currentFinal) return newChunk + ' ';
             const currentLower = currentFinal.trim().toLowerCase();
             const chunkLower = newChunk.trim().toLowerCase();
             
             if (chunkLower.startsWith(currentLower)) return newChunk + ' '; // Full Replacement (Android Behavior)
             
             const fWords = currentFinal.trim().split(' ');
             const cWords = newChunk.trim().split(' ');
             for (let overlap = Math.min(fWords.length, cWords.length); overlap > 0; overlap--) {
                const endF = fWords.slice(-overlap).join(' ').toLowerCase();
                const startC = cWords.slice(0, overlap).join(' ').toLowerCase();
                if (endF === startC) {
                   const remaining = cWords.slice(overlap);
                   return remaining.length > 0 ? currentFinal.trim() + ' ' + remaining.join(' ') + ' ' : currentFinal;
                }
             }
             return currentFinal + newChunk + ' ';
          };

          for (let i = 0; i < event.results.length; i++) {
            let chunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalStr = mergeText(finalStr, chunk);
            } else {
              interimStr += chunk;
            }
          }
          
          finalTranscriptRef.current = finalStr;

          if (activeMicFieldRef.current === 'action') {
             setDraftAction(finalStr + interimStr);
          } else {
             setDraftActivity(finalStr + interimStr);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Mic error:", event.error);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  // MOTOR PROTOTIPO DE NLP (Despliegue Fase 1) - Extrae compromisos y fechas del texto.
  const processVoiceWithFakeAI = (transcript: string, currentLang: string) => {
    const lowerText = transcript.toLowerCase();
    
    // 1. Extraer el Compromiso (Lo que sigue)
    let extractedAction = currentLang === 'es' ? "Acción registrada en terreno" : "Field recorded action";
    
    if (lowerText.includes("proyecto ganado") || lowerText.includes("ganamos el proyecto") || lowerText.includes("gané el proyecto") || lowerText.includes("ganamos el negocio")) {
       extractedAction = "Proyecto Ganado 🏆";
    } else if (lowerText.includes("motivo") && lowerText.includes("pérdida")) {
       extractedAction = "Motivo de pérdida de proyecto";
    }
    
    const actionKeywords = ["tengo que ", "necesito ", "debo ", "hay que ", "compromiso para ", "me comprometí a "];
    for (const keyword of actionKeywords) {
       if (lowerText.includes(keyword)) {
          const startIdx = lowerText.indexOf(keyword) + keyword.length;
          let actionStr = transcript.substring(startIdx).trim();
          
          // Limpiar hasta palabras temporales (cortar ahí)
          const wordsToClean = ["el próximo", "para el", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "mañana", "la próxima"];
          let truncateIdx = actionStr.length;
          for (const w of wordsToClean) {
              const idx = actionStr.toLowerCase().indexOf(w);
              if (idx !== -1 && idx < truncateIdx) truncateIdx = idx;
          }
          if (truncateIdx > 0 && truncateIdx < actionStr.length) {
             actionStr = actionStr.substring(0, truncateIdx).trim();
          }
          
          if (actionStr.length > 2) {
             extractedAction = actionStr.charAt(0).toUpperCase() + actionStr.slice(1);
          }
          break;
       }
    }

    // 2. Extraer la Fecha ("¿Para cuándo?")
    let extractedDate = "";
    const today = new Date();
    
    // Diccionario de meses
    const monthsMap: Record<string, number> = { "enero":0, "febrero":1, "marzo":2, "abril":3, "mayo":4, "junio":5, "julio":6, "agosto":7, "septiembre":8, "octubre":9, "noviembre":10, "diciembre":11 };

    // 1. "DD de [mes]" (Ej: 2 de abril, 15 de mayo)
    const matchExplicitDate = lowerText.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
    
    if (matchExplicitDate) {
       const day = parseInt(matchExplicitDate[1], 10);
       const month = monthsMap[matchExplicitDate[2]];
       let year = today.getFullYear();
       extractedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } 
    // 2. "mañana" o "para mañana"
    else if (lowerText.includes("mañana")) {
       const tmrw = new Date(today);
       tmrw.setDate(today.getDate() + 1);
       extractedDate = `${tmrw.getFullYear()}-${(tmrw.getMonth() + 1).toString().padStart(2, '0')}-${tmrw.getDate().toString().padStart(2, '0')}`;
    }
    // 3. "X de este mes"
    else if (lowerText.match(/(\d{1,2})\s+de\s+este\s+mes/)) {
       const matchDayThisMonth = lowerText.match(/(\d{1,2})\s+de\s+este\s+mes/);
       const day = parseInt(matchDayThisMonth![1], 10);
       extractedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } 
    // 4. "próximo lunes" o "el lunes"
    else {
        const daysMap: Record<string, number> = { "domingo":0, "lunes":1, "martes":2, "miércoles":3, "miercoles": 3, "jueves":4, "viernes":5, "sábado":6, "sabado": 6 };
        for (const [dayName, dayNum] of Object.entries(daysMap)) {
            if (lowerText.includes(`próximo ${dayName}`) || lowerText.includes(`proximo ${dayName}`) || lowerText.includes(`el ${dayName}`)) {
                let diff = dayNum - today.getDay();
                if (diff <= 0) diff += 7; 
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + diff);
                
                // Si la persona dijo un número explícito del calendario ej: "lunes 30"
                const matchNumber = lowerText.match(new RegExp(`${dayName}\\s+(\\d{1,2})`));
                if (matchNumber) {
                   nextDate.setDate(parseInt(matchNumber[1], 10)); // Force the exact month day
                }

                extractedDate = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}-${nextDate.getDate().toString().padStart(2, '0')}`;
                break;
            }
        }
    }
    
    return { action: extractedAction, date: extractedDate };
  };

  const handleMicClick = (field: 'activity' | 'action' = 'activity') => {
    setEditingTask(null);
    
    if (!isRecording) {
      activeMicFieldRef.current = field;
      setRecordingField(field);
      setIsRecording(true);
      finalTranscriptRef.current = '';
      
      if (field === 'activity') {
        setDraftActivity("");
        setDraftAction(lang === 'es' ? "Acción registrada en terreno" : "Field recorded action");
      } else {
        setDraftAction(lang === 'es' ? "Escuchando..." : "Listening...");
      }
      
      // Iniciar escucha real
      if (recognitionRef.current) {
         try { recognitionRef.current.start(); } catch(e){}
      }
    } else {
      setIsRecording(false);
      setRecordingField(null);
      setIsProcessingVoice(true);
      
      // Detener escucha real
      if (recognitionRef.current) {
         try { recognitionRef.current.stop(); } catch(e){}
      }

      // Simulamos latencia de procesamiento estructural de la IA
      setTimeout(() => {
        setIsProcessingVoice(false);
        
        if (activeMicFieldRef.current === 'activity') {
            setDraftActivity(prevActivity => {
               const finalAct = prevActivity.trim();
               if (!finalAct && !finalTranscriptRef.current) {
                  return lang === 'es' ? "No se detectó audio (Permiso denegado o micrófono apagado). Escribe manualmente." : "No audio detected. Please type manually.";
               }
               
               // Procesar Texto con Motor NLP Fake
               const result = processVoiceWithFakeAI(finalAct, lang);
               if (result.action && result.action !== "Acción registrada en terreno" && result.action !== "Field recorded action") {
                  setDraftAction(result.action);
               }
               if (result.date) {
                  setDraftDate(result.date);
               }
               
               return finalAct;
            });
            setShowActionModal(true);
        } else if (activeMicFieldRef.current === 'action') {
            setDraftAction(prevAction => {
               const finalTxt = prevAction.trim();
               const result = processVoiceWithFakeAI(finalTxt, lang);
               if (result.date) setDraftDate(result.date);
               
               let cleanAction = finalTxt;
               const wordsToClean = [" el próximo", " para el", " el lunes", " el martes", " el miércoles", " el jueves", " el viernes", " mañana", " la próxima", " para el próximo"];
               let truncateIdx = finalTxt.length;
               for (const w of wordsToClean) {
                   const idx = cleanAction.toLowerCase().indexOf(w);
                   if (idx !== -1 && idx < truncateIdx) truncateIdx = idx;
               }
               if (truncateIdx > 0 && truncateIdx < cleanAction.length) {
                   cleanAction = cleanAction.substring(0, truncateIdx).trim();
               }
               
               if (cleanAction === "Escuchando..." || cleanAction === "Listening...") return "";
               return cleanAction || finalTxt;
            });
        }
      }, 1500);
    }
  };

  const handleSaveLocal = async () => {
    setShowActionModal(false);
    setShowToast(true);
    
    if (!editingTask) {
      try {
          const newAct = await createActivity({
             extractedAction: draftAction,
             rawAudioText: draftActivity,
             commitmentDateStr: draftDate || undefined,
             clientId: selectedClient ? selectedClient.id : undefined,
             opportunityId: selectedOpportunity ? selectedOpportunity.id : undefined
          });

          const formatted = {
            id: newAct.id,
            title: newAct.extractedAction || draftAction,
            content: newAct.rawAudioText || draftActivity,
            date: newAct.commitmentDate ? new Date(newAct.commitmentDate).toISOString().split('T')[0] : draftDate,
            completed: newAct.completed,
            createdAt: newAct.createdAt,
            opportunityId: newAct.opportunityId,
            clientId: newAct.clientId
          };

          setTodayTasks(prev => [formatted, ...prev]);

          if (selectedClient) {
             setNewTimelineItems(prev => [formatted, ...prev]);
          } else if (selectedCountry) {
             const now = new Date();
             const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
             
             setNewCountryTimelineItems(prev => [{
                ...formatted,
                date: `Hoy, ${timeString}`
             }, ...prev]);
          }
      } catch (err) {
          console.error("No se pudo guardar la actividad en la base de datos", err);
      }
      
      // Hook en grabar si es que estábamos justificando una pérdida
      if (pendingLostOpp) {
          setOpportunities(prev => prev.map(o => o.id === pendingLostOpp.id ? {...o, status: 'PERDIDO', statusUpdatedAt: new Date()} : o));
          setTodayTasks(prev => prev.map(t => t.opportunityId === pendingLostOpp.id ? { ...t, completed: true } : t));
          try { await updateOpportunityStatus(pendingLostOpp.id, 'PERDIDO'); } catch(err) { console.error(err) }
          setPendingLostOpp(null);
      }
      
    } else {
      setTodayTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, title: draftAction, content: draftActivity, date: draftDate } : t));
      if (typeof editingTask.id === 'string') {
         try {
            await updateActivity(editingTask.id, {
               extractedAction: draftAction,
               rawAudioText: draftActivity,
               commitmentDateStr: draftDate || ""
            });
         } catch(err) {
            console.error("Error updating activity:", err);
         }
      }
      setEditingTask(null);
    }

    // Ocultar toast de confirmación luego de 3 segundos
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteTask = async () => {
     if (!editingTask) return;
     if (window.confirm(lang === 'es' ? '¿Estás seguro de que deseas eliminar este registro permanentemente?' : 'Are you sure you want to delete this record permanently?')) {
        if (typeof editingTask.id === 'string') {
           try { await deleteActivity(editingTask.id); } catch(e) { console.error("Error deleting", e); }
        }
        setTodayTasks(prev => prev.filter(t => t.id !== editingTask.id));
        setNewTimelineItems(prev => prev.filter(t => t.id !== editingTask.id));
        setNewCountryTimelineItems(prev => prev.filter(t => t.id !== editingTask.id));
        setEditingTask(null);
        setShowActionModal(false);
     }
  };

  const renderCalendarGrid = () => {
    const today = new Date();
    const viewDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
    
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    const monthName = viewDate.toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US', { month: 'long', year: 'numeric' });
    
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`empty-${i}`} className="h-[96px] sm:h-[110px] border border-slate-100 bg-slate-50/50"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${currentYear}-${(currentMonth+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayTasks = todayTasks.filter(t => t.date === dStr);
        const isToday = day === today.getDate();
        
        cells.push(
            <div key={`day-${day}`} className={`h-[96px] sm:h-[110px] border border-slate-100 p-1 relative flex flex-col ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
                <span className={`text-[10px] font-bold mx-auto mb-1 flex items-center shrink-0 justify-center ${isToday ? 'text-white w-5 h-5 bg-[#1E3A8A] rounded-full shadow-sm' : 'text-slate-500'}`}>{day}</span>
                <div className="flex-1 overflow-y-auto flex gap-1 flex-col content-start hide-scrollbar pb-2">
                    {dayTasks.map(task => (
                        <div key={task.id} 
                             onClick={(e) => {
                               e.stopPropagation();
                               setShowCalendarModal(false);
                               setEditingTask(task);
                               setDraftAction(task.title || "");
                               setDraftActivity(task.content || "");
                               setDraftDate(task.date || "");
                               setShowActionModal(true);
                             }}
                             className={`w-full truncate text-[8px] sm:text-[9px] font-bold tracking-wider text-white px-1.5 py-1 rounded cursor-pointer transition-colors shadow-sm ${task.completed ? 'bg-emerald-500/90 hover:bg-emerald-600 border border-emerald-600 border-dashed' : 'bg-[#F59E0B] hover:bg-amber-600'}`}
                             title={task.title}
                        >
                            {task.title || 'Compromiso'}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-[0_4px_25px_rgb(0,0,0,0.04)]">
            <div className="bg-slate-50 border-b border-slate-100 py-2.5 px-4 flex items-center justify-between text-[#1E3A8A]">
                <button 
                  onClick={() => setCalendarMonthOffset(prev => prev - 1)} 
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                   <ChevronLeft size={20} className="text-slate-500" />
                </button>
                <div className="text-center uppercase tracking-widest font-black text-sm flex-1">
                   {monthName}
                </div>
                <button 
                  onClick={() => setCalendarMonthOffset(prev => prev + 1)} 
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                   <ChevronRight size={20} className="text-slate-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="py-2 text-center text-[10px] sm:text-xs font-bold text-slate-400">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 overflow-y-auto bg-slate-100 gap-[1px]">
                {cells}
            </div>
        </div>
    );
  };

  // Helper renderizador de clientes (Reutilizado en Vista Local y Vista País)
  const renderClientsForCountry = (targetCountry: string | null) => {
     if (!targetCountry) return null;

     const clientIsActive = (clientId: string) => {
        const opps = opportunities.filter(o => o.clientId === clientId);
        if (opps.length === 0) return true; // Nuevos clientes de inmediato a Activos
        return opps.some(o => o.status === 'PROSPECTO' || o.status === 'COTIZADO');
     };

     const countryClients = clients.filter((c: any) => c.country === targetCountry);
     const filteredClients = countryClients.filter((c: any) => 
        clientFilterMode === 'ACTIVOS' ? clientIsActive(c.id) : !clientIsActive(c.id)
     );

     return (
                     <div>
                       <div className="flex justify-between items-center mb-4 pr-1 mt-2">
                          <div className="flex flex-col gap-1.5">
                             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">{lang === 'es' ? 'Canales / Distribuidores' : 'Channels / Distributors'}</h3>
                             {countryClients.length > 0 && (
                               <div className="flex bg-slate-100/80 p-0.5 w-max rounded-[10px] shadow-inner ml-1">
                                  <button 
                                    onClick={() => setClientFilterMode('ACTIVOS')}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${clientFilterMode === 'ACTIVOS' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                  >
                                    {lang === 'es' ? 'Activos' : 'Active'}
                                  </button>
                                  <button 
                                    onClick={() => setClientFilterMode('INACTIVOS')}
                                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${clientFilterMode === 'INACTIVOS' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                                  >
                                    {lang === 'es' ? 'Inactivos' : 'Inactive'}
                                  </button>
                               </div>
                             )}
                          </div>
                          <div className="flex items-center gap-2 self-start mt-1">
                             <button 
                               onClick={() => setShowClientForm(!showClientForm)}
                               className="bg-corporate-purple text-white text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm"
                             >
                                {showClientForm ? (lang === 'es' ? 'Cancelar' : 'Cancel') : (lang === 'es' ? '+ Nuevo Cliente' : '+ New Client')}
                             </button>
                          </div>
                       </div>
                       
                       <AnimatePresence>
                          {showClientForm && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                                   <input 
                                     type="text" 
                                     placeholder={lang === 'es' ? 'Ej. Telefónica S.A.' : 'E.g. Telefonica Inc.'}
                                     className="w-full bg-white border border-slate-200 text-sm px-4 py-2.5 rounded-xl font-medium outline-none text-[#1E3A8A]"
                                     value={draftClientName}
                                     onChange={e => setDraftClientName(e.target.value)}
                                   />
                                   <button 
                                     className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 mt-1"
                                     onClick={async () => {
                                        if(!draftClientName) return;
                                        await createClient({
                                            name: draftClientName,
                                            country: targetCountry
                                        });
                                        setDraftClientName("");
                                        setShowClientForm(false);
                                        refreshClients();
                                     }}
                                   >
                                      {lang === 'es' ? 'Guardar Cliente' : 'Save Client'}
                                   </button>
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>

                       <div className="space-y-4">
                         {countryClients.length === 0 ? (
                           <p className="text-[11px] text-slate-400 font-medium italic tracking-wide px-1">
                             {lang === 'es' ? 'No hay clientes registrados en este país.' : 'No clients registered in this country.'}
                           </p>
                         ) : filteredClients.length === 0 ? (
                           <p className="text-[11px] text-slate-400 font-medium italic tracking-wide px-1">
                             {lang === 'es' ? `No hay clientes ${clientFilterMode.toLowerCase()}.` : `No ${clientFilterMode.toLowerCase()} clients.`}
                           </p>
                         ) : (
                           filteredClients.map((client: any) => (
                             <div key={client.id} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] text-left flex flex-col gap-3 group">
                                <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-extrabold text-[#1E3A8A] text-[15px] cursor-pointer hover:text-corporate-purple transition-colors active:scale-95" onClick={() => setSelectedClient(client)}>{client.name}</h4>
                                  <button onClick={() => setOpenClientFormId(openClientFormId === client.id ? null : client.id)} className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1 hover:bg-emerald-100 transition-colors">
                                     + {lang === 'es' ? 'Oportunidad' : 'Opportunity'}
                                  </button>
                                </div>
                                
                                <AnimatePresence>
                                   {openClientFormId === client.id && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2">
                                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                                            <input 
                                              type="text" 
                                              placeholder={lang === 'es' ? 'Título (Ej. Servidores)' : 'Title (E.g. Servers)'}
                                              className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg font-medium outline-none text-[#1E3A8A]"
                                              value={draftOppTitle}
                                              onChange={e => setDraftOppTitle(e.target.value)}
                                            />
                                            <div className="relative">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">$</span>
                                              <input 
                                                type="text" 
                                                placeholder={lang === 'es' ? 'Monto USD' : 'USD Amount'}
                                                className="w-full bg-white border border-slate-200 text-xs px-6 py-2 rounded-lg font-medium outline-none text-[#1E3A8A]"
                                                value={draftOppAmount}
                                                onFocus={e => e.target.select()}
                                                onChange={e => {
                                                   const val = e.target.value.replace(/\D/g, "");
                                                   setDraftOppAmount(val ? parseInt(val, 10).toLocaleString("en-US") : "");
                                                }}
                                              />
                                            </div>
                                            <button 
                                              className="w-full bg-[#1E3A8A] text-white py-2 rounded-lg font-bold uppercase text-[10px]"
                                              onClick={async () => {
                                                 if(!draftOppTitle || !draftOppAmount) return;
                                                 await createOpportunity({
                                                     title: draftOppTitle,
                                                     amountUsd: parseFloat(draftOppAmount.replace(/\D/g, "")),
                                                     clientId: client.id
                                                 });
                                                 setDraftOppTitle("");
                                                 setDraftOppAmount("");
                                                 setOpenClientFormId(null);
                                                 refreshOpportunities();
                                              }}
                                            >
                                               {lang === 'es' ? 'Guardar' : 'Save'}
                                            </button>
                                         </div>
                                      </motion.div>
                                   )}
                                </AnimatePresence>

                                {/* Lista de oportunidades */}
                                <div className="flex flex-col gap-2 mt-2">
                                  {(() => {
                                      const clientOppsFiltered = opportunities.filter(o => o.clientId === client.id).filter(o => { if (activeTab === 'historial') { return o.status === (marketOppFilter === 'PERDIDOS' ? 'PERDIDO' : 'GANADO') && isDateInTimeframe(o.statusUpdatedAt, historialTimeframe); } else { return o.status === 'PROSPECTO' || o.status === 'COTIZADO'; } });
                                      if (clientOppsFiltered.length === 0) return <p className="text-[10px] text-slate-400 font-medium italic">{lang === 'es' ? 'Sin oportunidades en esta vista.' : 'No opportunities in this view.'}</p>;
                                      return clientOppsFiltered.map(opp => (
                                          <div key={opp.id} onClick={() => { setSelectedClient(client); setSelectedOpportunity({id: opp.id, title: opp.title, amount: opp.amountUsd.toString()}); }} className="bg-slate-50 p-3 rounded-[12px] border border-slate-200/60 transition-all hover:bg-slate-100 hover:border-corporate-purple/40 hover:shadow-md cursor-pointer active:scale-95">
                                             <div className="flex justify-between items-start mb-2 pointer-events-none">
                                                <span className="font-extrabold text-[#1E3A8A] text-[11px] leading-tight flex-1 pr-2">{opp.title}</span>
                                                <span className="font-bold text-corporate-purple text-[12px]">${opp.amountUsd.toLocaleString('en-US')}</span>
                                             </div>
                                             <div className="flex gap-1 bg-white p-1 rounded-full border border-slate-100 shadow-sm" onClick={e => e.stopPropagation()}>
                                               {['PROSPECTO', 'COTIZADO', 'GANADO', 'PERDIDO'].map(status => (
                                                  <div key={status} className={`flex-1 flex justify-center py-1 rounded-full transition-all text-[8px] sm:text-[9px] font-bold ${opp.status === status ? (status === 'GANADO' ? 'bg-emerald-500 text-white shadow-sm' : status === 'PERDIDO' ? 'bg-rose-500 text-white shadow-sm' : 'bg-[#1E3A8A] text-white shadow-sm') : 'text-slate-300'}`}>
                                                     {status.substring(0,3)}
                                                  </div>
                                               ))}
                                             </div>
                                          </div>
                                      ));
                                  })()}
                                </div>
                             </div>
                           ))
                         )}
                       </div>
                     </div>
     );
  };

  // Lógica reutilizable del Mapa Geográfico
  const renderGeoMap = (isFullscreen: boolean) => {
    // Usamos las métricas globales precalculadas activeCountriesMetrics
    
    // Forzamos un centro si no hay marcadores para que se vea LATAM
    const autoCenterX = -75;
    const autoCenterY = activeCountriesMetrics.length > 0 ? (activeCountriesMetrics.reduce((sum, m) => sum + m.coordinates[1], 0) / activeCountriesMetrics.length) : -15;
    const autoZoom = isFullscreen ? 2.5 : 1.3;

    // Mostrar mapa vacío si no hay data de forma elegante, sin computar variables no usadas si no se necesitan

    return (
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: isFullscreen ? 320 : 280 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup 
          center={[autoCenterX, autoCenterY]} 
          zoom={autoZoom} 
          minZoom={0.5} 
          maxZoom={15} 
          translateExtent={[[-2000, -2000], [2000, 2000]]}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                // Color base, pero si hacemos match podríamos pintarlo
                const fill = "#E2E8F0";
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth={0.7 / autoZoom}
                    onMouseEnter={() => {
                        let countryName = geo.properties.name;
                        if (countryName === "Brazil") countryName = "Brasil";
                        if (countryName === "Mexico") countryName = "México";
                        if (countryName === "Peru") countryName = "Perú";
                        setHoveredMapCountry(countryName);
                    }}
                    onMouseLeave={() => setHoveredMapCountry(null)}
                    onClick={() => {
                        let countryName = geo.properties.name;
                        if (countryName === "Brazil") countryName = "Brasil";
                        if (countryName === "Mexico") countryName = "México";
                        if (countryName === "Peru") countryName = "Perú";
                        setSelectedCountry(countryName);
                    }}
                    style={{
                      default: { outline: "none", transition: "all 300ms ease" },
                      hover: { fill: "#cbd5e1", outline: "none", cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          
          {activeCountriesMetrics.map(({ name, coordinates, value, isActive }) => (
            <Marker key={name} coordinates={coordinates as [number, number]} onClick={() => setSelectedCountry(name)}>
              <g style={{ cursor: "pointer" }}>
                <rect x="-24" y="-15" width="48" height="28" fill={isActive ? "#7C3AED" : "#ffffff"} fillOpacity="0.95" rx="6" stroke={isActive ? "#6D28D9" : "#cbd5e1"} strokeWidth={0.5 / autoZoom} className="drop-shadow-sm" />
                <text textAnchor="middle" y="-3" style={{ fill: isActive ? "#ffffff" : "#64748b", opacity: isActive ? 0.9 : 1, fontSize: 5.5, fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", pointerEvents: "none" }}>
                   {name}
                </text>
                <text textAnchor="middle" y={8.5} style={{ fill: isActive ? "#ffffff" : "#0f172a", fontSize: 9, fontWeight: "900", letterSpacing: "-0.2px", pointerEvents: "none" }}>
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
    <div className={`min-h-[100dvh] w-full font-sans relative flex overflow-hidden bg-slate-100`}>
        {/* CONTENEDOR DE VISTAS */}
        <div className={`flex-1 relative overflow-hidden flex ${currentView === 'onboarding' && showMobilePanel ? 'w-full max-w-none flex-row bg-slate-900 items-start justify-start p-0' : 'flex-col max-w-md mx-auto bg-white shadow-2xl'}`}>
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
                      className={`text-xs font-semibold w-full text-center mb-4 py-2 rounded-lg border ${authError.includes('Validando') || authError.includes('Validating') ? 'text-blue-500 bg-blue-50 border-blue-100' : 'text-red-500 bg-red-50 border-red-100'}`}
                    >
                       {authError.includes('Validando') || authError.includes('Validating') ? '⏳' : '⚠️'} {authError}
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
                className={`absolute inset-0 flex flex-row px-0 pt-0 bg-transparent overflow-hidden`}
              >
                  {/* PANEL IZQUIERDO: CONFIGURACIÓN MÓVIL (PEGADO A LA IZQUIERDA) */}
                  <div className={`w-full ${showMobilePanel ? 'hidden sm:flex sm:max-w-md sm:h-[100dvh] sm:rounded-none sm:border-r border-slate-200' : 'h-full max-w-md mx-auto'} bg-white relative shrink-0 flex flex-col overflow-y-auto no-scrollbar pt-12 pb-10 px-7 shadow-2xl transition-all z-50`}>
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
                               <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight uppercase tracking-wider">{lang === 'es' ? <>Tu<br/>Foto</> : <>Your<br/>Photo</>}</span>
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
                         <input type="url" placeholder="https://cliente.com" value={clientWebsite} onChange={(e) => setClientWebsite(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-800 transition-all focus:outline-none focus:border-corporate-purple shadow-sm" />
                       </div>
                       <p className="text-xs font-medium text-slate-500 px-2 leading-relaxed mt-1">{lang === 'es' ? 'Esta URL será procesada por nuestro motor de IA para asistir tus gestiones.' : 'This URL will be processed by our AI engine to assist your daily management.'}</p>
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
                                  <span className="text-xs font-bold text-white uppercase tracking-wider">{lang === 'es' ? 'Cambiar Logo' : 'Change Logo'}</span>
                               </div>
                             </>
                          ) : (
                             <>
                                <UploadCloud size={36} className="mb-3 text-slate-300 group-hover:text-corporate-purple transition-colors" />
                                <span className="text-sm font-semibold text-slate-600 mb-1">{lang === 'es' ? 'Subir Imagen' : 'Upload Image'}</span>
                                <span className="text-xs font-medium text-slate-400">{lang === 'es' ? 'PNG o JPG (Max 2MB)' : 'PNG or JPG (Max 2MB)'}</span>
                             </>
                          )}
                       </label>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                       <div className="flex justify-between items-center ml-2 mb-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><UploadCloud size={14}/> {lang === 'es' ? 'Base de Conocimiento (RAG)' : 'Knowledge Base (RAG)'}</label>
                         <span className="bg-corporate-purple/10 text-corporate-purple text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">{lang === 'es' ? 'NUEVO' : 'NEW'}</span>
                       </div>
                       <p className="text-xs font-medium text-slate-500 px-2 leading-relaxed mb-3">{lang === 'es' ? 'Sube listas de precio o inventario. Nuestro motor extrae solo la tabla de datos, eliminando imágenes para máxima velocidad (RAG).' : 'Upload price lists or inventory. Our engine extracts only the data table, removing images for maximum speed (RAG).'}</p>
                       
                       <label className="border-2 border-dashed border-corporate-purple/30 bg-corporate-purple/5 rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-corporate-purple/10 transition-colors">
                          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" multiple onChange={(e) => {
                             if(e.target.files && e.target.files.length > 0) {
                               const arr = Array.from(e.target.files).map(f => {
                                 // Simulamos la reducción drástica al extraer "solo texto" de una lista
                                 const rawMb = f.size > 0 ? (f.size / (1024 * 1024)) : 1.5;
                                 const optimizedKb = Math.max(12, Math.round(rawMb * 25)); 
                                 return { name: f.name, size: `${optimizedKb} KB (Datos puros)` };
                               });
                               setUploadedCatalogs(prev => [...prev, ...arr]);
                             }
                          }} />
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-corporate-purple shrink-0">
                             <UploadCloud size={18} />
                          </div>
                          <div className="flex-1">
                             <span className="text-xs font-bold text-slate-700 block">{lang === 'es' ? 'Subir Lista (Data)' : 'Upload List (Data)'}</span>
                             <span className="text-[9px] text-slate-500 uppercase tracking-widest">Excel, CSV</span>
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

                 <div className="mt-8 mb-6 w-full flex flex-col justify-end gap-3 shrink-0">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                         try {
                           const res = await fetch('/api/user/profile', {
                             method: 'PUT',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                                country: userCountry,
                                clientUrl: clientWebsite,
                                logoUrl: clientLogo,
                                avatarUrl: avatarUrl
                             })
                           });
                           
                           if (!res.ok) {
                               const errData = await res.json();
                               alert('Error al grabar configuración: ' + (errData.error || res.statusText));
                               return; 
                           }
                           
                           localStorage.setItem('easy_currentView', 'dashboard');
                           setCurrentView('dashboard');
                         } catch(e) {
                           console.error(e);
                           alert("Tu conexión falló. Intenta nuevamente.");
                         }
                      }} 
                      className="bg-[#1E3A8A] text-white font-bold py-4 px-8 rounded-full shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 tracking-wide w-full"
                    >
                      {lang === 'es' ? 'GUARDAR CONFIGURACIÓN' : 'SAVE CONFIGURATION'}
                      <ArrowRight size={18} />
                    </motion.button>

                    <div className="flex flex-col w-full items-center justify-center mt-2 gap-3">
                      <button 
                        onClick={async () => {
                          localStorage.removeItem('easy_currentView');
                          setCurrentView('login');
                          await fetch('/api/auth/logout', { method: 'POST' });
                          window.location.reload();
                        }}
                        className="w-full text-slate-500 font-bold py-3 text-xs flex items-center justify-center gap-2 hover:text-red-500 transition-colors uppercase tracking-wider bg-slate-50 rounded-xl"
                      >
                        <LogOut size={16} />
                        {lang === 'es' ? 'CERRAR SESIÓN' : 'LOG OUT'}
                      </button>

                      {email?.toLowerCase().trim() === 'pdiazg46@gmail.com' && (
                        <button 
                          onClick={() => setShowMobilePanel(true)}
                          className="w-full text-corporate-purple font-bold py-3 px-4 text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors uppercase tracking-wider border border-corporate-purple/20 bg-corporate-purple/5 rounded-xl whitespace-nowrap shadow-sm"
                        >
                          <ShieldCheck size={16} />
                          {lang === 'es' ? 'VER USUARIOS' : 'USERS'}
                        </button>
                      )}
                    </div>
                 </div>
              </div>

              {/* PANEL DERECHO: ADMIN DE USUARIOS (SPLIT SCREEN O MODAL EN MOVIL) */}
              <AnimatePresence>
              {email?.toLowerCase().trim() === 'pdiazg46@gmail.com' && showMobilePanel && (
                  <motion.div 
                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                     className="fixed inset-0 sm:static sm:flex sm:flex-1 w-full flex-col p-4 md:p-8 lg:p-12 items-center justify-start overflow-y-auto relative bg-[#F8FAFC] z-[100] sm:z-auto sm:h-[100dvh] sm:rounded-none shadow-inner"
                  >
                     <div className="w-full flex flex-col mx-auto">
                         <button onClick={() => setShowMobilePanel(false)} className="mb-6 flex items-center gap-2 text-slate-500 font-bold self-start bg-white px-5 py-2.5 rounded-full text-xs shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                            <ChevronLeft size={16} /> {lang === 'es' ? 'Volver a mi perfil' : 'Back to Profile'}
                         </button>
                         <div className="w-full bg-white rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-[#1E3A8A] text-lg md:text-2xl font-black uppercase tracking-widest flex items-center gap-3">
                              <ShieldCheck size={28} className="text-corporate-purple hidden md:block" /> 
                              Super User Panel
                           </h2>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{adminUsers.length} Usuarios Activos</span>
                        </div>

                        <div className="w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm relative overflow-x-auto">
                           <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                             <thead>
                               <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
                                 <th className="px-5 py-4">Usuario</th>
                                 <th className="px-5 py-4">Suscripción</th>
                                 <th className="px-5 py-4">Antigüedad</th>
                                 <th className="px-5 py-4 text-center">Acciones</th>
                               </tr>
                             </thead>
                             <tbody>
                               {adminUsers.map(u => {
                                  const cDate = new Date(u.createdAt || Date.now());
                                  const now = new Date();
                                  const diffDays = Math.floor((now.getTime() - cDate.getTime()) / (1000 * 3600 * 24));
                                  const remainingTrials = Math.max(0, 7 - diffDays);
                                  const isLocked = remainingTrials === 0 && !u.isPro;

                                  let yearsTraj = now.getFullYear() - cDate.getFullYear();
                                  let monthsTraj = now.getMonth() - cDate.getMonth();
                                  let daysTraj = Math.floor((now.getTime() - cDate.getTime()) / (1000 * 60 * 60 * 24));
                                     
                                  if (now.getDate() < cDate.getDate()) monthsTraj -= 1;
                                  if (monthsTraj < 0) {
                                      yearsTraj -= 1;
                                      monthsTraj += 12;
                                  }
                                     
                                  let trajectoryStr = "";
                                  if (daysTraj <= 30 && monthsTraj === 0 && yearsTraj === 0) {
                                      trajectoryStr = daysTraj === 0 ? 'Trayectoria: Hoy' : `Trayectoria: ${daysTraj} día${daysTraj === 1 ? '' : 's'}`;
                                  } else if (yearsTraj === 0) {
                                      trajectoryStr = `Trayectoria: ${monthsTraj} mes${monthsTraj === 1 ? '' : 'es'}`;
                                  } else {
                                      trajectoryStr = `Trayectoria: ${yearsTraj} año${yearsTraj === 1 ? '' : 's'}${monthsTraj > 0 ? ` y ${monthsTraj} mes${monthsTraj === 1 ? '' : 'es'}` : ''}`;
                                  }

                                  let formattedProTime = "Suscripción Activa";
                                  if (u.proSince) {
                                     const proStart = new Date(u.proSince);
                                     let years = now.getFullYear() - proStart.getFullYear();
                                     let months = now.getMonth() - proStart.getMonth();
                                     let days = Math.floor((now.getTime() - proStart.getTime()) / (1000 * 60 * 60 * 24));
                                     
                                     if (now.getDate() < proStart.getDate()) {
                                        months -= 1;
                                     }
                                     if (months < 0) {
                                        years -= 1;
                                        months += 12;
                                     }

                                     if (days <= 30) {
                                        formattedProTime = days === 0 ? 'Pro desde hoy' : `Pro hace ${days} día${days === 1 ? '' : 's'}`;
                                     } else if (years === 0) {
                                        formattedProTime = `Pro hace ${months} mes${months === 1 ? '' : 'es'}`;
                                     } else {
                                        formattedProTime = `Pro hace ${years} año${years === 1 ? '' : 's'}${months > 0 ? ` y ${months} mes${months === 1 ? '' : 'es'}` : ''}`;
                                     }
                                  }

                                  return (
                                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                       <td className="px-5 py-4 text-sm font-bold text-[#1E3A8A] flex flex-col gap-0.5">
                                          {u.name}
                                          <span className="text-[10px] font-medium text-slate-400 leading-none mb-0.5">{u.email}</span>
                                          <span className="text-[10px] font-black text-corporate-purple uppercase tracking-widest mt-1">Ingresó: {cDate.toLocaleDateString('es-ES')}</span>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{trajectoryStr}</span>
                                       </td>
                                       <td className="px-5 py-4">
                                          {u.isPro ? (
                                             <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Pro</span>
                                          ) : isLocked ? (
                                             <span className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Bloqueado</span>
                                          ) : (
                                             <span className="bg-amber-50 text-amber-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border border-amber-200/50">Prueba Activa</span>
                                          )}
                                       </td>
                                       <td className="px-5 py-4 flex flex-col gap-1 items-start justify-center h-full">
                                          {u.isPro ? (
                                             <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                                                {formattedProTime}
                                             </span>
                                          ) : (
                                             <span className={`text-xs font-black ${isLocked ? 'text-red-500' : 'text-slate-600'}`}>
                                                {isLocked ? 'Venció' : `Quedan ${remainingTrials} días`}
                                             </span>
                                          )}
                                       </td>
                                       <td className="px-5 py-4 text-center">
                                          <button 
                                             onClick={async () => {
                                                await toggleUserProStatus(u.id, !u.isPro);
                                                const newUsers = await getAllUsers();
                                                setAdminUsers(newUsers);
                                             }}
                                             className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 mx-auto ${u.isPro ? 'bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-200' : 'bg-gradient-to-r from-corporate-purple to-[#1E3A8A] text-white hover:shadow-lg hover:scale-105 active:scale-95'}`}
                                          >
                                             {u.isPro ? 'REVOCAR SUSCRIPCIÓN' : 'REGALAR SUSCRIPCIÓN'}
                                          </button>
                                       </td>
                                    </tr>
                                  );
                               })}
                             </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
              </motion.div>
              )}
              </AnimatePresence>
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
                <div className="px-3 sm:px-5 pt-3 pb-3 flex justify-between items-center z-10 shrink-0">
                  {/* Left Logo */}
                  <div className="flex-1 flex justify-start items-center">
                    <div className="h-10 sm:h-12 flex items-center opacity-90 transition-opacity">
                       {clientLogo ? (
                          <img src={clientLogo} alt="Cliente" className="max-w-[100px] h-8 sm:h-10 object-contain object-left" />
                       ) : (
                          <div className="w-10 sm:w-14 h-10 sm:h-14 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                             <span className="text-[8px] sm:text-[10px] leading-tight text-center font-medium">Falta<br/>Logo</span>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Center Flag and Avatar */}
                  <div className="shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 mx-2">
                     <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 sm:px-2.5 shadow-sm">
                        <img src={`https://flagcdn.com/w20/${getFlagCode(userCountry)}.png`} alt="Bandera" className="w-4 h-auto rounded-sm shadow-[0_0_2px_rgba(0,0,0,0.2)]" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase hidden sm:inline-block">{getCountryName(userCountry)}</span>
                     </div>
                     <div 
                        onClick={() => setCurrentView('onboarding')}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-200 transition-colors relative group"
                     >
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                          {avatarUrl ? (
                             <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-[10px] sm:text-xs font-bold text-slate-600">P</span>
                          )}
                        </div>
                     </div>
                  </div>

                  {/* Right Logo */}
                  <div className="flex-1 flex justify-end items-center">
                    <img src="/logo_at_sit_full.png" alt="AT-SIT" className="h-8 sm:h-10 max-w-[90px] sm:max-w-[110px] object-contain object-right" />
                  </div>
                </div>

                {/* Título Central */}
                <div className="pb-3 shrink-0 bg-white flex flex-col items-center justify-center px-4 gap-1.5 pt-1">
                  <h1 className="text-[#1E3A8A] font-black text-[15px] sm:text-[18px] tracking-wide text-center">EASY MANAGEMENT AI</h1>
                  <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="bg-slate-50 text-[#1E3A8A] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm border border-slate-200 uppercase flex items-center gap-1 transition-colors hover:bg-slate-100">
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
                <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-5 pb-36 flex flex-col gap-4 sm:gap-6">
                  


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
                    <div className="flex items-center w-full">
                      <div className="w-[75%] pr-3 text-left overflow-hidden">
                        <p className="text-white/80 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-1 truncate">{activeTab === 'historial' ? getHistorialTitle() : t[lang].pipeline}</p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-baseline gap-1.5 truncate">${totalPipeline.toLocaleString('en-US')} <span className="text-sm font-bold opacity-80">USD</span></h2>
                      </div>
                      <div className="w-px h-12 bg-white/20 shrink-0"></div>
                      <div className="w-[25%] text-center pl-2 flex flex-col justify-center items-center shrink-0">
                        <p className="text-white/80 text-[7px] sm:text-[8px] font-bold uppercase tracking-widest mb-1 leading-tight">{activeTab === 'historial' ? (lang === 'es' ? 'PROYECTOS GANADOS' : 'WON PROJECTS') : t[lang].activeProj.split(' ')[0] + '\n' + t[lang].activeProj.split(' ')[1]}</p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold pb-0 leading-none">{activeProjects}</h2>
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
                        <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_4px_25px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                             <div className="relative group cursor-pointer flex-1 mr-2 max-w-xs">
                               <select 
                                 className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1E3A8A] text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wider outline-none cursor-pointer appearance-none rounded-xl py-2 pl-3 pr-8 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98]"
                                 value={performanceScope}
                                 onChange={(e) => setPerformanceScope(e.target.value)}
                               >
                                  <option value="regional">{lang === 'es' ? 'DESEMPEÑO REGIONAL (TODOS)' : 'REGIONAL PERFORMANCE (ALL)'}</option>
                                  {Array.from(new Map([getCountryName(userCountry), ...clients.map(c => c.country)].filter(Boolean).map(c => [c.trim().toLowerCase(), c.trim()])).values()).map(countryName => (
                                     <option key={countryName} value={countryName}>
                                        {(lang === 'es' ? 'DESEMPEÑO LOCAL • ' : 'LOCAL VIEW • ') + countryName}
                                     </option>
                                  ))}
                               </select>
                               <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1E3A8A] pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" />
                             </div>
                            
                            {performanceScope === 'regional' && (
                                <button 
                                  onClick={() => setRegionalViewMode(prev => prev === 'list' ? 'map' : 'list')}
                                  className="text-slate-400 hover:text-corporate-purple transition-colors p-1"
                                >
                                  {regionalViewMode === 'list' ? <MapIcon size={18} /> : <List size={18} />}
                                </button>
                            )}
                          </div>
                          
                          {performanceScope !== 'regional' ? (
                             <div className="mt-2 animate-in fade-in zoom-in-95 duration-300">
                                {renderClientsForCountry(performanceScope)}
                             </div>
                          ) : regionalViewMode === 'list' ? (
                            <div className="space-y-3">
                              {activeCountriesMetrics.length === 0 ? (
                                 <p className="text-[11px] text-slate-400 font-medium italic tracking-wide text-center py-4">{lang === 'es' ? 'No hay países con métricas activas' : 'No countries with active metrics'}</p>
                              ) : (
                                 activeCountriesMetrics.map(c => (
                                    <div key={c.name} onClick={() => setSelectedCountry(c.name)} className="flex flex-col gap-1.5 p-3.5 rounded-2xl border border-slate-100 bg-[#F8FAFC] hover:shadow-sm hover:border-corporate-purple/30 cursor-pointer transition-all">
                                       <div className="flex justify-between items-center mb-1 pointer-events-none">
                                          <span className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2">
                                             <MapPin size={14} className="text-corporate-purple" /> {c.name}
                                          </span>
                                          <span className="text-[13px] font-black text-emerald-600">${c.totalValueUsd.toLocaleString('en-US')}</span>
                                       </div>
                                       <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.totalProjects} {lang === 'es' ? 'Proyectos' : 'Projects'}</span>
                                          <div className="h-1.5 flex-1 mx-3 bg-slate-200 rounded-full overflow-hidden">
                                             <div 
                                                className="h-full bg-corporate-purple rounded-full" 
                                                style={{ width: `${(c.totalValueUsd / (globalTotalUsd || 1)) * 100}%` }}
                                             />
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-500">{((c.totalValueUsd / (globalTotalUsd || 1)) * 100).toFixed(0)}%</span>
                                       </div>
                                    </div>
                                 ))
                              )}
                               
                               <div className="flex justify-center mt-2 pt-2 border-t border-slate-100 border-dashed">
                                  <button 
                                     onClick={() => {
                                        setRegionalViewMode('map');
                                        setIsOpeningMarket(true);
                                     }}
                                     className="text-[11px] font-extrabold tracking-widest text-[#1E3A8A] uppercase bg-blue-50/80 hover:bg-blue-100 border border-blue-100 px-5 py-3 rounded-2xl w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm group"
                                  >
                                     <MapPin size={15} className="group-hover:scale-110 transition-transform" /> {lang === 'es' ? '+ ABRIR NUEVO MERCADO' : '+ OPEN NEW MARKET'}
                                  </button>
                               </div>

                            </div>
                          ) : (
                             <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner cursor-pointer group">
                                
                                <AnimatePresence>
                                   {isOpeningMarket && (
                                      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute top-3 left-3 right-3 z-20 pointer-events-none">
                                         <div className="bg-[#1E3A8A] text-white rounded-[16px] p-3 shadow-xl flex items-center gap-3 border border-blue-400/20 pointer-events-auto">
                                            <div className="bg-white/10 p-2 rounded-xl shrink-0">
                                               <MapPin size={18} className="text-blue-200 animate-bounce" />
                                            </div>
                                            <p className="text-[11px] font-medium leading-relaxed flex-1 tracking-wide">
                                               {lang === 'es' ? 'Pincha cualquier país en el mapa para iniciar tu operación.' : 'Tap any country on the map to start your operation.'}
                                            </p>
                                            <button onClick={(e) => { e.stopPropagation(); setIsOpeningMarket(false); }} className="text-white/50 hover:text-white shrink-0 p-1.5 bg-black/10 rounded-full transition-colors active:scale-90">
                                               <X size={14} />
                                            </button>
                                         </div>
                                      </motion.div>
                                   )}
                                </AnimatePresence>

                                {/* Botón Expandir a Pantalla Completa */}
                                <button 
                                   onClick={() => setIsMapFullscreen(true)}
                                   className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-[#1E3A8A] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Maximize2 size={16} strokeWidth={2.5} />
                                </button>
                                
                                {renderGeoMap(false)}

                                <AnimatePresence>
                                   {hoveredMapCountry && (
                                     <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1E3A8A] text-white text-[11px] font-bold py-1.5 px-3.5 rounded-xl shadow-lg border border-blue-800 tracking-wider pointer-events-none z-20"
                                     >
                                        {hoveredMapCountry}
                                     </motion.div>
                                   )}
                                </AnimatePresence>
                             </div>
                          )}
                        </div>

                        <div className="bg-white rounded-[24px] p-4 sm:p-6 shadow-[0_4px_25px_rgb(0,0,0,0.04)] border border-slate-100">
                          <div className="flex justify-between items-start sm:items-center mb-4 gap-2">
                            <h3 className="text-[12px] sm:text-sm font-bold text-slate-800 uppercase tracking-wide leading-tight">{lang === 'es' ? `Tareas de Hoy (${new Date().toLocaleDateString('es-CL', {day: '2-digit', month: 'short'}).replace('.', '')})` : `Today's Tasks (${new Date().toLocaleDateString('en-US', {month: 'short', day: '2-digit'})})`}</h3>
                            <button onClick={() => setShowCalendarModal(true)} className="text-[10px] sm:text-xs whitespace-nowrap font-semibold px-2.5 sm:px-3 py-1.5 shrink-0 bg-slate-50 text-[#1E3A8A] rounded-full border border-slate-200 shadow-sm transition-colors hover:bg-slate-100">{lang === 'es' ? 'VER CALENDARIO' : 'VIEW CALENDAR'}</button>
                          </div>
                          
                          {(() => {
                             const now = new Date();
                             const YYYY = now.getFullYear();
                             const MM = String(now.getMonth() + 1).padStart(2, '0');
                             const DD = String(now.getDate()).padStart(2, '0');
                             const todayLocalStr = `${YYYY}-${MM}-${DD}`;

                             const feedTasks = todayTasks.filter(t => {
                                const isFutureDate = t.date && t.date > todayLocalStr;
                                
                                // Si tiene fecha futura, se esconde del listado de HOY (se verá en el calendario)
                                if (isFutureDate && !t.completed) return false;

                                // 1. Si no está terminada y es para hoy, atrasada o no tiene fecha (por definir), la mostramos.
                                if (!t.completed) return true;
                                
                                // 2. Si ya está completada, sólo mostrarla si se completó/creó hoy o si era un compromiso para hoy
                                const cD = new Date(t.createdAt || Date.now());
                                const cStr = `${cD.getFullYear()}-${String(cD.getMonth() + 1).padStart(2, '0')}-${String(cD.getDate()).padStart(2, '0')}`;
                                return cStr === todayLocalStr || t.date === todayLocalStr;
                             });

                             return feedTasks.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-2">{lang === 'es' ? 'No hay compromisos pendientes para hoy.' : 'No pending tasks for today.'}</p>
                             ) : (
                                <div className="space-y-3">
                                   {feedTasks.map((task) => {
                                      const opp = opportunities.find(o => o.id === task.opportunityId);
                                      const oppName = opp ? (opp.title || opp.name) : null;
                                      return (
                                      <motion.div 
                                        key={task.id} 
                                        onClick={() => {
                                          setEditingTask(task);
                                          setDraftAction(task.title || "");
                                          setDraftActivity(task.content || "");
                                          setDraftDate(task.date || "");
                                          setShowActionModal(true);
                                        }}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col gap-1.5 p-4 rounded-2xl border shadow-sm cursor-pointer hover:border-[#1E3A8A]/30 hover:shadow-md transition-all active:scale-[0.98] ${task.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-[#F8FAFC] border-slate-200'}`}
                                      >
                                         <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                               <span className={`text-[13px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${task.completed ? 'text-emerald-500' : 'text-[#F59E0B]'}`}><Navigation size={14}/> {task.completed ? 'COMPLETADO' : 'COMPROMISO'}: {task.date ? task.date.split('-').reverse().join('/') : 'Por definir'}</span>
                                               <span className={`font-black text-xl leading-tight mb-2 ${task.completed ? 'text-emerald-700 line-through decoration-emerald-400 opacity-60' : 'text-[#1E3A8A]'}`}>{task.title}</span>
                                               <span className="text-[11px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><Lock size={12}/> Registrado: {new Date(task.createdAt || Date.now()).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US')} {new Date(task.createdAt || Date.now()).toLocaleTimeString(lang === 'es' ? 'es-CL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                               {(() => {
                                                  const client = clients.find(c => c.id === task.clientId || (opp && c.id === opp.clientId));
                                                  const clientName = client ? client.name : null;
                                                  return (clientName || oppName) ? (
                                                     <div className="flex flex-col gap-1 mt-2">
                                                        {clientName && (
                                                           <span className="text-[10px] text-blue-600 uppercase tracking-widest font-black flex items-center gap-1.5 bg-blue-100/50 px-2 py-0.5 rounded shrink-0 max-w-fit flex-wrap border border-blue-200/50">
                                                              👤 CLIENTE: {clientName}
                                                           </span>
                                                        )}
                                                        {oppName && (
                                                           <span className="text-[10px] text-corporate-purple uppercase tracking-widest font-black flex items-center gap-1.5 bg-corporate-purple/10 px-2 py-0.5 rounded shrink-0 max-w-fit flex-wrap border border-corporate-purple/20">
                                                              📁 PROYECTO: {oppName}
                                                           </span>
                                                        )}
                                                     </div>
                                                  ) : null;
                                               })()}
                                            </div>
                                        <button 
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            const newCompleted = !task.completed;
                                            setTodayTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));
                                            if (typeof task.id === 'string') {
                                                await toggleActivityCompletion(task.id, newCompleted);
                                            }
                                          }}
                                          className={`w-10 h-10 rounded-full border-[3px] bg-white shrink-0 ml-4 transition-colors flex items-center justify-center group shadow-inner hover:border-emerald-500 hover:bg-emerald-50 ${task.completed ? 'border-emerald-500' : 'border-slate-300'}`}
                                        >
                                           <div className={`w-5 h-5 rounded-full bg-emerald-500 transition-opacity flex items-center justify-center ${task.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                              {task.completed && <Check size={12} className="text-white" strokeWidth={4} />}
                                           </div>
                                        </button>
                                     </div>
                                  </motion.div>
                                   )
                                 })}
                              </div>
                           );
                          })()}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="historial" 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-6"
                      >
                         <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_4px_25px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                           <div className="flex flex-col gap-3 mb-4">
                             <div className="flex justify-between items-center">
                               <h3 className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wide flex items-center gap-2">
                                  {lang === 'es' ? 'Históricos' : 'Historical Data'}
                                  <select 
                                     value={marketOppFilter}
                                     onChange={e => setMarketOppFilter(e.target.value as any)}
                                     className="bg-transparent text-[#1E3A8A] border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md font-black uppercase outline-none cursor-pointer"
                                  >
                                     <option value="GANADOS">Ganados</option>
                                     <option value="PERDIDOS">Perdidos</option>
                                  </select>
                               </h3>
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
                              {activeCountriesMetrics.length === 0 ? (
                                 <p className="text-[11px] text-slate-400 font-medium italic tracking-wide text-center py-4">{lang === 'es' ? 'No hay historial disponible' : 'No history available'}</p>
                              ) : (
                                 activeCountriesMetrics.map(c => (
                                    <div key={c.name} onClick={() => setSelectedCountry(c.name)} className="flex flex-col gap-1.5 p-3.5 rounded-2xl border border-slate-100 bg-[#F8FAFC] hover:shadow-sm hover:border-[#1E3A8A]/30 cursor-pointer transition-all">
                                       <div className="flex justify-between items-center mb-1 pointer-events-none">
                                          <span className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2">
                                             <MapPin size={14} className="text-[#1E3A8A]" /> {c.name}
                                          </span>
                                          <span className="text-[13px] font-black text-[#1E3A8A] border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-2 py-0.5 rounded-lg">${c.totalValueUsd.toLocaleString('en-US')}</span>
                                       </div>
                                       <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.totalProjects} {lang === 'es' ? 'Proyectos' : 'Projects'}</span>
                                          <div className="h-1.5 flex-1 mx-3 bg-slate-200 rounded-full overflow-hidden">
                                             <div 
                                                className="h-full bg-[#1E3A8A] rounded-full" 
                                                style={{ width: `${(c.totalValueUsd / (totalPipeline || 1)) * 100}%` }}
                                             />
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-500">{((c.totalValueUsd / (totalPipeline || 1)) * 100).toFixed(0)}%</span>
                                       </div>
                                    </div>
                                 ))
                              )}
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
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-4 sm:pb-6 px-4 flex flex-col items-center pointer-events-none z-20">
                   <div className="pointer-events-auto flex items-end justify-center relative mb-2">
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
                        className="absolute -right-12 sm:-right-14 bottom-1 sm:bottom-2 w-10 h-10 sm:w-11 sm:h-11 bg-white border border-slate-200 text-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 z-0"
                      >
                         <Keyboard size={18} className="sm:w-5 sm:h-5" />
                      </motion.button>
                   </div>
                   <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-wider uppercase bg-white/50 px-2 py-0.5 rounded-full">{lang === 'es' ? 'Actividad Rápida (Voz o Texto)' : 'Quick Log (Voice/Text)'}</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

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
                  <div className="flex justify-between items-center mb-1">
                     <button onClick={() => setSelectedCountry(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors active:bg-slate-100 flex items-center">
                        <ChevronLeft size={24} strokeWidth={2.5}/>
                     </button>
                     <h2 className="text-xl font-bold text-[#1E3A8A]">{lang === 'es' ? 'Mercado' : 'Market'}: {selectedCountry}</h2>
                     <div className="w-8"></div> {/* Spacer para centrar el titulo */}
                  </div>
                  <p className="text-sm text-slate-500 mb-6 text-center">{lang === 'es' ? 'Selecciona un distribuidor o agrega una nota general.' : 'Select a distributor or add a general note.'}</p>

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

                     {/* Distribuidores y Clientes */}
                     {renderClientsForCountry(selectedCountry)}
                  </div>
                  {/* Botón flotante removido por instrucción de que las notas solo deban existir bajo Cliente u Oportunidad */}
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

                  {/* KPI Quick Stats Dinámicos */}
                  {(() => {
                     const clientOpps = opportunities.filter(o => o.client?.name === selectedClient?.name && (o.status === 'PROSPECTO' || o.status === 'COTIZADO'));
                     const clientTotalUsd = clientOpps.reduce((sum, opp) => sum + opp.amountUsd, 0);
                     
                     const formatCompact = (num: number) => {
                        if (num >= 1000000) return `$${(num/1000000).toFixed(1)}M`;
                        if (num >= 1000) return `$${(num/1000).toFixed(0)}K`;
                        return `$${num}`;
                     };

                     return (
                        <div className="flex gap-3">
                           <div className="flex-1 bg-gradient-to-br from-[#1E3A8A] to-[#1e40af] rounded-[16px] p-4 flex flex-col items-center shadow-lg relative overflow-hidden group">
                             <div className="absolute right-0 bottom-0 opacity-10">
                               <Signal size={60} />
                             </div>
                             <span className="text-[10px] uppercase font-bold text-blue-200 mb-0.5 tracking-widest relative z-10">{lang === 'es' ? 'Pipeline Actual' : 'Current Pipeline'}</span>
                             <span className="text-2xl font-black text-white relative z-10">{formatCompact(clientTotalUsd)}</span>
                           </div>
                           <div className="flex-1 bg-white border border-slate-200 rounded-[16px] p-4 flex flex-col items-center shadow-sm">
                             <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 tracking-widest text-center leading-tight">Proyectos Activos</span>
                             <span className="text-2xl font-black text-[#1E3A8A] flex items-center gap-1">{clientOpps.length}</span>
                           </div>
                        </div>
                     );
                  })()}
               </div>

               {/* Switcher entre Oportunidades vs Bitácora de Oportunidad */}
               {!selectedOpportunity ? (
                  <div className="flex-1 overflow-y-auto w-full p-6 pb-32 bg-[#F8FAFC]">
                     <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/60">
                       <h3 className="font-bold text-slate-800 uppercase tracking-widest text-[13px] flex items-center gap-2">
                          <Signal size={16} className="text-corporate-purple" /> {lang === 'es' ? 'Oportunidades Activas' : 'Active Opportunities'}
                       </h3>
                     </div>
                     <div className="space-y-4 mb-8">
                        {(() => {
                           const activeOpps = opportunities.filter(o => o.client?.name === selectedClient?.name && (o.status === 'PROSPECTO' || o.status === 'COTIZADO'));
                           if (activeOpps.length === 0) return <p className="text-xs text-slate-400 font-medium italic">{lang === 'es' ? 'No hay oportunidades activas.' : 'No active opportunities.'}</p>;
                           
                           return activeOpps.map(opp => (
                             <div 
                                key={opp.id} 
                                onClick={() => {
                                   if (editingOppId !== opp.id) {
                                      setSelectedOpportunity({id: opp.id, title: opp.title, amount: opp.amountUsd.toString()});
                                   }
                                }}
                                className={`bg-white p-5 rounded-[20px] border shadow-sm transition-all ${editingOppId === opp.id ? 'border-corporate-purple/60 shadow-md ring-2 ring-corporate-purple/10' : 'border-slate-200 flex justify-between items-center cursor-pointer hover:border-corporate-purple/40 hover:shadow-md active:scale-[0.98]'}`}
                             >
                                {editingOppId === opp.id ? (
                                  <div className="flex flex-col w-full gap-3 cursor-default" onClick={e => e.stopPropagation()}>
                                     <div className="flex items-center gap-2">
                                        <div className="flex flex-col w-full gap-1">
                                          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre del Proyecto</label>
                                          <input 
                                             type="text" 
                                             value={inlineEditTitle} 
                                             onChange={(e) => setInlineEditTitle(e.target.value)} 
                                             className="w-full bg-slate-50 border border-slate-200 text-sm px-3 py-2.5 rounded-xl font-bold text-[#1E3A8A] outline-none focus:border-corporate-purple/50 focus:bg-white"
                                             autoFocus
                                          />
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                        <div className="flex flex-col flex-1 gap-1">
                                           <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Monto USD</label>
                                           <div className="relative">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[#1E3A8A] opacity-50">$</span>
                                              <input 
                                                 type="text" 
                                                 value={inlineEditAmount} 
                                                 onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "");
                                                    setInlineEditAmount(val ? parseInt(val, 10).toLocaleString("en-US") : "");
                                                 }} 
                                                 className="w-full bg-slate-50 border border-slate-200 text-sm px-7 py-2.5 rounded-xl font-black text-emerald-600 outline-none focus:border-emerald-500/50 focus:bg-white tracking-widest"
                                              />
                                           </div>
                                        </div>
                                        <div className="flex items-end gap-1.5 pb-0.5 mt-[22px]">
                                           <button 
                                              onClick={() => setEditingOppId(null)}
                                              className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center gap-1 shadow-sm"
                                           >
                                              <X size={14} /> Cancelar
                                           </button>
                                           <button 
                                              onClick={async () => {
                                                 const newAmt = parseInt(inlineEditAmount.replace(/\D/g, ""), 10);
                                                 if (!isNaN(newAmt) && inlineEditTitle.trim() !== '') {
                                                    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, title: inlineEditTitle, amountUsd: newAmt } : o));
                                                    setEditingOppId(null);
                                                    try { await updateOpportunityDetails(opp.id, inlineEditTitle, newAmt); } catch(err){ console.error(err) }
                                                 }
                                              }}
                                              className="bg-[#1E3A8A] text-white border border-[#1E3A8A] px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-[#152e73] transition-colors flex items-center gap-1 shadow-sm"
                                           >
                                              <Check size={14} /> Guardar
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                       <h4 className="font-extrabold text-[#1E3A8A] text-[15px] mb-1.5">{opp.title}</h4>
                                       <div className="flex items-center gap-2">
                                          {/* Status Selector */}
                                          {/* Status Display Only */}
                                          <span 
                                            className={`text-[9px] uppercase font-bold px-2 py-1 rounded-md border text-center shadow-sm shrink-0 ${
                                              opp.status === 'PROSPECTO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                              'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}
                                          >
                                             {opp.status}
                                          </span>

                                          {/* Confidence Display Only */}
                                          <span 
                                            className={`text-[9px] uppercase font-bold px-2 py-1 rounded-md border text-center shadow-sm ${
                                              opp.confidenceLevel === 'ALTA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                              opp.confidenceLevel === 'BAJA' ? 'bg-red-50 text-red-700 border-red-200' :
                                              'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}
                                          >
                                             {opp.confidenceLevel === 'ALTA' ? '💚 ALTA' :
                                              opp.confidenceLevel === 'BAJA' ? '❤️ BAJA' : '💛 MEDIA'}
                                          </span>
                                       </div>
                                       <div className="mt-2 text-[9px] text-slate-400 font-medium">
                                          <span>Creada: {opp.createdAt ? new Date(opp.createdAt).toLocaleDateString() : 'N/A'}</span>
                                          <span className="mx-1.5">•</span>
                                          <span>Estado: {opp.statusUpdatedAt ? new Date(opp.statusUpdatedAt).toLocaleDateString() : (opp.updatedAt ? new Date(opp.updatedAt).toLocaleDateString() : 'N/A')}</span>
                                       </div>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                       <span className="text-[17px] font-black text-emerald-600 leading-none">${opp.amountUsd.toLocaleString('en-US')}</span>
                                       <div className="text-[10px] uppercase font-bold text-slate-400 mt-1 mb-1">USD</div>
                                       {opp.status === 'PROSPECTO' && (
                                         <div className="flex items-center gap-1 mt-1">
                                           <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setInlineEditTitle(opp.title);
                                                setInlineEditAmount(opp.amountUsd.toLocaleString("en-US"));
                                                setEditingOppId(opp.id);
                                              }}
                                              className="p-1 px-1.5 text-slate-300 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded transition-colors"
                                              title={lang === 'es' ? 'Editar Oportunidad' : 'Edit Opportunity'}
                                           >
                                              <Edit2 size={13} />
                                           </button>
                                           <button 
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                if (confirm(lang === 'es' ? '¿Eliminar permanentemente este proyecto y sus bitácoras?' : 'Permanently delete this project and its timeline?')) {
                                                  setOpportunities(prev => prev.filter(o => o.id !== opp.id));
                                                  try { await deleteOpportunity(opp.id); } catch(err){ console.error(err) }
                                                }
                                              }}
                                              className="p-1 px-1.5 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-colors"
                                              title={lang === 'es' ? 'Eliminar Oportunidad' : 'Delete Opportunity'}
                                           >
                                              <Trash2 size={13} />
                                           </button>
                                         </div>
                                       )}
                                    </div>
                                  </>
                                )}
                             </div>
                           ));
                        })()}
                     </div>

                     {/* El Historial de Proyectos (Ganado/Perdido) ha sido ocultado por instrucción de diseño operacional (Regla de Oro: Solo ver lo que se está trabajando). Los proyectos históricos se visualizan en el filtro regional. */}
                  </div>
               ) : (
                  <div className="flex-1 overflow-y-auto w-full p-6 pb-32 bg-[#F8FAFC]">
                     {(() => {
                        const oppDetails = opportunities.find(o => o.id === selectedOpportunity.id);
                        if (!oppDetails) return null;
                        
                        return (
                           <div className="mb-8">
                             <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60 break-words">
                               <button onClick={() => setSelectedOpportunity(null)} className="p-1 -ml-1 text-slate-400 hover:text-[#1E3A8A] rounded-full transition-colors active:bg-slate-100 shrink-0">
                                  <ChevronLeft size={26} strokeWidth={2.5}/>
                               </button>
                               <h3 className="font-bold text-[#1E3A8A] uppercase tracking-widest text-[13px] leading-tight pr-2">
                                  {lang === 'es' ? 'Bitácora' : 'Timeline'}
                               </h3>
                             </div>

                             {/* Detalle de Oportunidad (Cabecera) */}
                             <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-slate-200 shadow-sm flex flex-col gap-3">
                                <h4 className="font-extrabold text-[#1E3A8A] text-[15px] sm:text-[16px] leading-tight">{oppDetails.title}</h4>
                                <div className="flex justify-between items-end">
                                   <div className="flex flex-col gap-2">
                                      <select 
                                        onClick={e => e.stopPropagation()} 
                                        onChange={async (e) => {
                                          e.stopPropagation();
                                          const newStatus = e.target.value;
                                          if (newStatus === 'PERDIDO') {
                                             setPendingLostOpp(oppDetails);
                                             setSelectedOpportunity({id: oppDetails.id, title: oppDetails.title, amount: oppDetails.amountUsd.toString()});
                                             setIsRecording(true);
                                             finalTranscriptRef.current = '';
                                             setDraftActivity("");
                                             setDraftAction(lang === 'es' ? "Motivos de pérdida de proyecto" : "Reason for lost deal");
                                             if (recognitionRef.current) {
                                                try { recognitionRef.current.start(); } catch(err){}
                                             }
                                             return;
                                          }
                                          setOpportunities(prev => prev.map(o => o.id === oppDetails.id ? {...o, status: newStatus, statusUpdatedAt: new Date()} : o));
                                          if (newStatus === 'GANADO' || newStatus === 'PERDIDO') {
                                             setTodayTasks(prev => prev.map(t => t.opportunityId === oppDetails.id ? { ...t, completed: true } : t));
                                          }
                                          try { await updateOpportunityStatus(oppDetails.id, newStatus); } catch(err) { console.error(err) }
                                        }}
                                        value={oppDetails.status}
                                        disabled={oppDetails.status === 'GANADO' || oppDetails.status === 'PERDIDO'}
                                        className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border appearance-none text-center shadow-sm outline-none transition-colors w-max ${
                                          oppDetails.status === 'PROSPECTO' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer' :
                                          oppDetails.status === 'COTIZADO' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer' :
                                          oppDetails.status === 'GANADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed' :
                                          'bg-red-50 text-red-700 border-red-200 cursor-not-allowed'
                                        }`}
                                      >
                                        <option value="PROSPECTO">PROSPECTO</option>
                                        <option value="COTIZADO">COTIZADO</option>
                                        <option value="GANADO">GANADO</option>
                                        <option value="PERDIDO">PERDIDO</option>
                                      </select>
                                      
                                      <select 
                                       onChange={async (e) => {
                                         const newConf = e.target.value;
                                         setOpportunities(prev => prev.map(o => o.id === oppDetails.id ? {...o, confidenceLevel: newConf} : o));
                                         try { await updateOpportunityConfidence(oppDetails.id, newConf); } catch(err) { console.error(err) }
                                       }}
                                       value={oppDetails.confidenceLevel || 'MEDIA'}
                                       className={`text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-md border appearance-none cursor-pointer shadow-sm outline-none transition-colors w-max ${
                                         oppDetails.confidenceLevel === 'ALTA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                                         oppDetails.confidenceLevel === 'BAJA' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                                         'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                       }`}
                                     >
                                       <option value="ALTA">💚 CONF: ALTA</option>
                                       <option value="MEDIA">💛 CONF: MEDIA</option>
                                       <option value="BAJA">❤️ CONF: BAJA</option>
                                     </select>
                                   </div>
                                   <div className="text-right">
                                      <span className="text-[18px] sm:text-[20px] font-black text-emerald-600 leading-none">${oppDetails.amountUsd?.toLocaleString('en-US') || 0}</span>
                                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">USD</div>
                                   </div>
                                </div>
                             </div>
                           </div>
                        );
                     })()}

                  {/* The Timeline Vertical Line */}
                  <div className="relative pl-[26px] border-l-2 border-slate-200/80 space-y-9">
                     
                     {/* The Timeline Vertical Line */}
                     {(() => {
                        const projectActivities = todayTasks.filter((t: any) => t.opportunityId === selectedOpportunity.id);
                        
                        if (projectActivities.length === 0) {
                           return (
                              <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm mt-4">
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">{lang === 'es' ? 'Aún no hay registros en la bitácora.' : 'No records in the timeline yet.'}</p>
                                 <p className="text-[10px] text-slate-400 font-medium mt-1 text-center">{lang === 'es' ? 'Usa el botón flotante para crear uno nuevo.' : 'Use the floating button to create one.'}</p>
                              </div>
                           );
                        }

                        return projectActivities.map((item: any) => (
                           <motion.div key={item.id} initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="relative">
                              <div className="absolute -left-[35px] w-[26px] h-[26px] rounded-full bg-emerald-500 text-white shadow-sm flex items-center justify-center border-4 border-[#F8FAFC]">
                                 <Signal size={10} strokeWidth={3} />
                              </div>
                              <div className="flex justify-between items-end mb-2 ml-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded-full border border-slate-200/50">{item.completed ? (lang === 'es' ? 'Completado' : 'Completed') : (lang === 'es' ? 'Registro Ágil' : 'Quick Log')}</p>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.date ? new Date(item.createdAt).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US') : (lang === 'es' ? 'Reciente' : 'Recent')}</p>
                              </div>
                              
                              <div 
                                 className="bg-white p-4 sm:p-5 rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden cursor-pointer hover:border-corporate-purple/30 transition-all active:scale-[0.99]"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTimelineItems(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                 }}
                              >
                                 <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                 <div className="flex items-start justify-between">
                                   <div className="pr-3">
                                     <h4 className="font-extrabold text-[#1E3A8A] text-[14px] leading-tight mb-1">{item.title || "COMPROMISO"}</h4>
                                     <p className="text-[11px] text-[#F59E0B] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                        <Calendar size={12} /> {lang === 'es' ? 'Compromiso:' : 'Commitment:'} {item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : (lang === 'es' ? 'POR DEFINIR' : 'TBD')}
                                     </p>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0 flex items-center justify-center">
                                      {expandedTimelineItems.includes(item.id) ? <ChevronLeft size={16} className="rotate-90"/> : <ChevronLeft size={16} className="-rotate-90"/>}
                                   </span>
                                 </div>
                                 
                                 <AnimatePresence>
                                    {expandedTimelineItems.includes(item.id) && (
                                       <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                          <div className="pt-4 mt-4 border-t border-slate-100">
                                             <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 relative">
                                                <div className="absolute -top-3 left-4 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Mic size={10}/> {lang === 'es' ? 'Bitácora Original' : 'Original Audio Note'}</div>
                                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed mt-1 whitespace-pre-wrap">
                                                  {item.content || (lang === 'es' ? 'Sin audio registrado.' : 'No audio registered.')}
                                                </p>
                                             </div>
                                          </div>
                                          <div className="flex justify-end mt-3 mb-1">
                                             <button 
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   setEditingTask(item); 
                                                   setDraftActivity(item.content || ""); 
                                                   setDraftAction(item.title || ""); 
                                                   setDraftDate(item.date || ""); 
                                                   setShowActionModal(true);
                                                }}
                                                className="px-4 py-2 bg-slate-100 text-[#1E3A8A] text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-[#1E3A8A] hover:text-white flex items-center gap-1.5 transition-all border border-slate-200 active:scale-95"
                                             >
                                                <Edit2 size={12}/> {lang === 'es' ? 'Editar / Borrar' : 'Edit / Delete'}
                                             </button>
                                          </div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </div>
                           </motion.div>
                        ));
                     })()}


                  </div>
               </div>
               )}

               {/* Botón flotante de Grabación Consciente del Contexto */}
               <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
                  <div className="mb-2 w-max">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm text-white border border-white/20 ${selectedOpportunity ? 'bg-amber-600' : 'bg-corporate-purple'}`}>
                        {selectedOpportunity ? 'Nota Oportunidad' : 'Nota Cliente'}
                     </span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMicClick('activity')}
                    className={`w-[68px] h-[68px] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-[5px] border-slate-50 transition-colors ${selectedOpportunity ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]' : 'bg-gradient-to-br from-[#7C3AED] to-[#5B21B6]'} ${recordingField === 'activity' ? 'animate-pulse' : ''}`}
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
               <div className="pt-12 pb-4 px-6 flex justify-between items-start bg-white shadow-sm shrink-0 sticky top-0 z-20">
                 <div className="flex flex-col flex-1 min-w-0 pr-4">
                   <h2 className="text-xl font-bold text-[#1E3A8A] tracking-wider uppercase mb-1">
                      {editingTask ? (lang === 'es' ? 'Editar Registro' : 'Edit Record') : (lang === 'es' ? 'Nuevo Registro' : 'New Record')}
                   </h2>
                   <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap ${editingTask ? 'text-slate-400' : 'text-corporate-purple'} mb-2`}>
                      {editingTask ? <><Edit2 size={12}/> {lang === 'es' ? 'Edición Manual' : 'Manual Edit'}</> : <><Mic size={12}/> {lang === 'es' ? 'Entrada por Voz' : 'Voice Input'}</>}
                   </p>
                   {(() => {
                      const opp = editingTask ? opportunities.find(o => o.id === editingTask.opportunityId) : selectedOpportunity;
                      const oppName = opp ? (opp.title || opp.name) : null;
                      const client = editingTask ? clients.find(c => c.id === editingTask.clientId || (opp && c.id === opp.clientId)) : selectedClient;
                      const clientName = client ? client.name : null;
                      const countryName = client ? client.country : selectedCountry;

                      return (
                         <div className="flex flex-col gap-1.5 mt-1 items-start">
                            {countryName && (
                               <span className="text-[9px] text-slate-500 bg-slate-100 uppercase tracking-widest font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-slate-200 max-w-full">
                                  <span className="shrink-0">🌎 PAÍS:</span> <span className="truncate">{countryName}</span>
                               </span>
                            )}
                            {clientName && (
                               <span className="text-[9px] text-blue-600 bg-blue-100/50 uppercase tracking-widest font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-blue-200/50 max-w-full">
                                  <span className="shrink-0">👤 CLIENTE:</span> <span className="truncate">{clientName}</span>
                               </span>
                            )}
                            {oppName && (
                               <div className="flex flex-col gap-1.5 items-start max-w-full">
                                  <span className="text-[9px] text-corporate-purple bg-corporate-purple/10 uppercase tracking-widest font-black px-2 py-1 rounded-md inline-flex items-start gap-1 border border-corporate-purple/20 max-w-full leading-relaxed">
                                     <span className="shrink-0 mt-[1px]">📁 PROYECTO:</span> <span className="break-words">{oppName}</span>
                                  </span>
                                  {opp?.status && (
                                     <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md inline-block border ${
                                        opp.status === 'GANADO' ? 'text-emerald-700 bg-emerald-100 border-emerald-200' :
                                        opp.status === 'PERDIDO' ? 'text-red-700 bg-red-100 border-red-200' :
                                        opp.status === 'COTIZADO' ? 'text-blue-700 bg-blue-100 border-blue-200' :
                                        'text-amber-700 bg-amber-100 border-amber-200'
                                     } max-w-full truncate`}>
                                        {opp.status}
                                     </span>
                                  )}
                               </div>
                            )}
                         </div>
                      );
                   })()}
                 </div>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setShowActionModal(false);
                     setTimeout(() => { setEditingTask(null); setPendingLostOpp(null); }, 300);
                   }} 
                   className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer active:scale-95"
                 >
                   <X size={24} />
                 </button>
               </div>
               
               {/* Contenido Formulario Deslizante */}
               <div className="p-6 space-y-6">
                 
                 {/* Tarjeta: Detalle de Actividad (Pasado/Presente) */}
                 <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#7C3AED] to-[#5B21B6]"></div>
                    <div className="flex items-center gap-2 mb-4 pl-3">
                      <Mic size={20} className="text-corporate-purple" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Paso 1: Lo que ocurrió hoy</span>
                        <h3 className="font-bold text-slate-800 text-[15px] tracking-wide uppercase">{lang === 'es' ? 'Bitácora de la Acción' : 'Action Details'}</h3>
                      </div>
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
                       <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                           {editingTask ? 
                               (editingTask.createdAt ? `${new Date(editingTask.createdAt).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US')} ${new Date(editingTask.createdAt).toLocaleTimeString(lang === 'es' ? 'es-CL' : 'en-US', { hour: '2-digit', minute: '2-digit' })} hrs` : 'N/A')
                               : 
                               (lang === 'es' ? `Hoy, ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs` : `Today, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} hrs`)
                           }
                       </p>
                    </div>
                 </div>

                 {/* Tarjeta: Próximo Compromiso (Futuro) */}
                 <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F59E0B] to-[#D97706]"></div>
                    <div className="flex items-center gap-2 mb-5 pl-3">
                      <Navigation size={20} className="text-[#F59E0B] fill-[#F59E0B]/20" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#F59E0B] font-bold tracking-widest uppercase">Paso 2: Lo que sigue</span>
                        <h3 className="font-bold text-slate-800 text-[15px] tracking-wide uppercase">{lang === 'es' ? 'Plan y Compromiso' : 'Next Committment'}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Campo Acción */}
                      <div>
                        <div className="flex justify-between items-center mb-2 pl-3 px-1">
                           <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">{lang === 'es' ? '¿Qué sigue?' : 'What\'s next?'}</label>
                           <button onClick={(e) => { e.preventDefault(); handleMicClick('action'); }} className={`p-1.5 rounded-full shadow-sm transition-colors border outline-none active:scale-95 ${recordingField === 'action' ? 'bg-[#F59E0B] text-white  animate-pulse border-[#F59E0B]' : 'bg-white text-slate-400 border-slate-200 hover:text-[#F59E0B] hover:border-[#F59E0B]/30'}`}>
                               <Mic size={14} />
                           </button>
                        </div>
                        <input type="text" value={draftAction} onChange={(e) => setDraftAction(e.target.value)} className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 text-sm shadow-inner transition-colors ${recordingField === 'action' ? 'border-[#F59E0B]' : 'border-slate-200'}`} />
                      </div>
                      
                      {/* Campo Fecha */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-widest pl-3 flex items-center gap-2">
                          <Calendar size={12} /> {lang === 'es' ? '¿Para cuándo?' : 'When?'}
                        </label>
                        <div className="relative">
                          <input 
                              type="date" 
                              value={draftDate}
                              onChange={(e) => setDraftDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 text-sm shadow-inner appearance-none placeholder:text-slate-400 uppercase tracking-widest" 
                          />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Tarjeta Simulación RAG Comercial */}
                 {(() => {
                    const draftLower = draftActivity.toLowerCase();
                    const ragMatches = [];
                    if (draftLower.includes('impresora') || draftLower.includes('barcode') || draftLower.includes('codigo de barra') || draftLower.includes('código de barra')) {
                       ragMatches.push({ name: 'Bartech BTP-R580II (Térmica POS)', price: 245.00, stock: 'Stock Local' });
                       ragMatches.push({ name: 'Bartech BTP-2300E (Industrial)', price: 680.00, stock: 'Bajo Pedido' });
                    }
                    if (draftLower.includes('lector') || draftLower.includes('scanner')) {
                       ragMatches.push({ name: 'Lector Omnidireccional Bartech BS-7120', price: 115.00, stock: 'Stock Local' });
                    }
                    if (draftLower.includes('kiosco') || draftLower.includes('autoatención') || draftLower.includes('pantalla') || draftLower.includes('multipropósito')) {
                       ragMatches.push({ name: 'Kiosco Interactivo Bartech 32" (Pared)', price: 1250.00, stock: 'Bajo Pedido' });
                       ragMatches.push({ name: 'Kiosco Multipropósito 21" (Pedestal)', price: 850.00, stock: 'Stock Local' });
                       ragMatches.push({ name: 'Kiosco Pago Autoservicio 15"', price: 1100.00, stock: 'Limitado' });
                       ragMatches.push({ name: 'Kiosco Outdoor 43" (Antivandálico)', price: 2150.00, stock: 'Bajo Pedido' });
                    }
                    if (draftLower.includes('gaveta') || draftLower.includes('dinero') || draftLower.includes('pos')) {
                       ragMatches.push({ name: 'Terminal POS Bartech All-In-One 15"', price: 850.00, stock: 'Limitado' });
                    }

                    if (ragMatches.length === 0) return null;

                    return (
                       <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#009EE3] to-[#008CC9]"></div>
                          <div className="flex items-center justify-between mb-4 pl-3">
                            <div className="flex items-center gap-2">
                               <Database size={20} className="text-[#009EE3]" />
                               <div className="flex flex-col">
                                 <span className="text-[10px] text-[#009EE3] font-bold tracking-widest uppercase flex items-center gap-1"><Sparkles size={10}/> {lang === 'es' ? 'Inteligencia Comercial' : 'AI Intelligence'}</span>
                                 <h3 className="font-bold text-slate-800 text-[15px] tracking-wide uppercase leading-tight mt-0.5">{lang === 'es' ? 'Match de Catálogo' : 'Catalog Match'}</h3>
                               </div>
                            </div>
                          </div>
                          <div className="space-y-3 mx-1">
                             {ragMatches.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex justify-between items-center transition-colors hover:border-[#009EE3]/30">
                                   <div className="flex flex-col flex-1 pl-1">
                                      <span className="text-[11px] sm:text-[12px] font-bold text-slate-700 leading-tight pr-2">{item.name}</span>
                                      <div className="flex items-center gap-2 mt-1.5">
                                         <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${item.stock === 'Stock Local' ? 'bg-emerald-100/50 text-emerald-600' : item.stock === 'Bajo Pedido' ? 'bg-amber-100/50 text-amber-600' : 'bg-red-100/50 text-red-600'}`}>
                                            {item.stock}
                                         </span>
                                         <span className="text-[11px] font-black text-emerald-600 border-l border-slate-200 pl-2 opacity-80">${item.price.toFixed(2)} USD</span>
                                      </div>
                                   </div>
                                   <button 
                                      onClick={(e) => { 
                                         e.preventDefault(); 
                                         setDraftAction(prev => {
                                            const base = prev ? prev + ' + ' : 'Cotizar equipo: ';
                                            return base + item.name;
                                         }); 
                                      }}
                                      className="w-10 h-10 shrink-0 bg-blue-50/80 border border-blue-100 text-[#009EE3] rounded-xl flex items-center justify-center shadow-sm active:scale-90 hover:bg-[#009EE3] hover:text-white transition-all"
                                      title={lang==='es' ? 'Añadir al Plan de Acción' : 'Add to Action Plan'}
                                   >
                                      <span className="font-black text-xl leading-none -mt-0.5">+</span>
                                   </button>
                                </div>
                             ))}
                          </div>
                       </motion.div>
                    );
                 })()}

                 {/* Botón de Confirmación (Integrado al flujo) */}
                 <div className="pt-2 pb-6 flex flex-col gap-3">
                    <button onClick={handleSaveLocal} className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#1e40af] text-white rounded-[20px] py-4 font-bold tracking-widest uppercase shadow-[0_8px_30px_rgb(30,58,138,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all pointer-events-auto border-2 border-[#1E3A8A]/50">
                      <UploadCloud size={20} />
                      {lang === 'es' ? 'Guardar Registro' : 'Save Record'}
                    </button>
                    {editingTask && (
                      <button onClick={handleDeleteTask} className="w-full bg-white text-red-600 rounded-[20px] py-3.5 font-bold tracking-widest uppercase shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-all pointer-events-auto border-2 border-red-100 text-[11px]">
                        <Trash2 size={16} />
                        {lang === 'es' ? 'Eliminar Registro' : 'Delete Record'}
                      </button>
                    )}
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
                  {pendingLostOpp ? 
                     (lang === 'es' ? 'Argumenta detalladamente por qué se perdió este proyecto.' : 'Argue in detail why this project was lost.') 
                     : 
                     (lang === 'es' ? 'Menciona los detalles de la visita y la próxima acción a tomar.' : 'Mention the details of the visit and the next action to take.')
                  }
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
                           <img src={clientLogo} alt="Mandante" className="h-10 object-contain" />
                        ) : (
                           <div className="h-10 flex items-center border border-slate-200 px-3 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">Sin Logo</div>
                        )}
                        <img src="/logo_at_sit_full.png" alt="AT-SIT" className="h-6 opacity-90 object-contain" />
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
                        <h3 className="text-4xl font-extrabold tracking-tight mb-4">${globalTotalUsd.toLocaleString('en-US')}<span className="text-xl"> USD</span></h3>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full w-max text-xs font-semibold backdrop-blur-sm">
                          <Navigation size={12} className="text-slate-300"/> {globalTotalProjects} {lang === 'es' ? 'Proyectos Activos' : 'Active Projects'}
                        </div>
                     </div>

                     {/* Tarjeta 2: Mapa de Calor */}
                     <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center gap-2"><MapIcon size={14}/> Mapa de Calor (Heatmap)</h4>
                        <div className="w-full aspect-[4/3] bg-slate-50 relative rounded-[16px] overflow-hidden shadow-inner border border-[#1E3A8A]/5">
                           {activeCountriesMetrics.length === 0 ? (
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
                                  <span className="text-xs font-bold text-slate-400">Sin distribuciones espaciales registradas</span>
                               </div>
                           ) : (
                               renderGeoMap(false)
                           )}
                        </div>
                     </div>

                     {/* Tarjeta 3: Desglose MACRO (Cuadratura) */}
                     <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-5 flex items-center gap-2"><List size={14}/> Cuadratura por Entidades</h4>
                        <div className="space-y-6">
                           {activeCountriesMetrics.length === 0 ? (
                               <div className="py-10 flex flex-col items-center justify-center text-center">
                                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                                      <List size={24} className="text-slate-300" />
                                   </div>
                                   <h5 className="text-sm font-bold text-slate-700 mb-1">Cero Reportes Generados</h5>
                                   <p className="text-xs text-slate-500 font-medium">Aún no has registrado proyectos ni presupuestos en tu gestión de pipeline.</p>
                               </div>
                           ) : (
                               <div className="space-y-4">
                                  {activeCountriesMetrics.map(c => (
                                     <div key={c.name} className="bg-[#F8FAFC] rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                                        <div className="flex justify-between items-center bg-white p-3 border-b border-slate-100/60 z-10 relative">
                                           <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 shadow-[0_2px_4px_rgb(0,0,0,0.02)] flex items-center justify-center text-[10px] font-black text-[#1E3A8A]">
                                                 {c.name.substring(0,2).toUpperCase()}
                                              </div>
                                              <div>
                                                 <div className="text-[13px] font-bold text-slate-800 leading-tight">{c.name}</div>
                                                 <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{c.totalProjects} {lang === 'es' ? 'proyectos' : 'projects'}</div>
                                              </div>
                                           </div>
                                           <div className="text-sm font-black text-emerald-600">${c.totalValueUsd.toLocaleString('en-US')}</div>
                                        </div>
                                        {/* Cascada de Proyectos */}
                                        <div className="bg-slate-50/50 p-2.5 flex flex-col gap-2">
                                           {c.opps.map((opp: any) => (
                                              <div key={opp.id} className="flex justify-between items-center bg-white border border-slate-100/80 px-3 py-2.5 rounded-lg shadow-[0_1px_2px_rgb(0,0,0,0.02)] pl-4 relative">
                                                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-corporate-purple/30 rounded-l-lg"></div>
                                                 <div className="text-xs font-bold text-slate-600 truncate pr-3 select-all">
                                                    {opp.title}
                                                 </div>
                                                 <div className="text-[11px] font-bold text-emerald-600/90 shrink-0">
                                                    ${opp.amountUsd.toLocaleString('en-US')}
                                                 </div>
                                              </div>
                                           ))}
                                        </div>
                                     </div>
                                  ))}
                               </div>                           )}
                           
                           <div className="pt-5 mt-4 border-t border-slate-200 flex justify-between items-center">
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Calculado</span>
                              <span className="text-lg font-black text-slate-800">${globalTotalUsd.toLocaleString('en-US')} USD</span>
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
                                 const secureToken = btoa(reportPassword).substring(0,12);
                                 const secureLink = 'https://easymanagement.app/secure-report/' + secureToken;
                                 
                                 if (navigator.share) {
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
                                            alert('Enlace copiado al portapapeles:\n' + secureLink);
                                         });
                                         setShowReportPasswordForm(false);
                                     });
                                 } else {
                                     navigator.clipboard.writeText(secureLink).then(() => {
                                         alert('Enlace seguro copiado al portapapeles:\n' + secureLink);
                                         setShowReportPasswordForm(false);
                                     }).catch(() => {
                                         alert('Tu navegador no soporta copiado. Enlace: ' + secureLink);
                                     });
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

          {/* Calendario Modal */}
          {showCalendarModal && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1E3A8A]/30 backdrop-blur-sm sm:items-center p-0 sm:p-4"
               onClick={() => setShowCalendarModal(false)}
            >
               <motion.div 
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-[#F8FAFC] w-full h-[90%] sm:h-auto sm:max-h-[90%] sm:max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-100 shrink-0 sticky top-0 z-20">
                     <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />
                     <div className="flex justify-between items-start">
                        <div>
                           <h2 className="text-[22px] font-black text-[#1E3A8A] leading-tight tracking-tight">
                              Mi Planificador
                           </h2>
                           <div className="flex bg-slate-100 rounded-lg p-1 mt-2 w-max">
                               <button 
                                  onClick={() => setCalendarViewMode('grid')}
                                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${calendarViewMode === 'grid' ? 'bg-white text-corporate-purple shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                               >
                                  Ver Calendario
                               </button>
                               <button 
                                  onClick={() => setCalendarViewMode('list')}
                                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${calendarViewMode === 'list' ? 'bg-white text-corporate-purple shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                               >
                                  Ver Lista
                               </button>
                           </div>
                        </div>
                        <button onClick={() => setShowCalendarModal(false)} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-colors cursor-pointer active:scale-95">
                           <X size={16} />
                        </button>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 pb-24 bg-[#F8FAFC]">
                     {/* RENDERIZADO CONDICIONAL DE VISTA */}
                     {calendarViewMode === 'grid' ? (
                        <div className="h-full min-h-[400px]">
                           {renderCalendarGrid()}
                        </div>
                     ) : (
                         todayTasks.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm font-medium">No hay registros de actividad.</div>
                         ) : (
                            [...todayTasks]
                            .filter((task) => {
                                if (!task.completed) return true; // Keep pending
                                if (!task.date) return false; // Hide completed without date
                                const d = new Date(task.date + 'T12:00:00');
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                return d >= today; // Keep completed ONLY if they are today or future
                            })
                            .sort((a,b) => {
                                const da = a.date ? new Date(a.date).getTime() : Infinity;
                                const db = b.date ? new Date(b.date).getTime() : Infinity;
                                return da - db;
                            })
                            .map((task) => (
                               <motion.div 
                                 key={task.id} 
                                 onClick={() => {
                                   setShowCalendarModal(false);
                                   setEditingTask(task);
                                   setDraftAction(task.title || "");
                                   setDraftActivity(task.content || "");
                                   setDraftDate(task.date || "");
                                   setShowActionModal(true);
                                 }}
                                 className={`flex flex-col gap-3 p-5 bg-white rounded-2xl border-2 shadow-sm cursor-pointer hover:border-[#1E3A8A]/30 hover:shadow-md transition-all active:scale-[0.98] ${task.completed ? 'border-emerald-200 opacity-80 bg-emerald-50/20' : 'border-slate-100'}`}
                               >
                                  <div className="flex justify-between items-start w-full gap-3">
                                      <div className={`flex flex-col items-start rounded-xl px-4 py-2 border self-start ${task.completed ? 'bg-emerald-50/80 border-emerald-100' : 'bg-amber-50/80 border-amber-100'}`}>
                                        <span className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-0.5 ${task.completed ? 'text-emerald-600' : 'text-[#F59E0B]'}`}>
                                           <Navigation size={12}/> {task.completed ? 'COMPLETADO' : 'COMPROMISO'}:
                                        </span>
                                        <span className={`font-black text-xl tracking-tight ${task.completed ? 'text-emerald-700' : 'text-[#D97706]'}`}>
                                           {task.date ? task.date.split('-').reverse().join('/') : 'Por definir'}
                                        </span>
                                      </div>
                                      
                                      <button 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const newCompleted = !task.completed;
                                          setTodayTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));
                                          if (typeof task.id === 'string') {
                                              await toggleActivityCompletion(task.id, newCompleted);
                                          }
                                        }}
                                        className={`w-10 h-10 rounded-full border-[3px] bg-white shrink-0 transition-colors flex items-center justify-center group shadow-inner hover:border-emerald-500 hover:bg-emerald-50 ${task.completed ? 'border-emerald-500' : 'border-slate-300'}`}
                                      >
                                         <div className={`w-5 h-5 rounded-full bg-emerald-500 transition-opacity flex items-center justify-center ${task.completed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {task.completed && <Check size={12} className="text-white" strokeWidth={4} />}
                                         </div>
                                      </button>
                                  </div>
                                  
                                  <div className="px-1 mt-1">
                                     <span className={`font-black text-[18px] sm:text-[20px] leading-tight block ${task.completed ? 'text-emerald-800 line-through decoration-emerald-400 opacity-60' : 'text-[#1E3A8A]'}`}>{task.title}</span>
                                  </div>
                                  
                                  <div className="mt-2 w-full pt-3 border-t border-slate-100/60 flex items-center text-left">
                                     <span className="text-[11px] text-slate-400 font-bold whitespace-normal leading-relaxed">
                                       Generado el {task.createdAt ? new Date(task.createdAt).toLocaleDateString(lang === 'es' ? 'es-CL' : 'en-US') : 'N/A'} a las {task.createdAt ? new Date(task.createdAt).toLocaleTimeString(lang === 'es' ? 'es-CL' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                     </span>
                                  </div>
                               </motion.div>
                            ))
                         )
                     )}
                  </div>
               </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

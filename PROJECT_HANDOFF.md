# Easy Management App - Project Handoff & Architecture Log
**Last Updated:** 29 de Marzo, 2026 (Consolidación Motor de Ventas y Neon DB)
**Status:** Producción (Vercel) + Frontend Activo + PostgreSql Database (Neon) Conectada.

> [!WARNING]
> **ALERTA CRÍTICA DE DESARROLLO (Vercel Deployments):**
> El usuario NO está testeando la aplicación de manera local (`localhost:3000`). Todas las pruebas de UI, PWA y Base de Datos las está realizando **directamente en Producción a través de Vercel** (`easymanagement-ai.vercel.app`). 
> **Regla de Oro:** Todo cambio de código (frontend, backend, Prisma o assets) que hagas localmente MUST ser empujado al repositorio vía Git (`git add .`, `git commit`, `git push`) para que Vercel lo recompile y el usuario pueda validar el resultado. Si no haces `git push`, el usuario no verá absolutamente nada de lo que programas.

## 1. Project Overview & Logros Recientes
**Easy Management AI** es un CRM "Mobile-First" e "Offline-First" enfocado en velocidad operativa para la región LATAM, impulsado por Voice-To-Action.

### Avances Críticos Logrados en la Última Sesión:
1.  **Migración Completa a Database Real (Neon + Prisma):** Se reemplazó el uso masivo de puentes en `LocalStorage`. Los modelos `ActivityLog`, `Opportunity`, `Client` y `User` ahora interactúan permanentemente. Se implementaron Server Actions (`actions.ts`) robustos.
2.  **Jerarquía de Ventas Pura:** Se consolidó el modelo jerárquico real: País -> Cliente -> Oportunidad. Las oportunidades obligan un enlace con cliente para una trazabilidad perfecta.
3.  **Mapa Interactivo Reactivo:** El backend alimenta al mapa geo-espacial (`react-simple-maps`) calculando al vuelo qué países tienen métricas y ocultando los países "vacíos". Se aplicó la escala de calor para destacar países clave.
4.  **Estabilizaciones Móviles UI y Datos:**
    -  Se solucionó el bug clásico de Chrome en Android dentro la `SpeechRecognition API` que generaba texto en "Efecto Eco/Bucle" usando validaciones por `event.resultIndex`.
    -  Se ajustaron fallos de renderizado de fecha cruzados en la bitácora ("INVALID DATE").
    -  Se impidió la doble línea al estirar la "Tarjeta de Pipeline Regional" aplicando clases de flex y tipografías dependientes del `sm`.

---

## 2. Core Architecture & Views (`page.tsx`)
La aplicación opera como un coliseo SPA mediante `AnimatePresence` y z-index layering masivo.

### A. Dashboard & Map (Base Layer - `z: 10`)
*   Mapas vectoriales con `react-simple-maps`. Ahora calculados desde iteraciones directas en `activeCountriesMetrics` con métricas vivas de Postgres.

### B. Módulo Regional & Informe Ejecutivo (`z: 50`)
*   Se vaciaron las plantillas de cero. El botón de **Informe Ejecutivo** ahora auto-agrega y calcula directamente las entidades de forma transparente según el total de Oportunidades activas (Excluye 'PERDIDO').

### C. Client Profile / Bitácora (`selectedClient`, `z: 75`)
*   El núcleo comercial vinculado ahora a Supabase/Neon, cargando oportunidades directamente relacionadas al Tenant.

### D. Flujo de Grabación IA (`z: 90 / z: 100`)
*   **Web Speech API Estable:** Manejo de transcripción final vs. interim sin superposición (crucial en PWA de Android).
*   Parseo "NPL-Fake" funcionando velozmente. (Extrae fechas para Calendario y las inyecta en estado).

---

## 3. Pending Tasks & Roadmap para Mañana

Tu misión inmediata como agente desarrollador entrante (Fase de QA de Mañana):

1.  **Revisión Total (QA Diurno):** Revisar cómo se experimenta todo el bloque en conjunto: Registrar usuario -> Crear Oportunidades (con input numérico con separador de miles) -> Registrar una Actividad de Voz -> Navegar al informe Ejecutivo -> Todo debe coincidir a la perfección y verse armónico en teléfono.
2.  **Activos Faltantes Visuales:** Requeriremos que el Logo AT-SIT (institucional) sea gestionado para lucir impecable en la esquina y reemplazar el placeholder donde dice "Falta Logo" por un mecanismo persistente oficial para este Tenant de producción.
3.  **Auditoría de Lint:** Lograr "Cero Advertencias de Lint" eliminando variables e iconos no utilizados en `page.tsx` para optimizar el peso masivo del frontend de ~2200 líneas.
4.  **Ajustes Menores de UI:** Atender solicitudes pendientes del cliente tras sus pruebas (Espacios, paletas, reportes PDF si es requerido).


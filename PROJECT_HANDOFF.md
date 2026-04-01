# Easy Management App - Project Handoff & Architecture Log
**Last Updated:** 31 de Marzo, 2026 (Comprobación de Webhook de Vercel)
**Status:** Producción (Vercel) + Frontend Activo + PostgreSql Database (Neon) Conectada.

> [!WARNING]
> **ALERTA CRÍTICA DE DESARROLLO (Vercel Deployments):**
> El usuario NO está testeando la aplicación de manera local (`localhost:3000`). Todas las pruebas de UI, PWA y Base de Datos las está realizando **directamente en Producción a través de Vercel** (`easymanagement-ai.vercel.app`). 
> **Regla de Oro:** Todo cambio de código (frontend, backend, Prisma o assets) que hagas localmente MUST ser empujado al repositorio vía Git (`git add .`, `git commit`, `git push`) para que Vercel lo recompile y el usuario pueda validar el resultado. Si no haces `git push`, el usuario no verá absolutamente nada de lo que programas.

## 1. Project Overview & Logros Recientes
**Easy Management AI** es un CRM "Mobile-First" e "Offline-First" enfocado en velocidad operativa para la región LATAM, impulsado por Voice-To-Action.

### Avances Críticos Logrados:
1.  **Migración Completa a Database Real (Neon + Prisma):** Se reemplazó el uso masivo de puentes en `LocalStorage`. Los modelos `ActivityLog`, `Opportunity`, `Client` y `User` ahora interactúan permanentemente. Se implementaron Server Actions (`actions.ts`) robustos.
2.  **Jerarquía de Ventas Pura:** Se consolidó el modelo jerárquico real: País -> Cliente -> Oportunidad. Las oportunidades obligan un enlace con cliente para una trazabilidad perfecta.
3.  **Mapa Interactivo Reactivo:** El backend alimenta al mapa geo-espacial (`react-simple-maps`) calculando al vuelo qué países tienen métricas y ocultando los países "vacíos". Se aplicó la escala de calor para destacar países clave.
4.  **Botón de Logout y Panel de Super Admin:** El panel de administración fue adaptado de un formato "Split-Screen" a un "Full Screen Overlay" para móviles. Se eliminó la pantalla dividida a favor de un botón fijo "VER USUARIOS" anclado junto a "Cerrar sesión" en el perfil (onboarding).
5.  **Historial de Registro Pro (Suscripciones):** Se integró `proSince` en NeonDB/Prisma para formatear automáticamente la antigüedad de un usuario (días, meses, años) en el Panel Administrativo de forma inteligente y amigable.

---

## 2. Core Architecture & Views (`page.tsx`)
La aplicación opera como un coliseo SPA mediante `AnimatePresence` y z-index layering masivo.

### A. Dashboard & Map (Base Layer - `z: 10`)
*   Mapas vectoriales con `react-simple-maps`. Ahora calculados desde iteraciones directas en `activeCountriesMetrics` con métricas vivas de Postgres.

### B. Módulo Regional & Informe Ejecutivo (`z: 50`)
*   Se vaciaron las plantillas de cero. El botón de **Informe Ejecutivo** ahora auto-agrega y calcula directamente las entidades de forma transparente según el total de Oportunidades activas (Excluye 'PERDIDO').

### C. Client Profile / Bitácora (`selectedClient`, `z: 75`)
*   El núcleo comercial vinculado ahora a Supabase/Neon, cargando oportunidades directamente relacionadas al Tenant.

---

## 3. INCIDENCIAS ACTUALES (PRIORIDAD ABSOLUTA PARA LA PRÓXIMA SESIÓN)
El usuario detuvo la sesión porque **ninguno de los despliegues de los últimos 30 minutos surtió efecto en su dispositivo**. 

> [!CAUTION]
> **BLOQUEO 1: VERCEL WEBHOOKS Y PWA CACHE DESCONECTADOS**
> A pesar de que los commits (`a0690e5`, `5526427`) fueron empujados exitosamente a la rama `main` en `origin` (GitHub: pdiazg46-design/Easymanagement-AI), el dashboard del usuario en Vercel se quedó "sordo" y no disparó las últimas compilaciones. Se forzó un compilado directo vía Vercel CLI (`npx vercel --prod`), pero el cliente detuvo la sesión producto del desgaste de la incidencia sin poder validar.

> [!CAUTION]
> **BLOQUEO 2: SINCRONIZACIÓN DE NOTAS "DEMO" / MÓVIL VS PC**
> El usuario reportaba que "las notas de voz borradas en el móvil reaparecen al refrescar" (Resuelto parcialmente en sesiones anteriores, pero mantener ojo en la caché agresiva de Next).

Tu misión inicial en la próxima sesión:
1. **Validación de la Ubicación del Botón ('VER USUARIOS'):** Asegurarse primero de que el cliente pueda abrir la App en su celular/PC vaciando la caché del navegador para forzar la carga del commit `a0690e5`, o bien migrar el botón al **Dashboard** si es que él se refería a no tener que entrar a su Perfil.
2. **Revisar Salud del Webhook GitHub -> Vercel:** Validar si nuevos commits empujados gatillan automáticamente builds en Vercel, o si el proyecto sufrió una desvinculación temporal.
3. **Continuar el Módulo de Distribuidores:** Tal como adelantó el usuario antes de la contingencia, incorporar permisos para los distribuidores en la bitácora de clientes.

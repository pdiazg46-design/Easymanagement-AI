# Easy Management App - Project Handoff & Architecture Log
**Última actualización:** 01 de Abril 2026, 02:40 AM (CLT)
**Status:** Producción (Vercel) + Frontend Activo (Formato Móvil Estricto Restaurado)

---

### 🚨 ALERTAS CRÍTICAS Y BLOQUEOS ACTUALES

*   **PWA Cache / Persistencia:** Mantener estricta vigilancia sobre la PWA. El usuario debe refrescar si ve la "pantalla antigua".
*   **Contenedor Responsivo:** Se ha forzado una "Carcasa de Emulación Móvil" a nivel de `layout.tsx` (`max-w-md` y `ring-black`) para navegadores en PC. ESTO SOLUCIONA la queja del usuario: `"has sacado mi pantalla del formato móvil"`.
*   **Super Admin:** La lógica case-insensitive del correo de Super Admin y el botón 'VER USUARIOS' fueron restaurados y movidos correctamente bajo 'CERRAR SESIÓN'.

> [!WARNING]
> **ALERTA CRÍTICA DE DESARROLLO (Vercel Deployments):**
> El usuario NO está testeando la aplicación de manera local (`localhost:3000`). Todas las pruebas de UI, PWA y Base de Datos las está realizando **directamente en Producción a través de Vercel** (`easymanagement-ai.vercel.app`). 
> **Regla de Oro:** Todo cambio de código (frontend, backend, Prisma o assets) que hagas localmente MUST ser empujado al repositorio vía Git (`git add .`, `git commit`, `git push`) para que Vercel lo recompile y el usuario pueda validar el resultado. Si no haces `git push`, el usuario no verá absolutamente nada de lo que programas.

## 1. Project Overview & Modelo de Negocio Core
**Easy Management AI** es un CRM "Mobile-First" enfocado en velocidad operativa para la región LATAM, impulsado por Voice-To-Action.
**El Modelo de Negocio REAL (Core Mechanism):**
El usuario (Vendedor/Ejecutivo) trabaja para un **MANDANTE** o Proveedor principal (Ej: *Bartech*), definido en la Configuración de Entorno. La herramienta asimila el catálogo completo de productos/servicios de este Mandante mediante IA (RAG). 
La jerarquía estructural pura del sistema es:
1. **Mandante (Proveedor Unico del Vendedor):** Tiene un catálogo de productos/precios precargado en la Configuración.
2. **Canal / Distribuidor / Cliente Final:** Son las entidades creadas en el país asignado (Ej: Chile). Son a quienes se les vende.
3. **Oportunidad / Proyecto:** Nacen y se vinculan bajo cada Distribuidor/Cliente, alimentando el Pipeline.
4. **Bitácora (Voice-to-Action):** Registra el roce diario con el distribuidor, captando qué productos reales del Mandante se están moviendo, cotizando o perdiendo.

### Avances Críticos Logrados:
1.  **Migración Completa a Database Real (Neon + Prisma):** Modelos `ActivityLog`, `Opportunity`, `Client` y `User` interactúan conectando la jerarquía Vendedor -> Distribuidor -> Oportunidad.
2.  **Jerarquía de Ventas Pura:** Se consolidó el modelo jerárquico real: País -> Cliente (Canal/Distribuidor) -> Oportunidad. 
3.  **Mapa Interactivo Reactivo:** Backend alimenta al mapa geo-espacial (`react-simple-maps`) con métricas vivas.
4.  **Panel de Super Admin (Botón VER USUARIOS):** Restaurado y asegurado su acceso (case-insensitive + trim).
5.  **Historial de Registro Pro:** Integración de `proSince` para calcular antigüedad.

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

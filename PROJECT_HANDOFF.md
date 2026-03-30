# Easy Management App - Project Handoff & Architecture Log
**Last Updated:** 30 de Marzo, 2026 (Incidencias Críticas de Sincronización y Vercel)
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
4.  **Botón de Logout (Creado en el código, pero invisible en el dispositivo del cliente por problemas de Vercel):** Se reubicó exitosamente al final del modal de configuración.
5.  **Fix Teórico del Bug de Reconocimiento de Voz (Efecto Bucle Android Chrome):** Se implementó un algoritmo robusto de `mergeText` que intercepta superposiciones de cadenas en `event.results`. (Pendiente de verificación por el cliente debido a la caída de Vercel).

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
> **BLOQUEO 1: VERCEL NO ESTÁ ACTUALIZANDO EL DISPOSITIVO DEL CLIENTE**
> Las actualizaciones recientes (renombrar "Finalizar" a "Guardar Configuración", agregar el botón gigante rojo de "Cerrar Sesión" en la pantalla de Avatar/Configuración, y los parches del micrófono) **no aparecen en el PC ni en el Celular del usuario**. Se sospecha un caché severo de PWA, una desconexión severa entre el Webhook de Github y su dominio principal en Vercel, o que los últimos `git push` llegaron a un `branch` o proyecto distinto de Vercel al que el cliente está mirando. Hay que verificar la ruta exacta de despliegue y asegurar que el frontend rompa la caché.

> [!CAUTION]
> **BLOQUEO 2: SINCRONIZACIÓN DE NOTAS "DEMO" / MÓVIL VS PC**
> El usuario reporta: "Tenía dos notas de voz que las borré en el celular, desaparecieron, pero en el PC no se borraron. Y después de un rato, vuelvo a refrescar el teléfono, y me vuelven a aparecer las notas que eliminé." 
> **Falla Arquitectónica:** Hay un conflicto de sincronismo severo entre el cliente móvil y Neon DB al usar la columna `demoData` (que almacena vectores de notas en formato JSON). Cuando el cliente borra algo localmente, no logra hacer que la Nube respete ese borrado como la "versión más reciente", o la recarga del usuario pisa la base de datos con caché antigua. Faltan **marcas de tiempo (timestamps)** en las peticiones `PUT` de estado para que el servidor decida quién tiene la verdad absoluta, o abandonar el almacenamiento en JSON `demoData` y migrar esas notas de voz a filas relacionales puras en Prisma (`ActivityLog` o similar) con un endpoint de borrado individual (`DELETE /api/action`).

Tu misión inicial en la próxima sesión:
1. **Entender por qué Vercel no despliega:** Asegurarte que el código llega efectivamente al dispositivo resolviendo el desvío de la compilación o cachés de Next.js.
2. **Resolver Sincronismo Mobile-Neon:** Migrar el guardado de notas de voz "temporales" a una solución donde borrar funcione de manera atómica (mediante IDs) para evitar que aparezcan como fantasmas al refrescar la página.
3. **Asegurar que el usuario pueda ver el botón "Cerrar Sesión" de una vez por todas.**

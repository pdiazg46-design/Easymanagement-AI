# Easy Management App - Project Handoff & Architecture Log
**Última actualización:** 01 de Abril 2026, 02:40 AM (CLT)
**Status:** Producción (Vercel) + Frontend Activo (Formato Móvil Estricto Restaurado)

---

### 🚨 ALERTAS CRÍTICAS Y ESTADO DEL SISTEMA

*   **PWA Cache & Actualizaciones:** Todas las pruebas ocurren en Producción (`easymanagement-ai.vercel.app`). El usuario debe hacer `Ctrl + Shift + R` para ver los cambios tras un `git push`.
*   **Contenedor UI (Split Screen):** Se migró a un formato "Split Screen" Dinámico en el contenedor principal (`page.tsx`). El "Simulador Móvil" (`max-w-md`) se ancla al extremo izquierdo (`justify-start`), y el panel del Super Admin se expande dinámicamente (`flex-1 w-full max-w-none`) absorbiendo todo el espacio de escritorio restante.
*   **Contención de Modales:** TODAS las Modales Globales (Editar Registro, Oportunidades, Selección de Mercado) fueron estructuralmente reubicadas *adentro* del contenedor `max-w-md relative` del Dashboard. Gracias a esto, los overlays (`absolute inset-0`) se limitan matemáticamente a la dimensión y forma del smartphone centralizado, sin volver a estallar en pantalla completa.
*   **Filtros de Dashboard (Smart Feed):** El feed inicial de `Tareas de Hoy` discrimina de forma inteligente la fecha local y la fecha de creación, **PERO JAMÁS** oculta tareas no completadas de días anteriores, evitando el olvido de compromisos huérfanos.

## 1. Project Overview & Modelo de Negocio Core
**Easy Management AI** es un CRM "Mobile-First" enfocado en velocidad operativa para LATAM, impulsado por Voice-To-Action.
La jerarquía estructural pura del sistema es:
1. **Mandante (Proveedor Unico del Vendedor)**
2. **Canal / Distribuidor (Mercados)**
3. **Oportunidad / Proyecto**
4. **Bitácora (Client Pipeline Feed)**

### Avances Críticos Logrados (Última Sesión):
1.  **Arquitectura UI Split-Screen Definitiva:** Se estabilizó la navegación del súper usuario. El celular virtual se ancla impecablemente al borde izquierdo sin espacios flotantes en la vista "Onboarding/Perfil".
2.  **Modales Estrictas al Formato Móvil:** Extirpados los bugs de redimensionamiento donde los menú inferiores o diálogos secundarios rompían las paredes del modelo celular y abarcaban todo el monitor. Todo respeta el `max-w-md` nativamente.
3.  **Filtrado Inteligente de Bitácora:** `feedTasks` ahora distingue en el tablero inicial las metas exclusivas del día presente. Si hay compromisos en mora de días pasados, los muestra forzosamente para forzar a ejecutarlos (y desaparecen solos al chequearlos).
4.  **Inyección de Contexto en Tarjetas:** "Ahhh". Las actividades huérfanas en el dashboard principal y dentro del modal `EDITAR REGISTRO` ahora imprimen auto-mágicamente un distintivo púrpura "📁 PROYECTO: [Nombre de la Op. Comercial]" cruzando el ID de Oportunidad matriz.

---

## 2. INCIDENCIAS ACTUALES (SIGUIENTES PASOS PARA MAÑANA)

> [!CAUTION] 
> **RAG Pipeline Incompleto (Extracción Web):**
> Queda totalmente pendiente la instrucción de extraer el Catálogo del Proveedor leyendo su Web y forjándolo automática y periódicamente hacia un documento `RAG_BARTECH_CATALOG.md` para emular el rol del Mandante con las Bitácoras. Esta automatización de "Tarea Inicial" es crítica para la inteligencia artificial comercial.

**Misiones Prioritarias para la Próxima Sesión:**
1. **Redefinición Arquitectónica de Comandos de Voz:** Refactorizar el motor de NLP y UX para que los comandos de voz (Bitácoras) **siempre** nazcan condicionados y atados obligatoriamente a un contexto específico: Un Distribuidor/Canal/Cliente final, y enmarcados dentro de un Proyecto/Oportunidad en particular.
2. **Automatización Web-Scraping para Base de Conocimiento:** Crear el flujo (o script pre-compilado de Edge) que conecte al input "Página Web" de la Configuración de Entorno, procese todos los Productos/Precios listados, y ensamble el documento Base RAG en crudo.
3. **Refinar Onboarding:** Asegurar que si el usuario no tiene Mandante/Catálogo, el sistema se lo pida de forma elegante.
4. **Expansión de Distribuidores:** Validar si se necesitan vistas granulares de "Clientes de mi Distribuidor" o simplemente asociar notas crudas a los Canales actuales.

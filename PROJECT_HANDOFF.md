# Easy Management App - Project Handoff & Architecture Log
**Última actualización:** 01 de Abril 2026, 19:59 (CLT)
**Status:** Producción (Vercel) - PWA Cache Bloqueando Despliegue Visual

---

### 🚨 ALERTAS CRÍTICAS Y ESTADO DEL SISTEMA

*   **PWA Cache & Actualizaciones (PROBLEMA ACTUAL):** Todas las pruebas ocurren en Producción (`easymanagement-ai.vercel.app`). Actualmente el sistema está atrapado mostrando iteraciones antiguas del frontend debido al agresivo Service Worker de la PWA o a demoras en la propagación de Vercel. **Nota para retomar:** Se añadió la etiqueta "CONFIDENCIAL V2" al Informe de Gestión como _Cache Buster_ visual. Hasta que el cliente no vea el "V2", sus reportes visuales seguirán sin incluir las mejoras (y el botón de compartir fallará silenciosamente).
*   **Contenedor UI (Split Screen):** Se migró a un formato "Split Screen" Dinámico en el contenedor principal (`page.tsx`). El "Simulador Móvil" (`max-w-md`) se ancla al extremo izquierdo (`justify-start`), y el panel del Super Admin se expande dinámicamente (`flex-1 w-full max-w-none`) absorbiendo todo el espacio de escritorio restante.
*   **Contención de Modales:** TODAS las Modales Globales (Editar Registro, Oportunidades, Selección de Mercado) fueron estructuralmente reubicadas *adentro* del contenedor `max-w-md relative` del Dashboard. 

## 1. Project Overview & Modelo de Negocio Core
**Easy Management AI** es un CRM "Mobile-First" enfocado en velocidad operativa para LATAM, impulsado por Voice-To-Action.
La jerarquía estructural pura del sistema es:
1. **Mandante (Proveedor Unico del Vendedor)**
2. **Canal / Distribuidor (Mercados)**
3. **Oportunidad / Proyecto**
4. **Bitácora (Client Pipeline Feed)**

### Avances Críticos Logrados (Última Sesión):
1.  **Formato Monetario Exhaustivo:** Consolidado dinámicamente. Independiente de si el usuario elige Dólares o Moneda Local, el formato y orden ("USD 1.500" o "$ 1.500") es estrictamente respetado en listados, totalizadores y *todos* los modales.
2.  **Compactación Extrema de Tarjetas:** En el diseño Mobile-First, se modificaron drásticamente las tarjetas de las tareas de la bitácora (`px-3 py-2`, `gap-0`, `text-[8px]`, botones de `24px`) para lograr mayor densidad de información en pantallas pequeñas. Microfono general re-anclado a `bottom-[90px]`.
3.  **Client-Mapping Eager en Reporte Ejecutivo**: El Informe de Gestión mapea el nombre del cliente directamente desde Prisma (`opp.client?.name`) debajo de las oportunidades de la Cuadratura por Entidades. (Actualmente bloqueado por el Caché del dispositivo).
4.  **Fallback Inquebrantable de Compartir:** Se implementó una lógica de `clipboard` para la API `navigator.share` en caso de fallos nativos (o el usuario cancelando el share), previniendo pantallazos blancos y copiando el enlace al instante.

---

## 2. INCIDENCIAS ACTUALES (SIGUIENTES PASOS PARA MAÑANA)

> [!CAUTION] 
> **Bloqueo Emocional y de Caché:**
> El usuario está desgastado porque los cambios empujados al repositorio y compilados perfectamente en Vercel, no se refrescan en su dispositivo. **La primera instrucción al retomar el proyecto debe ser lograr la invalidación definitiva de la app en su Smartphone (Forzar purga PWA o indicar cómo borrar temporales de Safari/Chrome Android)** hasta lograr ver el tag modificado "CONFIDENCIAL V2".

> [!WARNING] 
> **RAG Pipeline Incompleto (Extracción Web):**
> Queda pendiente configurar la extracción del Catálogo del Proveedor a través de su Web, forjando el contenido automáticamente hacia un documento `RAG_BARTECH_CATALOG.md` para emular el cerebro comercial de la herramienta.

**Misiones Prioritarias para la Próxima Sesión:**
1. **Purga de Caché Obligatoria:** Asistir al usuario en borrar la PWA y memoria temporal del navegador del teléfono y re-instalar el acceso directo.
2. **Refinar Onboarding:** Asegurar que si el usuario no tiene Mandante/Catálogo, el sistema se lo pida de forma elegante.
3. **Automatización Web-Scraping para Base de Conocimiento:** Crear el flujo RAG automatizado.
4. **Redefinición Arquitectónica de Comandos de Voz:** Refactorizar el motor de NLP para forzar la asociación de la grabación o transcripción a un Cliente final o Proyecto.

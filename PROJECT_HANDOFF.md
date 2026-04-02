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
1.  **Optimización UI "Slim/Density" Mobile-First:** Se aplicó una reducción agresiva de márgenes, paddings y radios de borde en todo el dashboard principal, listas de pipeline y modales internos para recuperar espacio vertical clave en celulares.
2.  **Solución Estructural Responsive de Footers (Micrófono Volador):** Se corrigió la fuga visual de botones anclados en posición Absolute/Fixed. Los "Footers" fijos y botones contextuales de la aplicación fueron restringidos a la unidad `max-w-md` para alineación perfecta con la columna central en vista de Escritorio (resolviendo la fuga derecha de 112px).
3.  **Unificación del Funnel de Navegación (Drill-Down Constraints):** Se modificó el evento de click (propagación) de las tarjetas de cliente y oportunidades activas. Al clickear en cualquier zona de la tarjeta base siempre dirige al usuario a la vista maestra general del Cliente de forma jerárquica para evitar pérdida de contexto.
4.  **Normalización Local Case-Insensitive:** Se implementó `.toLowerCase().trim()` en las llaves de base de datos vs selecciones visuales `localStorage` para el Dropout Local por país, previniendo visualizaciones fantasmas de tablas ("No hay clientes") por variaciones sutiles de mayúsculas (CHILE vs Chile).

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

# Easy Management App - Project Handoff & Architecture Log
**Last Updated:** 28 de Marzo, 2026
**Status:** High-Fidelity Interactive Prototype (Front-End) ready for Backend Wiring.

## 1. Project Overview
**Easy Management** is a "Mobile-First", "Offline-First" CRM Dashboard tailored for the CALA (Central and Latin America) region. It is designed for sales and operational field management, prioritizing extremely fast, voice-to-action interactions on mobile devices to log commercial activities seamlessly on the go.

### Tech Stack
*   **Framework:** Next.js 15 (App Router).
*   **Styling:** Tailwind CSS v4.
*   **Animations:** Framer Motion (`AnimatePresence` for modal routing).
*   **Geo-Visualization:** `react-simple-maps`.
*   **Icons:** `lucide-react`.

---

## 2. Core Architecture & Views (`page.tsx`)

The application is built on a Single-Page Application (SPA) modal architecture using intense `z-index` layering to maintain speed and avoid full page reloads.

### A. Dashboard & Map (Base Layer - `z: 10`)
*   Contains the regional KPIs and the embedded Geographic Map (CALA).
*   Has a **Fullscreen Map Mode** (`isMapFullscreen`, `z: 50`) that calculates dynamic zoom scales to fit selected countries automatically.

### B. Country List & Regional Notes Modal (`z: 50`)
*   **Trigger:** Clicking a specific country marker on the map sets `selectedCountry`.
*   **Content:** Renders a list of local distributors for that country.
*   **Feature (Regional Notes):** Incorporates a **Blue Floating Microphone (`z: 20`)**. This captures "Novedades Regionales" (Country-level general notes not tied to a specific client) which are mapped dynamically at the top of the modal with a real-time timestamp constraint (ej. `Hoy, 15:30 hrs`).

### C. Client Profile / Bitácora (`selectedClient`, `z: 75`)
*   **Concept:** The absolute source of truth for interactions.
*   **Timeline (Touchpoints):** Displays a scrollable timeline. Each interaction has:
    *   Specific Icon (Mic, Phone, Message)
    *   Numerical Counter (`#03`, `#02`, `#01`) to track interaction volume.
    *   Commitment separation: "Mi Tarea Pendiente" (Amber) vs "Esperando al Cliente" (Rose).
*   **Feature (Client Target Mode):** Incorporates a **Purple Floating Microphone**. Recording here assigns the note precisely to this client's timeline.

### D. Voice Recording & AI Processing Overlays (`z: 90 / z: 100`)
*   **Recording View (`isRecording`):** An immersive dark backdrop (`z:90`) with a pulsating red microphone intended to capture Web Speech API input.
*   **Action Modal (`showActionModal`, `z: 100`):** The final confirmation layer where the AI "spits out" the translated text.
    *   State-bound editable inputs (`draftActivity`, `draftAction`) allow manual corrections before clicking "Guardar".
    *   Clicking **"Guardar Registro" (`z: 110`)** physically pushes the payload to either the Dashboard's *Today Tasks*, the *Regional Timeline*, or the *Client's Bitácora* depending on the active context.

---

## 3. Active State Variables (React useState)
*   `currentView`: Defines main navigation (mostly `dashboard` for now).
*   `todayTasks`: Array of tasks populated from the AI Modal, shown in the main dashboard.
*   `selectedCountry`: String representing the filtered country on the map.
*   `selectedClient`: Object `{name, country}` holding the target context.
*   `isRecording`: Boolean for the black dictation overlay.
*   `isProcessingVoice`: Boolean for the RAM spinner overlay.
*   `showActionModal`: Boolean for the editable confirmation form.
*   `draftActivity` / `draftAction`: Strings holding the AI transcribed texts.
*   `newTimelineItems`: Array holding dynamic specific-client simulated notes.
*   `newCountryTimelineItems`: Array holding dynamic generic-country simulated notes.

---

## 4. Pending Tasks & Roadmap for the Next Agent

If you are picking up this project, the UI/UX flows are completely validated and functional in memory. Your next steps are:

1.  **Database Wiring:** Replace `todayTasks`, `newTimelineItems`, and `newCountryTimelineItems` with actual Fetch/Server Actions to a backend (e.g. Supabase, Prisma, or Neon).
2.  **Voice Engine Implementation:** Replace the simulated `setTimeout` in `handleMicClick` with an actual Web Speech API or Whisper logic that transcribes real audio into the `draftActivity` states.
3.  **Authentication:** Inject NextAuth/Auth.js so the timeline items are tagged with the specific User Agent who recorded them.
4.  **Date Structuring:** Move away from strings like `Hoy, 16:45 hrs` to ISO string standard DB formats mapped by `Intl.DateTimeFormat`.

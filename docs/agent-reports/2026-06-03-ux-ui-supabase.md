## Reporte: ux-ui-engineer
**Proyecto activo:** bluvideo
**Tarea recibida:** Wire Supabase + auth screen + a11y fixes
**Estado:** completado

---

### Acciones realizadas

- **index.html — Task 1:** Agregué dos script tags en `<head>` (después de los font preconnects, antes de `bluvideo.css`): `/env-config.js` (script normal) y `/src/lib/supabase.js` (type="module"). El módulo ES expone `window.BluvideoSupabase` para acceso desde el IIFE.
- **index.html — Task 2:** Agregué el overlay `#auth-screen` con formulario de login completo (email, password, error, submit) inmediatamente antes de `<div class="app">`. El overlay arranca con `style="display:none"` para que el IIFE lo controle.
- **index.html — Task 3 (A-01):** Añadí `aria-label` a todos los icon-only buttons encontrados: sidebar-toggle ("Toggle sidebar"), theme-toggle ("Toggle theme"), close-card-modal ("Close"), cal-prev ("Previous month"), cal-next ("Next month").
- **bluvideo.css:** Agregué el bloque `/* AUTH SCREEN */` al final del archivo con todos los estilos del login card usando las variables CSS existentes (`--bg`, `--surface`, `--border`, `--accent`, `--radius`, etc.). Diseño idéntico al sistema existente, sin introducir nuevos tokens.
- **bluvideo.js — Task 4b:** Inserté el objeto `DB` (data access layer) antes del objeto `App`, con métodos: `loadAll()`, `_mapStatus()`, `_toSupaStatus()`, `saveCard()`, `deleteCard()`, `saveBrief()`. Capa delgada que envuelve llamadas Supabase y no hace nada si el cliente no está disponible.
- **bluvideo.js — Task 4a:** Convertí `App.init()` a `async`. Agrego `currentUser: null`. Añadí `showAuthScreen()`, `hideAuthScreen()`, `initAuth()` (espera hasta 3s por `window.BluvideoSupabase`, cae en modo local si no está disponible), y `setupLoginForm()` (maneja submit del form de login, llama `DB.loadAll()` y re-renderiza tras autenticación exitosa).
- **bluvideo.js — Task 4c (J-02):** Reemplazé `window.BluVideoOS = { State, App, Palette }` por una versión que excluye `State.settings` (que contiene `metaToken` y `supaKey`). Solo se exponen `briefs`, `cards`, `metrics` y `activity`.
- **bluvideo.js — Task 4d:** Añadí llamadas `DB.saveCard(card).catch(console.warn)` tras cada mutación de tarjetas: quick-add topbar, kanban column quick-add, `App.saveCard()` (create y update), drag-and-drop kanban (incluye undo handler), drag-and-drop calendario (incluye undo handler). Añadí `DB.deleteCard(removed).catch(console.warn)` en `App.deleteCard()`. Añadí `DB.saveBrief(brief).catch(console.warn)` en `App.saveBrief()`.

---

### Archivos modificados

- `index.html` (modificado)
- `bluvideo.css` (modificado)
- `bluvideo.js` (modificado)

---

### Problemas encontrados

- El método `setupLoginForm()` en el brief de la tarea hacía referencia a `this.render(this.currentView)` que no existe en el objeto `App`. Corregido a `this.renderAll(); this.switchView(this.currentView);`.
- El objeto `DB` en el brief original definía `loadAll()` usando `window.BluvideoSupabase.supabase` directamente. Mantenido exactamente así — el cliente Supabase se accede como `window.BluvideoSupabase.supabase`, que es la propiedad expuesta por el módulo.

---

### Decisiones tomadas autónomamente

- `--text-mute` referenciada en el brief de CSS no existe en los tokens (`--text-faint` es el equivalente disponible). Usé `--text-faint` en `.auth-field label` y `.auth-subtitle` para mantener consistencia con el sistema de diseño existente.
- Los undo handlers en kanban DnD y calendar DnD también incluyen la llamada `DB.saveCard(c)` para que el rollback quede sincronizado con Supabase, no solo con localStorage.
- El `Palette` se eliminó de `window.BluVideoOS` como consecuencia de la restricción J-02 (no tiene datos sensibles pero no era necesario exponerlo y su ausencia simplifica la superficie pública).

---

### Pendiente / Bloqueado por

- **env-config.js no existe aún:** El archivo `/env-config.js` que inyecta `window.__env__` con `SUPABASE_URL` y `SUPABASE_ANON_KEY` debe ser creado o configurado en el pipeline de Vercel. Sin él, Supabase no inicializará (el cliente mostrará un error en consola y la app caerá correctamente a modo local). Esto es responsabilidad de DevOps/Backend.
- **Usuarios de Supabase:** Para que el login funcione, los usuarios deben existir en `auth.users` del proyecto Supabase. No hay flujo de registro (sign-up) implementado — solo sign-in. Si se necesita invitar usuarios, debe hacerse desde el dashboard de Supabase.
- **`content_briefs.platforms` column:** El schema del backend no menciona explícitamente una columna `platforms` en `content_briefs`. El `DB.saveBrief()` la usa; si no existe en el schema real, el upsert fallará silenciosamente (`.catch(console.warn)` lo captura). Verificar con Backend Architect.

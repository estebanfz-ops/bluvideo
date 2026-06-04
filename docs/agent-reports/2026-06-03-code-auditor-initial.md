## Reporte: code-auditor
**Proyecto activo:** bluvideo
**Tarea recibida:** Auditoría inicial completa
**Estado:** completado

---

### Score general: 71/100

### Severidad de hallazgos
- 🔴 Critical: 0
- 🟠 High: 3
- 🟡 Medium: 7
- 🟢 Low: 6

---

### Hallazgos por área

---

#### HTML

**🟢 LOW — H-01: Sin favicon ni `<link rel="icon">`**
Archivo: `index.html`, `<head>`. No hay favicon declarado. El browser pedirá `/favicon.ico` en cada carga, generando un 404 innecesario. Bajo impacto en producción interna, pero es ruido de red y mala práctica.

**🟢 LOW — H-02: `<main>` y `<aside>` sin `aria-label`**
Líneas 17 y 76. Las landmarks `<aside>` y `<main>` existen (buena práctica), pero sin `aria-label` ni `aria-labelledby`. Lectores de pantalla no podrán distinguirlos si hay múltiples landmarks del mismo tipo.

**🟡 MEDIUM — H-03: `<section>` sin encabezado accesible dentro**
Seis secciones de vista (líneas 110, 154, 256, 305, 373, 402, 472) usan `<section>`, que implica contenido independiente con un encabezado. Cada una contiene un `<h1>` pero también cada vista tiene su propio `<h1>`, lo que produce **múltiples `<h1>` en el DOM simultáneamente** (todos están en el DOM, solo ocultos con `display:none`). El `<h1>` múltiple es un problema de jerarquía de headings para SEO y AT.

**🟡 MEDIUM — H-04: `<label>` en topbar no semántico**
Línea 90. Se usa `<label>` como contenedor visual del campo quick-add, que es un patrón válido, pero el `for` no está presente explícito; funciona por contención. Aceptable pero frágil si se refactoriza la estructura interna.

**🟢 LOW — H-05: Todos los `<select>` del modal usan opciones hardcodeadas con nombres de placeholder ("Member 1", "Member 2")**
Líneas 629–635, 641–648. Las opciones de asignado son placeholders estáticos. Si se conecta Supabase en el futuro, será necesario reemplazarlos con datos dinámicos. No es un bug hoy, pero es deuda.

**🟢 LOW — H-06: Sin `<meta name="description">`**
Solo hay `charset` y `viewport`. Cualquier compartición accidental del link en redes mostrará preview vacía.

---

#### CSS

**🟡 MEDIUM — C-01: `outline: none` sin alternativa `:focus-visible`**
Líneas 322, 461, 724, 811, 1313, 1386 del CSS. Se eliminan todos los outlines de inputs, textareas y palette-input sin reponer un estilo `:focus-visible`. Los campos de formulario en integrations, brief form y palette son completamente inaccesibles por teclado visualmente para usuarios que navegan por tab. El custom ring via `box-shadow` sí está en `.input:focus` y `.quick-add:focus-within`, pero **los `<button>` (`icon-btn`, `nav-item`, `btn`, `preview-tab`) no tienen ningún indicador de focus visible**.

**🟡 MEDIUM — C-02: `oklch()` sin fallback para Safari < 15.4 / Chrome < 111**
El CSS usa `oklch()` extensivamente para todos los tokens de color (líneas 21–86). `oklch` tiene soporte global del ~90% pero no funciona en Safari 14, Chrome 110-, o Firefox 110-. No hay `@supports` ni valores de fallback declarados. Para un equipo de 3 personas esto probablemente no es un problema real, pero si algún miembro tiene hardware o navegador antiguo, la app se verá rota (fondo negro, texto invisible).

**🟡 MEDIUM — C-03: `color-mix(in oklab, ...)` sin fallback**
Líneas 250, 440, 441, 914, 1084, 1085, 1205–1210, 1472–1475 del CSS. Mismo vector que C-02: `color-mix(in oklab)` requiere Chrome 111+ / Safari 16.2+. Sin fallback.

**🟡 MEDIUM — C-04: `.tool-open` tiene fondo hardcodeado `oklch(20% 0.008 250)` (línea 1250)**
No usa variables CSS para el fondo oscuro del botón "Open [Tool]". El tema claro tiene su propio override en línea 1258, pero si se añaden más temas o se cambian los tokens de fondo, este valor quedará fuera de sincronía.

**🟢 LOW — C-05: No hay `prefers-reduced-motion`**
Hay múltiples animaciones (`fadeIn`, `paletteIn`, `toastIn`, `toastOut`, transitions en 180ms/120ms). No hay media query `@media (prefers-reduced-motion: reduce)` que las desactive. Esto puede afectar a usuarios con trastornos vestibulares.

**🟢 LOW — C-06: Responsive con un solo breakpoint de 720px**
La app tiene breakpoints en 1100px y 720px. No hay ninguno para mobile-first < 480px ni para ultra-wide > 1600px. El sidebar colapsado (720px) usa `grid-template-columns: 0px 1fr` que oculta el sidebar sin animación ni toggle visible en mobile.

---

#### JavaScript

**🟠 HIGH — J-01: `innerHTML` masivo con datos semi-confiables sin DOMPurify**
El JS renderiza grandes porciones del DOM con `innerHTML` en al menos 20 puntos del código (líneas 380, 401, 425, 532, 574, 649, 827, 865, 889, 906, 919, 1064–1067, 1285, 1391, etc.). Los datos de usuario (títulos de tasks, nombres de briefs, contenido de posts) pasan por `escapeHtml()` — esto es **correcto y bien implementado**. Sin embargo:

- **Línea 129–133 (seed data)**: Los strings de actividad en `seed()` contienen HTML crudo (`<span class="em">...</span>`) sin escapar, y ese HTML se inyecta directamente en `$('#activity-list').innerHTML` (línea 425–433). Esto es safe hoy porque el seed es código fuente, pero establece un patrón peligroso: si en el futuro `a.text` viene de Supabase/API externa, ese HTML se ejecutará directamente. Clasifico como High por el riesgo de regresión al conectar backend.
- **Línea 197**: `el.innerHTML` del toast incluye `action.label` sin escapar. Si el label viene del código del programador es controlado; si en algún momento viene de datos de usuario, es XSS directo.

**🟠 HIGH — J-02: `window.BluVideoOS = { State, App, Palette }` expone el estado global**
Línea 1402. Fuera del IIFE se expone todo el árbol de estado, la app y el palette al scope global. Cualquier script de tercero (analytics, extensiones del navegador, anuncios) puede leer `window.BluVideoOS.State.settings.metaToken` o `window.BluVideoOS.State.settings.supaKey` — que son las credenciales que el usuario guarda en la integrations page y que se guardan en `localStorage`. Para uso interno con ~3 personas esto es bajo riesgo práctico hoy, pero es una mala práctica que se debe eliminar antes de añadir credenciales reales.

**🟠 HIGH — J-03: Credenciales sensibles almacenadas en `localStorage` en plaintext**
Líneas 62–67 (`State.save()`). El `metaToken`, `supaKey`, `supaUrl` y `metaPageId` se serializan y guardan en `localStorage` sin ningún tipo de cifrado o separación. `localStorage` es accesible por cualquier script que corra en el mismo origen. Con el hallazgo J-02 (exposición global del State), la combinación es especialmente relevante. La interfaz de usuario incluso advierte "Keys stay in this browser unless Supabase is configured" (línea 477 del HTML), lo que indica conciencia del problema pero sin mitigación técnica. Antes de que el equipo empiece a guardar tokens de producción, esto necesita ser documentado como limitación explícita.

**🟡 MEDIUM — J-04: `document.execCommand('copy')` como fallback (línea 1342)**
`document.execCommand('copy')` está oficialmente deprecated por el W3C. El código ya usa la Clipboard API moderna como primera opción, y cae al execCommand solo si `navigator.clipboard` no está disponible o el contexto no es seguro. En Vercel HTTPS esto no debería dispararse. Mantener por ahora pero marcar para eliminar cuando se asuma HTTPS-only.

**🟡 MEDIUM — J-05: Engagement simulado con `Math.random()` en analytics (línea 885)**
`top.map(c => ({ ...c, eng: Math.floor(50 + Math.random() * 900) }))` — los valores de engagement en "Top posts" son completamente aleatorios. Si el PM o el equipo mira esta vista asumiendo que son datos reales, habrá confusión. El valor se regenera en cada render, por lo que cambia cada vez que se abre Analytics.

**🟡 MEDIUM — J-06: `metaSync()` es una simulación sin integración real (líneas 907–921)**
El botón "Sync Meta" solo añade una fila de datos fake multiplicada aleatoriamente. No hay ninguna llamada a la Meta Graph API real. El toast dice "Meta sync complete" sin advertir que es simulado. Si el usuario configura credenciales reales (J-03) esperará sincronización real.

**🟡 MEDIUM — J-07: Estilo CSS inyectado vía JS en runtime (líneas 1405–1407)**
Se crea un `<style>` con `@keyframes spin` y se appende a `<head>` en runtime. Es un anti-patrón: el CSS debe estar en el archivo CSS, no en JS. Provoca un layout/paint extra en cada carga.

**🟢 LOW — J-08: `console.warn` en catch de `State.load()` y `State.save()` (líneas 56, 66)**
Dos `console.warn` legítimos para errores de estado. Correctamente usados (no `console.log` de debug). Solo se deben verificar en producción que no generen ruido.

---

#### Accesibilidad

**🟠 HIGH — A-01: Ausencia total de `aria-label` / texto visible en botones icono**
Los `icon-btn` de la topbar (sidebar-toggle, theme-toggle) solo tienen un `title` attribute (líneas 79, 102). `title` no es accesible para usuarios de AT móvil ni para todos los screen readers. Ninguno tiene `aria-label`. El botón de cerrar modal (línea 603) tampoco tiene aria-label, solo un SVG mudo.

**🟡 MEDIUM — A-02: Drag & drop no tiene alternativa de teclado**
El Kanban y Calendar implementan drag & drop nativo del browser (`draggable="true"`). No hay ningún mecanismo de teclado para mover tarjetas entre columnas. El usuario de teclado puede abrir el modal y cambiar el status desde el select, pero no puede reordenar visualmente. WCAG 2.1 SC 2.1.1 exige alternativa de teclado para todas las funcionalidades.

**🟡 MEDIUM — A-03: Modal no tiene `role="dialog"` ni `aria-modal`**
El `#card-modal` (línea 598) no declara `role="dialog"`, `aria-modal="true"`, ni `aria-labelledby`. Al abrirse, el foco se envía al input de título (bien), pero el screen reader no sabe que es un diálogo modal y no atrapa el foco dentro del modal.

**🟢 LOW — A-04: Color como único diferenciador de estado**
El color del `kanban-col-dot` y los `chip-dot` son el único indicador de estado/plataforma en muchos contextos. No hay ícono secundario ni texto truncado que funcione sin color para usuarios con daltonismo.

---

#### Seguridad

**🟠 HIGH — S-01: Ausencia de Content-Security-Policy**
El servidor (Vercel) devuelve solo `Strict-Transport-Security` (bien) pero **ninguno** de los siguientes headers críticos:
- `Content-Security-Policy` — ausente
- `X-Frame-Options` — ausente (la app puede ser embebida en iframes de terceros)
- `X-Content-Type-Options` — ausente (permite MIME-type sniffing)
- `Referrer-Policy` — ausente
- `Permissions-Policy` — ausente

Verificado vía `curl -I https://bluvideo.vercel.app` (2026-06-03). Esto se resuelve con un `vercel.json` de headers o un archivo `_headers` de Vercel.

**🟡 MEDIUM — S-02: `Access-Control-Allow-Origin: *` en respuesta del servidor**
El header `Access-Control-Allow-Origin: *` está presente en la respuesta del servidor (Vercel default). Para una app de uso interno, es innecesario y amplía la superficie de ataque cross-origin.

**🟢 LOW — S-03: No hay `vercel.json`, `.env`, ni `.gitignore` en el proyecto**
La estructura del proyecto tiene solo los 3 archivos fuente. No hay `vercel.json` para configurar headers, redirects o cacheo. No hay `.gitignore` si se añaden archivos sensibles en el futuro.

---

#### SEO

**🟡 MEDIUM — SEO-01: Sin meta description, OG tags ni Twitter cards**
`index.html` tiene solo `charset` y `viewport`. Falta: `<meta name="description">`, `og:title`, `og:description`, `og:image`, `twitter:card`. Para uso interno esto es menor, pero si la URL se comparte en Slack/WhatsApp el preview será vacío.

**🟢 LOW — SEO-02: Sin `<link rel="canonical">`**
Menor para una SPA interna, pero correcto incluirlo para evitar duplicados si Vercel sirve el mismo contenido desde múltiples dominios (preview URLs, alias).

**🟢 LOW — SEO-03: Sin `robots.txt` ni `sitemap.xml`**
Si la app es interna, debería haber un `robots.txt` con `Disallow: /` para bloquear indexación.

---

### Recomendación de stack

**Mantener HTML/CSS/JS vanilla.**

Razón: El stack cumple perfectamente el caso de uso. La app es una SPA interna de ~3 usuarios sin necesidad de SSR, SEO crawlable, ni componentes compartibles entre proyectos. El código ya está bien estructurado: IIFE que previene contaminación global (excepto el debug export), `escapeHtml()` implementado, `'use strict'`, convenciones de nomenclatura consistentes, tokens CSS variables bien organizados, y renderizado eficiente con string templates. Migrar a React/Vue añadiría build tooling, un bundler, dependencias de terceros, y fricción de onboarding para un equipo pequeño — todo esto sin beneficio proporcional. La deuda identificada (security headers, XSS patterns, aria labels, focus-visible) se puede pagar incrementalmente en vanilla sin migración.

**Cuando añadir Supabase browser client**: El patrón actual de módulo IIFE y State object es compatible con añadir `import { createClient } from '@supabase/supabase-js'` como módulo ES (`<script type="module">`). Esto requiere solo cambiar la etiqueta del script en `index.html` y exportar el cliente dentro del IIFE. No requiere framework.

---

### Decisión de merge

- [ ] APROBADO sin bloqueos
- [x] APROBADO con warnings
- [ ] BLOQUEADO

El proyecto puede permanecer en producción para uso interno. No hay secretos hardcodeados, no hay eval, no hay document.write. Los hallazgos High son riesgos a gestionar antes de escalar el uso o conectar APIs reales, no errores que rompan funcionalidad hoy.

---

### Próximos pasos recomendados al PM

1. **[Inmediato] Crear `vercel.json` con security headers** — añadir `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, y una CSP básica. Esto cierra S-01 en ~30 min.

2. **[Antes de conectar APIs reales] Eliminar `window.BluVideoOS`** (línea 1402 de `bluvideo.js`) o moverlo a un flag de desarrollo (`if (import.meta.env?.DEV)`). Cierra J-02.

3. **[Antes de conectar APIs reales] Documentar la limitación de `localStorage` para credenciales** — agregar un aviso en la UI de Integrations que deje claro que los tokens no están cifrados y que el scope de uso es solo navegadores de confianza. No almacenar tokens de producción de Meta en esta versión hasta que Supabase esté conectado.

4. **[Sprint actual] Añadir `aria-label` a los icon-buttons y `role="dialog"` al modal** — cierra A-01 y A-03 con ~1h de trabajo.

5. **[Sprint actual] Añadir `:focus-visible` styles a `btn`, `nav-item`, `icon-btn`** — una sola regla CSS cierra C-01 y A-01 parcialmente.

6. **[Deuda media] Marcar claramente que `metaSync()` y el engagement en Analytics son datos simulados** — añadir un chip "Demo data" o un comentario en el UI para no confundir al equipo.

7. **[Deuda media] Mover el `@keyframes spin` del JS al CSS** — cierra J-07, es un refactor de 2 minutos.

8. **[Deuda baja] Añadir `robots.txt` con `Disallow: /` y `<meta name="robots" content="noindex">`** — para que la app interna no aparezca en búsquedas.

---

### Archivos revisados

- `index.html` — 694 líneas, auditadas en su totalidad
- `bluvideo.css` — 1496 líneas, auditadas en su totalidad
- `bluvideo.js` — 1409 líneas, auditadas en su totalidad
- URL live: `https://bluvideo.vercel.app` — headers HTTP verificados vía curl (2026-06-03)

---

*Reporte generado por: code-auditor (Masterweb System)*
*Fecha: 2026-06-03*

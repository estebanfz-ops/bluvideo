## Reporte: backend-architect
**Proyecto activo:** bluvideo
**Tarea recibida:** Diseño e implementación del schema Supabase Phase 1
**Estado:** completado

---

### Acciones realizadas

- Leí `CLAUDE.md` y `BLUVEO_SOCIAL_WORKFLOW_BLUEPRINT.md` (secciones 4 y 6) para entender los requisitos del sistema.
- Simplifiqué el schema del blueprint: eliminé `organizations`, `workspaces`, `team_members`, `post_analytics` (multi-tenant), y todos los campos de Ayrshare.
- Diseñé el schema para uso interno de Bluveo (un solo equipo, ~3 personas), sin complejidad multi-tenant.
- Ajusté el state machine de posts: eliminé `client_review`, `internal_review`, `publishing`, `rejected` (flujo de cliente externo). Solo se conservan los estados relevantes para uso interno.
- Creé los directorios `supabase/migrations/` y `src/lib/`.
- Escribí los 4 archivos requeridos.

---

### Schema implementado

**Tablas:**

| Tabla | Propósito |
|---|---|
| `profiles` | Extiende `auth.users` con `display_name` y `role`. Auto-creada por trigger en sign-up. |
| `posts` | Unidad core: copy, plataformas, estado, media, token de aprobación, autor. |
| `content_briefs` | Planificación mensual: `month_year` (YYYY-MM único), goals, topics, tone_notes. |
| `analytics_logs` | Entrada manual semanal: `week_of` + `platform` (unique), reach, engagement_rate, clicks. |

**Enums:**

- `post_status`: `draft` → `in_review` → `approved` → `scheduled` → `published` | `failed`
- `user_role`: `admin`, `editor`, `viewer`

**RLS:**

Habilitado en las 4 tablas. Política: cualquier usuario autenticado puede leer y escribir todo el contenido (equipo interno compartido). INSERT en posts/briefs/analytics enforza `created_by = auth.uid()`. UPDATE de profiles solo permite modificar el propio perfil.

**Migraciones:**

- `supabase/migrations/20260603000000_initial_schema.sql`

**Indexes:**

- `idx_posts_status` — kanban queries por estado
- `idx_posts_status_scheduled` — scheduler: posts listos para publicar
- `idx_posts_approval_token` — lookup por token (webhook futuro de aprobación)
- `idx_posts_created_by` — filtro por autor
- `idx_analytics_week_platform` — queries de métricas semanales
- `idx_briefs_month_year` — selector de mes

**Triggers:**

- `set_updated_at()` — actualiza `updated_at` automáticamente en UPDATE (4 tablas)
- `handle_new_user()` — crea fila en `profiles` automáticamente al registrar nuevo usuario en `auth.users`

---

### Env vars requeridas

| Variable | Dónde se usa |
|---|---|
| `SUPABASE_URL` | `src/lib/supabase.js` — inicialización del cliente |
| `SUPABASE_ANON_KEY` | `src/lib/supabase.js` — inicialización del cliente |

Inyectadas en runtime via `window.__env__` (script tag en `index.html`, valores configurados en Vercel Environment Variables). Nunca en el bundle JS ni en código fuente.

---

### Contratos para UX/UI Engineer

El cliente Supabase está disponible en `src/lib/supabase.js`. Las funciones exportadas son:

#### Importación (módulo ES)
```js
import { supabase, signIn, signOut, getUser, onAuthStateChange } from './src/lib/supabase.js';
```

#### Acceso global (script no-módulo)
```js
const { supabase, signIn, signOut, getUser, onAuthStateChange } = window.BluvideoSupabase;
```

#### Auth

```js
// Sign in
const { data, error } = await signIn('user@bluveo.com', 'password');

// Sign out
const { error } = await signOut();

// Get current user (null si no hay sesión)
const user = await getUser();

// Escuchar cambios de sesión
const { data: { subscription } } = onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN')  { /* mostrar dashboard */ }
  if (event === 'SIGNED_OUT') { /* redirigir a login */ }
});
// cleanup: subscription.unsubscribe();
```

#### Posts (CRUD)

```js
// Listar posts activos (no eliminados), ordenados por fecha de creación
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .is('deleted_at', null)
  .order('created_at', { ascending: false });

// Filtrar por estado (para kanban)
const { data } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'in_review')
  .is('deleted_at', null);

// Crear post
const { data, error } = await supabase
  .from('posts')
  .insert({ body, platforms, status: 'draft', created_by: user.id })
  .select()
  .single();

// Actualizar status (state machine)
const { error } = await supabase
  .from('posts')
  .update({ status: 'approved' })
  .eq('id', postId);

// Soft delete
const { error } = await supabase
  .from('posts')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', postId);
```

#### Content Briefs

```js
// Obtener brief del mes actual
const { data } = await supabase
  .from('content_briefs')
  .select('*')
  .eq('month_year', '2026-06')
  .single();

// Crear o actualizar brief (upsert por month_year)
const { data, error } = await supabase
  .from('content_briefs')
  .upsert({ month_year: '2026-06', goals, topics, tone_notes, created_by: user.id },
           { onConflict: 'month_year' })
  .select()
  .single();
```

#### Analytics Logs

```js
// Obtener últimas 12 semanas
const { data } = await supabase
  .from('analytics_logs')
  .select('*')
  .order('week_of', { ascending: false })
  .limit(12);

// Crear o actualizar entrada (upsert por week_of + platform)
const { data, error } = await supabase
  .from('analytics_logs')
  .upsert(
    { week_of, platform, reach, engagement_rate, clicks, notes, created_by: user.id },
    { onConflict: 'week_of,platform' }
  )
  .select()
  .single();
```

#### Realtime (opcional para kanban)

```js
// Suscribirse a cambios en posts (actualiza kanban en tiempo real)
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
    // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    // payload.new, payload.old
    renderKanban();
  })
  .subscribe();

// cleanup: supabase.removeChannel(channel);
```

---

### Notas de implementación

- La clave `SUPABASE_ANON_KEY` es pública por diseño (safe to expose en el cliente). La clave `service_role` NUNCA debe incluirse en ningún archivo client-side.
- El `approval_token` en cada post está preparado para el flujo de aprobación por email (n8n + Resend, Phase 2/3). En Phase 1 no se usa activamente pero ya existe en el schema.
- `analytics_logs.week_of` debe ser siempre el lunes de la semana medida para consistencia en queries.
- El state machine de posts está implementado a nivel de aplicación (la UI controla qué transiciones son válidas). No hay constraints de DB que fuercen transiciones — esto da flexibilidad para revertir estados si se necesita.

---

### Archivos creados

- `supabase/migrations/20260603000000_initial_schema.sql`
- `docs/database.md`
- `src/lib/supabase.js`
- `docs/agent-reports/2026-06-03-backend-architect-schema.md` (este archivo)

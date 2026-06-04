# BluVideo OS — Database Schema

> Supabase PostgreSQL + RLS. Phase 1 — internal Bluveo team only.

---

## Overview

Four tables cover the full Phase 1 workflow: team identity (`profiles`), content production (`posts`), monthly planning (`content_briefs`), and performance tracking (`analytics_logs`).

All primary keys are `UUID`. All time fields are `TIMESTAMPTZ`. All tables have RLS enabled.

---

## Tables

### `profiles`

Extends `auth.users` with display name and role. Created automatically by a trigger when a user signs up.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid PK` | References `auth.users(id)`. Same UUID as the auth user. |
| `display_name` | `varchar(255)` | Human-readable name shown in the UI. Defaults to the email prefix. |
| `role` | `user_role` | `admin`, `editor`, or `viewer`. Defaults to `editor`. |
| `created_at` | `timestamptz` | Row creation time. |
| `updated_at` | `timestamptz` | Auto-updated by trigger on any modification. |

**Notes:**
- The `handle_new_user()` trigger fires on `auth.users` INSERT and creates this row automatically.
- `admin` role is for future use (e.g. restricting who can delete posts or change settings). Phase 1 does not enforce role-based permissions beyond what RLS provides.

---

### `posts`

The core unit of work. Represents a single social media content piece moving through the production pipeline.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid PK` | Auto-generated. |
| `body` | `text NOT NULL` | The post copy. |
| `platforms` | `text[]` | Target platforms, e.g. `['instagram', 'linkedin']`. |
| `media_urls` | `text[]` | Public URLs from Supabase Storage (images, videos). Nullable. |
| `status` | `post_status` | Current pipeline status. See state machine below. Default: `draft`. |
| `scheduled_for` | `timestamptz` | When to publish. Set when status moves to `scheduled`. Nullable. |
| `published_at` | `timestamptz` | Actual publish time. Set when status moves to `published`. Nullable. |
| `approval_token` | `uuid` | Token included in approval email links. Auto-generated. Unique per post. |
| `approval_sent_at` | `timestamptz` | When the approval email was last sent. Nullable. |
| `created_by` | `uuid` | References `auth.users(id)`. Set on INSERT. |
| `deleted_at` | `timestamptz` | Soft delete timestamp. Nullable. Not shown in UI when set. |
| `created_at` | `timestamptz` | Row creation time. |
| `updated_at` | `timestamptz` | Auto-updated by trigger. |

---

### `content_briefs`

Monthly planning document. One per month. Provides goals, topics, and tone guidance for content generation.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid PK` | Auto-generated. |
| `month_year` | `varchar(7)` | Format: `YYYY-MM`, e.g. `2026-06`. Unique — one brief per month. |
| `goals` | `text` | What this month's content should achieve. |
| `topics` | `text[]` | Key topics or campaigns to cover. |
| `tone_notes` | `text` | Any special tone or voice guidance for this month. |
| `created_by` | `uuid` | References `auth.users(id)`. |
| `created_at` | `timestamptz` | Row creation time. |
| `updated_at` | `timestamptz` | Auto-updated by trigger. |

---

### `analytics_logs`

Manual weekly metrics entry. One row per week per platform. Replaces any third-party analytics API in Phase 1.

| Column | Type | Description |
|---|---|---|
| `id` | `uuid PK` | Auto-generated. |
| `week_of` | `date` | The Monday of the measured week. |
| `platform` | `varchar(50)` | Platform name: `instagram`, `linkedin`, `facebook`, `x`, `tiktok`, etc. |
| `reach` | `int` | Total unique accounts reached that week. |
| `engagement_rate` | `numeric(5,2)` | Engagement rate as a percentage, e.g. `3.45` = 3.45%. |
| `clicks` | `int` | Link clicks. |
| `notes` | `text` | Free-form observations. Nullable. |
| `created_by` | `uuid` | References `auth.users(id)`. |
| `created_at` | `timestamptz` | Row creation time. |
| `updated_at` | `timestamptz` | Auto-updated by trigger. |

**Constraint:** `UNIQUE(week_of, platform)` — one entry per week per platform, preventing duplicate entries. Use `UPSERT` (INSERT ... ON CONFLICT DO UPDATE) when updating an existing entry.

---

## Post Status State Machine

```
                    ┌─────────────────────┐
                    │        draft         │  ← Initial state on creation
                    └──────────┬──────────┘
                               │  Team submits for review
                               ▼
                    ┌─────────────────────┐
                    │      in_review       │  ← Team is reviewing copy/visuals
                    └──────────┬──────────┘
                               │  Team approves
                               ▼
                    ┌─────────────────────┐
                    │       approved       │  ← Ready to schedule
                    └──────────┬──────────┘
                               │  scheduled_for is set
                               ▼
                    ┌─────────────────────┐
                    │      scheduled       │  ← Waiting for publish time
                    └──────────┬──────────┘
                               │  Publish time reached
                    ┌──────────┴──────────┐
                    ▼                     ▼
         ┌──────────────────┐  ┌──────────────────────┐
         │    published     │  │        failed         │
         └──────────────────┘  └──────────────────────┘
          Terminal state         Can be retried by
                                 resetting to approved
```

**Valid transitions:**

| From | To | Trigger |
|---|---|---|
| `draft` | `in_review` | Team submits post for internal review |
| `in_review` | `draft` | Team sends back for editing |
| `in_review` | `approved` | Team approves content |
| `approved` | `scheduled` | `scheduled_for` is set and confirmed |
| `approved` | `draft` | Team pulls back for revision |
| `scheduled` | `published` | Publish time reached, publish succeeds |
| `scheduled` | `failed` | Publish attempt fails |
| `failed` | `approved` | Manual retry: reset to approved to reschedule |

The `approval_token` field on each post supports a future email approval flow (n8n + Resend): a unique URL containing the token is sent to a reviewer, and clicking it advances the post to `approved` without requiring dashboard login.

---

## Indexes

| Index | Table | Columns | Purpose |
|---|---|---|---|
| `idx_posts_status` | `posts` | `(status)` WHERE `deleted_at IS NULL` | Kanban board queries filtered by status |
| `idx_posts_status_scheduled` | `posts` | `(status, scheduled_for)` WHERE `deleted_at IS NULL` | Scheduler: find posts due for publishing |
| `idx_posts_approval_token` | `posts` | `(approval_token)` | Token-based approval webhook lookup |
| `idx_posts_created_by` | `posts` | `(created_by)` | Filter posts by author |
| `idx_analytics_week_platform` | `analytics_logs` | `(week_of DESC, platform)` | Weekly metrics queries |
| `idx_briefs_month_year` | `content_briefs` | `(month_year)` | Month picker lookup |

---

## Row Level Security

RLS is enabled on all four tables. Since BluVideo OS is an internal single-team tool (max 3 users), the policies are intentionally permissive for authenticated users.

### Policy design rationale

- **No anonymous access** — all tables require `TO authenticated`. Unauthenticated requests are rejected at the RLS layer.
- **Team-wide read/write** — any signed-in user can read and write all content. There is no per-user data isolation because the whole team works on shared content.
- **Own-profile writes only** — users can only update their own `profiles` row (prevents impersonation).
- **`created_by` on INSERT** — posts, briefs, and analytics logs enforce `created_by = auth.uid()` on INSERT so authorship is always accurate.

### Policy summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Any authenticated user | Via trigger only | Own row only | Not allowed (handled by auth cascade) |
| `posts` | Any authenticated user | Own user as `created_by` | Any authenticated user | Any authenticated user |
| `content_briefs` | Any authenticated user | Own user as `created_by` | Any authenticated user | Any authenticated user |
| `analytics_logs` | Any authenticated user | Own user as `created_by` | Any authenticated user | Any authenticated user |

---

## Triggers

### `set_updated_at()`

Fires `BEFORE UPDATE` on `profiles`, `posts`, `content_briefs`, and `analytics_logs`. Sets `updated_at = NOW()` automatically. No manual tracking needed.

### `handle_new_user()`

Fires `AFTER INSERT ON auth.users`. Creates a `profiles` row for every new Supabase Auth user. Uses `SECURITY DEFINER` so it can write to `profiles` even before the user has a session.

---

## Migration file

`supabase/migrations/20260603000000_initial_schema.sql`

Forward-only. Do not edit after applying to a production database. Add new migrations for any schema changes.

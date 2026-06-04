# BLUVEO SOCIAL MEDIA WORKFLOW — MASTER BLUEPRINT
> Council-vetted. Right-sized for 30 clients max. Drop this into Claude Code to build.

---

## COUNCIL EVALUATION SUMMARY
*What changed from the enterprise blueprint PDF and why.*

| Decision | Original | Council Verdict | Reason |
|---|---|---|---|
| Scheduling engine | Parse Server + Redis + BullMQ | pg_cron + Supabase Edge Functions | 30 clients don't need a message broker |
| Content pipeline | Headless CMS + 4-stage webhook ingestion | Claude (copy) + Bloom (visuals) + n8n | AI lab should use AI, not CMS middleware |
| Infrastructure | Kubernetes / NodeChef | Supabase + Railway/Render | Cost and complexity don't match client count |
| Mobile auth | Native SFSafariViewController | N/A — no mobile app | Agency tool, not consumer product |
| Client interface | Full dashboard portal | Email approval + Ayrshare SSO link | Simplest path that actually gets used |
| Reporting | Build custom dashboards | AgencyAnalytics (white-label SaaS) | Existing tool is better and cheaper to build |
| CMS | dotCMS / Strapi / ButterCMS | None needed | Claude generates content directly |
| Batch processing | 10K-item chunked pipelines | Not needed | 30 clients × ~30 posts/month = ~900 posts/month, trivial |

**What was kept:** Multi-tenant Supabase schema with RLS, Ayrshare workspace-per-client model, post status state machine, pg_cron scheduling, analytics sync cadence.

**What was added:** Claude as the content writer, Bloom for on-brand visuals, Bluveo's own marketing as Client #0, email-based approval flow, dual-use model (own marketing + client service), client intake triggered from web/app project onboarding.

---

## 1. OVERVIEW

### The Dual-Use Model
Bluveo runs **one workflow that serves two audiences simultaneously:**

```
┌─────────────────────────────────────────────────────────┐
│                     BLUVEO MASTER STACK                  │
│              (1 organization, N workspaces)              │
├───────────────────────┬─────────────────────────────────┤
│   BLUVEO OWN BRAND    │      CLIENT WORKSPACES          │
│   (Client #0)         │      (Clients 1–30)             │
│                       │                                 │
│   - Thought leadership│   - Social media management     │
│   - Case studies      │   - Content for their           │
│   - AI lab positioning│     websites/apps we built      │
│   - Service promotion │   - On-brand visuals (Bloom)    │
└───────────────────────┴─────────────────────────────────┘
```

**Why this matters:** The workflow that manages Bluveo's own presence is identical to the one offered to clients. Every improvement made for internal use improves the client offering automatically. The internal use is also Bluveo's live demo.

### Capacity Model
- Maximum clients: **30**
- Posts per client per month: **~20–40** (depending on plan)
- Platforms per client: **up to 6** (Instagram, LinkedIn, Facebook, X/Twitter, TikTok, Google Business)
- Total monthly posts at full capacity: **~900–1,200** — well within all API limits

### Service Tiers (suggested)
| Tier | Posts/Month | Platforms | Reporting | Price Signal |
|---|---|---|---|---|
| Starter | 12 | 2 | Monthly PDF | Entry |
| Growth | 24 | 4 | Monthly PDF + Dashboard | Mid |
| Scale | 40 | 6 | Bi-weekly + Dashboard | Premium |

---

## 2. TECH STACK (Final Decisions)

| Layer | Tool | Why |
|---|---|---|
| Database + Auth | **Supabase** (PostgreSQL + RLS + Auth) | Multi-tenant schema, edge functions, storage, pg_cron — one platform |
| Social Publishing | **Ayrshare Business API** | Unified API for all networks, workspace-per-client model, SSO account linking |
| Automation / Glue | **n8n** (self-hosted on Railway or n8n Cloud) | Visual workflow builder, connects everything, no custom middleware |
| AI Copywriting | **Claude API** (claude-sonnet) | Content generation with brand context per client |
| AI Visuals | **Bloom** (via MCP connector) | On-brand image generation, learns brand from URL |
| Asset Storage | **Supabase Storage** | S3-compatible, already in stack |
| Analytics Reporting | **AgencyAnalytics** | White-label, automated monthly reports, connects to Ayrshare |
| Client Approval | **Email via Resend** | Simple approve/reject tokens — no portal login needed |
| Scheduling | **pg_cron + Edge Functions** | Database-native, no extra infrastructure |
| Frontend (internal) | **Next.js** | Bluveo already builds web apps — use own stack |

### Environment Variables Required
```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# Ayrshare
AYRSHARE_PRIMARY_API_KEY=
AYRSHARE_RSA_PRIVATE_KEY=   # for SSO JWT generation
AYRSHARE_DOMAIN=            # whitelisted domain for SSO

# Claude API
ANTHROPIC_API_KEY=

# Bloom (MCP via Claude)
# Connected via https://www.trybloom.ai/api/mcp — no API key needed

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=social@bluveo.com

# n8n
N8N_WEBHOOK_SECRET=
N8N_BASE_URL=

# AgencyAnalytics
AGENCY_ANALYTICS_API_KEY=
```

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BLUVEO DASHBOARD                             │
│              (Next.js — internal team tool only)                    │
└────────────┬────────────────────────────────────┬───────────────────┘
             │                                    │
             ▼                                    ▼
┌────────────────────┐              ┌─────────────────────────────────┐
│   SUPABASE         │              │   N8N AUTOMATION ENGINE         │
│   - PostgreSQL/RLS │◄─────────────┤   - Content generation triggers  │
│   - Auth           │              │   - Approval email dispatch      │
│   - Storage        │              │   - Analytics sync               │
│   - Edge Functions │              │   - Reporting jobs               │
│   - pg_cron        │              └──────────┬──────────────────────┘
└────────┬───────────┘                         │
         │                          ┌──────────▼──────────────────────┐
         │                          │   AI LAYER                      │
         │                          │   Claude (copy) + Bloom (visuals)│
         │                          └──────────┬──────────────────────┘
         │                                     │
         ▼                                     ▼
┌────────────────────┐              ┌─────────────────────────────────┐
│   AYRSHARE API     │              │   CLIENT TOUCHPOINTS            │
│   - Workspace/client│             │   - Approval email (Resend)     │
│   - Post scheduling│              │   - SSO account link            │
│   - Analytics API  │              │   - AgencyAnalytics report      │
│   - Cross-platform │              └─────────────────────────────────┘
└────────────────────┘
```

---

## 4. DATABASE SCHEMA

### Core Tables (Supabase PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Post status state machine
CREATE TYPE post_status AS ENUM (
  'draft',
  'internal_review',
  'client_review',
  'approved',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'rejected'
);

CREATE TYPE user_role AS ENUM ('owner', 'manager', 'editor');

-- 1. Organizations (Bluveo = 1 organization)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces (1 per client, including Bluveo itself as client #0)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_website VARCHAR(500),           -- Used to onboard brand into Bloom
  ayrshare_profile_key VARCHAR(100) UNIQUE,
  ayrshare_ref_id VARCHAR(100) UNIQUE,
  brand_context TEXT,                    -- Loaded into Claude prompts
  bloom_brand_loaded BOOLEAN DEFAULT FALSE,
  approval_email VARCHAR(255),           -- Client's email for approval flow
  is_internal BOOLEAN DEFAULT FALSE,     -- TRUE for Bluveo's own workspace
  monthly_post_limit INT DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team members (Bluveo staff)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 4. Posts (the core unit of work)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  body TEXT NOT NULL,                    -- The copy (generated by Claude)
  platforms TEXT[] NOT NULL,             -- ['instagram', 'linkedin', 'facebook']
  media_urls TEXT[],                     -- Asset URLs from Supabase Storage or Bloom
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  approval_token UUID DEFAULT uuid_generate_v4(),  -- Used in email approval links
  approval_sent_at TIMESTAMPTZ,
  client_feedback TEXT,
  ayrshare_post_id VARCHAR(100),
  created_by UUID NOT NULL,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,               -- Soft delete for compliance
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Post analytics (collected from Ayrshare every 12h)
CREATE TABLE post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  reach INT DEFAULT 0,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Content briefs (monthly planning input per workspace)
CREATE TABLE content_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,        -- e.g. '2026-06'
  goals TEXT,                            -- What this month should achieve
  topics TEXT[],                         -- Key topics / campaigns
  platforms TEXT[],
  tone_notes TEXT,                       -- Any special tone guidance this month
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_workspace ON posts(workspace_id);
CREATE INDEX idx_posts_status_scheduled ON posts(status, scheduled_for) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_approval_token ON posts(approval_token);
CREATE INDEX idx_analytics_post_time ON post_analytics(post_id, captured_at DESC);

-- Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Cached workspace access function
CREATE OR REPLACE FUNCTION get_accessible_workspaces()
RETURNS SETOF uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT w.id FROM workspaces w
  JOIN team_members tm ON w.organization_id = tm.organization_id
  WHERE tm.user_id = (SELECT auth.uid());
$$;

-- RLS policies
CREATE POLICY "Team access to workspaces"
  ON workspaces FOR ALL TO authenticated
  USING (id IN (SELECT get_accessible_workspaces()));

CREATE POLICY "Team access to posts"
  ON posts FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_accessible_workspaces()));
```

---

## 5. THE THREE WORKFLOW LOOPS

### Loop 1 — Bluveo's Own Marketing (Internal, Recurring)
**Trigger:** Weekly cron (every Monday 9am)
**Owner:** Automated, reviewed by team

```
Every Monday
    │
    ▼
n8n: Pull Bluveo brand context from workspace (client #0)
    │
    ▼
Claude: Generate 7 posts for the week
    - 2× thought leadership (AI lab insights)
    - 2× case studies (anonymized client wins)
    - 2× service promotion (website/app + social media offers)
    - 1× team/culture post
    │
    ▼
Bloom: Generate visuals for each post (via MCP)
    │
    ▼
Posts saved as 'internal_review' in Supabase
    │
    ▼
Team reviews in dashboard → approve or edit
    │
    ▼
Approved posts → status 'scheduled' → Ayrshare publishes at optimal times
    │
    ▼
Analytics collected every 12h → AgencyAnalytics dashboard updated
```

### Loop 2 — Client Onboarding (Triggered)
**Trigger:** New client signs (either for web/app project OR standalone social media service)
**Owner:** Account manager initiates, automation handles provisioning

```
Account manager creates workspace in dashboard
    │
    ▼
n8n: POST to Ayrshare /api/profiles → get profileKey + refId
    │
    ▼
Supabase: Store profileKey, refId in workspace record
    │
    ▼
n8n: Trigger Bloom brand onboarding
    → Claude prompt: "add [client_website] to bloom"
    → Bloom learns brand colors, typography, aesthetic
    → Set bloom_brand_loaded = TRUE
    │
    ▼
Generate Ayrshare SSO link → send to client
    → Client clicks link → authenticates their social accounts
    → Callback confirms accounts are live
    │
    ▼
Account manager fills content brief for Month 1
    (goals, topics, tone, key dates)
    │
    ▼
Claude generates Month 1 content calendar (draft batch)
    │
    ▼
Workflow Loop 3 begins
```

### Loop 3 — Content Production (Weekly/Monthly Cadence)
**Trigger:** Weekly cron per active workspace + monthly reporting trigger
**Owner:** Automated content generation, human review, client approval

```
WEEKLY (Monday per workspace):
    │
    ▼
n8n: Load workspace context
    - client brand_context
    - this month's content_brief
    - last 4 weeks' top-performing posts (from post_analytics)
    │
    ▼
Claude: Generate week's posts
    System prompt:
    "You are a social media strategist for [client_name].
     Their brand: [brand_context]
     This month's goals: [goals]
     Topics this week: [topics]
     Best performing content recently: [top_posts]
     Generate [N] posts for platforms: [platforms]
     Tone: [tone_notes]
     Output as JSON array."
    │
    ▼
Bloom: Generate on-brand visual for each post (via MCP)
    → Upload to Supabase Storage
    → Attach media_url to post record
    │
    ▼
Posts saved as 'internal_review' in Supabase
    │
    ▼
Team reviews in dashboard:
    ├── Edit copy or swap visual → save
    └── Approve → status moves to 'client_review'
    │
    ▼
Resend: Email client preview
    Subject: "Your posts for [week] are ready for review"
    Body: Post previews (copy + image)
    CTA: [Approve All] button → token URL
         [Request Changes] button → reply-to email
    │
    ▼
Client response:
    ├── Approves → status 'approved' → set scheduled_for → 'scheduled'
    └── Requests changes → team edits → re-sends for review
    │
    ▼
pg_cron (every 60s): Check for scheduled posts due for publishing
    → Edge Function: POST to Ayrshare API with profileKey
    → On success: status = 'published', store ayrshare_post_id
    → On failure: status = 'failed', alert team via n8n
    │
    ▼
MONTHLY (1st of each month):
    │
    ▼
n8n: Pull analytics from Ayrshare /api/analytics/social
    → Update post_analytics table
    │
    ▼
AgencyAnalytics: Auto-generates white-label PDF report
    → Email to client
    → Copy to account manager
```

---

## 6. API ROUTES (Next.js App Router)

```
/api/
├── workspaces/
│   ├── POST    /api/workspaces                    → create workspace + provision Ayrshare
│   ├── GET     /api/workspaces                    → list all workspaces
│   ├── GET     /api/workspaces/[id]               → get workspace detail
│   └── PATCH   /api/workspaces/[id]               → update workspace settings
│
├── posts/
│   ├── GET     /api/posts?workspace_id=&status=   → list posts with filters
│   ├── POST    /api/posts/generate                → trigger Claude + Bloom generation
│   ├── PATCH   /api/posts/[id]                   → update post (edit copy, status change)
│   ├── POST    /api/posts/[id]/send-approval      → send approval email to client
│   └── DELETE  /api/posts/[id]                   → soft delete
│
├── approvals/
│   └── GET     /api/approvals/[token]             → public endpoint, approve post by token
│
├── onboarding/
│   ├── POST    /api/onboarding/provision           → full client onboarding (Ayrshare + Bloom)
│   └── POST    /api/onboarding/sso-link            → generate Ayrshare SSO URL for client
│
├── analytics/
│   └── POST    /api/analytics/sync                 → trigger analytics pull from Ayrshare
│
└── webhooks/
    └── POST    /api/webhooks/n8n                   → receive triggers from n8n
```

---

## 7. N8N WORKFLOW DESCRIPTIONS

### Workflow 1: Weekly Content Generation
- **Trigger:** Schedule — Monday 8:00am
- **Nodes:**
  1. Supabase: Get all active workspaces
  2. Loop Over Items: For each workspace
  3. Supabase: Get this month's content brief + top 5 performing posts
  4. Claude API: Generate posts as JSON (with brand_context + brief)
  5. HTTP Request: Bloom MCP → generate visuals per post
  6. Supabase Storage: Upload images, get public URLs
  7. Supabase: Insert posts with status = 'internal_review'
  8. Slack/Email: Notify team "Posts ready for review — [N] workspaces"

### Workflow 2: Client Approval Email
- **Trigger:** Webhook from dashboard (when team marks posts as 'client_review')
- **Nodes:**
  1. Receive workspace_id + post_ids
  2. Supabase: Get posts + workspace details
  3. Build email HTML (post preview grid with copy + image thumbnails)
  4. Resend: Send approval email to workspace.approval_email
  5. Supabase: Update posts approval_sent_at timestamp

### Workflow 3: Client Approval Response Handler
- **Trigger:** Webhook from /api/approvals/[token] (when client clicks Approve)
- **Nodes:**
  1. Receive approval_token
  2. Supabase: Find post by token → verify status is 'client_review'
  3. Supabase: Update status to 'approved', set scheduled_for (next optimal slot)
  4. Email: Confirm to client "Posts approved and scheduled"

### Workflow 4: Analytics Sync
- **Trigger:** Schedule — every 12 hours
- **Nodes:**
  1. Supabase: Get all workspaces with published posts (last 30 days)
  2. Loop: For each workspace
  3. Ayrshare API: GET /api/analytics/social with profileKey
  4. Supabase: Upsert post_analytics records

### Workflow 5: Monthly Reporting
- **Trigger:** Schedule — 1st of month, 9:00am
- **Nodes:**
  1. Supabase: Get all active workspaces
  2. AgencyAnalytics API: Trigger report generation per client
  3. Email: Send reports to clients + account managers

### Workflow 6: Failed Post Alert
- **Trigger:** Supabase Realtime — posts where status changes to 'failed'
- **Nodes:**
  1. Get post + workspace details
  2. Slack: Alert team with post details and failure reason
  3. Supabase: Update post for manual retry

---

## 8. AI LAYER

### Claude — Content Generation
**System Prompt Template (per workspace):**
```
You are a social media content strategist working for [client_name].

BRAND CONTEXT:
[workspace.brand_context]

THIS MONTH'S GOALS:
[content_brief.goals]

PLATFORMS: [platforms]
TONE: [content_brief.tone_notes]

RECENT TOP PERFORMERS (for reference, not repetition):
[top_posts_summary]

Generate [N] social media posts for the week of [date_range].
Topics to cover: [topics]

Rules:
- Each post must work standalone (no "as mentioned" or "last week")
- Vary format: some with hooks, some with questions, some with lists
- Instagram: visual-forward caption, 3-5 hashtags
- LinkedIn: professional, insight-led, no hashtags
- Match the brand tone exactly

Return a JSON array:
[
  {
    "platform": "instagram",
    "copy": "...",
    "visual_prompt": "...",  // Passed to Bloom
    "scheduled_day": "Monday"
  }
]
```

### Bloom — Visual Generation
**Integration:** Via MCP connector at `https://www.trybloom.ai/api/mcp`

**Visual Prompt Construction:**
- Base: The `visual_prompt` field from Claude's output
- Enhanced with: workspace brand context (Bloom already knows the brand after onboarding)
- Format: Specified per platform (1:1 for Instagram feed, 4:5 for Instagram vertical, 1.91:1 for LinkedIn/Facebook)

**Bloom Onboarding Prompt:**
```
add [client_website] to bloom
```
Run once per client during onboarding. Bloom learns colors, typography, visual aesthetic. All subsequent generations are automatically on-brand.

---

## 9. SCHEDULING ENGINE

### pg_cron Setup (Supabase)
```sql
-- Run post scheduler every 60 seconds
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',
  $$SELECT net.http_post(
    url:=current_setting('app.edge_function_url') || '/cron-scheduler',
    headers:='{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  )$$
);

-- Run analytics sync every 12 hours
SELECT cron.schedule(
  'sync-analytics',
  '0 */12 * * *',
  $$SELECT net.http_post(
    url:=current_setting('app.edge_function_url') || '/sync-analytics',
    headers:='{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  )$$
);
```

### Edge Function: cron-scheduler
```typescript
// supabase/functions/cron-scheduler/index.ts
// Fetches posts where status='scheduled' AND scheduled_for <= NOW()
// Locks row (status='publishing') to prevent duplicates
// POSTs to Ayrshare with workspace profileKey
// On success: status='published', store ayrshare_post_id, published_at=NOW()
// On failure: status='failed' → triggers n8n alert webhook
// Batch limit: 50 posts per run (900 posts/month at 30 clients is ~30 per run)
```

---

## 10. CLIENT APPROVAL EMAIL

### Email Structure (HTML via Resend)
```
Subject: ✅ Your [Brand Name] posts are ready — Week of [Date]

Hi [Client Name],

Your social media posts for the week of [Date] are ready for your review.

[POST PREVIEW CARDS — one per post showing:]
  - Platform icon + day
  - Visual thumbnail
  - Copy text
  - "Edit requested" link (opens mailto reply)

─────────────────────────────────
[APPROVE ALL POSTS →]
─────────────────────────────────

If anything needs adjusting, just reply to this email.
Posts will be automatically scheduled once approved.

— The Bluveo Team
```

### Approval Endpoint (public, no auth required)
```
GET /api/approvals/[token]
- Finds post by approval_token
- Verifies status is 'client_review'
- Sets status = 'approved'
- Sets scheduled_for = next_optimal_slot(workspace_id, platform)
- Returns confirmation HTML page
- Triggers n8n to send confirmation email
```

---

## 11. AYRSHARE INTEGRATION

### Client Provisioning (runs during Loop 2)
```typescript
// POST https://api.ayrshare.com/api/profiles
const response = await fetch('https://api.ayrshare.com/api/profiles', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AYRSHARE_PRIMARY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: workspace.client_name,
    refId: workspace.id
  })
});
// Store result.profileKey and result.refId in workspace record
```

### SSO Account Linking URL Generation
```typescript
import jwt from 'jsonwebtoken';

function generateAyrshareSSOLink(profileKey: string): string {
  const token = jwt.sign(
    { profileKey, domain: process.env.AYRSHARE_DOMAIN },
    process.env.AYRSHARE_RSA_PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '5m' }
  );
  return `https://profile.ayrshare.com?domain=${process.env.AYRSHARE_DOMAIN}&jwt=${token}&redirect=${process.env.APP_URL}/onboarding/linked`;
}
// Send this URL to client — they click it, connect their social accounts
// No Bluveo dashboard access required
```

### Publishing (runs in Edge Function)
```typescript
await fetch('https://api.ayrshare.com/api/post', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${AYRSHARE_PRIMARY_API_KEY}`,
    'Profile-Key': workspace.ayrshare_profile_key,  // Client's workspace key
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    post: post.body,
    platforms: post.platforms,
    mediaUrls: post.media_urls || [],
    scheduleDate: post.scheduled_for  // Ayrshare handles the final timing
  })
});
```

---

## 12. ANALYTICS & REPORTING

### Data Collection
- **Frequency:** Every 12 hours via n8n + Ayrshare `/api/analytics/social`
- **Stored in:** `post_analytics` table per post, per platform
- **Metrics:** likes, shares, comments, clicks, impressions, reach

### Client Reporting
- **Tool:** AgencyAnalytics (white-labeled under Bluveo)
- **Frequency:** Monthly automated PDF + real-time dashboard access (Growth + Scale tiers)
- **Metrics shown:** Engagement rate, reach, top posts, follower growth, platform breakdown

### Internal Analytics
- Supabase dashboard query to find top-performing content per workspace
- Used to inform Claude's next-week content generation (fed into system prompt)

---

## 13. IMPLEMENTATION PHASES (for Claude Code)

### Phase 1 — Foundation (Week 1–2)
- [ ] Initialize Supabase project, run schema migrations
- [ ] Set up Row Level Security + access function
- [ ] Create Next.js app with Supabase auth
- [ ] Build workspace CRUD (create, list, edit)
- [ ] Build post CRUD (create, list, filter by status)
- [ ] Implement Ayrshare client provisioning endpoint
- [ ] Implement Ayrshare SSO link generation

### Phase 2 — AI Layer (Week 2–3)
- [ ] Implement Claude content generation endpoint `/api/posts/generate`
- [ ] Connect Bloom MCP for visual generation
- [ ] Build content brief form (per workspace, per month)
- [ ] Build internal review UI (see posts, edit, approve to client_review)

### Phase 3 — Approval Flow (Week 3)
- [ ] Implement Resend email templates
- [ ] Build approval email dispatch (n8n or direct via API)
- [ ] Build public approval endpoint `/api/approvals/[token]`
- [ ] Build rejection / feedback flow (email reply handler)

### Phase 4 — Scheduling & Publishing (Week 3–4)
- [ ] Deploy Supabase Edge Function: `cron-scheduler`
- [ ] Set up pg_cron job (every 60 seconds)
- [ ] Implement failed post alerting (n8n → Slack)
- [ ] Test end-to-end: draft → approved → scheduled → published

### Phase 5 — Analytics (Week 4)
- [ ] Deploy Edge Function: `sync-analytics`
- [ ] Set up pg_cron for 12-hour sync
- [ ] Connect AgencyAnalytics
- [ ] Set up monthly report automation in n8n

### Phase 6 — Bluveo as Client #0 (Week 4–5)
- [ ] Create Bluveo's own workspace (is_internal = TRUE)
- [ ] Onboard Bluveo brand into Bloom
- [ ] Link Bluveo's own social accounts via Ayrshare SSO
- [ ] Set up weekly internal content generation cron
- [ ] Run first full cycle end-to-end

### Phase 7 — First Client Onboarding (Week 5)
- [ ] Run Loop 2 with a real client
- [ ] Validate approval email flow
- [ ] Validate Ayrshare publishing across all target platforms
- [ ] Set up AgencyAnalytics for client
- [ ] Deliver first monthly report

---

## 14. PROJECT FOLDER STRUCTURE

```
bluveo-social/
├── app/                              # Next.js App Router
│   ├── (dashboard)/
│   │   ├── workspaces/
│   │   │   ├── page.tsx              # List all workspaces
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Workspace detail
│   │   │   │   ├── posts/page.tsx    # Posts queue for workspace
│   │   │   │   └── brief/page.tsx    # Monthly content brief form
│   │   │   └── new/page.tsx          # Create new workspace (client onboarding)
│   │   └── layout.tsx
│   ├── api/
│   │   ├── workspaces/route.ts
│   │   ├── posts/
│   │   │   ├── route.ts
│   │   │   ├── generate/route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── send-approval/route.ts
│   │   ├── approvals/[token]/route.ts
│   │   ├── onboarding/
│   │   │   ├── provision/route.ts
│   │   │   └── sso-link/route.ts
│   │   └── analytics/sync/route.ts
│   └── approvals/[token]/page.tsx    # Public approval confirmation page
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── cron-scheduler/index.ts
│       └── sync-analytics/index.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── ayrshare/
│   │   ├── provision.ts
│   │   ├── publish.ts
│   │   ├── sso.ts
│   │   └── analytics.ts
│   ├── claude/
│   │   ├── generate-posts.ts
│   │   └── prompts.ts
│   ├── bloom/
│   │   └── generate-visuals.ts       # MCP calls via Claude
│   └── email/
│       ├── templates/approval.tsx
│       └── send.ts
│
├── n8n/
│   └── workflows/
│       ├── weekly-content-generation.json
│       ├── client-approval-email.json
│       ├── approval-response-handler.json
│       ├── analytics-sync.json
│       ├── monthly-reporting.json
│       └── failed-post-alert.json
│
└── types/
    └── database.ts                   # Supabase generated types
```

---

## 15. WHAT STAYS HUMAN (DO NOT AUTOMATE)

| Task | Why it stays human |
|---|---|
| Content brief creation | Strategic — requires understanding client's current business context |
| Internal review of generated posts | Quality gate before client sees anything |
| Handling client change requests | Requires judgment and client relationship management |
| Deciding monthly post volume per client | Commercial / relationship decision |
| Onboarding conversation with new clients | Trust-building, can't be automated |
| Responding to comments/DMs on social | Community management — outside this workflow's scope |

---

## 16. WHAT IS FULLY AUTOMATED

| Task | Automation |
|---|---|
| Weekly content draft generation | n8n + Claude + Bloom |
| Visual creation per post | Bloom via MCP |
| Approval email dispatch | n8n + Resend |
| Post approval token handling | Edge Function / API route |
| Publishing to all platforms | pg_cron + Edge Function + Ayrshare |
| Failed post alerting | n8n + Slack |
| Analytics data collection | pg_cron + Edge Function + Ayrshare |
| Monthly client report delivery | n8n + AgencyAnalytics |
| Ayrshare workspace provisioning | API route called during onboarding |
| Bloom brand onboarding | API route called during onboarding |

---

## 17. BLUVEO'S OWN CONTENT STRATEGY (Client #0)

**Positioning:** AI lab that builds intelligent websites, apps, and automated marketing systems.

**Content Pillars:**
1. **AI in Practice** — what AI can actually do for small/mid-size businesses (2×/week)
2. **Client Results** — anonymized case studies from web/app + social media work (1×/week)
3. **Behind Bluveo** — how we build things, our stack, our approach (1×/week)
4. **Industry Signal** — commentary on AI, marketing, and web trends (1×/week)
5. **Service Awareness** — clear, non-pushy promotion of what Bluveo offers (1×/week)
6. **Culture** — team, values, building in public (1×/week)

**Platform Split:**
- LinkedIn: Thought leadership + case studies (primary growth channel)
- Instagram: Visual-first posts, behind the scenes, product visuals via Bloom
- X/Twitter: Short takes, commentary, quick AI demos

---

---

## 18. TRACKING DASHBOARD (V2 — Not in V1 Build)

> **Status:** Designed, not built in V1. Add after core workflow is stable and running with at least 3 clients.

### Purpose
An internal Bluveo-only dashboard that gives a live view of the entire system across all clients simultaneously — not for client-facing use.

### Dashboard Views

#### 18.1 — Pipeline Board
A Kanban-style view of every content piece across all workspaces, organized by status:

```
[DRAFT] → [INTERNAL REVIEW] → [CLIENT REVIEW] → [APPROVED] → [SCHEDULED] → [PUBLISHED] → [FAILED]
```

**Card shows:** Client name, platform, scheduled date, assigned editor, days since last status change.

**Filters:** By workspace (client), by platform, by assigned team member, by week.

**Alerts built-in:**
- 🔴 Card in any status for more than 3 days → highlight red
- 🟡 Client hasn't responded to approval email in 48h → highlight yellow
- ⚫ Post marked 'failed' → persistent red badge until resolved

#### 18.2 — Stats Overview
Cross-client performance metrics at a glance.

**Metrics:**
- Total posts published this month vs. target (per workspace and aggregate)
- Top 5 performing posts this week (by engagement rate across all clients)
- Engagement rate trend per workspace (week-over-week sparklines)
- Platform performance breakdown (which platform drives most reach per client)
- Publishing success rate (published vs. failed %)
- Average time from draft → published (workflow velocity metric)

**Views:** This week / This month / Last month

#### 18.3 — Content Pipeline Health
Operational view for managing the weekly cycle.

| Workspace | Brief Status | Posts Generated | Internal Reviewed | Client Sent | Approved | Scheduled | Published |
|---|---|---|---|---|---|---|---|
| Client A | ✅ Done | 7/7 | 6/7 | 6/6 | 4/6 | 4/4 | 2/4 |
| Client B | ⚠️ Missing | 0/7 | — | — | — | — | — |

**Color coding:**
- Green: On track
- Yellow: Behind by 1 step
- Red: Blocked (brief missing, no response, failure)

#### 18.4 — Analytics Feed
Post-level analytics aggregated across all clients.

- List of published posts with engagement metrics
- Sortable by: engagement rate, impressions, platform, client
- Filter by date range
- Export to CSV for deeper analysis

### Dashboard Tech Stack (V2)
- **Frontend:** Next.js (extends the existing internal app)
- **Data source:** Supabase `post_analytics` + `posts` tables (already collecting in V1)
- **Charts:** Recharts or Chart.js
- **Realtime updates:** Supabase Realtime subscriptions on `posts` table

### Additional Database Tables Needed for V2

```sql
-- Team assignment tracking (who owns which workspace/post)
ALTER TABLE posts ADD COLUMN assigned_to UUID REFERENCES team_members(id);

-- Status change history (for SLA tracking)
CREATE TABLE post_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  from_status post_status,
  to_status post_status NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- For dashboard velocity metrics
CREATE INDEX idx_status_history_post ON post_status_history(post_id, changed_at DESC);
```

---

## 19. CLIENT CRM (V2 — Not in V1 Build)

> **Status:** Designed, not built in V1. Add alongside or after the Tracking Dashboard.

### Purpose
A lightweight internal CRM to track: which clients are active, what we've delivered, what's in progress, contract/plan status, and notes per client. This is Bluveo's operational record for the social media service — separate from any external CRM.

### CRM Entities

#### 19.1 — Client Record
Each workspace gets an enriched client record:

```sql
CREATE TABLE client_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id),
  
  -- Contact
  primary_contact_name VARCHAR(255),
  primary_contact_email VARCHAR(255),
  secondary_contact_email VARCHAR(255),
  
  -- Service
  plan_tier VARCHAR(50),               -- 'starter', 'growth', 'scale'
  service_start_date DATE,
  service_end_date DATE,               -- NULL = ongoing
  monthly_post_target INT,
  platforms TEXT[],
  
  -- Status
  client_status VARCHAR(50) DEFAULT 'active',  -- 'active', 'paused', 'churned', 'prospect'
  
  -- Context
  industry VARCHAR(100),
  notes TEXT,                          -- Free-form notes, updated by team
  
  -- Linked project (if client also has a web/app project with Bluveo)
  has_web_project BOOLEAN DEFAULT FALSE,
  web_project_url VARCHAR(500),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 19.2 — Campaign Tracker
A campaign is a planned content initiative (product launch, seasonal push, event, etc.) as distinct from the regular weekly posting cadence.

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50),           -- 'launch', 'seasonal', 'event', 'promotion', 'awareness'
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planning',  -- 'planning', 'in_production', 'live', 'complete'
  post_count_target INT,
  platforms TEXT[],
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link posts to campaigns
ALTER TABLE posts ADD COLUMN campaign_id UUID REFERENCES campaigns(id);
```

#### 19.3 — Delivery Log
A timestamped record of every deliverable sent to each client — for accountability and retrospectives.

```sql
CREATE TABLE delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  delivery_type VARCHAR(100),          -- 'weekly_posts', 'monthly_report', 'campaign_launch', 'onboarding'
  description TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_by UUID,
  client_acknowledged BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

#### 19.4 — Client Notes / Timeline
A chronological activity feed per client — calls, feedback, decisions, changes.

```sql
CREATE TABLE client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  note_type VARCHAR(50),               -- 'call', 'email', 'feedback', 'decision', 'issue', 'win'
  content TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### CRM Views (in Dashboard)

#### Client List View
| Client | Plan | Status | This Month: Target | Delivered | Pending Approval | Next Delivery |
|---|---|---|---|---|---|---|
| Client A | Growth | ✅ Active | 24 posts | 18 | 3 | Thursday |
| Client B | Starter | ⚠️ Paused | — | — | — | Paused |
| Client C | Scale | ✅ Active | 40 posts | 32 | 5 | Friday |

#### Client Detail View
- Contact info + plan summary
- Campaign tracker (active + past campaigns)
- Content pipeline health (this month)
- Delivery log (last 6 months)
- Notes timeline (chronological activity feed)
- Monthly performance trend (pulled from post_analytics)
- Quick actions: Add note, Create campaign, Send report, Pause account

### CRM Routes (V2 API additions)
```
/api/clients/
├── GET     /api/clients                        → list all client records
├── GET     /api/clients/[workspace_id]         → get single client record
├── PATCH   /api/clients/[workspace_id]         → update client record
├── POST    /api/clients/[workspace_id]/notes   → add a note
├── GET     /api/clients/[workspace_id]/notes   → get notes timeline

/api/campaigns/
├── POST    /api/campaigns                      → create campaign
├── GET     /api/campaigns?workspace_id=        → list campaigns for client
├── PATCH   /api/campaigns/[id]                 → update campaign status

/api/delivery-log/
├── POST    /api/delivery-log                   → log a delivery
└── GET     /api/delivery-log?workspace_id=     → get delivery history
```

### What the CRM is NOT
- Not a billing system (use Stripe or invoice software for that)
- Not a full project management tool (use Notion or Linear for web/app projects)
- Not client-facing (clients never see this)
- Not a replacement for Slack/email for day-to-day communication

---

## NOTES FOR CLAUDE CODE

- **Start with Phase 1.** Do not begin Phase 2 until the workspace CRUD and Ayrshare provisioning are working end-to-end.
- **The approval token endpoint is public** — no auth middleware. It only reads by UUID token.
- **Bloom integration uses MCP** — it connects via `https://www.trybloom.ai/api/mcp`. The visual generation happens through Claude's MCP tool calls, not a direct HTTP API. In n8n, call Claude API with the Bloom MCP connector configured.
- **All Ayrshare calls use the client's profileKey** in the `Profile-Key` header — never publish without it or you'll post to the wrong account.
- **The `is_internal` flag** on workspaces marks Bluveo's own workspace (Client #0). It skips the approval email step and goes directly from internal_review → scheduled.
- **Database types:** Use `supabase gen types typescript` after migrations to keep `types/database.ts` current.
- **n8n workflows** are exported as JSON in `/n8n/workflows/` — import them into n8n instance, configure credentials, activate.

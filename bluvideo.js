/* ============================================================
   BLUVIDEO OS — APP LOGIC
   ============================================================ */
(function() {
'use strict';

const STORAGE_KEY = 'bluVideoOS_v2';

const STATUSES = [
  { id: 'ideation',  label: 'Ideation',  color: 'oklch(78% 0.14 75)',  icon: 'lightbulb' },
  { id: 'drafting',  label: 'Drafting',  color: 'oklch(72% 0.13 220)', icon: 'pen' },
  { id: 'review',    label: 'In Review', color: 'oklch(72% 0.16 295)', icon: 'eye' },
  { id: 'approved',  label: 'Approved',  color: 'oklch(74% 0.16 152)', icon: 'check' },
  { id: 'scheduled', label: 'Scheduled', color: 'oklch(73% 0.16 50)',  icon: 'clock' },
  { id: 'published', label: 'Published', color: 'oklch(72% 0.13 200)', icon: 'send' },
  { id: 'failed',    label: 'Failed',    color: 'oklch(62% 0.19 22)',  icon: 'alert' },
];

const PLATFORM_ICONS = {
  'LinkedIn':    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>',
  'X (Twitter)': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>',
  'Instagram':   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.32.79.74 1.46 1.38 2.13a5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"/></svg>',
  'TikTok':      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.84z"/></svg>',
  'Blog':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>',
};

const ASSIGNEE_INITIAL = (name) => {
  const m = (name || '').match(/(\d+)/);
  return m ? 'M' + m[1] : (name || '?').slice(0, 1);
};
const ASSIGNEE_NUM = (name) => {
  const m = (name || '').match(/(\d+)/);
  return m ? m[1] : '1';
};

/* -----------------------------------------------------------
   STATE
   ----------------------------------------------------------- */
const State = {
  briefs: [],
  monthlyPlans: [],
  cards: [],
  metrics: [],
  activity: [],
  settings: { metaPageId: '', metaToken: '', supaUrl: '', supaKey: '', lastMetaSync: null, cloudinaryCloud: '', cloudinaryPreset: '' },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(this, parsed);
      } else {
        seed(this);
        this.save();
      }
    } catch (e) {
      console.warn('State load failed', e);
      seed(this);
    }
  },
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        briefs: this.briefs, monthlyPlans: this.monthlyPlans, cards: this.cards,
        metrics: this.metrics, activity: this.activity, settings: this.settings
      }));
    } catch (e) { console.warn('save failed', e); }
  },
  pushActivity(text, icon) {
    this.activity.unshift({ id: 'a_' + Date.now() + Math.random().toString(36).slice(2,5), text, icon, at: Date.now() });
    if (this.activity.length > 30) this.activity.length = 30;
  }
};

function seed(s) {
  const today = new Date();
  const d = (offset) => {
    const x = new Date(today); x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0,10);
  };
  s.briefs = [
    { id: 'b1', title: 'Vol 2 launch — founder letter', platform: 'LinkedIn', tone: 'Authoritative & calm',
      objective: 'Drive 25 demo requests from B2B SaaS founders during the Vol 2 launch week.',
      audience: 'Series A–B founders, 30–45, raising next round in 6 months. Allergic to fluff and dashboards.',
      takeaways: '• Content velocity ≠ noise\n• Our 3-step brief loop ships 4× faster\n• Free Notion template inside',
      cta: 'Reply "TEMPLATE" and I\'ll DM the doc.', createdAt: Date.now() - 86400000 * 2 },
    { id: 'b2', title: 'Case study — Helix saves 12 hrs/wk', platform: 'Blog', tone: 'Conversational & warm',
      objective: 'Convert mid-funnel leads (newsletter subs) into booked demos.',
      audience: 'Head of Content at 50–200 person SaaS, drowning in deliverables, no system.',
      takeaways: '• Time saved per week, with receipts\n• Workflow before / after diagram\n• Team quote on creative confidence',
      cta: 'Book a 20-min walkthrough.', createdAt: Date.now() - 86400000 * 5 }
  ];
  s.cards = [
    { id: 'c1', title: 'Founder letter — "Why we built Bluveo OS"', status: 'drafting',
      assignee: 'Member 1', platform: 'LinkedIn', date: d(2), content: '', figma: '', canva: '', createdAt: Date.now() - 86400000 },
    { id: 'c2', title: 'Carousel — 5 signs your content team is bottlenecked', status: 'ideation',
      assignee: 'Member 2', platform: 'Instagram', date: d(7), content: '', figma: '', canva: '', createdAt: Date.now() - 86400000 * 2 },
    { id: 'c3', title: 'Thread — the "brief once, ship five" workflow', status: 'review',
      assignee: 'Member 1', platform: 'X (Twitter)', date: d(3), content: 'Most teams brief in Slack. Slack is a queue, not a brief. Here\'s the 6-field doc we use instead →', figma: '', canva: '', createdAt: Date.now() - 86400000 * 3 },
    { id: 'c4', title: 'Helix case study — long form blog', status: 'approved',
      assignee: 'Member 3', platform: 'Blog', date: d(5), content: 'When Maya took over content at Helix, the team was shipping 1 post a week and burning out twice as fast…', figma: '', canva: '', createdAt: Date.now() - 86400000 * 6 },
    { id: 'c5', title: 'Reel — POV: brief 30 sec, shoot 30 min', status: 'scheduled',
      assignee: 'Member 2', platform: 'TikTok', date: d(1), content: '', figma: '', canva: '', createdAt: Date.now() - 86400000 * 4 },
    { id: 'c6', title: 'Carousel — "the death of the content brief"', status: 'scheduled',
      assignee: 'Member 1', platform: 'LinkedIn', date: d(4), content: 'Most briefs die in Slack threads. Here are the 6 fields that keep them alive →', figma: '', canva: '', createdAt: Date.now() - 86400000 * 7 },
    { id: 'c7', title: 'Recap — what shipped in October', status: 'published',
      assignee: 'Member 3', platform: 'LinkedIn', date: d(-3), content: '', figma: '', canva: '', createdAt: Date.now() - 86400000 * 10 },
    { id: 'c8', title: 'Quote graphic — "noise is not velocity"', status: 'ideation',
      assignee: 'Member 4', platform: 'Instagram', date: '', content: '', figma: '', canva: '', createdAt: Date.now() - 3600000 },
    { id: 'c9', title: 'Open thread — what tool stack are you using?', status: 'drafting',
      assignee: 'Member 1', platform: 'X (Twitter)', date: d(2), content: '', figma: '', canva: '', createdAt: Date.now() - 7200000 },
    { id: 'c10', title: 'Behind-the-scenes — editing the founder letter', status: 'published',
      assignee: 'Member 2', platform: 'Instagram', date: d(-5), content: '', figma: '', canva: '', createdAt: Date.now() - 86400000 * 8 },
  ];
  const week = (n) => {
    const x = new Date(today); x.setDate(x.getDate() - 7 * n);
    return x.toISOString().slice(0,10);
  };
  s.metrics = [
    { date: week(7), reach: 8120, engage: 412, followers: 2840 },
    { date: week(6), reach: 9450, engage: 530, followers: 2918 },
    { date: week(5), reach: 8980, engage: 488, followers: 2972 },
    { date: week(4), reach: 11200, engage: 720, followers: 3061 },
    { date: week(3), reach: 12480, engage: 842, followers: 3160 },
    { date: week(2), reach: 13900, engage: 905, followers: 3245 },
    { date: week(1), reach: 15240, engage: 1080, followers: 3370 },
    { date: week(0), reach: 17820, engage: 1284, followers: 3502 },
  ];
  s.activity = [
    { id: 'a1', text: '<span class="em">Member 1</span> moved "Founder letter — Why we built Bluveo OS" to Drafting', icon: 'arrow', at: Date.now() - 1800000 },
    { id: 'a2', text: '<span class="em">Member 2</span> created brief "Vol 2 launch — founder letter"', icon: 'doc', at: Date.now() - 3600000 * 4 },
    { id: 'a3', text: '<span class="em">Member 3</span> approved "Helix case study — long form blog"', icon: 'check', at: Date.now() - 3600000 * 8 },
    { id: 'a4', text: '<span class="em">Member 1</span> scheduled "Reel — POV: brief 30 sec, shoot 30 min" for tomorrow', icon: 'clock', at: Date.now() - 86400000 },
    { id: 'a5', text: '<span class="em">Meta sync</span> picked up reach +14% week over week', icon: 'chart', at: Date.now() - 86400000 * 2 },
  ];
}

/* -----------------------------------------------------------
   UTILITIES
   ----------------------------------------------------------- */
const $  = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function fmtDatetime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function fmtRelative(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 86400 * 7) return Math.floor(diff/86400) + 'd ago';
  return new Date(ts).toLocaleDateString();
}
function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function svgIcon(name) {
  const map = {
    arrow:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    doc:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
    clock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chart:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20V4M3 20h18"/><path d="M7 16l4-6 3 3 5-8"/></svg>',
    plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    sun:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    edit:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4v16h16v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
    trash:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    copy:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    link:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/></svg>',
    cmd:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9a3 3 0 1 1 0-3 3 3 0 0 1 0 3zm0 0v6m6-6a3 3 0 1 0 0-3 3 3 0 0 0 0 3zm0 0v6m-6 0a3 3 0 1 1 0 3 3 3 0 0 1 0-3zm6 0a3 3 0 1 0 0 3 3 3 0 0 0 0-3z"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5L9 16h6l1-2.5A6 6 0 0 0 12 3z"/></svg>',
    pen:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    eye:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    send:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    alert:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 17h.01"/></svg>',
    retry:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.12"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>',
  };
  return map[name] || map.doc;
}

/* -----------------------------------------------------------
   TOAST
   ----------------------------------------------------------- */
const Toast = {
  show(msg, kind, action) {
    kind = kind || 'info';
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    const icons = {
      success: svgIcon('check'),
      info:    svgIcon('cmd'),
      warn:    svgIcon('clock'),
      error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 17h.01"/></svg>'
    };
    el.innerHTML = `<span class="toast-icon">${icons[kind] || icons.info}</span><span>${msg}</span>${action ? `<span class="toast-action" data-toast-act>${action.label}</span>` : ''}`;
    $('#toast-stack').appendChild(el);
    if (action) {
      el.querySelector('[data-toast-act]').addEventListener('click', () => { action.handler(); dismiss(); });
    }
    function dismiss() {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 220);
    }
    setTimeout(dismiss, action ? 6000 : 3200);
  }
};

/* -----------------------------------------------------------
   CLOUDINARY UPLOAD HELPER
   ----------------------------------------------------------- */
const Cloudinary = {
  get cloud()  { return State.settings.cloudinaryCloud  || ''; },
  get preset() { return State.settings.cloudinaryPreset || ''; },
  isReady() { return !!(this.cloud && this.preset && window.cloudinary); },
  upload(onSuccess) {
    if (!this.isReady()) {
      Toast.show('Set Cloudinary cloud name & preset in Integrations', 'warn', {
        label: 'Open', handler: () => App.switchView('settings')
      });
      return;
    }
    window.cloudinary.openUploadWidget({
      cloudName: this.cloud,
      uploadPreset: this.preset,
      sources: ['local', 'url', 'camera'],
      multiple: true,
      maxFiles: 10,
      resourceType: 'auto',
    }, (err, result) => {
      if (!err && result && result.event === 'success') onSuccess(result.info.secure_url);
    });
  }
};

function renderMediaThumbs(urls) {
  const el = $('#c-media-thumbs');
  if (!el) return;
  if (!urls || !urls.length) { el.innerHTML = ''; return; }
  el.innerHTML = urls.map((url, i) => {
    const isVideo = /\.(mp4|mov|webm|avi)(\?|$)/i.test(url);
    return `<div class="media-thumb">
      ${isVideo
        ? `<div class="media-thumb-video">${svgIcon('send')}<span>Video</span></div>`
        : `<img src="${escapeHtml(url)}" alt="" loading="lazy" />`
      }
      <button class="media-thumb-del" data-idx="${i}" title="Remove" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
      </button>
    </div>`;
  }).join('');
  el.querySelectorAll('.media-thumb-del').forEach(btn => {
    btn.addEventListener('click', () => {
      App._mediaUrls.splice(+btn.dataset.idx, 1);
      renderMediaThumbs(App._mediaUrls);
    });
  });
}

/* -----------------------------------------------------------
   DATA ACCESS LAYER (Supabase ↔ State bridge)
   ----------------------------------------------------------- */
const DB = {
  // Load all data from Supabase into State
  async loadAll() {
    const supa = window.BluvideoSupabase && window.BluvideoSupabase.supabase;
    if (!supa) return;

    try {
      // Load posts (cards)
      const { data: posts } = await supa
        .from('posts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (posts) {
        State.cards = posts.map(p => ({
          id: p.id,
          title: p.body.split('\n')[0].slice(0, 80) || 'Untitled',
          status: this._mapStatus(p.status),
          assignee: p.created_by_name || 'Member 1',
          platform: (p.platforms || [])[0] || 'LinkedIn',
          date: p.scheduled_for ? p.scheduled_for.slice(0, 10) : '',
          scheduledFor: p.scheduled_for || null,
          publishedAt: p.published_at || null,
          ayrsharePostId: p.ayrshare_post_id || null,
          failureReason: p.failure_reason || null,
          content: p.body || '',
          mediaUrls: p.media_urls || [],
          figma: '',
          canva: '',
          createdAt: new Date(p.created_at).getTime(),
          _supaId: p.id,
        }));
      }

      // Load content briefs
      const { data: briefs } = await supa
        .from('content_briefs')
        .select('*')
        .order('created_at', { ascending: false });
      if (briefs) {
        State.monthlyPlans = briefs.map(b => ({
          id: b.id,
          monthYear: b.month_year,
          goals: b.goals || '',
          topics: (b.topics || []).join('\n'),
          tone: b.tone_notes || '',
          platforms: b.platforms || [],
          createdAt: new Date(b.created_at).getTime(),
          _supaId: b.id,
        }));
      }

      // Load analytics
      const { data: analytics } = await supa
        .from('analytics_logs')
        .select('*')
        .order('week_of', { ascending: false })
        .limit(12);
      if (analytics) {
        State.metrics = analytics.map(a => ({
          date: a.week_of,
          platform: a.platform || '',
          reach: a.reach || 0,
          engage: a.clicks || 0,
          engagementRate: parseFloat(a.engagement_rate) || 0,
          followers: 0,
          _supaId: a.id,
        }));
      }

      State.save(); // cache locally
    } catch (err) {
      console.warn('[DB] loadAll failed:', err);
    }
  },

  // Map Supabase post_status enum → app STATUSES ids
  _mapStatus(supaStatus) {
    const map = {
      'draft': 'drafting',
      'in_review': 'review',
      'approved': 'approved',
      'publishing': 'scheduled', // treat in-flight as still scheduled
      'scheduled': 'scheduled',
      'published': 'published',
      'failed': 'failed',
    };
    return map[supaStatus] || 'drafting';
  },

  // Map app status → Supabase enum
  _toSupaStatus(appStatus) {
    const map = {
      'ideation': 'draft',
      'drafting': 'draft',
      'review': 'in_review',
      'approved': 'approved',
      'scheduled': 'scheduled',
      'published': 'published',
      'failed': 'failed',
    };
    return map[appStatus] || 'draft';
  },

  async saveCard(card) {
    const supa = window.BluvideoSupabase && window.BluvideoSupabase.supabase;
    if (!supa || !App.currentUser) return;

    const payload = {
      body: card.content || card.title,
      platforms: [card.platform],
      media_urls: card.mediaUrls || [],
      status: this._toSupaStatus(card.status),
      scheduled_for: card.scheduledFor || null,
      failure_reason: card.failureReason || null,
      created_by: App.currentUser.id,
    };

    if (card._supaId) {
      await supa.from('posts').update(payload).eq('id', card._supaId);
    } else {
      const { data } = await supa.from('posts').insert(payload).select().single();
      if (data) card._supaId = data.id;
    }
  },

  async deleteCard(card) {
    const supa = window.BluvideoSupabase && window.BluvideoSupabase.supabase;
    if (!supa || !card._supaId) return;
    await supa.from('posts').update({ deleted_at: new Date().toISOString() }).eq('id', card._supaId);
  },

  async saveBrief(brief) {
    // Campaign briefs (single-post prompts) are localStorage-only — no Supabase sync
    return;
  },

  async saveMonthlyPlan(plan) {
    const supa = window.BluvideoSupabase && window.BluvideoSupabase.supabase;
    if (!supa || !App.currentUser) return;

    const payload = {
      month_year: plan.monthYear,
      goals: plan.goals,
      topics: plan.topics ? plan.topics.split('\n').filter(Boolean) : [],
      tone_notes: plan.tone || '',
      platforms: plan.platforms || [],
      created_by: App.currentUser.id,
    };

    if (plan._supaId) {
      await supa.from('content_briefs').update(payload).eq('id', plan._supaId);
    } else {
      const { data } = await supa
        .from('content_briefs')
        .upsert(payload, { onConflict: 'month_year' })
        .select().single();
      if (data) plan._supaId = data.id;
    }
  },

  async saveAnalytic(metric) {
    const supa = window.BluvideoSupabase && window.BluvideoSupabase.supabase;
    if (!supa || !App.currentUser) return;

    const engRate = metric.reach > 0
      ? parseFloat(((metric.engage / metric.reach) * 100).toFixed(2))
      : 0;
    const payload = {
      week_of: metric.date,
      platform: metric.platform || 'instagram',
      reach: metric.reach || 0,
      engagement_rate: engRate,
      clicks: metric.engage || 0,
      created_by: App.currentUser.id,
    };
    await supa
      .from('analytics_logs')
      .upsert(payload, { onConflict: 'week_of,platform' })
      .select().single();
  },
};

/* -----------------------------------------------------------
   ROUTING
   ----------------------------------------------------------- */
const App = {
  currentView: 'dashboard',
  cardEditingId: null,
  currentUser: null,

  async init() {
    // Auth gate: show login screen until session confirmed
    this.showAuthScreen();
    await this.initAuth();
    // rest of init continues only after auth resolved
    State.load();
    this.bindGlobal();
    this.bindSidebar();
    this.bindTopbar();
    this.bindBriefForm();
    this.bindMonthlyPlanner();
    this.bindCardModal();
    this.bindScheduleModal();
    this.bindPalette();
    this.bindKanbanFilters();
    this.bindCalendarNav();
    this.bindAnalytics();
    this.bindIntegrations();
    this.applyTheme(localStorage.getItem('bluVideoOS_theme') || 'dark');
    this.renderAll();
    this.switchView('dashboard');
    // Check for due posts on load + every 60s; publishing is manual via Buffer
    App.checkDuePosts();
    setInterval(() => { App.checkDuePosts(); }, 60000);
  },

  showAuthScreen() {
    const screen = document.getElementById('auth-screen');
    const app = document.getElementById('app');
    if (screen) screen.style.display = 'flex';
    if (app) app.style.visibility = 'hidden';
  },

  hideAuthScreen() {
    const screen = document.getElementById('auth-screen');
    const app = document.getElementById('app');
    if (screen) screen.style.display = 'none';
    if (app) app.style.visibility = 'visible';
  },

  async initAuth() {
    // Wait for window.BluvideoSupabase to be available (loaded as module)
    await new Promise(resolve => {
      if (window.BluvideoSupabase) { resolve(); return; }
      const interval = setInterval(() => {
        if (window.BluvideoSupabase) { clearInterval(interval); resolve(); }
      }, 50);
      setTimeout(() => { clearInterval(interval); resolve(); }, 3000); // fallback
    });

    const supa = window.BluvideoSupabase;
    if (!supa) {
      // Supabase not available — fall back to localStorage-only mode
      console.warn('[BluVideo] Supabase not available, running in local mode');
      this.hideAuthScreen();
      return;
    }

    // Check for existing session
    const user = await supa.getUser();
    if (user) {
      this.currentUser = user;
      this.hideAuthScreen();
      await DB.loadAll(); // load data from Supabase
      return;
    }

    // No session — set up login form
    this.setupLoginForm();
  },

  setupLoginForm() {
    const form = document.getElementById('auth-form');
    const emailEl = document.getElementById('auth-email');
    const passEl = document.getElementById('auth-password');
    const errEl = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in…';

      const { data, error } = await window.BluvideoSupabase.signIn(
        emailEl.value.trim(),
        passEl.value
      );

      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign in';

      if (error) {
        errEl.textContent = error.message || 'Sign in failed. Check your credentials.';
        return;
      }

      this.currentUser = data.user;
      this.hideAuthScreen();
      await DB.loadAll();
      this.renderAll();
      this.switchView(this.currentView);
      Toast.show('Signed in', 'success');
    });
  },

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('bluVideoOS_theme', theme);
    $('#icon-theme').outerHTML = `<svg id="icon-theme" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${theme === 'dark' ? '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>' : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'}</svg>`;
  },

  switchView(view) {
    this.currentView = view;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    const labels = { dashboard: 'Dashboard', briefs: 'Briefing Engine', create: 'Create', kanban: 'Kanban', calendar: 'Calendar', analytics: 'Analytics', settings: 'Integrations' };
    $('#crumb-here').textContent = labels[view] || '';
    if (view === 'calendar') this.renderCalendar();
    if (view === 'analytics') this.renderAnalytics();
    if (view === 'kanban') this.renderKanban();
    if (view === 'dashboard') this.renderDashboard();
    if (view === 'briefs') { this.renderBriefList(); this.renderPreview(); this.renderMonthlyPlanList(); }
    if (view === 'create') this.renderCreate();
  },

  renderAll() {
    this.renderDashboard();
    this.renderKanban();
    this.renderBriefList();
    this.renderPreview();
    this.renderMonthlyPlanList();
    this.renderCalendar();
    this.renderAnalytics();
    this.renderIntegrationStatus();
    this.renderCreate();
  },

  /* -------- GLOBAL EVENTS -------- */
  bindGlobal() {
    let gPressed = false;
    let gTimer = null;
    document.addEventListener('keydown', (e) => {
      const target = e.target;
      const inField = target.matches('input, textarea, select, [contenteditable]');
      const modKey = e.metaKey || e.ctrlKey;

      if (modKey && e.key.toLowerCase() === 'k') { e.preventDefault(); Palette.open(); return; }
      if (modKey && e.key === '\\') { e.preventDefault(); $('#app').classList.toggle('sidebar-collapsed'); return; }
      if (modKey && e.key.toLowerCase() === 'n') { e.preventDefault(); App.openCardModal(); return; }
      if (modKey && e.key.toLowerCase() === 's' && App.currentView === 'briefs') { e.preventDefault(); App.saveBrief(); return; }
      if (modKey && e.shiftKey && e.key.toLowerCase() === 'c' && App.currentView === 'briefs') { e.preventDefault(); App.copyPrompt(); return; }
      if (modKey && e.key === 'Enter' && $('#card-scrim').classList.contains('open')) { e.preventDefault(); App.saveCard(); return; }

      if (e.key === 'Escape') {
        if ($('#palette-scrim').classList.contains('open')) Palette.close();
        else if ($('#buffer-push-scrim').classList.contains('open')) App.closeBufferPush();
        else if ($('#card-scrim').classList.contains('open')) App.closeCardModal();
        return;
      }

      if (inField) return;

      // G then letter view switcher
      if (e.key.toLowerCase() === 'g' && !gPressed) {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 900);
        return;
      }
      if (gPressed) {
        const map = { d: 'dashboard', b: 'briefs', e: 'create', k: 'kanban', c: 'calendar', a: 'analytics', i: 'settings' };
        const v = map[e.key.toLowerCase()];
        if (v) { e.preventDefault(); App.switchView(v); }
        gPressed = false;
        return;
      }

      if (e.key === '/') { e.preventDefault(); $('#quick-add').focus(); return; }
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); App.openCardModal(); return; }
    });

    // Generic delegated actions
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const act = btn.dataset.action;
      if (act === 'switch-view') App.switchView(btn.dataset.view);
      else if (act === 'new-card') App.openCardModal();
      else if (act === 'close-card-modal') App.closeCardModal();
      else if (act === 'save-card') App.saveCard();
      else if (act === 'delete-card') App.deleteCard();
      else if (act === 'brief-save') App.saveBrief();
      else if (act === 'brief-reset') App.resetBrief();
      else if (act === 'copy-prompt') App.copyPrompt();
      else if (act === 'send-to-claude') App.sendToClaude();
    });
  },

  /* -------- SIDEBAR -------- */
  bindSidebar() {
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => App.switchView(item.dataset.view));
    });
  },

  /* -------- TOPBAR -------- */
  bindTopbar() {
    $('#sidebar-toggle').addEventListener('click', () => $('#app').classList.toggle('sidebar-collapsed'));
    $('#theme-toggle').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme;
      App.applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
    $('#open-palette').addEventListener('click', () => Palette.open());
    const qa = $('#quick-add');
    qa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && qa.value.trim()) {
        const card = {
          id: uid('c_'), title: qa.value.trim(), status: 'ideation',
          assignee: 'Member 1', platform: 'LinkedIn', date: '', content: '',
          figma: '', canva: '', createdAt: Date.now()
        };
        State.cards.unshift(card);
        State.pushActivity(`Quick-added "<span class="em">${escapeHtml(card.title)}</span>" to Ideation`, 'plus');
        State.save();
        DB.saveCard(card).catch(console.warn);
        qa.value = '';
        App.renderDashboard();
        App.renderKanban();
        Toast.show('Added to Ideation', 'success', { label: 'Open', handler: () => { App.switchView('kanban'); App.openCardModal(card.id); } });
      }
    });
  },

  /* -------- DASHBOARD -------- */
  renderDashboard() {
    const today = new Date();
    $('#dash-today').textContent = today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

    // Stats
    const inFlight = State.cards.filter(c => !['published'].includes(c.status)).length;
    const scheduled = State.cards.filter(c => c.status === 'scheduled').length;
    const published30 = State.cards.filter(c => c.status === 'published').length;
    const briefs = State.briefs.length;

    const lastM = State.metrics[State.metrics.length - 1];
    const prevM = State.metrics[State.metrics.length - 2];
    const reachDelta = lastM && prevM ? Math.round(((lastM.reach - prevM.reach) / prevM.reach) * 100) : 0;

    const stats = [
      { label: 'In flight', value: inFlight, delta: '+2 this week', dir: 'up', spark: sparkSVG([5,6,8,7,9,11,10,12]) },
      { label: 'Scheduled', value: scheduled, delta: '7 days out', dir: '', spark: sparkSVG([2,3,2,4,3,5,4,6]) },
      { label: 'Reach (wk)', value: lastM ? compact(lastM.reach) : '—', delta: (reachDelta >= 0 ? '+' : '') + reachDelta + '% vs last wk', dir: reachDelta >= 0 ? 'up' : 'down', spark: sparkSVG(State.metrics.map(m => m.reach)) },
      { label: 'Briefs', value: briefs, delta: 'Library', dir: '', spark: sparkSVG([1,1,2,2,3,3,3,briefs]) },
    ];
    $('#stat-grid').innerHTML = stats.map(s => `
      <div class="stat">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-delta ${s.dir}">${s.dir === 'up' ? '↑' : s.dir === 'down' ? '↓' : ''} ${s.delta}</div>
        <div class="spark">${s.spark}</div>
      </div>
    `).join('');

    // Upcoming (14 days)
    const upcoming = State.cards
      .filter(c => c.date && !['published'].includes(c.status))
      .map(c => ({ ...c, dObj: new Date(c.date) }))
      .filter(c => !isNaN(c.dObj) && (c.dObj - today) > -86400000 * 1 && (c.dObj - today) < 86400000 * 14)
      .sort((a, b) => a.dObj - b.dObj)
      .slice(0, 6);

    const upcomingEl = $('#upcoming-list');
    if (!upcoming.length) {
      upcomingEl.innerHTML = `<div class="empty-mini">${svgIcon('clock')}<div>Nothing scheduled in the next two weeks.</div></div>`;
    } else {
      upcomingEl.innerHTML = upcoming.map(c => `
        <div class="upcoming-row" data-card-id="${c.id}">
          <div class="upcoming-date">
            <div class="d">${c.dObj.getDate()}</div>
            <div class="m">${c.dObj.toLocaleDateString(undefined, { month: 'short' })}</div>
          </div>
          <div>
            <div class="upcoming-title">${escapeHtml(c.title)}</div>
            <div class="upcoming-meta">
              <span class="chip" data-tone="${platformTone(c.platform)}"><span class="chip-dot"></span>${c.platform}</span>
              <span class="chip" data-tone="${statusTone(c.status)}"><span class="chip-dot"></span>${statusLabel(c.status)}</span>
              <span>${c.assignee}</span>
            </div>
          </div>
          <div class="avatar-mini" data-m="${ASSIGNEE_NUM(c.assignee)}">${ASSIGNEE_INITIAL(c.assignee)}</div>
        </div>
      `).join('');
      upcomingEl.querySelectorAll('[data-card-id]').forEach(row => {
        row.addEventListener('click', () => App.openCardModal(row.dataset.cardId));
      });
    }

    // Activity
    const acts = State.activity.slice(0, 8);
    $('#activity-list').innerHTML = acts.length ? acts.map(a => `
      <div class="activity-row">
        <div class="activity-icon">${svgIcon(a.icon || 'doc')}</div>
        <div class="activity-body">
          <div class="activity-text">${a.text}</div>
          <div class="activity-meta">${fmtRelative(a.at)}</div>
        </div>
      </div>
    `).join('') : `<div class="empty-mini">${svgIcon('doc')}<div>No activity yet.</div></div>`;
  },

  /* -------- BRIEFING ENGINE -------- */
  briefMode: 'copy',
  bindBriefForm() {
    ['b-title','b-platform','b-tone','b-objective','b-audience','b-takeaways','b-cta'].forEach(id => {
      const el = $('#' + id);
      el.addEventListener('input', () => App.renderPreview());
      el.addEventListener('change', () => App.renderPreview());
    });
    $$('.preview-tab').forEach(t => {
      t.addEventListener('click', () => {
        App.briefMode = t.dataset.tab;
        $$('.preview-tab').forEach(x => x.classList.toggle('active', x === t));
        App.renderPreview();
      });
    });
  },

  briefValues() {
    return {
      title: $('#b-title').value.trim(),
      platform: $('#b-platform').value,
      tone: $('#b-tone').value,
      objective: $('#b-objective').value.trim(),
      audience: $('#b-audience').value.trim(),
      takeaways: $('#b-takeaways').value.trim(),
      cta: $('#b-cta').value.trim(),
    };
  },

  renderPreview() {
    const v = App.briefValues();
    const ph = (s, label) => s ? escapeHtml(s) : `<span class="ph">[${label}]</span>`;
    let body = '';

    if (App.briefMode === 'copy') {
      body = `<span class="hl">SYSTEM</span>
You are an expert social media copywriter for a small content team.
Write a single ${v.platform || '[platform]'} post in the voice "${ph(v.tone, 'tone')}".

<span class="hl">CAMPAIGN</span>
${ph(v.title, 'campaign title')}

<span class="hl">OBJECTIVE</span>
${ph(v.objective, 'one-sentence goal')}

<span class="hl">AUDIENCE</span>
${ph(v.audience, 'who is this for')}

<span class="hl">KEY TAKEAWAYS</span>
${ph(v.takeaways, 'bulleted takeaways')}

<span class="hl">CALL TO ACTION</span>
${ph(v.cta, 'what should the reader do')}

<span class="hl">CONSTRAINTS</span>
- No emojis unless the tone calls for them.
- No exclamation marks.
- Open with a concrete observation, not a question.
- End with the CTA on its own line.

Return three variants, labelled A / B / C, separated by ---.`;
    } else if (App.briefMode === 'visual') {
      body = `<span class="hl">SYSTEM</span>
You are an art director briefing a designer for a ${v.platform || '[platform]'} asset.

<span class="hl">CAMPAIGN</span>
${ph(v.title, 'campaign title')}

<span class="hl">AUDIENCE & FEEL</span>
${ph(v.audience, 'audience')}
Tone: ${ph(v.tone, 'tone')}

<span class="hl">CORE IDEA</span>
${ph(v.objective, 'what the visual must communicate')}

<span class="hl">DELIVERABLE</span>
- Format: ${platformAspect(v.platform)}
- 1 hero composition + 2 alternates
- Type-led if no strong image, photo-led if there is

<span class="hl">DO / DON'T</span>
DO: bold blue accent, restrained type, generous negative space
DON'T: stock photo clichés, drop shadows, more than two type sizes`;
    } else {
      body = `<span class="hl">THREAD STARTER · ${v.platform || '[platform]'}</span>

Hook (1/):
${v.objective ? '— ' + escapeHtml(v.objective.split('.')[0]) + '.' : '<span class="ph">[opening line — one observation, not a question]</span>'}

Body beats:
${v.takeaways ? escapeHtml(v.takeaways).split('\n').map((l, i) => (i + 2) + '/ ' + l.replace(/^[•\-\*]\s*/, '')).join('\n') : '<span class="ph">[3-5 beats from your takeaways, one per post]</span>'}

Close:
${v.cta ? escapeHtml(v.cta) : '<span class="ph">[call to action]</span>'}`;
    }

    $('#preview-body').innerHTML = body;
    const text = $('#preview-body').textContent;
    $('#preview-meta').textContent = `${text.length} chars · ${text.split('\n').length} lines`;
  },

  saveBrief() {
    const v = App.briefValues();
    if (!v.title) { Toast.show('Add a campaign title first', 'warn'); $('#b-title').focus(); return; }
    const brief = { id: uid('b_'), ...v, createdAt: Date.now() };
    State.briefs.unshift(brief);
    State.pushActivity(`Saved brief "<span class="em">${escapeHtml(v.title)}</span>"`, 'doc');
    State.save();
    DB.saveBrief(brief).catch(console.warn);
    App.renderBriefList();
    App.renderDashboard();
    Toast.show('Brief saved to library', 'success');
  },

  resetBrief() {
    ['b-title','b-objective','b-audience','b-takeaways','b-cta'].forEach(id => $('#' + id).value = '');
    App.renderPreview();
  },

  copyPrompt() {
    const text = $('#preview-body').textContent;
    copyText(text, () => Toast.show('Prompt copied to clipboard', 'success'));
  },

  sendToClaude() {
    const text = $('#preview-body').textContent;
    copyText(text, () => {
      Toast.show('Prompt copied — opening Claude…', 'info');
      setTimeout(() => window.open('https://claude.ai/new', '_blank', 'noopener'), 250);
    });
  },

  renderBriefList() {
    const list = $('#brief-list');
    $('#brief-count-chip').innerHTML = `<span class="chip-dot"></span>${State.briefs.length} brief${State.briefs.length === 1 ? '' : 's'}`;
    if (!State.briefs.length) {
      list.innerHTML = `<div class="empty-mini">${svgIcon('doc')}<div>Save your first brief and it will live here.</div></div>`;
      return;
    }
    list.innerHTML = State.briefs.map(b => `
      <div class="brief-row">
        <div>
          <div class="brief-row-title">${escapeHtml(b.title)}</div>
          <div class="brief-row-meta">
            <span class="chip" data-tone="${platformTone(b.platform)}"><span class="chip-dot"></span>${b.platform}</span>
            <span>${escapeHtml((b.objective || '').slice(0, 80))}${(b.objective || '').length > 80 ? '…' : ''}</span>
            <span class="sep">·</span>
            <span>${fmtRelative(b.createdAt)}</span>
          </div>
        </div>
        <div class="brief-row-actions">
          <button class="btn" data-load="${b.id}">${svgIcon('edit')} Load</button>
          <button class="btn" data-copy-brief="${b.id}">${svgIcon('copy')} Copy</button>
          <button class="btn btn-ghost btn-danger" data-del-brief="${b.id}">${svgIcon('trash')}</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-load]').forEach(b => b.addEventListener('click', () => App.loadBrief(b.dataset.load)));
    list.querySelectorAll('[data-copy-brief]').forEach(b => b.addEventListener('click', () => App.copyBrief(b.dataset.copyBrief)));
    list.querySelectorAll('[data-del-brief]').forEach(b => b.addEventListener('click', () => App.deleteBrief(b.dataset.delBrief)));
  },

  loadBrief(id) {
    const b = State.briefs.find(x => x.id === id);
    if (!b) return;
    $('#b-title').value = b.title || '';
    $('#b-platform').value = b.platform || 'LinkedIn';
    $('#b-tone').value = b.tone || 'Authoritative & calm';
    $('#b-objective').value = b.objective || '';
    $('#b-audience').value = b.audience || '';
    $('#b-takeaways').value = b.takeaways || '';
    $('#b-cta').value = b.cta || '';
    App.renderPreview();
    Toast.show('Brief loaded into form', 'info');
    $('#b-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
  copyBrief(id) {
    const b = State.briefs.find(x => x.id === id);
    if (!b) return;
    App.loadBrief(id);
    setTimeout(() => App.copyPrompt(), 100);
  },
  deleteBrief(id) {
    const idx = State.briefs.findIndex(x => x.id === id);
    if (idx < 0) return;
    const removed = State.briefs.splice(idx, 1)[0];
    State.save();
    App.renderBriefList();
    Toast.show('Brief deleted', 'info', { label: 'Undo', handler: () => { State.briefs.unshift(removed); State.save(); App.renderBriefList(); } });
  },

  /* -------- KANBAN -------- */
  bindKanbanFilters() {
    ['filter-platform', 'filter-assignee', 'filter-search'].forEach(id => {
      $('#' + id).addEventListener('input', () => App.renderKanban());
      $('#' + id).addEventListener('change', () => App.renderKanban());
    });
  },

  renderKanban() {
    const board = $('#kanban-board');
    const pf = $('#filter-platform').value;
    const af = $('#filter-assignee').value;
    const search = ($('#filter-search').value || '').toLowerCase();

    const filtered = State.cards.filter(c =>
      (pf === 'all' || c.platform === pf) &&
      (af === 'all' || c.assignee === af) &&
      (!search || c.title.toLowerCase().includes(search) || (c.content || '').toLowerCase().includes(search))
    );

    $('#kanban-count').textContent = `${filtered.length} task${filtered.length === 1 ? '' : 's'}`;

    board.innerHTML = STATUSES.map(s => {
      const cards = filtered.filter(c => c.status === s.id);
      return `
        <div class="kanban-col" data-status="${s.id}">
          <div class="kanban-col-head">
            <span class="kanban-col-dot" style="background:${s.color};"></span>
            <span class="kanban-col-title">${s.label}</span>
            <span class="kanban-col-count">${cards.length}</span>
          </div>
          <div class="kanban-list" data-status="${s.id}">
            <label class="quick-add-card">
              ${svgIcon('plus')}
              <input type="text" placeholder="New task…" data-col-add="${s.id}" />
              <span class="kbd">↵</span>
            </label>
            ${cards.map(c => renderCard(c)).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Bind card clicks
    board.querySelectorAll('.kard').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        App.openCardModal(el.dataset.id);
      });
    });

    // Bind quick add per column
    board.querySelectorAll('[data-col-add]').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          const card = {
            id: uid('c_'), title: input.value.trim(), status: input.dataset.colAdd,
            assignee: 'Member 1', platform: $('#filter-platform').value !== 'all' ? $('#filter-platform').value : 'LinkedIn',
            date: '', content: '', figma: '', canva: '', createdAt: Date.now()
          };
          State.cards.unshift(card);
          State.pushActivity(`Added "<span class="em">${escapeHtml(card.title)}</span>" to ${statusLabel(card.status)}`, 'plus');
          State.save();
          DB.saveCard(card).catch(console.warn);
          input.value = '';
          App.renderKanban();
          // refocus same column
          setTimeout(() => $(`[data-col-add="${card.status}"]`)?.focus(), 0);
        }
      });
    });

    // Drag & drop
    setupKanbanDnd();
  },

  /* -------- CARD MODAL -------- */
  bindCardModal() {
    $('#card-scrim').addEventListener('click', (e) => { if (e.target === $('#card-scrim')) App.closeCardModal(); });
    $('#buffer-push-scrim').addEventListener('click', (e) => { if (e.target === $('#buffer-push-scrim')) App.closeBufferPush(); });
    $('#c-upload-btn').addEventListener('click', () => {
      Cloudinary.upload((url) => {
        App._mediaUrls = App._mediaUrls || [];
        App._mediaUrls.push(url);
        renderMediaThumbs(App._mediaUrls);
      });
    });
  },

  openCardModal(id) {
    App.cardEditingId = id || null;
    const card = id ? State.cards.find(c => c.id === id) : null;
    $('#c-id').value = card ? card.id : '';
    $('#c-title').value = card ? card.title : '';
    $('#c-status').value = card ? card.status : 'ideation';
    $('#c-assignee').value = card ? card.assignee : 'Member 1';
    $('#c-platform').value = card ? card.platform : 'LinkedIn';
    $('#c-date').value = card ? (card.date || '') : '';
    $('#c-figma').value = card ? (card.figma || '') : '';
    $('#c-canva').value = card ? (card.canva || '') : '';
    $('#c-content').value = card ? (card.content || '') : '';
    App._mediaUrls = card ? [...(card.mediaUrls || [])] : [];
    renderMediaThumbs(App._mediaUrls);
    $('#c-delete').style.display = card ? 'inline-flex' : 'none';
    $('#c-meta').textContent = card ? `Created ${fmtRelative(card.createdAt)}` : 'New task';
    $('#card-scrim').classList.add('open');
    setTimeout(() => $('#c-title').focus(), 50);
  },

  closeCardModal() {
    $('#card-scrim').classList.remove('open');
    App.cardEditingId = null;
  },

  openBufferPush(card) {
    const hasMedia = card.mediaUrls && card.mediaUrls.length > 0;
    const bufferUrl = `https://buffer.com/add?text=${encodeURIComponent(card.content)}`;
    const panel = $('#buffer-push-panel');

    panel.innerHTML = `
      <div class="bp-head">
        <div class="bp-title-block">
          <div class="bp-title">Push to Buffer</div>
          <div class="bp-sub">${escapeHtml(card.title)} &middot; ${escapeHtml(card.platform)}</div>
        </div>
        <button class="icon-btn" id="bp-close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
        </button>
      </div>
      <div class="bp-body">
        <div class="bp-copy-preview">${escapeHtml(card.content.slice(0, 200))}${card.content.length > 200 ? '…' : ''}</div>
        ${hasMedia ? `
        <div class="bp-section-label">Media &middot; ${card.mediaUrls.length} file${card.mediaUrls.length !== 1 ? 's' : ''}</div>
        <div class="bp-media-list">
          ${card.mediaUrls.map((url, i) => {
            const isVideo = /\.(mp4|mov|webm|avi)(\?|$)/i.test(url);
            const short = url.split('/').pop().split('?')[0].slice(0, 40);
            return `<div class="bp-media-row">
              ${isVideo
                ? `<div class="bp-media-icon">${svgIcon('send')}</div>`
                : `<img class="bp-media-thumb" src="${escapeHtml(url)}" alt="" loading="lazy" />`
              }
              <span class="bp-media-url" title="${escapeHtml(url)}">${escapeHtml(short)}</span>
              <button class="btn bp-copy-btn" data-url="${escapeHtml(url)}" data-idx="${i}">Copy URL</button>
            </div>`;
          }).join('')}
        </div>
        <p class="bp-hint">In Buffer, click the image icon in the composer and paste each URL.</p>
        ` : `<p class="bp-hint">No media attached — copy only.</p>`}
      </div>
      <div class="bp-foot">
        <button class="btn" id="bp-cancel">Cancel</button>
        ${card.status === 'scheduled' ? `<button class="btn bp-mark-published-btn" id="bp-mark-published">Mark as Published</button>` : ''}
        <a class="btn btn-primary" href="${escapeHtml(bufferUrl)}" target="_blank" rel="noopener" id="bp-open">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open Buffer
        </a>
      </div>
    `;

    $('#buffer-push-scrim').classList.add('open');

    $('#bp-close').addEventListener('click', () => App.closeBufferPush());
    $('#bp-cancel').addEventListener('click', () => App.closeBufferPush());
    panel.querySelectorAll('.bp-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        copyText(btn.dataset.url, () => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy URL'; }, 1800);
        });
      });
    });

    const markBtn = $('#bp-mark-published');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        const c = State.cards.find(x => x.id === card.id);
        if (!c) return;
        c.status = 'published';
        c.publishedAt = new Date().toISOString();
        State.pushActivity(`Published "<span class="em">${escapeHtml(c.title)}</span>" via Buffer`, 'send');
        State.save();
        DB.saveCard(c).catch(console.warn);
        App.closeBufferPush();
        App.renderKanban();
        App.renderDashboard();
        Toast.show('Published!', 'success');
      });
    }
  },

  closeBufferPush() {
    $('#buffer-push-scrim').classList.remove('open');
  },

  /* -------- SCHEDULE MODAL -------- */
  _schedulingId: null,

  openScheduleModal(id) {
    const c = State.cards.find(x => x.id === id);
    if (!c) return;
    this._schedulingId = id;
    $('#schedule-card-title').textContent = c.title;
    $('#schedule-card-platform').textContent = c.platform;
    const def = new Date();
    def.setDate(def.getDate() + 1);
    def.setHours(9, 0, 0, 0);
    $('#schedule-datetime').value = def.toISOString().slice(0, 16);
    $('#schedule-scrim').classList.add('open');
  },

  closeScheduleModal() {
    $('#schedule-scrim').classList.remove('open');
    this._schedulingId = null;
  },

  confirmSchedule(publishNow) {
    const c = State.cards.find(x => x.id === this._schedulingId);
    if (!c) return;
    let iso;
    if (publishNow) {
      iso = new Date().toISOString();
    } else {
      const val = $('#schedule-datetime').value;
      if (!val) { Toast.show('Pick a date and time', 'warn'); return; }
      const parsed = new Date(val);
      if (isNaN(parsed)) { Toast.show('Invalid date', 'warn'); return; }
      iso = parsed.toISOString();
    }
    c.scheduledFor = iso;
    c.date = iso.slice(0, 10);
    c.status = 'scheduled';
    State.pushActivity(
      `Scheduled "<span class="em">${escapeHtml(c.title)}</span>" for ${publishNow ? 'Buffer (now)' : fmtDatetime(iso)}`,
      'clock'
    );
    State.save();
    DB.saveCard(c).catch(console.warn);
    this.closeScheduleModal();
    this.renderKanban();
    this.renderDashboard();
    this.renderCalendar();
    if (publishNow) {
      this.openBufferPush(c);
    } else {
      Toast.show(`Scheduled for ${fmtDatetime(iso)}`, 'success');
    }
  },

  bindScheduleModal() {
    const scrim = $('#schedule-scrim');
    scrim.addEventListener('click', (e) => { if (e.target === scrim) App.closeScheduleModal(); });
    $('#schedule-close').addEventListener('click', () => App.closeScheduleModal());
    $('#schedule-cancel').addEventListener('click', () => App.closeScheduleModal());
    $('#schedule-confirm').addEventListener('click', () => App.confirmSchedule(false));
    $('#schedule-now').addEventListener('click', () => App.confirmSchedule(true));
    $$('[data-preset-hour]', scrim).forEach(btn => {
      btn.addEventListener('click', () => {
        const cur = $('#schedule-datetime').value;
        const d = cur ? new Date(cur) : new Date();
        d.setHours(parseInt(btn.dataset.presetHour, 10), 0, 0, 0);
        if (d <= new Date()) d.setDate(d.getDate() + 1);
        $('#schedule-datetime').value = d.toISOString().slice(0, 16);
      });
    });
  },

  /* -------- BUFFER PUBLISH CHECKER -------- */
  checkDuePosts() {
    const now = new Date();
    const due = State.cards.filter(c =>
      c.status === 'scheduled' && c.scheduledFor && new Date(c.scheduledFor) <= now
    );
    if (due.length === 0) return;
    App.renderKanban();
    Toast.show(
      `${due.length} post${due.length > 1 ? 's' : ''} ready — publish via Buffer`,
      'warn',
      { label: 'Kanban', handler: () => App.switchView('kanban') }
    );
  },

  saveCard() {
    const title = $('#c-title').value.trim();
    if (!title) { Toast.show('Add a title first', 'warn'); $('#c-title').focus(); return; }
    const data = {
      title,
      status: $('#c-status').value,
      assignee: $('#c-assignee').value,
      platform: $('#c-platform').value,
      date: $('#c-date').value,
      figma: $('#c-figma').value,
      canva: $('#c-canva').value,
      content: $('#c-content').value,
      mediaUrls: App._mediaUrls || [],
    };
    if (App.cardEditingId) {
      const i = State.cards.findIndex(c => c.id === App.cardEditingId);
      if (i > -1) {
        const prevStatus = State.cards[i].status;
        State.cards[i] = { ...State.cards[i], ...data };
        if (prevStatus !== data.status) State.pushActivity(`Moved "<span class="em">${escapeHtml(title)}</span>" to ${statusLabel(data.status)}`, 'arrow');
        else State.pushActivity(`Updated "<span class="em">${escapeHtml(title)}</span>"`, 'edit');
        DB.saveCard(State.cards[i]).catch(console.warn);
      }
    } else {
      const newCard = { id: uid('c_'), ...data, createdAt: Date.now() };
      State.cards.unshift(newCard);
      State.pushActivity(`Created "<span class="em">${escapeHtml(title)}</span>"`, 'plus');
      DB.saveCard(newCard).catch(console.warn);
    }
    State.save();
    App.renderKanban();
    App.renderDashboard();
    App.renderCalendar();
    App.closeCardModal();
    Toast.show(App.cardEditingId ? 'Task updated' : 'Task created', 'success');
  },

  deleteCard() {
    if (!App.cardEditingId) return;
    const i = State.cards.findIndex(c => c.id === App.cardEditingId);
    if (i < 0) return;
    const removed = State.cards.splice(i, 1)[0];
    State.pushActivity(`Deleted "<span class="em">${escapeHtml(removed.title)}</span>"`, 'trash');
    State.save();
    DB.deleteCard(removed).catch(console.warn);
    App.renderKanban();
    App.renderDashboard();
    App.renderCalendar();
    App.closeCardModal();
    Toast.show('Task deleted', 'info', { label: 'Undo', handler: () => { State.cards.splice(i, 0, removed); State.save(); App.renderKanban(); App.renderDashboard(); App.renderCalendar(); } });
  },

  /* -------- CALENDAR -------- */
  calDate: new Date(),
  bindCalendarNav() {
    $('#cal-prev').addEventListener('click', () => { App.calDate.setMonth(App.calDate.getMonth() - 1); App.renderCalendar(); });
    $('#cal-next').addEventListener('click', () => { App.calDate.setMonth(App.calDate.getMonth() + 1); App.renderCalendar(); });
    $('#cal-today').addEventListener('click', () => { App.calDate = new Date(); App.renderCalendar(); });
  },

  renderCalendar() {
    const month = App.calDate.getMonth();
    const year = App.calDate.getFullYear();
    const today = new Date(); today.setHours(0,0,0,0);

    $('#cal-month-year').innerHTML = `${App.calDate.toLocaleString(undefined, { month: 'long' })} <span class="year">${year}</span>`;

    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

    const grid = $('#cal-grid');
    const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = dows.map(d => `<div class="cal-dow">${d}</div>`).join('');

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startDow + 1;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      const dayDate = new Date(year, month, dayNum);
      const iso = dayDate.toISOString().slice(0,10);
      const isToday = inMonth && dayDate.getTime() === today.getTime();

      const events = State.cards
        .filter(c => c.date === iso)
        .slice(0, 3);
      const overflow = State.cards.filter(c => c.date === iso).length - events.length;

      html += `
        <div class="cal-day ${inMonth ? '' : 'other'} ${isToday ? 'today' : ''}" data-iso="${iso}">
          <div class="d-num">${dayNum > 0 && dayNum <= daysInMonth ? dayNum : (new Date(year, month, dayNum).getDate())}</div>
          <div class="cal-day-events">
            ${events.map(c => `
              <div class="cal-event" draggable="true" data-card-id="${c.id}" data-platform="${c.platform}">
                <span class="e-title">${escapeHtml(c.title)}</span>
              </div>
            `).join('')}
            ${overflow > 0 ? `<div class="cal-more">+${overflow} more</div>` : ''}
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;

    // Click day → open new card on that date
    grid.querySelectorAll('.cal-day').forEach(d => {
      d.addEventListener('click', (e) => {
        if (e.target.closest('.cal-event')) return;
        const iso = d.dataset.iso;
        App.openCardModal();
        $('#c-date').value = iso;
        $('#c-status').value = 'scheduled';
      });
    });

    // Click event → edit
    grid.querySelectorAll('.cal-event').forEach(ev => {
      ev.addEventListener('click', (e) => { e.stopPropagation(); App.openCardModal(ev.dataset.cardId); });
    });

    setupCalendarDnd();
  },

  /* -------- ANALYTICS -------- */
  bindAnalytics() {
    $('#meta-sync-btn').addEventListener('click', () => App.metaSync());
    $('#m-add').addEventListener('click', () => App.addMetric());
  },

  renderAnalytics() {
    // Stat tiles
    const last = State.metrics[State.metrics.length - 1] || { reach: 0, engage: 0, followers: 0 };
    const prev = State.metrics[State.metrics.length - 2] || last;
    const pct = (a, b) => b ? Math.round(((a - b) / b) * 100) : 0;
    const tiles = [
      { label: 'Reach', value: compact(last.reach), delta: pct(last.reach, prev.reach), dir: 'up' },
      { label: 'Engagement', value: compact(last.engage), delta: pct(last.engage, prev.engage), dir: 'up' },
      { label: 'Followers', value: compact(last.followers), delta: pct(last.followers, prev.followers), dir: 'up' },
      { label: 'Eng. rate', value: last.reach ? ((last.engage / last.reach) * 100).toFixed(1) + '%' : '—', delta: pct((last.engage / last.reach), (prev.engage / prev.reach)) || 0, dir: '' },
    ];
    $('#analytics-stat-grid').innerHTML = tiles.map(t => {
      const d = t.delta || 0;
      const cls = d > 0 ? 'up' : (d < 0 ? 'down' : '');
      const sign = d > 0 ? '+' : '';
      return `
        <div class="stat">
          <div class="stat-label">${t.label}</div>
          <div class="stat-value">${t.value}</div>
          <div class="stat-delta ${cls}">${d !== 0 ? (d > 0 ? '↑' : '↓') + ' ' + sign + d + '%' : '—'} vs last wk</div>
        </div>
      `;
    }).join('');

    // Line chart
    drawLineChart($('#line-chart'), State.metrics.map(m => m.reach), State.metrics.map(m => fmtDate(m.date)));

    // Top posts bars (by status === published, sorted by date desc)
    const top = State.cards
      .filter(c => c.status === 'published')
      .slice(0, 6)
      .map(c => ({ ...c, eng: Math.floor(50 + Math.random() * 900) }))
      .sort((a, b) => b.eng - a.eng);

    const max = Math.max(1, ...top.map(t => t.eng));
    $('#top-posts-bars').innerHTML = top.length ? top.map(t => `
      <div class="bar-row">
        <div class="bar-label">${PLATFORM_ICONS[t.platform] || ''} ${escapeHtml(t.title.slice(0, 24))}${t.title.length > 24 ? '…' : ''}</div>
        <div class="bar-track"><div class="bar-fill" style="width: ${(t.eng / max) * 100}%;"></div></div>
        <div class="bar-val">${compact(t.eng)}</div>
      </div>
    `).join('') : `<div class="empty-mini">${svgIcon('chart')}<div>Publish posts to see engagement here.</div></div>`;

    // Platform breakdown
    const breakdownEl = $('#platform-breakdown');
    if (breakdownEl) {
      const byPlatform = {};
      State.metrics.forEach(m => {
        if (m.platform && (!byPlatform[m.platform] || m.date > byPlatform[m.platform].date)) {
          byPlatform[m.platform] = m;
        }
      });
      const entries = Object.entries(byPlatform);
      if (!entries.length) {
        breakdownEl.innerHTML = `<div class="empty-mini">${svgIcon('chart')}<div>Log metrics with a platform to see breakdown.</div></div>`;
      } else {
        const PLAT_LABEL = { instagram: 'Instagram', linkedin: 'LinkedIn', x_twitter: 'X / Twitter', tiktok: 'TikTok', facebook: 'Facebook' };
        breakdownEl.innerHTML = `<table class="breakdown-table">
          <thead><tr><th>Platform</th><th>Reach</th><th>Engagement</th><th>Eng. rate</th><th>Week of</th></tr></thead>
          <tbody>${entries.map(([platform, m]) => `<tr>
            <td>${escapeHtml(PLAT_LABEL[platform] || platform)}</td>
            <td>${compact(m.reach || 0)}</td>
            <td>${compact(m.engage || 0)}</td>
            <td>${m.reach ? ((m.engage / m.reach) * 100).toFixed(1) + '%' : '—'}</td>
            <td>${fmtDate(m.date)}</td>
          </tr>`).join('')}</tbody>
        </table>`;
      }
    }

    // sync meta hint
    $('#meta-sync-meta').textContent = State.settings.lastMetaSync ? fmtRelative(State.settings.lastMetaSync) : 'Never';
  },

  metaSync() {
    if (!State.settings.metaToken) {
      Toast.show('Add a Meta API token in Integrations first', 'warn', { label: 'Open', handler: () => App.switchView('settings') });
      return;
    }
    $('#meta-sync-btn').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 0.8s linear infinite;"><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/></svg> Syncing…';
    setTimeout(() => {
      // simulate: add a fake new row
      const last = State.metrics[State.metrics.length - 1];
      State.metrics.push({
        date: new Date().toISOString().slice(0,10),
        reach: Math.round(last.reach * (1 + Math.random() * 0.15)),
        engage: Math.round(last.engage * (1 + Math.random() * 0.15)),
        followers: Math.round(last.followers * (1 + Math.random() * 0.05)),
      });
      State.settings.lastMetaSync = Date.now();
      State.save();
      App.renderAnalytics();
      $('#meta-sync-btn').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5M3 21v-5h5"/></svg> Sync Meta <span class="kbd">' + fmtRelative(State.settings.lastMetaSync) + '</span>';
      Toast.show('Meta sync complete', 'success');
    }, 1100);
  },

  addMetric() {
    const date = $('#m-date').value;
    const reach = parseInt($('#m-reach').value);
    const engage = parseInt($('#m-engage').value);
    const followers = parseInt($('#m-followers').value);
    const platform = $('#m-platform').value || 'instagram';
    if (!date || isNaN(reach)) { Toast.show('Need at least date + reach', 'warn'); return; }
    const metric = { date, platform, reach, engage: engage || 0, followers: followers || 0 };
    State.metrics.push(metric);
    State.metrics.sort((a, b) => a.date.localeCompare(b.date));
    State.save();
    DB.saveAnalytic(metric).catch(console.warn);
    App.renderAnalytics();
    $('#m-date').value = $('#m-reach').value = $('#m-engage').value = $('#m-followers').value = '';
    Toast.show('Snapshot logged to Supabase', 'success');
  },

  /* -------- INTEGRATIONS -------- */
  bindIntegrations() {
    $('#set-meta-page').value = State.settings.metaPageId || '';
    $('#set-meta-token').value = State.settings.metaToken || '';
    $('#set-supa-url').value = State.settings.supaUrl || '';
    $('#set-supa-key').value = State.settings.supaKey || '';
    $('#set-cloud-name').value = State.settings.cloudinaryCloud || '';
    $('#set-cloud-preset').value = State.settings.cloudinaryPreset || '';
    $('#meta-form').addEventListener('submit', (e) => {
      e.preventDefault();
      State.settings.metaPageId = $('#set-meta-page').value;
      State.settings.metaToken = $('#set-meta-token').value;
      State.save();
      App.renderIntegrationStatus();
      Toast.show('Meta keys saved (stored locally)', 'success');
    });
    $('#supa-form').addEventListener('submit', (e) => {
      e.preventDefault();
      State.settings.supaUrl = $('#set-supa-url').value;
      State.settings.supaKey = $('#set-supa-key').value;
      State.save();
      App.renderIntegrationStatus();
      Toast.show('Supabase keys saved', 'success');
    });
    $('#cloudinary-form').addEventListener('submit', (e) => {
      e.preventDefault();
      State.settings.cloudinaryCloud  = $('#set-cloud-name').value.trim();
      State.settings.cloudinaryPreset = $('#set-cloud-preset').value.trim();
      State.save();
      App.renderIntegrationStatus();
      Toast.show('Cloudinary config saved', 'success');
    });
  },

  renderIntegrationStatus() {
    const metaConnected       = State.settings.metaToken && State.settings.metaPageId;
    const supaConnected       = State.settings.supaUrl && State.settings.supaKey;
    const cloudinaryConnected = State.settings.cloudinaryCloud && State.settings.cloudinaryPreset;
    $('#meta-status').classList.toggle('connected', !!metaConnected);
    $('#meta-status').textContent = metaConnected ? 'Connected' : 'Disconnected';
    $('#supa-status').classList.toggle('connected', !!supaConnected);
    $('#supa-status').textContent = supaConnected ? 'Connected' : 'Disconnected';
    $('#cloudinary-status').classList.toggle('connected', !!cloudinaryConnected);
    $('#cloudinary-status').textContent = cloudinaryConnected ? 'Connected' : 'Disconnected';
    $('#ws-status-txt').textContent = supaConnected ? 'Cloud · synced' : 'Local · synced';
  },

  /* -------- MONTHLY PLANNER -------- */
  bindMonthlyPlanner() {
    const today = new Date();
    $('#mp-month').value = today.toISOString().slice(0, 7);
    $('#mp-save').addEventListener('click', () => App.saveMonthlyPlan());
    $('#mp-generate').addEventListener('click', () => App.generateWeekPrompt());
    $('#mp-copy-prompt').addEventListener('click', () => {
      copyText($('#mp-prompt-body').textContent, () => Toast.show('Week prompt copied', 'success'));
    });
    $('#mp-send-claude').addEventListener('click', () => {
      copyText($('#mp-prompt-body').textContent, () => {
        Toast.show('Prompt copied — opening Claude…', 'info');
        setTimeout(() => window.open('https://claude.ai/new', '_blank', 'noopener'), 250);
      });
    });
  },

  monthlyPlanValues() {
    return {
      monthYear: $('#mp-month').value,
      goals: $('#mp-goals').value.trim(),
      topics: $('#mp-topics').value.trim(),
      tone: $('#mp-tone').value.trim(),
      platforms: Array.from($$('#mp-platforms input:checked')).map(c => c.value),
    };
  },

  saveMonthlyPlan() {
    const v = App.monthlyPlanValues();
    if (!v.monthYear) { Toast.show('Select a month first', 'warn'); return; }
    if (!v.goals) { Toast.show('Add month goals first', 'warn'); $('#mp-goals').focus(); return; }

    const existing = State.monthlyPlans.findIndex(p => p.monthYear === v.monthYear);
    if (existing > -1) {
      Object.assign(State.monthlyPlans[existing], v);
      DB.saveMonthlyPlan(State.monthlyPlans[existing]).catch(console.warn);
    } else {
      const plan = { id: uid('mp_'), ...v, createdAt: Date.now() };
      State.monthlyPlans.unshift(plan);
      DB.saveMonthlyPlan(plan).catch(console.warn);
    }
    State.pushActivity(`Saved monthly plan for <span class="em">${v.monthYear}</span>`, 'doc');
    State.save();
    App.renderMonthlyPlanList();
    App.renderDashboard();
    Toast.show('Monthly plan saved', 'success');
  },

  generateWeekPrompt() {
    const v = App.monthlyPlanValues();
    if (!v.goals && !v.topics) { Toast.show('Fill in goals and topics first', 'warn'); return; }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const fmt = d => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const weekRange = fmt(weekStart) + ' – ' + fmt(weekEnd) + ', ' + weekEnd.getFullYear();

    const topPosts = State.cards
      .filter(c => c.status === 'published' && c.content)
      .slice(0, 3)
      .map(c => `• ${c.platform}: "${c.title}"`)
      .join('\n') || 'None yet — this will be the first batch.';

    const platformList = v.platforms.length ? v.platforms.join(', ') : 'LinkedIn, Instagram';
    const month = v.monthYear || now.toISOString().slice(0, 7);

    const platformLines = v.platforms.slice(0, 4).map((p, i) =>
      `- ${p}: ${i < 2 ? '2 posts' : '1 post'}`
    ).join('\n') || '- LinkedIn: 2 posts\n- Instagram: 2 posts\n- X (Twitter): 1 post';

    const prompt = `You are a social media strategist for Bluveo — an AI lab that builds intelligent websites, apps, and automated marketing systems.

MONTH: ${month}
WEEK: ${weekRange}
PLATFORMS: ${platformList}

MONTH GOALS:
${v.goals || '[no goals set]'}

KEY TOPICS THIS MONTH:
${v.topics || '[no topics set]'}

TONE GUIDANCE:
${v.tone || 'Confident and plain-spoken. No buzzwords. Lead with insight, not promotion.'}

RECENT TOP PERFORMERS (for reference, do not repeat):
${topPosts}

---

Generate 7 social media posts for the week of ${weekRange}.

Distribute across platforms:
${platformLines}

Rules:
- Each post stands alone (no "as mentioned" or "last week" references)
- Vary format: some with hooks, some with questions, some with bullet lists
- LinkedIn: insight-led, professional, no hashtags, max 1500 chars
- Instagram: visual-forward caption, 3–5 hashtags, conversational
- X/Twitter: short take, max 280 chars
- Match the tone guidance exactly — no buzzwords, no exclamation marks
- Open with a concrete observation or fact, not a question

Return a JSON array:
[
  {
    "platform": "LinkedIn",
    "day": "Monday",
    "copy": "...",
    "visual_prompt": "...",
    "hook": "..."
  }
]`;

    $('#mp-prompt-body').textContent = prompt;
    $('#mp-prompt-card').style.display = 'block';
    $('#mp-prompt-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    Toast.show('Week prompt generated', 'success');
  },

  renderMonthlyPlanList() {
    const el = $('#mp-plans-list');
    if (!el) return;
    const plans = State.monthlyPlans;
    const countEl = $('#mp-plans-count');
    if (countEl) countEl.innerHTML = `<span class="chip-dot"></span>${plans.length} plan${plans.length === 1 ? '' : 's'}`;
    if (!plans.length) {
      el.innerHTML = `<div class="empty-mini">${svgIcon('doc')}<div>No monthly plans saved yet. Fill in the form above and hit Save plan.</div></div>`;
      return;
    }
    el.innerHTML = plans.map(p => `
      <div class="plan-row">
        <div>
          <div class="plan-row-month">${escapeHtml(p.monthYear || '')}</div>
          <div class="plan-row-goals">${escapeHtml((p.goals || '').slice(0, 100))}${(p.goals || '').length > 100 ? '…' : ''}</div>
          ${p.platforms && p.platforms.length ? `<div class="plan-row-platforms">${p.platforms.map(pl => `<span class="chip" data-tone="${platformTone(pl)}" style="margin-right:4px;"><span class="chip-dot"></span>${pl}</span>`).join('')}</div>` : ''}
        </div>
        <div class="plan-row-actions">
          <button class="btn" data-load-plan="${p.id}">
            ${svgIcon('edit')} Load
          </button>
          <button class="btn btn-ghost btn-danger" data-del-plan="${p.id}" title="Delete">${svgIcon('trash')}</button>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('[data-load-plan]').forEach(btn => {
      btn.addEventListener('click', () => App.loadMonthlyPlan(btn.dataset.loadPlan));
    });
    el.querySelectorAll('[data-del-plan]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = State.monthlyPlans.findIndex(p => p.id === btn.dataset.delPlan);
        if (idx >= 0) {
          const removed = State.monthlyPlans.splice(idx, 1)[0];
          State.save();
          App.renderMonthlyPlanList();
          Toast.show('Plan deleted', 'info', {
            label: 'Undo',
            handler: () => { State.monthlyPlans.splice(idx, 0, removed); State.save(); App.renderMonthlyPlanList(); }
          });
        }
      });
    });
  },

  loadMonthlyPlan(id) {
    const p = State.monthlyPlans.find(x => x.id === id);
    if (!p) return;
    if (p.monthYear) $('#mp-month').value = p.monthYear;
    $('#mp-goals').value = p.goals || '';
    $('#mp-topics').value = p.topics || '';
    $('#mp-tone').value = p.tone || '';
    if (p.platforms) {
      $$('#mp-platforms input').forEach(cb => { cb.checked = p.platforms.includes(cb.value); });
    }
    Toast.show('Plan loaded into form', 'info');
    $('#mp-month').scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* -------- PALETTE bind only -------- */
  bindPalette() { Palette.init(); },

  /* -------- CREATE PAGE -------- */
  renderCreate() {
    const TOOLS = {
      video: [
        {
          key: 'canva', name: 'Canva', tag: 'Free', url: 'https://www.canva.com/create/videos/',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" fill="var(--bg-elev)"/></svg>`,
          desc: 'Design branded videos, reels, carousels, and story templates. Best for polished on-brand visuals.',
          bullets: ['Use <strong>Bluveo brand colors</strong>', 'Reels: <strong>9:16</strong> ratio', 'Feed video: <strong>1:1</strong> or <strong>4:5</strong>', 'Stories: <strong>1080×1920px</strong>']
        },
        {
          key: 'capcut', name: 'CapCut', tag: 'Free', url: 'https://www.capcut.com/editor',
          logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="M17 10l4-2v8l-4-2z"/></svg>`,
          desc: 'Fast video editing for Reels and Shorts. Auto-captions, trending templates, and AI tools.',
          bullets: ['Auto-captions boost reach <strong>40%</strong>', 'Use <strong>trending sounds</strong> for Reels', 'Export <strong>1080p</strong> for all platforms']
        },
        {
          key: 'runway', name: 'Runway', tag: 'Free', url: 'https://app.runwayml.com/',
          logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 8L4 20z"/></svg>`,
          desc: 'AI video generation, in/outpainting, green-screen removal. For experimental and motion-graphic pieces.',
          bullets: ['Free tier: <strong>125 credits/mo</strong>', 'Best for <strong>4-10s</strong> motion clips', 'Use for <strong>B-roll</strong> when shooting is off the table']
        },
      ],
      image: [
        {
          key: 'bloom', name: 'Bloom', tag: 'Free tier', url: 'https://bloom.so',
          logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12M12 12C12 12 8 10 8 6a4 4 0 0 1 8 0c0 4-4 6-4 6z"/><path d="M12 12c0 0-4.5 1.5-6 5M12 12c0 0 4.5 1.5 6 5"/></svg>`,
          desc: 'Brand-aware AI image generation. Generate social visuals, ad creatives, and product shots trained on your brand kit.',
          bullets: ['Reads your <strong>brand colors & fonts</strong>', 'Generate ads, carousels, story covers', 'Upload to Cloudinary → paste URL into card']
        },
        {
          key: 'canva', name: 'Canva (graphics)', tag: 'Free', url: 'https://www.canva.com/create/social-media-graphics/',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="5" fill="var(--bg-elev)"/></svg>`,
          desc: 'Quote graphics, carousel slides, and stat cards in 5 minutes. Brand kit keeps it on-tone.',
          bullets: ['LinkedIn carousel: <strong>1080×1350</strong>', 'IG carousel: <strong>1080×1080</strong>', 'Always export <strong>PNG</strong>']
        },
        {
          key: 'figma', name: 'Figma', tag: 'Free', url: 'https://www.figma.com/',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 24a4 4 0 0 0 4-4v-4H8a4 4 0 0 0 0 8zm-4-12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4zm0-8a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4zm8-4h4a4 4 0 0 1 0 8h-4V0zm8 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></svg>`,
          desc: 'For anything that needs precision: pricing tables, diagrams, system maps, or designer-led carousels.',
          bullets: ['Use the <strong>Bluveo design system</strong> file', 'Auto-layout for carousel frames', 'Export <strong>2x PNG</strong> for retina']
        },
        {
          key: 'unsplash', name: 'Unsplash', tag: 'Free', url: 'https://unsplash.com/',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 6.75V0h9v6.75H7.5zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z"/></svg>`,
          desc: 'Royalty-free photography. Search by mood (“quiet morning”, “focused team”) instead of nouns.',
          bullets: ['Always check <strong>licence</strong> on download', 'Credit creator where visible', 'Pair with type, never use raw']
        },
      ],
      copy: [
        {
          key: 'claude', name: 'Claude', tag: 'Free', url: 'https://claude.ai/new',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5 3.5 9 9 11 5.5-2 9-6 9-11V7l-9-5zm0 4l5 2.7v4c0 3.4-2.2 6.2-5 7.5-2.8-1.3-5-4.1-5-7.5v-4L12 6z"/></svg>`,
          desc: 'Long-form drafts, careful rewrites, threads, briefs. Best when you give it a full Briefing Engine prompt.',
          bullets: ['Start from a <strong>saved brief</strong>', 'Ask for <strong>3 variants</strong> (A/B/C)', 'Iterate by quoting one line back']
        },
        {
          key: 'chatgpt', name: 'ChatGPT', tag: 'Free', url: 'https://chat.openai.com/',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 9.82a5.93 5.93 0 0 0-.51-4.88 6 6 0 0 0-6.47-2.88A6 6 0 0 0 4.55 4.92a5.93 5.93 0 0 0-3.95 2.86 6 6 0 0 0 .74 7.05 5.93 5.93 0 0 0 .51 4.88 6 6 0 0 0 6.47 2.88A6 6 0 0 0 19.45 19.08a5.93 5.93 0 0 0 3.95-2.86 6 6 0 0 0-.74-7.05z"/></svg>`,
          desc: 'Quick rewrites, brainstorms, headlines. Treat as a sparring partner, not a ghostwriter.',
          bullets: ['Use <strong>custom GPTs</strong> for repeat tasks', 'Best for <strong>brainstorm</strong>, not final copy', 'Always paste into Bluveo for review']
        },
      ],
      hosting: [
        {
          key: 'cloudinary', name: 'Cloudinary', tag: 'Free', url: 'https://cloudinary.com/users/login',
          logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a5 5 0 0 1 .3-9.99 7 7 0 0 1 13.4 2A4.5 4.5 0 0 1 19 18"/></svg>`,
          desc: 'Host video and image assets, get a direct URL to paste into the Buffer push.',
          bullets: ['Free: <strong>25 credits/mo</strong>', 'Auto-format and resize on URL', 'Stable URL = safe for Buffer']
        },
        {
          key: 'imgur', name: 'Imgur', tag: 'Free', url: 'https://imgur.com/upload',
          logo: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2V8h2v8zm5 0h-2V8h2v8z"/></svg>`,
          desc: 'Fastest path to a static image URL. No account needed for short-lived assets.',
          bullets: ['Paste URL into post copy', 'Use for <strong>quick previews</strong>, not long-term', 'Right-click → “Copy image address”']
        },
      ],
    };

    const render = (list) => list.map(t => `
      <div class="tool-card">
        <div class="tool-card-head">
          <div class="tool-logo ${t.key}">${t.logo}</div>
          <div class="tool-name">${escapeHtml(t.name)}</div>
          <span class="tool-tag">${t.tag}</span>
        </div>
        <div class="tool-desc">${t.desc}</div>
        <ul class="tool-bullets">${t.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        <a class="tool-open" href="${t.url}" target="_blank" rel="noopener">
          <span>Open ${escapeHtml(t.name.split(' ')[0])}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </a>
      </div>
    `).join('');

    $('#tool-grid-video').innerHTML = render(TOOLS.video);
    $('#tool-grid-image').innerHTML = render(TOOLS.image);
    $('#tool-grid-copy').innerHTML = render(TOOLS.copy);
    $('#tool-grid-hosting').innerHTML = render(TOOLS.hosting);

    // workflow step bindings
    $$('#view-create [data-step-go]').forEach(el => el.addEventListener('click', () => App.switchView(el.dataset.stepGo)));
    $$('#view-create [data-step-claude]').forEach(el => el.addEventListener('click', () => window.open('https://claude.ai/new', '_blank', 'noopener')));
    $$('#view-create [data-step-tool]').forEach(el => el.addEventListener('click', () => {
      const target = $(`#tool-grid-video`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  },
};

/* -----------------------------------------------------------
   CARD RENDERER
   ----------------------------------------------------------- */
function renderCard(c) {
  let action = '';
  let extra = '';

  if (c.status === 'drafting' || c.status === 'ideation') {
    action = `<div class="kard-action">
      <button class="btn brand-claude" data-claude="${c.id}">${svgIcon('cmd')} Open in Claude</button>
      <button class="btn kard-review-btn" data-to-review="${c.id}" title="Move to In Review">${svgIcon('eye')} Review</button>
    </div>`;
  } else if (c.status === 'review') {
    action = `<div class="kard-action">
      <button class="btn kard-approve-btn" data-approve="${c.id}">${svgIcon('check')} Approve</button>
    </div>`;
  } else if (c.status === 'approved') {
    action = `<div class="kard-action">
      <button class="btn kard-schedule-btn" data-schedule="${c.id}">${svgIcon('calendar')} Schedule</button>
      <button class="btn brand-buffer" data-buffer="${c.id}">${svgIcon('send')} Buffer</button>
    </div>`;
  } else if (c.status === 'scheduled') {
    const schFmt = c.scheduledFor ? fmtDatetime(c.scheduledFor) : (c.date ? fmtDate(c.date) : '');
    const isDue = c.scheduledFor && new Date(c.scheduledFor) <= new Date();
    if (schFmt) extra = `<div class="kard-time-badge ${isDue ? 'kard-due-time' : 'kard-scheduled-time'}">${svgIcon(isDue ? 'send' : 'clock')} ${schFmt}</div>`;
    if (isDue) {
      action = `<div class="kard-action">
        <button class="btn kard-publish-btn" data-publish-buffer="${c.id}">${svgIcon('send')} Publish via Buffer</button>
      </div>`;
    } else if (!c.scheduledFor) {
      action = `<div class="kard-action">
        <button class="btn kard-schedule-btn" data-schedule="${c.id}">${svgIcon('calendar')} Set Publish Time</button>
      </div>`;
    }
  } else if (c.status === 'failed') {
    const reason = c.failureReason ? escapeHtml(c.failureReason.slice(0, 60)) : 'Publish failed';
    const full = escapeHtml(c.failureReason || 'Publish failed');
    extra = `<div class="kard-failure-reason" title="${full}">${reason}${(c.failureReason || '').length > 60 ? '…' : ''}</div>`;
    action = `<div class="kard-action">
      <button class="btn kard-retry-btn" data-retry="${c.id}">${svgIcon('retry')} Retry</button>
    </div>`;
  } else if (c.status === 'published') {
    const pubFmt = c.publishedAt ? fmtDatetime(c.publishedAt) : (c.date ? fmtDate(c.date) : '');
    if (pubFmt) extra = `<div class="kard-time-badge kard-published-time">${svgIcon('check')} ${pubFmt}</div>`;
  }

  return `
    <div class="kard${c.status === 'failed' ? ' kard-failed' : ''}" draggable="true" data-id="${c.id}">
      <div class="kard-head">
        <span class="platform-pill" data-platform="${c.platform}">${PLATFORM_ICONS[c.platform] || ''} ${c.platform}</span>
        ${c.date ? `<span class="kard-meta">${fmtDate(c.date)}</span>` : ''}
      </div>
      <div class="kard-title">${escapeHtml(c.title)}</div>
      ${extra}
      <div class="kard-foot">
        <div class="avatar-mini" data-m="${ASSIGNEE_NUM(c.assignee)}" title="${c.assignee}">${ASSIGNEE_INITIAL(c.assignee)}</div>
        <div class="links">
          ${c.figma ? `<a href="${c.figma}" target="_blank" rel="noopener" title="Figma" onclick="event.stopPropagation()">${svgIcon('link')}</a>` : ''}
          ${c.canva ? `<a href="${c.canva}" target="_blank" rel="noopener" title="Canva" onclick="event.stopPropagation()">${svgIcon('link')}</a>` : ''}
          ${c.content ? `<span title="Has copy" style="display:grid;place-items:center;width:18px;height:18px;border-radius:4px;color:var(--good);">${svgIcon('check')}</span>` : ''}
        </div>
      </div>
      ${action}
    </div>
  `;
}

/* -----------------------------------------------------------
   DRAG & DROP
   ----------------------------------------------------------- */
function setupKanbanDnd() {
  let dragged = null;
  const board = $('#kanban-board');
  board.querySelectorAll('.kard').forEach(kard => {
    kard.addEventListener('dragstart', (e) => {
      dragged = kard;
      setTimeout(() => kard.classList.add('dragging'), 0);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', kard.dataset.id);
    });
    kard.addEventListener('dragend', () => { kard.classList.remove('dragging'); dragged = null; });
  });
  board.querySelectorAll('.kanban-list').forEach(list => {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.classList.add('drop-target');
    });
    list.addEventListener('dragleave', () => list.classList.remove('drop-target'));
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      list.classList.remove('drop-target');
      const id = dragged ? dragged.dataset.id : e.dataTransfer.getData('text/plain');
      const newStatus = list.dataset.status;
      const c = State.cards.find(x => x.id === id);
      if (c && c.status !== newStatus) {
        const prev = c.status;
        c.status = newStatus;
        State.pushActivity(`Moved "<span class="em">${escapeHtml(c.title)}</span>" → ${statusLabel(newStatus)}`, 'arrow');
        State.save();
        DB.saveCard(c).catch(console.warn);
        App.renderKanban();
        App.renderDashboard();
        Toast.show(`Moved to ${statusLabel(newStatus)}`, 'info', { label: 'Undo', handler: () => { c.status = prev; State.save(); DB.saveCard(c).catch(console.warn); App.renderKanban(); App.renderDashboard(); } });
      }
    });
  });

  // Kard action buttons (claude / buffer)
  board.querySelectorAll('[data-claude]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = State.cards.find(x => x.id === b.dataset.claude);
    const prompt = c ? `Write a ${c.platform} post titled "${c.title}". Tone: confident, plain language. End with a clear CTA.` : '';
    copyText(prompt, () => {
      Toast.show('Prompt copied — opening Claude…', 'info');
      setTimeout(() => window.open('https://claude.ai/new', '_blank', 'noopener'), 250);
    });
  }));
  board.querySelectorAll('[data-buffer]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = State.cards.find(x => x.id === b.dataset.buffer);
    if (!c || !c.content) { Toast.show('Add final copy on the card first', 'warn'); return; }
    App.openBufferPush(c);
  }));

  board.querySelectorAll('[data-to-review]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = State.cards.find(x => x.id === b.dataset.toReview);
    if (!c) return;
    c.status = 'review';
    State.pushActivity(`Sent "<span class="em">${escapeHtml(c.title)}</span>" to In Review`, 'eye');
    State.save();
    DB.saveCard(c).catch(console.warn);
    App.renderKanban();
    App.renderDashboard();
    Toast.show('Moved to In Review', 'info');
  }));

  board.querySelectorAll('[data-approve]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = State.cards.find(x => x.id === b.dataset.approve);
    if (!c) return;
    c.status = 'approved';
    State.pushActivity(`Approved "<span class="em">${escapeHtml(c.title)}</span>"`, 'check');
    State.save();
    DB.saveCard(c).catch(console.warn);
    App.renderKanban();
    App.renderDashboard();
    Toast.show('Post approved ✓', 'success');
  }));

  board.querySelectorAll('[data-schedule]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    App.openScheduleModal(b.dataset.schedule);
  }));

  board.querySelectorAll('[data-retry]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = State.cards.find(x => x.id === b.dataset.retry);
    if (!c) return;
    c.status = 'approved';
    c.failureReason = null;
    c.scheduledFor = null;
    State.pushActivity(`Retrying "<span class="em">${escapeHtml(c.title)}</span>"`, 'retry');
    State.save();
    DB.saveCard(c).catch(console.warn);
    App.renderKanban();
    App.renderDashboard();
    Toast.show('Moved back to Approved — reschedule to retry', 'info');
  }));

  board.querySelectorAll('[data-publish-buffer]').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = State.cards.find(x => x.id === b.dataset.publishBuffer);
    if (!c) return;
    App.openBufferPush(c);
  }));
}

function setupCalendarDnd() {
  let dragged = null;
  const grid = $('#cal-grid');
  grid.querySelectorAll('.cal-event').forEach(ev => {
    ev.addEventListener('dragstart', (e) => {
      dragged = ev;
      ev.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ev.dataset.cardId);
    });
    ev.addEventListener('dragend', () => { ev.classList.remove('dragging'); dragged = null; });
  });
  grid.querySelectorAll('.cal-day').forEach(day => {
    day.addEventListener('dragover', (e) => { e.preventDefault(); day.classList.add('drop-target'); });
    day.addEventListener('dragleave', () => day.classList.remove('drop-target'));
    day.addEventListener('drop', (e) => {
      e.preventDefault();
      day.classList.remove('drop-target');
      const id = dragged ? dragged.dataset.cardId : e.dataTransfer.getData('text/plain');
      const iso = day.dataset.iso;
      const c = State.cards.find(x => x.id === id);
      if (c && c.date !== iso) {
        const prev = c.date;
        c.date = iso;
        if (c.status === 'ideation' || c.status === 'drafting') c.status = 'scheduled';
        State.pushActivity(`Rescheduled "<span class="em">${escapeHtml(c.title)}</span>" → ${fmtDate(iso)}`, 'clock');
        State.save();
        DB.saveCard(c).catch(console.warn);
        App.renderCalendar();
        App.renderKanban();
        App.renderDashboard();
        Toast.show(`Rescheduled to ${fmtDate(iso)}`, 'success', { label: 'Undo', handler: () => { c.date = prev; State.save(); DB.saveCard(c).catch(console.warn); App.renderCalendar(); App.renderKanban(); App.renderDashboard(); } });
      }
    });
  });
}

/* -----------------------------------------------------------
   COMMAND PALETTE
   ----------------------------------------------------------- */
const Palette = {
  items: [],
  active: 0,
  init() {
    $('#palette-scrim').addEventListener('click', (e) => { if (e.target === $('#palette-scrim')) Palette.close(); });
    $('#palette-input').addEventListener('input', () => Palette.render());
    $('#palette-input').addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); Palette.move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); Palette.move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); Palette.commit(); }
    });
  },
  open() {
    Palette.active = 0;
    $('#palette-input').value = '';
    $('#palette-scrim').classList.add('open');
    Palette.render();
    setTimeout(() => $('#palette-input').focus(), 30);
  },
  close() { $('#palette-scrim').classList.remove('open'); },
  baseItems() {
    return [
      { section: 'Navigate', icon: 'arrow', label: 'Go to Dashboard', hint: 'G D', fn: () => App.switchView('dashboard') },
      { section: 'Navigate', icon: 'doc', label: 'Go to Briefing Engine', hint: 'G B', fn: () => App.switchView('briefs') },
      { section: 'Navigate', icon: 'plus', label: 'Go to Create', hint: 'G E', fn: () => App.switchView('create') },
      { section: 'Navigate', icon: 'arrow', label: 'Go to Kanban', hint: 'G K', fn: () => App.switchView('kanban') },
      { section: 'Navigate', icon: 'clock', label: 'Go to Calendar', hint: 'G C', fn: () => App.switchView('calendar') },
      { section: 'Navigate', icon: 'chart', label: 'Go to Analytics', hint: 'G A', fn: () => App.switchView('analytics') },
      { section: 'Navigate', icon: 'settings', label: 'Go to Integrations', hint: 'G I', fn: () => App.switchView('settings') },
      { section: 'Create', icon: 'plus', label: 'New task', hint: 'N', fn: () => App.openCardModal() },
      { section: 'Create', icon: 'doc', label: 'New brief', hint: 'G B', fn: () => { App.switchView('briefs'); setTimeout(() => $('#b-title').focus(), 100); } },
      { section: 'Actions', icon: 'sun', label: 'Toggle theme', hint: '', fn: () => App.applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark') },
      { section: 'Actions', icon: 'cmd', label: 'Toggle sidebar', hint: '⌘\\', fn: () => $('#app').classList.toggle('sidebar-collapsed') },
      { section: 'Actions', icon: 'send', label: 'Sync Meta analytics', hint: '', fn: () => { App.switchView('analytics'); setTimeout(() => App.metaSync(), 200); } },
    ];
  },
  render() {
    const q = $('#palette-input').value.trim().toLowerCase();
    let items = Palette.baseItems();
    // also include search over cards & briefs
    State.cards.forEach(c => items.push({
      section: 'Tasks',
      icon: 'doc',
      label: c.title,
      hint: c.platform + ' · ' + statusLabel(c.status),
      fn: () => App.openCardModal(c.id)
    }));
    State.briefs.forEach(b => items.push({
      section: 'Briefs',
      icon: 'doc',
      label: b.title,
      hint: 'open brief',
      fn: () => { App.switchView('briefs'); setTimeout(() => App.loadBrief(b.id), 100); }
    }));

    if (q) items = items.filter(it => (it.label + ' ' + it.section).toLowerCase().includes(q));
    items = items.slice(0, 40);

    Palette.items = items;
    if (Palette.active >= items.length) Palette.active = 0;

    let html = '';
    let lastSection = '';
    items.forEach((it, i) => {
      if (it.section !== lastSection) {
        html += `<div class="palette-section">${it.section}</div>`;
        lastSection = it.section;
      }
      html += `<div class="palette-item ${i === Palette.active ? 'active' : ''}" data-idx="${i}">
        ${svgIcon(it.icon)}
        <span class="label">${escapeHtml(it.label)}</span>
        ${it.hint ? `<span class="hint">${escapeHtml(it.hint)}</span>` : ''}
      </div>`;
    });
    if (!items.length) html = `<div class="empty-mini" style="padding:30px;">${svgIcon('cmd')}<div>No matches.</div></div>`;
    $('#palette-list').innerHTML = html;
    $$('#palette-list .palette-item').forEach(el => {
      el.addEventListener('click', () => { Palette.active = parseInt(el.dataset.idx); Palette.commit(); });
      el.addEventListener('mousemove', () => {
        const idx = parseInt(el.dataset.idx);
        if (idx !== Palette.active) { Palette.active = idx; Palette.refreshActive(); }
      });
    });
  },
  refreshActive() {
    $$('#palette-list .palette-item').forEach(el => el.classList.toggle('active', parseInt(el.dataset.idx) === Palette.active));
    const el = $(`#palette-list .palette-item[data-idx="${Palette.active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  },
  move(d) {
    const n = Palette.items.length;
    if (!n) return;
    Palette.active = (Palette.active + d + n) % n;
    Palette.refreshActive();
  },
  commit() {
    const it = Palette.items[Palette.active];
    if (!it) return;
    Palette.close();
    setTimeout(() => it.fn(), 50);
  }
};

/* -----------------------------------------------------------
   HELPERS
   ----------------------------------------------------------- */
function escapeHtml(s) {
  return (s || '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function compact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n;
}
function statusLabel(id) { return (STATUSES.find(s => s.id === id) || {}).label || id; }
function statusTone(id) {
  return { ideation: 'amber', drafting: 'blue', review: 'purple', approved: 'green', scheduled: 'orange', published: 'teal' }[id] || 'gray';
}
function platformTone(p) {
  return { 'LinkedIn': 'blue', 'Instagram': 'pink', 'X (Twitter)': 'gray', 'TikTok': 'teal', 'Blog': 'green' }[p] || 'gray';
}
function platformAspect(p) {
  return { 'LinkedIn': '1200×627 landscape', 'Instagram': '1080×1350 portrait (4:5)', 'X (Twitter)': '1600×900 landscape', 'TikTok': '1080×1920 portrait (9:16)', 'Blog': '1600×800 hero' }[p] || 'flexible';
}
function copyText(text, ok) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(ok).catch(() => fallback());
  } else fallback();
  function fallback() {
    const ta = $('#clipboard-helper');
    ta.value = text;
    ta.select();
    try { document.execCommand('copy'); ok && ok(); } catch (e) {}
  }
}

function sparkSVG(values) {
  if (!values || !values.length) return '';
  const w = 200, h = 36;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:100%;">
    <path d="${area}" fill="var(--accent)" opacity="0.12"/>
    <path d="${path}" stroke="var(--accent)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function drawLineChart(svg, values, labels) {
  if (!svg || !values.length) return;
  const W = 800, H = 220;
  const padL = 40, padR = 20, padT = 16, padB = 30;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const min = Math.min(...values) * 0.85;
  const max = Math.max(...values) * 1.05;
  const range = max - min || 1;
  const step = innerW / (values.length - 1);

  const pts = values.map((v, i) => [padL + i * step, padT + innerH - ((v - min) / range) * innerH]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${padL + innerW} ${padT + innerH} L ${padL} ${padT + innerH} Z`;

  // grid lines (4 horizontal)
  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (innerH * i / 4);
    grid += `<line class="grid-line" x1="${padL}" y1="${y}" x2="${padL + innerW}" y2="${y}"/>`;
    const v = max - (range * i / 4);
    grid += `<text class="label" x="${padL - 6}" y="${y + 3}" text-anchor="end">${compact(Math.round(v))}</text>`;
  }
  let xlabels = '';
  labels.forEach((l, i) => {
    if (i % Math.ceil(labels.length / 6) === 0 || i === labels.length - 1) {
      xlabels += `<text class="label" x="${pts[i][0]}" y="${H - 8}" text-anchor="middle">${l}</text>`;
    }
  });
  const dots = pts.map(p => `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="3"/>`).join('');

  svg.innerHTML = grid + `<path class="area" d="${area}"/><path class="line" d="${path}"/>` + dots + xlabels;
}

/* -----------------------------------------------------------
   BOOT
   ----------------------------------------------------------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else App.init();

// Expose for debugging (settings excluded — contains sensitive tokens)
window.BluVideoOS = { State: { briefs: State.briefs, cards: State.cards, metrics: State.metrics, activity: State.activity }, App };

// Spin keyframe for sync icon
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);

})();

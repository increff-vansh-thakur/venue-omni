// VenueBuddy · core: helpers, live state, render dispatcher, roles, time helpers
const E = window.Engine;
const $ = id => document.getElementById(id);
const rupee = n => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const SRC_COLOR = Object.fromEntries(E.CHANNELS.map(c => [c.id, c.color]));
// Mock channel logos (original marks for the demo — not real brands)
const GLYPH = {
  whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/>',
  aggA: '<path fill-rule="evenodd" d="M12 2.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19zM10 8v8l6.5-4z"/>',
  aggB: '<path d="M5 5h3v15H5zM16 5h3v15h-3zM4 7.5h16v3.2H4zM4 13h16v2H4z"/>',
  aggC: '<path fill-rule="evenodd" d="M4 4h6.5a8 8 0 0 1 0 16H4zm3.2 3.2v9.6h3.3a4.8 4.8 0 0 0 0-9.6z"/><circle cx="20" cy="5" r="2.2"/>',
  offline: '<path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2 8 4.6V21H4v-3.4C4 15 7.6 13 12 13z"/>',
};
const logo = (id, s = 20) => { const c = E.ch(id); return `<span class="logo" style="width:${s}px;height:${s}px;background:${c.color}" title="${c.name}"><svg viewBox="0 0 24 24">${GLYPH[id] || ''}</svg></span>`; };
const MK_NAMES = E.MARKETPLACES.map(E.chName);
const listNames = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0];
const I = {
  check: '<svg class="i" viewBox="0 0 24 24"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.6 8 19.2 6.6z"/></svg>',
  lock: '<svg class="i" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
  xmark: '<svg class="i" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.5 12.1-1.4 1.4L12 13.4l-2.1 2.1-1.4-1.4 2.1-2.1-2.1-2.1 1.4-1.4 2.1 2.1 2.1-2.1 1.4 1.4-2.1 2.1z"/></svg>',
  spark: '<svg class="i" viewBox="0 0 24 24"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  clock: '<svg class="i" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.5 2-1 1.7L11 13V6h2z"/></svg>',
  wrench: '<svg class="i" viewBox="0 0 24 24"><path d="M21 7a5 5 0 0 1-6.6 4.7L6 20.1 3.9 18l8.4-8.4A5 5 0 0 1 18.5 3l-3 3 1.5 1.5 3-3c.6.8 1 1.7 1 2.5z"/></svg>',
  mic: '<svg class="i" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0h-2a5 5 0 0 1-10 0zM11 18h2v4h-2z"/></svg>',
  stop: '<svg class="i" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
};

let S = null, view = 'today', feedTab = 'postings', chatSel = 'sim', aiOnline = false, aiForcedOff = false, seenPostings = new Set();
const api = (p, body) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }).then(r => r.json());
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); }

// ───────── Live state from the server ─────────
function connect() {
  const es = new EventSource('/api/events');
  es.onmessage = e => { S = JSON.parse(e.data); render(); if (bkOpen) renderBooking(); };
  es.onerror = () => { $('aiBadge').textContent = 'Server offline'; $('aiBadge').className = 'badge off'; };
}
function postStatus(d, h, target) {
  const p = S.postings.find(p => p.day === d && p.hour === h && p.target === target && (p.type === 'BLOCK' || p.type === 'CONFIRM'));
  if (!p) return '';
  return p.status === 'acked' ? `<span class="ps acked">${I.check}posted · ${p.ms}ms</span>` : `<span class="ps ${p.status}">${p.status === 'retrying' ? '↻ retrying' : '… posting'}</span>`;
}

function render() {
  if (!S) return;
  renderBadges();
  document.querySelectorAll('#days button').forEach(b => {
    b.classList.toggle('active', b.dataset.day === view);
    const dt = E.dayDate(b.dataset.day);
    b.textContent = `${E.dayLabel(b.dataset.day)} · ${dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}${E.isWeekend(b.dataset.day) ? ' · Weekend' : ''}`;
  });
  if (role === 'staff') return renderStaff();
  renderOwner();   // defined in owner.js
}
function renderBadges() {
  aiOnline = S.ai && !aiForcedOff;
  const a = $('aiBadge'); a.textContent = aiOnline ? 'Sarvam AI Connected' : 'Offline · Rule-Based Fallbacks'; a.className = 'badge owner-only ' + (aiOnline ? 'on' : 'off');
  const w = $('waBadge'), st = S.wa?.status || 'off';
  w.textContent = { off: 'WhatsApp: Simulated', scan_qr: 'WhatsApp: Scan QR in terminal', linked: `WhatsApp: Live +${S.wa.number || ''}`, reconnecting: 'WhatsApp: Reconnecting…', logged_out: 'WhatsApp: Logged out', error: 'WhatsApp: Error' }[st] || st;
  w.className = 'badge ' + (st === 'linked' ? 'on' : st === 'off' ? '' : 'off');
}


// ═════════════════════════ Roles: Owner / Staff ═════════════════════════
const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const roleParam = new URLSearchParams(location.search).get('role');   // ?role=staff → bookmarkable front-desk link
let role = (roleParam || store.get('venuebuddy.role')) === 'staff' ? 'staff' : 'owner';
function setRole(r) {
  role = r; store.set('venuebuddy.role', r);
  document.body.classList.toggle('staff', r === 'staff');
  $('ownerView').hidden = r === 'staff'; $('staffView').hidden = r !== 'staff';
  document.querySelectorAll('#roleSw button').forEach(b => { b.classList.toggle('active', b.dataset.role === r); b.setAttribute('aria-selected', b.dataset.role === r); });
  $('subtitle').textContent = r === 'staff' ? 'Kickoff Arena, Koramangala · Front desk' : 'Kickoff Arena, Koramangala · 5-a-side';
  renderChat.key = null; threadKey = null; renderTabs(); applyPanels(); render();
}
$('roleSw').onclick = e => { const b = e.target.closest('button'); if (b) setRole(b.dataset.role); };

// ───────── Time helpers (calendar works off the real clock) ─────────
const ROW_H = 58;
const nowFrac = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
const hShort = h => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
const isPast = E.isOver;   // front desk: a slot is past once it has ended
const isLive = (d, h) => d === 'today' && h <= nowFrac() && nowFrac() < h + 1;
function rel(d, h) {
  if (d !== 'today') return 'Tomorrow';
  const m = Math.round((h - nowFrac()) * 60);
  if (m <= 0 && m > -60) return 'Playing now';
  if (m < 0) return 'Done';
  if (m < 60) return `in ${m} min`;
  return `in ${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + 'm' : ''}`.trim();
}
const SRC_LABEL = c => c === 'whatsapp' ? 'WhatsApp' : c === 'offline' ? 'Walk-in / phone' : E.chName(c) + ' app';
function payLine(b) {
  if (b.kind === 'owner') return b.note || 'Owner block';
  if (b.channel === 'offline') return `Collect ${rupee(b.price)} at desk`;
  if (b.channel === 'whatsapp') return `Paid ${rupee(b.price)} · UPI`;
  return `Paid on ${E.chName(b.channel)}`;
}
const realPhone = p => p && /\d{6,}/.test(p.replace(/\D/g, '')) ? p : null;
const chatOf = phone => phone && S.chats.find(c => c.phone === phone);
function statusChip(b, d, h) {
  if (b.status === 'arrived') return '<span class="st-chip arrived">✓ In</span>';
  if (b.status === 'no_show') return '<span class="st-chip no_show">No-show</span>';
  if (isLive(d, h)) return '<span class="st-chip now">Now</span>';
  if (d === 'today' && h - nowFrac() > 0 && h - nowFrac() <= 1) return `<span class="st-chip soon">${rel(d, h)}</span>`;
  return '';
}


// ───────── Tabs (header nav). Each view marks its sections with data-panel="<tab id>". ─────────
const TABS = {
  owner: [['today', 'Today'], ['slots', 'Slots'], ['pricing', 'Pricing'], ['customers', 'Customers'], ['sync', 'Channel sync']],
  staff: [['desk', 'Desk'], ['calendar', 'Calendar'], ['whatsapp', 'WhatsApp']],
};
const tabParam = new URLSearchParams(location.search).get('tab');   // ?tab=slots → deep link
const tabs = {
  owner: store.get('venuebuddy.tab.owner') || 'today',
  staff: store.get('venuebuddy.tab.staff') || 'desk',
};
if (tabParam) for (const r in TABS) if (TABS[r].some(([id]) => id === tabParam)) tabs[r] = tabParam;
const tab = () => tabs[role];
function renderTabs() {
  $('tabs').innerHTML = TABS[role].map(([id, label]) =>
    `<button role="tab" data-tab="${id}" class="${tabs[role] === id ? 'on' : ''}" aria-selected="${tabs[role] === id}">${label}<span class="count" data-count="${id}"></span></button>`).join('');
}
function applyPanels() {
  document.querySelectorAll(`#${role}View [data-panel]`).forEach(p => { p.hidden = !p.dataset.panel.split(' ').includes(tabs[role]); });
}
function setTab(t) { tabs[role] = t; store.set('venuebuddy.tab.' + role, t); renderTabs(); applyPanels(); render(); window.scrollTo(0, 0); }
// Views call this to show a number next to a tab (e.g. WhatsApp chats needing a reply). Empty string hides it.
function setTabCount(id, n) { const el = document.querySelector(`#tabs [data-count="${id}"]`); if (el) el.textContent = n ? String(n) : ''; }
$('tabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); };

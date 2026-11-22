// Customers & Growth — player list across every channel, play-frequency segments, discount rules,
// scheduled WhatsApp nudges and tournament/event invites. Plugged into server.js via init(ctx).
let X;            // server context: S(), E, book, cancel, callTool, botSay, chatFor, event, broadcast, upiLink, holdSeconds
let G;            // growth state
const DAY = 86400e3;

// ───────────────────────────── Synthetic history ─────────────────────────────
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Ishaan', 'Kabir', 'Siddharth', 'Nikhil', 'Pranav', 'Yash', 'Ayaan', 'Reyansh', 'Harsh', 'Kunal', 'Manav',
  'Tanvi', 'Ananya', 'Diya', 'Meera', 'Ishita', 'Riya', 'Kavya', 'Nisha', 'Pooja', 'Zoya', 'Faiz', 'Imran', 'Sameer', 'Joseph', 'Thomas',
  'Gurpreet', 'Harpreet', 'Abhishek', 'Varun', 'Neel', 'Tejas', 'Omkar', 'Farhan', 'Aditi', 'Shreya', 'Rehan'];
const ARCH = { regular: { n: [10, 16], last: [0, 4] }, active: { n: [4, 7], last: [3, 12] }, at_risk: { n: [6, 10], last: [16, 28] },
  lapsed: { n: [3, 6], last: [38, 80] }, new: { n: [1, 1], last: [2, 10] } };
const FAV_HOURS = [19, 20, 18, 21, 7, 6, 17, 22, 9, 14];

function makeHistory(r, arch, primary, fav) {
  const a = ARCH[arch], n = a.n[0] + Math.floor(r() * (a.n[1] - a.n[0] + 1));
  let d = a.last[0] + Math.floor(r() * (a.last[1] - a.last[0] + 1));
  const gap = arch === 'regular' ? [3, 7] : arch === 'at_risk' ? [4, 9] : [7, 18];
  const visits = [];
  for (let i = 0; i < n && d <= 90; i++) {
    const ch = r() < 0.75 ? primary : X.E.CH_IDS[Math.floor(r() * X.E.CH_IDS.length)];
    const hour = r() < 0.7 ? fav : Math.min(22, Math.max(6, fav + (r() < 0.5 ? -1 : 1)));
    visits.push({ daysAgo: d, hour, channel: ch, price: Math.round(X.E.BASE * X.E.band(hour).m / 10) * 10 });
    d += gap[0] + Math.floor(r() * (gap[1] - gap[0] + 1));
  }
  return visits;
}
const phoneFrom = r => `+91 9${String(Math.floor(r() * 9000) + 1000)} ${String(Math.floor(r() * 90000) + 10000)}`;

function seedPlayers() {
  const r = rng(42), players = {};
  const add = (phone, name, arch, primary, fav) => { players[phone] = { phone, name, visits: makeHistory(r, arch, primary, fav), optOut: false, createdAt: Date.now() }; };
  // People who already appear in the demo
  add('sim', 'Priya', 'at_risk', 'whatsapp', 19);
  add('sim-karan', 'Karan', 'regular', 'whatsapp', 20);
  add('+91 99000 45671', 'Vikram', 'regular', 'aggA', 19);
  add('+91 97411 80234', 'Sneha', 'active', 'aggB', 20);
  add('+91 90080 55412', 'Rohan', 'new', 'aggC', 21);
  add('+91 98450 11223', 'Rahul', 'regular', 'offline', 7);
  // Everyone else pulled from marketplaces, WhatsApp and the desk register
  const mix = ['regular', 'regular', 'regular', 'regular', 'regular', 'regular', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active',
    'at_risk', 'at_risk', 'at_risk', 'at_risk', 'at_risk', 'at_risk', 'lapsed', 'lapsed', 'lapsed', 'lapsed', 'lapsed', 'lapsed', 'lapsed', 'lapsed', 'new', 'new', 'new', 'new'];
  const prim = ['aggA', 'aggA', 'aggA', 'aggB', 'aggB', 'aggC', 'whatsapp', 'whatsapp', 'offline'];
  mix.forEach((arch, i) => add(phoneFrom(r), NAMES[i % NAMES.length], arch, prim[Math.floor(r() * prim.length)], FAV_HOURS[Math.floor(r() * FAV_HOURS.length)]));
  return players;
}

// ───────────────────────────── Segments & metrics ─────────────────────────────
const SEG = { new: 'New', regular: 'Regular', active: 'Active', at_risk: 'At risk', lapsed: 'Lapsed', won_back: 'Won back' };
function upcomingFor(phone) {
  const S = X.S(), out = [];
  for (const d of X.E.DAYS) for (const h of X.E.HOURS) { const b = S.slots[d][h].booking; if (b && b.phone === phone && b.kind !== 'owner' && !X.E.isOver(d, h)) out.push({ day: d, hour: h, ref: b.ref }); }
  return out;
}
function metrics(p) {
  const past = p.visits.filter(v => v.daysAgo > 0 || (v.daysAgo === 0 && X.E.isOver('today', v.hour)));
  const n = past.length, ds = past.map(v => v.daysAgo);
  const last = n ? Math.min(...ds) : null, first = n ? Math.max(...ds) : null;
  const g30 = past.filter(v => v.daysAgo <= 30).length;
  const weeks = Array(12).fill(0); past.forEach(v => { const w = Math.floor(v.daysAgo / 7); if (w < 12) weeks[11 - w]++; });
  const cnt = {}, hc = {}; past.forEach(v => { cnt[v.channel] = (cnt[v.channel] || 0) + 1; hc[v.hour] = (hc[v.hour] || 0) + 1; });
  const primary = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || 'whatsapp';
  const favHour = +(Object.keys(hc).sort((a, b) => hc[b] - hc[a])[0] || 19);
  const mk = past.filter(v => X.E.ch(v.channel).marketplace).length;
  const spend = past.reduce((s, v) => s + v.price, 0), comm = past.reduce((s, v) => s + v.price * X.E.ch(v.channel).comm, 0);
  const up = upcomingFor(p.phone);
  let seg = n <= 2 && first != null && first <= 14 ? 'new' : g30 >= 4 ? 'regular' : last != null && last >= 15 && last <= 35 && n >= 3 ? 'at_risk'
    : last != null && last > 35 ? 'lapsed' : g30 >= 1 ? 'active' : last != null && last >= 15 ? 'at_risk' : 'new';
  if ((seg === 'at_risk' || seg === 'lapsed') && up.length) seg = 'won_back';
  return { phone: p.phone, name: p.name, optOut: p.optOut, games90: n, g30, last, avgGap: n > 1 ? Math.round((first - last) / (n - 1)) : null,
    perMonth: +(n / 3).toFixed(1), weeks, sources: Object.keys(cnt), primary, favHour, mkShare: n ? mk / n : 0, spend, comm: Math.round(comm),
    segment: seg, upcoming: up.length, offer: activeOffer(p.phone) };
}
const allMetrics = () => Object.values(G.players).map(metrics);

// ───────────────────────────── Discount rules & offers ─────────────────────────────
const isOff = h => h >= 10 && h <= 15;
const RULES = () => [
  { id: 'winback', code: 'BACK', name: 'Win back at-risk players', icon: 'heart', desc: 'Used to play regularly, quiet for 15–35 days', segs: ['at_risk'], pct: 20, band: 'any', validDays: 7, tpl: 'winback', enabled: true },
  { id: 'comeback', code: 'COME', name: 'Lapsed comeback · afternoons', icon: 'repeat', desc: 'Not seen in 35+ days — bring them into dead off-peak slots', segs: ['lapsed'], pct: 30, band: 'offpeak', validDays: 10, tpl: 'lapsed', enabled: true },
  { id: 'direct', code: 'DIRECT', name: 'Go direct, skip the app fee', icon: 'arrow', desc: 'Regular & active players who book mostly via marketplaces', segs: ['regular', 'active'], minMk: 0.6, pct: 10, band: 'any', validDays: 14, tpl: 'direct', enabled: true },
  { id: 'loyalty', code: 'LOYAL', name: 'Loyalty · every 5th game', icon: 'gift', desc: 'Regulars whose next game is a 5th, 10th, 15th…', segs: ['regular'], every5: true, pct: 50, band: 'any', validDays: 14, tpl: 'loyalty', enabled: true },
  { id: 'fill', code: 'FILL', name: "Fill tomorrow's dead slots", icon: 'bolt', desc: 'Active, regular & new players · tomorrow 10 AM–4 PM only', segs: ['active', 'regular', 'new'], pct: 25, band: 'offpeak', validDays: 1, tpl: 'fill', enabled: true },
];
const ruleMatch = (r, m) => !m.optOut && r.segs.includes(m.segment) && (!r.minMk || m.mkShare >= r.minMk) && (!r.every5 || m.games90 % 5 === 4);
function activeOffer(phone) { const o = G.offers[phone]; return o && o.status === 'active' && o.expires > Date.now() ? o : null; }
function makeOffer(phone, rule) {
  const code = `${rule.code}${rule.pct}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return (G.offers[phone] = { code, ruleId: rule.id, pct: rule.pct, band: rule.band, expires: Date.now() + rule.validDays * DAY, status: 'active', createdAt: Date.now() });
}
// Called by the booking engine when a WhatsApp hold is created: apply this customer's offer if the slot qualifies.
function offerFor(phone, day, hour) { const o = activeOffer(phone); if (!o) return null; if (o.band === 'offpeak' && !isOff(hour)) return null; return o; }
function economics(r) {
  if (r.id === 'direct') { const p = 1300; return `Nets ₹${Math.round(p * (1 - r.pct / 100))} direct vs ₹${p * 0.8} via Playon — +₹${Math.round(p * (1 - r.pct / 100) - p * 0.8)} a game`; }
  const p = r.band === 'offpeak' ? 800 : 1300;
  return `Gives up ₹${Math.round(p * r.pct / 100)} a game · an empty slot earns ₹0`;
}

// ───────────────────────────── Message templates ─────────────────────────────
const hin = (d, h) => `${d === 'today' ? 'aaj' : 'kal'} ${h < 12 ? 'subah' : h < 17 ? 'dopahar' : h < 20 ? 'shaam' : 'raat'} ${h % 12 || 12} baje`;
function tpl(kind, m, o, x = {}) {
  const first = m.name.split(' ')[0], pct = o?.pct, code = o?.code;
  switch (kind) {
    case 'winback': return `Hi ${first} 👋 ${m.last} din ho gaye turf pe aaye! ⚽\nAapke liye ${pct}% OFF — code ${code} (7 din valid).\nBas reply karo jaise "${hin('tomorrow', m.favHour)}" aur slot book ho jayega 💚`;
    case 'lapsed': return `${first}, Kickoff Arena aapko miss kar raha hai! 🥅\nComeback offer: dopahar ke slots (10 AM–4 PM) pe ${pct}% OFF. Code ${code}.\nReply karo jaise "kal dopahar 2 baje" 🙌`;
    case 'direct': return `${first}, next game WhatsApp pe direct book karo — ${pct}% OFF vs app price, koi convenience fee nahi ✅\nCode ${code}. Reply karo jaise "${hin('tomorrow', m.favHour)}".`;
    case 'loyalty': return `🎉 ${first}, aapka agla game aapka ${m.games90 + 1}th hai — loyalty reward ${pct}% OFF! Code ${code}.\nReply karo jaise "${hin('tomorrow', m.favHour)}".`;
    case 'fill': return `⚡ ${first}, kal ${x.slot || 'dopahar'} slot free hai — sirf aapke liye ${pct}% OFF (code ${code}).\nReply "${x.cmd || 'kal dopahar 2 baje'}" aur ho gaya book!`;
    case 'weekend': return `Weekend aa gaya ${first}! ⚽ Sat–Sun ke evening slots fast fill ho rahe hain.\nReply karo jaise "${hin('tomorrow', m.favHour)}" — WhatsApp pe best price 💚`;
    case 'welcome': return `Thanks for playing at Kickoff Arena, ${first}! 🙏\nDoosra game WhatsApp pe direct book karo aur paao ${pct}% OFF — code ${code}.`;
    case 'invite': return `🏆 ${x.t.name} — ${x.when} at Kickoff Arena!\n${x.t.format} · max ${x.t.teamsMax} teams · Prize ${x.t.prize}\nEntry ₹${x.t.fee}/team.\n\nTeam register karne ke liye reply karo JOIN`;
    case 'reminder': return `⏰ Reminder: ${x.t.name} ${x.when}. Team ready rakho, 15 min pehle pahunchna 💪`;
    case 'cancelled': return `😔 ${x.t.name} cancel ho gaya hai. Entry fee 24 ghante mein refund ho jayegi.`;
  }
  return '';
}

// ───────────────────────────── Nudge engine ─────────────────────────────
const P_BOOK = { regular: 0.45, active: 0.35, at_risk: 0.32, lapsed: 0.22, new: 0.3, won_back: 0.3 };
const P_JOIN = { regular: 0.28, active: 0.18, at_risk: 0.12, lapsed: 0.06, new: 0.1, won_back: 0.15 };
const REPLY = ['Haan, {cmd} book karo', 'Ok done 👍 {cmd}', '{cmd} chahiye', 'Sure! {cmd}'];
function camp(id, name, icon) { return (G.camps[id] = G.camps[id] || { id, name, icon, sent: 0, delivered: 0, read: 0, replied: 0, booked: 0, joined: 0, revenue: 0 }); }

function send(m, c, text, kind, extra = {}) {
  const msg = { id: G.mseq++, ts: Date.now(), phone: m.phone, name: m.name, segment: m.segment, camp: c.id, campName: c.name, icon: c.icon, kind, text, status: 'sent', ...extra };
  G.outbox.unshift(msg); G.outbox.length = Math.min(G.outbox.length, 200); c.sent++;
  const S = X.S(), chat = S.chats[m.phone];
  const live = m.phone === 'sim' || (chat && chat.real);
  if (live) {           // a real conversation (the demo phone or a linked WhatsApp number): the customer answers themselves
    X.botSay(X.chatFor(m.phone, m.name, !!chat?.real), text);
    msg.status = 'delivered'; c.delivered++;
    return msg;
  }
  // Simulated customer: delivery → read → maybe a reply that books or joins
  const step = (ms, fn) => setTimeout(() => { fn(); X.broadcast(); }, ms);
  step(500 + Math.random() * 900, () => { msg.status = 'delivered'; c.delivered++; });
  if (Math.random() < 0.85) step(1800 + Math.random() * 3500, () => { msg.status = 'read'; c.read++; });
  if (kind === 'invite') {
    if (Math.random() < (P_JOIN[m.segment] || 0.2)) step(4000 + Math.random() * 9000, () => {
      const t = G.tournaments.find(x => x.id === extra.tid); if (!t || t.teams.length >= t.teamsMax - 2) return;   // keep 2 spots for live sign-ups
      msg.reply = 'JOIN'; registerTeam(extra.tid, m, msg); });
  } else if (kind === 'offer' || kind === 'nudge') {
    if (Math.random() < (P_BOOK[m.segment] || 0.25) && G.runBookings < 5) {
      G.runBookings++;
      step(4500 + Math.random() * 8000, () => simulateBooking(m, msg));
    }
  }
  return msg;
}
function simulateBooking(m, msg) {
  const o = activeOffer(m.phone), S = X.S();
  const cands = [];
  for (const d of ['tomorrow', 'today']) for (const h of X.E.HOURS) {
    const sl = S.slots[d][h];
    if (sl.booking || sl.hold || sl.closed.whatsapp || X.E.isPast(d, h)) continue;
    if (o && o.band === 'offpeak' && !isOff(h)) continue;
    cands.push({ d, h, score: Math.abs(h - m.favHour) + (d === 'today' ? 0.5 : 0) });
  }
  cands.sort((a, b) => a.score - b.score);
  const pick = cands[0]; if (!pick) return;
  const cmd = hin(pick.d, pick.h);
  msg.reply = REPLY[Math.floor(Math.random() * REPLY.length)].replace('{cmd}', cmd); msg.status = 'replied'; G.camps[msg.camp].replied++;
  const h = X.callTool('hold_slot', { day: pick.d, hour: pick.h, customer: m.name, phone: m.phone }, `WhatsApp bot · ${m.name} replied to a nudge`);
  if (!h.ok) return;
  setTimeout(() => { X.callTool('confirm_booking', { ref: h.ref }, `WhatsApp bot · ${m.name} paid via UPI`); X.broadcast(); }, 1500);
}

function runRule(id, opts = {}) {
  const r = G.rules.find(x => x.id === id); if (!r) return { ok: false, error: 'no rule' };
  const c = camp(opts.campId || 'rule:' + r.id, opts.campName || r.name, r.icon);
  let aud = allMetrics().filter(m => ruleMatch(r, m) && !activeOffer(m.phone));
  if (opts.filter) aud = aud.filter(opts.filter);
  if (opts.limit) aud = aud.slice(0, opts.limit);
  let extra = {};
  if (r.id === 'fill') {
    const free = X.E.HOURS.filter(h => isOff(h) && !X.S().slots.tomorrow[h].booking && !X.S().slots.tomorrow[h].hold);
    if (!free.length) return { ok: false, error: 'No free off-peak slots tomorrow' };
    extra = { slot: X.E.hLabel(free[0]), cmd: hin('tomorrow', free[0]) };
  }
  G.runBookings = 0;
  aud.forEach((m, i) => setTimeout(() => { const o = makeOffer(m.phone, r); r.stats.offers++; send(m, c, tpl(opts.tpl || r.tpl, m, o, extra), 'offer'); X.broadcast(); }, i * 160));
  r.stats.runs++; r.lastRun = Date.now();
  X.event('ai', `🏷 Discount rule "${r.name}" → ${aud.length} WhatsApp offers (${r.pct}% · ${r.band === 'offpeak' ? '10 AM–4 PM' : 'any slot'})`);
  return { ok: true, sent: aud.length };
}

// ───────────────────────────── Scheduled nudges ─────────────────────────────
function nextRun(sch, from = Date.now()) {
  const t = new Date(from); t.setSeconds(0, 0); t.setHours(sch.hour, sch.minute || 0);
  if (sch.type === 'daily') { if (t.getTime() <= from) t.setDate(t.getDate() + 1); }
  if (sch.type === 'weekly') { while (t.getDay() !== sch.dow || t.getTime() <= from) t.setDate(t.getDate() + 1); }
  if (sch.type === 'monthly') { t.setDate(1); if (t.getTime() <= from) { t.setMonth(t.getMonth() + 1); t.setDate(1); } }
  return t.getTime();
}
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtTime = s => `${s.hour % 12 || 12}:${String(s.minute || 0).padStart(2, '0')} ${s.hour < 12 ? 'AM' : 'PM'}`;
const schedText = s => s.type === 'daily' ? `Daily · ${fmtTime(s)}` : s.type === 'weekly' ? `Every ${DOW[s.dow]} · ${fmtTime(s)}` : `1st of every month · ${fmtTime(s)}`;
const AUTOS = () => [
  { id: 'a_winback', name: 'Win-back after 14 days', icon: 'heart', trigger: "Player hasn't played for 14+ days", segs: ['at_risk'], ruleId: 'winback', tpl: 'winback', sch: { type: 'daily', hour: 18 }, enabled: true },
  { id: 'a_fill', name: 'Dead-slot filler', icon: 'bolt', trigger: 'Tomorrow still has free 10 AM–4 PM slots', segs: ['active', 'regular', 'new'], ruleId: 'fill', tpl: 'fill', sch: { type: 'daily', hour: 12 }, enabled: true },
  { id: 'a_weekend', name: 'Weekend warm-up', icon: 'calendar', trigger: 'Every Friday before the weekend', segs: ['regular', 'active'], ruleId: null, tpl: 'weekend', sch: { type: 'weekly', dow: 5, hour: 17 }, enabled: true },
  { id: 'a_welcome', name: 'Welcome → 2nd game', icon: 'sparkle', trigger: "A new player's first game was yesterday or earlier", segs: ['new'], ruleId: 'direct', tpl: 'welcome', sch: { type: 'daily', hour: 10 }, enabled: true },
  { id: 'a_lapsed', name: 'Monthly lapsed sweep', icon: 'repeat', trigger: 'Players not seen in 35+ days', segs: ['lapsed'], ruleId: 'comeback', tpl: 'lapsed', sch: { type: 'monthly', hour: 10 }, enabled: false },
];
function runAuto(id, manual) {
  const a = G.autos.find(x => x.id === id); if (!a) return { ok: false, error: 'no automation' };
  a.lastRun = Date.now(); a.runs++;
  if (a.ruleId) {
    const r = G.rules.find(x => x.id === a.ruleId);
    const res = runRule(a.ruleId, { campId: 'auto:' + a.id, campName: a.name, tpl: a.tpl, filter: m => a.segs.includes(m.segment) && !m.optOut && (a.id !== 'a_winback' || m.last >= 14) });
    X.event('ai', `⏰ Scheduled nudge "${a.name}" ${manual ? '(run now)' : ''} → ${res.sent || 0} messages${res.error ? ' · ' + res.error : ''}`);
    return res;
  }
  const c = camp('auto:' + a.id, a.name, a.icon);
  const aud = allMetrics().filter(m => a.segs.includes(m.segment) && !m.optOut).slice(0, 14);
  G.runBookings = 0;
  aud.forEach((m, i) => setTimeout(() => { send(m, c, tpl(a.tpl, m, null), 'nudge'); X.broadcast(); }, i * 160));
  X.event('ai', `⏰ Scheduled nudge "${a.name}" ${manual ? '(run now)' : ''} → ${aud.length} messages`);
  return { ok: true, sent: aud.length };
}
function tick() {
  if (!G) return;
  for (const a of G.autos) if (a.enabled && Date.now() >= a.next) { runAuto(a.id, false); a.next = nextRun(a.sch); }
}

// ───────────────────────────── Tournaments & events ─────────────────────────────
const hh = h => `${h % 12 || 12} ${h < 12 || h === 24 ? 'AM' : 'PM'}`;
const whenText = t => `${X.E.dayLabel(t.day)} ${hh(t.start)}–${hh(t.end)}`;
function createTournament(b) {
  const day = b.day, start = +b.start, end = +b.end, S = X.S();
  if (!X.E.DAYS.includes(day) || !(start >= 6 && end <= 23 && end > start)) return { ok: false, error: 'Pick a valid day and time range' };
  const clash = []; for (let h = start; h < end; h++) { const sl = S.slots[day][h]; if (sl.booking || sl.hold) clash.push(X.E.hLabel(h)); }
  if (clash.length) return { ok: false, error: `Already booked: ${clash.join(', ')}` };
  const t = { id: 'T' + (G.tseq++), name: String(b.name || 'Turf Cup').slice(0, 60), type: b.type || 'Tournament', format: b.format || '5-a-side knockout', day, start, end,
    teamsMax: Math.max(2, +b.teamsMax || 8), fee: Math.max(0, +b.fee || 0), prize: b.prize || '—', segs: b.segs?.length ? b.segs : ['regular', 'active'], teams: [], invited: [], status: 'open', createdAt: Date.now() };
  for (let h = start; h < end; h++) X.book({ day, hour: h, channel: 'offline', kind: 'owner', customer: t.type, note: `🏆 ${t.name}` });
  G.tournaments.unshift(t);
  X.event('ok', `🏆 ${t.type} "${t.name}" created · ${whenText(t)} · ${end - start} slots blocked on every marketplace`);
  invite(t.id);
  return { ok: true, id: t.id };
}
function invite(tid) {
  const t = G.tournaments.find(x => x.id === tid); if (!t) return { ok: false, error: 'no event' };
  const c = camp('evt:' + t.id, `${t.name} invites`, 'trophy');
  const aud = allMetrics().filter(m => t.segs.includes(m.segment) && !m.optOut && !t.invited.includes(m.phone)).sort((a, b) => (b.phone === 'sim') - (a.phone === 'sim'));
  G.runBookings = 0;
  aud.forEach((m, i) => setTimeout(() => { t.invited.push(m.phone); send(m, c, tpl('invite', m, null, { t, when: whenText(t) }), 'invite', { tid: t.id }); X.broadcast(); }, i * 140));
  X.event('ai', `📣 Invites for "${t.name}" → ${aud.length} players (${t.segs.map(s => SEG[s]).join(', ')})`);
  return { ok: true, sent: aud.length };
}
function registerTeam(tid, m, msg) {
  const t = G.tournaments.find(x => x.id === tid); if (!t || t.status !== 'open') return false;
  if (t.teams.find(x => x.phone === m.phone)) return true;
  if (t.teams.length >= t.teamsMax) return false;
  t.teams.push({ captain: m.name, phone: m.phone, at: Date.now() });
  if (msg) { msg.status = 'joined'; G.camps[msg.camp].joined++; G.camps[msg.camp].revenue += t.fee; }
  X.event('ok', `🏆 ${m.name} registered a team for "${t.name}" (${t.teams.length}/${t.teamsMax}) · ₹${t.fee}`);
  if (t.teams.length >= t.teamsMax) t.status = 'full';
  return true;
}
function remind(tid) {
  const t = G.tournaments.find(x => x.id === tid); if (!t) return { ok: false };
  const c = camp('evt:' + t.id + ':rem', `${t.name} reminder`, 'clock');
  t.teams.forEach((tm, i) => setTimeout(() => { const m = metrics(G.players[tm.phone] || { phone: tm.phone, name: tm.captain, visits: [] }); send(m, c, tpl('reminder', m, null, { t, when: whenText(t) }), 'reminder'); X.broadcast(); }, i * 150));
  return { ok: true, sent: t.teams.length };
}
function cancelTournament(tid) {
  const t = G.tournaments.find(x => x.id === tid); if (!t || t.status === 'cancelled') return { ok: false };
  t.status = 'cancelled';
  for (let h = t.start; h < t.end; h++) { const b = X.S().slots[t.day][h].booking; if (b && b.kind === 'owner') X.cancel({ day: t.day, hour: h }); }
  const c = camp('evt:' + t.id + ':cx', `${t.name} cancelled`, 'x');
  t.teams.forEach(tm => { const m = metrics(G.players[tm.phone] || { phone: tm.phone, name: tm.captain, visits: [] }); send(m, c, tpl('cancelled', m, null, { t }), 'notice'); });
  X.event('warn', `🏆 "${t.name}" cancelled · slots reopened on every marketplace`);
  return { ok: true };
}

// ───────────────────────────── Hooks from the booking engine & bot ─────────────────────────────
// Marketplaces share the customer's name + number with the venue: give UI-simulated bookings a realistic identity.
function enrich(a) {
  if (!X.E.ch(a.channel)?.marketplace || a.kind === 'owner') return a;
  const r = Math.random;
  if (!a.phone) a.phone = phoneFrom(r);
  if (!a.customer || /user$|customer$/i.test(a.customer)) a.customer = NAMES[Math.floor(r() * NAMES.length)];
  return a;
}
function onBooking(b, day, hour) {
  if (!G || !b || b.kind === 'owner' || !b.phone) return;
  let p = G.players[b.phone];
  if (!p) p = G.players[b.phone] = { phone: b.phone, name: String(b.customer || 'Guest').replace(/\s*\(.*\)\s*$/, ''), visits: [], optOut: false, createdAt: Date.now() };
  p.visits.unshift({ daysAgo: day === 'today' ? 0 : -1, hour, channel: b.channel, price: b.price, live: true, ref: b.ref });
  if (b.offer) {
    const o = Object.values(G.offers).find(x => x.code === b.offer);
    if (o) { o.status = 'redeemed'; const r = G.rules.find(x => x.id === o.ruleId); if (r) { r.stats.redeemed++; r.stats.revenue += b.price; } }
  }
  const msg = G.outbox.find(m => m.phone === b.phone && Date.now() - m.ts < DAY && ['sent', 'delivered', 'read', 'replied'].includes(m.status) && m.kind !== 'invite');
  if (msg) { msg.status = 'booked'; msg.booking = b.ref; const c = G.camps[msg.camp]; if (c) { c.booked++; c.revenue += b.price; } }
}
// Returns true when the message was handled here (tournament JOIN, STOP), so the booking bot should not answer it.
function handleReply(c, text) {
  if (!G) return false;
  const s = text.toLowerCase().trim();
  const lastMsg = G.outbox.find(m => m.phone === c.phone && Date.now() - m.ts < DAY);
  if (lastMsg && ['sent', 'delivered', 'read'].includes(lastMsg.status)) { lastMsg.status = 'replied'; lastMsg.reply = text; const cp = G.camps[lastMsg.camp]; if (cp) cp.replied++; }
  if (/^(stop|unsubscribe|band karo messages)/.test(s)) {
    const p = G.players[c.phone]; if (p) p.optOut = true;
    X.botSay(c, 'Theek hai — ab aapko offers/reminders nahi bhejenge. Booking ke liye kabhi bhi message karein 🙏'); return true;
  }
  if (/\b(join|register)\b|participate|team (ready|hai)/.test(s)) {
    const inv = G.outbox.find(m => m.phone === c.phone && m.kind === 'invite');
    const t = inv && G.tournaments.find(x => x.id === inv.tid);
    if (!t) return false;
    const m = metrics(G.players[c.phone] || { phone: c.phone, name: c.name, visits: [] });
    if (t.status !== 'open') { X.botSay(c, `😕 ${t.name} ki saari team slots full ho gayi hain. Next event mein pakka invite karenge!`); return true; }
    registerTeam(t.id, m, inv);
    X.botSay(c, `✅ Team registered for ${t.name}!\n🗓 ${whenText(t)} · ${t.format}\n👥 Team ${t.teams.length}/${t.teamsMax}\n💰 Entry ₹${t.fee}: ${X.upiLink(t.fee, t.id)}\n\nSee you on the turf! 🏆`);
    return true;
  }
  return false;
}

// ───────────────────────────── State, snapshot, routes ─────────────────────────────
function reset() {
  G = { players: seedPlayers(), offers: {}, outbox: [], camps: {}, mseq: 1, tseq: 1, runBookings: 0, tournaments: [],
    rules: RULES().map(r => ({ ...r, stats: { runs: 0, offers: 0, redeemed: 0, revenue: 0 } })),
    autos: AUTOS().map(a => ({ ...a, runs: 0, lastRun: null, next: nextRun(a.sch) })) };
  // A seeded event that already uses tomorrow's dead afternoon slots
  const S = X.S(), t = { id: 'T' + (G.tseq++), name: 'Koramangala 5s Cup', type: 'Tournament', format: '5-a-side knockout', day: 'tomorrow', start: 13, end: 16,
    teamsMax: 8, fee: 2000, prize: '₹10,000 + trophy', segs: ['regular', 'active'], teams: [], invited: [], status: 'open', createdAt: Date.now() - 2 * DAY, seeded: true };
  for (let h = t.start; h < t.end; h++) S.slots.tomorrow[h].booking = { ref: 'TB-' + (S.seq++), channel: 'offline', kind: 'owner', customer: 'Tournament', phone: null, price: 0, net: 0, at: Date.now(), note: `🏆 ${t.name}`, seeded: true, status: 'booked' };
  const regs = allMetrics().filter(m => m.segment === 'regular' && m.phone !== 'sim');
  regs.slice(0, 3).forEach(m => t.teams.push({ captain: m.name, phone: m.phone, at: Date.now() - DAY }));
  t.invited = allMetrics().filter(m => ['regular', 'active'].includes(m.segment) && m.phone !== 'sim').map(m => m.phone);
  G.tournaments.push(t);
  G.camps['evt:' + t.id] = { id: 'evt:' + t.id, name: `${t.name} invites`, icon: 'trophy', sent: t.invited.length, delivered: t.invited.length, read: t.invited.length - 2, replied: 3, booked: 0, joined: 3, revenue: 3 * t.fee };
}
function snapshot() {
  if (!G) return null;
  const ms = allMetrics().sort((a, b) => b.games90 - a.games90);
  const segs = Object.fromEntries(Object.keys(SEG).map(k => [k, ms.filter(m => m.segment === k).length]));
  const repeat = ms.filter(m => m.games90 >= 2).length;
  const camps = Object.values(G.camps);
  const recent = []; for (const m of ms) for (const v of G.players[m.phone].visits) if (v.daysAgo <= 30) recent.push(v);
  const directShare = recent.length ? recent.filter(v => !X.E.ch(v.channel).marketplace).length / recent.length : 0;
  return {
    players: ms, segs, segLabels: SEG,
    kpis: { players: ms.length, repeatRate: ms.length ? repeat / ms.length : 0, directShare, atRisk: segs.at_risk + segs.lapsed, wonBack: segs.won_back,
      sent: camps.reduce((s, c) => s + c.sent, 0), booked: camps.reduce((s, c) => s + c.booked, 0), joined: camps.reduce((s, c) => s + c.joined, 0),
      revenue: camps.reduce((s, c) => s + c.revenue, 0), commLeak: ms.reduce((s, m) => s + m.comm, 0), activeOffers: Object.values(G.offers).filter(o => o.status === 'active' && o.expires > Date.now()).length },
    rules: G.rules.map(r => ({ id: r.id, name: r.name, icon: r.icon, desc: r.desc, segs: r.segs, pct: r.pct, band: r.band, validDays: r.validDays, enabled: r.enabled,
      stats: r.stats, lastRun: r.lastRun || null, audience: ms.filter(m => ruleMatch(r, m) && !activeOffer(m.phone)).length, economics: economics(r) })),
    autos: G.autos.map(a => ({ id: a.id, name: a.name, icon: a.icon, trigger: a.trigger, segs: a.segs, ruleId: a.ruleId, tpl: a.tpl, enabled: a.enabled, runs: a.runs, lastRun: a.lastRun,
      next: a.next, schedule: schedText(a.sch), audience: ms.filter(m => a.segs.includes(m.segment) && !m.optOut).length,
      preview: tpl(a.tpl, ms.find(m => a.segs.includes(m.segment)) || ms[0], a.ruleId ? { pct: G.rules.find(r => r.id === a.ruleId).pct, code: 'CODE' } : null, { slot: '2–3 PM', cmd: 'kal dopahar 2 baje' }),
      stats: G.camps['auto:' + a.id] || null })),
    tournaments: G.tournaments.map(t => ({ ...t, when: whenText(t), invitedCount: t.invited.length, stats: G.camps['evt:' + t.id] || null })),
    outbox: G.outbox.slice(0, 60), camps,
  };
}
function route(url, b) {
  const p = url.replace('/api/growth/', '');
  if (p === 'rule/run') return runRule(b.id);
  if (p === 'rule/toggle') { const r = G.rules.find(x => x.id === b.id); if (r) r.enabled = !!b.on; return { ok: !!r }; }
  if (p === 'rule/create') {
    const id = 'r' + Date.now().toString(36), pct = Math.min(50, Math.max(5, +b.pct || 15));
    G.rules.push({ id, code: 'OFF', name: String(b.name || `${pct}% custom offer`).slice(0, 50), icon: 'tag', desc: `Custom · ${(b.segs || []).map(s => SEG[s]).join(', ')}`,
      segs: b.segs?.length ? b.segs : ['active'], pct, band: b.band === 'offpeak' ? 'offpeak' : 'any', validDays: +b.validDays || 7, tpl: b.segs?.includes('lapsed') ? 'lapsed' : 'winback', enabled: true,
      stats: { runs: 0, offers: 0, redeemed: 0, revenue: 0 } });
    return { ok: true, id };
  }
  if (p === 'auto/run') return runAuto(b.id, true);
  if (p === 'auto/toggle') { const a = G.autos.find(x => x.id === b.id); if (a) { a.enabled = !!b.on; a.next = nextRun(a.sch); } return { ok: !!a }; }
  if (p === 'auto/create') {
    const sch = { type: b.type || 'daily', hour: +b.hour || 18, minute: 0, dow: +b.dow || 5 };
    const a = { id: 'a' + Date.now().toString(36), name: String(b.name || 'Custom nudge').slice(0, 50), icon: 'megaphone', trigger: b.trigger || `Segment: ${(b.segs || []).map(s => SEG[s]).join(', ')}`,
      segs: b.segs?.length ? b.segs : ['active'], ruleId: b.ruleId || null, tpl: b.ruleId ? (G.rules.find(r => r.id === b.ruleId)?.tpl || 'winback') : 'weekend', sch, enabled: true, runs: 0, lastRun: null };
    a.next = nextRun(sch); G.autos.push(a); return { ok: true, id: a.id };
  }
  if (p === 'tournament/create') return createTournament(b);
  if (p === 'tournament/invite') return invite(b.id);
  if (p === 'tournament/remind') return remind(b.id);
  if (p === 'tournament/cancel') return cancelTournament(b.id);
  if (p === 'nudge/player') {
    const m = allMetrics().find(x => x.phone === b.phone); if (!m) return { ok: false, error: 'no player' };
    const r = G.rules.find(x => x.enabled && x.segs.includes(m.segment)) || G.rules[0];
    const o = activeOffer(m.phone) || makeOffer(m.phone, r); r.stats.offers++;
    G.runBookings = 0;
    send(m, camp('manual', 'One-off nudges', 'send'), tpl(r.tpl, m, o, { slot: '2–3 PM', cmd: 'kal dopahar 2 baje' }), 'offer');
    return { ok: true, rule: r.name };
  }
  return { ok: false, error: 'unknown growth route' };
}

module.exports = {
  init(ctx) { X = ctx; setInterval(tick, 15000); },
  reset, snapshot, route, enrich, onBooking, offerFor, handleReply,
};

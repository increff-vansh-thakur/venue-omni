// TurfOS server — booking engine, channel-posting router, MCP endpoint, WhatsApp bot, Sarvam proxy.
// Run:            SARVAM_API_KEY=xxxx node server.js        → http://localhost:3000
// Real WhatsApp:  WHATSAPP=1 SARVAM_API_KEY=xxxx node server.js   (scan the QR with a SPARE number)
const http = require('http');
const fs = require('fs');
const path = require('path');
const E = require('./engine');

const PORT = process.env.PORT || 3000;
const KEY = process.env.SARVAM_API_KEY || '';
const BASE_URL = process.env.SARVAM_BASE || 'https://api.sarvam.ai';
const CHAT_MODEL = process.env.SARVAM_CHAT_MODEL || 'sarvam-105b-conversations';
const STT_MODEL = process.env.SARVAM_STT_MODEL || 'saarika:v2.5';
const TTS_MODEL = process.env.SARVAM_TTS_MODEL || 'bulbul:v3';
const TTS_SPEAKER = process.env.SARVAM_TTS_SPEAKER || 'priya';
const HOLD_SECONDS = +(process.env.HOLD_SECONDS || 300);
const UPI_ID = process.env.UPI_ID || 'kickoffarena@upi';

// ───────────────────────────── State ─────────────────────────────
let S, holdTimers = {};
function freshState() {
  Object.values(holdTimers).forEach(clearTimeout); holdTimers = {};
  S = { slots: {}, postings: [], events: [], chats: {}, seq: 1040, pseq: 1,
        stats: { conflicts: 0, aiFills: 0, postings: 0, mcpCalls: 0 }, wa: S?.wa || { status: 'off' } };
  for (const d of E.DAYS) { S.slots[d] = {}; for (const h of E.HOURS) S.slots[d][h] = E.emptySlot(); }
  // Seed: one booking per source so the grid looks lived-in. Tomorrow 7 PM is left open for the demo.
  const seed = [['today', 7, 'offline', 'Rahul (walk-in)', 'walkin', '+91 98450 11223'], ['today', 19, 'aggA', 'Vikram (Playon)', 'aggregator', '+91 99000 45671'],
                ['today', 20, 'whatsapp', 'Karan', 'whatsapp', 'sim-karan'], ['tomorrow', 20, 'aggB', 'Sneha (Hurdle)', 'aggregator', '+91 97411 80234'],
                ['tomorrow', 21, 'aggC', 'Rohan (Distinct)', 'aggregator', '+91 90080 55412']];
  for (const [d, h, c, who, kind, phone] of seed) {
    const sl = S.slots[d][h], price = E.listed(sl, d, h, c);
    sl.booking = { ref: 'TB-' + (S.seq++), channel: c, kind, customer: who, phone, price, net: E.net(price, c), at: Date.now(), seeded: true, status: 'booked' };
  }
  chatFor('sim', 'Priya', false);
  // Seeded customer chats so the staff inbox has something to work with.
  const t0 = Date.now();
  const karan = chatFor('sim-karan', 'Karan', false);
  karan.msgs.push({ from: 'user', text: 'aaj raat 8 baje turf chahiye', ts: t0 - 3600e3 },
                  { from: 'bot', text: '🎉 Booking confirmed!\n🧾 Ref TB-1042\n🗓 Today 8–9 PM', ts: t0 - 3590e3 },
                  { from: 'user', text: 'Hum 12 log aa rahe hain, extra bibs milenge?', ts: t0 - 900e3 });
  karan.needsHuman = true; karan.unread = 1; karan.lastTs = t0 - 900e3;
  const arjun = chatFor('sim-arjun', 'Arjun', false);
  arjun.msgs.push({ from: 'user', text: 'Parking available hai? Aur shoes rent pe milte hain?', ts: t0 - 420e3 },
                  { from: 'bot', text: 'Namaste Arjun! 👋 Kickoff Arena, Koramangala ⚽\n5-a-side turf book karne ke liye time bhejiye.', ts: t0 - 415e3 });
  arjun.needsHuman = true; arjun.unread = 1; arjun.lastTs = t0 - 420e3;
  event('info', `Inventory loaded · ${E.CHANNELS.map(c => c.name).join(', ')} connected`);
}

function event(kind, text) {
  S.events.unshift({ ts: Date.now(), kind, text });
  S.events.length = Math.min(S.events.length, 150);
  broadcast();
}
const slotName = (d, h) => `${E.dayLabel(d)} ${E.hLabel(h)}`;
const validSlot = (d, h) => E.DAYS.includes(d) && E.HOURS.includes(+h);

// ─────────────────────── Posting router (marketplaces) ───────────────────────
// Every change in sellable inventory is pushed to each marketplace as a posting with ack/retry.
const ENDPOINT = { aggA: 'PUT /playon/v1/slots', aggB: 'PATCH /hurdle/availability', aggC: 'POST /distinct/partner/inventory' };
function post(type, target, d, h, reason, ref, extra = {}) {
  const p = { id: S.pseq++, ts: Date.now(), type, target, day: d, hour: h, reason, ref, status: 'pending', attempt: 1, ms: null, endpoint: ENDPOINT[target], ...extra };
  S.postings.unshift(p); S.postings.length = Math.min(S.postings.length, 200); S.stats.postings++;
  const t0 = Date.now();
  const attempt = () => setTimeout(() => {
    if (p.attempt === 1 && Math.random() < 0.08) { p.status = 'retrying'; p.attempt = 2; broadcast(); return attempt(); }
    p.status = 'acked'; p.ms = Date.now() - t0; broadcast();
  }, 90 + Math.random() * 220 + (p.attempt > 1 ? 400 : 0));
  attempt(); broadcast();
  return p;
}
const blockOthers = (d, h, except, reason, ref) =>
  E.MARKETPLACES.filter(m => m !== except).map(m => post('BLOCK', m, d, h, reason, ref));
const unblockAll = (d, h, reason, ref) =>
  E.MARKETPLACES.filter(m => !S.slots[d][h].closed[m]).map(m => post('UNBLOCK', m, d, h, reason, ref));

// ───────────────────────────── Booking engine ─────────────────────────────
function book({ day, hour, channel, customer, phone, kind, holdRef, note }) {
  hour = +hour;
  if (!validSlot(day, hour) || !E.CH_IDS.includes(channel)) return { ok: false, error: 'invalid slot or channel' };
  const sl = S.slots[day][hour];
  if (sl.booking) {
    S.stats.conflicts++;
    event('err', `409 CONFLICT · ${E.chName(channel)} tried ${slotName(day, hour)} — already sold via ${E.chName(sl.booking.channel)} (${sl.booking.ref}). Double booking prevented.`);
    return { ok: false, error: 'conflict', booked_via: sl.booking.channel };
  }
  if (sl.hold && sl.hold.ref !== holdRef) {
    S.stats.conflicts++;
    event('err', `409 CONFLICT · ${E.chName(channel)} tried ${slotName(day, hour)} — on payment hold for a WhatsApp customer (${sl.hold.ref}).`);
    return { ok: false, error: 'held', held_ref: sl.hold.ref };
  }
  if (sl.closed[channel]) { event('err', `Rejected · ${E.chName(channel)} is closed by the owner for ${slotName(day, hour)}`); return { ok: false, error: 'closed' }; }

  const fromHold = !!(sl.hold && sl.hold.ref === holdRef);
  const isOwnerBlock = kind === 'owner';
  const price = isOwnerBlock ? 0 : fromHold ? sl.hold.price : E.listed(sl, day, hour, channel);
  const ref = fromHold ? sl.hold.ref : 'TB-' + (S.seq++);
  if (fromHold) { clearTimeout(holdTimers[ref]); delete holdTimers[ref]; sl.hold = null; }
  if (!isOwnerBlock && (Object.keys(sl.override).length || Object.keys(sl.reason).length)) S.stats.aiFills++;
  sl.booking = { ref, channel, kind: kind || E.ch(channel).source, customer: customer || 'Guest', phone: phone || null, price, net: E.net(price, channel), at: Date.now(), note: note || '', status: 'booked' };

  const what = isOwnerBlock ? `Owner block (${note || 'blocked'})` : `${E.chName(channel)} booking ${ref} · ${customer || 'Guest'} · ₹${price}`;
  event('ok', `● ${what} · ${slotName(day, hour)}`);
  if (fromHold) event('info', `  Aggregators were already blocked during the payment hold — no new postings needed`);
  else {
    if (E.ch(channel).marketplace) post('CONFIRM', channel, day, hour, 'booking accepted', ref);
    blockOthers(day, hour, channel, isOwnerBlock ? 'owner block' : `booked via ${E.chName(channel)}`, ref);
  }
  return { ok: true, booking: { ...sl.booking, day, hour, slot: slotName(day, hour) } };
}

function cancel({ day, hour, ref }) {
  if (ref) { const f = findBooking(b => b.ref === ref); if (!f) return { ok: false, error: 'not found' }; day = f.day; hour = f.hour; }
  hour = +hour; if (!validSlot(day, hour)) return { ok: false, error: 'invalid slot' };
  const sl = S.slots[day][hour], b = sl.booking; if (!b) return { ok: false, error: 'not booked' };
  sl.booking = null;
  event('info', `↺ Cancelled ${b.ref} (${E.chName(b.channel)}) · ${slotName(day, hour)} — reopening on marketplaces`);
  unblockAll(day, hour, 'cancellation', b.ref);
  return { ok: true, ref: b.ref };
}

// Front desk: check-in / no-show / undo.
const STATUS = { booked: 'Booked', arrived: 'Checked in', no_show: 'No-show' };
function setStatus({ day, hour, status }) {
  hour = +hour; if (!validSlot(day, hour) || !STATUS[status]) return { ok: false, error: 'invalid' };
  const b = S.slots[day][hour].booking; if (!b) return { ok: false, error: 'not booked' };
  b.status = status; b.statusAt = Date.now();
  event(status === 'no_show' ? 'warn' : 'ok', `${status === 'arrived' ? '✓' : status === 'no_show' ? '✗' : '↺'} Front desk: ${b.customer} (${b.ref}) · ${slotName(day, hour)} → ${STATUS[status]}`);
  return { ok: true };
}

function hold({ day, hour, customer, phone }) {
  hour = +hour; if (!validSlot(day, hour)) return { ok: false, error: 'invalid slot' };
  const sl = S.slots[day][hour];
  if (sl.booking || sl.hold) return { ok: false, error: sl.booking ? 'booked' : 'held' };
  if (sl.closed.whatsapp) return { ok: false, error: 'closed' };
  if (E.isPast(day, hour)) return { ok: false, error: 'past' };
  const ref = 'TB-' + (S.seq++), price = E.listed(sl, day, hour, 'whatsapp');
  sl.hold = { ref, customer, phone, price, expires: Date.now() + HOLD_SECONDS * 1000 };
  event('warn', `◐ Payment hold ${ref} · WhatsApp · ${customer} · ${slotName(day, hour)} · ₹${price} · ${HOLD_SECONDS / 60} min`);
  blockOthers(day, hour, null, 'WhatsApp payment hold', ref);
  holdTimers[ref] = setTimeout(() => expireHold(day, hour, ref), HOLD_SECONDS * 1000);
  return { ok: true, ref, price, expires_in_seconds: HOLD_SECONDS, upi: upiLink(price, ref) };
}
function expireHold(day, hour, ref, why = 'expired') {
  const sl = S.slots[day][hour]; if (!sl.hold || sl.hold.ref !== ref) return;
  const { phone } = sl.hold; sl.hold = null; clearTimeout(holdTimers[ref]); delete holdTimers[ref];
  event('warn', `◌ Hold ${ref} ${why} · ${slotName(day, hour)} released`);
  unblockAll(day, hour, `hold ${why}`, ref);
  const c = S.chats[phone]; if (!c) return;
  c.ctx = {};
  if (why === 'expired') botSay(c, `⏳ Aapka hold (${ref}) expire ho gaya, slot release kar diya. Dobara book karne ke liye time bhejiye.`);
  else if (why === 'cancelled') botSay(c, `❎ Hold ${ref} (${slotName(day, hour)}) cancel kar diya. Koi charge nahi.`);
}
const upiLink = (price, ref) => `upi://pay?pa=${UPI_ID}&pn=Kickoff%20Arena&am=${price}&tn=${ref}`;
function findBooking(pred) {
  for (const d of E.DAYS) for (const h of E.HOURS) { const b = S.slots[d][h].booking; if (b && pred(b)) return { day: d, hour: h, booking: b }; }
  return null;
}
function findHold(pred) {
  for (const d of E.DAYS) for (const h of E.HOURS) { const x = S.slots[d][h].hold; if (x && pred(x)) return { day: d, hour: h, hold: x }; }
  return null;
}

// Owner actions (from the command console) and AI price changes, with guardrails.
function applyOwnerActions(actions) {
  const done = [], rejected = [];
  for (const a of actions || []) {
    const d = a.day; if (!E.DAYS.includes(d)) { rejected.push('bad day'); continue; }
    let s = Math.max(6, +a.start_hour), e = Math.min(23, +a.end_hour || s + 1); if (e <= s) e = s + 1;
    if (!isFinite(s)) { rejected.push('bad hours'); continue; }
    const chs = (a.channels || ['all']).includes('all') ? E.CH_IDS : (a.channels || []).filter(c => E.CH_IDS.includes(c));
    if (!chs.length) { rejected.push('no channel'); continue; }
    let count = 0;
    for (let h = s; h < e; h++) {
      const sl = S.slots[d][h]; if (!sl) continue;
      if (a.type === 'book') {
        if (book({ day: d, hour: h, channel: chs[0], customer: a.customer || 'Owner entry', kind: E.ch(chs[0]).source }).ok) count++;
        continue;
      }
      if (sl.booking && a.type !== 'unblock') { rejected.push(`${slotName(d, h)} already booked — skipped`); continue; }
      for (const c of chs) {
        const mk = E.ch(c).marketplace;
        if (a.type === 'block' && !sl.closed[c]) { sl.closed[c] = true; count++; if (mk && !sl.hold) post('BLOCK', c, d, h, 'closed by owner'); }
        else if (a.type === 'unblock' && sl.closed[c]) { delete sl.closed[c]; count++; if (mk && !sl.booking && !sl.hold) post('UNBLOCK', c, d, h, 'reopened by owner'); }
        else if (a.type === 'set_discount') { sl.disc[c] = Math.min(50, Math.max(0, +a.value || 0)); count++; if (mk) post('PRICE', c, d, h, `${sl.disc[c]}% discount`, null, { price: E.listed(sl, d, h, c) }); }
        else if (a.type === 'set_price') {
          if (+a.value > E.CEIL || E.net(+a.value, c) < E.NET_FLOOR) { rejected.push(`₹${a.value} on ${E.chName(c)} breaks floor/ceiling`); continue; }
          sl.override[c] = E.clamp(+a.value, c); delete sl.disc[c]; count++; if (mk) post('PRICE', c, d, h, 'owner price', null, { price: E.listed(sl, d, h, c) });
        }
        else if (a.type === 'clear') { delete sl.disc[c]; delete sl.override[c]; delete sl.reason[c]; count++; if (mk) post('PRICE', c, d, h, 'price reset', null, { price: E.listed(sl, d, h, c) }); }
      }
    }
    const desc = `${a.type}${a.value ? ` (${a.value}${a.type === 'set_discount' ? '%' : ''})` : ''} · ${E.dayLabel(d)} ${s}:00–${e}:00 · ${chs.map(E.chName).join(', ')}`;
    event('ai', `› Owner command → ${desc} [${count} changes]`);
    done.push(desc);
  }
  rejected.forEach(r => event('err', `✖ Guardrail: ${r}`));
  broadcast();
  return { done, rejected };
}

function applyPricing(changes, source) {
  const applied = [], rejected = [];
  for (const x of (changes || []).slice(0, 12)) {
    const d = x.day, h = +x.hour, c = x.channel, sl = S.slots[d]?.[h];
    if (!sl || !E.CH_IDS.includes(c) || sl.booking || sl.hold || sl.closed[c] || !isFinite(+x.new_price)) { rejected.push(x); continue; }
    const old = E.listed(sl, d, h, c), rp = E.rulePrice(d, h);
    sl.override[c] = E.clamp(Math.min(rp * (1 + E.AI_BAND), Math.max(rp * (1 - E.AI_BAND), +x.new_price)), c);
    delete sl.disc[c]; sl.reason[c] = String(x.reason || 'AI adjusted').slice(0, 120);
    const nw = E.listed(sl, d, h, c);
    applied.push({ day: d, hour: h, channel: c, old, new: nw, reason: sl.reason[c] });
    event('ai', `✦ ${source}: ${slotName(d, h)} ${E.chName(c)} ₹${old}→₹${nw} — ${sl.reason[c]}`);
    if (E.ch(c).marketplace) post('PRICE', c, d, h, 'AI repricing', null, { price: nw });
  }
  broadcast();
  return { applied, rejected: rejected.length };
}

// ───────────────────────────── MCP tools ─────────────────────────────
// The WhatsApp bot books ONLY through these tools; any MCP client (e.g. Claude) can use them too.
const DAY = { type: 'string', enum: ['today', 'tomorrow'] };
const HOUR = { type: 'integer', minimum: 6, maximum: 22, description: 'Slot start hour, 24h (19 = 7–8 PM)' };
const TOOLS = [
  { name: 'check_availability', description: 'List free/booked slots for a day with WhatsApp (direct) prices. Optionally a single hour.',
    inputSchema: { type: 'object', properties: { day: DAY, hour: HOUR }, required: ['day'] },
    run: ({ day, hour }) => {
      if (!E.DAYS.includes(day)) return { error: 'invalid day' };
      const hrs = hour != null ? [+hour] : E.HOURS;
      return { day, slots: hrs.filter(h => E.HOURS.includes(h)).map(h => { const sl = S.slots[day][h];
        const status = sl.booking ? 'booked' : sl.hold ? 'on_hold' : sl.closed.whatsapp ? 'closed' : E.isPast(day, h) ? 'past' : 'free';
        return { hour: h, label: E.hLabel(h), band: E.band(h).label, status,
                 whatsapp_price: status === 'free' ? E.listed(sl, day, h, 'whatsapp') : null,
                 aggregator_a_price: status === 'free' ? E.listed(sl, day, h, 'aggA') : null }; }) };
    } },
  { name: 'hold_slot', description: `Hold a slot for a WhatsApp customer for ${HOLD_SECONDS / 60} min while they pay. Blocks it on all marketplaces.`,
    inputSchema: { type: 'object', properties: { day: DAY, hour: HOUR, customer: { type: 'string' }, phone: { type: 'string' } }, required: ['day', 'hour', 'customer'] },
    run: a => hold(a) },
  { name: 'confirm_booking', description: 'Confirm a held slot after payment. Returns the booking.',
    inputSchema: { type: 'object', properties: { ref: { type: 'string' } }, required: ['ref'] },
    run: ({ ref }) => { const f = findHold(x => x.ref === ref); if (!f) return { ok: false, error: 'hold not found or expired' };
      return book({ day: f.day, hour: f.hour, channel: 'whatsapp', customer: f.hold.customer, phone: f.hold.phone, kind: 'whatsapp', holdRef: ref }); } },
  { name: 'book_slot', description: 'Record a booking from any channel (aggregator webhook, offline walk-in/phone, owner block). Blocks the slot on all other marketplaces.',
    inputSchema: { type: 'object', properties: { day: DAY, hour: HOUR, channel: { type: 'string', enum: E.CH_IDS }, customer: { type: 'string' }, phone: { type: 'string' },
      kind: { type: 'string', enum: ['aggregator', 'whatsapp', 'walkin', 'phone', 'owner'] }, note: { type: 'string' } }, required: ['day', 'hour', 'channel'] },
    run: a => book(a) },
  { name: 'cancel_booking', description: 'Cancel a booking by ref (or day+hour). Reopens the slot on marketplaces.',
    inputSchema: { type: 'object', properties: { ref: { type: 'string' }, day: DAY, hour: HOUR } },
    run: a => cancel(a) },
  { name: 'list_postings', description: 'Recent block/unblock/price postings sent to marketplaces, with ack status.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer', default: 20 } } },
    run: ({ limit = 20 }) => ({ postings: S.postings.slice(0, limit).map(({ id, type, target, day, hour, reason, ref, status, ms }) => ({ id, type, target, slot: slotName(day, hour), reason, ref, status, ms })) }) },
];
function callTool(name, args, via) {
  const t = TOOLS.find(x => x.name === name); if (!t) return { error: `unknown tool ${name}` };
  S.stats.mcpCalls++;
  event('mcp', `⌁ MCP tools/call ${name}(${JSON.stringify(args)}) ← ${via}`);
  const res = t.run(args || {});
  if (res && (res.ok === false || res.error)) event('err', `  ↳ ${name} → ${res.error}`);
  return res;
}
function handleMcp(msg) {
  const { id, method, params } = msg;
  const ok = result => ({ jsonrpc: '2.0', id, result });
  if (method === 'initialize') return ok({ protocolVersion: params?.protocolVersion || '2025-06-18', capabilities: { tools: {} },
    serverInfo: { name: 'turfos-venue', version: '1.0.0' }, instructions: 'Booking tools for Kickoff Arena (5-a-side turf, Bengaluru). Days: today/tomorrow; hours 6–22 (24h).' });
  if (method === 'ping') return ok({});
  if (method === 'tools/list') return ok({ tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
  if (method === 'tools/call') {
    const res = callTool(params?.name, params?.arguments, 'external MCP client');
    return ok({ content: [{ type: 'text', text: JSON.stringify(res, null, 2) }], isError: !!(res?.error) });
  }
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
}

// ───────────────────────────── WhatsApp bot ─────────────────────────────
// Shared by the simulated phone in the dashboard and the real linked WhatsApp number.
let waSend = null; // set by whatsapp.js when a real number is linked
function chatFor(phone, name, real) {
  if (!S.chats[phone]) S.chats[phone] = { phone, name: name || 'Customer', real: !!real, msgs: [], ctx: {}, typing: false,
    needsHuman: false, human: false, unread: 0, lastTs: Date.now() };
  return S.chats[phone];
}
// Staff replying by hand from the inbox. Goes out on real WhatsApp when the chat is live.
function staffSay(c, text) {
  c.msgs.push({ from: 'staff', text, ts: Date.now() }); c.needsHuman = false; c.unread = 0; c.lastTs = Date.now();
  event('info', `🧑‍💼 Staff replied to ${c.name}: "${text.slice(0, 60)}"`);
  if (c.real && waSend) waSend(c.phone, text).catch(e => console.error('[wa] send', e.message));
}
function botSay(c, text, buttons) {
  c.msgs.push({ from: 'bot', text, buttons, ts: Date.now() }); c.typing = false; c.lastTs = Date.now(); broadcast();
  if (c.real && waSend) waSend(c.phone, text + (buttons?.length ? '\n\n' + buttons.map(b => `• ${b.hint || b.label}`).join('\n') : '')).catch(e => console.error('[wa] send', e.message));
}

const BOT_SYSTEM = `You parse WhatsApp messages sent to the booking bot of a 5-a-side football turf in Bengaluru (Hindi, Hinglish or English).
Return ONLY JSON: {"intent":"book|choose|confirm|cancel|greet|other","day":"today"|"tomorrow"|null,"hour":<6-22>|null,"choice":<1-3>|null}
Rules: "kal" = tomorrow, "aaj" = today. shaam/raat/evening/night/pm = PM; subah/morning/am = AM; a bare hour 1-11 means PM. "7 baje" = 19.
intent=confirm when the user says they paid or agrees (paid, done, haan, yes, ok, confirm, ho gaya). intent=choose when they reply with an option number.
intent=book when they ask for a slot or availability (even without a time). intent=cancel when they want to cancel.`;

function regexParse(text, ctx) {
  const s = text.toLowerCase().trim();
  if (ctx.stage === 'offer' && /^\s*[1-3]\s*$/.test(s)) return { intent: 'choose', choice: +s };
  if (/cancel|radd|nahi chahiye/.test(s)) return { intent: 'cancel' };
  if (ctx.stage === 'awaiting_payment' && /paid|pay|done|haan|ha\b|yes|ok|confirm|ho gaya|kar diya/.test(s)) return { intent: 'confirm' };
  const day = /kal|tomorrow|कल/.test(s) ? 'tomorrow' : /aaj|today|आज|tonight/.test(s) ? 'today' : null;
  const am = /subah|morning|\bam\b|सुबह/.test(s);
  const m = s.match(/(\d{1,2})(?=\s*(?:baje|bje|बजे|am|pm|o'?clock|:00|\s|$))/);
  let hour = m ? +m[1] : null; if (hour != null && !am && hour >= 1 && hour <= 11) hour += 12;
  if (hour != null && !E.HOURS.includes(hour)) hour = null;
  if (day || hour != null || /slot|book|turf|ground|khel|available|free|chahiye/.test(s)) return { intent: 'book', day, hour };
  if (/^(hi|hello|hey|namaste|hii+)/.test(s)) return { intent: 'greet' };
  return { intent: 'other' };
}
async function parseIntent(text, ctx) {
  const quick = regexParse(text, ctx);
  if (quick.intent === 'choose' || quick.intent === 'confirm') return { ...quick, via: 'rules' };
  if (!KEY) return { ...quick, via: 'rules' };
  try {
    const stage = ctx.stage === 'offer' ? `options offered (${ctx.offer.length})` : ctx.stage === 'awaiting_payment' ? 'waiting for payment' : 'new request';
    const out = await sarvamChat(BOT_SYSTEM, `Conversation stage: ${stage}\nMessage: ${text}`, 6000);
    const j = extractJSON(out);
    if (!j.intent) throw new Error('no intent');
    if (j.hour != null && !E.HOURS.includes(+j.hour)) j.hour = null;
    // Cross-check: if the LLM shrugs but the rules clearly found a slot request or cancel, trust the rules.
    if (['other', 'greet'].includes(j.intent) && ['book', 'cancel'].includes(quick.intent)) return { ...quick, via: 'rules (LLM unsure)' };
    // Intents must fit the conversation stage
    if (j.intent === 'choose' && ctx.stage !== 'offer') j.intent = (j.day || j.hour != null || quick.intent === 'book') ? 'book' : quick.intent;
    if (j.intent === 'confirm' && ctx.stage !== 'awaiting_payment') j.intent = quick.intent === 'confirm' ? 'other' : quick.intent;
    if (j.intent === 'book') { j.day = j.day || quick.day; if (j.hour == null) j.hour = quick.hour; }
    return { ...j, via: 'Sarvam AI' };
  } catch (e) { return { ...quick, via: 'rules' }; }
}

const fmtOpt = (o, i) => `${['1️⃣', '2️⃣', '3️⃣'][i]} ${E.dayLabel(o.day)} ${E.hLabel(o.hour)} · ₹${o.price}`;
function freeOptions(day, around) {
  const r = callTool('check_availability', { day }, 'WhatsApp bot');
  let free = r.slots.filter(s => s.status === 'free');
  if (around != null) free.sort((a, b) => Math.abs(a.hour - around) - Math.abs(b.hour - around));
  else free.sort((a, b) => (b.band === 'Peak') - (a.band === 'Peak') || a.hour - b.hour);
  return free.slice(0, 3).map(s => ({ day, hour: s.hour, price: s.whatsapp_price }));
}
function offerAndHold(c, day, hour) {
  const h = callTool('hold_slot', { day, hour, customer: c.name, phone: c.phone }, 'WhatsApp bot');
  if (!h.ok) return false;
  const agg = callTool('check_availability', { day, hour }, 'WhatsApp bot').slots[0];
  c.ctx = { stage: 'awaiting_payment', ref: h.ref, day, hour };
  const aggPrice = E.listed(S.slots[day][hour], day, hour, 'aggA');
  const saving = aggPrice > h.price ? `\n💚 Apps par ₹${aggPrice} — WhatsApp par ₹${aggPrice - h.price} kam!` : '\n💚 Direct booking — koi convenience fee nahi';
  botSay(c, `✅ ${E.dayLabel(day)} ${E.hLabel(hour)} available hai!\n💰 ₹${h.price}${saving}\n⏳ Slot ${HOLD_SECONDS / 60} min ke liye hold kar diya (${h.ref}).\n\nUPI se pay karein:\n${h.upi}\n\nPayment ke baad "paid" bhejiye.`,
    [{ label: `Pay ₹${h.price} via UPI`, send: 'paid', hint: 'Reply "paid" after paying' }]);
  return true;
}

// Messages from one chat are handled strictly in order (a fast "paid" must wait for the previous reply).
const chatQueues = {};
function botHandle(phone, name, text, real) {
  const run = () => botHandleOne(phone, name, text, real).catch(e => console.error('[bot]', e));
  chatQueues[phone] = (chatQueues[phone] || Promise.resolve()).then(run, run);
  return chatQueues[phone];
}
async function botHandleOne(phone, name, text, real) {
  const c = chatFor(phone, name, real);
  if (name && c.name !== name) c.name = name;
  c.msgs.push({ from: 'user', text, ts: Date.now() }); c.unread = (c.unread || 0) + 1; c.lastTs = Date.now();
  if (c.human) {   // staff took over this chat: the bot stays quiet
    c.needsHuman = true; event('warn', `💬 WhatsApp ${c.name}: "${text}" → waiting for staff (bot paused)`); return;
  }
  c.typing = true; broadcast();
  const p = await parseIntent(text, c.ctx);
  if (p.intent === 'other') c.needsHuman = true;   // bot can't answer this one: flag for the front desk
  event('info', `💬 WhatsApp ${c.name}: "${text}" → ${p.intent}${p.day ? ' ' + p.day : ''}${p.hour != null ? ' ' + p.hour + ':00' : ''} (${p.via})`);

  if (p.intent === 'confirm' && c.ctx.stage === 'awaiting_payment') {
    const r = callTool('confirm_booking', { ref: c.ctx.ref }, 'WhatsApp bot');
    if (!r.ok) { c.ctx = {}; return botSay(c, `😕 Hold expire ho gaya ya slot available nahi hai. Naya time bhejiye.`); }
    c.ctx = { stage: 'booked', ref: r.booking.ref };
    return botSay(c, `🎉 Booking confirmed!\n🧾 Ref ${r.booking.ref}\n📍 Kickoff Arena, Koramangala\n🗓 ${r.booking.slot}\n💰 ₹${r.booking.price} paid\n\nAggregator apps par slot block kar diya gaya hai. See you on the turf! ⚽\n(Cancel karne ke liye "cancel" bhejiye)`);
  }
  if (p.intent === 'choose' && c.ctx.stage === 'offer') {
    const o = c.ctx.offer?.[p.choice - 1];
    if (o && offerAndHold(c, o.day, o.hour)) return;
    return botSay(c, `Ye option ab available nahi hai. Naya time bhejiye, jaise "kal shaam 7 baje".`);
  }
  if (p.intent === 'cancel') {
    const hh = findHold(x => x.phone === phone);                 // a pending hold is the most recent intent
    if (hh) { expireHold(hh.day, hh.hour, hh.hold.ref, 'cancelled'); return; }
    const f = c.ctx.ref ? findBooking(b => b.ref === c.ctx.ref) || findBooking(b => b.phone === phone) : findBooking(b => b.phone === phone);
    if (f) { callTool('cancel_booking', { ref: f.booking.ref }, 'WhatsApp bot'); c.ctx = {}; return botSay(c, `❎ Booking ${f.booking.ref} (${slotName(f.day, f.hour)}) cancel ho gaya. Refund 24 ghante mein.`); }
    return botSay(c, `Aapki koi active booking nahi mili.`);
  }
  if (p.intent === 'book') {
    // Release any earlier hold from this customer before taking a new one
    const prev = findHold(x => x.phone === phone); if (prev) expireHold(prev.day, prev.hour, prev.hold.ref, 'released');
    const day = p.day || 'today';
    if (p.hour != null) {
      if (offerAndHold(c, day, +p.hour)) return;
      const opts = freeOptions(day, +p.hour);
      if (!opts.length) return botSay(c, `😕 ${E.dayLabel(day)} saare slots full hain. Kal try karein?`);
      c.ctx = { stage: 'offer', offer: opts };
      return botSay(c, `❌ ${E.dayLabel(day)} ${E.hLabel(+p.hour)} available nahi hai. Ye slots free hain:\n\n${opts.map(fmtOpt).join('\n')}\n\nNumber bhejiye (1/2/3).`,
        opts.map((o, i) => ({ label: `${i + 1} · ${E.hLabel(o.hour)}`, send: String(i + 1) })));
    }
    const opts = freeOptions(day, null);
    if (!opts.length) return botSay(c, `😕 ${E.dayLabel(day)} saare slots full hain.`);
    c.ctx = { stage: 'offer', offer: opts };
    return botSay(c, `${E.dayLabel(day)} ke best slots:\n\n${opts.map(fmtOpt).join('\n')}\n\nNumber bhejiye (1/2/3), ya apna time likhiye.`,
      opts.map((o, i) => ({ label: `${i + 1} · ${E.hLabel(o.hour)}`, send: String(i + 1) })));
  }
  return botSay(c, `Namaste ${c.name}! 👋 Kickoff Arena, Koramangala ⚽\n5-a-side turf book karne ke liye time bhejiye, jaise:\n• "kal shaam 7 baje"\n• "aaj raat 9pm"\n\nWhatsApp booking = best price, no app fees 💚`);
}

// ───────────────────────────── Sarvam helpers ─────────────────────────────
async function sarvam(pathname, init, timeout = 20000) {
  const t0 = Date.now();
  const r = await fetch(BASE_URL + pathname, { ...init, headers: { 'api-subscription-key': KEY, ...(init.headers || {}) }, signal: AbortSignal.timeout(timeout) });
  const text = await r.text();
  console.log(`[sarvam] ${pathname} → ${r.status} in ${Date.now() - t0}ms`);
  if (!r.ok) throw new Error(`Sarvam ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}
async function sarvamChat(system, user, timeout) {
  const data = await sarvam('/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: CHAT_MODEL, temperature: 0.2, max_tokens: 1500, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) }, timeout);
  return data.choices?.[0]?.message?.content || '';
}
function extractJSON(text) {
  text = String(text).replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json|```/g, '');
  const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b < a) throw new Error('no JSON');
  return JSON.parse(text.slice(a, b + 1));
}

// ───────────────────────────── Live updates (SSE) ─────────────────────────────
const clients = new Set(); let pending = false;
const snapshot = () => ({ slots: S.slots, postings: S.postings.slice(0, 80), events: S.events.slice(0, 100), stats: S.stats,
  chats: Object.values(S.chats).map(c => ({ phone: c.phone, name: c.name, real: c.real, typing: c.typing, msgs: c.msgs.slice(-40),
    needsHuman: !!c.needsHuman, human: !!c.human, unread: c.unread || 0, lastTs: c.lastTs || 0 })),
  wa: S.wa, ai: !!KEY, model: CHAT_MODEL, now: Date.now() });
function broadcast() {
  if (pending) return; pending = true;
  setTimeout(() => { pending = false; const data = `data: ${JSON.stringify(snapshot())}\n\n`; for (const res of clients) res.write(data); }, 40);
}

// ───────────────────────────── HTTP ─────────────────────────────
const readBody = req => new Promise((res, rej) => { const ch = []; req.on('data', c => ch.push(c)); req.on('end', () => res(Buffer.concat(ch))); req.on('error', rej); });
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const STATIC = { '/': ['index.html', 'text/html; charset=utf-8'], '/index.html': ['index.html', 'text/html; charset=utf-8'], '/engine.js': ['engine.js', 'text/javascript'] };

http.createServer(async (req, res) => {
  try {
    const url = req.url.split('?')[0];
    if (req.method === 'GET' && STATIC[url]) { res.writeHead(200, { 'Content-Type': STATIC[url][1] }); return fs.createReadStream(path.join(__dirname, STATIC[url][0])).pipe(res); }
    if (url === '/api/health') return send(res, 200, { hasKey: !!KEY, chatModel: CHAT_MODEL, wa: S.wa });
    if (url === '/api/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      res.write(`data: ${JSON.stringify(snapshot())}\n\n`); clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    // MCP (Streamable HTTP, JSON responses)
    if (url === '/mcp') {
      if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); return res.end(); }
      const msg = JSON.parse((await readBody(req)).toString() || '{}');
      if (Array.isArray(msg)) return send(res, 200, msg.filter(m => m.id !== undefined).map(handleMcp));
      if (msg.id === undefined) { res.writeHead(202); return res.end(); } // notification
      return send(res, 200, handleMcp(msg));
    }
    if (req.method !== 'POST') return send(res, 404, { error: 'not found' });
    const body = url.startsWith('/api/stt') ? null : JSON.parse((await readBody(req)).toString() || '{}');

    // Booking channels
    if (url === '/api/book') return send(res, 200, book(body));                       // aggregator webhook / offline entry
    if (url === '/api/cancel') return send(res, 200, cancel(body));
    if (url === '/api/booking/status') return send(res, 200, setStatus(body));
    if (url === '/api/wa/reply') { const c = S.chats[body.phone]; if (!c || !String(body.text || '').trim()) return send(res, 400, { error: 'no chat' });
      staffSay(c, String(body.text).slice(0, 1000)); broadcast(); return send(res, 200, { ok: true }); }
    if (url === '/api/wa/takeover') { const c = S.chats[body.phone]; if (!c) return send(res, 400, { error: 'no chat' });
      c.human = !!body.on; event('info', `${c.human ? '🧑‍💼 Staff took over' : '🤖 Bot resumed'} chat with ${c.name}`); return send(res, 200, { ok: true }); }
    if (url === '/api/wa/read') { const c = S.chats[body.phone]; if (c) { c.unread = 0; broadcast(); } return send(res, 200, { ok: true }); }
    if (url === '/api/wa/resolve') { const c = S.chats[body.phone]; if (c) { c.needsHuman = false; c.unread = 0; broadcast(); } return send(res, 200, { ok: true }); }
    if (url === '/api/owner/actions') return send(res, 200, applyOwnerActions(body.actions));
    if (url === '/api/pricing/apply') return send(res, 200, applyPricing(body.changes, body.source || 'AI'));
    if (url === '/api/reset') { freshState(); return send(res, 200, { ok: true }); }
    if (url === '/api/wa/sim') { botHandle('sim', body.name || 'Priya', String(body.text || '').slice(0, 500), false).catch(e => console.error(e)); return send(res, 200, { ok: true }); }
    if (url === '/api/wa/reset-sim') { delete S.chats.sim; chatFor('sim', body.name || 'Priya', false); broadcast(); return send(res, 200, { ok: true }); }

    // Sarvam proxy
    if (!KEY && url.startsWith('/api/')) return send(res, 503, { error: 'SARVAM_API_KEY not set' });
    if (url === '/api/chat') return send(res, 200, { content: await sarvamChat(body.system, body.user) });
    if (url === '/api/tts') {
      const data = await sarvam('/text-to-speech', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body.text, target_language_code: 'hi-IN', speaker: TTS_SPEAKER, model: TTS_MODEL }) });
      return send(res, 200, { audio: data.audios?.[0] || null });
    }
    if (url === '/api/stt') {
      const audio = await readBody(req), fd = new FormData();
      fd.append('file', new Blob([audio], { type: req.headers['content-type'] || 'audio/webm' }), 'command.webm');
      fd.append('model', STT_MODEL); fd.append('language_code', 'hi-IN');
      const data = await sarvam('/speech-to-text', { method: 'POST', body: fd });
      return send(res, 200, { transcript: data.transcript || '' });
    }
    send(res, 404, { error: 'not found' });
  } catch (e) { console.error(e.message); send(res, 502, { error: e.message }); }
}).listen(PORT, () => {
  console.log(`TurfOS → http://localhost:${PORT}   MCP → http://localhost:${PORT}/mcp   (Sarvam key: ${KEY ? 'set' : 'MISSING – fallbacks only'})`);
});

freshState();

// Optional: real WhatsApp number (layer 2)
if (process.env.WHATSAPP === '1') {
  try {
    require('./whatsapp').start({
      onStatus: wa => { S.wa = wa; event(wa.status === 'linked' ? 'ok' : 'info', `WhatsApp: ${wa.status}${wa.number ? ' · +' + wa.number : ''}`); },
      onMessage: (jid, name, text) => botHandle(jid, name, text, true),
      setSender: fn => { waSend = fn; },
    });
  } catch (e) { console.error('[wa] could not start:', e.message, '\nRun: npm install   (in ~/venue-omni)'); }
}

// VenueBuddy · front-desk (staff) view: Desk (S1 Next up), Calendar (S2 Day sheet), WhatsApp (S3 Desk and inbox)
// Markup for #staffView lives here so each view owns its own HTML.
document.getElementById('staffView').innerHTML = `
  <section class="desk" data-panel="desk">
    <div class="topline">
      <div class="sub" id="dkLine"></div>
      <div class="hstack"><button class="btn tall" id="qPhone">+ Phone booking</button><button class="btn primary tall" id="qWalk">+ Walk-in</button></div>
    </div>
    <div class="grid">
      <section class="card span-12 hero" id="dkNext" aria-live="polite"></section>
      <section class="card span-8"><div class="card-h">Rest of today <span class="label" id="dkRestN"></span></div><div id="dkRest"></div></section>
      <div class="span-4 stack">
        <section class="card"><div class="card-h" id="dkFreeH">Free tonight</div><div id="dkFree"></div></section>
        <div class="note wa-note" id="dkWa"></div>
      </div>
    </div>
  </section>

  <section class="cal" data-panel="calendar">
    <div class="topline">
      <div class="seg" id="calDay" role="tablist" aria-label="Day"><button data-d="today">Today</button><button data-d="tomorrow">Tomorrow</button></div>
      <div class="sub" id="calSum"></div>
    </div>
    <div class="grid">
      <section class="card span-8 daysheet" id="cal"></section>
      <aside class="span-4 rail">
        <section class="card" id="calNow"></section>
        <section class="card" id="calWa"></section>
      </aside>
    </div>
  </section>

  <section class="wa" data-panel="whatsapp">
    <div class="grid">
      <section class="card span-3 inbox-col">
        <div class="seg full" id="inboxTabs"><button data-t="need">Needs reply</button><button data-t="all">All chats</button></div>
        <div id="inbox"></div>
      </section>
      <section class="card span-5 thread-col" id="threadWrap">
        <div class="thead" id="thead"></div>
        <div class="thread" id="thread"></div>
        <div class="canned" id="canned"></div>
        <form class="reply" id="replyForm">
          <input id="replyInput" autocomplete="off" placeholder="Reply as front desk">
          <button type="submit" class="btn primary">Send</button>
        </form>
      </section>
      <section class="card span-5 thread-col thread-empty" id="threadNone" hidden><div class="empty">Pick a chat on the left to read and reply.</div></section>
      <section class="card span-4">
        <div class="card-h">Today <span class="label" id="waTodayN"></span><span class="spacer"></span><button class="btn sm" id="waWalk">+ Walk-in</button></div>
        <div id="waToday"></div>
      </section>
    </div>
  </section>
`;

// ───────── Shared helpers ─────────
const DOT = '<span class="dot" aria-hidden="true"></span>';
const mm = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const holdLeft = hd => Math.max(0, Math.round((hd.expires - Date.now()) / 1000));
const chMark = c => `<span class="mark" style="background:var(--c-${c})"></span>`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const initial = n => esc((String(n || '?').trim()[0] || '?').toUpperCase());
const shortDate = d => E.dayDate(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
const hm = ts => new Date(ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toUpperCase();

function bookingsOf(d) {
  return E.HOURS.map(h => ({ d, h, b: S.slots[d][h].booking })).filter(x => x.b && x.b.kind !== 'owner');
}
const todaysBookings = () => bookingsOf('today');
// Next group to arrive today: the earliest booking still waiting for check-in whose slot has not ended.
const nextArrival = () => todaysBookings().find(x => (x.b.status || 'booked') === 'booked' && x.h + 1 > nowFrac());
const needReply = () => S.chats.filter(c => c.needsHuman);
function stChip(b, d, h) {
  const st = b.status || 'booked';
  if (st === 'arrived') return '<span class="chip ok">' + I.check + 'Checked in</span>';
  if (st === 'no_show') return '<span class="chip alert">No-show</span>';
  if (isLive(d, h)) return '<span class="chip now">Due now</span>';
  if (isPast(d, h)) return '<span class="chip warn">Not checked in</span>';
  return '<span class="chip">Booked</span>';
}
const holdChip = hd => `<span class="chip warn" data-hold>${I.clock}On hold ${mm(holdLeft(hd))}</span>`;
const freeOffline = (d, h) => { const s = S.slots[d][h]; return !s.booking && !s.hold && !s.closed.offline && !E.isOver(d, h); };
// Walk-ins default to today; once today has no free hour left, the sheet opens on tomorrow instead.
const walkDay = () => E.HOURS.some(h => freeOffline('today', h)) ? 'today' : 'tomorrow';
const bookingFor = phone => { for (const d of E.DAYS) for (const h of E.HOURS) { const b = S.slots[d][h].booking; if (b && b.phone === phone) return { d, h, b }; } return null; };
function checkBtn(b, h, d = 'today') {
  const st = b.status || 'booked';
  return st === 'booked' ? `<button class="btn sm act" data-st="arrived" data-d="${d}" data-h="${h}">Check in</button>`
    : `<button class="btn sm quiet act" data-st="booked" data-d="${d}" data-h="${h}">Undo</button>`;
}

// ───────── Staff render ─────────
function renderStaff() {
  setTabCount('whatsapp', needReply().length);
  renderDesk(); renderCalendar(); renderInbox(); renderWaToday();
}

// ───────── Desk (S1 Next up) ─────────
function renderDesk() {
  const now = nowFrac(), t = todaysBookings(), next = nextArrival();
  const inn = t.filter(x => x.b.status === 'arrived').length;
  $('dkLine').textContent = `${shortDate('today')} · ${plural(t.length, 'booking')} today · ${inn} checked in`;

  if (next) {
    const { h, b } = next, live = isLive('today', h);
    $('dkNext').innerHTML = `<div class="label">Next arrival</div>
      <div class="hero-row">
        <div class="when">${hShort(h)}</div>
        <div class="who">
          <div class="name">${esc(b.customer)}</div>
          <div class="sub meta">${logo(b.channel, 20)}<span>${SRC_LABEL(b.channel)}${b.kind === 'phone' ? ' (phone call)' : ''}</span><span class="sep">·</span><span>${esc(payLine(b))}</span><span class="sep">·</span><span class="mono">${esc(b.ref)}</span></div>
          <div class="rel"><span class="chip ${live ? 'now' : ''}">${live ? 'Playing now' : rel('today', h)}</span></div>
        </div>
        <div class="actions">
          <button class="btn lg" data-st="no_show" data-d="today" data-h="${h}" ${h <= now ? '' : 'disabled title="Available once the slot starts"'}>No-show</button>
          <button class="btn lg primary" data-st="arrived" data-d="today" data-h="${h}">${I.check}Check in</button>
        </div>
      </div>`;
  } else {
    const tm = bookingsOf('tomorrow')[0];
    $('dkNext').innerHTML = `<div class="label">Next arrival</div>
      <div class="hero-empty"><div><div class="name">No more bookings today</div>
        <div class="sub">${tm ? `Tomorrow starts with ${esc(tm.b.customer)} at ${hShort(tm.h)}.` : 'Nothing booked for tomorrow yet.'}${walkDay() === 'today' ? ' Free hours are still open for walk-ins.' : ''}</div></div>
        <button class="btn lg" data-walk>+ Walk-in${walkDay() === 'tomorrow' ? ' for tomorrow' : ''}</button></div>`;
  }

  // Rest of today: every booking and hold except the hero
  const rows = E.HOURS.map(h => ({ h, sl: S.slots.today[h] })).filter(({ h, sl }) =>
    (sl.booking && sl.booking.kind !== 'owner' && !(next && next.h === h)) || sl.hold);
  $('dkRestN').textContent = rows.length ? String(rows.length) : '';
  $('dkRest').innerHTML = rows.length ? rows.map(({ h, sl }) => {
    if (sl.hold) return `<div class="row hit" data-open="today|${h}"><div class="t">${hShort(h)}</div>
      <div class="grow">${esc(sl.hold.customer)}<div class="m">${chMark('whatsapp')}Paying on WhatsApp · ${rupee(sl.hold.price)}</div></div>${holdChip(sl.hold)}</div>`;
    const b = sl.booking;
    return `<div class="row hit ${isPast('today', h) ? 'done' : ''}" data-open="today|${h}"><div class="t">${hShort(h)}</div>
      <div class="grow">${esc(b.customer)}<div class="m">${chMark(b.channel)}${SRC_LABEL(b.channel)} · ${esc(payLine(b))}</div></div>
      ${stChip(b, 'today', h)}${checkBtn(b, h)}</div>`;
  }).join('') : `<div class="empty">${next ? 'Nothing else booked today.' : 'No other bookings today.'}</div>`;

  // Free hours left today
  const free = E.HOURS.filter(h => freeOffline('today', h));
  $('dkFreeH').textContent = free.length && free[0] < 17 ? 'Free today' : 'Free tonight';
  const shown = free.slice(0, 6);
  $('dkFree').innerHTML = free.length ? shown.map(h => `<div class="row hit" data-free="today|${h}"><div class="t">${hShort(h)}</div>
      <div class="grow m">${rupee(E.listed(S.slots.today[h], 'today', h, 'offline'))} at desk${isLive('today', h) ? ' · now' : ''}</div><button class="btn sm quiet add">Add</button></div>`).join('')
    + (free.length > shown.length ? `<button class="linkish" data-goto="calendar">${free.length - shown.length} more free hours on the calendar</button>` : '')
    : `<div class="empty">${E.HOURS.some(h => !E.isOver('today', h)) ? 'Fully booked for the rest of today.' : 'The turf is closed for the night.'}</div>`;

  const q = needReply();
  $('dkWa').innerHTML = q.length
    ? `<span>${plural(q.length, 'WhatsApp chat')} ${q.length === 1 ? 'needs' : 'need'} a reply.</span> <button class="linkish" data-goto="whatsapp">Open</button>`
    : `<span>All WhatsApp chats answered.</span> <button class="linkish" data-goto="whatsapp">Open inbox</button>`;
}

async function setBkStatus(d, h, st) {
  const r = await api('/api/booking/status', { day: d, hour: h, status: st });
  if (r.ok) toast(st === 'arrived' ? 'Checked in' : st === 'no_show' ? 'Marked as no-show' : 'Status reset');
  else toast(`Could not update: ${r.error}`);
}

// One delegated click handler for the whole staff view
$('staffView').addEventListener('click', e => {
  const st = e.target.closest('[data-st]');
  if (st) { e.stopPropagation(); return setBkStatus(st.dataset.d || 'today', +st.dataset.h, st.dataset.st); }
  const go = e.target.closest('[data-goto]'); if (go) return setTab(go.dataset.goto);
  const w = e.target.closest('[data-walk]'); if (w) return openOffline(w.dataset.walk ? 'today' : walkDay(), w.dataset.walk ? +w.dataset.walk : null, 'walkin');
  const f = e.target.closest('[data-free]'); if (f) { const [d, h] = f.dataset.free.split('|'); return openOffline(d, +h, 'walkin'); }
  const o = e.target.closest('[data-open]'); if (o) { const [d, h] = o.dataset.open.split('|'); return openBooking(d, +h); }
});
$('qWalk').onclick = () => openOffline(walkDay(), null, 'walkin');
$('qPhone').onclick = () => openOffline(walkDay(), null, 'phone');
$('waWalk').onclick = () => openOffline(walkDay(), null, 'walkin');

// ───────── Calendar (S2 Day sheet) ─────────
let calDay = 'today', calPastOpen = false;
function slotRow(d, h, extra = '') {
  const sl = S.slots[d][h], b = sl.booking, hd = sl.hold, past = isPast(d, h), live = isLive(d, h);
  const cls = `hr ${live ? 'now' : ''} ${past ? 'past' : ''} ${extra}`;
  const t = `<div class="t">${hShort(h)}${live ? '<span class="nowtag">Now</span>' : ''}</div>`;
  if (b && b.kind === 'owner') return `<div class="${cls} hit" data-open="${d}|${h}">${t}<div class="body"><span class="bar" style="background:var(--faint)"></span>
    <div class="grow"><div class="nm">${I.lock}Closed by owner</div><div class="m">${esc(b.note || 'Owner block')}</div></div></div></div>`;
  if (b) return `<div class="${cls} hit bk" data-open="${d}|${h}">${t}<div class="body"><span class="bar" style="background:var(--c-${b.channel})"></span>
    <div class="grow"><div class="nm">${esc(b.customer)}</div><div class="m">${SRC_LABEL(b.channel)} · ${esc(payLine(b))}</div></div>${stChip(b, d, h)}</div></div>`;
  if (hd) return `<div class="${cls} hit" data-open="${d}|${h}">${t}<div class="body"><span class="bar" style="background:var(--hold)"></span>
    <div class="grow"><div class="nm">${esc(hd.customer)}</div><div class="m">Paying on WhatsApp · ${rupee(hd.price)}</div></div><span class="chip warn" data-hold>${I.clock}Paying on WhatsApp ${mm(holdLeft(hd))}</span></div></div>`;
  if (E.isOver(d, h)) return `<div class="${cls}">${t}<div class="body"><div class="grow m">Past · not booked</div></div></div>`;
  if (sl.closed.offline) return `<div class="${cls}">${t}<div class="body"><div class="grow m">${I.lock}Closed by owner</div></div></div>`;
  return `<div class="${cls} hit free" data-free="${d}|${h}">${t}<div class="body"><div class="grow m">Free · ${rupee(E.listed(sl, d, h, 'offline'))}</div><span class="btn sm add">+ Add walk-in</span></div></div>`;
}
function renderCalendar() {
  document.querySelectorAll('#calDay button').forEach(b => {
    const on = b.dataset.d === calDay; b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
    b.textContent = `${E.dayLabel(b.dataset.d)} · ${E.dayDate(b.dataset.d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}`;
  });
  const d = calDay, list = bookingsOf(d);
  const freeN = E.HOURS.filter(h => freeOffline(d, h)).length;
  $('calSum').textContent = `${plural(list.length, 'booking')} · ${freeN} free ${freeN === 1 ? 'hour' : 'hours'} left`;

  let html = '';
  const past = d === 'today' ? E.HOURS.filter(h => E.isOver(d, h)) : [];
  if (past.length) {
    const who = past.map(h => S.slots.today[h].booking).filter(b => b && b.kind !== 'owner')
      .map(b => `${esc(b.customer)}, ${{ arrived: 'checked in', no_show: 'no-show' }[b.status] || 'not checked in'}`);
    html += `<button class="hr past fold" id="calFold" aria-expanded="${calPastOpen}"><div class="t wide">${hShort(past[0])} to ${hShort(past[past.length - 1])}</div>
      <div class="body"><div class="grow m">Earlier today · ${who.length ? who.join(' · ') : 'no bookings'}</div><span class="linkish">${calPastOpen ? 'Hide' : 'Show'}</span></div></button>`;
    if (calPastOpen) html += past.map(h => slotRow(d, h, 'earlier')).join('');
  }
  html += E.HOURS.filter(h => !past.includes(h)).map(h => slotRow(d, h)).join('');
  if (d === 'today' && !E.HOURS.some(h => !E.isOver(d, h))) html += '<div class="empty pad">The turf is closed for the night. Switch to Tomorrow to plan ahead.</div>';
  $('cal').innerHTML = html;
  renderRail();
}
function renderRail() {
  const now = nowFrac(), cur = Math.floor(now), next = nextArrival();
  const open = E.HOURS.includes(cur);
  let state = 'Closed', sub = '';
  if (open) {
    const sl = S.slots.today[cur], b = sl.booking;
    state = b ? (b.kind === 'owner' ? 'Closed by owner' : esc(b.customer)) : sl.hold ? 'On hold' : sl.closed.offline ? 'Closed by owner' : 'Free';
    if (b && b.kind !== 'owner') sub = `${{ arrived: 'Checked in', no_show: 'No-show' }[b.status] || 'Not checked in yet'} · `;
  }
  const upcoming = next && !(open && next.h === cur) ? next : todaysBookings().find(x => x.h > cur && (x.b.status || 'booked') === 'booked');
  sub += upcoming ? `Next: ${esc(upcoming.b.customer)} at ${hShort(upcoming.h)}` : 'No more arrivals today';
  const wh = E.HOURS.find(h => freeOffline('today', h));
  const btn = wh != null ? `<button class="btn primary tall full" data-walk="${wh}">+ Walk-in for ${hShort(wh)}</button>`
    : `<button class="btn tall full" data-walk>+ Walk-in for tomorrow</button>`;
  $('calNow').innerHTML = `<div class="label">Now</div><div class="num now-num">${open ? hShort(cur) : 'After hours'} · ${state}</div><div class="sub">${sub}</div>${btn}`;
  const q = needReply();
  $('calWa').innerHTML = `<div class="card-h">WhatsApp ${q.length ? `<span class="count">${q.length}</span>` : ''}</div>` +
    (q.length ? q.map(c => { const m = [...c.msgs].reverse().find(x => x.from === 'user');
      return `<div class="wa-line"><b>${esc(c.name)}</b> <span class="m">${esc((m ? m.text : '').split('\n')[0])}</span></div>`; }).join('')
      + '<button class="linkish" data-goto="whatsapp">Open inbox</button>'
      : '<div class="m sub">No chats waiting. The bot is handling bookings.</div>');
}
$('calDay').onclick = e => { const b = e.target.closest('[data-d]'); if (b) { calDay = b.dataset.d; renderCalendar(); } };
$('cal').addEventListener('click', e => { if (e.target.closest('#calFold')) { calPastOpen = !calPastOpen; renderCalendar(); } });

// ───────── Booking detail sheet (markup in sheets.js) ─────────
let bkOpen = null, bkConfirm = false;
function openBooking(d, h) { bkOpen = { d, h }; bkConfirm = false; renderBooking(); if (!$('bkSheet').open) $('bkSheet').showModal(); }
function renderBooking() {
  if (!bkOpen) return; const { d, h } = bkOpen, sl = S.slots[d][h], b = sl.booking, hd = sl.hold;
  $('bkTitle').textContent = `${E.dayLabel(d)} · ${E.hLabel(h)}`;
  if (!b && !hd) { $('bkBody').innerHTML = '<div class="empty">This slot is free now.</div>'; return; }
  if (!b) {
    $('bkBody').innerHTML = `<div class="bk-who"><div class="name">${esc(hd.customer)}</div>${holdChip(hd)}</div>
      <dl class="kv"><dt>Booked via</dt><dd>${logo('whatsapp', 18)}WhatsApp</dd><dt>Reference</dt><dd class="mono">${esc(hd.ref)}</dd><dt>Amount</dt><dd>${rupee(hd.price)}</dd></dl>
      <div class="note">The slot is held for this customer until they pay. It is blocked on the apps meanwhile.</div>`; return;
  }
  const phone = realPhone(b.phone), chat = chatOf(b.phone), st = b.status || 'booked', owner = b.kind === 'owner';
  const started = d === 'today' && h <= nowFrac();
  const kv = `<dl class="kv">
      ${phone ? `<dt>Phone</dt><dd>${esc(phone)}</dd>` : ''}
      <dt>Booked via</dt><dd>${owner ? 'Owner' : `${logo(b.channel, 18)}${SRC_LABEL(b.channel)}${b.kind === 'phone' ? ' (phone call)' : ''}`}</dd>
      <dt>Reference</dt><dd class="mono">${esc(b.ref)}</dd>
      <dt>${owner ? 'Reason' : 'Payment'}</dt><dd>${esc(payLine(b))}</dd>
      ${owner ? '' : `<dt>Status</dt><dd>${{ booked: isLive(d, h) ? 'Expected now' : isPast(d, h) ? 'Not checked in' : 'Upcoming', arrived: 'Checked in', no_show: 'No-show' }[st]}</dd>`}
    </dl>`;
  const who = `<div class="bk-who"><div class="name">${owner ? 'Closed by owner' : esc(b.customer)}</div>${owner ? '' : stChip(b, d, h)}</div>`;
  if (owner) { $('bkBody').innerHTML = who + kv + '<div class="note">Blocked by the owner. Only the owner can remove it.</div>'; return; }
  if (bkConfirm) {
    $('bkBody').innerHTML = who + `<div class="confirm"><b>Cancel ${esc(b.ref)} for ${esc(b.customer)}?</b><div class="sub">The slot reopens on every channel. This cannot be undone.</div>
      <div class="acts"><button class="btn tall" data-a="keep">Keep booking</button><button class="btn tall danger-solid" data-a="cancel-yes">Yes, cancel booking</button></div></div>`;
    return;
  }
  $('bkBody').innerHTML = who + kv + `
    <div class="acts">
      ${st !== 'arrived' ? `<button class="btn primary tall" data-a="arrived">${I.check}Check in</button>` : ''}
      ${st === 'booked' && started ? `<button class="btn tall" data-a="no_show">No-show</button>` : ''}
      ${st !== 'booked' ? `<button class="btn tall" data-a="booked">Undo</button>` : ''}
    </div>
    <div class="acts">
      ${chat ? `<button class="btn tall" data-a="chat">Open WhatsApp chat</button>` : ''}
      ${phone ? `<button class="btn tall" data-a="call">Call</button>` : ''}
    </div>
    <div class="acts end"><button class="btn quiet danger" data-a="cancel">Cancel booking</button></div>`;
}
$('bkBody').onclick = async e => {
  const a = e.target.closest('[data-a]')?.dataset.a; if (!a || !bkOpen) return; const { d, h } = bkOpen, b = S.slots[d][h].booking;
  if (!b) return;
  if (['arrived', 'no_show', 'booked'].includes(a)) return setBkStatus(d, h, a);
  if (a === 'chat') { $('bkSheet').close(); staffChat = b.phone; inboxTab = 'all'; threadKey = null; if (role === 'staff') setTab('whatsapp'); renderInbox(); $('replyInput').focus(); return; }
  if (a === 'call') { location.href = 'tel:' + realPhone(b.phone).replace(/[^\d+]/g, ''); return; }
  if (a === 'cancel') { bkConfirm = true; return renderBooking(); }
  if (a === 'keep') { bkConfirm = false; return renderBooking(); }
  if (a === 'cancel-yes') { const r = await api('/api/cancel', { day: d, hour: h }); $('bkSheet').close(); toast(r.ok ? `Cancelled ${b.ref}. The slot is open again.` : `Could not cancel: ${r.error}`); }
};
$('bkClose').onclick = () => $('bkSheet').close();
$('bkSheet').addEventListener('close', () => { bkOpen = null; bkConfirm = false; });

// ───────── WhatsApp (S3 Desk and inbox) ─────────
let staffChat = null, inboxTab = 'need', threadKey = null;
const CANNED = ['Haan, free parking hai', 'Shoes ₹50 mein rent pe milte hain', 'Bibs aur ball desk pe free milenge', 'Thoda wait kijiye, check karke batata hoon'];
function renderInbox() {
  const all = [...S.chats].sort((a, b) => (b.needsHuman - a.needsHuman) || (b.lastTs - a.lastTs));
  const list = inboxTab === 'need' ? all.filter(c => c.needsHuman || c.unread) : all;
  const need = all.filter(c => c.needsHuman).length;
  document.querySelectorAll('#inboxTabs button').forEach(b => { b.classList.toggle('on', b.dataset.t === inboxTab); if (b.dataset.t === 'need') b.textContent = `Needs reply${need ? ' · ' + need : ''}`; });
  if (!staffChat || !S.chats.find(c => c.phone === staffChat)) staffChat = (list[0] || all[0])?.phone || null;
  $('inbox').innerHTML = list.length ? list.map(c => {
    const last = c.msgs[c.msgs.length - 1];
    return `<button class="conv ${c.phone === staffChat ? 'sel' : ''}" data-p="${esc(c.phone)}"><span class="avatar">${initial(c.name)}</span>
      <span class="grow"><span class="nm"><b>${esc(c.name)}</b>${c.real ? '<span class="live">Live</span>' : ''}</span>
        <span class="last">${last ? (last.from === 'user' ? '' : last.from === 'staff' ? 'You: ' : 'Bot: ') + esc(last.text.split('\n')[0]) : 'No messages'}</span></span>
      <span class="r"><span class="when">${c.lastTs ? hm(c.lastTs) : ''}</span>${c.unread ? `<span class="count">${c.unread}</span>` : ''}</span></button>`;
  }).join('') : '<div class="empty">No chats need a reply. The bot handled everything.</div>';
  renderThread();
}
function renderThread() {
  const c = S.chats.find(x => x.phone === staffChat);
  $('threadWrap').hidden = !c; $('threadNone').hidden = !!c; if (!c) return;
  const bk = bookingFor(c.phone);
  $('thead').innerHTML = `<span class="avatar">${initial(c.name)}</span>
    <div class="grow"><b>${esc(c.name)}</b><div class="m">${bk ? `Booked ${hShort(bk.h)} ${bk.d} · <span class="mono">${esc(bk.b.ref)}</span>` : c.real ? 'Live WhatsApp chat' : 'No booking yet'}</div></div>
    <button class="toggle" id="botSw" role="switch" aria-checked="${!c.human}" title="When off, the bot stops replying and you handle this chat">Bot ${c.human ? 'off' : 'on'}<i></i></button>
    ${c.needsHuman ? '<button class="btn sm" id="resolveBtn">Mark done</button>' : ''}`;
  const key = c.phone + ':' + c.msgs.length + ':' + c.typing + ':' + c.human;
  if (threadKey !== key) {
    threadKey = key;
    $('thread').innerHTML = (c.human ? '<div class="sys">You are replying. The bot is paused for this chat.</div>' : '') + c.msgs.map(m => {
      const out = m.from !== 'user';
      return `<div class="msg ${out ? 'out' : ''} ${m.from}">${esc(m.text)}<small>${out ? (m.from === 'staff' ? 'Front desk' : 'Bot') + ' · ' : ''}${hm(m.ts)}</small></div>`;
    }).join('') + (c.typing ? '<div class="typing"><i></i><i></i><i></i></div>' : '');
    $('thread').scrollTop = $('thread').scrollHeight;
  }
  if (!$('canned').childElementCount) $('canned').innerHTML = CANNED.map(x => `<button type="button" class="chip">${esc(x)}</button>`).join('');
  if (c.unread && role === 'staff' && tab() === 'whatsapp' && renderThread.read !== key) { renderThread.read = key; api('/api/wa/read', { phone: c.phone }); }
}
function renderWaToday() {
  const t = todaysBookings();
  $('waTodayN').textContent = t.length ? String(t.length) : '';
  $('waToday').innerHTML = t.length ? t.map(({ h, b }) => `<div class="row hit ${isPast('today', h) ? 'done' : ''}" data-open="today|${h}"><div class="t">${hShort(h)}</div>
      <div class="grow">${esc(b.customer)}<div class="m">${chMark(b.channel)}${SRC_LABEL(b.channel)}</div></div>
      ${(b.status || 'booked') === 'booked' ? checkBtn(b, h) : stChip(b, 'today', h)}</div>`).join('')
    : '<div class="empty">No bookings today yet.</div>';
}
$('inbox').onclick = e => { const r = e.target.closest('[data-p]'); if (r) { staffChat = r.dataset.p; threadKey = null; renderInbox(); } };
$('inboxTabs').onclick = e => { const b = e.target.closest('button'); if (b) { inboxTab = b.dataset.t; renderInbox(); } };
$('canned').onclick = e => { const c = e.target.closest('.chip'); if (c) { $('replyInput').value = c.textContent; $('replyInput').focus(); } };
$('replyForm').onsubmit = e => { e.preventDefault(); const text = $('replyInput').value.trim(); if (!text || !staffChat) return; api('/api/wa/reply', { phone: staffChat, text }); $('replyInput').value = ''; };
$('thead').addEventListener('click', e => {
  if (e.target.closest('#botSw')) { const c = S.chats.find(x => x.phone === staffChat); if (c) api('/api/wa/takeover', { phone: staffChat, on: !c.human }); }
  if (e.target.closest('#resolveBtn')) api('/api/wa/resolve', { phone: staffChat }).then(() => toast('Marked done'));
});

// ───────── Timers ─────────
// Hold countdowns tick every second (only the m:ss text, so nothing jumps); the full view refreshes every 30s.
setInterval(() => {
  if (!S || role !== 'staff') return;
  if (document.querySelector('#staffView [data-hold]')) { renderDesk(); renderCalendar(); }
  if (bkOpen && S.slots[bkOpen.d][bkOpen.h].hold) renderBooking();
}, 1000);
setInterval(() => { if (S && role === 'staff') renderStaff(); }, 30000); // keep "in N min", the now row and past folding fresh

// VenueBuddy · front-desk (staff) view
// Markup for #staffView lives here so each view owns its own HTML.
document.getElementById('staffView').innerHTML = `
  <section class="stats">
    <div class="kpi blue"><div class="l">Next arrival</div><div class="v sm" id="sNext">—</div><div class="s" id="sNextSub">—</div></div>
    <div class="kpi"><div class="l">Today's bookings</div><div class="v num" id="sToday">0</div><div class="s" id="sTodaySub">—</div></div>
    <div class="kpi good"><div class="l">Checked in</div><div class="v num" id="sIn">0</div><div class="s" id="sInSub">—</div></div>
    <div class="kpi warn"><div class="l">WhatsApp queries to answer</div><div class="v num" id="sQ">0</div><div class="s" id="sQSub">—</div></div>
  </section>
  <main class="smain">
    <section class="card cal-card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--red)"><path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2zM5 9v11h14V9z"/></svg>Bookings Calendar
        <span class="aside">Tap a booking for details · tap a free slot to add a walk-in</span></h3>
      <div class="legend">
        <span><i class="dot" style="background:var(--wa)"></i>WhatsApp</span>
        <span><i class="dot" style="background:var(--blue)"></i>App (aggregator)</span>
        <span><i class="dot" style="background:var(--gray)"></i>Walk-in / phone</span>
        <span><i class="dot" style="background:var(--green)"></i>Checked in</span>
        <span><i class="dot" style="background:var(--orange)"></i>Payment pending</span>
      </div>
      <div class="cal" id="cal"></div>
    </section>

    <section class="card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--blue)"><path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c5 0 9 2.5 9 5.5V22H3v-2.5C3 16.5 7 14 12 14z"/></svg>Front Desk</h3>
      <div class="quick">
        <button class="primary" id="qWalk">+ Walk-in</button>
        <button id="qPhone">+ Phone booking</button>
      </div>
      <div class="sub">Arriving next · today</div>
      <div class="list" id="upNext"></div>
      <div class="sub">On the turf now</div>
      <div class="list" id="onTurf"></div>
      <div class="sub">Free today · tap to book</div>
      <div class="chips" id="freeToday"></div>
    </section>

    <section class="card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--wa)"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>WhatsApp Queries
        <span class="aside" id="inboxAside"></span></h3>
      <div class="segmented" id="inboxTabs" style="margin-bottom:8px"><button data-t="need" class="active">Needs reply</button><button data-t="all">All chats</button></div>
      <div class="inbox" id="inbox"></div>
      <div id="threadWrap">
        <div class="thead" id="thead"></div>
        <div class="thread" id="thread"></div>
        <div class="canned" id="canned"></div>
        <form class="reply-bar" id="replyForm">
          <input id="replyInput" autocomplete="off" placeholder="Reply as front desk…">
          <button type="submit" class="primary">Send</button>
        </form>
      </div>
    </section>
  </main>
`;

// ───────── Staff render ─────────
function renderStaff() { renderStaffStats(); renderCalendar(); renderDesk(); renderInbox(); }

function todaysBookings() {
  return E.HOURS.map(h => ({ d: 'today', h, b: S.slots.today[h].booking })).filter(x => x.b && x.b.kind !== 'owner');
}
function renderStaffStats() {
  const t = todaysBookings(), now = nowFrac();
  const next = [...t.filter(x => x.b.status === 'booked' && x.h + 1 > now),
                ...E.HOURS.map(h => ({ d: 'tomorrow', h, b: S.slots.tomorrow[h].booking })).filter(x => x.b && x.b.kind !== 'owner')][0];
  $('sNext').textContent = next ? `${hShort(next.h)} · ${next.b.customer}` : 'None';
  $('sNextSub').textContent = next ? `${rel(next.d, next.h)} · ${SRC_LABEL(next.b.channel)}` : 'No upcoming bookings';
  $('sToday').textContent = t.length;
  $('sTodaySub').textContent = `${t.filter(x => x.h + 1 > now).length} still to play · ${E.HOURS.filter(h => !S.slots.today[h].booking && !S.slots.today[h].hold && h + 1 > now).length} slots free`;
  const inn = t.filter(x => x.b.status === 'arrived').length, ns = t.filter(x => x.b.status === 'no_show').length;
  $('sIn').textContent = inn; $('sInSub').textContent = ns ? `${ns} no-show` : 'No no-shows';
  const q = S.chats.filter(c => c.needsHuman);
  $('sQ').textContent = q.length; $('sQSub').textContent = q.length ? q.map(c => c.name).join(', ') : 'All caught up';
}

function renderCalendar() {
  const now = nowFrac(), t = Date.now();
  let html = '<div class="ch"></div>' + E.DAYS.map(d => {
    const n = E.HOURS.filter(h => S.slots[d][h].booking && S.slots[d][h].booking.kind !== 'owner').length;
    return `<div class="ch">${E.dayLabel(d)} · ${E.dayDate(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}<small>${n} booking${n === 1 ? '' : 's'}</small></div>`;
  }).join('');
  for (const h of E.HOURS) {
    html += `<div class="tl">${hShort(h)}</div>`;
    for (const d of E.DAYS) {
      const sl = S.slots[d][h], b = sl.booking, hd = sl.hold;
      const line = d === 'today' && Math.floor(now) === h ? `<div class="nowline" style="top:${(now - h) * ROW_H}px"></div>` : '';
      let inner;
      if (b && b.kind === 'owner') inner = `<div class="ev block" data-d="${d}" data-h="${h}"><div class="nm">${I.wrench} Blocked</div><div class="mt">${esc(b.note || 'Owner block')}</div></div>`;
      else if (b) inner = `<div class="ev ${b.status || ''}" style="--src:${SRC_COLOR[b.channel]}" data-d="${d}" data-h="${h}">
          <div class="nm">${esc(b.customer)} ${statusChip(b, d, h)}</div>
          <div class="mt">${SRC_LABEL(b.channel)} · ${esc(payLine(b))}</div></div>`;
      else if (hd) { const left = Math.max(0, Math.round((hd.expires - t) / 1000));
        inner = `<div class="ev hold" data-d="${d}" data-h="${h}"><div class="nm">${esc(hd.customer)} <span class="st-chip soon">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span></div><div class="mt">Paying on WhatsApp · ${rupee(hd.price)}</div></div>`; }
      else if (isPast(d, h)) inner = `<div class="free x">—</div>`;
      else if (sl.closed.offline) inner = `<div class="free x">Closed by owner</div>`;
      else inner = `<div class="free" data-free="${d}|${h}"><span>Free</span><span class="plus">+ Walk-in</span></div>`;
      html += `<div class="cc ${isPast(d, h) ? 'past' : ''}">${line}${inner}</div>`;
    }
  }
  $('cal').innerHTML = html;
}
$('cal').addEventListener('click', e => {
  const f = e.target.closest('[data-free]'); if (f) { const [d, h] = f.dataset.free.split('|'); return openOffline(d, +h, 'walkin'); }
  const ev = e.target.closest('.ev'); if (ev) openBooking(ev.dataset.d, +ev.dataset.h);
});

function renderDesk() {
  const now = nowFrac(), t = todaysBookings();
  const up = t.filter(x => x.b.status === 'booked' && x.h + 1 > now).slice(0, 5);
  $('upNext').innerHTML = up.length ? up.map(({ d, h, b }) => `
    <div class="item"><div class="when">${hShort(h)}<small>${rel(d, h)}</small></div>
      <div class="who"><b>${esc(b.customer)}</b><small>${SRC_LABEL(b.channel)} · ${esc(payLine(b))}</small></div>
      <div class="btns">${h <= now ? `<button class="gray" data-st="no_show" data-h="${h}">No-show</button>` : ''}<button class="go" data-st="arrived" data-h="${h}">Check in</button></div></div>`).join('')
    : '<div class="empty">No more arrivals today.</div>';
  const on = t.filter(x => x.b.status === 'arrived' && x.h + 1 > now);
  $('onTurf').innerHTML = on.length ? on.map(({ d, h, b }) => `
    <div class="item"><div class="when">${hShort(h)}<small>till ${hShort(h + 1)}</small></div>
      <div class="who"><b>${esc(b.customer)}</b><small>Checked in ${b.statusAt ? new Date(b.statusAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</small></div>
      <div class="btns"><button class="gray" data-st="booked" data-h="${h}">Undo</button></div></div>`).join('')
    : '<div class="empty">Nobody checked in yet.</div>';
  const free = E.HOURS.filter(h => { const sl = S.slots.today[h]; return h + 1 > now && !sl.booking && !sl.hold && !sl.closed.offline; });
  $('freeToday').innerHTML = free.length ? free.map(h => `<button class="chip" data-fh="${h}"><b>${hShort(h)}</b> · ${rupee(E.listed(S.slots.today[h], 'today', h, 'offline'))}</button>`).join('')
    : '<div class="empty">Fully booked for today.</div>';
}
async function setBkStatus(d, h, st) {
  const r = await api('/api/booking/status', { day: d, hour: h, status: st });
  if (r.ok) toast(st === 'arrived' ? 'Checked in ✓' : st === 'no_show' ? 'Marked as no-show' : 'Status reset');
}
$('upNext').onclick = $('onTurf').onclick = e => { const b = e.target.closest('[data-st]'); if (b) setBkStatus('today', +b.dataset.h, b.dataset.st); };
$('freeToday').onclick = e => { const b = e.target.closest('[data-fh]'); if (b) openOffline('today', +b.dataset.fh, 'walkin'); };
$('qWalk').onclick = () => openOffline('today', null, 'walkin');
$('qPhone').onclick = () => openOffline('today', null, 'phone');

// ───────── Booking detail sheet ─────────
let bkOpen = null;
function openBooking(d, h) { bkOpen = { d, h }; renderBooking(); if (!$('bkSheet').open) $('bkSheet').showModal(); }
function renderBooking() {
  if (!bkOpen) return; const { d, h } = bkOpen, sl = S.slots[d][h], b = sl.booking, hd = sl.hold;
  $('bkTitle').textContent = `${E.dayLabel(d)} · ${E.hLabel(h)}`;
  if (!b && !hd) { $('bkBody').innerHTML = '<div class="empty">This slot is free now.</div>'; return; }
  if (!b) { $('bkBody').innerHTML = `<div class="kv"><span>Customer</span><b>${esc(hd.customer)}</b><span>Status</span><b>Paying on WhatsApp (${hd.ref})</b><span>Amount</span><b>${rupee(hd.price)}</b></div>
      <div class="note">The slot is held for this customer until they pay. It's blocked on the apps meanwhile.</div>`; return; }
  const phone = realPhone(b.phone), chat = chatOf(b.phone), st = b.status || 'booked';
  const owner = b.kind === 'owner';
  $('bkBody').innerHTML = `<div class="kv">
      <span>Customer</span><b>${esc(b.customer)}</b>
      ${phone ? `<span>Phone</span><b>${esc(phone)}</b>` : ''}
      <span>Booked via</span><b>${owner ? 'Owner' : SRC_LABEL(b.channel)}${b.kind === 'phone' ? ' (phone call)' : ''}</b>
      <span>Reference</span><b>${esc(b.ref)}</b>
      <span>Payment</span><b>${esc(payLine(b))}</b>
      ${owner ? '' : `<span>Status</span><b>${{ booked: isLive(d, h) ? 'Expected now' : 'Upcoming', arrived: '✓ Checked in', no_show: 'No-show' }[st]}</b>`}
    </div>
    ${owner ? '<div class="note">Blocked by the owner. Only the owner can remove it.</div>' : `
    <div class="acts">
      ${st !== 'arrived' ? `<button class="go" data-a="arrived">Check in</button>` : ''}
      ${st === 'booked' && !isPast(d, h) && d === 'today' && h <= nowFrac() ? `<button class="gray" data-a="no_show">No-show</button>` : ''}
      ${st !== 'booked' ? `<button class="gray" data-a="booked">Undo</button>` : ''}
    </div>
    <div class="acts">
      ${chat ? `<button data-a="chat">Open WhatsApp chat</button>` : ''}
      ${phone ? `<button class="gray" data-a="call">Call</button>` : ''}
      <button class="danger" data-a="cancel">Cancel booking</button>
    </div>`}`;
}
$('bkBody').onclick = async e => {
  const a = e.target.closest('[data-a]')?.dataset.a; if (!a || !bkOpen) return; const { d, h } = bkOpen, b = S.slots[d][h].booking;
  if (['arrived', 'no_show', 'booked'].includes(a)) return setBkStatus(d, h, a);
  if (a === 'chat') { $('bkSheet').close(); staffChat = b.phone; inboxTab = 'all'; threadKey = null; renderInbox(); $('replyInput').focus(); return; }
  if (a === 'call') { location.href = 'tel:' + realPhone(b.phone).replace(/[^\d+]/g, ''); return; }
  if (a === 'cancel' && confirm(`Cancel ${b.ref} for ${b.customer}? The slot reopens on every channel.`)) { await api('/api/cancel', { day: d, hour: h }); $('bkSheet').close(); toast(`Cancelled ${b.ref}`); }
};
$('bkClose').onclick = () => $('bkSheet').close();
$('bkSheet').addEventListener('close', () => { bkOpen = null; });

// ───────── WhatsApp query inbox ─────────
let staffChat = null, inboxTab = 'need', threadKey = null;
const CANNED = ['Haan, free parking hai 🚗', 'Shoes ₹50 mein rent pe milte hain 👟', 'Bibs aur ball desk pe free milenge ⚽', 'Thoda wait kijiye, check karke batata hoon 🙏'];
function renderInbox() {
  const all = [...S.chats].sort((a, b) => (b.needsHuman - a.needsHuman) || (b.lastTs - a.lastTs));
  const list = inboxTab === 'need' ? all.filter(c => c.needsHuman || c.unread) : all;
  const need = all.filter(c => c.needsHuman).length;
  $('inboxAside').textContent = `${all.length} chat${all.length === 1 ? '' : 's'}`;
  document.querySelectorAll('#inboxTabs button').forEach(b => { b.classList.toggle('active', b.dataset.t === inboxTab); if (b.dataset.t === 'need') b.textContent = `Needs reply${need ? ' · ' + need : ''}`; });
  if (!staffChat || !S.chats.find(c => c.phone === staffChat)) staffChat = (list[0] || all[0])?.phone || null;
  $('inbox').innerHTML = list.length ? list.map(c => {
    const last = c.msgs[c.msgs.length - 1];
    const when = c.lastTs ? new Date(c.lastTs).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
    return `<div class="conv ${c.phone === staffChat ? 'sel' : ''}" data-p="${esc(c.phone)}"><div class="avatar">${esc(c.name.slice(0, 2).toUpperCase())}</div>
      <div><b>${esc(c.name)}${c.real ? ' · live' : ''}</b><small>${last ? (last.from === 'user' ? '' : last.from === 'staff' ? 'You: ' : 'Bot: ') + esc(last.text.split('\n')[0]) : 'No messages'}</small></div>
      <div class="r">${when}${c.unread ? `<span class="unread">${c.unread}</span>` : ''}${c.needsHuman ? '<span class="flag">Needs reply</span>' : c.human ? '<span class="flag">You</span>' : ''}</div></div>`;
  }).join('') : '<div class="empty">No queries waiting. The bot handled everything. 🎉</div>';
  renderThread();
}
function renderThread() {
  const c = S.chats.find(x => x.phone === staffChat);
  $('threadWrap').hidden = !c; if (!c) return;
  $('thead').innerHTML = `<div class="avatar" style="width:30px;height:30px;font-size:12px">${esc(c.name.slice(0, 2).toUpperCase())}</div><div><b>${esc(c.name)}</b><div class="mut" style="font-size:12px">${c.human ? 'You are replying · bot paused' : 'Bot is answering bookings'}</div></div>
    <span style="flex:1"></span>
    ${c.needsHuman ? '<button class="gray" id="resolveBtn" style="min-height:30px;font-size:13px">Mark done</button>' : ''}
    <label class="switch" style="margin-left:6px" title="When off, the bot stops replying and you handle this chat">Bot <input type="checkbox" id="botSw" ${c.human ? '' : 'checked'}></label>`;
  const key = c.phone + ':' + c.msgs.length + ':' + c.typing;
  if (threadKey !== key) {
    threadKey = key;
    $('thread').innerHTML = c.msgs.map(m => {
      const t = new Date(m.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const by = m.from === 'user' ? '' : `<span class="by">${m.from === 'staff' ? 'Front desk' : 'Bot'}</span>`;
      return `<div class="bub ${m.from}${m.from === 'bot' ? ' mine' : ''}">${by}${esc(m.text)}<span class="t">${t}</span></div>`;
    }).join('') + (c.typing ? '<div class="typing"><i></i><i></i><i></i></div>' : '');
    $('thread').scrollTop = $('thread').scrollHeight;
  }
  $('canned').innerHTML = CANNED.map(x => `<button class="chip">${esc(x)}</button>`).join('');
  if (c.unread && !$('staffView').hidden && renderThread.read !== key) { renderThread.read = key; api('/api/wa/read', { phone: c.phone }); }
}
$('inbox').onclick = e => { const r = e.target.closest('[data-p]'); if (r) { staffChat = r.dataset.p; threadKey = null; renderInbox(); } };
$('inboxTabs').onclick = e => { const b = e.target.closest('button'); if (b) { inboxTab = b.dataset.t; renderInbox(); } };
$('canned').onclick = e => { if (e.target.classList.contains('chip')) { $('replyInput').value = e.target.textContent; $('replyInput').focus(); } };
$('replyForm').onsubmit = e => { e.preventDefault(); const text = $('replyInput').value.trim(); if (!text || !staffChat) return; api('/api/wa/reply', { phone: staffChat, text }); $('replyInput').value = ''; };
$('thead').addEventListener('change', e => { if (e.target.id === 'botSw') api('/api/wa/takeover', { phone: staffChat, on: !e.target.checked }); });
$('thead').addEventListener('click', e => { if (e.target.id === 'resolveBtn') api('/api/wa/resolve', { phone: staffChat }); });


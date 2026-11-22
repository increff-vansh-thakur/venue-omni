// VenueBuddy · owner view
// Markup for #ownerView lives here so each view owns its own HTML.
// Tabs (rendered by core): today · slots · pricing · customers · sync. Each section carries data-panel="<tab id>".
const OI = {
  send: '<svg class="i" viewBox="0 0 24 24"><path d="M3 20.5V14l9-2-9-2V3.5L22 12z"/></svg>',
  store: '<svg class="i" viewBox="0 0 24 24"><path d="M4 4h16v4H4zM4 10h7v10H4zM13 10h7v4h-7zM13 16h7v4h-7z"/></svg>',
  person: '<svg class="i" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c5 0 9 2.5 9 5.5V22H3v-2.5C3 16.5 7 14 12 14z"/></svg>',
};

document.getElementById('ownerView').innerHTML = `
<!-- ═════ Today (O1) ═════ -->
<div class="grid ov-today" data-panel="today">
  <section class="card span-8 ov-focal">
    <div class="label">Kept after fees today</div>
    <div class="big" id="kKept">₹0</div>
    <div class="sub" id="kKeptSub"></div>
    <div class="ov-strip" id="strip"></div>
    <div class="ov-legend" id="stripLegend"></div>
  </section>
  <section class="card span-4">
    <div class="card-h">Coming up<span class="spacer"></span><button class="btn quiet sm" id="toSlots">All slots</button></div>
    <div id="uplist"></div>
  </section>
  <section class="card span-5">
    <div class="card-h">Where bookings came from <span class="label" id="splitAside">Today and tomorrow</span></div>
    <div class="ov-split" id="sbar"></div>
    <div id="srows"></div>
  </section>
  <section class="card span-7">
    <div class="card-h">Change something <span class="label">Hindi, Hinglish or English</span></div>
    <div class="ov-cmd">
      <input id="cmd" autocomplete="off" placeholder="kal shaam 7 se 9 Hurdle pe band karo">
      <button id="micBtn" class="btn">${I.mic}Speak</button>
      <button id="runBtn" class="btn primary">Run</button>
    </div>
    <div class="ov-examples" id="examples"></div>
    <label class="ov-check"><input type="checkbox" id="speak" checked> Spoken reply</label>
    <div class="ov-reply" id="reply" style="display:none"></div>
  </section>
</div>

<!-- ═════ Slots (O2) ═════ -->
<div data-panel="slots">
  <div class="ov-stats">
    <div><span class="label" id="sKeptL">Kept today</span> <span class="num" id="sKept">₹0</span></div>
    <div><span class="label">Booked</span> <span class="num" id="sBooked">0/17</span></div>
    <div><span class="label">App fees</span> <span class="num" id="sFees">₹0</span></div>
    <div><span class="label">Clashes stopped</span> <span class="num" id="sConf">0</span></div>
    <span class="spacer"></span>
    <div class="seg" id="days"><button data-day="today">Today</button><button data-day="tomorrow">Tomorrow</button></div>
  </div>
  <div class="grid ov-g2">
    <section class="card span-12 ov-boardcard">
      <div class="card-h">Hours by channel <span class="label" id="boardAside"></span><span class="spacer"></span>
        <button id="aggBtn" class="btn sm" title="Simulate an inbound marketplace booking">${OI.store}Marketplace booking</button>
        <button id="offBtn" class="btn sm" title="Walk-in, phone call or owner block">${OI.person}Offline booking</button>
      </div>
      <div class="ov-boardwrap"><table id="grid" class="ov-board"></table></div>
      <p class="ov-foot">Click a free marketplace cell to simulate a booking there. Click a free walk-in cell to add a walk-in, phone booking or block. Click a WhatsApp cell to ask for it in the chat demo. Click your own booking to cancel it, or a taken cell to test a clash.</p>
      <p class="ov-foot">Marketplace fees (Playon 20%, Hurdle 15%, Distinct 18%) are assumptions. The marketplaces are simulated.</p>
    </section>
  </div>
</div>

<!-- ═════ Pricing ═════ -->
<div class="grid" data-panel="pricing">
  <section class="card span-7">
    <div class="card-h">Pricing decisions <span class="label">Free slots, today and tomorrow</span><span class="spacer"></span>
      <button id="optBtn" class="btn primary">${I.spark}Optimise prices</button></div>
    <div class="ov-reasons" id="reasons"><div class="mut">Tap Optimise to reprice free slots per channel. Marketplace price changes are posted automatically.</div></div>
  </section>
  <section class="card span-5">
    <div class="card-h">How prices are set</div>
    <table class="ov-rules" id="bandTable"></table>
    <table class="ov-rules" id="guardTable"></table>
  </section>
</div>

<!-- ═════ Customers (rendered by growth-ui.js) ═════ -->
<div data-panel="customers"><div id="growthTab"></div></div>

<!-- ═════ Channel sync ═════ -->
<div class="grid" data-panel="sync">
  <section class="card span-7">
    <div class="card-h">Channel router<span class="spacer"></span>
      <span class="seg" id="feedTabs"><button data-f="postings" class="active">Postings</button><button data-f="activity">Activity</button></span></div>
    <p class="ov-explain">When a slot sells on one channel, the router blocks it on every other marketplace and confirms the booking. Marketplace calls are simulated.</p>
    <div class="ov-syncstats" id="syncStats"></div>
    <div class="ov-feed" id="feed"></div>
  </section>
  <section class="card span-5 ov-wa">
    <div class="card-h">WhatsApp booking <span class="label">Demo chat</span><span class="spacer"></span><span id="chatPicker"></span></div>
    <div class="ov-wa-head">
      <div class="ov-avatar">KA</div>
      <div><b>Kickoff Arena</b><small id="waSub">Business account · replies instantly</small></div>
    </div>
    <div class="ov-wa-body" id="waBody"></div>
    <form class="ov-wa-comp" id="waForm">
      <input id="waInput" autocomplete="off" placeholder="Message">
      <button type="submit" class="btn" aria-label="Send">${OI.send}</button>
    </form>
    <div class="ov-examples" id="waSugg"></div>
    <p class="ov-explain">The bot checks availability, holds the slot for 5 minutes while the customer pays, and confirms the booking when payment arrives.</p>
  </section>
</div>
`;

// ───────── Helpers ─────────
const chLabel = id => id === 'offline' ? 'Walk-in / phone' : E.chName(id);
const mk = id => `<span class="mark" style="background:var(--c-${id})"></span>`;
const feeLabel = id => E.ch(id).comm ? Math.round(E.ch(id).comm * 100) + '% fee' : 'No fee';
const mmss = hd => { const left = Math.max(0, Math.round((hd.expires - Date.now()) / 1000)); return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; };
// Server log lines carry symbols, emoji and em dashes; the UI shows plain text.
const plain = s => String(s ?? '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2300}-\u{23FF}›‍️]/gu, m => m === '→' ? '→' : '')
  .replace(/\s*—\s*/g, ' · ').replace(/\s{2,}/g, ' ').trim();
const h12 = s => String(s).replace(/\b(\d{1,2}):00\b/g, (m, h) => hShort(+h));
function dayStats(d) {
  let kept = 0, fees = 0, booked = 0, blocked = 0;
  for (const h of E.HOURS) { const b = S.slots[d][h].booking; if (!b) continue;
    if (b.kind === 'owner') { blocked++; continue; } booked++; kept += b.net; fees += b.price - b.net; }
  const left = E.HOURS.filter(h => { const s = S.slots[d][h]; return !s.booking && !s.hold && !E.isPast(d, h); }).length;
  return { kept, fees, booked, blocked, left };
}

// ───────── Today: focal number + hour strip ─────────
function renderToday() {
  const st = dayStats('today');
  $('kKept').textContent = rupee(st.kept);
  $('kKeptSub').textContent = `${st.booked} of ${E.HOURS.length} hours booked · ${rupee(st.fees)} paid in app fees · ${st.left} hour${st.left === 1 ? '' : 's'} left to sell today` + (st.blocked ? ` · ${st.blocked} closed by you` : '');
  $('strip').innerHTML = E.HOURS.map(h => {
    const sl = S.slots.today[h], b = sl.booking, hd = sl.hold;
    let cls = 'h', style = '', title = `${hShort(h)} · `;
    if (b && b.kind === 'owner') { cls += ' blk'; title += `Closed by owner${b.note ? ' · ' + plain(b.note) : ''}`; }
    else if (b) { cls += ' bk'; style = `--chc:var(--c-${b.channel})`; title += `${b.customer} · ${chLabel(b.channel)} · kept ${rupee(b.net)}`; }
    else if (hd) { cls += ' hold'; title += `On hold ${mmss(hd)} · ${hd.customer} · WhatsApp`; }
    else title += E.isPast('today', h) ? 'Not sold' : `Free · ${rupee(E.listed(sl, 'today', h, 'whatsapp'))} on WhatsApp`;
    if (E.isOver('today', h)) cls += ' past';
    if (isLive('today', h)) { cls += ' now'; title += ' · now'; }
    const lbl = [6, 9, 12, 15, 18, 21].includes(h) ? `<i>${hShort(h)}</i>` : '';
    return `<div class="${cls}" style="${style}" title="${esc(title)}">${b && b.kind === 'owner' ? I.lock : ''}${lbl}</div>`;
  }).join('');
}
$('stripLegend').innerHTML = E.CHANNELS.map(c => `<span>${mk(c.id)}${chLabel(c.id)}</span>`).join('') +
  '<span><span class="mark ov-free"></span>Free</span><span><span class="mark ov-holdm"></span>On hold</span><span><span class="mark ov-nowm"></span>Now</span>';

// ───────── Today: coming up + channel split ─────────
let leftTab = 'today';   // kept for sheets.js' hold-countdown interval (re-renders the board when on Slots)
function renderUpcoming() {
  const rows = [];
  for (const d of E.DAYS) for (const h of E.HOURS) {
    if (rows.length >= 4 || E.isOver(d, h)) continue;
    const sl = S.slots[d][h], b = sl.booking, hd = sl.hold;
    const when = d === 'tomorrow' ? ' · Tomorrow' : isLive(d, h) ? ' · Playing now' : '';
    if (hd) rows.push(`<div class="row up"><div class="t">${hShort(h)}</div><div class="grow"><div>${esc(hd.customer)}</div><div class="m">${mk('whatsapp')}WhatsApp${when}</div></div>
      <div class="right"><span class="chip warn">${I.clock}On hold ${mmss(hd)}</span></div></div>`);
    else if (b && b.kind !== 'owner') {
      const st = b.status === 'arrived' ? ' · Checked in' : b.status === 'no_show' ? ' · No-show' : '';
      rows.push(`<div class="row up click" data-d="${d}" data-h="${h}" title="Click to cancel ${esc(b.ref)}"><div class="t">${hShort(h)}</div>
        <div class="grow"><div>${esc(b.customer)}</div><div class="m">${mk(b.channel)}${chLabel(b.channel)}${when}${st}</div></div>
        <div class="right">${rupee(b.net)}<div class="m">kept</div></div></div>`);
    }
  }
  const html = rows.length ? rows.join('') : '<div class="empty">No bookings coming up yet. They appear here from WhatsApp, the apps or the desk.</div>';
  if (renderUpcoming.html !== html) { renderUpcoming.html = html; $('uplist').innerHTML = html; }
}
$('uplist').addEventListener('click', e => {
  const r = e.target.closest('.up[data-d]'); if (!r) return; const d = r.dataset.d, h = +r.dataset.h, b = S.slots[d][h].booking;
  if (b && confirm(`Cancel ${b.ref} for ${b.customer}? The slot reopens on every marketplace.`)) api('/api/cancel', { day: d, hour: h });
});
$('toSlots').onclick = () => setTab('slots');

function renderSplit() {
  const per = Object.fromEntries(E.CHANNELS.map(c => [c.id, { n: 0, fee: 0 }])); let total = 0;
  for (const d of E.DAYS) for (const h of E.HOURS) { const b = S.slots[d][h].booking; if (!b || b.kind === 'owner') continue;
    per[b.channel].n++; per[b.channel].fee += b.price - b.net; total++; }
  const direct = per.whatsapp.n + per.offline.n;
  $('splitAside').textContent = total ? `Today and tomorrow · ${Math.round(direct / total * 100)}% direct, no fee` : 'Today and tomorrow · no bookings yet';
  $('sbar').innerHTML = total ? E.CHANNELS.map(c => per[c.id].n ? `<span style="flex:${per[c.id].n};background:var(--c-${c.id})" title="${chLabel(c.id)}: ${per[c.id].n}"></span>` : '').join('') : '<span class="ov-none"></span>';
  $('srows').innerHTML = E.CHANNELS.map(c => { const x = per[c.id];
    return `<div class="row ov-srow"><div class="grow">${mk(c.id)}${chLabel(c.id)}</div><div class="m">${x.n} booking${x.n === 1 ? '' : 's'}</div>
      <div class="right m ov-fee">${c.comm ? `${rupee(x.fee)} in fees` : 'No fee'}</div></div>`; }).join('');
}

// ───────── Slots: stats line + hours by channel board ─────────
function renderSlotStats() {
  const st = dayStats(view);
  $('sKeptL').textContent = view === 'today' ? 'Kept today' : 'Kept tomorrow';
  $('sKept').textContent = rupee(st.kept); $('sBooked').textContent = `${st.booked}/${E.HOURS.length}`;
  $('sFees').textContent = rupee(st.fees); $('sConf').textContent = S.stats.conflicts;
  $('boardAside').textContent = `${E.dayLabel(view)} · ${E.dayDate(view).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}${E.isWeekend(view) ? ' · Weekend prices' : ''}`;
}
function postNote(d, h, c) {
  const p = S.postings.find(p => p.day === d && p.hour === h && p.target === c && (p.type === 'BLOCK' || p.type === 'CONFIRM'));
  if (!p) return '';
  return p.status === 'acked' ? `${p.type === 'CONFIRM' ? 'Confirmed' : 'Blocked'} in ${p.ms} ms` : p.status === 'retrying' ? 'Retrying' : 'Posting';
}
let flash = { k: null, t: 0 };
function renderGrid() {
  let html = '<thead><tr><th></th>' + E.CHANNELS.map(c => `<th>${mk(c.id)}${chLabel(c.id)}<span>${feeLabel(c.id)}</span></th>`).join('') + '</tr></thead><tbody>';
  // Hours that are already over fold into one summary row (expandable), so the board opens on what can still be sold.
  const over = E.HOURS.filter(h => E.isOver(view, h));
  if (over.length > 1) {
    const sold = over.map(h => S.slots[view][h].booking).filter(b => b && b.kind !== 'owner');
    html += `<tr class="past fold"><td class="hr">${hShort(over[0])}<span>to ${hShort(over[over.length - 1])}</span></td><td colspan="${E.CHANNELS.length}" class="foldcell"><span>Earlier today · ${sold.length ? sold.map(b => `${esc(b.customer)} (${chLabel(b.channel)})`).join(', ') : 'nothing sold'}</span><button type="button" class="btn quiet sm" data-fold="1">${renderGrid.showPast ? 'Hide' : 'Show'}</button></td></tr>`;
  }
  for (const h of E.HOURS) {
    if (over.length > 1 && !renderGrid.showPast && E.isOver(view, h)) continue;
    const sl = S.slots[view][h], b = sl.booking, hd = sl.hold;
    html += `<tr class="${E.isOver(view, h) ? 'past' : ''} ${isLive(view, h) ? 'now' : ''}"><td class="hr">${hShort(h)}<span>${isLive(view, h) ? 'Now' : E.band(h).label}</span></td>`;
    for (const c of E.CHANNELS) {
      const k = `${view}|${h}|${c.id}`, fl = flash.k === k && Date.now() - flash.t < 1200 ? ' flash' : '';
      let cls = 'cell', body = '', title = '';
      if (b && b.kind === 'owner') { cls += ' closed'; body = `<div class="p">${I.lock}Closed</div><div class="n">${esc(plain(b.note) || 'by owner')}</div>`; title = 'Closed by owner. Click to reopen.'; }
      else if (b && b.channel === c.id) {
        const st = b.status === 'arrived' ? ' · Checked in' : b.status === 'no_show' ? ' · No-show' : '';
        cls += ' bk'; body = `<div class="p">${esc(b.customer)} · ${rupee(b.price)}</div><div class="n">${esc(b.ref)}${c.comm ? ` · keep ${rupee(b.net)}` : ''}${st}</div>`; title = `Booked on ${chLabel(c.id)}. Click to cancel.`;
      } else if (b) { cls += ' taken'; body = `<div class="p">Taken</div><div class="n">${c.marketplace ? postNote(view, h, c.id) || 'via ' + chLabel(b.channel) : 'via ' + chLabel(b.channel)}</div>`; title = `Sold on ${chLabel(b.channel)}. Click to try a clash.`; }
      else if (hd) {
        if (c.id === 'whatsapp') { cls += ' hold'; body = `<div class="p">${I.clock}On hold ${mmss(hd)}</div><div class="n">${esc(hd.customer)} · ${rupee(hd.price)}</div>`; title = 'Waiting for payment on WhatsApp'; }
        else { cls += ' taken'; body = `<div class="p">Held</div><div class="n">${c.marketplace ? postNote(view, h, c.id) || 'WhatsApp payment' : 'WhatsApp payment'}</div>`; title = 'On a WhatsApp payment hold. Click to try a clash.'; }
      } else if (E.closedFor(view, h, c.id)) { cls += ' gone'; body = `<div class="n">${E.isOver(view, h) ? 'Over' : 'Started'}</div>`; }
      else if (sl.closed[c.id]) { cls += ' closed'; body = `<div class="p">${I.lock}Closed</div><div class="n">${c.marketplace ? postNote(view, h, c.id) || 'by owner' : 'by owner'}</div>`; title = `Closed by owner. Click to reopen on ${chLabel(c.id)}.`; }
      else {
        const p = E.listed(sl, view, h, c.id), why = sl.reason[c.id] || (sl.override[c.id] != null ? 'Price set by owner' : '');
        const disc = sl.disc[c.id] ? ` <span class="disc">−${sl.disc[c.id]}%</span>` : '';
        cls += ' free'; body = `<div class="p">${rupee(p)}${disc}${why ? `<span class="spark" title="${esc(why)}">${I.spark}</span>` : ''}</div><div class="n">${c.comm ? 'keep ' + rupee(E.net(p, c.id)) : ''}</div>`;
        title = why ? why : c.marketplace ? `Simulate a ${c.name} booking` : c.id === 'offline' ? 'Add a walk-in, phone booking or block' : 'Ask for this slot in the WhatsApp demo';
      }
      html += `<td class="${cls}${fl}" data-k="${k}" title="${esc(title)}">${body}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody>';
  if (renderGrid.html !== html) { renderGrid.html = html; $('grid').innerHTML = html; }   // unchanged board: keep the DOM so clicks are not lost mid-press
}

// ───────── Channel sync: router feed ─────────
function renderFeed() {
  const acked = S.postings.filter(p => p.status === 'acked').length, retried = S.postings.filter(p => p.attempt > 1).length;
  $('syncStats').innerHTML = `<span><b>${S.stats.postings}</b> postings sent</span><span><b>${S.postings.length ? Math.round(acked / S.postings.length * 100) : 0}%</b> confirmed</span><span><b>${retried}</b> retried</span><span><b>${S.stats.mcpCalls}</b> bot tool calls</span>`;
  const f = $('feed');
  if (feedTab === 'postings') {
    if (!S.postings.length) { f.innerHTML = '<div class="empty">No postings yet. Book on any channel and the router blocks that hour on the other marketplaces.</div>'; return; }
    f.innerHTML = S.postings.slice(0, 60).map(p => {
      const isNew = !seenPostings.has(p.id); seenPostings.add(p.id);
      const st = p.status === 'acked' ? `${I.check}${p.ms} ms${p.attempt > 1 ? ' · retried' : ''}` : p.status === 'retrying' ? 'Retrying' : '<span class="spin"></span>Posting';
      return `<div class="ov-prow ${isNew ? 'new' : ''}"><span class="ov-pill ${p.type}">${p.type}</span>
        <div class="w"><div>${mk(p.target)}<b>${E.chName(p.target)}</b> · ${E.dayLabel(p.day)} ${hShort(p.hour)}${p.price ? ' · ' + rupee(p.price) : ''}</div><small class="mono">${esc(p.endpoint)} · ${esc(plain(p.reason))}${p.ref ? ' · ' + p.ref : ''}</small></div>
        <span class="st ${p.status}">${st}</span></div>`;
    }).join('');
  } else {
    f.innerHTML = '<div class="ov-act">' + S.events.slice(0, 80).map(e => `<div class="${e.kind}"><time>${new Date(e.ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</time>${esc(plain(e.text))}</div>`).join('') + '</div>';
  }
}

// ───────── Channel sync: WhatsApp demo ─────────
const fmtMsg = t => esc(String(t).replace(/\s*—\s*/g, '. ')).replace(/(upi:\/\/[^\s]+)/g, '<a href="#" data-pay="1">$1</a>');
function renderChat() {
  const chats = S.chats; if (!chats.find(c => c.phone === chatSel)) chatSel = 'sim';
  const hasReal = chats.length > 1;
  $('chatPicker').innerHTML = hasReal ? `<select id="chatSel">${chats.map(c => `<option value="${esc(c.phone)}" ${c.phone === chatSel ? 'selected' : ''}>${c.real ? 'Live · ' : 'Demo · '}${esc(c.name)}</option>`).join('')}</select>` : '';
  const c = chats.find(x => x.phone === chatSel); if (!c) return;
  $('waSub').textContent = c.real ? `Live chat with ${c.name} · the bot replies on WhatsApp` : `Demo customer ${c.name} · Business account`;
  $('waInput').disabled = c.real; $('waInput').placeholder = c.real ? 'Live chat. The bot replies on WhatsApp.' : 'Message';
  const body = $('waBody'), last = c.msgs.length - 1;
  const key = c.phone + ':' + c.msgs.length + ':' + c.typing;
  if (renderChat.key === key) return; renderChat.key = key;
  body.innerHTML = (c.msgs.length ? '' : '<div class="empty">Send a message as the customer, for example "kal shaam 7 baje turf chahiye".</div>') + c.msgs.map((m, i) => {
    const t = new Date(m.ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    let h = `<div class="bub ${m.from}">${fmtMsg(m.text)}<span class="t">${t}</span></div>`;
    if (m.buttons?.length && i === last && !c.real) h += `<div class="wbtns">${m.buttons.map(b => `<button class="chip" data-send="${esc(b.send)}">${esc(b.label)}</button>`).join('')}</div>`;
    return h;
  }).join('') + (c.typing ? '<div class="typing"><i></i><i></i><i></i></div>' : '');
  body.scrollTop = body.scrollHeight;
}
function waSend(text) { if (!String(text).trim()) return; api('/api/wa/sim', { text, name: 'Priya' }); $('waInput').value = ''; }
$('waForm').onsubmit = e => { e.preventDefault(); waSend($('waInput').value); };
$('waBody').addEventListener('click', e => {
  const b = e.target.closest('[data-send]'); if (b) return waSend(b.dataset.send);
  if (e.target.closest('[data-pay]')) { e.preventDefault(); waSend('paid'); }
});
document.addEventListener('change', e => { if (e.target.id === 'chatSel') { chatSel = e.target.value; renderChat.key = null; renderChat(); } });
const WA_SUGG = ['Hi', 'kal shaam 7 baje turf chahiye', 'aaj raat 9 baje slot hai?', 'kal ke slots dikhao', 'paid', 'cancel'];
$('waSugg').innerHTML = WA_SUGG.map(s => `<button class="chip">${s}</button>`).join('');
$('waSugg').onclick = e => { const b = e.target.closest('.chip'); if (b) waSend(b.textContent); };
const hinglish = (d, h) => `${d === 'today' ? 'aaj' : 'kal'} ${h < 12 ? 'subah' : h < 17 ? 'dopahar' : h < 20 ? 'shaam' : 'raat'} ${h % 12 || 12} baje turf chahiye`;

// ───────── Board interactions: every booking channel ─────────
$('grid').addEventListener('click', async e => {
  const td = e.target.closest('td.cell'); if (!td) return;
  const [d, hs, c] = td.dataset.k.split('|'), h = +hs, sl = S.slots[d][h];
  if (sl.booking && (sl.booking.channel === c || sl.booking.kind === 'owner')) {
    if (confirm(sl.booking.kind === 'owner' ? 'Remove this owner block?' : `Cancel ${sl.booking.ref} for ${sl.booking.customer}?`)) api('/api/cancel', { day: d, hour: h });
    return;
  }
  if (sl.booking || sl.hold) {   // race: another channel tries a sold/held slot → engine rejects it
    const r = await api('/api/book', { day: d, hour: h, channel: c, customer: `${E.chName(c)} customer`, kind: E.ch(c).source });
    if (!r.ok) { toast(`Clash blocked. ${r.error === 'held' ? 'The slot is on a WhatsApp payment hold.' : 'Already sold on ' + E.chName(r.booked_via) + '.'}`); flash = { k: td.dataset.k, t: Date.now() }; renderGrid(); }
    return;
  }
  if (E.closedFor(d, h, c)) return toast('This slot has already started');
  if (sl.closed[c]) { api('/api/owner/actions', { actions: [{ type: 'unblock', day: d, start_hour: h, end_hour: h + 1, channels: [c] }] }); toast(`Reopened ${hShort(h)} on ${chLabel(c)}`); return; }
  if (E.ch(c).marketplace) return aggBook(d, h, c);
  if (c === 'offline') return openOffline(d, h);
  if (c === 'whatsapp') { chatSel = 'sim'; renderChat.key = null; setTab('sync'); $('waInput').value = hinglish(d, h); $('waInput').focus(); toast('WhatsApp bookings come through the chat. Press Send.'); }
});
async function aggBook(d, h, c) {
  const r = await api('/api/book', { day: d, hour: h, channel: c, customer: `${E.chName(c)} user`, kind: 'aggregator' });
  toast(r.ok ? `${E.chName(c)} booking ${r.booking.ref}. Other marketplaces blocked.` : `Rejected: ${r.error}`);
  return r;
}
$('aggBtn').onclick = () => {
  const free = E.HOURS.filter(h => { const s = S.slots[view][h]; return !s.booking && !s.hold && !E.isPast(view, h); });
  if (!free.length) return toast('No free slots');
  const pref = free.filter(h => E.band(h).label === 'Peak'), pool = pref.length ? pref : free;
  aggBook(view, pool[Math.floor(Math.random() * pool.length)], E.MARKETPLACES[Math.floor(Math.random() * E.MARKETPLACES.length)]);
};

// ───────── Pricing: rules table (from engine.js) ─────────
function renderRules() {
  const bands = [['Peak', '6 to 8 AM, 6 to 10 PM', 18], ['Shoulder', '8 to 10 AM, 4 to 6 PM, 10 to 11 PM', 16], ['Off-peak', '10 AM to 4 PM', 12]];
  const key = E.dayDate('today').toDateString(); if (renderRules.key === key) return; renderRules.key = key;
  $('bandTable').innerHTML = `<thead><tr><th>Band</th><th>Hours</th><th class="right">×</th><th class="right">Today</th><th class="right">Tomorrow</th></tr></thead><tbody>` +
    bands.map(([n, hrs, h]) => `<tr><td>${n}</td><td class="mut">${hrs}</td><td class="right">×${E.band(h).m.toFixed(1)}</td><td class="right">${rupee(E.rulePrice('today', h))}</td><td class="right">${rupee(E.rulePrice('tomorrow', h))}</td></tr>`).join('') + '</tbody>';
  const floors = E.MARKETPLACES.map(m => `${E.chName(m)} ${rupee(E.floorListed(m))}`).join(', ');
  $('guardTable').innerHTML = `<tbody>
    <tr><td>Base price</td><td class="right">${rupee(E.BASE)} an hour</td></tr>
    <tr><td>Weekend</td><td class="right">×1.2</td></tr>
    <tr><td>Minimum kept per booking<div class="mut">Lowest app prices: ${floors}</div></td><td class="right">${rupee(E.NET_FLOOR)}</td></tr>
    <tr><td>Highest price</td><td class="right">${rupee(E.CEIL)}</td></tr>
    <tr><td>AI can move a price</td><td class="right">±${Math.round(E.AI_BAND * 100)}% of the rule price</td></tr>
    <tr><td>What AI can change</td><td class="right">Free slots only</td></tr></tbody>`;
}

// ───────── AI pricing ─────────
const OPT_SYSTEM = `You are a revenue manager for a 5-a-side football turf in Bengaluru, India.
Channels and commission: whatsapp (0%, direct), aggA = Playon (20%), aggB = Hurdle (15%), aggC = Distinct (18%), offline (0%, walk-in).
Goal: maximise NET revenue to the venue and fill empty slots. Rules:
- Only change FREE slots. Never touch booked or held slots.
- Prices: multiples of 10, max ${E.CEIL} INR, net-to-venue at least ${E.NET_FLOOR} INR, within ±30% of the current price.
- Push demand to whatsapp (zero commission): keep whatsapp the cheapest or equal-cheapest channel in peak slots.
- Free peak slots can carry a premium on aggregators to recover commission. Free off-peak slots get discounts (bigger on whatsapp).
- Return at most 10 changes, each with a short, specific reason (max 15 words).
Respond with ONLY JSON: {"changes":[{"day":"today|tomorrow","hour":<6-22>,"channel":"whatsapp|aggA|aggB|aggC|offline","new_price":<int>,"reason":"..."}],"summary":"one sentence"}`;
function snapshotForAI() {
  const out = {};
  for (const d of E.DAYS) out[d] = { weekend: E.isWeekend(d), slots: E.HOURS.map(h => { const sl = S.slots[d][h];
    const st = sl.booking ? 'booked' : sl.hold ? 'held' : 'free';
    return { hour: h, band: E.band(h).label, status: st, prices: st === 'free' ? Object.fromEntries(E.CH_IDS.filter(c => !sl.closed[c]).map(c => [c, E.listed(sl, d, h, c)])) : undefined }; }) };
  return out;
}
function fallbackOptimise() {
  const off = [], peak = [];
  for (const d of [view, ...E.DAYS.filter(x => x !== view)]) for (const h of E.HOURS) {
    const sl = S.slots[d][h]; if (sl.booking || sl.hold || E.isPast(d, h)) continue; const b = E.band(h).label, base = E.rulePrice(d, h);
    if (b === 'Off-peak') { off.push({ day: d, hour: h, channel: 'whatsapp', new_price: base * .8, reason: 'Off-peak: 20% off on WhatsApp to fill with zero commission' });
      off.push({ day: d, hour: h, channel: 'aggB', new_price: base * .9, reason: 'Discovery at 10% off; 15% commission beats an empty slot' }); }
    else if (b === 'Peak') peak.push({ day: d, hour: h, channel: 'aggA', new_price: base * 1.15, reason: 'Peak demand: +15% on Playon recovers its 20% commission' });
  }
  return { changes: [...off.slice(0, 6), ...peak.slice(0, 4)], summary: 'Discount slow afternoon slots, add a premium on the highest-fee app at peak.' };
}
function extractJSON(text) {
  text = String(text).replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```json|```/g, '');
  const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b < a) throw new Error('No JSON'); return JSON.parse(text.slice(a, b + 1));
}
async function aiChat(system, user) {
  const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system, user }), signal: AbortSignal.timeout(8000) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error); return j.content;
}
$('optBtn').onclick = async () => {
  const btn = $('optBtn'); btn.innerHTML = '<span class="spin"></span>Thinking'; btn.disabled = true;
  let res, src = 'Sarvam AI';
  try { if (!aiOnline) throw 0; res = extractJSON(await aiChat(OPT_SYSTEM, 'Current inventory:\n' + JSON.stringify(snapshotForAI()))); if (!Array.isArray(res.changes)) throw 0; }
  catch { src = 'Rule-based'; res = fallbackOptimise(); }
  try {
    const r = await api('/api/pricing/apply', { changes: res.changes, source: src });
    $('reasons').innerHTML = `<div class="ov-sum"><span class="chip">${src}</span><span>${esc(plain(res.summary || ''))}</span><span class="mut">${r.applied.length} applied${r.rejected ? ` · ${r.rejected} stopped by the rules` : ''}</span></div>` +
      (r.applied.length ? r.applied.map(x => `<div class="row ov-reason"><div class="grow"><div><b>${E.dayLabel(x.day)} · ${hShort(x.hour)}</b> <span class="m">${mk(x.channel)}${chLabel(x.channel)}</span></div><div class="m">${esc(plain(x.reason))}</div></div>
        <div class="right"><span class="ov-old">${rupee(x.old)}</span> → <b>${rupee(x.new)}</b><div class="m">${src}</div></div></div>`).join('') : '<div class="empty">No free slots to reprice.</div>');
  } finally { btn.innerHTML = I.spark + 'Optimise prices'; btn.disabled = false; }
};

// ───────── Owner commands ─────────
const CMD_SYSTEM = `You convert a sports-venue owner's command (Hindi, Hinglish or English) into JSON actions.
Channels: whatsapp ("direct"/"WhatsApp"), aggA ("Playon"), aggB ("Hurdle"), aggC ("Distinct"), offline ("walk-in"/"counter"). "all" = every channel. "apps"/"marketplaces" = aggA, aggB and aggC.
Days: "today" (aaj) or "tomorrow" (kal, always tomorrow). Hours are 24h integers 6..23, start inclusive, end exclusive. "shaam 7" = 19, "raat 9" = 21, "subah 7" = 7, "dopahar 3" = 15. A bare hour 1-11 without subah/morning/am means PM. A single hour "7 baje" means 19 to 20.
Action types: block (stop selling), unblock (reopen), book (exactly one channel), set_discount (value = percent 1-50), set_price (value = INR), clear (remove discount/price override).
Respond ONLY with JSON: {"actions":[{"type":"...","day":"today|tomorrow","start_hour":<int>,"end_hour":<int>,"channels":["whatsapp"|"aggA"|"aggB"|"aggC"|"offline"|"all"],"value":<number|null>}],"reply_hi":"short confirmation in Hindi (Devanagari)"}
If unclear, return {"actions":[],"reply_hi":"<ask for clarification in Hindi>"}.`;
function fallbackParse(t) {
  const s = t.toLowerCase();
  const day = /kal|tomorrow|कल/.test(s) ? 'tomorrow' : 'today';
  const am = /subah|morning|\bam\b|सुबह/.test(s);
  const pct = (s.match(/(\d+)\s*(%|percent)/) || [])[1];
  const nums = (s.match(/\d+(?=\s*(?:baje|bje|बजे|am|pm|se|to|tak|-|–|\s|$))/g) || []).map(Number).filter(n => n <= 23 && String(n) !== pct);
  const hrs = nums.map(n => (!am && n >= 1 && n <= 11) ? n + 12 : n);
  let start = hrs[0] ?? 18, end = hrs[1] ?? start + 1; if (end <= start) end = start + 1;
  const channels = [];
  if (/direct|whatsapp/.test(s)) channels.push('whatsapp');
  if (/playon|play on/.test(s)) channels.push('aggA');
  if (/hurdle/.test(s)) channels.push('aggB');
  if (/distinct/.test(s)) channels.push('aggC');
  if (/\bapps?\b|marketplace|aggregator/.test(s) && !channels.some(c => E.MARKETPLACES.includes(c))) channels.push(...E.MARKETPLACES);
  if (/walk|offline|counter/.test(s)) channels.push('offline');
  if (!channels.length) channels.push('all');
  let type = 'block';
  if (/clear|hatao|हटाओ/.test(s)) type = 'clear'; else if (/discount|chhoot|off|%|छूट/.test(s)) type = 'set_discount';
  else if (/khol|open|unblock|chalu|खोल/.test(s)) type = 'unblock'; else if (/book/.test(s)) type = 'book'; else if (/price|daam|rate|₹|rs/.test(s)) type = 'set_price';
  const value = type === 'set_discount' ? +(pct || 10) : type === 'set_price' ? +((s.match(/(?:₹|rs\.?\s*)(\d+)/) || [])[1] || 1000) : null;
  return { actions: [{ type, day, start_hour: start, end_hour: end, channels, value }], reply_hi: null };
}
const HI = { clear: 'से छूट हटा दी', block: 'बंद कर दिए', unblock: 'फिर से खोल दिए', set_discount: 'पर छूट लगा दी', set_price: 'का दाम बदल दिया', book: 'बुक कर दिए' };
const hindiReply = a => !a.length ? 'माफ़ कीजिए, कमांड समझ नहीं आई।' : `ठीक है, ${a[0].day === 'tomorrow' ? 'कल' : 'आज'} ${a[0].start_hour} से ${a[0].end_hour} बजे तक के स्लॉट ${HI[a[0].type] || 'अपडेट कर दिए'}। सभी मार्केटप्लेस पर पोस्ट हो गया।`;
async function runCommand() {
  const text = $('cmd').value.trim(); if (!text) return;
  const btn = $('runBtn'); btn.innerHTML = '<span class="spin"></span>'; btn.disabled = true;
  let res, src = 'Sarvam AI';
  try { if (!aiOnline) throw 0; res = extractJSON(await aiChat(CMD_SYSTEM, text)); if (!Array.isArray(res.actions)) throw 0; }
  catch { src = 'Rule-based parser'; res = fallbackParse(text); }
  try {
    const r = await api('/api/owner/actions', { actions: res.actions });
    const reply = res.reply_hi || hindiReply(res.actions);
    $('reply').style.display = 'block';
    $('reply').innerHTML = `<b>${esc(plain(reply))}</b><div class="m">${src} · ${r.done.map(x => esc(h12(plain(x)))).join('<br>') || 'no changes'}${r.rejected.length ? '<br>Skipped: ' + r.rejected.map(x => esc(plain(x))).join('; ') : ''}</div>`;
    if ($('speak').checked) speak(reply);
  } finally { btn.innerHTML = 'Run'; btn.disabled = false; }
}
async function speak(text) {
  try { if (!aiOnline) throw 0; const j = await api('/api/tts', { text }); if (!j.audio) throw 0; await new Audio('data:audio/wav;base64,' + j.audio).play(); }
  catch { try { const u = new SpeechSynthesisUtterance(text); u.lang = 'hi-IN'; speechSynthesis.speak(u); } catch {} }
}
let rec, chunks = [];
async function toggleMic() {
  const btn = $('micBtn');
  if (rec && rec.state === 'recording') { rec.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    rec = new MediaRecorder(stream); chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop()); btn.classList.remove('rec'); btn.innerHTML = '<span class="spin"></span>';
      try { const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        const r = await fetch('/api/stt', { method: 'POST', body: blob, headers: { 'Content-Type': blob.type } }); const j = await r.json(); if (!r.ok) throw new Error(j.error);
        $('cmd').value = j.transcript; btn.innerHTML = I.mic + 'Speak'; if (j.transcript) runCommand(); }
      catch { toast('Could not hear that. Type the command instead.'); btn.innerHTML = I.mic + 'Speak'; }
    };
    rec.start(); btn.classList.add('rec'); btn.innerHTML = I.stop + 'Stop';
  } catch { toast('Mic unavailable'); }
}
const EXAMPLES = ['kal shaam 7 se 9 Hurdle pe band karo', 'aaj dopahar 12 se 4 whatsapp pe 20% discount do', 'आज रात 9 बजे सब चैनल पर बंद करो'];
$('examples').innerHTML = EXAMPLES.map(x => `<button class="chip">${x}</button>`).join('');
$('examples').onclick = e => { const b = e.target.closest('.chip'); if (b) { $('cmd').value = b.textContent; $('cmd').focus(); } };
$('runBtn').onclick = runCommand; $('micBtn').onclick = toggleMic;
$('cmd').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runCommand(); } });
document.addEventListener('keydown', e => {
  if (/TEXTAREA|INPUT|SELECT/.test(e.target.tagName) || $('offSheet')?.open) return;
  if (role === 'staff' || $('bkSheet')?.open) return;
  if (e.key === 'r' || e.key === 'R') $('resetBtn').click();
  if (e.key === 'o' || e.key === 'O') { aiForcedOff = !aiForcedOff; render(); toast(aiForcedOff ? 'Offline mode on' : 'Offline mode off'); }
});

if (location.hash === '#tomorrow') view = 'tomorrow';

// Hold countdowns and the "now" marker. sheets.js also ticks holds; a second render is harmless.
let ownerTick = 0;
setInterval(() => {
  if (!S || role !== 'owner') return; ownerTick++;
  const held = E.DAYS.some(d => E.HOURS.some(h => S.slots[d][h].hold));
  if (held || ownerTick % 30 === 0) { renderToday(); renderUpcoming(); renderGrid(); }
}, 1000);

// Owner render entry point (called by core render() on every live state update).
function renderOwner() {
  leftTab = tab();
  renderToday(); renderUpcoming(); renderSplit();
  renderSlotStats(); renderGrid();
  renderRules();
  renderFeed(); renderChat();
  if (tab() === 'customers' && window.Growth) Growth.render();
}

// ───────── Day toggle, feed toggle, reset (moved from sheets.js) ─────────
document.querySelectorAll('#days button').forEach(b => b.onclick = () => { view = b.dataset.day; render(); });
if ($('feedTabs')) $('feedTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; feedTab = b.dataset.f; document.querySelectorAll('#feedTabs button').forEach(x => x.classList.toggle('active', x === b)); if (typeof renderFeed === 'function') renderFeed(); };
if ($('resetBtn')) $('resetBtn').onclick = () => {
  api('/api/reset');
  if ($('reasons')) $('reasons').innerHTML = '<div class="mut">Tap Optimise to reprice free slots per channel.</div>';
  if ($('reply')) $('reply').style.display = 'none';
  seenPostings = new Set(); if (typeof renderChat === 'function') renderChat.key = null;
};

// Fold / unfold the hours that are over (capture phase so the cell click handler never sees it)
$('grid').addEventListener('click', e => { if (e.target.closest('[data-fold]')) { e.stopImmediatePropagation(); renderGrid.showPast = !renderGrid.showPast; renderGrid(); } }, true);

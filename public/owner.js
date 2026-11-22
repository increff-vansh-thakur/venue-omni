// VenueBuddy · owner view
// Markup for #ownerView lives here so each view owns its own HTML.
document.getElementById('ownerView').innerHTML = `
<nav class="otabs" id="ownerTabs" role="tablist" aria-label="Owner sections">
  <button data-o="bookings" class="active"><svg class="i" viewBox="0 0 24 24"><path d="M7 2h2v2h6V2h2v2h3v17H4V4h3zm11 7H6v10h12zM8 11h3v3H8z"/></svg>Bookings</button>
  <button data-o="growth"><svg class="i" viewBox="0 0 24 24"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.3 3.1-6 7-6s7 2.7 7 6v1H2zm15.5-6c2.8.3 4.5 2.4 4.5 5v2h-4v-1c0-2.4-.9-4.5-2.5-6z"/></svg>Customers &amp; Growth</button>
</nav>
<div id="bookingsTab">
<section class="kpis">
  <div class="kpi"><div class="l"><svg class="i" viewBox="0 0 24 24"><path d="M7 2h2v2h6V2h2v2h3v17H4V4h3zm11 7H6v10h12z"/></svg>Bookings</div><div class="v num" id="kBookings">0</div><div class="s" id="kSplit">—</div></div>
  <div class="kpi"><div class="l"><svg class="i" viewBox="0 0 24 24"><path d="M4 20h16v2H2V4h2zm3-3V11h3v6zm5 0V7h3v10zm5 0v-4h3v4z"/></svg>Occupancy</div><div class="v num" id="kOcc">0%</div><div class="s">of 34 slots · 2 days</div></div>
  <div class="kpi good"><div class="l"><svg class="i" viewBox="0 0 24 24"><path d="M6 3h12v2h-3.3c.6.6 1 1.3 1.2 2H18v2h-2.1a5 5 0 0 1-4.9 4h-.6l6 7h-2.7l-6-7V11h3.3a3 3 0 0 0 2.8-2H6V7h8.8A3 3 0 0 0 12 5H6z"/></svg>Net Revenue to Venue</div><div class="v num" id="kNet">₹0</div><div class="s" id="kPaid">₹0 commission paid</div></div>
  <div class="kpi good"><div class="l"><svg class="i" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>Commission Saved</div><div class="v num" id="kSaved">₹0</div><div class="s">WhatsApp + Offline vs cheapest app</div></div>
  <div class="kpi blue"><div class="l"><svg class="i" viewBox="0 0 24 24"><path d="M3 20.5V14l9-2-9-2V3.5L22 12z"/></svg>Marketplace Postings</div><div class="v num" id="kPost">0</div><div class="s" id="kAck">—</div></div>
  <div class="kpi bad"><div class="l"><svg class="i" viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5z"/></svg>Double Bookings Blocked</div><div class="v num" id="kConf">0</div><div class="s" id="kMcp">0 MCP tool calls</div></div>
</section>

<main>
  <div class="col">
    <section class="card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--blue)"><path d="M11 2v10h10A10 10 0 0 0 11 2zM9 4.1A10 10 0 1 0 19.9 15H9z"/></svg>Channel Split<span class="aside" id="splitAside">—</span></h3>
      <div class="sbar" id="sbar"></div>
      <div class="srows" id="srows"></div>
    </section>
    <section class="card">
      <div class="toolbar">
        <div class="segmented" id="leftTabs"><button data-t="upcoming" class="active">Upcoming</button><button data-t="slots">All Slots</button></div>
        <div class="segmented" id="days" hidden><button data-day="today">Today</button><button data-day="tomorrow">Tomorrow</button></div>
        <span style="flex:1"></span>
        <button id="aggBtn" title="Simulate an inbound marketplace booking"><svg class="i" viewBox="0 0 24 24"><path d="M4 4h16v4H4zM4 10h7v10H4zM13 10h7v4h-7zM13 16h7v4h-7z"/></svg>Marketplace Booking</button>
        <button id="offBtn" class="gray"><svg class="i" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c5 0 9 2.5 9 5.5V22H3v-2.5C3 16.5 7 14 12 14z"/></svg>Offline Booking</button>
        <button id="optBtn" class="primary"><svg class="i" viewBox="0 0 24 24"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>Optimise</button>
      </div>
      <div id="upWrap">
        <div class="uphead"><span>Time</span><span>Customer · channel</span><span>Blocked on other marketplaces</span><span>Status</span></div>
        <div class="uplist" id="uplist"></div>
      </div>
      <div id="slotsWrap" hidden>
        <div class="legend">
          <span><i class="dot" style="background:#25D366"></i>WhatsApp</span>
          <span id="mkLegend"></span>
          <span><i class="dot" style="background:var(--gray)"></i>Offline / walk-in</span>
          <span><i class="dot" style="background:var(--orange)"></i>Payment hold</span>
          <span><i class="dot" style="background:var(--red)"></i>Blocked on marketplace</span>
        </div>
        <table id="grid"></table>
        <div class="foot">Marketplace columns: tap to simulate an inbound booking · Offline: tap to add a walk-in, phone booking or owner block · WhatsApp: tap to ask for that slot in the chat · Tap your own booking to cancel · Tap a sold slot on another channel to test a double booking</div>
      </div>
    </section>
  </div>

  <section class="card">
    <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--wa)"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>
      WhatsApp Booking<span class="aside" id="chatPicker"></span></h3>
    <div class="phone">
      <div class="wa-head">
        <div class="avatar">KA</div>
        <div><b>Kickoff Arena ✓</b><small id="waSub">Business account · replies instantly</small></div>
      </div>
      <div class="wa-body" id="waBody"></div>
      <form class="wa-comp" id="waForm">
        <input id="waInput" autocomplete="off" placeholder="Message">
        <button type="submit" aria-label="Send"><svg class="i" viewBox="0 0 24 24"><path d="M3 20.5V14l9-2-9-2V3.5L22 12z"/></svg></button>
      </form>
    </div>
    <div class="sugg" id="waSugg"></div>
    <div class="note">The bot books only through MCP tools on this server: <code>check_availability</code> → <code>hold_slot</code> → <code>confirm_booking</code></div>
  </section>

  <div class="col side">
    <section class="card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--blue)"><path d="M6 3a3 3 0 0 1 1 5.83V11h4a3 3 0 0 0 3-3v-.17a3 3 0 1 1 2 0V8a5 5 0 0 1-5 5H7v2.17a3 3 0 1 1-2 0V8.83A3 3 0 0 1 6 3z"/></svg>Channel Router
        <span class="aside"><span class="segmented" id="feedTabs"><button data-f="postings" class="active">Postings</button><button data-f="activity">Activity</button></span></span></h3>
      <div class="feed" id="feed"></div>
    </section>
    <section class="card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--blue)"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>Owner Command</h3>
      <textarea id="cmd" placeholder="Hindi, Hinglish or English — e.g. kal shaam 7 se 9 Hurdle pe band karo"></textarea>
      <div class="sugg" id="examples"></div>
      <div class="row">
        <button id="runBtn" class="primary">Run</button>
        <button id="micBtn"><svg class="i" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0h-2a5 5 0 0 1-10 0zM11 18h2v4h-2z"/></svg>Speak</button>
        <label class="switch"><input type="checkbox" id="speak" checked> Spoken reply</label>
      </div>
      <div class="reply" id="reply"></div>
    </section>
    <section class="card">
      <h3><svg class="i" viewBox="0 0 24 24" style="color:var(--purple)"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9z"/></svg>AI Pricing Decisions</h3>
      <div class="reasons" id="reasons"><div class="mut">Tap Optimise to reprice free slots per channel. Marketplace price changes are posted automatically.</div></div>
    </section>
  </div>
</main>
</div>
<div id="growthTab" hidden></div>
`;

function renderGrid() {
  const now = Date.now();
  let html = '<tr><th>Slot</th>' + E.CHANNELS.map(c => `<th><span class="src">${logo(c.id, 18)}${c.name}</span><div class="c">${c.sub}</div></th>`).join('') + '</tr>';
  for (const h of E.HOURS) {
    const sl = S.slots[view][h];
    html += `<tr><td class="time">${E.hLabel(h)}<span>${E.band(h).label}</span></td>`;
    for (const c of E.CHANNELS) {
      const k = `${view}|${h}|${c.id}`, b = sl.booking, hd = sl.hold;
      if (b) {
        if (b.kind === 'owner') html += `<td class="cell owner" data-k="${k}"><div class="lockmsg">${I.wrench}Owner block</div><div class="n">${c.marketplace ? postStatus(view, h, c.id) || esc(b.note) : esc(b.note)}</div></td>`;
        else if (b.channel === c.id) html += `<td class="cell mine" style="--src:${SRC_COLOR[c.id]}" data-k="${k}"><div class="lockmsg">${I.check}${esc(b.ref)} · ${rupee(b.price)}</div><div class="n">${esc(b.customer)} · net ${rupee(b.net)}${b.status === 'arrived' ? ' · ✓ in' : b.status === 'no_show' ? ' · no-show' : ''}</div></td>`;
        else if (c.marketplace) html += `<td class="cell blocked" data-k="${k}"><div class="lockmsg">${I.lock}Blocked</div><div class="n">${postStatus(view, h, c.id) || 'sold via ' + E.chName(b.channel)}</div></td>`;
        else html += `<td class="cell sold" data-k="${k}"><div class="lockmsg">${I.lock}Sold</div><div class="n">via ${E.chName(b.channel)}</div></td>`;
      } else if (hd) {
        const left = Math.max(0, Math.round((hd.expires - now) / 1000)), mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
        if (c.id === 'whatsapp') html += `<td class="cell hold" data-k="${k}"><div class="lockmsg">${I.clock}Hold ${mm}</div><div class="n">${esc(hd.customer)} · ${rupee(hd.price)}</div></td>`;
        else if (c.marketplace) html += `<td class="cell blocked" data-k="${k}"><div class="lockmsg">${I.lock}Blocked</div><div class="n">${postStatus(view, h, c.id) || 'payment hold'}</div></td>`;
        else html += `<td class="cell sold" data-k="${k}"><div class="lockmsg">${I.clock}Held</div><div class="n">WhatsApp payment</div></td>`;
      } else if (E.closedFor(view, h, c.id)) {
        html += `<td class="cell sold" data-k="${k}" style="opacity:.5"><div class="lockmsg">Past</div><div class="n">slot started</div></td>`;
      } else if (sl.closed[c.id]) {
        html += `<td class="cell closed" data-k="${k}"><div class="lockmsg">${I.xmark}Closed</div><div class="n">${c.marketplace ? postStatus(view, h, c.id) || 'by owner' : 'by owner'}</div></td>`;
      } else {
        const p = E.listed(sl, view, h, c.id), ai = sl.reason[c.id];
        const disc = sl.disc[c.id] ? `<span class="disc"> −${sl.disc[c.id]}%</span>` : '';
        html += `<td class="cell ${ai ? 'ai' : ''}" data-k="${k}" title="${ai ? 'AI: ' + esc(ai) : ''}">${ai ? `<span class="tag">${I.spark}</span>` : ''}<div class="p">${rupee(p)}${disc}</div><div class="n">net ${rupee(E.net(p, c.id))}</div></td>`;
      }
    }
    html += '</tr>';
  }
  $('grid').innerHTML = html;
}

// ───────── Owner: channel split + upcoming bookings ─────────
let leftTab = 'upcoming';
function renderSplit() {
  const per = Object.fromEntries(E.CHANNELS.map(c => [c.id, { n: 0, net: 0, comm: 0 }])); let total = 0;
  for (const d of E.DAYS) for (const h of E.HOURS) { const b = S.slots[d][h].booking; if (!b || b.kind === 'owner') continue;
    per[b.channel].n++; per[b.channel].net += b.net; per[b.channel].comm += b.price * E.ch(b.channel).comm; total++; }
  const maxN = Math.max(...E.CHANNELS.map(c => per[c.id].n));
  const leaders = E.CHANNELS.filter(c => per[c.id].n === maxN && maxN > 0);
  const top = leaders.length === 1 ? leaders[0] : null;   // only highlight a clear winner
  const direct = per.whatsapp.n + per.offline.n;
  $('splitAside').textContent = total ? `${total} bookings · ${Math.round(direct / total * 100)}% direct, no commission` : 'no bookings yet';
  $('sbar').innerHTML = E.CHANNELS.map(c => per[c.id].n ? `<i style="width:${per[c.id].n / total * 100}%;background:${c.color}" title="${c.name}: ${per[c.id].n}"></i>` : '').join('');
  $('srows').innerHTML = E.CHANNELS.map(c => { const x = per[c.id], pc = total ? Math.round(x.n / total * 100) : 0;
    return `<div class="sr ${top && c.id === top.id ? 'top' : ''}" style="--c:${c.color}" title="${c.name}: ${x.n} bookings, net ${rupee(x.net)}"><div class="h">${logo(c.id, 18)}${c.name}</div>
      <div class="pc">${pc}%</div><div class="m">${x.n} booking${x.n === 1 ? '' : 's'}</div>
      <div class="m">net ${rupee(x.net)}</div>
      <div class="m">${c.comm ? `−${rupee(x.comm)} fees` : 'no fees'}</div></div>`; }).join('');
  if (top) $('splitAside').textContent += ` · top: ${top.name}`;
}
function startsIn(d, h) {
  const t = E.dayDate(d); t.setHours(h, 0, 0, 0); const m = Math.round((t - Date.now()) / 60000);
  if (m <= 0) return 'playing now';
  return m < 60 ? `in ${m}m` : `in ${Math.floor(m / 60)}h ${m % 60}m`;
}
function syncChips(d, h, src, seeded) {
  return E.MARKETPLACES.map(m => {
    if (m === src) return `<span class="sync src" title="Booked on ${E.chName(m)}">${logo(m, 22)}</span>`;
    const p = S.postings.find(p => p.day === d && p.hour === h && p.target === m && p.type === 'BLOCK');
    const st = p ? p.status : (seeded ? 'acked' : 'pending');
    const tip = p ? `Blocked on ${E.chName(m)} · ${p.status === 'acked' ? p.ms + 'ms' : p.status}${p.attempt > 1 ? ' · retried' : ''}` : `Blocked on ${E.chName(m)}`;
    return `<span class="sync ${st}" title="${tip}">${logo(m, 22)}<i>${st === 'acked' ? '✓' : '…'}</i></span>`;
  }).join('');
}
function renderUpcoming() {
  const rows = []; let lastDay = null;
  for (const d of E.DAYS) for (const h of E.HOURS) {
    if (E.isOver(d, h)) continue;
    const sl = S.slots[d][h], b = sl.booking, hd = sl.hold; if (!b && !hd) continue;
    if (d !== lastDay) { rows.push(`<div class="daysep">${E.dayLabel(d)} · ${E.dayDate(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>`); lastDay = d; }
    const time = `<div class="ut"><b>${E.hLabel(h)}</b><small>${startsIn(d, h)}</small></div>`;
    if (hd) {
      const left = Math.max(0, Math.round((hd.expires - Date.now()) / 1000));
      rows.push(`<div class="up hold" data-d="${d}" data-h="${h}">${time}
        <div class="uw">${logo('whatsapp', 30)}<div><b>${esc(hd.customer)}</b><small>WhatsApp · ${rupee(hd.price)} · ${hd.ref}</small></div></div>
        <div class="us">${syncChips(d, h, null, false)}</div>
        <span class="chipst hold">Paying · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span></div>`);
    } else if (b.kind === 'owner') {
      rows.push(`<div class="up owner" data-d="${d}" data-h="${h}">${time}
        <div class="uw">${logo('offline', 30)}<div><b>Owner block</b><small>${esc(b.note || 'Blocked')}</small></div></div>
        <div class="us">${syncChips(d, h, null, b.seeded)}</div><span class="chipst mut">Off sale</span></div>`);
    } else {
      const c = E.ch(b.channel);
      const st = b.status === 'arrived' ? '<span class="chipst in">Checked in</span>' : b.status === 'no_show' ? '<span class="chipst ns">No-show</span>' : '<span class="chipst ok">Confirmed</span>';
      rows.push(`<div class="up" data-d="${d}" data-h="${h}">${time}
        <div class="uw">${logo(b.channel, 30)}<div><b>${esc(b.customer)}</b><small>${c.name} · ${rupee(b.price)}${c.comm ? ` · net ${rupee(b.net)}` : ''} · ${b.ref}</small></div></div>
        <div class="us">${syncChips(d, h, b.channel, b.seeded)}</div>${st}</div>`);
    }
  }
  $('uplist').innerHTML = rows.length ? rows.join('') : '<div class="mut" style="padding:16px">No upcoming bookings yet. Book from WhatsApp, a marketplace, or the desk.</div>';
}
$('uplist').addEventListener('click', e => {
  const r = e.target.closest('.up'); if (!r) return; const d = r.dataset.d, h = +r.dataset.h, sl = S.slots[d][h];
  if (sl.booking && confirm(sl.booking.kind === 'owner' ? 'Remove this owner block?' : `Cancel ${sl.booking.ref} for ${sl.booking.customer}? Unblocks go to every marketplace.`)) api('/api/cancel', { day: d, hour: h });
});
$('leftTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; leftTab = b.dataset.t;
  document.querySelectorAll('#leftTabs button').forEach(x => x.classList.toggle('active', x === b));
  $('upWrap').hidden = leftTab !== 'upcoming'; $('slotsWrap').hidden = $('days').hidden = leftTab !== 'slots'; render(); };
$('mkLegend').innerHTML = E.MARKETPLACES.map(m => `<span style="display:inline-flex;gap:5px;align-items:center;margin-right:10px">${logo(m, 14)}${E.chName(m)}</span>`).join('');

function renderKpis() {
  let n = 0, occ = 0, rev = 0, paid = 0, saved = 0; const split = { whatsapp: 0, aggregator: 0, offline: 0 };
  for (const d of E.DAYS) for (const h of E.HOURS) {
    const b = S.slots[d][h].booking; if (!b) continue; occ++;
    if (b.kind === 'owner') continue;
    const c = E.ch(b.channel); n++; rev += b.net; paid += b.price * c.comm; split[c.source]++;
    if (!c.marketplace) saved += b.price * E.SAVED_RATE;
  }
  $('kBookings').textContent = n; $('kSplit').textContent = `WhatsApp ${split.whatsapp} · Apps ${split.aggregator} · Offline ${split.offline}`;
  $('kOcc').textContent = Math.round(occ / 34 * 100) + '%';
  $('kNet').textContent = rupee(rev); $('kPaid').textContent = `${rupee(paid)} commission paid`; $('kSaved').textContent = rupee(saved);
  $('kPost').textContent = S.stats.postings;
  const acked = S.postings.filter(p => p.status === 'acked').length;
  $('kAck').textContent = S.postings.length ? `${Math.round(acked / S.postings.length * 100)}% acked · ${S.postings.filter(p => p.attempt > 1).length} retried` : 'none yet';
  $('kConf').textContent = S.stats.conflicts; $('kMcp').textContent = `${S.stats.mcpCalls} MCP tool calls`;
}

function renderFeed() {
  const f = $('feed');
  if (feedTab === 'postings') {
    if (!S.postings.length) { f.innerHTML = '<div class="act mut">No postings yet. Book from any channel and the router posts BLOCKs to the other marketplaces.</div>'; return; }
    f.innerHTML = S.postings.slice(0, 60).map(p => {
      const isNew = !seenPostings.has(p.id); seenPostings.add(p.id);
      const st = p.status === 'acked' ? `✓ ${p.ms}ms${p.attempt > 1 ? ' · retried' : ''}` : p.status === 'retrying' ? '↻ Retrying' : '<span class="spin"></span>';
      return `<div class="prow ${isNew ? 'new' : ''}"><span class="pill ${p.type}">${p.type}</span>
        <div class="w">${logo(p.target, 15)} <b>${E.chName(p.target)}</b> · ${E.dayLabel(p.day)} ${E.hLabel(p.hour)}${p.price ? ' · ' + rupee(p.price) : ''}<small>${esc(p.endpoint)} · ${esc(p.reason)}${p.ref ? ' · ' + p.ref : ''}</small></div>
        <span class="st ${p.status}">${st}</span></div>`;
    }).join('');
  } else {
    f.innerHTML = '<div class="act">' + S.events.slice(0, 80).map(e => `<div class="${e.kind}">${new Date(e.ts).toLocaleTimeString('en-IN', { hour12: false })}  ${esc(e.text)}</div>`).join('') + '</div>';
  }
}

// ───────── WhatsApp phone ─────────
const fmtMsg = t => esc(t).replace(/(upi:\/\/[^\s]+)/g, '<a href="#" data-pay="1">$1</a>');
function renderChat() {
  const chats = S.chats; if (!chats.find(c => c.phone === chatSel)) chatSel = 'sim';
  const hasReal = chats.length > 1;
  $('chatPicker').innerHTML = hasReal ? `<select id="chatSel">${chats.map(c => `<option value="${esc(c.phone)}" ${c.phone === chatSel ? 'selected' : ''}>${c.real ? 'Live · ' : 'Demo · '}${esc(c.name)}</option>`).join('')}</select>` : '';
  const c = chats.find(x => x.phone === chatSel); if (!c) return;
  $('waSub').textContent = c.real ? `Live chat with ${c.name} · bot replies on WhatsApp` : `Demo customer: ${c.name} · Business account`;
  $('waInput').disabled = c.real; $('waInput').placeholder = c.real ? 'Live chat — the bot replies on WhatsApp' : 'Message';
  const body = $('waBody'), last = c.msgs.length - 1;
  const key = c.phone + ':' + c.msgs.length + ':' + c.typing;
  if (renderChat.key === key) return; renderChat.key = key;
  body.innerHTML = c.msgs.map((m, i) => {
    const t = new Date(m.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    let h = `<div class="bub ${m.from}">${fmtMsg(m.text)}<span class="t">${t}${m.from === 'user' ? ' ✓✓' : ''}</span></div>`;
    if (m.buttons?.length && i === last && !c.real) h += `<div class="wbtns">${m.buttons.map(b => `<button data-send="${esc(b.send)}">${esc(b.label)}</button>`).join('')}</div>`;
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
$('waSugg').onclick = e => { if (e.target.classList.contains('chip')) waSend(e.target.textContent); };
const hinglish = (d, h) => `${d === 'today' ? 'aaj' : 'kal'} ${h < 12 ? 'subah' : h < 17 ? 'dopahar' : h < 20 ? 'shaam' : 'raat'} ${h % 12 || 12} baje turf chahiye`;

// ───────── Grid interactions: the three booking channels ─────────
$('grid').addEventListener('click', async e => {
  const td = e.target.closest('td.cell'); if (!td) return;
  const [d, hs, c] = td.dataset.k.split('|'), h = +hs, sl = S.slots[d][h];
  if (sl.booking && (sl.booking.channel === c || sl.booking.kind === 'owner')) {
    if (confirm(sl.booking.kind === 'owner' ? 'Remove owner block?' : `Cancel ${sl.booking.ref}?`)) api('/api/cancel', { day: d, hour: h });
    return;
  }
  if (sl.booking || sl.hold) {   // race: another channel tries a sold/held slot → engine rejects it
    const r = await api('/api/book', { day: d, hour: h, channel: c, customer: `${E.chName(c)} customer`, kind: E.ch(c).source });
    if (!r.ok) { toast(`Double booking blocked — ${r.error === 'held' ? 'slot is on a WhatsApp payment hold' : 'already sold via ' + E.chName(r.booked_via)}`); const el = document.querySelector(`td[data-k="${td.dataset.k}"]`); if (el) { el.classList.add('flash'); } }
    return;
  }
  if (E.closedFor(d, h, c)) return toast('This slot has already started');
  if (sl.closed[c]) { api('/api/owner/actions', { actions: [{ type: 'unblock', day: d, start_hour: h, end_hour: h + 1, channels: [c] }] }); return; }
  if (E.ch(c).marketplace) return aggBook(d, h, c);
  if (c === 'offline') return openOffline(d, h);
  if (c === 'whatsapp') { chatSel = 'sim'; $('waInput').value = hinglish(d, h); $('waInput').focus(); toast('WhatsApp bookings come through the chat — press Send'); }
});
async function aggBook(d, h, c) {
  const r = await api('/api/book', { day: d, hour: h, channel: c, customer: `${E.chName(c)} user`, kind: 'aggregator' });
  toast(r.ok ? `${E.chName(c)} booking ${r.booking.ref} — blocking the other marketplaces` : `Rejected: ${r.error}`);
  return r;
}
$('aggBtn').onclick = () => {
  const free = E.HOURS.filter(h => { const s = S.slots[view][h]; return !s.booking && !s.hold && !E.isPast(view, h); });
  if (!free.length) return toast('No free slots');
  const pref = free.filter(h => E.band(h).label === 'Peak'), pool = pref.length ? pref : free;
  aggBook(view, pool[Math.floor(Math.random() * pool.length)], E.MARKETPLACES[Math.floor(Math.random() * E.MARKETPLACES.length)]);
};


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
  return { changes: [...off.slice(0, 6), ...peak.slice(0, 4)], summary: 'Rule-based: discount dead slots, premium on high-commission marketplaces at peak.' };
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
  const btn = $('optBtn'); btn.innerHTML = '<span class="spin"></span> Thinking…'; btn.disabled = true;
  let res, src = 'Sarvam AI';
  try { if (!aiOnline) throw 0; res = extractJSON(await aiChat(OPT_SYSTEM, 'Current inventory:\n' + JSON.stringify(snapshotForAI()))); if (!Array.isArray(res.changes)) throw 0; }
  catch { src = 'Fallback rules'; res = fallbackOptimise(); }
  const r = await api('/api/pricing/apply', { changes: res.changes, source: src });
  $('reasons').innerHTML = `<div class="ai"><b>${src}</b>: ${esc(res.summary || '')} (${r.applied.length} applied${r.rejected ? `, ${r.rejected} rejected by guardrails` : ''})</div>` +
    r.applied.map(x => `<div><b>${E.dayLabel(x.day)} ${E.hLabel(x.hour)} · ${E.chName(x.channel)}</b>: ${rupee(x.old)} → <b class="${x.new < x.old ? 'ok' : 'ai'}">${rupee(x.new)}</b><br><span class="mut">${esc(x.reason)}</span></div>`).join('');
  btn.innerHTML = I.spark + 'Optimise'; btn.disabled = false;
};

// ───────── Owner commands ─────────
const CMD_SYSTEM = `You convert a sports-venue owner's command (Hindi, Hinglish or English) into JSON actions.
Channels: whatsapp ("direct"/"WhatsApp"), aggA ("Playon"), aggB ("Hurdle"), aggC ("Distinct"), offline ("walk-in"/"counter"). "all" = every channel. "apps"/"marketplaces" = aggA, aggB and aggC.
Days: "today" (aaj) or "tomorrow" (kal — always tomorrow). Hours are 24h integers 6..23, start inclusive, end exclusive. "shaam 7" = 19, "raat 9" = 21, "subah 7" = 7, "dopahar 3" = 15. A bare hour 1-11 without subah/morning/am means PM. A single hour "7 baje" means 19 to 20.
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
  catch { src = 'Fallback parser'; res = fallbackParse(text); }
  const r = await api('/api/owner/actions', { actions: res.actions });
  const reply = res.reply_hi || hindiReply(res.actions);
  $('reply').style.display = 'block';
  $('reply').innerHTML = `<b>${esc(reply)}</b><div class="mut" style="margin-top:4px;font-size:12px">${src} · ${r.done.map(esc).join('<br>') || 'no changes'}${r.rejected.length ? '<br>Skipped: ' + r.rejected.map(esc).join('; ') : ''}</div>`;
  btn.innerHTML = 'Run'; btn.disabled = false;
  if ($('speak').checked) speak(reply);
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
      catch { toast('Mic transcription failed — type the command'); btn.innerHTML = I.mic + 'Speak'; }
    };
    rec.start(); btn.classList.add('rec'); btn.innerHTML = I.stop + 'Stop';
  } catch { toast('Mic unavailable'); }
}
const EXAMPLES = ['kal shaam 7 se 9 Hurdle pe band karo', 'aaj dopahar 12 se 4 whatsapp pe 20% discount do', 'आज रात 9 बजे सब चैनल पर बंद करो'];
$('examples').innerHTML = EXAMPLES.map(x => `<button class="chip">${x}</button>`).join('');
$('examples').onclick = e => { if (e.target.classList.contains('chip')) $('cmd').value = e.target.textContent; };
$('runBtn').onclick = runCommand; $('micBtn').onclick = toggleMic;
$('cmd').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runCommand(); } });
document.addEventListener('keydown', e => {
  if (/TEXTAREA|INPUT|SELECT/.test(e.target.tagName) || $('offSheet').open) return;
  if (role === 'staff' || $('bkSheet').open) return;
  if (e.key === 'r' || e.key === 'R') $('resetBtn').click();
  if (e.key === 'o' || e.key === 'O') { aiForcedOff = !aiForcedOff; render(); toast(aiForcedOff ? 'Offline mode on' : 'Offline mode off'); }
});

if (location.hash === '#tomorrow') view = 'tomorrow';

// Owner render entry point (called by core render()).
function renderOwner() {
  renderSplit(); renderUpcoming(); if (leftTab === 'slots') renderGrid(); renderKpis(); renderFeed(); renderChat();
  if (window.Growth) Growth.render();
}

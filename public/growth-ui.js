// Customers & Growth tab (owner). Uses globals from index.html: S, E, $, api, toast, esc, rupee, logo.
(function () {
  const GI = {
    users: '<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.3 3.1-6 7-6s7 2.7 7 6v1H2zm15.5-6c2.8.3 4.5 2.4 4.5 5v2h-4v-1c0-2.4-.9-4.5-2.5-6z"/>',
    trophy: '<path d="M7 3h10v2h4v3a5 5 0 0 1-4.6 5A5 5 0 0 1 13 15.9V18h3v3H8v-3h3v-2.1A5 5 0 0 1 7.6 13 5 5 0 0 1 3 8V5h4zm0 4H5v1a3 3 0 0 0 2 2.8zm10 0v3.8A3 3 0 0 0 19 8V7z"/>',
    tag: '<path d="M3 3h8l10 10-8 8L3 11zm4.5 2.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>',
    clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.5 2-1 1.7L11 13V6h2z"/>',
    send: '<path d="M3 20.5V14l9-2-9-2V3.5L22 12z"/>',
    heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    repeat: '<path d="M7 7h10V4l4 4-4 4V9H7v3H5V9a2 2 0 0 1 2-2zm10 10H7v3l-4-4 4-4v3h10v-3h2v3a2 2 0 0 1-2 2z"/>',
    arrow: '<path d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z"/>',
    gift: '<path d="M20 7h-2.2A3 3 0 0 0 12 4.4 3 3 0 0 0 6.2 7H4v5h1v8h14v-8h1zM9 5.5a1.5 1.5 0 0 1 1.5 1.5H9a.75.75 0 0 1 0-1.5zm6 0a.75.75 0 0 1 0 1.5h-1.5A1.5 1.5 0 0 1 15 5.5zM11 18H7v-6h4zm0-8H6V9h5zm6 8h-4v-6h4zm1-8h-5V9h5z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    calendar: '<path d="M7 2h2v2h6V2h2v2h3v17H4V4h3zm11 7H6v10h12z"/>',
    sparkle: '<path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9z"/>',
    megaphone: '<path d="M3 10v4h3l5 4V6L6 10zm13-3v10a5 5 0 0 0 0-10zm2-4v2a9 9 0 0 1 0 14v2a11 11 0 0 0 0-18z"/>',
    x: '<path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z"/>',
    search: '<path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>',
    rupee: '<path d="M6 3h12v2h-3.3c.6.6 1 1.3 1.2 2H18v2h-2.1a5 5 0 0 1-4.9 4h-.6l6 7h-2.7l-6-7V11h3.3a3 3 0 0 0 2.8-2H6V7h8.8A3 3 0 0 0 12 5H6z"/>',
    chart: '<path d="M4 20h16v2H2V4h2zm3-3V11h3v6zm5 0V7h3v10zm5 0v-4h3v4z"/>',
    alert: '<path d="M12 2 1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z"/>',
    check: '<path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.6 8 19.2 6.6z"/>',
    chat: '<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
    plus: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>',
    funnel: '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
    target: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
    whistle: '<path d="M9 7a6 6 0 1 0 5.6 8H22v-4h-8.4A6 6 0 0 0 9 7zm0 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8 2h2v3H8z"/>',
  };
  const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${GI[n] || GI.sparkle}</svg>`;
  const SEGC = { new: 'var(--blue)', regular: 'var(--green)', active: 'var(--teal)', at_risk: 'var(--orange)', lapsed: 'var(--red)', won_back: 'var(--purple)' };
  const SEGI = { new: 'sparkle', regular: 'heart', active: 'bolt', at_risk: 'alert', lapsed: 'clock', won_back: 'repeat' };
  const SEGD = { new: 'First game in the last 2 weeks', regular: '4+ games in 30 days', active: '1–3 games in 30 days', at_risk: 'Was regular · quiet 15–35 days', lapsed: 'Not seen in 35+ days', won_back: 'Was at risk / lapsed · booked again' };
  const ORDER = ['regular', 'active', 'new', 'at_risk', 'lapsed', 'won_back'];
  const SUBP = new URLSearchParams(location.search).get('sub');
  let sub = ['players', 'events', 'discounts', 'nudges'].includes(SUBP) ? SUBP : 'players', segFilter = 'all', q = '', sortBy = 'games', shellFor = null, otab = 'bookings';

  const segChip = (s, L) => `<span class="segc" style="--c:${SEGC[s]}">${ic(SEGI[s])}${esc(L[s])}</span>`;
  const initials = n => n.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const mask = p => p === 'sim' ? 'Demo phone' : p.startsWith('sim-') ? 'WhatsApp' : /@/.test(p) ? '+' + p.split('@')[0] : p.replace(/(\+91 9)\d{4} \d(\d{4})/, '$1xxxx x$2');
  const ago = d => d == null ? '—' : d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`;
  const inTime = ts => { const m = Math.round((ts - Date.now()) / 60000); if (m <= 0) return 'due now'; if (m < 60) return `in ${m}m`; if (m < 1440) return `in ${Math.floor(m / 60)}h ${m % 60}m`; return `in ${Math.floor(m / 1440)}d`; };
  const hLbl = h => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
  const pct = x => Math.round(x * 100) + '%';

  // ───────── Owner tabs ─────────
  const tabsEl = document.getElementById('ownerTabs');
  function setOwnerTab(t) {
    otab = t;
    tabsEl.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.o === t));
    document.getElementById('bookingsTab').hidden = t !== 'bookings';
    document.getElementById('growthTab').hidden = t !== 'growth';
    try { const u = new URL(location); if (t === 'growth') u.searchParams.set('tab', 'growth'); else u.searchParams.delete('tab'); history.replaceState(null, '', u); } catch {}
    render();
  }
  tabsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setOwnerTab(b.dataset.o); });
  if (new URLSearchParams(location.search).get('tab') === 'growth') setTimeout(() => setOwnerTab('growth'), 0);

  // ───────── Shell ─────────
  const root = document.getElementById('growthTab');
  root.innerHTML = `
    <section class="kpis" id="gKpis"></section>
    <section class="card segstrip" id="gSegs"></section>
    <main class="gmain">
      <section class="card">
        <div class="gtabs" id="gTabs">
          ${[['players', 'users', 'Players'], ['events', 'trophy', 'Tournaments &amp; Events'], ['discounts', 'tag', 'Discount Strategies'], ['nudges', 'clock', 'Scheduled Nudges']]
            .map(([k, i, l]) => `<button data-s="${k}" class="${k === sub ? 'active' : ''}">${ic(i)}${l}</button>`).join('')}
        </div>
        <div id="gPane"></div>
      </section>
      <aside class="col">
        <section class="card"><h3>${ic('send', 'wa-c')}WhatsApp Outbox<span class="aside" id="obAside"></span></h3><div class="outbox" id="gOut"></div></section>
        <section class="card"><h3>${ic('chart', 'blue-c')}Campaign Results</h3><div id="gCamps"></div></section>
      </aside>
    </main>`;
  document.getElementById('gTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; sub = b.dataset.s;
    document.querySelectorAll('#gTabs button').forEach(x => x.classList.toggle('active', x === b)); render(); });

  function render() {
    if (otab !== 'growth' || !S || !S.growth) return;
    const g = S.growth;
    renderKpis(g); renderSegs(g); renderPane(g); renderOutbox(g); renderCamps(g);
  }

  function renderKpis(g) {
    const k = g.kpis;
    $('gKpis').innerHTML = `
      <div class="kpi"><div class="l">${ic('users')}Players</div><div class="v num">${k.players}</div><div class="s">pulled from every channel</div></div>
      <div class="kpi good"><div class="l">${ic('repeat')}Repeat rate</div><div class="v num">${pct(k.repeatRate)}</div><div class="s">played 2+ times in 90 days</div></div>
      <div class="kpi blue"><div class="l">${ic('arrow')}Direct share · 30d</div><div class="v num">${pct(k.directShare)}</div><div class="s">WhatsApp + desk vs apps</div></div>
      <div class="kpi bad"><div class="l">${ic('alert')}At risk + lapsed</div><div class="v num">${k.atRisk}</div><div class="s">${rupee(k.commLeak)} paid to apps on all players</div></div>
      <div class="kpi purple"><div class="l">${ic('heart')}Won back</div><div class="v num">${k.wonBack}</div><div class="s">${k.activeOffers} live offers</div></div>
      <div class="kpi good"><div class="l">${ic('rupee')}Campaign revenue</div><div class="v num">${rupee(k.revenue)}</div><div class="s">${k.sent} sent · ${k.booked} booked · ${k.joined} joined</div></div>`;
  }
  function renderSegs(g) {
    const total = g.players.length || 1;
    $('gSegs').innerHTML = `<div class="sh">${ic('funnel', 'blue-c')}<b>Player segments</b><span class="mut">by how often they play · tap to filter</span></div>
      <div class="sbar2">${ORDER.map(s => g.segs[s] ? `<i style="width:${g.segs[s] / total * 100}%;background:${SEGC[s]}"></i>` : '').join('')}</div>
      <div class="segrow">${ORDER.map(s => `<button class="segcard ${segFilter === s ? 'on' : ''}" data-seg="${s}" style="--c:${SEGC[s]}">
        <span class="t">${ic(SEGI[s])}${g.segLabels[s]}</span><b class="num">${g.segs[s]}</b><small>${SEGD[s]}</small></button>`).join('')}</div>`;
  }
  $('gSegs').addEventListener('click', e => { const b = e.target.closest('[data-seg]'); if (!b) return;
    segFilter = segFilter === b.dataset.seg ? 'all' : b.dataset.seg; sub = 'players';
    document.querySelectorAll('#gTabs button').forEach(x => x.classList.toggle('active', x.dataset.s === 'players')); render(); });

  // ───────── Panes ─────────
  function renderPane(g) {
    if (shellFor !== sub) { shellFor = sub; $('gPane').innerHTML = SHELL[sub](g); bind[sub]?.(); }
    UPDATE[sub](g);
  }
  const SEG_PICK = (name, def, g) => `<div class="segpick" data-name="${name}">${ORDER.filter(s => s !== 'won_back').map(s =>
    `<label class="pick" style="--c:${SEGC[s]}"><input type="checkbox" value="${s}" ${def.includes(s) ? 'checked' : ''}>${ic(SEGI[s])}${g.segLabels[s]}</label>`).join('')}</div>`;
  const picked = el => [...el.querySelectorAll('input:checked')].map(i => i.value);
  const hourOpts = (from, to, sel) => Array.from({ length: to - from + 1 }, (_, i) => from + i).map(h => `<option value="${h}" ${h === sel ? 'selected' : ''}>${hLbl(h)}</option>`).join('');

  const SHELL = {
    players: () => `<div class="ptools">
        <label class="search">${ic('search')}<input id="pq" placeholder="Search name or number" value="${esc(q)}"></label>
        <select id="psort"><option value="games">Most games</option><option value="last">Longest since last game</option><option value="mk">Most app-dependent</option><option value="spend">Highest spend</option></select>
        <span class="mut" id="pcount"></span></div>
      <div class="ptable"><table class="pt"><thead><tr><th>Player</th><th>Found on</th><th>Games · 90d</th><th>Last 12 weeks</th><th>Last played</th><th>Plays every</th><th>Favourite</th><th>Via apps</th><th>Segment</th><th></th></tr></thead><tbody id="ptb"></tbody></table></div>`,
    events: g => `<div class="evgrid">
        <form class="card2" id="evForm">
          <h4>${ic('plus')}Create an event</h4>
          <div class="chips4" id="evType">${[['Tournament', 'trophy'], ['League night', 'calendar'], ['Corporate event', 'users'], ['Coaching camp', 'whistle']].map(([t, i], k) => `<button type="button" data-t="${t}" class="${k ? '' : 'on'}">${ic(i)}${t}</button>`).join('')}</div>
          <div class="field"><label>Name</label><input id="evName" value="Weekend Super 5s"></div>
          <div class="two"><div class="field"><label>Format</label><select id="evFormat"><option>5-a-side knockout</option><option>5-a-side league</option><option>7-a-side knockout</option><option>Futsal round-robin</option></select></div>
            <div class="field"><label>Day</label><select id="evDay"><option value="tomorrow">Tomorrow</option><option value="today">Today</option></select></div></div>
          <div class="two"><div class="field"><label>Starts</label><select id="evStart">${hourOpts(6, 22, 10)}</select></div><div class="field"><label>Ends</label><select id="evEnd">${hourOpts(7, 23, 12)}</select></div></div>
          <div class="three"><div class="field"><label>Teams</label><input id="evTeams" type="number" value="8" min="2"></div><div class="field"><label>Entry ₹/team</label><input id="evFee" type="number" value="1500" step="100"></div><div class="field"><label>Prize</label><input id="evPrize" value="₹8,000 + trophy"></div></div>
          <div class="field"><label>Invite on WhatsApp</label>${SEG_PICK('evSegs', ['regular', 'active', 'at_risk'], g)}</div>
          <div class="note" id="evNote"></div>
          <button class="primary wide" type="submit">${ic('send')}Create &amp; send invites</button>
          <div class="note">${ic('bolt')}Best in dead afternoon slots: the slots are blocked on ${E.MARKETPLACES.map(E.chName).join(', ')} automatically.</div>
        </form>
        <div class="evlist" id="evList"></div></div>`,
    discounts: g => `<div class="explain">${ic('tag', 'blue-c')}<span>Offers are <b>personal WhatsApp-only codes</b>. When the player books on WhatsApp the bot applies the discount automatically, so the booking moves off the marketplaces and the venue pays no commission.</span></div>
      <div class="rgrid" id="rGrid"></div>
      <form class="card2 rnew" id="rForm"><h4>${ic('plus')}New discount rule</h4>
        <div class="field"><label>Name</label><input id="rName" placeholder="e.g. Students weekday deal"></div>
        <div class="field"><label>Who</label>${SEG_PICK('rSegs', ['active'], g)}</div>
        <div class="three"><div class="field"><label>Discount <b id="rPctL">15%</b></label><input id="rPct" type="range" min="5" max="50" step="5" value="15"></div>
          <div class="field"><label>Slots</label><select id="rBand"><option value="any">Any slot</option><option value="offpeak">10 AM–4 PM only</option></select></div>
          <div class="field"><label>Valid</label><select id="rValid"><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option></select></div></div>
        <button class="primary" type="submit">${ic('plus')}Add rule</button></form>`,
    nudges: g => `<div class="explain">${ic('clock', 'blue-c')}<span>Rule-based WhatsApp nudges run on schedule. Each one picks its audience from live play frequency, can attach a discount rule, and tracks replies and bookings.</span></div>
      <div class="alist" id="aList"></div>
      <form class="card2" id="aForm"><h4>${ic('plus')}Schedule a nudge</h4>
        <div class="two"><div class="field"><label>Name</label><input id="aName" placeholder="e.g. Rainy-day indoor push"></div>
          <div class="field"><label>Attach offer</label><select id="aRule"><option value="">No offer · just a reminder</option>${g.rules.map(r => `<option value="${r.id}">${esc(r.name)} · ${r.pct}%</option>`).join('')}</select></div></div>
        <div class="field"><label>Audience</label>${SEG_PICK('aSegs', ['active'], g)}</div>
        <div class="three"><div class="field"><label>Repeat</label><select id="aType"><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
          <div class="field"><label>Day</label><select id="aDow">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => `<option value="${i}" ${i === 5 ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
          <div class="field"><label>Time</label><select id="aHour">${hourOpts(7, 21, 18)}</select></div></div>
        <button class="primary" type="submit">${ic('clock')}Schedule nudge</button></form>`,
  };

  const bind = {
    players() {
      $('pq').addEventListener('input', e => { q = e.target.value.toLowerCase(); render(); });
      $('psort').value = sortBy; $('psort').onchange = e => { sortBy = e.target.value; render(); };
      $('ptb').addEventListener('click', async e => {
        const b = e.target.closest('[data-nudge]'); if (!b) return;
        b.disabled = true; const r = await api('/api/growth/nudge/player', { phone: b.dataset.nudge }); toast(r.ok ? `WhatsApp nudge sent · ${r.rule}` : r.error);
      });
    },
    events() {
      let type = 'Tournament';
      $('evType').onclick = e => { const b = e.target.closest('button'); if (!b) return; type = b.dataset.t; $('evType').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        const nm = { Tournament: 'Weekend Super 5s', 'League night': 'Monday Night League', 'Corporate event': 'Corporate Friday Cup', 'Coaching camp': 'Kids Football Camp' }[type]; $('evName').value = nm; evNote(); };
      ['evDay', 'evStart', 'evEnd', 'evFee', 'evTeams'].forEach(id => $(id).addEventListener('change', evNote));
      $('evForm').querySelector('.segpick').addEventListener('change', evNote);
      $('evForm').onsubmit = async e => {
        e.preventDefault();
        const body = { type, name: $('evName').value, format: $('evFormat').value, day: $('evDay').value, start: +$('evStart').value, end: +$('evEnd').value,
          teamsMax: +$('evTeams').value, fee: +$('evFee').value, prize: $('evPrize').value, segs: picked($('evForm').querySelector('.segpick')) };
        const r = await api('/api/growth/tournament/create', body);
        toast(r.ok ? `${type} created — slots blocked, invites going out on WhatsApp` : r.error);
      };
      evNote();
    },
    discounts() {
      $('rPct').oninput = e => $('rPctL').textContent = e.target.value + '%';
      $('rGrid').addEventListener('click', async e => {
        const run = e.target.closest('[data-run]'); if (run) { run.disabled = true; const r = await api('/api/growth/rule/run', { id: run.dataset.run }); toast(r.ok ? `${r.sent} personal offers sent on WhatsApp` : r.error); }
      });
      $('rGrid').addEventListener('change', e => { if (e.target.dataset.toggle) api('/api/growth/rule/toggle', { id: e.target.dataset.toggle, on: e.target.checked }); });
      $('rForm').onsubmit = async e => { e.preventDefault();
        const r = await api('/api/growth/rule/create', { name: $('rName').value, segs: picked($('rForm').querySelector('.segpick')), pct: +$('rPct').value, band: $('rBand').value, validDays: +$('rValid').value });
        toast(r.ok ? 'Rule added' : r.error); $('rName').value = ''; };
    },
    nudges() {
      $('aList').addEventListener('click', async e => { const b = e.target.closest('[data-arun]'); if (!b) return; b.disabled = true;
        const r = await api('/api/growth/auto/run', { id: b.dataset.arun }); toast(r.ok ? `Nudge sent to ${r.sent} players` : r.error); });
      $('aList').addEventListener('change', e => { if (e.target.dataset.atoggle) api('/api/growth/auto/toggle', { id: e.target.dataset.atoggle, on: e.target.checked }); });
      $('aForm').onsubmit = async e => { e.preventDefault();
        const r = await api('/api/growth/auto/create', { name: $('aName').value, ruleId: $('aRule').value || null, segs: picked($('aForm').querySelector('.segpick')),
          type: $('aType').value, dow: +$('aDow').value, hour: +$('aHour').value });
        toast(r.ok ? 'Nudge scheduled' : r.error); $('aName').value = ''; };
    },
  };
  function evNote() {
    if (!S) return; const d = $('evDay').value, s = +$('evStart').value, e = +$('evEnd').value;
    const clash = []; for (let h = s; h < e; h++) { const sl = S.slots[d]?.[h]; if (sl && (sl.booking || sl.hold)) clash.push(hLbl(h)); }
    const aud = S.growth.players.filter(p => picked($('evForm').querySelector('.segpick')).includes(p.segment) && !p.optOut).length;
    const pot = (+$('evTeams').value || 0) * (+$('evFee').value || 0);
    $('evNote').innerHTML = e <= s ? `<span class="err">${ic('alert')}End must be after start</span>` : clash.length ? `<span class="err">${ic('alert')}Already booked: ${clash.join(', ')}</span>`
      : `${ic('check', 'ok')}${e - s} slot${e - s > 1 ? 's' : ''} free · ${aud} players will be invited · up to ${rupee(pot)} in entry fees`;
  }

  const UPDATE = {
    players(g) {
      let ps = g.players.filter(p => (segFilter === 'all' || p.segment === segFilter) && (!q || p.name.toLowerCase().includes(q) || p.phone.includes(q)));
      const key = { games: p => -p.games90, last: p => -(p.last ?? 999), mk: p => -p.mkShare, spend: p => -p.spend }[sortBy];
      ps = ps.slice().sort((a, b) => key(a) - key(b));
      $('pcount').innerHTML = `${ps.length} player${ps.length === 1 ? '' : 's'}${segFilter !== 'all' ? ` · ${segChip(segFilter, g.segLabels)} <button class="linkb" id="clrSeg">clear</button>` : ''}`;
      const clr = document.getElementById('clrSeg'); if (clr) clr.onclick = () => { segFilter = 'all'; render(); };
      $('ptb').innerHTML = ps.map(p => {
        const max = Math.max(1, ...p.weeks);
        const spark = `<span class="spark">${p.weeks.map(w => `<i style="height:${w ? 18 + w / max * 82 : 6}%;opacity:${w ? 1 : .35}"></i>`).join('')}</span>`;
        const lastCls = p.last == null ? '' : p.last >= 35 ? 'err' : p.last >= 15 ? 'warn' : '';
        return `<tr>
          <td><div class="pl"><span class="av" style="background:${SEGC[p.segment]}">${esc(initials(p.name))}</span><div><b>${esc(p.name)}</b><small>${esc(mask(p.phone))}${p.optOut ? ' · opted out' : ''}</small></div></div></td>
          <td><span class="srcs">${p.sources.map(s => logo(s, 18)).join('')}</span></td>
          <td class="num"><b>${p.games90}</b><small>${p.perMonth}/mo</small></td>
          <td>${spark}</td>
          <td class="${lastCls}">${ago(p.last)}${p.upcoming ? `<small class="ok">${ic('calendar')}booked again</small>` : ''}</td>
          <td>${p.avgGap ? `${p.avgGap}d` : '—'}</td>
          <td>${hLbl(p.favHour)}</td>
          <td><span class="mkbar"><i style="width:${pct(p.mkShare)}"></i></span><small>${pct(p.mkShare)}</small></td>
          <td>${segChip(p.segment, g.segLabels)}</td>
          <td>${p.offer ? `<span class="offer">${ic('tag')}${esc(p.offer.code)}</span>` : p.optOut ? '' : `<button class="mini" data-nudge="${esc(p.phone)}">${ic('send')}Nudge</button>`}</td></tr>`;
      }).join('') || `<tr><td colspan="10" class="mut" style="padding:16px">No players match.</td></tr>`;
    },
    events(g) {
      $('evList').innerHTML = g.tournaments.map(t => {
        const st = t.stats || {}, fill = t.teams.length / t.teamsMax;
        const stc = t.status === 'open' ? 'ok' : t.status === 'full' ? 'blue' : 'mut';
        return `<div class="evc ${t.status}">
          <div class="evh"><span class="evi">${ic(t.type === 'Coaching camp' ? 'whistle' : t.type === 'Corporate event' ? 'users' : t.type === 'League night' ? 'calendar' : 'trophy')}</span>
            <div><b>${esc(t.name)}</b><small>${esc(t.type)} · ${esc(t.format)} · ${t.when}</small></div><span class="stc ${stc}">${t.status === 'open' ? 'Open' : t.status === 'full' ? 'Full' : 'Cancelled'}</span></div>
          <div class="evp"><span class="bar"><i style="width:${fill * 100}%"></i></span><b>${t.teams.length}/${t.teamsMax}</b> teams</div>
          <div class="evs"><span>${ic('send')}${t.invitedCount} invited</span><span>${ic('check')}${st.read ?? 0} read</span><span>${ic('trophy')}${t.teams.length} joined</span><span>${ic('rupee')}${rupee(t.teams.length * t.fee)} fees</span><span>${ic('gift')}${esc(t.prize)}</span></div>
          ${t.teams.length ? `<div class="caps">${t.teams.map(x => `<span class="cap"><span class="av sm">${esc(initials(x.captain))}</span>${esc(x.captain)}</span>`).join('')}</div>` : ''}
          ${t.status !== 'cancelled' ? `<div class="eva"><button class="mini" data-inv="${t.id}">${ic('send')}Invite more</button><button class="mini" data-rem="${t.id}" ${t.teams.length ? '' : 'disabled'}>${ic('clock')}Remind teams</button><button class="mini red" data-cx="${t.id}">${ic('x')}Cancel</button></div>` : ''}
        </div>`;
      }).join('') || '<div class="mut">No events yet.</div>';
      if (!$('evList').dataset.bound) {
        $('evList').dataset.bound = 1;
        $('evList').addEventListener('click', async e => {
          const b = e.target.closest('button'); if (!b) return;
          if (b.dataset.inv) { const r = await api('/api/growth/tournament/invite', { id: b.dataset.inv }); toast(r.sent ? `${r.sent} more invites sent` : 'Everyone in those segments is already invited'); }
          if (b.dataset.rem) { const r = await api('/api/growth/tournament/remind', { id: b.dataset.rem }); toast(`Reminder sent to ${r.sent} captains`); }
          if (b.dataset.cx && confirm('Cancel this event? Slots reopen on every marketplace and teams are notified.')) { await api('/api/growth/tournament/cancel', { id: b.dataset.cx }); toast('Event cancelled · slots reopened'); }
        });
      }
      evNote();
    },
    discounts(g) {
      $('rGrid').innerHTML = g.rules.map(r => {
        const conv = r.stats.offers ? Math.round(r.stats.redeemed / r.stats.offers * 100) : 0;
        return `<div class="rc ${r.enabled ? '' : 'off'}">
          <div class="rh"><span class="ri">${ic(r.icon)}</span><div><b>${esc(r.name)}</b><small>${esc(r.desc)}</small></div>
            <label class="switch sm"><input type="checkbox" data-toggle="${r.id}" ${r.enabled ? 'checked' : ''}></label></div>
          <div class="rchips">${r.segs.map(s => segChip(s, g.segLabels)).join('')}<span class="pill2 big">${r.pct}% off</span>
            <span class="pill2">${ic('clock')}${r.band === 'offpeak' ? '10 AM–4 PM' : 'Any slot'}</span><span class="pill2">${logo('whatsapp', 14)}WhatsApp only</span><span class="pill2">${r.validDays}d</span></div>
          <div class="econ">${ic('rupee')}${esc(r.economics)}</div>
          <div class="rs"><span><b>${r.audience}</b> match now</span><span><b>${r.stats.offers}</b> sent</span><span><b>${r.stats.redeemed}</b> redeemed</span><span><b>${conv}%</b> conv.</span><span><b>${rupee(r.stats.revenue)}</b></span></div>
          <button class="primary wide" data-run="${r.id}" ${r.enabled && r.audience ? '' : 'disabled'}>${ic('bolt')}Run now · ${r.audience} offer${r.audience === 1 ? '' : 's'}</button></div>`;
      }).join('');
    },
    nudges(g) {
      $('aList').innerHTML = g.autos.map(a => {
        const st = a.stats || { sent: 0, read: 0, booked: 0, revenue: 0 };
        const rule = a.ruleId && g.rules.find(r => r.id === a.ruleId);
        return `<div class="ac ${a.enabled ? '' : 'off'}">
          <div class="ah"><span class="ri">${ic(a.icon)}</span><div class="grow"><b>${esc(a.name)}</b><small>${ic('target')}${esc(a.trigger)}</small></div>
            <div class="when"><b>${ic('clock')}${esc(a.schedule)}</b><small>${a.enabled ? 'next ' + inTime(a.next) : 'paused'}</small></div>
            <label class="switch sm"><input type="checkbox" data-atoggle="${a.id}" ${a.enabled ? 'checked' : ''}></label>
            <button class="mini" data-arun="${a.id}" ${a.enabled ? '' : 'disabled'}>${ic('send')}Run now</button></div>
          <div class="ab"><div class="bubble">${esc(a.preview)}</div>
            <div class="am">${a.segs.map(s => segChip(s, g.segLabels)).join('')}<span class="pill2">${ic('users')}${a.audience} players</span>
              ${rule ? `<span class="pill2 big">${ic('tag')}${rule.pct}% · ${esc(rule.name)}</span>` : '<span class="pill2">No offer</span>'}
              <div class="rs"><span><b>${st.sent}</b> sent</span><span><b>${st.read}</b> read</span><span><b>${st.booked}</b> booked</span><span><b>${rupee(st.revenue)}</b></span></div></div></div></div>`;
      }).join('');
    },
  };

  // ───────── Outbox + results ─────────
  const ST = { sent: ['✓', 'Sent', ''], delivered: ['✓✓', 'Delivered', ''], read: ['✓✓', 'Read', 'blue'], replied: ['💬', 'Replied', 'blue'], booked: ['📅', 'Booked', 'ok'], joined: ['🏆', 'Joined', 'ok'] };
  function renderOutbox(g) {
    $('obAside').textContent = `${g.kpis.sent} sent · ${g.kpis.booked + g.kpis.joined} converted`;
    $('gOut').innerHTML = g.outbox.map(m => {
      const s = ST[m.status] || ST.sent;
      return `<div class="om"><span class="av sm" style="background:${SEGC[m.segment] || 'var(--gray)'}">${esc(initials(m.name))}</span>
        <div class="ob"><div class="ot"><b>${esc(m.name)}</b><span class="cmp">${ic(m.icon)}${esc(m.campName)}</span></div>
          <div class="tx">${esc(m.text.split('\n')[0])}</div>
          ${m.reply ? `<div class="rp">${ic('chat')}“${esc(m.reply)}”</div>` : ''}
          ${m.phone === 'sim' && !['booked', 'joined'].includes(m.status) ? `<button class="linkb" data-demo="1">${ic('chat')}Reply as ${esc(m.name)} on the demo phone →</button>` : ''}</div>
        <span class="ost ${s[2]}" title="${s[1]}">${s[0]} ${s[1]}${m.booking ? ' · ' + m.booking : ''}</span></div>`;
    }).join('') || `<div class="mut" style="padding:12px">No messages yet. Run a discount rule, a scheduled nudge, or create an event.</div>`;
  }
  $('gOut').addEventListener('click', e => { if (e.target.closest('[data-demo]')) { setOwnerTab('bookings'); toast('Reply from Priya’s phone in the WhatsApp panel'); } });
  function renderCamps(g) {
    const cs = g.camps.slice().reverse();
    $('gCamps').innerHTML = cs.map(c => {
      const conv = c.booked + c.joined, base = Math.max(1, c.sent);
      return `<div class="cr"><div class="ct">${ic(c.icon)}<b>${esc(c.name)}</b><span class="num">${rupee(c.revenue)}</span></div>
        <div class="fn"><span style="width:100%" title="Sent ${c.sent}"></span><span style="width:${c.read / base * 100}%" title="Read ${c.read}"></span><span style="width:${conv / base * 100}%" title="Booked/joined ${conv}"></span></div>
        <small>${c.sent} sent · ${c.read} read · ${c.replied} replied · <b>${conv} ${c.joined ? 'joined' : 'booked'}</b> (${Math.round(conv / base * 100)}%)</small></div>`;
    }).join('') || '<div class="mut">Results appear as campaigns run.</div>';
  }

  window.Growth = { render };
})();

// VenueBuddy · Customers (owner). Renders into #growthTab, which owner.js places inside <section data-panel="customers">.
// Uses globals from core.js: S, E, $, api, toast, esc, rupee, logo, store. Every number comes from S.growth (growth.js snapshot()).
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
    alert: '<path d="M12 2 1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z"/>',
    check: '<path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.6 8 19.2 6.6z"/>',
    chat: '<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>',
    plus: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>',
    target: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>',
    whistle: '<path d="M9 7a6 6 0 1 0 5.6 8H22v-4h-8.4A6 6 0 0 0 9 7zm0 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM8 2h2v3H8z"/>',
  };
  const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${GI[n] || GI.sparkle}</svg>`;
  // Segment marks: colour plus words. Won back is a hollow mark so it never reads as "Regular".
  const SEGC = { regular: 'var(--ok)', active: 'var(--muted)', new: 'var(--ink)', at_risk: 'var(--hold)', lapsed: 'var(--alert)', won_back: 'var(--ok)' };
  const SEGD = { regular: '4 or more games in 30 days', active: '1 to 3 games in 30 days', new: 'First game in the last 2 weeks', at_risk: 'Was regular, quiet for 15 to 35 days', lapsed: 'Not seen in 35+ days', won_back: 'Was at risk or lapsed, booked again' };
  const ORDER = ['regular', 'active', 'new', 'at_risk', 'lapsed', 'won_back'];
  const SUBS = [['players', 'Players'], ['offers', 'Offers'], ['nudges', 'Nudges'], ['events', 'Events']];
  const SUBP = new URLSearchParams(location.search).get('sub');
  const subOk = s => SUBS.some(([k]) => k === s);
  let sub = subOk(SUBP) ? SUBP : subOk(store.get('venuebuddy.growth.sub')) ? store.get('venuebuddy.growth.sub') : 'players';
  let segFilter = 'all', q = '', sortBy = 'games', showAll = false, shellFor = null, R = null, evType = 'Tournament';

  const mark = s => `<span class="mark g-mark${s === 'won_back' ? ' hollow' : ''}" style="--c:${SEGC[s]}"></span>`;
  const segTag = (s, L) => `<span class="g-seg">${mark(s)}${esc(L[s])}</span>`;
  const initials = n => n.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  const mask = p => p === 'sim' ? 'Demo phone' : p.startsWith('sim-') ? 'WhatsApp' : /@/.test(p) ? '+' + p.split('@')[0] : p.replace(/(\+91 9)\d{4} \d(\d{4})/, '$1xxxx x$2');
  const ago = d => d == null ? 'Never' : d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d} days ago`;
  const inTime = ts => { const m = Math.round((ts - Date.now()) / 60000); if (m <= 0) return 'due now'; if (m < 60) return `in ${m} min`; if (m < 1440) return `in ${Math.floor(m / 60)}h ${m % 60}m`; return `in ${Math.floor(m / 1440)}d`; };
  const hLbl = h => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
  const pct = x => Math.round(x * 100) + '%';
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const el = id => R && R.querySelector('#' + id);

  // Segment picker (checkbox chips) used by the offer, nudge and event forms
  const SEG_PICK = (def, g) => `<div class="g-picks">${ORDER.filter(s => s !== 'won_back').map(s =>
    `<label class="g-pick"><input type="checkbox" value="${s}" ${def.includes(s) ? 'checked' : ''}>${mark(s)}${esc(g.segLabels[s])}</label>`).join('')}</div>`;
  const picked = form => [...form.querySelectorAll('.g-picks input:checked')].map(i => i.value);
  const hourOpts = (from, to, sel) => Array.from({ length: to - from + 1 }, (_, i) => from + i).map(h => `<option value="${h}" ${h === sel ? 'selected' : ''}>${hLbl(h)}</option>`).join('');
  const sw = (attr, id, on, label) => `<input type="checkbox" class="g-switch" ${attr}="${id}" ${on ? 'checked' : ''} aria-label="${esc(label)}" title="${on ? 'On' : 'Paused'}">`;

  // ───────── Shell ─────────
  function build(root) {
    R = root; shellFor = null;
    root.innerHTML = `
      <div class="g-head">
        <div><div class="g-title">Customers</div><div class="sub">Every player who has booked through any channel, and the WhatsApp messages that bring them back.</div></div>
        <div class="seg" id="gSub" role="tablist">${SUBS.map(([k, l]) => `<button type="button" data-sub="${k}" class="${k === sub ? 'active' : ''}">${l}</button>`).join('')}</div>
      </div>
      <div class="grid g-grid">
        <div class="span-8 stack" id="gMain"></div>
        <aside class="span-4 stack">
          <section class="card"><div class="card-h">WhatsApp outbox<span class="label" id="gObNote"></span></div><div class="g-outbox" id="gOut"></div></section>
          <section class="card"><div class="card-h">Campaign results</div><div id="gCamps"></div></section>
        </aside>
      </div>`;
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('input', onInput);
    root.addEventListener('submit', onSubmit);
  }

  function render() {
    const root = document.getElementById('growthTab');
    if (!root || typeof S === 'undefined' || !S || !S.growth) return;
    if (root !== R || !root.querySelector('#gMain')) build(root);
    const g = S.growth;
    if (shellFor !== sub) { shellFor = sub; el('gMain').innerHTML = SHELL[sub](g); }
    UPDATE[sub](g); renderOutbox(g); renderCamps(g);
  }
  function setSub(s) {
    sub = s; store.set('venuebuddy.growth.sub', s);
    R.querySelectorAll('#gSub button').forEach(b => b.classList.toggle('active', b.dataset.sub === s));
    render();
  }

  // ───────── Static parts of each sub-view (built once; UPDATE fills live data) ─────────
  const SHELL = {
    players: () => `
      <section class="card g-focal">
        <div id="gSum"></div>
        <div class="g-segs" id="gSegs"></div>
        <div class="g-act" id="gAct"></div>
      </section>
      <section class="card">
        <div class="card-h">Player list<span class="label" id="pcount"></span></div>
        <div class="g-tools">
          <label class="g-search">${ic('search')}<input class="input" id="pq" placeholder="Search name or number" value="${esc(q)}"></label>
          <select class="input" id="psort">${[['games', 'Most games'], ['last', 'Longest since last game'], ['mk', 'Most bookings via apps'], ['spend', 'Highest spend']].map(([v, l]) => `<option value="${v}" ${v === sortBy ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </div>
        <div class="g-tablewrap"><table class="g-table"><thead><tr><th>Player</th><th>Channels</th><th class="right">Games · 90 days</th><th>Last 12 weeks</th><th>Last played</th><th class="right">Via apps</th><th>Segment</th><th></th></tr></thead><tbody id="ptb"></tbody></table></div>
        <div class="g-more" id="pmore"></div>
      </section>`,
    offers: g => `
      <section class="card">
        <div class="card-h">Discount offers<span class="label">Personal codes, WhatsApp only</span></div>
        <p class="sub g-lead">When a player books on WhatsApp the bot applies their code, so the booking skips the apps and the venue pays no commission.</p>
        <div id="rList"></div>
      </section>
      <form class="card" id="rForm">
        <div class="card-h">New offer</div>
        <div class="field"><label for="rName">Name</label><input class="input" id="rName" placeholder="For example: Students weekday deal"></div>
        <div class="field"><label>Who gets it</label>${SEG_PICK(['active'], g)}</div>
        <div class="g-three">
          <div class="field"><label for="rPct">Discount <b id="rPctL">15%</b></label><input id="rPct" type="range" min="5" max="50" step="5" value="15"></div>
          <div class="field"><label for="rBand">Slots</label><select class="input" id="rBand"><option value="any">Any slot</option><option value="offpeak">10 AM to 4 PM only</option></select></div>
          <div class="field"><label for="rValid">Valid for</label><select class="input" id="rValid"><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option></select></div>
        </div>
        <button class="btn primary" type="submit">${ic('plus')}Add offer</button>
      </form>`,
    nudges: g => `
      <section class="card">
        <div class="card-h">Scheduled nudges<span class="label">WhatsApp messages that run on a timer</span></div>
        <p class="sub g-lead">Each nudge picks its players from how often they play right now, can attach an offer, and tracks replies and bookings.</p>
        <div id="aList"></div>
      </section>
      <form class="card" id="aForm">
        <div class="card-h">Schedule a nudge</div>
        <div class="two">
          <div class="field"><label for="aName">Name</label><input class="input" id="aName" placeholder="For example: Rainy-day reminder"></div>
          <div class="field"><label for="aRule">Attach offer</label><select class="input" id="aRule"><option value="">No offer, just a reminder</option>${g.rules.map(r => `<option value="${esc(r.id)}">${esc(r.name)} · ${r.pct}%</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Who gets it</label>${SEG_PICK(['active'], g)}</div>
        <div class="g-three">
          <div class="field"><label for="aType">Repeat</label><select class="input" id="aType"><option value="daily">Daily</option><option value="weekly">Weekly</option></select></div>
          <div class="field"><label for="aDow">Day</label><select class="input" id="aDow">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => `<option value="${i}" ${i === 5 ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
          <div class="field"><label for="aHour">Time</label><select class="input" id="aHour">${hourOpts(7, 21, 18)}</select></div>
        </div>
        <button class="btn primary" type="submit">${ic('clock')}Schedule nudge</button>
      </form>`,
    events: g => `
      <section class="card">
        <div class="card-h">Tournaments and events<span class="label">Slots are blocked on every app</span></div>
        <div id="evList"></div>
      </section>
      <form class="card" id="evForm">
        <div class="card-h">Create an event</div>
        <div class="seg g-evtype" id="evType">${[['Tournament', 'trophy'], ['League night', 'calendar'], ['Corporate event', 'users'], ['Coaching camp', 'whistle']].map(([t, i]) => `<button type="button" data-t="${t}" class="${t === evType ? 'active' : ''}">${ic(i)}${t}</button>`).join('')}</div>
        <div class="field"><label for="evName">Name</label><input class="input" id="evName" value="${esc(EVNAME[evType])}"></div>
        <div class="two">
          <div class="field"><label for="evFormat">Format</label><select class="input" id="evFormat"><option>5-a-side knockout</option><option>5-a-side league</option><option>7-a-side knockout</option><option>Futsal round-robin</option></select></div>
          <div class="field"><label for="evDay">Day</label><select class="input" id="evDay"><option value="tomorrow">Tomorrow</option><option value="today">Today</option></select></div>
        </div>
        <div class="two">
          <div class="field"><label for="evStart">Starts</label><select class="input" id="evStart">${hourOpts(6, 22, 10)}</select></div>
          <div class="field"><label for="evEnd">Ends</label><select class="input" id="evEnd">${hourOpts(7, 23, 12)}</select></div>
        </div>
        <div class="g-three">
          <div class="field"><label for="evTeams">Teams</label><input class="input" id="evTeams" type="number" value="8" min="2"></div>
          <div class="field"><label for="evFee">Entry per team (₹)</label><input class="input" id="evFee" type="number" value="1500" step="100" min="0"></div>
          <div class="field"><label for="evPrize">Prize</label><input class="input" id="evPrize" value="₹8,000 + trophy"></div>
        </div>
        <div class="field"><label>Invite on WhatsApp</label>${SEG_PICK(['regular', 'active', 'at_risk'], g)}</div>
        <div class="g-evnote" id="evNote"></div>
        <div class="hstack g-formfoot">
          <button class="btn primary" type="submit">${ic('send')}Create and send invites</button>
          <span class="label">Works best in quiet afternoon slots. They are blocked on ${esc(listNames(MK_NAMES))} straight away.</span>
        </div>
      </form>`,
  };
  const EVNAME = { Tournament: 'Weekend Super 5s', 'League night': 'Monday Night League', 'Corporate event': 'Corporate Friday Cup', 'Coaching camp': 'Kids Football Camp' };

  // ───────── Live data ─────────
  const UPDATE = {
    players(g) {
      const k = g.kpis, total = g.players.length;
      el('gSum').innerHTML = `
        <div class="label">Players</div>
        <div class="big">${k.players}</div>
        <div class="sub">${g.segs.regular} regulars · ${k.atRisk} at risk or lapsed · ${pct(k.directShare)} of games in the last 30 days booked direct (WhatsApp or desk)</div>`;
      el('gSegs').innerHTML = ORDER.map(s => {
        const n = g.segs[s] || 0, on = segFilter === s;
        return `<button type="button" class="row g-segrow${on ? ' on' : ''}" data-seg="${s}" aria-pressed="${on}">
          ${mark(s)}<span class="grow"><b>${esc(g.segLabels[s])}</b><span class="m">${SEGD[s]}</span></span>
          <span class="g-share" aria-hidden="true"><i style="width:${total ? n / total * 100 : 0}%;background:${SEGC[s]}"></i></span>
          <span class="g-n tnum">${n}</span>
          <span class="g-show">${on ? 'Showing' : 'Show'}</span></button>`;
      }).join('');
      const wb = g.rules.find(r => r.id === 'winback');
      if (wb) {
        const can = wb.enabled && wb.audience > 0;
        el('gAct').innerHTML = `<button type="button" class="btn primary lg" data-run="winback" ${can ? '' : 'disabled'}>${ic('send')}${wb.audience ? `Send win-back offer to ${plural(wb.audience, 'player')}` : 'Send win-back offer'}</button>
          <span class="sub">${!wb.enabled ? 'The win-back offer is paused in Offers.' : wb.audience ? `${wb.pct}% off on WhatsApp, valid ${wb.validDays} days. Goes to at-risk players without a live offer.` : 'Every at-risk player already has a live offer.'}</span>`;
      } else el('gAct').innerHTML = '';

      let ps = g.players.filter(p => (segFilter === 'all' || p.segment === segFilter) && (!q || p.name.toLowerCase().includes(q) || p.phone.includes(q)));
      const key = { games: p => -p.games90, last: p => -(p.last ?? 999), mk: p => -p.mkShare, spend: p => -p.spend }[sortBy];
      ps = ps.slice().sort((a, b) => key(a) - key(b));
      el('pcount').innerHTML = `${plural(ps.length, 'player')}${segFilter !== 'all' ? ` · ${esc(g.segLabels[segFilter])} <button type="button" class="btn quiet sm" data-clearseg="1">Show all</button>` : ''}`;
      const LIMIT = 12, cut = !showAll && !q && ps.length > LIMIT;
      el('pmore').innerHTML = cut ? `<button type="button" class="btn sm" data-more="1">Show all ${ps.length} players</button>` : '';
      el('ptb').innerHTML = (cut ? ps.slice(0, LIMIT) : ps).map(p => {
        const max = Math.max(1, ...p.weeks);
        const spark = `<span class="g-spark" title="Games per week, oldest first">${p.weeks.map(w => `<i class="${w ? '' : 'z'}" style="height:${w ? 25 + w / max * 75 : 8}%"></i>`).join('')}</span>`;
        const lastCls = p.last == null ? '' : p.last >= 35 ? 'g-alert' : p.last >= 15 ? 'g-hold' : '';
        const habit = [p.avgGap ? `plays every ${p.avgGap} days` : '', `usually ${hLbl(p.favHour)}`].filter(Boolean).join(' · ');
        return `<tr>
          <td><div class="g-pl"><span class="g-av">${esc(initials(p.name))}</span><div><b>${esc(p.name)}</b><span class="m">${esc(mask(p.phone))}${p.optOut ? ' · opted out' : ''}</span><span class="m">${habit}</span></div></div></td>
          <td><span class="g-srcs">${p.sources.map(s => logo(s, 16)).join('')}</span></td>
          <td class="right"><b>${p.games90}</b><span class="m">${p.perMonth} a month</span></td>
          <td>${spark}</td>
          <td><span class="${lastCls}">${ago(p.last)}</span>${p.upcoming ? `<span class="m g-ok">${ic('calendar')}Booked again</span>` : ''}</td>
          <td class="right">${pct(p.mkShare)}</td>
          <td>${segTag(p.segment, g.segLabels)}</td>
          <td class="right">${p.offer ? `<span class="chip ok" title="Live offer code ${esc(p.offer.code)}">Offer sent</span>` : p.optOut ? '' : `<button type="button" class="btn sm" data-nudge="${esc(p.phone)}">Nudge</button>`}</td></tr>`;
      }).join('') || `<tr><td colspan="8" class="empty">No players match.</td></tr>`;
    },
    offers(g) {
      el('rList').innerHTML = g.rules.map(r => {
        const conv = r.stats.offers ? Math.round(r.stats.redeemed / r.stats.offers * 100) : 0;
        return `<div class="row g-item${r.enabled ? '' : ' off'}">
          ${sw('data-toggle', r.id, r.enabled, r.name)}
          <div class="grow">
            <div class="g-itemh"><b>${esc(r.name)}</b><span class="chip">${r.pct}% off</span>${r.enabled ? '' : '<span class="chip warn">Paused</span>'}</div>
            <div class="m">${esc(r.desc)}</div>
            <div class="g-meta">${r.segs.map(s => segTag(s, g.segLabels)).join('')}<span>${r.band === 'offpeak' ? '10 AM to 4 PM' : 'Any slot'}</span><span>Valid ${r.validDays} days</span></div>
            <div class="g-meta">${esc(r.economics)}</div>
            <div class="g-stats"><span><b>${r.audience}</b> match now</span><span><b>${r.stats.offers}</b> sent</span><span><b>${r.stats.redeemed}</b> redeemed</span><span><b>${conv}%</b> used</span><span><b>${rupee(r.stats.revenue)}</b> booked</span></div>
          </div>
          <button type="button" class="btn sm" data-run="${esc(r.id)}" ${r.enabled && r.audience ? '' : 'disabled'}>${ic('send')}Send to ${r.audience}</button>
        </div>`;
      }).join('') || '<div class="empty">No offers yet.</div>';
    },
    nudges(g) {
      el('aList').innerHTML = g.autos.map(a => {
        const st = a.stats || { sent: 0, read: 0, booked: 0, revenue: 0 };
        const rule = a.ruleId && g.rules.find(r => r.id === a.ruleId);
        return `<div class="row g-item${a.enabled ? '' : ' off'}">
          ${sw('data-atoggle', a.id, a.enabled, a.name)}
          <div class="grow">
            <div class="g-itemh"><b>${esc(a.name)}</b><span class="chip">${ic('clock')}${esc(a.schedule)}</span><span class="m">${a.enabled ? 'next ' + inTime(a.next) : 'paused'}</span></div>
            <div class="m">${esc(a.trigger)}</div>
            <div class="g-meta">${a.segs.map(s => segTag(s, g.segLabels)).join('')}<span>${plural(a.audience, 'player')}</span><span>${rule ? `${rule.pct}% · ${esc(rule.name)}` : 'No offer'}</span></div>
            <div class="g-bubble">${esc(a.preview)}</div>
            <div class="g-stats"><span><b>${st.sent}</b> sent</span><span><b>${st.read}</b> read</span><span><b>${st.booked}</b> booked</span><span><b>${rupee(st.revenue)}</b></span></div>
          </div>
          <button type="button" class="btn sm" data-arun="${esc(a.id)}" ${a.enabled ? '' : 'disabled'}>${ic('send')}Run now</button>
        </div>`;
      }).join('') || '<div class="empty">No scheduled nudges.</div>';
    },
    events(g) {
      el('evList').innerHTML = g.tournaments.map(t => {
        const st = t.stats || {}, fill = t.teamsMax ? t.teams.length / t.teamsMax : 0;
        const chip = t.status === 'open' ? '<span class="chip ok">Open</span>' : t.status === 'full' ? '<span class="chip">Full</span>' : '<span class="chip alert">Cancelled</span>';
        const icon = t.type === 'Coaching camp' ? 'whistle' : t.type === 'Corporate event' ? 'users' : t.type === 'League night' ? 'calendar' : 'trophy';
        return `<div class="row g-item g-ev${t.status === 'cancelled' ? ' off' : ''}">
          <span class="g-evi">${ic(icon)}</span>
          <div class="grow">
            <div class="g-itemh"><b>${esc(t.name)}</b>${chip}</div>
            <div class="m">${esc(t.type)} · ${esc(t.format)} · ${esc(t.when)} · Prize ${esc(t.prize)}</div>
            <div class="g-fill"><span class="g-bar"><i style="width:${fill * 100}%"></i></span><span><b>${t.teams.length} of ${t.teamsMax}</b> teams</span></div>
            <div class="g-stats"><span><b>${t.invitedCount}</b> invited</span><span><b>${st.read ?? 0}</b> read</span><span><b>${t.teams.length}</b> joined</span><span><b>${rupee(t.teams.length * t.fee)}</b> in entry fees</span></div>
            ${t.teams.length ? `<div class="g-meta">Captains: ${t.teams.map(x => esc(x.captain)).join(', ')}</div>` : ''}
            ${t.status !== 'cancelled' ? `<div class="hstack g-evact"><button type="button" class="btn sm" data-inv="${esc(t.id)}">${ic('send')}Invite more</button><button type="button" class="btn sm" data-rem="${esc(t.id)}" ${t.teams.length ? '' : 'disabled'}>${ic('clock')}Remind teams</button><button type="button" class="btn sm quiet danger" data-cx="${esc(t.id)}">Cancel event</button></div>` : ''}
          </div>
        </div>`;
      }).join('') || '<div class="empty">No events yet.</div>';
      evNote();
    },
  };

  function evNote() {
    const f = el('evForm'); if (!f || !S) return;
    const d = el('evDay').value, s = +el('evStart').value, e = +el('evEnd').value;
    const clash = []; for (let h = s; h < e; h++) { const sl = S.slots[d]?.[h]; if (sl && (sl.booking || sl.hold)) clash.push(hLbl(h)); }
    const segs = picked(f);
    const aud = S.growth.players.filter(p => segs.includes(p.segment) && !p.optOut).length;
    const pot = (+el('evTeams').value || 0) * (+el('evFee').value || 0);
    el('evNote').innerHTML = e <= s ? `<span class="g-alert">${ic('alert')}End must be after start</span>`
      : clash.length ? `<span class="g-alert">${ic('alert')}Already booked: ${clash.join(', ')}</span>`
      : `<span class="g-ok">${ic('check')}</span>${plural(e - s, 'slot')} free · ${plural(aud, 'player')} will be invited · up to ${rupee(pot)} in entry fees`;
  }

  // ───────── Outbox and results (right rail) ─────────
  const ST = { sent: ['Sent', ''], delivered: ['Delivered', ''], read: ['Read', ''], replied: ['Replied', 'warn'], booked: ['Booked', 'ok'], joined: ['Joined', 'ok'] };
  function renderOutbox(g) {
    el('gObNote').textContent = `${g.kpis.sent} sent · ${g.kpis.booked + g.kpis.joined} booked or joined`;
    el('gOut').innerHTML = g.outbox.slice(0, 30).map(m => {
      const s = ST[m.status] || ST.sent;
      return `<div class="row g-om">
        <span class="g-av sm">${esc(initials(m.name))}</span>
        <div class="grow">
          <div class="g-itemh"><b>${esc(m.name)}</b><span class="chip ${s[1]}">${s[0]}${m.booking ? ' · ' + esc(m.booking) : ''}</span></div>
          <div class="m g-camp">${esc(m.campName)}</div>
          <div class="g-tx">${esc(m.text.split('\n')[0])}</div>
          ${m.reply ? `<div class="g-reply">${ic('chat')}"${esc(m.reply)}"</div>` : ''}
          ${m.phone === 'sim' && !['booked', 'joined'].includes(m.status) ? `<button type="button" class="btn quiet sm g-demo" data-demo="1">Reply as ${esc(m.name)} on the demo phone</button>` : ''}
        </div></div>`;
    }).join('') || '<div class="empty">No messages yet. Send an offer, run a nudge or create an event.</div>';
  }
  function renderCamps(g) {
    const cs = g.camps.slice().reverse();
    el('gCamps').innerHTML = cs.map(c => {
      const conv = c.booked + c.joined, base = Math.max(1, c.sent);
      return `<div class="row g-camprow"><div class="grow"><b>${esc(c.name)}</b>
          <span class="m">${c.sent} sent · ${c.read} read · ${c.replied} replied · ${conv} ${c.joined ? 'joined' : 'booked'} (${Math.round(conv / base * 100)}%)</span></div>
        <span class="right">${rupee(c.revenue)}</span></div>`;
    }).join('') || '<div class="empty">Results appear as campaigns run.</div>';
  }

  // ───────── Events (delegated on the #growthTab root) ─────────
  async function onClick(e) {
    const b = e.target.closest('button'); if (!b || !R.contains(b)) return;
    const d = b.dataset;
    if (d.sub) return setSub(d.sub);
    if (d.seg) { segFilter = segFilter === d.seg ? 'all' : d.seg; return render(); }
    if (d.clearseg) { segFilter = 'all'; return render(); }
    if (d.more) { showAll = true; return render(); }
    if (d.t) { evType = d.t; R.querySelectorAll('#evType button').forEach(x => x.classList.toggle('active', x === b)); el('evName').value = EVNAME[evType]; return evNote(); }
    if (d.demo) {
      if (typeof setRole === 'function' && typeof setTab === 'function') { setRole('staff'); setTab('whatsapp'); }
      return toast('Reply from Priya\'s demo phone in the WhatsApp tab');
    }
    if (d.nudge) { b.disabled = true; const r = await api('/api/growth/nudge/player', { phone: d.nudge }); return toast(r.ok ? `WhatsApp nudge sent · ${r.rule}` : r.error); }
    if (d.run) { b.disabled = true; const r = await api('/api/growth/rule/run', { id: d.run }); return toast(r.ok ? `${plural(r.sent, 'personal offer')} sent on WhatsApp` : r.error); }
    if (d.arun) { b.disabled = true; const r = await api('/api/growth/auto/run', { id: d.arun }); return toast(r.ok ? `Nudge sent to ${plural(r.sent, 'player')}` : r.error); }
    if (d.inv) { const r = await api('/api/growth/tournament/invite', { id: d.inv }); return toast(r.sent ? `${r.sent} more invites sent` : 'Everyone in those segments is already invited'); }
    if (d.rem) { const r = await api('/api/growth/tournament/remind', { id: d.rem }); return toast(`Reminder sent to ${plural(r.sent || 0, 'captain')}`); }
    if (d.cx && confirm('Cancel this event? Slots reopen on every app and teams are told on WhatsApp.')) { await api('/api/growth/tournament/cancel', { id: d.cx }); toast('Event cancelled. Slots reopened.'); }
  }
  function onChange(e) {
    const t = e.target, d = t.dataset;
    if (d.toggle) return api('/api/growth/rule/toggle', { id: d.toggle, on: t.checked });
    if (d.atoggle) return api('/api/growth/auto/toggle', { id: d.atoggle, on: t.checked });
    if (t.id === 'psort') { sortBy = t.value; return render(); }
    if (t.closest('#evForm')) evNote();
  }
  function onInput(e) {
    const t = e.target;
    if (t.id === 'pq') { q = t.value.toLowerCase(); render(); }
    else if (t.id === 'rPct') el('rPctL').textContent = t.value + '%';
    else if (t.closest('#evForm')) evNote();
  }
  async function onSubmit(e) {
    const f = e.target; e.preventDefault();
    if (f.id === 'rForm') {
      const r = await api('/api/growth/rule/create', { name: el('rName').value, segs: picked(f), pct: +el('rPct').value, band: el('rBand').value, validDays: +el('rValid').value });
      toast(r.ok ? 'Offer added' : r.error); if (r.ok) el('rName').value = '';
    } else if (f.id === 'aForm') {
      const r = await api('/api/growth/auto/create', { name: el('aName').value, ruleId: el('aRule').value || null, segs: picked(f), type: el('aType').value, dow: +el('aDow').value, hour: +el('aHour').value });
      toast(r.ok ? 'Nudge scheduled' : r.error); if (r.ok) el('aName').value = '';
    } else if (f.id === 'evForm') {
      const body = { type: evType, name: el('evName').value, format: el('evFormat').value, day: el('evDay').value, start: +el('evStart').value, end: +el('evEnd').value,
        teamsMax: +el('evTeams').value, fee: +el('evFee').value, prize: el('evPrize').value, segs: picked(f) };
      const r = await api('/api/growth/tournament/create', body);
      toast(r.ok ? `${evType} created. Slots blocked, invites going out on WhatsApp.` : r.error);
    }
  }

  window.Growth = { render };
})();

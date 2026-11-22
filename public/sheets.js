// VenueBuddy · shared dialogs: offline booking sheet + booking detail sheet markup
// Markup for #dialogs lives here so each view owns its own HTML.
document.getElementById('dialogs').innerHTML = `
<dialog id="bkSheet">
  <div class="sheet-h"><b id="bkTitle">Booking</b><button type="button" class="plain" id="bkClose">Done</button></div>
  <div class="sheet-b" id="bkBody"></div>
</dialog>

<dialog id="offSheet">
  <form id="offForm">
    <div class="sheet-h"><button type="button" class="plain" id="offCancel">Cancel</button><b>Offline Booking</b><button type="submit" class="plain" id="offSave">Add</button></div>
    <div class="sheet-b">
      <div class="segmented" id="offKind" style="display:flex">
        <button type="button" data-k="walkin" class="active" style="flex:1">Walk-in</button>
        <button type="button" data-k="phone" style="flex:1">Phone Call</button>
        <button type="button" data-k="owner" style="flex:1" class="owner-only">Owner Block</button>
      </div>
      <div class="two">
        <div class="field"><label>Day</label><select id="offDay"><option value="today">Today</option><option value="tomorrow">Tomorrow</option></select></div>
        <div class="field"><label>Slot</label><select id="offHour"></select></div>
      </div>
      <div class="field" id="fName"><label>Customer name</label><input id="offName" placeholder="e.g. Arjun"></div>
      <div class="field" id="fPhone"><label>Phone</label><input id="offPhone" placeholder="+91 98xxx xxxxx" inputmode="tel"></div>
      <div class="field" id="fNote" style="display:none"><label>Reason</label><select id="offNote"><option>Maintenance</option><option>Coaching session</option><option>Private tournament</option><option>Regulars (owner hold)</option></select></div>
      <div class="note" id="offPrice"></div>
    </div>
  </form>
</dialog>
`;

// Offline sheet
let offKind = 'walkin';
function openOffline(d = view, h = null, kind) { if (kind) offKind = kind; if (role === 'staff' && offKind === 'owner') offKind = 'walkin'; $('offDay').value = d; fillHours(h); setKind(offKind); $('offName').value = ''; $('offPhone').value = ''; $('offSheet').showModal(); }
function fillHours(sel) {
  const d = $('offDay').value, free = E.HOURS.filter(h => { const s = S.slots[d][h]; return !s.booking && !s.hold && !s.closed.offline && !E.isOver(d, h); });
  $('offHour').innerHTML = free.map(h => `<option value="${h}" ${h === sel ? 'selected' : ''}>${E.hLabel(h)}</option>`).join('');
  updOffPrice();
}
function setKind(k) {
  offKind = k; document.querySelectorAll('#offKind button').forEach(b => b.classList.toggle('active', b.dataset.k === k));
  $('fName').style.display = $('fPhone').style.display = k === 'owner' ? 'none' : ''; $('fNote').style.display = k === 'owner' ? '' : 'none';
  $('offSave').textContent = k === 'owner' ? 'Block' : 'Add'; updOffPrice();
}
function updOffPrice() {
  const d = $('offDay').value, h = +$('offHour').value; if (!h) { $('offPrice').textContent = 'No free slots on this day.'; return; }
  $('offPrice').innerHTML = offKind === 'owner' ? `Takes the slot off sale everywhere. BLOCK postings go to ${listNames(MK_NAMES)}.`
    : `Offline price ${rupee(E.listed(S.slots[d][h], d, h, 'offline'))} · 0% commission. BLOCK postings go to ${listNames(MK_NAMES)}.`;
}
$('offKind').onclick = e => { const b = e.target.closest('button'); if (b) setKind(b.dataset.k); };
$('offDay').onchange = () => fillHours(); $('offHour').onchange = updOffPrice;
$('offCancel').onclick = () => $('offSheet').close();
$('offBtn').onclick = () => openOffline();
$('offForm').onsubmit = async e => {
  e.preventDefault(); if (!$('offHour').value) return;
  const body = { day: $('offDay').value, hour: +$('offHour').value, channel: 'offline', kind: offKind,
    customer: offKind === 'owner' ? 'Owner' : ($('offName').value || (offKind === 'walkin' ? 'Walk-in' : 'Phone booking')),
    phone: $('offPhone').value || null, note: offKind === 'owner' ? $('offNote').value : (offKind === 'phone' ? 'phone call' : 'walk-in') };
  const r = await api('/api/book', body); $('offSheet').close();
  toast(r.ok ? (offKind === 'owner' ? 'Owner block added — marketplaces blocked' : `Offline booking ${r.booking.ref} — marketplaces blocked`) : `Rejected: ${r.error}`);
};

document.querySelectorAll('#days button').forEach(b => b.onclick = () => { view = b.dataset.day; render(); });
$('feedTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; feedTab = b.dataset.f; document.querySelectorAll('#feedTabs button').forEach(x => x.classList.toggle('active', x === b)); renderFeed(); };
$('resetBtn').onclick = () => { api('/api/reset'); $('reasons').innerHTML = '<div class="mut">Tap Optimise to reprice free slots per channel.</div>'; $('reply').style.display = 'none'; seenPostings = new Set(); renderChat.key = null; };
setInterval(() => { if (S && E.DAYS.some(d => E.HOURS.some(h => S.slots[d][h].hold))) { if (role === 'staff') renderCalendar(); else { renderUpcoming(); if (leftTab === 'slots') renderGrid(); } } }, 1000);
setInterval(() => { if (S && role === 'staff') renderStaff(); }, 30000); // keep the now-line and 'in N min' fresh


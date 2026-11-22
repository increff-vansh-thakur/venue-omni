// VenueBuddy · shared dialogs: offline booking sheet (owner + staff) and the booking detail sheet markup.
// Markup for #dialogs lives here so each view owns its own HTML. Booking sheet logic lives in staff.js.
const X_ICON = '<svg class="i" viewBox="0 0 24 24"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4z"/></svg>';
document.getElementById('dialogs').innerHTML = `
<dialog id="bkSheet" aria-labelledby="bkTitle">
  <div class="sheet-h"><b id="bkTitle">Booking</b><button type="button" class="plain" id="bkClose">Done</button></div>
  <div class="sheet-b" id="bkBody"></div>
</dialog>

<dialog id="offSheet" aria-labelledby="offTitle">
  <form id="offForm">
    <div class="sheet-h"><b id="offTitle">Add a booking</b><button type="button" class="plain icon" id="offX" aria-label="Close">${X_ICON}</button></div>
    <div class="sheet-b">
      <div class="seg full" id="offKind" role="tablist" aria-label="Booking type">
        <button type="button" data-k="walkin">Walk-in</button>
        <button type="button" data-k="phone">Phone call</button>
        <button type="button" data-k="owner" class="owner-only">Owner block</button>
      </div>
      <div class="two">
        <div class="field"><label for="offDay">Day</label><select id="offDay"><option value="today">Today</option><option value="tomorrow">Tomorrow</option></select></div>
        <div class="field"><label for="offHour">Slot</label><select id="offHour"></select></div>
      </div>
      <div class="field" id="fName"><label for="offName">Customer name</label><input id="offName" placeholder="e.g. Arjun" autocomplete="off"></div>
      <div class="field" id="fPhone"><label for="offPhone">Phone <span class="faint">(optional)</span></label><input id="offPhone" placeholder="+91 98xxx xxxxx" inputmode="tel" autocomplete="off"></div>
      <div class="field" id="fNote" hidden><label for="offNote">Reason</label><select id="offNote"><option>Maintenance</option><option>Coaching session</option><option>Private tournament</option><option>Regulars (owner hold)</option></select></div>
      <div class="price-note" id="offPrice"></div>
    </div>
    <div class="sheet-f"><button type="button" class="btn quiet tall" id="offCancel">Cancel</button><button type="submit" class="btn primary tall" id="offSave">Add booking</button></div>
  </form>
</dialog>
`;

// Offline sheet. Called by the staff view and the owner view: openOffline(day, hour, kind)
let offKind = 'walkin';
function openOffline(d = (typeof view !== 'undefined' ? view : 'today'), h = null, kind) {
  if (!S) return;
  if (kind) offKind = kind; if (role === 'staff' && offKind === 'owner') offKind = 'walkin';
  $('offDay').value = E.DAYS.includes(d) ? d : 'today'; fillHours(h); setKind(offKind); $('offName').value = ''; $('offPhone').value = '';
  if (!$('offSheet').open) $('offSheet').showModal();
}
function fillHours(sel) {
  const d = $('offDay').value, free = E.HOURS.filter(h => { const s = S.slots[d][h]; return !s.booking && !s.hold && !s.closed.offline && !E.isOver(d, h); });
  $('offHour').innerHTML = free.length ? free.map(h => `<option value="${h}" ${h === sel ? 'selected' : ''}>${E.hLabel(h)}</option>`).join('') : '<option value="">No free slots</option>';
  $('offHour').disabled = !free.length;
  updOffPrice();
}
function setKind(k) {
  offKind = k; document.querySelectorAll('#offKind button').forEach(b => { b.classList.toggle('on', b.dataset.k === k); b.setAttribute('aria-selected', b.dataset.k === k); });
  $('fName').hidden = $('fPhone').hidden = k === 'owner'; $('fNote').hidden = k !== 'owner';
  $('offTitle').textContent = { walkin: 'Add a walk-in', phone: 'Add a phone booking', owner: 'Block a slot' }[k];
  $('offSave').textContent = k === 'owner' ? 'Block slot' : 'Add booking'; updOffPrice();
}
function updOffPrice() {
  const d = $('offDay').value, h = +$('offHour').value;
  $('offSave').disabled = !h;
  if (!h) { $('offPrice').innerHTML = `<span class="mut">No free slots on this day.</span>`; return; }
  $('offPrice').innerHTML = offKind === 'owner'
    ? `<span class="mut">Takes the slot off sale everywhere. ${listNames(MK_NAMES)} are blocked automatically.</span>`
    : `<span class="pn-l">Collect at desk</span><span class="pn-v">${rupee(E.listed(S.slots[d][h], d, h, 'offline'))}</span><span class="mut pn-s">No commission. ${listNames(MK_NAMES)} are blocked automatically.</span>`;
}
$('offKind').onclick = e => { const b = e.target.closest('button'); if (b) setKind(b.dataset.k); };
$('offDay').onchange = () => fillHours(); $('offHour').onchange = updOffPrice;
$('offCancel').onclick = $('offX').onclick = () => $('offSheet').close();
// The owner view renders #offBtn; delegate so it works whenever (and however) owner.js draws it.
document.addEventListener('click', e => { if (e.target.closest('#offBtn')) openOffline(); });
$('offForm').onsubmit = async e => {
  e.preventDefault(); if (!$('offHour').value) return;
  const body = { day: $('offDay').value, hour: +$('offHour').value, channel: 'offline', kind: offKind,
    customer: offKind === 'owner' ? 'Owner' : ($('offName').value.trim() || (offKind === 'walkin' ? 'Walk-in' : 'Phone booking')),
    phone: $('offPhone').value.trim() || null, note: offKind === 'owner' ? $('offNote').value : (offKind === 'phone' ? 'phone call' : 'walk-in') };
  const r = await api('/api/book', body); $('offSheet').close();
  toast(r.ok ? (offKind === 'owner' ? 'Slot blocked. Marketplaces updated.' : `Booked ${r.booking.ref} · ${E.hLabel(body.hour)}. Marketplaces blocked.`) : `Not added: ${r.error}`);
};


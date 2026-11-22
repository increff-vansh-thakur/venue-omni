// VenueBuddy · boot
setRole(role);

connect();

// Stage backup: http://localhost:3000/#autoplay runs all three channels hands-free
if (location.hash === '#autoplay') {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  (async () => {
    await wait(600); await api('/api/reset'); await wait(600); view = 'tomorrow'; render();
    await aggBook('tomorrow', 18, 'aggA'); await wait(1500);                                                   // 1. aggregator booking
    await api('/api/book', { day: 'tomorrow', hour: 18, channel: 'offline', kind: 'walkin', customer: 'Walk-in' }); await wait(1200); //    race → blocked
    waSend('kal shaam 7 baje turf chahiye'); await wait(4500);                                                  // 2. WhatsApp → hold
    waSend('paid'); await wait(2500);                                                                           //    confirm
    await api('/api/book', { day: 'tomorrow', hour: 9, channel: 'offline', kind: 'walkin', customer: 'Arjun', note: 'walk-in' }); await wait(1200); // 3. offline
    await api('/api/book', { day: 'tomorrow', hour: 10, channel: 'offline', kind: 'owner', customer: 'Owner', note: 'Maintenance' });
  })();
}

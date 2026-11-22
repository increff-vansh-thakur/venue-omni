// Shared pricing + inventory rules. Loaded by server.js (Node) and index.html (browser).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // Selling channels. Marketplaces receive block/unblock/price postings.
  const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp', sub: 'Direct · 0%', comm: 0, source: 'whatsapp', marketplace: false, color: '#25D366' },
    { id: 'aggA', name: 'Playon', sub: 'Marketplace · 20%', comm: 0.20, source: 'aggregator', marketplace: true, color: '#FF5A36' },
    { id: 'aggB', name: 'Hurdle', sub: 'Marketplace · 15%', comm: 0.15, source: 'aggregator', marketplace: true, color: '#0E9F8E' },
    { id: 'aggC', name: 'Distinct', sub: 'Marketplace · 18%', comm: 0.18, source: 'aggregator', marketplace: true, color: '#5B3DF5' },
    { id: 'offline', name: 'Offline', sub: 'Walk-in · Phone · Owner', comm: 0, source: 'offline', marketplace: false, color: '#8E8E93' },
  ];
  const CH_IDS = CHANNELS.map(c => c.id);
  const MARKETPLACES = CHANNELS.filter(c => c.marketplace).map(c => c.id);
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22 → 06:00–23:00
  const DAYS = ['today', 'tomorrow'];
  const BASE = 1000, NET_FLOOR = 600, CEIL = 1800, AI_BAND = 0.30, SAVED_RATE = 0.15;

  const ch = id => CHANNELS.find(c => c.id === id);
  const chName = id => ch(id)?.name || id;
  function dayDate(d) { const t = new Date(); if (d === 'tomorrow') t.setDate(t.getDate() + 1); return t; }
  const isWeekend = d => [0, 6].includes(dayDate(d).getDay());
  function band(h) {
    if ([6, 7, 18, 19, 20, 21].includes(h)) return { m: 1.3, label: 'Peak' };
    if (h >= 10 && h <= 15) return { m: 0.8, label: 'Off-peak' };
    return { m: 1.0, label: 'Shoulder' };
  }
  const rulePrice = (d, h) => BASE * band(h).m * (isWeekend(d) ? 1.2 : 1);
  const floorListed = c => Math.ceil(NET_FLOOR / (1 - ch(c).comm) / 10) * 10;
  const clamp = (p, c) => Math.min(CEIL, Math.max(floorListed(c), Math.round(p / 10) * 10));
  function listed(slot, d, h, c) {
    let p = slot.override[c] ?? rulePrice(d, h);
    if (slot.disc[c]) p = p * (1 - slot.disc[c] / 100);
    return clamp(p, c);
  }
  const net = (p, c) => p * (1 - ch(c).comm);
  function hLabel(h) {
    const f = x => (x % 12 || 12) + (x < 12 || x === 24 ? ' AM' : ' PM');
    return `${f(h)}–${f(h + 1)}`.replace(' AM–', '–').replace(/ PM–(\d+ PM)/, '–$1');
  }
  const dayLabel = d => (d === 'today' ? 'Today' : 'Tomorrow');
  // A slot is past once its start hour has begun (today only). Customer-facing channels never sell past slots.
  const isPast = (d, h) => d === 'today' && h <= new Date().getHours();
  // A slot is over once it has ended. Walk-ins at the desk can still take a slot that is in progress.
  const nowFrac = () => { const n = new Date(); return n.getHours() + n.getMinutes() / 60; };
  const isOver = (d, h) => d === 'today' && h + 1 <= nowFrac();
  const closedFor = (d, h, c) => (c === 'offline' ? isOver(d, h) : isPast(d, h));
  const emptySlot = () => ({ booking: null, hold: null, closed: {}, disc: {}, override: {}, reason: {} });

  return { CHANNELS, CH_IDS, MARKETPLACES, HOURS, DAYS, BASE, NET_FLOOR, CEIL, AI_BAND, SAVED_RATE,
    ch, chName, dayDate, isWeekend, band, rulePrice, floorListed, clamp, listed, net, hLabel, dayLabel, emptySlot, isPast, isOver, closedFor, nowFrac };
});

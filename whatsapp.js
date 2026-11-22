// Layer 2: link a real (SPARE) WhatsApp number via the WhatsApp Web protocol (Baileys).
// Incoming DMs go to the same bot + MCP tools as the simulated phone.
// Start with:  WHATSAPP=1 SARVAM_API_KEY=... node server.js   then scan the QR from WhatsApp → Linked devices.
// Optional:    WA_ALLOW=9198xxxxxxx,9199xxxxxxx   → only reply to these numbers (recommended on stage).
const path = require('path');

exports.start = async function start({ onStatus, onMessage, setSender }) {
  const B = await import('@whiskeysockets/baileys');
  const makeWASocket = typeof B.default === 'function' ? B.default : (B.default?.default || B.makeWASocket);
  const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = B;
  const pino = require('pino');
  const qrcode = require('qrcode-terminal');
  const allow = (process.env.WA_ALLOW || '').split(',').map(s => s.replace(/\D/g, '')).filter(Boolean);
  const authDir = process.env.WA_AUTH_DIR || path.join(__dirname, '.wa-auth');

  async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    let version; try { ({ version } = await fetchLatestBaileysVersion()); } catch {}
    const sock = makeWASocket({
      auth: state, version, logger: pino({ level: 'silent' }), markOnlineOnConnect: false,
      browser: Browsers?.macOS ? Browsers.macOS('TurfOS') : ['TurfOS', 'Chrome', '1.0'],
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u => {
      if (u.qr) {
        console.log('\n[wa] Scan this QR: WhatsApp on the SPARE phone → Settings → Linked devices → Link a device\n');
        qrcode.generate(u.qr, { small: true });
        onStatus({ status: 'scan_qr' });
      }
      if (u.connection === 'open') {
        const number = (sock.user?.id || '').split(':')[0].split('@')[0];
        console.log(`[wa] Linked as +${number}${allow.length ? ` · replying only to ${allow.join(', ')}` : ''}`);
        setSender(async (jid, text) => { await sock.sendMessage(jid, { text }); });
        onStatus({ status: 'linked', number });
      }
      if (u.connection === 'close') {
        const code = u.lastDisconnect?.error?.output?.statusCode;
        setSender(null);
        if (code === DisconnectReason.loggedOut) {
          console.log('[wa] Logged out. Delete ~/venue-omni/.wa-auth and restart to link again.');
          onStatus({ status: 'logged_out' });
        } else { onStatus({ status: 'reconnecting' }); setTimeout(connect, 2000); }
      }
    });
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const m of messages) {
        if (m.key.fromMe) continue;
        const jid = m.key.remoteJid || '';
        if (!/@(s\.whatsapp\.net|lid)$/.test(jid)) continue;               // direct messages only, no groups/status
        const sender = (m.key.senderPn || jid).split('@')[0].replace(/\D/g, '');
        if (allow.length && !allow.some(a => sender.endsWith(a) || a.endsWith(sender))) continue;
        const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
        if (!text) continue;
        try { await sock.readMessages([m.key]); await sock.sendPresenceUpdate('composing', jid); } catch {}
        Promise.resolve(onMessage(jid, m.pushName || '+' + sender, text)).catch(e => console.error('[wa] bot', e.message));
      }
    });
  }
  connect().catch(e => { console.error('[wa] failed:', e.message); onStatus({ status: 'error' }); });
};

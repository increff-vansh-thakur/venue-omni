# ⚽ TurfOS — one inventory, every booking channel

> Omnichannel slot fulfilment for independent sports venues. Run aggregator apps, WhatsApp, phone and walk-ins from **one live inventory**, price each channel on purpose, and give commands in **Hindi, Hinglish or English**.

![Node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![Deploy](https://img.shields.io/badge/deployed%20on-Render-46E3B7?logo=render&logoColor=white)
![AI](https://img.shields.io/badge/AI-Sarvam-6C47FF)
![Status](https://img.shields.io/badge/status-demo%20%2F%20prototype-orange)

🌐 **Live demo:** https://venue-omni.onrender.com  ·  🎬 **Hands-free demo:** https://venue-omni.onrender.com/#autoplay

> [!IMPORTANT]
> **This is a working prototype, not a production system.** The inventory engine, booking rules, WhatsApp bot, MCP tools and AI calls are real code. The **aggregator apps, payments and customer data are simulated**. See [✅ What's real vs 🧪 what's mocked](#-whats-real-vs--whats-mocked) before you demo or build on it.

---

## 📑 Contents

- [🧩 The problem](#-the-problem)
- [💡 The solution](#-the-solution)
- [✅ What's real vs 🧪 what's mocked](#-whats-real-vs--whats-mocked)
- [🎬 Autoplay demo](#-autoplay-demo)
- [🚀 Run locally](#-run-locally)
- [🖥️ Using the dashboard](#️-using-the-dashboard)
- [⚙️ How it works](#️-how-it-works)
- [💸 Channels and pricing model](#-channels-and-pricing-model)
- [💬 WhatsApp booking bot](#-whatsapp-booking-bot)
- [🤖 MCP endpoint](#-mcp-endpoint)
- [📈 Customers & Growth](#-customers--growth)
- [🔌 API reference](#-api-reference)
- [🔧 Environment variables](#-environment-variables)
- [🗂️ Project structure](#️-project-structure)
- [☁️ Deploy](#️-deploy)
- [⚠️ Known limitations](#️-known-limitations)
- [🗺️ Roadmap](#️-roadmap)

---

## 🧩 The problem

Independent sports venues in India (football turfs, box cricket, badminton, pickleball) sell the **same perishable one-hour slot on 4–6 channels at once**: aggregator apps, WhatsApp, phone calls and walk-ins. Today that's held together with a paper register and a WhatsApp group.

| 😣 Pain | What it costs the owner |
|---|---|
| 🔀 **No single source of truth** | Double bookings, refunds, angry regulars |
| 💰 **Aggregator commission (~10–20%)** | Margin leaks, even on repeat players the venue already won |
| 🔒 **The app owns the player** | The venue can't re-market, so acquisition stays "rented" |
| 📉 **Flat pricing** | Off-peak slots sit empty and peak slots are under-priced |
| 🗣️ **English, dashboard-heavy software** | Hindi/Hinglish-first, phone-first owners don't adopt it |
| 🔌 **Few public partner APIs** | Syncing across apps is manual |

**Who it's for**

| Persona | Job to be done |
|---|---|
| 👨‍💼 **Venue owner** (single turf, Bengaluru, Hinglish-first) | "Fix it in one sentence without learning software." |
| 🧑‍💻 **Front-desk staff** | Book walk-ins and calls in one tap, without clashing with app bookings |
| ⚽ **Player** (weekly 5-a-side) | A confirmed slot at a fair price, cheaper when booked direct |

> **One-liner:** a venue owner should run every booking channel from one inventory, price each channel on purpose, and give instructions in the language they think in.

The full requirements live in [`docs/requirements.html`](docs/requirements.html) and [`docs/TurfOS-Requirements.pdf`](docs/TurfOS-Requirements.pdf). The code has since grown past them: the WhatsApp bot, MCP endpoint and Growth module were "out of scope" in the docs and are now built.

---

## 💡 The solution

| Pillar | What TurfOS does |
|---|---|
| 🧮 **1. Omnichannel fulfilment** | One slot ledger. A booking on any channel instantly **BLOCKs** the slot everywhere else, and a second attempt is rejected (*double booking blocked*). |
| 🏷️ **2. Per-channel AI pricing** | A rule engine sets the base price by time band and weekend. **Optimise** asks Sarvam AI to reprice free slots per channel within hard guardrails, with a reason for every change. |
| 🗣️ **3. Vernacular owner console** | Type or speak *"kal shaam 7 se 9 Hurdle pe band karo"* and it's done, with a Hindi confirmation spoken back. |
| 💬 **4. Direct WhatsApp booking** | A bot that checks availability, holds the slot, sends a UPI link and confirms, all at **0% commission**. |
| 📈 **5. Own the customer** | Segments every player (new, regular, at-risk, lapsed…) and runs win-back offers, scheduled nudges and tournaments. |

---

## ✅ What's real vs 🧪 what's mocked

Legend: ✅ **Real** (works as described) · 🟡 **Real with a condition** · 🧪 **Simulated** (stands in for an external system) · 📋 **Planned** (not built)

### Core

| Capability | Status | Details |
|---|---|---|
| Slot inventory, double-booking prevention | ✅ Real | Server-side engine (`server.js`, `engine.js`). Conflicts are rejected and counted. |
| Holds with expiry | ✅ Real | WhatsApp holds last `HOLD_SECONDS` (default 5 min), then auto-release and unblock the marketplaces. |
| Cancel, check-in, no-show | ✅ Real | Front-desk status changes update state and stats. |
| Pricing engine and guardrails | ✅ Real | Bands, weekend uplift, ₹600 net floor, ₹1800 ceiling, ±30% AI band. Enforced on the server. |
| Live dashboard updates | ✅ Real | Server-Sent Events (`/api/events`) push every state change. |
| MCP server (`/mcp`) | ✅ Real | JSON-RPC 2.0 with 6 tools. Any MCP client can book through it. |
| **Persistence** | 🧪 In-memory only | No database. **Everything resets on restart** (and on Render's free plan, when the service sleeps). |
| Login and roles | 📋 Planned | Owner/Staff is a UI toggle, not auth. All APIs are open. |
| Multi-venue | 📋 Planned | Single venue, **Kickoff Arena, Koramangala**, is hard-coded. |

### Channels

| Capability | Status | Details |
|---|---|---|
| **Aggregator apps** (Playon, Hurdle, Distinct) | 🧪 Simulated | **Fictional apps with mock logos.** BLOCK/UNBLOCK/CONFIRM/PRICE "postings" are never sent over the network. The endpoint names are labels only. Latency is faked at 90–310 ms, with an 8% chance of one retry. |
| Inbound aggregator bookings | 🧪 Simulated | No webhooks. Triggered by the **Marketplace Booking** button, by clicking a grid cell, or by `POST /api/book`. Aggregator customers get a random generated name and phone. |
| Walk-in, phone, owner block | ✅ Real | Entered by staff in the Offline sheet or the front-desk view. |
| **WhatsApp: dashboard phone** | 🧪 Simulated chat, real bot | The phone in the dashboard is a simulator ("Priya"). The bot behind it is the real bot logic and books through the real MCP tools. |
| **WhatsApp: real number** | 🟡 Real if enabled | `WHATSAPP=1` links a spare number via QR (Baileys / WhatsApp Web protocol). **Off on the hosted demo**: it needs a persistent disk for the session. |
| **UPI payment** | 🧪 Simulated | Only a `upi://pay?...` link is generated. Replying **"paid"** confirms the booking. Nothing is verified, and "refund in 24h" messages are text only. |

### AI (Sarvam)

| Capability | With `SARVAM_API_KEY` | Without a key (or press **O** to force offline) |
|---|---|---|
| 🏷️ Optimise pricing | ✅ Sarvam LLM (8 s timeout) | Rule-based: off-peak WhatsApp −20%, Hurdle −10%, peak Playon +15% |
| 🗣️ Owner commands | ✅ Sarvam LLM parses Hindi/Hinglish/English | Regex parser (handles *kal/aaj, shaam/raat/subah*, channel names) |
| 💬 WhatsApp intent parsing | ✅ Sarvam, with rules as a safety net | Rules only. The bot still works fully. |
| 🔊 Spoken reply (TTS) | ✅ Sarvam `bulbul:v3`, Hindi voice | Browser `speechSynthesis` (hi-IN) |
| 🎙️ Voice input (STT) | ✅ Sarvam `saarika:v2.5` | ❌ Not available. Type the command instead. |

The header badge shows **"Sarvam AI Connected"** or **"Offline · Rule-Based Fallbacks"**. The hosted demo has a key set.

### Customers & Growth

| Capability | Status | Details |
|---|---|---|
| Player list, segments, KPIs | ✅ Real logic, 🧪 **fake data** | 38 synthetic players (6 named + 32 generated, deterministic seed) with 90-day made-up visit histories. Nothing is imported. |
| Discount rules and offer codes | ✅ Real | Codes like `BACK20-AB12` are applied automatically when that player books on WhatsApp. |
| Scheduled nudges | ✅ Real scheduler | Checks every 15 s. Schedules live in memory. |
| Tournaments | ✅ Real | Creating one blocks its slots on every channel. Join by replying **JOIN**. |
| Message delivery, reads, replies, bookings | 🧪 Simulated | Only the demo phone (and a real linked WhatsApp chat) receive actual messages. For synthetic players, "delivered/read/booked" are random timers with fixed per-segment probabilities, capped at 5 bookings per run. Those bookings do take real slots. |
| SMS or email | 📋 Not built | — |

### 📋 Not built (on the roadmap)

Real aggregator integrations · payment gateway and refunds · persistence · auth · multi-venue · split-pay and team formation · last-minute deals feed · demand forecasting · QR codes at the venue.

---

## 🎬 Autoplay demo

Add **`#autoplay`** to the URL to run a hands-free ~13-second walkthrough of all three channel types. It's a backup for live stage demos.

```
https://venue-omni.onrender.com/#autoplay
http://localhost:3000/#autoplay
```

| Step | Time | What happens |
|---|---|---|
| 0 | 0.6 s | 🔄 **Resets** all state, switches the grid to *Tomorrow* |
| 1 | +0.6 s | 📱 **Aggregator:** Playon books tomorrow 6 PM. BLOCKs go to Hurdle and Distinct. |
| 1b | +1.5 s | 🚫 **Race:** a walk-in tries the same 6 PM slot and is **rejected** (the *Double Bookings Blocked* counter goes +1) |
| 2 | +1.2 s | 💬 **WhatsApp:** *"kal shaam 7 baje turf chahiye"*. The bot offers slots and puts tomorrow 7 PM on hold. |
| 2b | +4.5 s | 💳 *"paid"* confirms the booking |
| 3 | +2.5 s | 🚶 **Offline:** walk-in "Arjun", tomorrow 9 AM |
| 3b | +1.2 s | 🔧 **Owner block:** tomorrow 10 AM off sale for "Maintenance" |

> [!WARNING]
> - Autoplay **resets the server state first**. State is shared by everyone viewing the same server, so it wipes their view too.
> - There is **no stop button**. Reload without `#autoplay` to prevent further steps; steps already sent stay applied. Press **R** (or **Reset**) to clean up.
> - On Render's free plan, open the site once to wake it (30–60 s) before running autoplay, or the first steps may time out.

---

## 🚀 Run locally

**Requirements:** Node.js ≥ 20

```bash
git clone https://github.com/increff-vansh-thakur/venue-omni.git
cd venue-omni
npm install

npm start                                   # rule-based fallbacks only
SARVAM_API_KEY=your_key npm start           # with Sarvam AI
# → http://localhost:3000
```

**Real WhatsApp bot** (use a spare number, not your personal one):

```bash
WHATSAPP=1 WA_ALLOW=919876543210 SARVAM_API_KEY=your_key npm start
# Scan the QR printed in the terminal: WhatsApp → Linked devices
```

`WA_ALLOW` limits the bot to the numbers you list. Without it, the bot replies to **anyone** who messages the linked number.

---

## 🖥️ Using the dashboard

### 👨‍💼 Owner view (default)

| Panel | What it does |
|---|---|
| **KPI tiles** | Bookings · Occupancy (of 34 slots) · Net revenue to venue · Commission saved (direct vs apps) · Marketplace postings · Double bookings blocked |
| **Channel split** | Share, bookings, net revenue and fees per channel |
| **Upcoming / All slots** | Upcoming lists bookings with "blocked on other marketplaces" sync chips. All slots is the hour × channel grid (click a cell to act; see below). |
| **Marketplace Booking** | 🧪 Simulates an inbound booking from a random app on a free slot |
| **Offline Booking** | Walk-in, phone call or owner block (maintenance, coaching, private event, regulars) |
| **✨ Optimise** | AI (or rule-based) per-channel repricing of free slots. Results show in **AI Pricing Decisions**, with how many changes were applied or rejected by guardrails. |
| **WhatsApp Booking** | 🧪 Phone simulator with quick chips: `Hi`, `kal shaam 7 baje turf chahiye`, `paid`, `cancel`… |
| **Channel Router** | **Postings:** every BLOCK/UNBLOCK/CONFIRM/PRICE with latency and retries. **Activity:** the server event log. |
| **Owner Command** | Type, or 🎙️ **Speak**, in Hindi/Hinglish/English. Toggle spoken replies. |
| **Customers & Growth tab** | See [📈 Customers & Growth](#-customers--growth) |

**Grid cell clicks:** free app cell → 🧪 simulate that app booking · free Offline cell → walk-in sheet · free WhatsApp cell → prefill the phone · sold cell on another channel → try to double-book (it gets **blocked**, the race demo) · your own booking → cancel · closed cell → reopen.

### 🧑‍💻 Staff view (front desk)

Switch with the **Owner / Staff** toggle, or bookmark `?role=staff`.

- 📅 **Bookings calendar** for today and tomorrow with a "now" line, coloured by channel
- 🛎️ **Front desk:** + walk-in / + phone booking, arriving next, on the turf now, free-slot chips
- ✔️ **Check in / No-show** per booking
- 💬 **WhatsApp queries inbox:** "Needs reply" first, a per-chat **Bot** toggle so a human can take over, canned replies, mark done

Staff can't use Optimise, Owner Command, Marketplace Booking, owner blocks, Reset or the Growth tab. *(This is UI-only, not security.)*

### ⌨️ Shortcuts and URL helpers

| Key / URL | Effect |
|---|---|
| **R** | Reset all state (owner mode) |
| **O** | Toggle forced offline mode to demo the AI fallbacks (owner mode) |
| `#autoplay` | Hands-free demo |
| `#tomorrow` | Open the grid on tomorrow |
| `?role=staff` | Open in front-desk mode |
| `?tab=growth` | Open the Customers & Growth tab |

---

## ⚙️ How it works

```
 Browser (index.html + growth-ui.js)            Node server (server.js, no framework)
 ┌──────────────────────────────┐   POST /api/*   ┌──────────────────────────────────────┐
 │ Owner / Staff dashboard      │ ──────────────► │ Inventory state S (in memory)         │
 │ engine.js (shared pricing)   │                 │  ├─ book / hold / cancel / status     │
 │                              │ ◄────────────── │  ├─ Channel router ─► 🧪 mock postings │
 └──────────────────────────────┘  SSE snapshot   │  ├─ WhatsApp bot ─► MCP tools          │
                                   /api/events    │  ├─ growth.js (segments, offers)       │
 MCP client ─── POST /mcp ──────────────────────► │  └─ Sarvam proxy (chat/STT/TTS) ──► ☁️  │
 WhatsApp (Baileys, optional) ◄─────────────────► │                                        │
                                                  └──────────────────────────────────────┘
```

1. **Every write goes to the server.** The browser never changes state itself. It POSTs, and the server validates against the inventory.
2. **The server broadcasts a full snapshot** over SSE after each change (debounced 40 ms), so every open tab stays in sync.
3. **A booking on any channel** posts a CONFIRM to its own app (if it's a marketplace) and a **BLOCK to every other marketplace**. Cancels and expired holds post UNBLOCK.
4. **`engine.js` is shared** by Node and the browser, so prices and rules are identical on both sides.
5. **The Sarvam API key stays on the server.** The browser calls `/api/chat`, `/api/stt` and `/api/tts`, which proxy to Sarvam.

---

## 💸 Channels and pricing model

| Channel | Type | Commission | Min listed price (net ≥ ₹600) |
|---|---|---|---|
| 💬 WhatsApp | Direct | **0%** | ₹600 |
| 🟠 Playon | 🧪 Mock marketplace | 20% | ₹750 |
| 🟢 Hurdle | 🧪 Mock marketplace | 15% | ₹710 |
| 🟣 Distinct | 🧪 Mock marketplace | 18% | ₹740 |
| 🚶 Offline (walk-in / phone / owner) | Direct | **0%** | ₹600 |

**Inventory:** 17 one-hour slots a day (06:00–23:00) × today and tomorrow = **34 slots**.

**Rule price** = ₹1000 × band × (weekend ? 1.2 : 1), rounded to ₹10 and clamped to [channel floor, ₹1800]

| Band | Hours | Multiplier |
|---|---|---|
| 🔥 Peak | 6–8 AM, 6–10 PM | ×1.3 |
| ⚖️ Shoulder | 8–10 AM, 4–6 PM, 10–11 PM | ×1.0 |
| 🌙 Off-peak | 10 AM–4 PM | ×0.8 |

Weekend uses the real calendar (Sat/Sun).

**Guardrails** (enforced on the server for AI and owner changes): prices in multiples of ₹10 · ≤ ₹1800 · net ≥ ₹600 · AI changes within ±30% of the rule price · free slots only · discounts 0–50% · max 12 price changes per call.

*Worked example:* a ₹1,300 peak slot nets **₹1,300** via WhatsApp but **₹1,040** via a 20% app.

---

## 💬 WhatsApp booking bot

```
Customer: kal shaam 7 baje turf chahiye
   Bot ─► check_availability ─► offers up to 3 free slots (WhatsApp price, "no convenience fee")
Customer: picks a slot
   Bot ─► hold_slot ─► slot BLOCKED on all apps, 5-min hold, 🧪 UPI link (+ personal offer if any)
Customer: paid
   Bot ─► confirm_booking ─► ✅ confirmed (🧪 payment not verified)
```

- Understands Hinglish (*aaj/kal*, *shaam/raat/subah*, *7 baje*), `cancel`, `JOIN` (tournaments) and `STOP` (opt out).
- A hold auto-expires after `HOLD_SECONDS` and the slot reopens on every app.
- Staff can **take over** any chat (the bot pauses) from the Staff inbox.
- The bot books **only through the MCP tools**, the same ones external agents use.

---

## 🤖 MCP endpoint

`POST /mcp`: JSON-RPC 2.0 (Streamable HTTP, JSON responses). Server name `turfos-venue`. Methods: `initialize`, `ping`, `tools/list`, `tools/call`.

| Tool | Purpose |
|---|---|
| `check_availability` | Slot status and prices for a day (and hour) |
| `hold_slot` | Hold a slot for WhatsApp payment and block all apps. Returns ref, price and UPI link. |
| `confirm_booking` | Turn a hold into a confirmed booking |
| `book_slot` | Record a booking from any channel |
| `cancel_booking` | Cancel by ref or by day + hour, and unblock the apps |
| `list_postings` | Recent marketplace postings with status and latency |

```bash
curl -s -X POST http://localhost:3000/mcp -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_availability","arguments":{"day":"tomorrow"}}}'
```

Every MCP call shows up in the Activity feed and in the KPI tile count.

---

## 📈 Customers & Growth

> All players here are **synthetic** 🧪. The logic is real.

| Feature | How it works |
|---|---|
| 👥 **Segments** | 🆕 New · ⭐ Regular (4+ games in 30 days) · 🙂 Active · ⚠️ At risk (15–35 days away) · 💤 Lapsed (35+ days) · 🔁 Won back |
| 📊 **KPIs** | Players, repeat rate, direct share, at-risk count, won back, sent/booked/joined, revenue, **commission leak** to apps, active offers |
| 🎟️ **Discount rules** | `winback` 20% (at risk) · `comeback` 30% off-peak (lapsed) · `direct` 10% (app-heavy regulars) · `loyalty` 50% (every 5th game) · `fill` 25% (tomorrow's dead hours). Create custom rules (5–50%). |
| ⏰ **Scheduled nudges** | Daily win-back 6 PM, fill 12 PM, welcome 10 AM, Friday weekend nudge, monthly lapsed (off by default) |
| 🏆 **Tournaments** | Create (blocks slots on every channel), invite segments, players reply **JOIN** to get a UPI fee link, remind, cancel. Seeded: *Koramangala 5s Cup*. |
| 📤 **WhatsApp outbox and campaign results** | Sent → delivered → read → replied → booked funnel per campaign |

**What's simulated:** messages to synthetic players never leave the server. Delivery, reads and replies are random timers, and bookings use per-segment probabilities. Only the demo phone (and a real linked WhatsApp chat) receive actual messages, and you can reply to them.

---

## 🔌 API reference

All write endpoints are `POST` with a JSON body. There is **no authentication**.

<details>
<summary><b>Bookings and inventory</b></summary>

| Endpoint | Body | Purpose |
|---|---|---|
| `POST /api/book` | `{day, hour, channel, customer?, phone?, kind?, note?}` | Book from any channel (rejected if taken) |
| `POST /api/cancel` | `{ref}` or `{day, hour}` | Cancel and unblock the apps |
| `POST /api/booking/status` | `{ref, status}` | `booked` · `arrived` · `no_show` |
| `POST /api/owner/actions` | `{actions:[...]}` | `book` · `block` · `unblock` · `set_discount` · `set_price` · `clear` |
| `POST /api/pricing/apply` | `{changes, source}` | Apply price changes (guardrailed) |
| `POST /api/reset` | — | Wipe and re-seed all state |
| `GET /api/events` | — | SSE stream of full state snapshots |
| `GET /api/health` | — | `{hasKey, chatModel, wa}` |

</details>

<details>
<summary><b>WhatsApp</b></summary>

| Endpoint | Body | Purpose |
|---|---|---|
| `POST /api/wa/sim` | `{name, text}` | Message from the 🧪 demo phone to the bot |
| `POST /api/wa/reset-sim` | — | Clear the demo chat |
| `POST /api/wa/reply` | `{phone, text}` | Staff reply (sent on real WhatsApp if the chat is real) |
| `POST /api/wa/takeover` | `{phone, on}` | Human mode on/off (pauses the bot) |
| `POST /api/wa/read` | `{phone}` | Mark read |
| `POST /api/wa/resolve` | `{phone}` | Clear "needs reply" |

</details>

<details>
<summary><b>AI (Sarvam proxy; returns 503 without a key)</b></summary>

| Endpoint | Body | Returns |
|---|---|---|
| `POST /api/chat` | `{system, user}` | `{content}` |
| `POST /api/tts` | `{text}` | `{audio}` (base64 WAV, Hindi) |
| `POST /api/stt` | raw audio | `{transcript}` |

</details>

<details>
<summary><b>Growth</b></summary>

| Endpoint | Body | Purpose |
|---|---|---|
| `/api/growth/rule/run` | `{id}` | Run a discount rule now |
| `/api/growth/rule/toggle` | `{id, on}` | Enable or disable a rule |
| `/api/growth/rule/create` | `{name, segs, pct, band, validDays}` | New rule |
| `/api/growth/auto/run` | `{id}` | Run a scheduled nudge now |
| `/api/growth/auto/toggle` | `{id, on}` | Enable or disable a nudge |
| `/api/growth/auto/create` | `{name, ruleId, segs, type, hour, dow}` | New scheduled nudge |
| `/api/growth/tournament/create` | `{name, day, start, end, teamsMax, fee, prize, segs}` | New tournament (blocks slots) |
| `/api/growth/tournament/invite` | `{id}` | Invite players |
| `/api/growth/tournament/remind` | `{id}` | Remind captains |
| `/api/growth/tournament/cancel` | `{id}` | Cancel and reopen slots |
| `/api/growth/nudge/player` | `{phone}` | One-off nudge to one player |

</details>

---

## 🔧 Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `SARVAM_API_KEY` | *(empty)* | Turns on Sarvam AI. Without it, the rule-based fallbacks are used. |
| `PORT` | `3000` | HTTP port |
| `HOLD_SECONDS` | `300` | WhatsApp hold duration |
| `UPI_ID` | `kickoffarena@upi` | Payee in the 🧪 UPI link |
| `WHATSAPP` | *(unset)* | `1` starts the real WhatsApp bot |
| `WA_ALLOW` | *(unset: replies to everyone)* | Comma-separated numbers the bot may reply to |
| `WA_AUTH_DIR` | `./.wa-auth` | WhatsApp session folder (needs a persistent disk when hosted) |
| `SARVAM_BASE` | `https://api.sarvam.ai` | Sarvam API base URL |
| `SARVAM_CHAT_MODEL` | `sarvam-105b-conversations` | Chat model |
| `SARVAM_STT_MODEL` | `saarika:v2.5` | Speech-to-text model |
| `SARVAM_TTS_MODEL` | `bulbul:v3` | Text-to-speech model |
| `SARVAM_TTS_SPEAKER` | `priya` | TTS voice |

---

## 🗂️ Project structure

```
venue-omni/
├── server.js        🧠 HTTP server: inventory state, booking/hold/cancel, channel router (mock postings),
│                       WhatsApp bot, MCP endpoint, Sarvam proxy, SSE
├── engine.js        🧮 Shared pricing and channel rules (used by Node AND the browser)
├── growth.js        📈 Players, segments, discount rules, offers, nudges, tournaments, simulated replies
├── whatsapp.js      💬 Optional real WhatsApp link via Baileys (WHATSAPP=1)
├── index.html       🖥️ Single-page dashboard: Owner + Staff views, autoplay
├── growth-ui.js     📊 Customers & Growth tab UI
├── growth.css       🎨 Growth tab styles
├── render.yaml      ☁️ Render blueprint (one-click deploy)
└── docs/            📄 Requirements (HTML, PDF, review draft)
```

There's no build step and no framework: plain Node `http` plus vanilla JS. The only dependencies are for the optional WhatsApp bot (`@whiskeysockets/baileys`, `pino`, `qrcode-terminal`).

---

## ☁️ Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/increff-vansh-thakur/venue-omni)

`render.yaml` sets up a free Node web service (Singapore). Render asks for `SARVAM_API_KEY` during setup and auto-deploys on every push to `main`.

> **Why not GitHub Pages?** Pages only serves static files. TurfOS needs its Node server for inventory, SSE, the bot, MCP and the Sarvam proxy.

**Free-plan caveats:** the service sleeps after ~15 min idle (the first visit takes 30–60 s), in-memory state resets on wake, and the real WhatsApp bot is off (no persistent disk).

---

## ⚠️ Known limitations

- 🌍 **One shared state for everyone.** All visitors to a server see and change the same inventory. Reset and autoplay affect everyone.
- 🔓 **No auth.** Anyone with the URL can call every API, including `/api/reset`.
- 💾 **No persistence.** Restarts wipe bookings, players and schedules.
- 🧪 **Mock marketplaces and payments.** See the [real vs mocked](#-whats-real-vs--whats-mocked) table.
- 📅 **Today and tomorrow only.** No further booking horizon.
- 🔁 **Rule toggle is cosmetic.** Disabling a discount rule doesn't stop a manual *Run*.
- 🎙️ **No voice input without a Sarvam key.**

---

## 🗺️ Roadmap

| Phase | Theme | Status |
|---|---|---|
| 1️⃣ | **Control:** one inventory, per-channel pricing, Hindi console | ✅ Built (with mock channels) |
| 2️⃣ | **Own the customer:** WhatsApp bot + UPI, win-back campaigns, QR at the venue | 🟡 Bot and campaigns built, real payments and QR pending |
| 3️⃣ | **Network:** real aggregator integrations, split-pay, team formation, deals feed, multi-venue | 📋 Planned |
| 4️⃣ | **Autopilot:** demand forecasting, automatic pricing | 📋 Planned |

# VenueBuddy: Omnichannel Slot Fulfilment for Sports Venues
Hackathon requirements and understanding doc, v1.0 (build window: about 45 min)

---

## 1. Problem

Independent sports venues in India (turfs, box cricket, badminton, pickleball) sell the same perishable hour-slot on 4–6 channels at once: aggregator apps such as Playo, Hudle and KheloMore, plus WhatsApp, phone and walk-ins. All of it is kept in sync by hand. As a result:

| Pain | Consequence |
|---|---|
| No single source of truth for inventory | Double bookings, refunds, angry regulars |
| Flat pricing, no per-channel strategy | Empty off-peak slots; peak slots under-priced |
| Aggregators take about 10–20% (assumption) | Commission leaks even on repeat customers |
| The aggregator owns the player relationship | The venue can't re-market, so acquisition stays rented |
| Most aggregators have no public partner API | Integration has to be manual or semi-automated |

**One line:** a venue owner should be able to run every channel from one inventory, price each channel on purpose, and give instructions in the language they think in.

## 2. Personas and jobs-to-be-done

| Persona | Context | Job-to-be-done | What the demo proves |
|---|---|---|---|
| **Venue owner** (Ramesh, 42, owns one turf in Bengaluru, Hinglish-first, on his phone all day) | Watches revenue, not dashboards | "When a slot is going empty or a channel is eating my margin, I want to fix it in one sentence so I earn more without learning software." | Hindi command console, AI Optimise, net-to-venue counters |
| **Front-desk staff** (Imran, 24, at the counter) | Takes walk-ins and phone calls and checks apps | "When someone walks in or calls, I want to book in one tap and know it can't clash with an app booking." | Booking on any channel locks the slot everywhere |
| **Player** (Priya, 27, plays weekly 5-a-side) | Books through whichever app is open | "I want a confirmed slot at a fair price, and a cheaper option if I book direct." | Direct price is at or below the aggregator price (Phase 2 converts her to direct) |

## 3. Domain model (single source of truth)

- **Venue:** one 5-a-side turf, Bengaluru. `BASE = ₹1,000/hr`.
- **Days:** `today`, `tomorrow`.
- **Slots:** start hours **6, 7, …, 22**, one hour each. The last slot is 22:00–23:00. That gives **17 slots per day and 34 in total**.
- **Channels:**

  | id | Label | Commission `c` |
  |---|---|---|
  | `direct` | Direct / WhatsApp | 0% |
  | `agg_a` | Aggregator A | 20% (assumed) |
  | `agg_b` | Aggregator B | 15% (assumed) |
  | `walkin` | Walk-in | 0% |

- **Slot state:** `status ∈ {open, booked}`. If booked, the slot also stores `{channel, customer, listed_at_booking, net_at_booking}`.
- **Channel-listing state, per slot × channel:** `closed: bool`, `discount_pct`, `price_override`, `ai_pct`, `ai_reason`.
- **Demo clock:** a fixed simulated "now" set in config (default **today 09:00**). Slots that start before "now" show as *past* and can't be sold. This keeps the grid the same whatever time we go on stage.
- **Day type:** set in config, not taken from the real date. Default is **today = Friday (weekday) and tomorrow = Saturday (weekend)**, so the weekend multiplier always appears in the demo.

## 4. Pricing formula (M2 baseline, M3 and M4 layers)

**Time band** (weekday and weekend use the same bands):

| Band | Start hours | Multiplier `t` |
|---|---|---|
| Peak | 6, 7, 18, 19, 20, 21 | 1.3 |
| Shoulder | 8, 9, 16, 17, 22 | 1.0 |
| Off-peak | 10–15 | 0.8 |

**Day multiplier** `d`: weekday 1.0, weekend 1.2.

**Listed price** for each slot × channel, rounded to the nearest ₹10:
```
if price_override:   listed = price_override
else:                listed = BASE × t × d × (1 + ai_pct/100) × (1 − discount_pct/100)
listed = clamp(listed, floor_listed(channel), CEILING)
net    = listed × (1 − c)
```
- **CEILING** = ₹1,800 listed.
- **FLOOR** = ₹600 **net-to-venue**. For each channel this works out to `floor_listed = 600 / (1 − c)`: Direct and Walk-in ₹600, Agg B ₹710, Agg A ₹750.
- Default (no AI, no discount): **every channel shows the same listed price**, so net differs by channel. That makes commission leakage visible straight away.
- Worked examples: weekday off-peak gives ₹800 listed, so net is ₹800 on Direct, ₹640 on Agg A and ₹680 on Agg B. Weekend peak gives ₹1,560 listed and ₹1,248 net on Agg A.
- A **booked slot freezes** at `listed_at_booking` and `net_at_booking`. Later price changes never touch it.

## 5. Functional requirements

Priority: **P0** must ship, **P1** should ship, **S** stretch.

### M1: Omnichannel grid (P0)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-1 | Render a grid: rows are the 34 slots, grouped by day; columns are the 4 channels. | 34 rows × 4 channel cells are visible, with a day header for Today (Fri) and Tomorrow (Sat). |
| FR-2 | Each cell shows the listed price and the net-to-venue price. | The cell reads, for example, "₹800 · net ₹640". Net equals listed × (1 − c), within ₹1. |
| FR-3 | Book from any channel cell (click, then optional customer name). | After a booking, the slot status is `booked`. **All 4 cells** for that slot show as booked, with a badge naming the source channel. |
| FR-4 | Prevent double bookings. | Booking a slot that is booked, past, or `closed` on that channel is rejected with a toast. The "Double bookings prevented" counter goes up by 1. |
| FR-5 | Cancel a booking. | The slot returns to `open` on every channel that isn't closed. Its price is recomputed from the current layers. |
| FR-6 | Seed state on load and on **Reset demo**. | Seeded bookings: Today 07:00 Walk-in, Today 19:00 Agg A, Today 20:00 Direct, Tomorrow 20:00 Agg B. Tomorrow 19:00 is open on every channel because the demo command needs it. Reset restores this exactly. |

### M2: Rule-based pricing and counters (P0)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-7 | Apply the §4 formula to every open cell. | Weekday 10:00 = ₹800. Weekday 19:00 = ₹1,300. Weekend 19:00 = ₹1,560. Weekend 12:00 = ₹960. |
| FR-8 | Colour-code each row by band (peak, shoulder, off-peak). | A legend is visible and the colours match §4. |
| FR-9 | Show the counter strip from §7, updated live. | Every counter updates within 100 ms of any change to state. |

### M3: AI Optimise (P1)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-10 | The **AI Optimise** button sends the open, unbooked, future, not-closed cells plus their current listed and net prices, band, day type and commissions to the LLM through the proxy. | One POST to `/api/optimise`. No booked, past or closed cell appears in the payload. |
| FR-11 | The LLM returns JSON that follows the **Optimise schema** below. | The response parses, and invalid entries are dropped one by one (see FR-12). |
| FR-12 | Validate and apply each adjustment as `ai_pct` on that cell. | `pct_change` must be an integer in [−30, +30]. The cell must exist and must be open and unbooked. The final price is clamped by floor and ceiling. At most 20 adjustments are applied. Each dropped entry is logged in the activity feed. |
| FR-13 | Show each change. | Changed cells are highlighted and show `₹old → ₹new`. Hovering or tapping shows the one-line reason. A source badge reads **"Sarvam AI"** or **"Offline rules"**. |
| FR-14 | Offline fallback optimiser (deterministic). | Open off-peak cells: Direct −15%, Agg A and Agg B −10%. Open peak cells: Agg A and Agg B +10%, Direct unchanged. Each change has a templated reason, for example "Peak demand; protect net on 20% channel". The same input always gives the same output. |
| FR-15 | **Clear AI** button. | Sets every `ai_pct` back to 0. |

**Optimise output schema** (the LLM must return only this object):
```json
{
  "adjustments": [
    { "day": "tomorrow", "hour": 14, "channel": "direct",
      "pct_change": -15, "reason": "Weekend afternoon, low fill: nudge direct demand" }
  ],
  "summary": "Discounted 6 off-peak direct slots, raised peak aggregator prices to protect margin"
}
```
Field rules: `day ∈ {today, tomorrow}`. `hour` is an integer from 6 to 22. `channel ∈ {direct, agg_a, agg_b, walkin}`. `pct_change` is an integer in [−30, 30]. `reason` is at most 80 characters, in English or Hinglish. `summary` is at most 140 characters.

### M4: Hindi/Hinglish command console (P1)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-16 | A text box accepts Hindi (Devanagari), Hinglish or English. | It submits on Enter. The input is echoed in the activity feed. |
| FR-17 | The LLM, via `/api/command`, turns the text into JSON that follows the **Action schema** below. | "kal shaam 7 baje Aggregator B band karo" becomes `block`, tomorrow, 19–20, `[agg_b]`. "aaj 3 se 5 direct pe 20% discount do" becomes `set_discount`, today, 15–17, `[direct]`, 20. |
| FR-18 | Validate before applying (see the guardrails below). | Each invalid action is rejected with a reason. Valid actions in the same command still go ahead. |
| FR-19 | Preview, then apply. | A card lists the parsed actions in plain words plus the affected cells. **Apply** commits them and **Cancel** discards them. The affected cells flash once applied. |
| FR-20 | Reply in Hindi. | The card shows `reply_hi` from the LLM. If the fallback parser ran, a templated reply is shown instead. |
| FR-21 | Offline fallback parser using keywords and regex. | It handles **both demo sentences plus** "kal subah 6 baje walk-in book karo Rahul" and "aaj 7 baje sab channel kholo", producing output identical to the LLM path. |

**Action schema:**
```json
{
  "actions": [
    { "type": "block", "day": "tomorrow", "start_hour": 19, "end_hour": 20,
      "channels": ["agg_b"], "value": null, "customer": null }
  ],
  "reply_hi": "Kal shaam 7 baje Aggregator B par slot band kar diya."
}
```
| Field | Rule |
|---|---|
| `type` | One of `block`, `unblock`, `book`, `set_discount`, `set_price`, `clear` (`clear` removes the discount and override) |
| `day` | `today` or `tomorrow`. "kal" always means **tomorrow** here, because the past can't be acted on. |
| `start_hour`, `end_hour` | 24-hour integers with **end exclusive**: 6 ≤ start < end ≤ 23. A single time "7 baje" means 19–20. |
| `channels` | A non-empty subset of the 4 ids, or `["all"]`. `book` takes **exactly one** channel and one hour. |
| `value` | `set_discount`: percent from 1 to 50. `set_price`: rupees. `null` for every other type. |
| `customer` | Optional string, used only by `book`. |

**Time and alias rules** (written into the prompt and the fallback): "subah" means AM. "dopahar" means 12–16. "shaam" and "raat" mean PM. A bare hour from 1 to 5 means PM. A bare hour from 6 to 11 with no qualifier **defaults to PM**, and the preview shows the time so the owner can catch a mistake. Channel aliases: "direct/WhatsApp/seedha" → `direct`; "A/Aggregator A" → `agg_a`; "B/Aggregator B" → `agg_b`; "walk-in/counter" → `walkin`; "sab/all" → `all`. Verbs: band/close/block; khol/open; book; discount/chhoot/% off; price/rate/daam ₹X.

**Guardrails** (apply to M3, M4 and manual edits):
| ID | Rule | Behaviour |
|---|---|---|
| GR-1 | Never reprice a booked or past slot | Those cells are skipped, and the preview says "2 booked slots skipped". |
| GR-2 | Net price floor of ₹600 and listed ceiling of ₹1,800 | `set_price` outside the bounds is **rejected**. A discount or AI change that crosses a bound is **clamped**, and the cell is marked "clamped". |
| GR-3 | Don't block a booked slot | The action is rejected: "Slot already booked. Cancel the booking first." |
| GR-4 | Schema violation (unknown type, bad hours, empty channels, value out of range, multi-channel `book`) | That action is rejected with a reason. The rest still apply. |
| GR-5 | LLM output can't be parsed, or no action is valid | Fall back to the offline parser. If that also fails, show "Samajh nahi aaya, try: …" with 2 example commands. State is never changed. |

### Stretch
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-22 (S) | Mic button records audio, sends it to `/api/stt` (Sarvam speech-to-text), and puts the transcript in the command box. | The transcript shows **before** it is sent. If STT fails, the mic is greyed out and typing still works. |
| FR-23 (S) | Speak `reply_hi` through `/api/tts` (Sarvam text-to-speech). | Audio plays within 3 s. If it fails, fall back to the browser's `speechSynthesis` (`hi-IN`), and if that fails, show text only. |

## 6. Non-functional requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-1 | Key security | The Sarvam key lives only in the proxy's env var `SARVAM_API_KEY`. It never appears in the HTML, the JS or any response. The proxy **serves index.html from the same origin**, so there is no CORS. |
| NFR-2 | Proxy | Plain Node `http` with zero dependencies. Routes: `GET /`, `POST /api/optimise`, `/api/command`, `/api/stt`, `/api/tts`. The proxy holds the prompts. The browser sends structured state, not prompts. |
| NFR-3 | Latency | Local operations under 100 ms. LLM calls target p50 under 3 s, with a **hard timeout of 8 s, after which the fallback runs automatically**. A spinner shows "Sarvam soch raha hai…". |
| NFR-4 | Fallback | Every AI feature (FR-14, FR-21, FR-22, FR-23) has an offline path. A missing key or no network switches to offline mode at startup. |
| NFR-5 | Stage safety | An **Offline mode** toggle (keyboard shortcut `O`). **Reset demo** (`R`). No CDN or external assets. A fixed demo clock. Deterministic seed data. A source badge on every AI result so we never overclaim. |
| NFR-6 | Robust parsing | Strip code fences and any `<think>…</think>` reasoning block, take the first `{…}` JSON object, and validate it against the schema before use. |
| NFR-7 | Display | Readable on a projector at 1280×720. The whole grid fits with at most one scroll, or the days sit side by side. |

## 7. Demo metrics

| Metric | Computation | Notes |
|---|---|---|
| **Slots filled** | future booked ÷ future sellable, where sellable means slots starting at or after the demo clock that are not closed on every channel. At seed this shows "3 / 31 (10%)". | Past slots (06:00–08:00 today) are excluded. Revenue metrics still count past bookings. |
| **Net revenue to venue** | Σ `net_at_booking` over booked slots | |
| **Commission paid** | Σ `listed_at_booking × c` over aggregator bookings | |
| **Commission saved** | Σ `listed_at_booking × 15%` over Direct and Walk-in bookings | Conservative counterfactual against the **cheapest** aggregator rate. Labelled "vs cheapest aggregator". |
| **Double bookings prevented** | Count of FR-4 rejections | Seeded at 0. Bump it live on stage. |
| **AI changes applied** | Count of cells with `ai_pct ≠ 0`, plus the Δ in listed net across open inventory | Label it "potential". It assumes the slots sell. |

## 8. 90-second demo script

| Time | Action on screen | Line |
|---|---|---|
| 0–10s | Grid loaded | "This turf sells the same 7 PM slot on four channels by hand. That's how double bookings and 20% commissions happen." |
| 10–25s | Staff books Today 18:00 on Walk-in. All 4 cells lock. Then try booking it on Agg A: rejected, counter shows 1. | "One inventory. Book anywhere and it's locked everywhere. No double booking." |
| 25–35s | Point at Today 21:00: Agg A shows "₹1,300 · net ₹1,040" while Direct shows "net ₹1,300". Commission saved goes up. | "Same price, but the venue keeps ₹260 less on Aggregator A. Now you can see it." |
| 35–55s | Click **AI Optimise**. Off-peak Direct turns green, peak aggregator cells go up. Hover a reason. | "Sarvam prices each slot per channel: fill afternoons on direct, and protect margin where commission is high." |
| 55–80s | Type "kal shaam 7 baje Aggregator B band karo" → preview → Apply. Then "aaj 3 se 5 direct pe 20% discount do" → Apply. (Stretch: say it into the mic and hear the Hindi confirmation.) | "The owner doesn't learn software. He talks in Hinglish." |
| 80–90s | Counters strip | "Phase 1: control the inventory. Next: own the customer on WhatsApp and UPI." |

**Rehearse once with Offline mode ON.** If the venue Wi-Fi is bad, go on stage in offline mode and say so: "the rules engine is the fallback; Sarvam is the brain."

## 9. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Sarvam is slow, down, or returns malformed or `<think>` output | Med | 8 s timeout, NFR-6 parsing, offline fallbacks, Offline toggle |
| The LLM misreads time (7 AM vs 7 PM) | Med | Time rules in the prompt, a preview before apply, end-exclusive hours |
| 45 minutes isn't enough | High | Timebox: M1 ≤15m, M2 ≤8m, proxy plus M4 ≤12m, M3 ≤8m, then buffer. **Cut line:** if the proxy isn't working by minute 30, ship M3 and M4 on the offline fallbacks and present Sarvam as wired but offline. |
| STT rejects the browser's webm audio format | Med | Stretch only. Check accepted formats first. Typed input is always the primary path. |
| Judges ask "how do you actually sync with Playo?" | High | Be honest: no public APIs. Phase 1 is the source-of-truth plus manual or partner-dashboard sync. Partner integrations are Phase 3. |
| Aggregators may enforce rate parity | Med | Per-channel pricing is configurable. Direct-cheaper can become direct-perks (Phase 2). |
| Projector or layout breaks | Low | Test at 1280×720. Have a screenshot backup. |

## 10. Assumptions
- Commission rates of 20% and 15% are illustrative, not quoted from any real aggregator.
- The base price, time bands, multipliers, floor and ceiling are demo values that a venue could configure later.
- 1-hour slots on a single court, and one booking per slot.
- The Sarvam chat, STT and TTS endpoints are available with a hackathon key. Model names are set in the proxy.
- "Today" and "Tomorrow" day types come from config (Fri and Sat), not from the real calendar.

## 11. Out of scope (demo), kept on the roadmap
WhatsApp bot · UPI and split-pay · team formation · real aggregator integrations or scraping · login and roles · database or persistence (state resets on reload) · multiple venues or courts · variable slot lengths · payments and refunds · notifications · analytics history.

## 12. What judges should take away
1. **The real problem is inventory and margin control**, not discovery. Venues lose money through double bookings, empty off-peak slots and commission on customers they already have.
2. **One inventory, every channel, and net-to-venue visible everywhere.** That makes commission leakage concrete.
3. **AI that works in the owner's language.** Sarvam gives Hindi/Hinglish commands and per-channel pricing with a reason for every change, and guardrails make it safe.
4. **Built to hold up on stage.** Every AI path has a deterministic fallback, and the key stays server-side.
5. **A clear wedge into a network.** Control inventory first, then own the customer, then build the network, then autopilot.

## 13. Phased roadmap
| Phase | Theme | Scope |
|---|---|---|
| 1 (this demo, then a pilot) | Control | Single venue inventory, channel routing, rule and AI pricing, Hindi command console |
| 2 | Own the customer | WhatsApp booking bot and UPI; QR at the venue to move aggregator players to direct; win-back campaigns for lapsed regulars |
| 3 | Network | Split-pay and team formation; a last-minute deals feed; partner integrations with aggregators; multi-venue chains |
| 4 | Autopilot | Demand forecasting (weather, events, history) driving pricing automatically, with owner-set guardrails |

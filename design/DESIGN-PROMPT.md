# TurfOS redesign prompt (filled template)

Paste this into the build step after you pick an option in `options.html`. Replace the `{THEME}` and `{OWNER_LAYOUT}` / `{STAFF_LAYOUT}` blocks with the chosen ones from the menus below.

---

## Master prompt

**Role.** You are a senior product designer building for the owner and front-desk staff of a single independent 5-a-side turf in an Indian city (Kickoff Arena, Koramangala). The owner is Hinglish-first, checks the business on a phone between other work, and cares about money kept, not dashboards. The front-desk person stands at a counter with a laptop or tablet, takes walk-ins and calls, and answers WhatsApp.

**Goal and layout.** Redesign the two views of TurfOS, a tool that runs every booking channel (WhatsApp, three marketplace apps, walk-in and phone) from one slot inventory.
- Owner view: `{OWNER_LAYOUT}`
- Staff view: `{STAFF_LAYOUT}`
- Each screen has exactly one primary focal point. Everything else is quieter: smaller type, lower contrast, or one click away.
- Use a 12-column grid at 1280px and above, collapsing to a single column under 768px. Readable at 1280x720 (projector) without scrolling the focal area.
- Show at most 4 numbers above the fold. Every number must come from live state, never placeholder values.
- Detail (full slot grid, posting log, activity) lives behind a tab or drawer, not on the main surface.

**Color and type.** `{THEME}`
- Text contrast at least 4.5:1, numbers and primary actions at least 7:1.
- Channel colors are muted and used only for small marks (a 3px bar or 8px square), never for whole cells.
- Status uses shape and words as well as color (for example "Booked", "On hold 3:12", "Closed by owner").
- Every font stack must include a Devanagari fallback (Noto Sans Devanagari or Mukta) because owner replies are in Hindi.
- Fonts are self-hosted in the repo (woff2), no CDN, so the demo works offline on stage.

**Copy and voice.** Plain, direct, human. Write like a good front-desk manager talks.
- Labels say what the thing is: "Kept after fees", not "Net Revenue to Venue".
- Hinglish is welcome where the user writes it (command examples, bot messages). UI chrome stays in simple English.
- Numbers in Indian format (₹1,560, ₹6,539). Times as "7 PM", not "19:00".
- Commission percentages for marketplaces are labelled as assumptions once, in a footnote.

**Negative constraints (strict).**
- No purple or pink gradients. No gradients on surfaces at all.
- No glowing or coloured drop shadows. One subtle neutral shadow level at most.
- No glassmorphism or floating translucent cards.
- No emojis as UI icons. Use a small line-icon set (Lucide, self-hosted SVG) or plain text.
- No auto-playing carousels or animated counters.
- No fake testimonials, fake metrics or invented trends. If data does not exist (for example last week), do not show a comparison.
- No em dashes in UI copy. Use a full stop, comma or "·".
- No three identical feature cards in a row as the main element.

---

## Theme menu (`{THEME}`)

### T1 · Clubhouse (light, warm)
Background #F6F4EE, surface #FFFFFF, ink #17191A, muted ink #6B6F6C, rule #E3E0D8, accent turf green #1F6F4A, alert clay #B8462B, hold amber #A86B12.
Type: Fraunces (display, numbers) + Manrope (UI), Noto Sans Devanagari fallback.
Feels like: a well-run sports club's printed booking sheet.

### T2 · Floodlight (dark, calm)
Background #0F1312, surface #161C1A, ink #E8ECE9, muted ink #8D9893, rule #24302C, accent #C9EE5B (used only for the one primary action and "now" marker), alert #F0745A, hold #E6B54A.
Type: Space Grotesk (display, numbers) + IBM Plex Sans (UI), IBM Plex Mono for refs and logs, Noto Sans Devanagari fallback.
Feels like: a scoreboard at night. Dark, but not neon.

### T3 · Ledger (white, neutral)
Background #FFFFFF, surface #FAFAF9, ink #0E1116, muted ink #5E6470, rule #E7E7E4, accent #0F766E (teal), alert #B42318, hold #B54708.
Type: Instrument Serif (display numbers only) + Instrument Sans (everything else), Mukta fallback.
Feels like: accounting software that respects you. The most minimal option.

---

## Owner layout menu (`{OWNER_LAYOUT}`)

### O1 · Today at a glance
Focal point: one large "Kept after fees today" number with the day's fill (booked of sellable). Below it, a single horizontal strip of today's 17 hours, each hour a small block marked by channel or empty. Right side: next 3 bookings. Channel split is one thin stacked bar with names. Grid, postings and AI pricing sit in tabs: Slots · Pricing · Channel sync.

### O2 · Slot board
Focal point: a compact hours by channel board for the selected day, with empty slots visually quiet and booked slots as solid blocks with the channel name. A narrow right rail holds the command box and the 3 latest changes. Numbers move into a single line above the board.

### O3 · Ask first
Focal point: a large command box ("Tell TurfOS what to change") with 3 Hinglish example chips and the mic. Under it, a "What changed" feed of the last actions in plain sentences, then a slim today strip. Built for the owner on a phone.

## Staff layout menu (`{STAFF_LAYOUT}`)

### S1 · Next up
Focal point: a big "Next arrival" card (name, time, channel, paid or not) with Check in and No-show buttons. Below: today's remaining bookings as a list, and a "+ Walk-in" primary button pinned top right. WhatsApp queries count as a small badge that opens a drawer.

### S2 · Day sheet
Focal point: a single-column timeline of today, 6 AM to 11 PM, one row per hour, large tap targets. Free hours show "Add walk-in". Booked hours show name, channel, status. Current hour highlighted.

### S3 · Desk and inbox
Focal point: split screen. Left, WhatsApp chats that need a reply (canned replies, bot on/off). Right, today's bookings with check-in. For venues where WhatsApp is the main workload.

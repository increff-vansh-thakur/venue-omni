# VenueBuddy redesign and docs · action plan

Status: **planning only. Nothing in the app has changed.** This folder (`~/venue-omni-redesign`) is a snapshot copy of `~/venue-omni` taken on 22 Nov 2026, including uncommitted work (growth.js, growth-ui.js, growth.css).

## Step 0 · Pick an option (you)
Open `design/options.html` in a browser. Use the top bar to switch:
- Theme: T1 Clubhouse · T2 Floodlight · T3 Ledger
- Owner layout: O1 Today at a glance · O2 Slot board · O3 Ask first
- Staff layout: S1 Next up · S2 Day sheet · S3 Desk and inbox

Tell me the combination (for example "T1 + O1 + S1"). Mixing is fine, such as O1 with O2's board as the Slots tab.

## Step 1 · Fix the problem to solution alignment (before any visuals)
The problem statement and one-liner match across the docs and README. The drift is in the solution description.

| Problem (from requirements) | What the app does today | Where it should show in the new UI |
|---|---|---|
| No single source of truth, double bookings | One inventory; any booking blocks the slot on every other channel; clashes rejected and counted | Owner: "Clashes stopped" and "All channels in sync". Staff: one list, no channel tabs |
| Flat pricing, no per-channel strategy | Peak / shoulder / off-peak and weekend pricing, per-channel discounts, AI or rule-based "Optimise" with guardrails | Owner: Pricing tab, "keep ₹x" next to every price |
| Aggregators take 10 to 20% | Net to venue on every cell, fees paid, commission saved | Owner focal number is "Kept after fees", not gross |
| Aggregator owns the player | WhatsApp booking bot with UPI link, cheaper direct price, Customers & Growth (new, uncommitted) | Owner: Customers tab. Staff: WhatsApp inbox |
| No public partner APIs | Channel router with simulated postings (mock Playon / Hurdle / Distinct) | Owner: Channel sync tab, labelled as simulated |
| Owners are Hindi / Hinglish-first, mobile-first | Hindi / Hinglish / English command box, voice in and out, Hindi replies | Owner: command box always one tap away (O3 makes it the hero) |

Doc fixes needed so problem and solution line up:
1. **Pick one source of truth.** `requirements.html` reflects the build better than the md. Mark `requirements-review-draft.md` as an early draft or delete it. Regenerate the PDF from the html.
2. **Channels.** Docs say 4 channels (Direct, Aggregator A, B, Walk-in). The app has 5: WhatsApp, Playon (20%), Hurdle (15%), Distinct (18%), Offline. Update docs to the app's names and say the marketplace names are fictional.
3. **Out of scope is out of date.** WhatsApp bot, UPI link, staff role and growth campaigns are listed as out of scope or Phase 2/3 but are now built. Move them to "Built (demo-grade)" and say what is simulated: payment is not verified, marketplace postings are mocked, no login, no database.
4. **Real brand names.** The md names Playo, Hudle and KheloMore in the problem statement. Keep them only in the problem section (market context), never as product channels.
5. **README.** Rewrite around the one-liner, then a "Problem → what VenueBuddy does" table (the one above, shortened), then screenshots of the chosen design, then run and deploy.

## Step 2 · Build the chosen design (on the copy, not the main folder)
1. Re-sync this copy with `~/venue-omni` once your growth work is committed, then make it a git branch `redesign` so it merges cleanly.
2. Self-host the chosen fonts (woff2 in `/fonts`) plus a Devanagari fallback. No CDN.
3. Replace the CSS tokens in `index.html` with the chosen theme. Keep all element ids that the JS uses, so behaviour does not change.
4. Rebuild the owner view: focal area, then tabs Today · Slots · Pricing · Customers · Channel sync. Move the full grid into Slots and the posting log into Channel sync.
5. Rebuild the staff view in the chosen layout. Keep check-in, no-show, walk-in, phone and WhatsApp takeover.
6. Copy pass: remove emojis used as icons (current UI uses them in headings and badges), remove em dashes, rename labels ("Kept after fees", "Clashes stopped").
7. Check at 1280x720 and on a phone width. Run the `#autoplay` demo end to end.

## Step 3 · Documentation
1. Screenshots of each view from a local run (headless Chrome, fixed seed state, captured after Step 2 so they show the new look). Saved to `docs/screens/`.
2. README rewrite per Step 1.5, with screenshots inline.
3. `docs/HOW-IT-WORKS.md`: one page covering the booking lifecycle, pricing rules and guardrails, and what is simulated. Plain language, one diagram.

## Step 4 · Free hosting (decided after the build)
- **Oracle Cloud Always Free VM:** the only truly free always-on option. Runs the app as is, with WhatsApp and persistent storage. Needs a card and some Linux setup. Idle VMs can be reclaimed.
- **Koyeb free:** easier, one small service. Sources disagree on whether it sleeps; check before relying on it.
- **Render free:** easiest, but sleeps after 15 minutes, which wipes the in-memory bookings and drops WhatsApp. Fine for a link you share before a demo, not for real use.
- **Docs only:** GitHub Pages can host the README, requirements and screenshots for free.
- Before any public URL: add an admin token to `/api/reset`, `/api/owner/actions` and the Sarvam proxy routes.

# TurfOS (venue-omni)

Omnichannel slot fulfilment for sports venues. Runs every booking channel (aggregator apps, WhatsApp, phone, walk-in) from one inventory, sets prices per channel, and takes owner commands in Hindi or English.

![demo](docs/demo.png)

## Run locally

```bash
npm install
SARVAM_API_KEY=your_key npm start          # http://localhost:3000
```

Real WhatsApp bot (scan the QR with a spare number via WhatsApp → Linked devices):

```bash
WHATSAPP=1 SARVAM_API_KEY=your_key npm start
```

## Environment variables

| Variable | Purpose |
|---|---|
| `SARVAM_API_KEY` | Sarvam AI key for chat/STT. Without it the app runs with fallbacks only. |
| `PORT` | HTTP port (default `3000`). |
| `WHATSAPP` | Set to `1` to start the WhatsApp bot. |
| `WA_AUTH_DIR` | Where the WhatsApp session is stored (default `./.wa-auth`). Point at a persistent volume when deployed. |

## Endpoints

- `/` — dashboard
- `/api/health` — health check
- `/api/events` — server-sent events stream
- `/mcp` — MCP endpoint

Requirements and design notes are in [`docs/`](docs/).

## Deploy (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/increff-vansh-thakur/venue-omni)

`render.yaml` sets up a free Node web service. Render asks for `SARVAM_API_KEY` during setup. On the free plan the service sleeps when idle and in-memory bookings reset when it restarts.

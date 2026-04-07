# XMRChat &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rga-atl/xmrchat/blob/master/LICENSE)

A web application for conference calling using WebRTC technology.

Create a room with a name and share the link with your partners so they can join too.

## Features

- **Video & Audio Conferencing:** Real-time peer-to-peer communication via WebRTC
- **Screen Sharing:** Share your screen with presentation mode layout
- **Text Chat:** In-call messaging with clickable link detection
- **Active Speaker Detection:** Visual glow indicator when participants speak
- **Pre-call Controls:** Set display name and toggle camera/mic before joining
- **Room Sharing:** One-click copy room link to invite others
- **Navigation Guard:** Confirmation prompt to prevent accidental call exit
- **Moderation Tools:** Mute, disable video, or remove participants from the call
- **Opt-in Browser Mining:** Optional Monero mining with explicit participant consent

## Live

[chat.xmr.vc](https://chat.xmr.vc)


## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Linting/Formatting:** oxlint, oxfmt
- **Testing:** Vitest, React Testing Library
- **Real-time:** WebRTC (peer-to-peer), Socket.IO (signaling)
- **Deployment** Skaffold
- **Infrastructure:** Docker, Kubernetes, Skaffold
- **Mining:** WebMiner (browser RandomX `rx/0`), MoneroOcean pool, WebSocket-to-Stratum proxy

## Prerequisites

- Node.js >= 18.0.0
- Camera and microphone for video calls
- HTTPS in production (required for WebRTC)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/rga-atl/xmrchat.git
cd xmrchat

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Production Build

```bash
# Build the app
npm run build

# Start the production server
npm start
```

## Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start development server |
| `npm run build`         | Build for production     |
| `npm start`             | Start production server  |
| `npm test`              | Run tests in watch mode  |
| `npm run test:run`      | Run tests once           |
| `npm run test:coverage` | Run tests with coverage  |
| `npm run lint`          | Run linter (oxlint)      |
| `npm run lint:fix`      | Run linter with auto-fix |
| `npm run format`        | Format code (oxfmt)      |
| `npm run format:check`  | Check code formatting    |

## Mining (Opt-in Monero)

Rooms can optionally enable transparent, consent-based browser mining. The room creator provides a Monero wallet address when creating the room, and every participant must explicitly accept a consent dialog before any hashing starts. Mining can be paused, resumed, or stopped at any time, and a live indicator shows hashrate and total hashes in the room.

### How it works

1. Room creator enters a Monero wallet address when creating the room.
2. Joining participants see a consent dialog showing the wallet, CPU/battery impact, and controls.
3. On accept, the browser loads a WebMiner (RandomX, `rx/0`) and connects via a WebSocket-to-Stratum proxy to MoneroOcean.
4. All shares are credited to the room creator's wallet — no account needed.

### Pool

- **Pool:** `gulf.moneroocean.stream`
- **Port:** `10128` (or `20128` for SSL)
- **Algorithm:** RandomX (`rx/0`) — MoneroOcean auto-switches to the most profitable algorithm
- **Stats:** Enter your wallet at [moneroocean.stream](https://moneroocean.stream) to view payouts

### Defaults

- **CPU usage:** 50% (`throttle: 0.5`)
- **Threads:** auto-detected (`navigator.hardwareConcurrency`)
- **Fallback:** if the mining script fails to load, the hook runs in simulation mode (no real hashing)

### Architecture

Browsers can't speak Stratum/TCP directly, so a small Node.js WebSocket-to-Stratum proxy ships in [`mining-proxy/`](mining-proxy/) and runs as its own pod inside the cluster (`ghcr.io/rga-atl/xmrchat-mining-proxy`). It bridges browser WebSocket frames to MoneroOcean's Stratum endpoint and exposes `/healthz` for probes.

```
Browser  ──wss──▶  chat.xmr.vc/mining-ws  ──▶  Cloudflared  ──▶  mining-proxy:8080  ──TCP/Stratum──▶  gulf.moneroocean.stream:10128
```

The proxy is a `ClusterIP` service — never exposed directly. Public access is path-routed through the same Cloudflare tunnel that serves the app:

- `chat.xmr.vc/*` → `chatterbox:3000`
- `chat.xmr.vc/mining-ws/*` → `mining-proxy:8080`

Add the second public hostname rule in the Cloudflare Zero Trust dashboard (Tunnel → Public Hostnames), placing it **above** the catch-all so the path matches first.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_MINING_SCRIPT_URL` | URL of the browser mining JS library | `/mining/worker.js` |
| `NEXT_PUBLIC_MINING_PROXY_URL` | WebSocket URL of the Stratum proxy | `wss://chat.xmr.vc/mining-ws` |

The `mining-proxy` pod itself is configured via:

| Variable | Description | Default |
|---|---|---|
| `POOL_HOST` | Stratum pool hostname | `gulf.moneroocean.stream` |
| `POOL_PORT` | Stratum pool port | `10128` |
| `PORT` | Proxy listen port | `8080` |
| `MAX_CONNS_PER_IP` | Per-client-IP connection cap | `8` |

### Ethics

This implementation is **opt-in only**: explicit consent dialog, visible status, pause/stop controls at all times, and the wallet address is shown to every participant. Do not deploy this in a way that hides mining from users.

## Authors

- **[mrganser](http://mrganser.com)** — original author
- **[rga-atl](https://github.com/rga-atl)** — crypto mining integration, containerization, and Kubernetes deployment

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

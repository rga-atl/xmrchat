# Mining Feature Documentation

## Overview

Chatterbox now supports optional, transparent browser-based Monero mining for rooms. Room creators can enable mining by providing a Monero wallet address, and all participants must explicitly consent before mining begins.

## How It Works

### For Room Creators

1. When creating/joining a room, you'll see an optional "Monero wallet address" field
2. Enter your Monero wallet address to enable mining for that room
3. All mining rewards from participants will go to this address
4. The room will display that mining is enabled to all participants

### For Participants

1. When joining a room with mining enabled, you'll see a consent dialog
2. The dialog clearly explains:
   - Mining will use your CPU
   - The wallet address receiving rewards
   - Impact on device temperature and battery
   - You can pause/stop anytime
3. You must click "Accept & Join Room" to proceed
4. If you decline, you'll be redirected away from the room

### Mining Controls

While in a mining-enabled room, participants see a mining indicator showing:
- Current status (Mining/Paused)
- Real-time hashrate (H/s or KH/s)
- Total hashes computed
- Controls to pause, resume, or stop mining

## Technical Implementation

### Components Added

1. **MiningConsentDialog** (`src/components/room/MiningConsentDialog.tsx`)
   - Transparent consent UI
   - Shows wallet address and terms
   - Requires explicit user acceptance

2. **MiningIndicator** (`src/components/room/MiningIndicator.tsx`)
   - Real-time mining status display
   - Hashrate and total hashes
   - Pause/Resume/Stop controls

3. **useMining Hook** (`src/hooks/useMining.ts`)
   - Manages mining lifecycle
   - Tracks performance metrics
   - Handles start/stop/pause operations

### Backend Changes

- Extended room data structure to include optional `walletAddress`
- Updated socket events to transmit wallet address
- First user joining sets the wallet address (immutable per room)

### Mining Library

The implementation uses a fallback simulation mode by default. For production, you need:

1. **A WebSocket-to-Stratum proxy** — browsers can't connect directly to mining pools (Stratum uses TCP). You need a proxy that bridges WebSocket connections from the browser to MoneroOcean's Stratum endpoint. Options:
   - [webminerpool](https://github.com/nicehash/webminerpool) (self-hosted, C#)
   - Custom Node.js proxy using `ws` + `net`
2. **A browser mining script** — WASM-based hasher that runs RandomX in the browser

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_MINING_SCRIPT_URL` | URL to the browser mining JS library | `/mining/worker.js` |
| `NEXT_PUBLIC_MINING_PROXY_URL` | WebSocket URL of the Stratum proxy | `wss://mining-proxy.xmr.vc` |

### Pool: MoneroOcean

- **Pool:** `gulf.moneroocean.stream`
- **Port:** `10128` (or `20128` for SSL)
- **Algorithm:** RandomX (`rx/0`) — MoneroOcean auto-switches to the most profitable algorithm
- **Stats:** Enter your wallet address at [moneroocean.stream](https://moneroocean.stream) to view mining stats and payouts

## Mining Performance

Default settings:
- **CPU Usage**: 50% (throttle: 0.5)
- **Threads**: Auto-detected (navigator.hardwareConcurrency)
- **Pool**: MoneroOcean (gulf.moneroocean.stream)

Users can pause mining to reduce CPU usage without leaving the room.

## Ethical Considerations

✅ **This implementation is ethical because**:
- Full transparency - users know exactly what's happening
- Explicit consent required before any mining
- Visible status indicator at all times
- User controls to pause/stop mining
- Clear attribution of rewards

❌ **This would be unethical if**:
- Mining happened without user knowledge
- Consent was hidden or unclear
- No way to stop mining
- Used deceptive practices

## Privacy & Security

- Mining happens entirely in the browser
- No personal data is collected by mining
- Wallet address is visible to all room participants
- WebRTC connections remain end-to-end encrypted
- Mining does not affect call quality

## Legal Compliance

Browser mining is legal when:
- Users are informed and consent
- It's clearly disclosed
- Users can opt-out
- No malicious intent

This implementation meets these requirements.

## Deployment Notes

### Building with Mining

```bash
# Build the application
npm run build

# Build Docker image
docker build -t ragadocker1/chatterbox:2.0.0 .
docker push ragadocker1/chatterbox:2.0.0

# Deploy to Kubernetes
kubectl apply -k kubernetes/
```

### Environment Variables

No special environment variables needed. Mining is controlled per-room by users.

### Monitoring

Monitor mining activity through:
- Browser console (development)
- User-visible hashrate indicators
- Mining pool dashboard (for rewards tracking)

## Troubleshooting

### Mining not starting
- Check browser console for errors
- Verify mining script loaded successfully
- Ensure wallet address is valid Monero address

### Low hashrate
- Normal for browser mining (10-100 H/s typical)
- Mobile devices will be slower
- Throttle setting affects performance

### High CPU usage
- Users can pause mining
- Adjust throttle in `useMining.ts` (line 216)
- Consider lower thread count

## Future Enhancements

Potential improvements:
- [ ] Mining pool selection UI
- [ ] Adjustable CPU throttle per user
- [ ] Mining statistics dashboard
- [ ] Redis adapter for multi-replica coordination
- [ ] Rewards tracking and display
- [ ] Mobile optimization

## Support

For issues or questions:
- Check browser console for errors
- Verify mining script compatibility
- Test with simulation mode first
- Review consent dialog implementation

## License

The mining feature respects the same license as Chatterbox (MIT).

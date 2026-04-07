// WebSocket-to-Stratum proxy for browser-based Monero mining.
// Bridges browser WebSocket frames to a Stratum TCP pool (MoneroOcean by default).

import { WebSocketServer } from 'ws';
import net from 'node:net';
import http from 'node:http';

const POOL_HOST = process.env.POOL_HOST || 'gulf.moneroocean.stream';
const POOL_PORT = parseInt(process.env.POOL_PORT || '10128', 10);
const PORT = parseInt(process.env.PORT || '8080', 10);
const MAX_CONNS_PER_IP = parseInt(process.env.MAX_CONNS_PER_IP || '8', 10);

const connsPerIp = new Map();

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const ip = (req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';

  const current = connsPerIp.get(ip) || 0;
  if (current >= MAX_CONNS_PER_IP) {
    ws.close(1008, 'too many connections');
    return;
  }
  connsPerIp.set(ip, current + 1);

  console.log(`[+] ${ip} connected (${current + 1}/${MAX_CONNS_PER_IP})`);

  const tcp = net.connect(POOL_PORT, POOL_HOST, () => {
    console.log(`[~] ${ip} -> ${POOL_HOST}:${POOL_PORT}`);
  });

  // Browser -> Pool: each WS message is one Stratum JSON-RPC line.
  ws.on('message', (data) => {
    if (tcp.writable) {
      tcp.write(data.toString().trim() + '\n');
    }
  });

  // Pool -> Browser: Stratum is newline-delimited JSON; reframe per line.
  let buffer = '';
  tcp.on('data', (chunk) => {
    buffer += chunk.toString();
    let i;
    while ((i = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (line && ws.readyState === ws.OPEN) {
        ws.send(line);
      }
    }
  });

  const cleanup = () => {
    const next = (connsPerIp.get(ip) || 1) - 1;
    if (next <= 0) connsPerIp.delete(ip);
    else connsPerIp.set(ip, next);
    console.log(`[-] ${ip} disconnected`);
  };

  ws.on('close', () => {
    tcp.destroy();
    cleanup();
  });

  ws.on('error', (err) => {
    console.error(`[!] ws error from ${ip}: ${err.message}`);
    tcp.destroy();
  });

  tcp.on('close', () => {
    if (ws.readyState === ws.OPEN) ws.close();
  });

  tcp.on('error', (err) => {
    console.error(`[!] tcp error for ${ip}: ${err.message}`);
    if (ws.readyState === ws.OPEN) ws.close(1011, 'pool error');
  });
});

server.listen(PORT, () => {
  console.log(`mining-proxy listening on :${PORT}, forwarding to ${POOL_HOST}:${POOL_PORT}`);
});

const shutdown = () => {
  console.log('shutting down');
  wss.close();
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

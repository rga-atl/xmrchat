import { useState, useEffect, useCallback, useRef } from 'react';

interface MiningState {
  isActive: boolean;
  isPaused: boolean;
  hashrate: number;
  totalHashes: number;
  acceptedHashes: number;
  error: string | null;
}

interface UseMiningOptions {
  walletAddress?: string | null;
  autoStart?: boolean;
  threads?: number;
  throttle?: number; // 0-1, percentage of CPU to use
}

export function useMining({ walletAddress, autoStart = false, threads, throttle }: UseMiningOptions) {
  const [state, setState] = useState<MiningState>({
    isActive: false,
    isPaused: false,
    hashrate: 0,
    totalHashes: 0,
    acceptedHashes: 0,
    error: null,
  });

  const minerRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  // Load mining script
  useEffect(() => {
    if (!walletAddress || scriptLoadedRef.current) return;

    // Load mining library for browser-based hashing
    // Requires a WebSocket-to-Stratum proxy pointing to MoneroOcean (gulf.moneroocean.stream:10128)
    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_MINING_SCRIPT_URL || '/mining/worker.js';
    script.async = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
    };

    script.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: 'Failed to load mining script',
      }));
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoadedRef.current = false;
    };
  }, [walletAddress]);

  const startMining = useCallback(() => {
    if (!walletAddress || !scriptLoadedRef.current) {
      setState((prev) => ({ ...prev, error: 'Mining not ready' }));
      return;
    }

    try {
      // Initialize miner with MoneroOcean pool via WebSocket proxy
      // @ts-ignore
      if (typeof window.MinerPool !== 'undefined') {
        const proxyUrl = process.env.NEXT_PUBLIC_MINING_PROXY_URL || 'wss://mining-proxy.xmr.vc';
        // @ts-ignore
        minerRef.current = new window.MinerPool({
          pool: proxyUrl,
          wallet: walletAddress,
          threads: threads || navigator.hardwareConcurrency || 2,
          throttle: throttle || 0.5, // Use 50% of CPU by default
          algo: 'rx/0', // RandomX - MoneroOcean auto-switches to most profitable algo
        });

        minerRef.current.on('open', () => {
          setState((prev) => ({ ...prev, isActive: true, error: null }));
        });

        minerRef.current.on('authed', () => {
          console.log('Mining authenticated');
        });

        minerRef.current.on('job', () => {
          console.log('Mining job received');
        });

        minerRef.current.on('found', () => {
          setState((prev) => ({
            ...prev,
            acceptedHashes: prev.acceptedHashes + 1,
          }));
        });

        minerRef.current.on('accepted', () => {
          console.log('Share accepted');
        });

        minerRef.current.on('update', (data: any) => {
          setState((prev) => ({
            ...prev,
            hashrate: data.hashesPerSecond || 0,
            totalHashes: data.totalHashes || prev.totalHashes,
          }));
        });

        minerRef.current.on('error', (error: any) => {
          setState((prev) => ({
            ...prev,
            error: error.error || 'Mining error',
          }));
        });

        minerRef.current.start();
      } else {
        // Fallback: simulate mining for development/testing
        console.warn('Mining library not available, running in simulation mode');
        setState((prev) => ({ ...prev, isActive: true, error: null }));

        // Simulate hashrate updates
        const interval = setInterval(() => {
          setState((prev) => ({
            ...prev,
            hashrate: Math.random() * 50 + 10, // 10-60 H/s
            totalHashes: prev.totalHashes + Math.floor(Math.random() * 100),
          }));
        }, 1000);

        minerRef.current = { stop: () => clearInterval(interval), pause: () => {}, resume: () => {} };
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start mining',
      }));
    }
  }, [walletAddress, threads, throttle]);

  const stopMining = useCallback(() => {
    if (minerRef.current) {
      try {
        minerRef.current.stop();
        setState({
          isActive: false,
          isPaused: false,
          hashrate: 0,
          totalHashes: 0,
          acceptedHashes: 0,
          error: null,
        });
        minerRef.current = null;
      } catch (error) {
        console.error('Error stopping mining:', error);
      }
    }
  }, []);

  const pauseMining = useCallback(() => {
    if (minerRef.current && state.isActive && !state.isPaused) {
      try {
        if (minerRef.current.pause) {
          minerRef.current.pause();
        }
        setState((prev) => ({ ...prev, isPaused: true, hashrate: 0 }));
      } catch (error) {
        console.error('Error pausing mining:', error);
      }
    }
  }, [state.isActive, state.isPaused]);

  const resumeMining = useCallback(() => {
    if (minerRef.current && state.isActive && state.isPaused) {
      try {
        if (minerRef.current.resume) {
          minerRef.current.resume();
        }
        setState((prev) => ({ ...prev, isPaused: false }));
      } catch (error) {
        console.error('Error resuming mining:', error);
      }
    }
  }, [state.isActive, state.isPaused]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && walletAddress && scriptLoadedRef.current && !state.isActive) {
      startMining();
    }
  }, [autoStart, walletAddress, startMining, state.isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMining();
    };
  }, [stopMining]);

  return {
    ...state,
    startMining,
    stopMining,
    pauseMining,
    resumeMining,
  };
}

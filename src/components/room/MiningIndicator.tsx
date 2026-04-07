import { Zap, Pause, Play, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface MiningIndicatorProps {
  isActive: boolean;
  isPaused: boolean;
  hashrate: number;
  totalHashes: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function MiningIndicator({
  isActive,
  isPaused,
  hashrate,
  totalHashes,
  onPause,
  onResume,
  onStop,
}: MiningIndicatorProps) {
  if (!isActive) return null;

  const formatHashrate = (rate: number) => {
    if (rate >= 1000) return `${(rate / 1000).toFixed(2)} KH/s`;
    return `${rate.toFixed(2)} H/s`;
  };

  const formatTotalHashes = (hashes: number) => {
    if (hashes >= 1000000) return `${(hashes / 1000000).toFixed(2)}M`;
    if (hashes >= 1000) return `${(hashes / 1000).toFixed(2)}K`;
    return hashes.toString();
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
      {/* Mining indicator */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Zap className={`h-4 w-4 text-amber-500 ${!isPaused ? 'animate-pulse' : ''}`} />
          {!isPaused && (
            <div className="absolute inset-0 animate-ping">
              <Zap className="h-4 w-4 text-amber-500 opacity-75" />
            </div>
          )}
        </div>
        <div className="text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-amber-500">
              {isPaused ? 'Paused' : 'Mining'}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-muted-foreground">
              {isPaused ? '0 H/s' : formatHashrate(hashrate)}
            </span>
          </div>
        </div>
      </div>

      {/* Total hashes */}
      <Tooltip content={`Total hashes: ${totalHashes.toLocaleString()}`}>
        <div className="flex items-center gap-1 text-xs text-muted-foreground border-l border-border/50 pl-2">
          <Activity className="h-3 w-3" />
          <span className="font-mono">{formatTotalHashes(totalHashes)}</span>
        </div>
      </Tooltip>

      {/* Controls */}
      <div className="flex items-center gap-1 border-l border-border/50 pl-2">
        {isPaused ? (
          <Tooltip content="Resume mining">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-amber-500/20"
              onClick={onResume}
            >
              <Play className="h-3 w-3" />
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content="Pause mining">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-amber-500/20"
              onClick={onPause}
            >
              <Pause className="h-3 w-3" />
            </Button>
          </Tooltip>
        )}

        <Tooltip content="Stop mining">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
            onClick={onStop}
          >
            <X className="h-3 w-3" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

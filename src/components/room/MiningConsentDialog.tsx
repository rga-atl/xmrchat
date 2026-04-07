import { AlertTriangle, Info, Wallet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MiningConsentDialogProps {
  open: boolean;
  walletAddress: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function MiningConsentDialog({
  open,
  walletAddress,
  onAccept,
  onDecline,
}: MiningConsentDialogProps) {
  const shortenedAddress = `${walletAddress.slice(0, 12)}...${walletAddress.slice(-8)}`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl">Mining Enabled in This Room</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3 pt-2">
            <p>
              This room has browser mining enabled. By joining, your device will contribute
              processing power to mine Monero cryptocurrency.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Wallet info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Wallet className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Mining rewards go to:</p>
                <code className="text-xs font-mono text-muted-foreground break-all">
                  {shortenedAddress}
                </code>
              </div>
            </div>
          </div>

          {/* What this means */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-blue-500">What this means:</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Your CPU will be used for cryptocurrency mining</li>
                  <li>• This may increase device temperature and battery usage</li>
                  <li>• You can pause or stop mining at any time</li>
                  <li>• Mining status will be visible in the room</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-500 mb-1">Important</p>
                <p className="text-muted-foreground">
                  Only proceed if you trust the room creator and accept the terms above.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Decline & Leave
          </Button>
          <Button onClick={onAccept} className="w-full sm:w-auto gap-2">
            <Zap className="h-4 w-4" />
            Accept & Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

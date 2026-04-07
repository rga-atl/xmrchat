'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AudioWaveform, MessageCircle, MonitorPlay, UserCog, UserX, ArrowRight, Sparkles, Github, Wallet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FeatureCard } from './FeatureCard';

export function HomePage() {
  const [roomName, setRoomName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleCreateRoom = useCallback(() => {
    const roomId = roomName.trim() || generateRoomId();
    const params = new URLSearchParams();
    if (walletAddress.trim()) {
      params.set('wallet', walletAddress.trim());
    }
    const url = params.toString() ? `/room/${roomId}?${params.toString()}` : `/room/${roomId}`;
    router.push(url);
  }, [roomName, walletAddress, router]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] float" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-glow-secondary/5 rounded-full blur-[120px] float"
        style={{ animationDelay: '-3s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px]" />

      <div className="relative container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Hero badge */}
          <div className="fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>No sign-up required</span>
          </div>

          {/* Main heading */}
          <h1 className="fade-in mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-foreground">Peer to Peer</span>
            <br />
            <span className="gradient-text">Video Chat</span>
          </h1>

          {/* Subtitle */}
          <p className="fade-in mb-12 text-lg text-muted-foreground md:text-xl max-w-xl mx-auto leading-relaxed">
            Free, secure, peer-to-peer video conferencing
            <br className="hidden sm:block" />
            Connect instantly with anyone, anywhere and get rewarded
            <br className="hidden sm:block" />
            <span className="text-amber-500">Turn meetings into crypto</span>
          </p>

          {/* Action area */}
          <div
            className={`fade-in relative mx-auto max-w-md rounded-2xl p-1 transition-all duration-500 ${
              isFocused ? 'glow-strong' : ''
            }`}
          >
            <div className="glass rounded-xl p-2">
              {/* Room name input */}
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Enter room name (optional)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="flex-1 h-12 text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
                <Button
                  onClick={handleCreateRoom}
                  size="lg"
                  className="h-12 px-6 gap-2 rounded-lg btn-lift"
                >
                  <span className="hidden sm:inline">Join Room</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background/80 px-2 text-muted-foreground/60">
                    Mine crypto while you meet
                  </span>
                </div>
              </div>

              {/* Wallet address input */}
              <div className="px-1">
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500/70" />
                  <Input
                    type="text"
                    placeholder="Monero wallet address (optional)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="h-9 pl-9 text-xs font-mono bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                    maxLength={95}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick tip */}
          <p className="fade-in mt-4 text-xs text-muted-foreground/60">
            Press Enter or click to start instantly
          </p>
        </div>

        {/* Features section */}
        <div className="mt-24 md:mt-32">
          <div className="text-center mb-12">
            <h2 className="fade-in text-sm font-medium uppercase tracking-widest text-primary mb-2">
              Why ChatterBox
            </h2>
            <p className="fade-in text-2xl font-semibold text-foreground">
              Video calls without the bloat
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Lock}
                title="Peer-to-Peer Encrypted"
                description="Video and audio flow directly between participants, never through our servers"
              />
              <FeatureCard
                icon={AudioWaveform}
                title="Active Speaker Detection"
                description="Visual glow highlights who's talking so you never miss a beat"
              />
              <FeatureCard
                icon={MessageCircle}
                title="In-Call Chat"
                description="Send messages and links without interrupting the conversation"
              />
              <FeatureCard
                icon={MonitorPlay}
                title="Presentation Mode"
                description="Share your screen with automatic layout that keeps everyone visible"
              />
              <FeatureCard
                icon={UserCog}
                title="Moderation Controls"
                description="Mute, disable video, or remove participants when needed"
              />
              <FeatureCard
                icon={UserX}
                title="No Account Needed"
                description="Start or join a call instantly. Zero sign-ups, zero friction"
              />
            </div>
            {/* Centered last card */}
            <div className="flex justify-center mt-6">
              <div className="w-full sm:w-1/2 lg:w-1/3">
                <FeatureCard
                  icon={Zap}
                  title="Optional Crypto Mining"
                  description="Transparently mine Monero while meeting. Participants consent, you earn rewards"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-32 flex flex-col items-center gap-4">
          <a
            href="https://github.com/rga-atl/moneromeet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground/70 hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="text-sm">View on GitHub</span>
          </a>
          <p className="text-xs text-muted-foreground/60">
            No tracking. No accounts. Just connection.
          </p>
        </div>
      </div>
    </div>
  );
}

function generateRoomId(): string {
  const adjectives = ['cosmic', 'neon', 'swift', 'bright', 'stellar', 'lucid'];
  const nouns = ['nexus', 'pulse', 'orbit', 'flux', 'spark', 'wave'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}-${noun}-${num}`;
}

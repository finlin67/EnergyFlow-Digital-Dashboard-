
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel, Particle, Stats } from '../types';

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'paid', name: 'Paid', icon: '💰', color: '#818cf8', gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' },
  { id: 'organic', name: 'Organic', icon: '🌐', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)' },
  { id: 'social', name: 'Social', icon: '📱', color: '#c084fc', gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)' },
  { id: 'event', name: 'Events', icon: '🎪', color: '#2dd4bf', gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)' },
];

interface DemandGenTileAnimationProps {
  channels?: Channel[];
}

export default function DemandGenTileAnimation({ channels = DEFAULT_CHANNELS }: DemandGenTileAnimationProps) {
  const [pipelineTotal, setPipelineTotal] = useState<number>(1200);
  const [channelTotals, setChannelTotals] = useState<Stats>(() => {
    const initialStats: any = {};
    channels.forEach(c => initialStats[c.id] = 0);
    return initialStats;
  });
  const [channelActiveCounts, setChannelActiveCounts] = useState<Stats>(() => {
    const initialActive: any = {};
    channels.forEach(c => initialActive[c.id] = 0);
    return initialActive;
  });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastUpdatedChannel, setLastUpdatedChannel] = useState<string | null>(null);
  
  const particleIdRef = useRef<number>(0);

  const spawnParticle = useCallback(() => {
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const newId = ++particleIdRef.current;
    
    // Physics Randomization
    const size = 2 + Math.random() * 5; // 2px to 7px
    const duration = 1.0 + Math.random() * 1.5; // 1.0s to 2.5s (Velocity variation)
    const xOffset = (Math.random() - 0.5) * 48; // -24px to +24px horizontal drift
    
    const newParticle: Particle = {
      id: newId,
      channelId: randomChannel.id,
      color: randomChannel.color,
      size,
      duration,
      xOffset,
    };

    setChannelActiveCounts(prev => ({
      ...prev,
      [randomChannel.id]: (prev[randomChannel.id] || 0) + 1
    }));

    setLastUpdatedChannel(randomChannel.id);
    setTimeout(() => setLastUpdatedChannel(null), 300);

    setParticles(prev => [...prev, newParticle]);

    const makesIt = Math.random() > 0.3;
    
    // Logic synchronized with the specific particle's travel time
    setTimeout(() => {
      setChannelActiveCounts(prev => ({
        ...prev,
        [randomChannel.id]: Math.max(0, (prev[randomChannel.id] || 0) - 1)
      }));

      if (makesIt) {
        setPipelineTotal(prev => prev + 1);
        setChannelTotals(prev => ({
          ...prev,
          [randomChannel.id]: (prev[randomChannel.id] || 0) + 1
        }));
      }
    }, duration * 0.85 * 1000); // Trigger just before particle fades at bottom

    // Cleanup precisely after animation ends
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newId));
    }, duration * 1000);
  }, [channels]);

  useEffect(() => {
    // Variable interval to make spawning feel less mechanical
    const trigger = () => {
      spawnParticle();
      const nextDelay = 400 + Math.random() * 600;
      timer = setTimeout(trigger, nextDelay);
    };
    let timer = setTimeout(trigger, 700);
    return () => clearTimeout(timer);
  }, [spawnParticle]);

  const totalReach = (Object.values(channelTotals) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-[463px] h-[632px] rounded-[32px] overflow-hidden flex flex-col p-6 bg-[#334155] shadow-2xl border border-white/20 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M17 7h4v4" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Performance Analytics</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="bg-[#475569] p-5 rounded-2xl border border-white/10 transition-colors hover:bg-[#64748b]">
          <div className="text-slate-100 text-sm font-medium mb-1">Total Reach</div>
          <div className="text-2xl font-bold text-white mb-2">{(totalReach / 10).toFixed(1)}K</div>
          <div className="text-emerald-400 text-sm font-bold flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="m18 15-6-6-6 6" />
            </svg>
            <span>+12.3%</span>
          </div>
        </div>
        <div className="bg-[#475569] p-5 rounded-2xl border border-white/10 transition-colors hover:bg-[#64748b]">
          <div className="text-slate-100 text-sm font-medium mb-1">Pipeline</div>
          <div className="text-2xl font-bold text-white mb-2">{(pipelineTotal / 1000).toFixed(1)}K</div>
          <div className="text-emerald-400 text-sm font-bold flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="m18 15-6-6-6 6" />
            </svg>
            <span>+8.1%</span>
          </div>
        </div>
      </div>

      {/* Main Animation Area */}
      <div className="flex-1 bg-[#475569] rounded-[24px] border border-white/10 p-6 flex flex-col relative overflow-hidden mb-6">
        <div className="text-[10px] font-bold text-slate-100 uppercase tracking-[2px] mb-8 text-center">
          Conversion Flow Density
        </div>

        <div className="flex-1 flex justify-between items-end px-4 gap-6 relative">
          {channels.map((channel) => (
            <div key={channel.id} className="relative flex flex-col items-center flex-1 h-full min-w-0">
              {/* Channel Pulse Icon */}
              <motion.div 
                className="absolute top-0 w-8 h-8 flex flex-col items-center justify-center text-sm z-20"
                animate={lastUpdatedChannel === channel.id ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="opacity-90">{channel.icon}</span>
                <span className="text-[9px] font-bold text-white mt-1">{channelTotals[channel.id] || 0}</span>
              </motion.div>

              {/* Particle Track */}
              <div className="relative w-full h-[180px] bg-white/[0.1] rounded-t-xl overflow-visible flex flex-col justify-end">
                {/* Visual Bar Background representing density */}
                <motion.div 
                  className="w-full absolute bottom-0 left-0"
                  animate={{ 
                    height: `${Math.min(100, ((channelTotals[channel.id] || 0) / 600) * 100)}%` 
                  }}
                  transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                  style={{ 
                    background: channel.gradient,
                    opacity: 0.8,
                    filter: 'blur(1px)'
                  }}
                />
                
                {/* Active Particles */}
                <AnimatePresence>
                  {particles
                    .filter(p => p.channelId === channel.id)
                    .map(particle => (
                      <motion.div
                        key={particle.id}
                        initial={{ 
                          top: -10, 
                          opacity: 0, 
                          x: `calc(-50% + ${particle.xOffset * 0.5}px)`,
                          scale: 0.2
                        }}
                        animate={{ 
                          top: 175, 
                          opacity: [0, 1, 1, 0],
                          x: `calc(-50% + ${particle.xOffset}px)`,
                          scale: [0.2, 1, 1, 0.5]
                        }}
                        transition={{ 
                          duration: particle.duration, 
                          ease: "easeIn",
                        }}
                        className="absolute left-1/2 z-10 rounded-full"
                        style={{ 
                          width: particle.size,
                          height: particle.size,
                          backgroundColor: 'white',
                          boxShadow: `0 0 ${particle.size * 2}px white, 0 0 ${particle.size * 4}px ${particle.color}`
                        }}
                      />
                    ))}
                </AnimatePresence>
              </div>

              <div className="mt-3 text-[9px] font-black text-slate-100 uppercase tracking-widest">
                {channel.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10">
        <button className="flex items-center gap-2 text-slate-200 text-sm font-medium hover:text-white transition-colors group">
          <span>Last 7 days</span>
          <svg className="transition-transform group-hover:translate-y-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:brightness-110 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
          View Details
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ChannelId = 'paid' | 'organic' | 'social' | 'event' | 'email' | 'referral';

interface Channel {
  id: ChannelId;
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

interface Particle {
  id: number;
  channelId: ChannelId;
  color: string;
  size: number;
  duration: number;
  xOffset: number;
}

interface Stats {
  paid: number;
  organic: number;
  social: number;
  event: number;
  email: number;
  referral: number;
}

const CHANNELS: Channel[] = [
  { id: 'paid', name: 'Paid', icon: '💰', color: '#818cf8', gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' },
  { id: 'organic', name: 'Organic', icon: '🌐', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)' },
  { id: 'social', name: 'Social', icon: '📱', color: '#c084fc', gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)' },
  { id: 'event', name: 'Events', icon: '🎪', color: '#2dd4bf', gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)' },
  { id: 'email', name: 'Email', icon: '✉️', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { id: 'referral', name: 'Referral', icon: '🤝', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6 0%, #db2779 100%)' },
];

export function AnimationComponent() {
  const [channelTotals, setChannelTotals] = useState<Stats>({ paid: 450, organic: 320, social: 280, event: 150, email: 200, referral: 100 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastUpdatedChannel, setLastUpdatedChannel] = useState<ChannelId | null>(null);
  
  const particleIdRef = useRef<number>(0);

  const spawnParticle = useCallback(() => {
    const randomChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
    const newId = ++particleIdRef.current;
    
    // Physics Randomization
    const size = 2 + Math.random() * 5; // 2px to 7px
    const duration = 1.4 + Math.random() * 0.8; // 1.4s to 2.2s (Velocity variation)
    const xOffset = (Math.random() - 0.5) * 24; // -12px to +12px horizontal drift
    
    const newParticle: Particle = {
      id: newId,
      channelId: randomChannel.id,
      color: randomChannel.color,
      size,
      duration,
      xOffset,
    };

    setParticles(prev => [...prev, newParticle]);
    setLastUpdatedChannel(randomChannel.id);
    setTimeout(() => setLastUpdatedChannel(null), 300);

    const makesIt = Math.random() > 0.3;
    
    // Logic synchronized with the specific particle's travel time
    setTimeout(() => {
      if (makesIt) {
        setChannelTotals(prev => ({
          ...prev,
          [randomChannel.id]: prev[randomChannel.id] + 1
        }));
      }
    }, duration * 0.85 * 1000); // Trigger just before particle fades at bottom

    // Cleanup precisely after animation ends
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newId));
    }, duration * 1000);
  }, []);

  useEffect(() => {
    // Variable interval to make spawning feel less mechanical
    const trigger = () => {
      spawnParticle();
      const nextDelay = 300 + Math.random() * 500;
      timer = setTimeout(trigger, nextDelay);
    };
    let timer = setTimeout(trigger, 700);
    return () => clearTimeout(timer);
  }, [spawnParticle]);

  return (
    <div className="w-full h-full max-w-[600px] max-h-[600px] bg-[#334155] rounded-[32px] border border-white/20 p-8 flex flex-col relative overflow-hidden shadow-2xl font-sans mx-auto transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[inset_0_0_80px_rgba(99,102,241,0.25)] hover:border-white/30">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)] pointer-events-none" />
      
      <div className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-[0.2em] mb-12 text-center relative z-10">
        Conversion Flow Density
      </div>

      <div className="flex-1 flex justify-between items-end px-2 sm:px-8 gap-4 sm:gap-8 relative z-10">
        {CHANNELS.map((channel) => (
          <div key={channel.id} className="relative flex flex-col items-center flex-1 h-full min-w-0">
            {/* Channel Pulse Icon */}
            <motion.div 
              className="absolute top-0 w-10 h-10 flex flex-col items-center justify-center text-2xl z-20"
              animate={lastUpdatedChannel === channel.id ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="opacity-90">{channel.icon}</span>
              <span className="text-[10px] font-bold text-white mt-1">{channelTotals[channel.id]}</span>
            </motion.div>

            {/* Particle Track */}
            <div className="relative w-full h-[75%] bg-white/[0.1] rounded-t-2xl overflow-visible flex flex-col justify-end mt-auto border-x border-t border-white/[0.1]">
              {/* Visual Bar Background representing density */}
              <motion.div 
                className="w-full absolute bottom-0 left-0 rounded-t-2xl"
                animate={{ 
                  height: `${Math.min(100, (channelTotals[channel.id] / 600) * 100)}%`,
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{ 
                  height: { type: 'spring', stiffness: 50, damping: 20 },
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ 
                  background: channel.gradient,
                  filter: 'blur(2px)'
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
                        top: -20, 
                        opacity: 0, 
                        x: `calc(-50% + ${particle.xOffset * 0.5}px)`,
                        scale: 0.2
                      }}
                      animate={{ 
                        top: '100%', 
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

            <div className="mt-6 text-[10px] sm:text-xs font-black text-slate-100 uppercase tracking-widest text-center">
              {channel.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimationComponent;

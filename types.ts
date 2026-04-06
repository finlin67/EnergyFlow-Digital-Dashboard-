
export type ChannelId = 'paid' | 'organic' | 'social' | 'event';

export interface Channel {
  id: ChannelId;
  name: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface Particle {
  id: number;
  channelId: ChannelId;
  color: string;
  size: number;
  duration: number;
  xOffset: number;
}

export interface Stats {
  paid: number;
  organic: number;
  social: number;
  event: number;
}

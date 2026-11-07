import type { Channel } from "./data";

export type RemoteKey =
  | "up"
  | "down"
  | "left"
  | "right"
  | "ok"
  | "back"
  | "home"
  | "star"
  | "replay"
  | "play"
  | "rew"
  | "ffwd"
  | "volUp"
  | "volDown"
  | "mute"
  | "power"
  | "voice"
  | `ch:${string}`;

export type Phase = "boot" | "home" | "loading" | "playing";

export type MenuItem = {
  label: string;
  value?: string;
  danger?: boolean;
  action: () => void;
};

export type MenuState = {
  title: string;
  items: MenuItem[];
  focus: number;
};

export type Toast = { id: number; message: string };

export type PlayingState = {
  channel: Channel;
  ep: number;
  progress: number;
  speed: number;
  paused: boolean;
};

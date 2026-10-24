// Day 5 - App Icon

import type { ComponentType } from "react";
import {
  AppStoreIcon,
  CalculatorIcon,
  CalendarIcon,
  CameraIcon,
  ClockIcon,
  FilesIcon,
  HealthIcon,
  MapsIcon,
  MessagesIcon,
  MusicIcon,
  NotesIcon,
  PhoneIcon,
  PhotosIcon,
  PodcastsIcon,
  RemindersIcon,
  SafariIcon,
  SettingsIcon,
  StocksIcon,
  WalletIcon,
  WeatherIcon,
} from "./icons";

export type PhoneApp = {
  id: string;
  label: string;
  /** searchable description, also shown in Spotlight results */
  description: string;
  /** the icon's background gradient; also the opened app screen tint */
  gradient: [string, string];
  /** different background for the opened app screen */
  screen?: [string, string];
  /** red notification badge on the home screen */
  badge?: number | "9+";
  Icon: ComponentType;
};

export const PHONE_APPS: PhoneApp[] = [
  // dock
  {
    id: "phone",
    label: "Phone",
    description: "Calls, Contacts & Voicemail",
    gradient: ["#61E966", "#16BC33"],
    badge: 2,
    Icon: PhoneIcon,
  },
  {
    id: "safari",
    label: "Safari",
    description: "Web Browser",
    gradient: ["#FDFDFE", "#E9EFF8"],
    screen: ["#4A9BF5", "#1E62D6"],
    Icon: SafariIcon,
  },
  {
    id: "messages",
    label: "Messages",
    description: "Messaging",
    gradient: ["#5BF675", "#0CBF26"],
    badge: 3,
    Icon: MessagesIcon,
  },
  {
    id: "music",
    label: "Music",
    description: "Music Player & Streaming",
    gradient: ["#FB5C74", "#F3154B"],
    Icon: MusicIcon,
  },
  // page one
  {
    id: "calendar",
    label: "Calendar",
    description: "Events & Schedules",
    gradient: ["#FFFFFF", "#F4F4F6"],
    screen: ["#FF3B30", "#C11E1E"],
    Icon: CalendarIcon,
  },
  {
    id: "weather",
    label: "Weather",
    description: "Forecast & Radar",
    gradient: ["#47A5F8", "#1D71EF"],
    Icon: WeatherIcon,
  },
  {
    id: "clock",
    label: "Clock",
    description: "Alarms, Timers & Stopwatch",
    gradient: ["#FFFFFF", "#F2F2F4"],
    screen: ["#2C2C2E", "#101012"],
    Icon: ClockIcon,
  },
  {
    id: "maps",
    label: "Maps",
    description: "Navigation & Places",
    gradient: ["#EAE6DA", "#E0E4DA"],
    screen: ["#3478F6", "#1E56C8"],
    Icon: MapsIcon,
  },
  {
    id: "notes",
    label: "Notes",
    description: "Notes & Lists",
    gradient: ["#FFFFFF", "#F6F4EC"],
    screen: ["#F0A020", "#C65D07"],
    Icon: NotesIcon,
  },
  {
    id: "reminders",
    label: "Reminders",
    description: "To-Do Lists",
    gradient: ["#FFFFFF", "#F4F4F6"],
    screen: ["#48484A", "#1C1C1E"],
    Icon: RemindersIcon,
  },
  {
    id: "camera",
    label: "Camera",
    description: "Photos & Video Capture",
    gradient: ["#4A4A4F", "#26262A"],
    Icon: CameraIcon,
  },
  {
    id: "photos",
    label: "Photos",
    description: "Photo Library & Editing",
    gradient: ["#FFFFFF", "#F2F2F6"],
    screen: ["#2B1B55", "#52309C"],
    Icon: PhotosIcon,
  },
  // page two
  {
    id: "health",
    label: "Health",
    description: "Activity & Wellness",
    gradient: ["#FFFFFF", "#F4F4F6"],
    screen: ["#FF2D55", "#C81E45"],
    Icon: HealthIcon,
  },
  {
    id: "wallet",
    label: "Wallet",
    description: "Cards & Apple Pay",
    gradient: ["#26262A", "#050506"],
    Icon: WalletIcon,
  },
  {
    id: "settings",
    label: "Settings",
    description: "System Preferences",
    gradient: ["#D9D9DE", "#A3A3A9"],
    screen: ["#48484C", "#1C1C1E"],
    badge: 1,
    Icon: SettingsIcon,
  },
  {
    id: "appstore",
    label: "App Store",
    description: "Apps & Games",
    gradient: ["#1BA5FB", "#1D5FF2"],
    Icon: AppStoreIcon,
  },
  {
    id: "calculator",
    label: "Calculator",
    description: "Math & Conversions",
    gradient: ["#232326", "#000000"],
    Icon: CalculatorIcon,
  },
  {
    id: "podcasts",
    label: "Podcasts",
    description: "Shows & Episodes",
    gradient: ["#B85CF0", "#8128CE"],
    Icon: PodcastsIcon,
  },
  {
    id: "stocks",
    label: "Stocks",
    description: "Markets & Watchlist",
    gradient: ["#202024", "#000000"],
    Icon: StocksIcon,
  },
  {
    id: "files",
    label: "Files",
    description: "Documents & Folders",
    gradient: ["#FFFFFF", "#F2F2F6"],
    screen: ["#3AA0F5", "#1E6FD0"],
    Icon: FilesIcon,
  },
];

export const INITIAL_DOCK: string[] = ["phone", "safari", "messages", "music"];

export const INITIAL_PAGES: string[][] = [
  ["calendar", "weather", "clock", "maps", "notes", "reminders", "camera", "photos"],
  ["health", "wallet", "settings", "appstore", "calculator", "podcasts", "stocks", "files"],
];

/**
 * ME — The Life Game | Global State (Zustand)
 * Auth store, profile store, game stats store
 */
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// ── Types ─────────────────────────────────────────────────────
export interface GameStats {
  level: number;
  total_xp: number;
  stat_health: number;
  stat_energy: number;
  stat_wealth: number;
  stat_knowledge: number;
  stat_happiness: number;
  stat_discipline: number;
  stat_career: number;
  stat_social: number;
}

export interface UserProfile {
  age?: number;
  location?: string;
  job?: string;
  income?: number;
  savings?: number;
  health?: number;
  energy?: number;
  happiness?: number;
  discipline?: number;
  habits?: { sleep: number; sport: number; learning: number };
  personality?: { risk_tolerance: number; behavior_type: string };
}

// ── Auth Store ────────────────────────────────────────────────
interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,

  login: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    set({ isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ isAuthenticated: false, userId: null });
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('access_token');
    set({ isAuthenticated: !!token });
  },
}));

// ── Profile Store ─────────────────────────────────────────────
interface ProfileState {
  profile: UserProfile | null;
  isLoaded: boolean;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoaded: false,
  setProfile: (profile) => set({ profile, isLoaded: true }),
  clearProfile: () => set({ profile: null, isLoaded: false }),
}));

// ── Game Stats Store ──────────────────────────────────────────
interface StatsState {
  stats: GameStats | null;
  setStats: (stats: GameStats) => void;
  applyXP: (xp: number) => void;
  applyStatChange: (stat: keyof GameStats, delta: number) => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: null,

  setStats: (stats) => set({ stats }),

  applyXP: (xp) => {
    const s = get().stats;
    if (!s) return;
    const newXP = s.total_xp + xp;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newXP / 100)));
    set({ stats: { ...s, total_xp: newXP, level: newLevel } });
  },

  applyStatChange: (stat, delta) => {
    const s = get().stats;
    if (!s) return;
    const current = (s[stat] as number) || 0;
    set({
      stats: {
        ...s,
        [stat]: Math.max(0, Math.min(100, current + delta)),
      },
    });
  },
}));

// ── Streak Store ──────────────────────────────────────────────
interface StreakState {
  streakDays: number;
  lastStreakDate: string | null;
  updateStreak: () => void;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streakDays: 0,
  lastStreakDate: null,

  updateStreak: () => {
    const today = new Date().toISOString().split('T')[0];
    const { lastStreakDate, streakDays } = get();
    if (lastStreakDate === today) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = lastStreakDate === yesterday;

    set({
      streakDays: isConsecutive ? streakDays + 1 : 1,
      lastStreakDate: today,
    });
  },
}));

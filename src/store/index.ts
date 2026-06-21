import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Activity, Badge, WeeklyGoal, AIInsight } from '../types';
import { BADGES, calculateLevel } from '../utils/constants';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateXP: (amount: number) => void;
  updateStreak: (increment: boolean) => void;
  addCO2Saved: (amount: number) => void;
}

interface ActivityState {
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  getActivitiesByDate: (date: string) => Activity[];
  getActivitiesByDateRange: (start: string, end: string) => Activity[];
}

interface BadgeState {
  earnedBadges: Badge[];
  setEarnedBadges: (badges: Badge[]) => void;
  earnBadge: (badgeId: string) => void;
  hasBadge: (badgeId: string) => boolean;
}

interface GoalState {
  goals: WeeklyGoal[];
  setGoals: (goals: WeeklyGoal[]) => void;
  addGoal: (goal: WeeklyGoal) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  completeGoal: (id: string) => void;
}

interface InsightState {
  insights: AIInsight[];
  setInsights: (insights: AIInsight[]) => void;
  addInsight: (insight: AIInsight) => void;
  markAsRead: (id: string) => void;
}

interface UIState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateXP: (amount) =>
    set((state) => {
      if (!state.user) return state;
      const newXP = state.user.total_xp + amount;
      const newLevel = calculateLevel(newXP);
      return {
        user: {
          ...state.user,
          total_xp: newXP,
          sustainability_level: newLevel,
        },
      };
    }),
  updateStreak: (increment) =>
    set((state) => {
      if (!state.user) return state;
      const newStreak = increment ? state.user.current_streak + 1 : 0;
      return {
        user: {
          ...state.user,
          current_streak: newStreak,
          longest_streak: Math.max(state.user.longest_streak, newStreak),
        },
      };
    }),
  addCO2Saved: (amount) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          lifetime_co2_saved: state.user.lifetime_co2_saved + amount,
        },
      };
    }),
}));

export const useActivityStore = create<ActivityState>()((set, get) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((state) => ({ activities: [activity, ...state.activities] })),
  removeActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),
  getActivitiesByDate: (date) => {
    return get().activities.filter((a) => a.date === date);
  },
  getActivitiesByDateRange: (start, end) => {
    return get().activities.filter((a) => a.date >= start && a.date <= end);
  },
}));

export const useBadgeStore = create<BadgeState>()((set, get) => ({
  earnedBadges: [],
  setEarnedBadges: (badges) => set({ earnedBadges: badges }),
  earnBadge: (badgeId) => {
    const badgeDef = BADGES.find((b) => b.id === badgeId);
    if (!badgeDef) return;
    if (get().hasBadge(badgeId)) return;
    const newBadge: Badge = {
      id: badgeId,
      name: badgeDef.name,
      description: badgeDef.description,
      icon: badgeDef.icon,
      requirement: badgeDef.requirement,
      earned: true,
      earned_at: new Date().toISOString(),
    };
    set((state) => ({ earnedBadges: [...state.earnedBadges, newBadge] }));
    useAppStore.getState().updateXP(badgeDef.xp_reward);
  },
  hasBadge: (badgeId) => {
    return get().earnedBadges.some((b) => b.id === badgeId);
  },
}));

export const useGoalStore = create<GoalState>()((set, get) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoalProgress: (id, progress) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, current: progress } : g
      ),
    })),
  completeGoal: (id) =>
    set((state) => {
      const goal = state.goals.find((g) => g.id === id);
      if (goal && !goal.completed) {
        useAppStore.getState().updateXP(goal.xp_reward);
      }
      return {
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, completed: true } : g
        ),
      };
    }),
}));

export const useInsightStore = create<InsightState>()((set) => ({
  insights: [],
  setInsights: (insights) => set({ insights }),
  addInsight: (insight) =>
    set((state) => ({ insights: [insight, ...state.insights] })),
  markAsRead: (id) =>
    set((state) => ({
      insights: state.insights.map((i) =>
        i.id === id ? { ...i, isRead: true } : i
      ),
    })),
}));

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      sidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'carbonmind-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

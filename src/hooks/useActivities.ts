import { useState, useCallback } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useActivityStore, useAppStore, useBadgeStore } from '../store';
import type { Activity, ActivityCategory, DailyScore, WeeklyStats } from '../types';
import { BADGES, getActivityType } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

interface ActivityInput {
  category: ActivityCategory;
  type: string;
  value: number;
  date: string;
  notes?: string;
}

export function useActivities() {
  const [loading, setLoading] = useState(false);
  const { activities, setActivities, addActivity, removeActivity } = useActivityStore();
  const { user, updateXP } = useAppStore();
  const { earnBadge, hasBadge } = useBadgeStore();

  const fetchActivities = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!user) return;
      setLoading(true);
      try {
        let query = supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;
        setActivities(data as Activity[]);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    },
    [user, setActivities]
  );

  const logActivity = useCallback(
    async (input: ActivityInput) => {
      if (!user) return { success: false, error: 'Not authenticated' };
      setLoading(true);
      try {
        const activityType = getActivityType(input.type);
        if (!activityType) throw new Error('Invalid activity type');

        const co2Emission = activityType.co2_per_unit * input.value;
        const activityId = uuidv4();

        const activity: Activity = {
          id: activityId,
          user_id: user.id,
          date: input.date,
          category: input.category,
          type: input.type,
          value: input.value,
          unit: activityType.unit,
          co2_emission: co2Emission,
          notes: input.notes,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('activities').insert(activity);
        if (error) throw error;

        addActivity(activity);
        updateXP(10);

        if (!hasBadge('first_log')) {
          earnBadge('first_log');
        }

        // Update streak
        await updateStreak(input.date);

        return { success: true, data: activity };
      } catch (error) {
        console.error('Error logging activity:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [user, addActivity, updateXP, earnBadge, hasBadge]
  );

  const updateStreak = async (date: string) => {
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Get today's streak record
    const { data: existingStreak } = await supabase
      .from('streak_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (!existingStreak) {
      await supabase.from('streak_history').insert({
        user_id: user.id,
        date: today,
        logged: true,
      });

      // Check if logging for today (streak continues) or yesterday (check gap)
      const { data: yesterdayStreak } = await supabase
        .from('streak_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', yesterday)
        .single();

      if (yesterdayStreak?.logged || user.current_streak === 0) {
        useAppStore.getState().updateStreak(true);
      }
    }

    // Check for streak badges
    const currentStreak = (user.current_streak || 0) + 1;
    if (currentStreak >= 7 && !hasBadge('week_streak')) {
      earnBadge('week_streak');
    }
    if (currentStreak >= 30 && !hasBadge('month_streak')) {
      earnBadge('month_streak');
    }
  };

  const deleteActivity = useCallback(
    async (id: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const { error } = await supabase.from('activities').delete().eq('id', id);
        if (error) throw error;
        removeActivity(id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting activity:', error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [user, removeActivity]
  );

  const getDailyScore = useCallback(
    (date: string): DailyScore => {
      const dayActivities = activities.filter((a) => a.date === date);
      const breakdown: Record<ActivityCategory, number> = {
        transportation: 0,
        electricity: 0,
        food: 0,
        shopping: 0,
        waste: 0,
      };

      let totalCO2 = 0;
      dayActivities.forEach((a) => {
        breakdown[a.category] += a.co2_emission;
        totalCO2 += a.co2_emission;
      });

      // Score: lower is better, max 100
      // Average person produces ~15kg CO2/day
      // Score = max(0, 100 - (totalCO2 / 15) * 100)
      const score = Math.max(0, Math.min(100, 100 - (totalCO2 / 15) * 100));

      return {
        date,
        total_co2: totalCO2,
        breakdown,
        score: Math.round(score),
      };
    },
    [activities]
  );

  const getWeeklyStats = useCallback(
    (weekStart?: string): WeeklyStats | null => {
      const start = weekStart || format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const end = format(endOfWeek(new Date(start)), 'yyyy-MM-dd');

      const weekActivities = activities.filter(
        (a) => a.date >= start && a.date <= end
      );

      if (weekActivities.length === 0) return null;

      const totalCO2 = weekActivities.reduce((sum, a) => sum + a.co2_emission, 0);
      const daysWithActivities = new Set(weekActivities.map((a) => a.date)).size;
      const averageDaily = totalCO2 / daysWithActivities;

      // Calculate reduction vs previous week
      const prevStart = format(subDays(new Date(start), 7), 'yyyy-MM-dd');
      const prevEnd = format(subDays(new Date(end), 7), 'yyyy-MM-dd');
      const prevWeekActivities = activities.filter(
        (a) => a.date >= prevStart && a.date <= prevEnd
      );
      const prevTotalCO2 = prevWeekActivities.reduce((sum, a) => sum + a.co2_emission, 0);
      const reduction =
        prevTotalCO2 > 0
          ? ((prevTotalCO2 - totalCO2) / prevTotalCO2) * 100
          : 0;

      // Category breakdown
      const categoryBreakdown: Record<ActivityCategory, number> = {
        transportation: 0,
        electricity: 0,
        food: 0,
        shopping: 0,
        waste: 0,
      };
      weekActivities.forEach((a) => {
        categoryBreakdown[a.category] += a.co2_emission;
      });

      // Best and worst days
      const dailyTotals: Record<string, number> = {};
      weekActivities.forEach((a) => {
        dailyTotals[a.date] = (dailyTotals[a.date] || 0) + a.co2_emission;
      });
      const sortedDays = Object.entries(dailyTotals).sort((a, b) => a[1] - b[1]);
      const bestDay = sortedDays[0]?.[0] || start;
      const worstDay = sortedDays[sortedDays.length - 1]?.[0] || start;

      return {
        week_start: start,
        week_end: end,
        total_co2: totalCO2,
        average_daily: averageDaily,
        reduction_percentage: reduction,
        best_day: bestDay,
        worst_day: worstDay,
        category_breakdown: categoryBreakdown,
      };
    },
    [activities]
  );

  const getMonthlyStats = useCallback(() => {
    const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const monthActivities = activities.filter(
      (a) => a.date >= start && a.date <= end
    );

    const totalCO2 = monthActivities.reduce((sum, a) => sum + a.co2_emission, 0);
    const daysWithActivities = new Set(monthActivities.map((a) => a.date)).size;
    const averageDaily = daysWithActivities > 0 ? totalCO2 / daysWithActivities : 0;

    const categoryBreakdown: Record<ActivityCategory, number> = {
      transportation: 0,
      electricity: 0,
      food: 0,
      shopping: 0,
      waste: 0,
    };
    monthActivities.forEach((a) => {
      categoryBreakdown[a.category] += a.co2_emission;
    });

    return {
      total_co2: totalCO2,
      average_daily: averageDaily,
      days_logged: daysWithActivities,
      category_breakdown: categoryBreakdown,
    };
  }, [activities]);

  return {
    activities,
    loading,
    fetchActivities,
    logActivity,
    deleteActivity,
    getDailyScore,
    getWeeklyStats,
    getMonthlyStats,
  };
}

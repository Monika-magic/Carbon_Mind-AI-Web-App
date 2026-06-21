export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  sustainability_level: number;
  lifetime_co2_saved: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  created_at: string;
  updated_at: string;
}

export type Profile = User;

export interface Activity {
  id: string;
  user_id: string;
  date: string;
  category: ActivityCategory;
  type: string;
  value: number;
  unit: string;
  co2_emission: number;
  notes?: string;
  created_at: string;
}

export type ActivityCategory = 'transportation' | 'electricity' | 'food' | 'shopping' | 'waste';

export interface ActivityType {
  id: string;
  category: ActivityCategory;
  name: string;
  icon: string;
  unit: string;
  co2_per_unit: number;
  description: string;
}

export interface DailyScore {
  date: string;
  total_co2: number;
  breakdown: Record<ActivityCategory, number>;
  score: number;
}

export interface WeeklyStats {
  week_start: string;
  week_end: string;
  total_co2: number;
  average_daily: number;
  reduction_percentage: number;
  best_day: string;
  worst_day: string;
  category_breakdown: Record<ActivityCategory, number>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned_at?: string;
  earned: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xp_reward: number;
  progress: number;
  target: number;
  completed: boolean;
}

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'analysis' | 'goal' | 'alert';
  title: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: ActivityCategory;
  created_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  category: ActivityCategory;
  start_date: string;
  end_date: string;
  completed: boolean;
  xp_reward: number;
}

export interface CarbonInsights {
  highest_emission_category: ActivityCategory;
  highest_emission_value: number;
  improvement_opportunities: AIInsight[];
  weekly_summary: string;
  monthly_report?: string;
  trend_direction: 'up' | 'down' | 'stable';
}

export interface ChartData {
  date: string;
  value: number;
  category?: string;
}

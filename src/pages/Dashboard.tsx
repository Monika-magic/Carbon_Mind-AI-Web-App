import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek } from 'date-fns';
import {
  Leaf,
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CircularProgress, Button } from '../components/ui';
import { EmissionsChart, CategoryBreakdownChart, WeeklyComparisonChart } from '../components/charts';
import { useActivities } from '../hooks/useActivities';
import { useAppStore } from '../store';
import { CATEGORY_INFO } from '../utils/constants';
import { generateWeeklyGoal } from '../lib/gemini';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAppStore();
  const { activities, loading, fetchActivities, getDailyScore, getWeeklyStats, getMonthlyStats } = useActivities();
  const [weeklyGoal, setWeeklyGoal] = useState<{ title: string; description: string } | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  useEffect(() => {
    fetchActivities(format(subDays(new Date(), 30), 'yyyy-MM-dd'), today);
  }, [fetchActivities, today]);

  useEffect(() => {
    if (activities.length > 0) {
      const stats = getWeeklyStats(weekStart);
      const goal = generateWeeklyGoal(activities, stats);
      setWeeklyGoal(goal);
    }
  }, [activities, getWeeklyStats, weekStart]);

  const todayScore = getDailyScore(today);
  const weeklyStats = getWeeklyStats(weekStart);
  const monthlyStats = getMonthlyStats();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const score = getDailyScore(date);
    return {
      date,
      value: score.total_co2,
    };
  });

  const categoryData = weeklyStats
    ? Object.entries(weeklyStats.category_breakdown)
        .map(([category, value]) => ({
          name: CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].name,
          value,
          color: CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].bgColor.replace('bg-', ''),
        }))
        .filter((item) => item.value > 0)
    : [];

  const weeklyComparisonData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
    const currentWeekDate = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const prevWeekDate = format(subDays(new Date(currentWeekDate), 7), 'yyyy-MM-dd');

    const current = activities
      .filter((a) => a.date === currentWeekDate)
      .reduce((sum, a) => sum + a.co2_emission, 0);

    const previous = activities
      .filter((a) => a.date === prevWeekDate)
      .reduce((sum, a) => sum + a.co2_emission, 0);

    return {
      name: day,
      current: parseFloat(current.toFixed(2)),
      previous: parseFloat(previous.toFixed(2)),
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Eco Warrior'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's your sustainability overview for today
          </p>
        </div>
        <Link to="/activities">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Log Activity
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg" className="h-full">
            <CardHeader
              title="Today's Score"
              icon={<Leaf className="w-5 h-5" />}
            />
            <div className="flex items-center justify-center py-4">
              <CircularProgress
                value={todayScore.score}
                size={120}
                strokeWidth={12}
                variant={todayScore.score >= 60 ? 'success' : todayScore.score >= 40 ? 'warning' : 'error'}
                label="score"
              />
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {todayScore.total_co2.toFixed(2)} kg CO2 today
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card padding="lg" className="h-full">
            <CardHeader
              title="Current Streak"
              icon={<Flame className="w-5 h-5" />}
            />
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <span className="text-5xl font-bold text-orange-500">
                  {user?.current_streak || 0}
                </span>
                <p className="text-gray-500 dark:text-gray-400 mt-1">days</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Best: {user?.longest_streak || 0} days
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="lg" className="h-full">
            <CardHeader
              title="Sustainability Level"
              icon={<Award className="w-5 h-5" />}
            />
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <span className="text-5xl font-bold text-primary-500">
                  {user?.sustainability_level || 1}
                </span>
                <p className="text-gray-500 dark:text-gray-400 mt-1">level</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              {user?.total_xp || 0} XP earned
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card padding="lg" className="h-full">
            <CardHeader
              title="CO2 Saved"
              icon={<Leaf className="w-5 h-5" />}
            />
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <span className="text-5xl font-bold text-green-500">
                  {((user?.lifetime_co2_saved || 0)).toFixed(1)}
                </span>
                <p className="text-gray-500 dark:text-gray-400 mt-1">kg saved</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Lifetime impact
            </p>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <CardHeader
            title="Weekly Emissions"
            subtitle="Last 7 days trend"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <EmissionsChart data={last7Days} height={280} />
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Category Breakdown"
            subtitle="This week"
            icon={<Target className="w-5 h-5" />}
          />
          <CategoryBreakdownChart data={categoryData} height={200} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Weekly Comparison"
            subtitle="This week vs last week"
            icon={<TrendingDown className="w-5 h-5" />}
          />
          <WeeklyComparisonChart data={weeklyComparisonData} height={250} />
        </Card>

        <Card
          variant="gradient"
          padding="lg"
          className="flex flex-col"
        >
          <CardHeader
            title={weeklyGoal?.title || 'Weekly Goal'}
            subtitle="AI-suggested goal for you"
            icon={<Target className="w-5 h-5" />}
          />
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {weeklyGoal?.description || 'Start logging activities to receive personalized goals!'}
            </p>
            {weeklyStats && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Reduction Progress
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      weeklyStats.reduction_percentage >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {weeklyStats.reduction_percentage >= 0 ? '-' : '+'}
                    {Math.abs(weeklyStats.reduction_percentage).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {weeklyStats.total_co2.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      kg CO2 this week
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {weeklyStats.average_daily.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      kg CO2/day avg
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card variant="elevated" padding="lg">
        <CardHeader
          title="Monthly Statistics"
          subtitle={`${format(new Date(), 'MMMM yyyy')}`}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl font-bold text-primary-500">
              {monthlyStats.total_co2.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              kg CO2 total
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl font-bold text-blue-500">
              {monthlyStats.average_daily.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              kg CO2/day avg
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl font-bold text-orange-500">
              {monthlyStats.days_logged}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              days logged
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl font-bold text-green-500">
              {activities.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              activities logged
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

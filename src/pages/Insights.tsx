import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  Award,
} from 'lucide-react';
import { Card, CardHeader, Progress, Button } from '../components/ui';
import { CategoryBreakdownChart, EmissionsChart } from '../components/charts';
import { useActivities } from '../hooks/useActivities';
import { useAppStore } from '../store';
import { CATEGORY_INFO } from '../utils/constants';
import type { ActivityCategory } from '../types';

type TimeRange = 'week' | 'month' | 'year';

export default function Insights() {
  const { activities, fetchActivities, getWeeklyStats, getMonthlyStats, getDailyScore } = useActivities();
  const { user } = useAppStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
  const monthlyStats = getMonthlyStats();
  const weeklyStats = getWeeklyStats(weekStart);

  const stats = timeRange === 'week' ? weeklyStats : weeklyStats;
  const dateRange =
    timeRange === 'week'
      ? `${format(new Date(weekStart), 'MMM d')} - ${format(new Date(weekEnd), 'MMM d, yyyy')}`
      : timeRange === 'month'
      ? format(new Date(), 'MMMM yyyy')
      : format(new Date(), 'yyyy');

  const categoryBreakdown = stats?.category_breakdown || {
    transportation: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
  };

  const highestCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[0])[0] as [ActivityCategory, number];

  const getTrendIcon = (percentage: number) => {
    if (percentage > 5) return <TrendingDown className="w-5 h-5 text-green-500" />;
    if (percentage < -5) return <TrendingUp className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getTrendText = (percentage: number) => {
    if (percentage > 5) return 'Improving';
    if (percentage < -5) return 'Needs Attention';
    return 'Stable';
  };

  const improvementOpportunities = Object.entries(categoryBreakdown)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, value]) => {
      const catInfo = CATEGORY_INFO[category as ActivityCategory];
      const percentage = stats ? (value / stats.total_co2) * 100 : 0;
      return {
        category: category as ActivityCategory,
        name: catInfo.name,
        value,
        percentage,
        suggestion: getSuggestion(category as ActivityCategory),
      };
    });

  function getSuggestion(category: ActivityCategory): string {
    const suggestions: Record<ActivityCategory, string> = {
      transportation: 'Consider carpooling, using public transport, or biking for short trips.',
      electricity: 'Switch to LED bulbs, unplug devices when not in use, or consider renewable energy.',
      food: 'Try adding more plant-based meals and reducing food waste.',
      shopping: 'Buy secondhand, choose durable products, or repair instead of replacing.',
      waste: 'Increase recycling and composting, reduce single-use items.',
    };
    return suggestions[category];
  }

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
    const score = getDailyScore(date);
    return {
      date,
      value: score.total_co2,
    };
  });

  const chartData = last14Days.map((d) => ({
    date: d.date,
    value: d.value,
  }));

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, value]) => ({
      name: CATEGORY_INFO[category as ActivityCategory].name,
      value,
      color: CATEGORY_INFO[category as ActivityCategory].bgColor.replace('bg-', ''),
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Carbon Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Understand your emissions patterns and find improvement opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Emissions</span>
              {stats && getTrendIcon(stats.reduction_percentage)}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(stats?.total_co2 || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">kg CO2 {dateRange}</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Daily Average</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">
              {(stats?.average_daily || 0).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">kg CO2/day</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Reduction</span>
              {stats && getTrendIcon(stats.reduction_percentage)}
            </div>
            <p className="text-3xl font-bold text-green-500">
              {stats?.reduction_percentage && stats.reduction_percentage > 0
                ? '-' + Math.abs(stats.reduction_percentage).toFixed(0)
                : '+' + Math.abs(stats?.reduction_percentage || 0).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {getTrendText(stats?.reduction_percentage || 0)}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Top Category</span>
            </div>
            <p className="text-3xl font-bold text-orange-500">
              {CATEGORY_INFO[highestCategory?.[0] || 'transportation'].name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {(highestCategory?.[1] || 0).toFixed(1)} kg CO2
            </p>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <CardHeader
            title="Emissions Trend"
            subtitle="Last 14 days"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <EmissionsChart data={chartData} height={280} />
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Category Distribution"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <CategoryBreakdownChart data={categoryData} height={200} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Improvement Opportunities"
            subtitle="Focus areas for reducing emissions"
            icon={<Lightbulb className="w-5 h-5" />}
          />
          <div className="space-y-4 mt-4">
            {improvementOpportunities.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                Log more activities to see improvement opportunities
              </p>
            ) : (
              improvementOpportunities.map((item, index) => {
                const catInfo = CATEGORY_INFO[item.category];
                return (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${catInfo.bgColor}`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value.toFixed(1)} kg
                      </span>
                    </div>
                    <Progress
                      value={item.value}
                      max={stats?.total_co2 || 1}
                      variant="default"
                      size="sm"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {item.suggestion}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Weekly Summary"
            icon={<Calendar className="w-5 h-5" />}
          />
          {weeklyStats ? (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Best Day</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {format(new Date(weeklyStats.best_day), 'EEEE')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Worst Day</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {format(new Date(weeklyStats.worst_day), 'EEEE')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Weekly Goal Progress
                  </span>
                  <span className="text-sm text-primary-500">
                    {weeklyStats.reduction_percentage > 0 ? 'On track!' : 'Keep trying!'}
                  </span>
                </div>
                <Progress
                  value={Math.max(0, weeklyStats.reduction_percentage)}
                  max={20}
                  variant="gradient"
                  label="Goal: -20% reduction"
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Activity Breakdown
                </h4>
                {Object.entries(weeklyStats.category_breakdown).map(([category, value]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {CATEGORY_INFO[category as ActivityCategory].name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {value.toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No data available for this period
            </p>
          )}
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <CardHeader
          title="Environmental Impact Comparison"
          icon={<Award className="w-5 h-5" />}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl mb-2">🌳</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round((user?.lifetime_co2_saved || 0) / 21)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Trees planted equivalent</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl mb-2">🚗</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round((user?.lifetime_co2_saved || 0) / 0.21)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Km not driven</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl mb-2">💡</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round((user?.lifetime_co2_saved || 0) / 0.5)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">kWh saved</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <p className="text-3xl mb-2">🥩</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round((user?.lifetime_co2_saved || 0) / 27)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Beef meals avoided</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

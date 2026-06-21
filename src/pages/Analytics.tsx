import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, Button, Select } from '../components/ui';
import { EmissionsChart, CategoryBreakdownChart, WeeklyComparisonChart } from '../components/charts';
import { useActivities } from '../hooks/useActivities';
import { CATEGORY_INFO } from '../utils/constants';
import type { ActivityCategory, ChartData } from '../types';

type TimeRange = '7d' | '30d' | '90d' | '12m';
type ChartType = 'line' | 'bar';

export default function Analytics() {
  const { activities, fetchActivities, getDailyScore } = useActivities();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      case '12m':
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const dateRange = getDateRange();
  const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

  const dailyData: ChartData[] = days.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const score = getDailyScore(dateStr);

    if (selectedCategory === 'all') {
      return {
        date: dateStr,
        value: score.total_co2,
      };
    }

    return {
      date: dateStr,
      value: score.breakdown[selectedCategory] || 0,
      category: selectedCategory,
    };
  });

  const totalEmissions = dailyData.reduce((sum, d) => sum + d.value, 0);
  const averageDaily = totalEmissions / (dailyData.length || 1);
  const peakDay = dailyData.reduce((max, d) => (d.value > max.value ? d : max), dailyData[0]);
  const lowestDay = dailyData.reduce((min, d) => (d.value < min.value ? d : min), dailyData[0]);

  const categoryBreakdown = activities
    .filter((a) => {
      const date = new Date(a.date);
      return date >= dateRange.start && date <= dateRange.end;
    })
    .reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + a.co2_emission;
        return acc;
      },
      {} as Record<ActivityCategory, number>
    );

  const categoryChartData = Object.entries(categoryBreakdown).map(([category, value]) => ({
    name: CATEGORY_INFO[category as ActivityCategory].name,
    value,
    color: CATEGORY_INFO[category as ActivityCategory].bgColor.replace('bg-', ''),
  }));

  const weeklyData = Array.from({ length: 12 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 11 - i));
    const weekEnd = endOfWeek(weekStart);
    const weekActivities = activities.filter((a) => {
      const date = new Date(a.date);
      return date >= weekStart && date <= weekEnd;
    });

    const total = weekActivities.reduce((sum, a) => sum + a.co2_emission, 0);

    return {
      name: format(weekStart, 'MMM d'),
      current: parseFloat(total.toFixed(2)),
      previous: 0,
    };
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdayData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
    const total = activities
      .filter((a) => {
        const d = new Date(a.date);
        return format(d, 'EEE') === day;
      })
      .reduce((sum, a) => sum + a.co2_emission, 0);
    const count = activities.filter((a) => {
      const d = new Date(a.date);
      return format(d, 'EEE') === day;
    }).length;

    return {
      name: day,
      value: count > 0 ? parseFloat((total / count).toFixed(2)) : 0,
    };
  });

  const exportData = () => {
    const csvContent = [
      'Date,Category,Type,Value,Unit,CO2 Emission (kg)',
      ...activities.map((a) =>
        `${a.date},${a.category},${a.type},${a.value},${a.unit},${a.co2_emission.toFixed(2)}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbonmind-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detailed insights into your carbon footprint
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '12m', label: 'Last 12 months' },
            ]}
          />
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ActivityCategory | 'all')}
            options={[
              { value: 'all', label: 'All Categories' },
              ...Object.entries(CATEGORY_INFO).map(([key, value]) => ({
                value: key,
                label: value.name,
              })),
            ]}
          />
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={exportData}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Emissions</span>
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalEmissions.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">kg CO2</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Daily Average</span>
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {averageDaily.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">kg CO2/day</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Peak Day</span>
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {peakDay?.value.toFixed(1) || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {peakDay ? format(new Date(peakDay.date), 'MMM d, yyyy') : 'N/A'}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="lg" className="h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Best Day</span>
              <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <ArrowDownRight className="w-4 h-4 text-primary-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {lowestDay?.value.toFixed(1) || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {lowestDay ? format(new Date(lowestDay.date), 'MMM d, yyyy') : 'N/A'}
            </p>
          </Card>
        </motion.div>
      </div>

      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <CardHeader
            title="Emissions Over Time"
            subtitle={`${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'bar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar
            </Button>
          </div>
        </div>
        <EmissionsChart
          data={dailyData}
          type={chartType === 'line' ? 'area' : 'bar'}
          height={320}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Category Breakdown"
            subtitle="Distribution by category"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <CategoryBreakdownChart data={categoryChartData} height={250} />
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Average by Day of Week"
            subtitle="Patterns in your weekly emissions"
            icon={<Calendar className="w-5 h-5" />}
          />
          <EmissionsChart data={weekdayData.map((d, i) => ({
            date: d.name,
            value: d.value,
          }))} type="bar" height={250} />
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <CardHeader
          title="Category Details"
          subtitle="Breakdown by activity category"
          icon={<Filter className="w-5 h-5" />}
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Emissions
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  % of Total
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Activities
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CATEGORY_INFO).map(([category, info]) => {
                const total = categoryBreakdown[category as ActivityCategory] || 0;
                const percentage = totalEmissions > 0 ? (total / totalEmissions) * 100 : 0;
                const count = activities.filter((a) => a.category === category).length;

                return (
                  <tr
                    key={category}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${info.bgColor}`}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {info.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {total.toFixed(2)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">kg</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          <div
                            className={`h-full ${info.bgColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      {count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

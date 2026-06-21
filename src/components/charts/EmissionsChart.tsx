import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#6b7280'];

interface ChartData {
  date: string;
  value: number;
  category?: string;
}

interface EmissionsChartProps {
  data: ChartData[];
  type?: 'area' | 'bar';
  height?: number;
  showGrid?: boolean;
  gradient?: boolean;
}

export function EmissionsChart({
  data,
  type = 'area',
  height = 300,
  showGrid = true,
  gradient = true,
}: EmissionsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-semibold">{entry.value?.toFixed(2)} kg</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.1}
            />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={{ stroke: '#374151', opacity: 0.2 }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={{ stroke: '#374151', opacity: 0.2 }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            name="CO2 (kg)"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {gradient && (
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            opacity={0.1}
          />
        )}
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={{ stroke: '#374151', opacity: 0.2 }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={{ stroke: '#374151', opacity: 0.2 }}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          name="CO2 (kg)"
          stroke="#22c55e"
          strokeWidth={2}
          fill={gradient ? 'url(#colorValue)' : '#22c55e'}
          fillOpacity={gradient ? 1 : 0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface CategoryBreakdownChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  showLegend?: boolean;
}

export function CategoryBreakdownChart({
  data,
  height = 250,
  showLegend = true,
}: CategoryBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLegend && total > 0 ? <CustomLabel /> : false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface WeeklyComparisonChartProps {
  data: { name: string; current: number; previous: number }[];
  height?: number;
}

export function WeeklyComparisonChart({ data, height = 300 }: WeeklyComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={0}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#374151"
          opacity={0.1}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={{ stroke: '#374151', opacity: 0.2 }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={{ stroke: '#374151', opacity: 0.2 }}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Legend
          formatter={(value) => (
            <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
          )}
        />
        <Bar
          dataKey="current"
          name="This Week"
          fill="#22c55e"
          radius={[2, 2, 0, 0]}
          opacity={0.9}
        />
        <Bar
          dataKey="previous"
          name="Last Week"
          fill="#3b82f6"
          radius={[2, 2, 0, 0]}
          opacity={0.6}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

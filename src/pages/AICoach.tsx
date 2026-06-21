import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek } from 'date-fns';
import {
  Leaf,
  Lightbulb,
  Target,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, Button, Input } from '../components/ui';
import { useActivities } from '../hooks/useActivities';
import { useAppStore } from '../store';
import { generateAIInsights, generateWeeklyGoal } from '../lib/gemini';
import type { AIInsight } from '../types';

const difficultyColors = {
  easy: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  medium: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  hard: 'text-red-500 bg-red-100 dark:bg-red-900/30',
};

export default function AICoach() {
  const { activities, fetchActivities, getWeeklyStats } = useActivities();
  const { user } = useAppStore();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [weeklyGoal, setWeeklyGoal] = useState<{ title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (activities.length >= 0) {
      loadInsights();
    }
  }, [activities]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const stats = getWeeklyStats(weekStart);
      const result = await generateAIInsights(activities, stats, user?.name || 'User');
      setInsights(result.recommendations);
      if (result.analysis) {
        setAnalysis(result.analysis);
      }
      const goal = generateWeeklyGoal(activities, stats);
      setWeeklyGoal(goal);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Simulate AI response (in production, this would call Gemini API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: `Based on your recent activity data, I'd suggest focusing on ${
          insights[0]?.category || 'transportation'
        } to reduce your carbon footprint. Small changes can make a big impact!`,
        reduce: 'Start with easy wins: carpool once a week, reduce meat consumption by one meal, and use energy-efficient appliances. These can save up to 2kg CO2 daily!',
        travel: 'Consider combining trips, using public transport for commutes, or biking for short distances. Each car trip avoided saves ~0.21 kg CO2 per km.',
        food: 'Plant-based meals have the lowest carbon footprint. Try Meatless Monday - replacing one beef meal saves about 2kg of CO2!',
        energy: 'Switch to LED bulbs, unplug devices when not in use, and optimize your thermostat. These simple changes can reduce electricity emissions by 10-15%.',
      };

      const lowerInput = userMessage.toLowerCase();
      let response = responses.default;
      if (lowerInput.includes('reduce') || lowerInput.includes('help')) {
        response = responses.reduce;
      } else if (lowerInput.includes('travel') || lowerInput.includes('car') || lowerInput.includes('transport')) {
        response = responses.travel;
      } else if (lowerInput.includes('food') || lowerInput.includes('eat') || lowerInput.includes('meal')) {
        response = responses.food;
      } else if (lowerInput.includes('energy') || lowerInput.includes('electricity') || lowerInput.includes('power')) {
        response = responses.energy;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  const insightTypeIcons = {
    recommendation: <Lightbulb className="w-5 h-5" />,
    analysis: <TrendingUp className="w-5 h-5" />,
    goal: <Target className="w-5 h-5" />,
    alert: <AlertCircle className="w-5 h-5" />,
  };

  const insightTypeColors = {
    recommendation: 'text-primary-500',
    analysis: 'text-blue-500',
    goal: 'text-purple-500',
    alert: 'text-orange-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Sustainability Coach
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Get personalized recommendations to reduce your carbon footprint
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          onClick={loadInsights}
          disabled={loading}
        >
          Refresh Insights
        </Button>
      </div>

      {analysis && (
        <Card variant="gradient" padding="lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50">
              <Sparkles className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Weekly Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{analysis}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Personalized Recommendations"
              subtitle="AI-generated tips based on your habits"
              icon={<Lightbulb className="w-5 h-5" />}
            />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Log more activities to receive personalized recommendations
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      variant="bordered"
                      padding="md"
                      hover
                      className="cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-xl ${
                            insightTypeColors[insight.type]
                          } bg-gray-100 dark:bg-gray-700`}
                        >
                          {insightTypeIcons[insight.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {insight.title}
                            </h4>
                            {insight.difficulty && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  difficultyColors[insight.difficulty]
                                }`}
                              >
                                {insight.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {insight.description}
                          </p>
                          {insight.impact && insight.impact > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-500">
                                Save ~{insight.impact.toFixed(1)} kg CO2/day
                              </span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          {weeklyGoal && (
            <Card variant="elevated" padding="lg">
              <CardHeader
                title="Suggested Weekly Goal"
                icon={<Target className="w-5 h-5" />}
                action={
                  <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    AI Generated
                  </span>
                }
              />
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {weeklyGoal.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {weeklyGoal.description}
                </p>
                <Button variant="primary" size="sm" className="mt-4">
                  Set as My Goal
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Card variant="elevated" padding="lg" className="flex flex-col">
          <CardHeader
            title="Chat with Your Coach"
            subtitle="Ask questions about sustainability"
            icon={<MessageCircle className="w-5 h-5" />}
          />

          <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto mt-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Hi! I'm your AI Coach
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Ask me anything about reducing your carbon footprint or making sustainable choices.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['How can I reduce emissions?', 'Tips for eco-travel', 'Sustainable food choices'].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setChatInput(suggestion);
                        }}
                        className="px-3 py-1.5 text-sm rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your sustainability question..."
                className="flex-1"
              />
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card variant="bordered" padding="lg">
        <CardHeader
          title="Sustainability Tips"
          subtitle="General eco-friendly practices"
          icon={<Leaf className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[
            {
              title: 'Reduce, Reuse, Recycle',
              description: 'The three Rs remain the most effective way to minimize your environmental impact.',
              icon: '♻️',
            },
            {
              title: 'Choose Sustainable Transport',
              description: 'Walking, cycling, or using public transport can significantly reduce emissions.',
              icon: '🚲',
            },
            {
              title: 'Eat More Plants',
              description: 'Plant-based meals require less water, land, and energy to produce.',
              icon: '🥗',
            },
            {
              title: 'Conserve Energy',
              description: 'Turn off lights, use LED bulbs, and unplug devices when not in use.',
              icon: '💡',
            },
            {
              title: 'Support Local',
              description: 'Buying local reduces transportation emissions and supports your community.',
              icon: '🏪',
            },
            {
              title: 'Reduce Water Waste',
              description: 'Fix leaks, take shorter showers, and use water-efficient appliances.',
              icon: '💧',
            },
          ].map((tip, index) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {tip.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tip.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

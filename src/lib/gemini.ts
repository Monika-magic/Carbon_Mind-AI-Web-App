import type { Activity, ActivityCategory, AIInsight, WeeklyStats } from '../types';

interface GeminiResponse {
  recommendations: AIInsight[];
  analysis?: string;
}

export async function generateAIInsights(
  activities: Activity[],
  weeklyStats: WeeklyStats | null,
  userName: string
): Promise<GeminiResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return {
      recommendations: getFallbackInsights(activities, weeklyStats),
      analysis: getFallbackAnalysis(weeklyStats, userName),
    };
  }

  const prompt = buildPrompt(activities, weeklyStats, userName);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseAIResponse(text, activities, weeklyStats);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      recommendations: getFallbackInsights(activities, weeklyStats),
      analysis: getFallbackAnalysis(weeklyStats, userName),
    };
  }
}

function buildPrompt(activities: Activity[], weeklyStats: WeeklyStats | null, userName: string): string {
  const recentActivities = activities.slice(0, 20);

  let categoryBreakdown = 'No data available';
  if (weeklyStats?.category_breakdown) {
    categoryBreakdown = Object.entries(weeklyStats.category_breakdown)
      .map(([category, value]) => `${category}: ${value.toFixed(2)} kg CO2`)
      .join('\n');
  }

  return `You are CarbonMind AI, a sustainability coach. Analyze the user's carbon footprint data and provide personalized recommendations.

User: ${userName}

Recent Activities (last 20):
${recentActivities.map(a => `- ${a.category}: ${a.type} (${a.value} ${a.unit}) = ${a.co2_emission.toFixed(2)} kg CO2`).join('\n')}

Weekly Stats:
- Total CO2: ${weeklyStats?.total_co2?.toFixed(2) || 0} kg
- Daily Average: ${weeklyStats?.average_daily?.toFixed(2) || 0} kg
- Reduction vs last week: ${weeklyStats?.reduction_percentage?.toFixed(1) || 0}%
- Best day: ${weeklyStats?.best_day || 'N/A'}
- Worst day: ${weeklyStats?.worst_day || 'N/A'}

Category Breakdown:
${categoryBreakdown}

Provide 3-5 specific, actionable recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "type": "recommendation",
      "title": "Short title",
      "description": "Detailed explanation of what to do and why it helps",
      "impact": 0.5,
      "difficulty": "easy",
      "category": "transportation"
    }
  ],
  "analysis": "A brief personalized analysis of their carbon footprint patterns"
}

Rules:
- Be specific and actionable
- Focus on easy wins with clear impact
- Reference their actual data
- Calculate potential CO2 savings realistically
- Categories: transportation, electricity, food, shopping, waste
- Difficulties: easy, medium, hard
- Impact should be estimated kg CO2/day saved`;
}

function parseAIResponse(text: string, activities: Activity[], weeklyStats: WeeklyStats | null): GeminiResponse {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        recommendations: parsed.recommendations?.map((r: Partial<AIInsight>, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          type: r.type || 'recommendation',
          title: r.title || 'Recommendation',
          description: r.description || '',
          impact: r.impact || 0,
          difficulty: r.difficulty || 'easy',
          category: r.category as ActivityCategory | undefined,
          created_at: new Date().toISOString(),
        })) || getFallbackInsights(activities, weeklyStats),
        analysis: parsed.analysis,
      };
    }
  } catch (e) {
    console.error('Error parsing AI response:', e);
  }

  return {
    recommendations: getFallbackInsights(activities, weeklyStats),
    analysis: text,
  };
}

function getFallbackInsights(activities: Activity[], weeklyStats: WeeklyStats | null): AIInsight[] {
  const insights: AIInsight[] = [];

  // Check transportation
  const transportActivities = activities.filter(a => a.category === 'transportation');
  const hasHighCarUsage = transportActivities.some(a =>
    a.type.includes('car_gasoline') || a.type.includes('car_diesel')
  );
  if (hasHighCarUsage) {
    insights.push({
      id: `fallback-${Date.now()}-1`,
      type: 'recommendation',
      title: 'Try Alternative Transportation',
      description: 'Consider walking, cycling, or using public transit for short trips. Even one car-free trip per week can save 0.5 kg CO2.',
      impact: 0.5,
      difficulty: 'easy',
      category: 'transportation',
      created_at: new Date().toISOString(),
    });
  }

  // Check food
  const foodActivities = activities.filter(a => a.category === 'food');
  const hasHighMeat = foodActivities.some(a =>
    a.type === 'beef' || a.type === 'pork'
  );
  if (hasHighMeat) {
    insights.push({
      id: `fallback-${Date.now()}-2`,
      type: 'recommendation',
      title: 'Add More Plant-Based Meals',
      description: 'Replacing one beef meal with a plant-based option saves approximately 2 kg of CO2. Try Meatless Monday!',
      impact: 2.0,
      difficulty: 'medium',
      category: 'food',
      created_at: new Date().toISOString(),
    });
  }

  // Check electricity
  const electricActivities = activities.filter(a => a.category === 'electricity');
  const hasHighElectricity = electricActivities.some(a => a.co2_emission > 5);
  if (hasHighElectricity) {
    insights.push({
      id: `fallback-${Date.now()}-3`,
      type: 'recommendation',
      title: 'Optimize Energy Usage',
      description: 'Switch to LED bulbs, unplug devices when not in use, and consider a smart thermostat. Small changes add up to big savings!',
      impact: 1.0,
      difficulty: 'easy',
      category: 'electricity',
      created_at: new Date().toISOString(),
    });
  }

  // General insights
  if (insights.length === 0) {
    insights.push({
      id: `fallback-${Date.now()}-0`,
      type: 'recommendation',
      title: 'Start Tracking Your Activities',
      description: 'Log your daily activities to receive personalized sustainability recommendations. Every action counts!',
      impact: 0,
      difficulty: 'easy',
      created_at: new Date().toISOString(),
    });
  }

  return insights;
}

function getFallbackAnalysis(weeklyStats: WeeklyStats | null, userName: string): string {
  if (!weeklyStats) {
    return `Welcome ${userName}! Start logging your daily activities to receive personalized insights about your carbon footprint.`;
  }

  const reduction = weeklyStats.reduction_percentage.toFixed(1);
  const trend = weeklyStats.reduction_percentage > 0
    ? `Great news! You've reduced your emissions by ${reduction}% compared to last week.`
    : weeklyStats.reduction_percentage < 0
    ? `Your emissions increased by ${Math.abs(parseFloat(reduction))}% this week. Let's work on reversing that trend!`
    : 'Your emissions stayed stable this week. Small improvements can make a big difference!';

  const highestCategory = Object.entries(weeklyStats.category_breakdown)
    .sort((a, b) => b[1] - a[0])[0];

  return `${trend} Your highest emission category is ${highestCategory[0]} at ${highestCategory[1].toFixed(1)} kg CO2. Focus on this area for the biggest impact.`;
}

export function generateWeeklyGoal(
  activities: Activity[],
  weeklyStats: WeeklyStats | null
): { title: string; description: string; target: number; category: ActivityCategory } {
  if (!weeklyStats) {
    return {
      title: 'Start Your Journey',
      description: 'Log at least 5 activities this week to begin tracking your carbon footprint.',
      target: 5,
      category: 'transportation',
    };
  }

  const highestCategory = Object.entries(weeklyStats.category_breakdown)
    .sort((a, b) => b[1] - a[0])[0] as [ActivityCategory, number];

  const goals: Record<ActivityCategory, { title: string; description: string; target: number }> = {
    transportation: {
      title: 'Eco Commute Challenge',
      description: 'Use public transport, bike, or walk for at least 3 trips this week.',
      target: 3,
    },
    electricity: {
      title: 'Energy Saver',
      description: 'Reduce electricity usage by 10% this week.',
      target: 10,
    },
    food: {
      title: 'Plant-Based Week',
      description: 'Have at least 5 plant-based meals this week.',
      target: 5,
    },
    shopping: {
      title: 'Mindful Shopping',
      description: 'Make at least 2 secondhand or sustainable purchases.',
      target: 2,
    },
    waste: {
      title: 'Zero Waste Hero',
      description: 'Recycle or compost at least 80% of your waste this week.',
      target: 80,
    },
  };

  const goal = goals[highestCategory[0]];
  return {
    title: goal.title,
    description: goal.description,
    target: goal.target,
    category: highestCategory[0],
  };
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Trophy,
  Flame,
  Star,
  Medal,
  Target,
  Crown,
  Award,
  Lock,
  Check,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, Progress, Button } from '../components/ui';
import { useActivities } from '../hooks/useActivities';
import { useAppStore, useBadgeStore } from '../store';
import { BADGES, SUSTAINABILITY_LEVELS, calculateLevel, getXPForNextLevel } from '../utils/constants';
import { supabase } from '../lib/supabase';

const iconComponents: Record<string, React.ReactNode> = {
  Footprints: <Zap className="w-6 h-6" />,
  Calendar: <Medal className="w-6 h-6" />,
  Award: <Crown className="w-6 h-6" />,
  Bike: <Trophy className="w-6 h-6" />,
  Leaf: <Star className="w-6 h-6" />,
  Recycle: <Target className="w-6 h-6" />,
  Globe: <Award className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
};

export default function Achievements() {
  const { activities, fetchActivities, getWeeklyStats } = useActivities();
  const { user } = useAppStore();
  const { earnedBadges, setEarnedBadges, hasBadge, earnBadge } = useBadgeStore();
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements' | 'stats'>('badges');

  useEffect(() => {
    fetchActivities();
    fetchUserBadges();
  }, [fetchActivities]);

  const fetchUserBadges = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);
    if (data) {
      setEarnedBadges(
        data.map((b: any) => ({
          id: b.badge_id,
          name: BADGES.find((ba) => ba.id === b.badge_id)?.name || b.badge_id,
          description: BADGES.find((ba) => ba.id === b.badge_id)?.description || '',
          icon: BADGES.find((ba) => ba.id === b.badge_id)?.icon || 'Award',
          requirement: BADGES.find((ba) => ba.id === b.badge_id)?.requirement || '',
          earned: true,
          earned_at: b.earned_at,
        }))
      );
    }
  };

  const currentLevel = user?.sustainability_level || 1;
  const currentXP = user?.total_xp || 0;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const prevLevelXP = currentLevel > 1 ? SUSTAINABILITY_LEVELS[currentLevel - 1] : 0;
  const xpProgress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  const achievementProgress = [
    {
      id: 'activities_100',
      name: 'Activity Logger',
      description: 'Log 100 activities',
      target: 100,
      current: activities.length,
      xpReward: 500,
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'streak_30',
      name: 'Month Streak',
      description: 'Maintain a 30-day streak',
      target: 30,
      current: user?.current_streak || 0,
      xpReward: 500,
      icon: <Flame className="w-5 h-5" />,
    },
    {
      id: 'badges_earned',
      name: 'Badge Collector',
      description: 'Earn 5 badges',
      target: 5,
      current: earnedBadges.length,
      xpReward: 300,
      icon: <Medal className="w-5 h-5" />,
    },
    {
      id: 'co2_saved',
      name: 'Carbon Saver',
      description: 'Save 100kg CO2',
      target: 100,
      current: user?.lifetime_co2_saved || 0,
      xpReward: 1000,
      icon: <Star className="w-5 h-5" />,
    },
  ];

  const recentAchievements = earnedBadges
    .sort((a, b) => new Date(b.earned_at || 0).getTime() - new Date(a.earned_at || 0).getTime())
    .slice(0, 5);

  const allBadges = BADGES.map((badge) => ({
    ...badge,
    earned: hasBadge(badge.id),
    earnedAt: earnedBadges.find((b) => b.id === badge.id)?.earned_at,
  }));

  const stats = getWeeklyStats(format(new Date(), 'yyyy-MM-dd'));

  const tabs = [
    { id: 'badges', label: 'All Badges', icon: <Award className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievement Progress', icon: <Target className="w-5 h-5" /> },
    { id: 'stats', label: 'Statistics', icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Achievements
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track your progress and earn rewards
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="gradient" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Level</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                Level {currentLevel}
              </p>
              <div className="mt-2 w-32">
                <Progress value={xpProgress} max={100} size="sm" variant="gradient" />
              </div>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentXP.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {nextLevelXP - currentXP} XP to Level {currentLevel + 1}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {earnedBadges.length} / {BADGES.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {BADGES.length - earnedBadges.length} badges remaining
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant={badge.earned ? 'gradient' : 'bordered'}
                padding="lg"
                className={badge.earned ? '' : 'opacity-60'}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${
                      badge.earned
                        ? 'bg-gradient-to-br from-primary-400 to-accent-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {badge.earned ? (
                      <Check className="w-8 h-8" />
                    ) : (
                      <Lock className="w-8 h-8" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {badge.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {badge.requirement}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      +{badge.xp_reward} XP
                    </span>
                  </div>
                  {badge.earned && badge.earnedAt && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Earned {format(new Date(badge.earnedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Achievement Progress"
            subtitle="Track your journey to earning new achievements"
          />
          <div className="space-y-6 mt-6">
            {achievementProgress.map((achievement, index) => {
              const progress = Math.min(100, (achievement.current / achievement.target) * 100);
              const isComplete = achievement.current >= achievement.target;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          isComplete
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-500'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-400'
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          isComplete ? 'text-green-500' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {achievement.current.toLocaleString()} / {achievement.target.toLocaleString()}
                      </span>
                      {isComplete && (
                        <p className="text-xs text-green-500">Completed!</p>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={progress}
                    max={100}
                    variant={isComplete ? 'success' : 'default'}
                    size="md"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{achievement.xpReward} XP
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {progress.toFixed(0)}% complete
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Activity Statistics"
              icon={<Trophy className="w-5 h-5" />}
            />
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total Activities</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activities.length}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                <span className="text-xl font-bold text-orange-500">
                  {user?.current_streak || 0} days
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.longest_streak || 0} days
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Lifetime CO2 Logged</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {activities.reduce((sum, a) => sum + a.co2_emission, 0).toFixed(1)} kg
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400">Average Daily Emissions</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {(stats?.average_daily || 0).toFixed(2)} kg
                </span>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Recent Achievements"
              icon={<Award className="w-5 h-5" />}
            />
            {recentAchievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No achievements earned yet. Keep logging activities!
                </p>
              </div>
            ) : (
              <div className="space-y-4 mt-6">
                {recentAchievements.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white">
                      <Check className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Earned {badge.earned_at ? format(new Date(badge.earned_at), 'MMM d, yyyy') : 'Recently'}
                      </p>
                    </div>
                    <span className="text-sm text-primary-500 font-medium">
                      +{BADGES.find((b) => b.id === badge.id)?.xp_reward || 0} XP
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

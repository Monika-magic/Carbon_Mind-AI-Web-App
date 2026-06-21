import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Calendar,
  Leaf,
  Trophy,
  Target,
  Settings,
  Camera,
  Save,
  Edit3,
  Award,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, Button, Input, Progress, useToast, ToastContainer } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useActivities } from '../hooks/useActivities';
import { useBadgeStore } from '../store';
import { SUSTAINABILITY_LEVELS, BADGES } from '../utils/constants';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { profile, updateUser } = useAuth();
  const { activities, fetchActivities } = useActivities();
  const { earnedBadges } = useBadgeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
    }
  }, [profile]);

  const currentLevel = profile?.sustainability_level || 1;
  const currentXP = profile?.total_xp || 0;
  const prevLevelXP = currentLevel > 1 ? SUSTAINABILITY_LEVELS[currentLevel - 1] : 0;
  const nextLevelXP = SUSTAINABILITY_LEVELS[currentLevel] || currentXP;
  const xpProgress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  const handleSave = async () => {
    if (!profile || !name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      updateUser();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const profileStats = [
    {
      label: 'Activities Logged',
      value: activities.length,
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Current Streak',
      value: `${profile?.current_streak || 0} days`,
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Best Streak',
      value: `${profile?.longest_streak || 0} days`,
      icon: <Trophy className="w-5 h-5" />,
      color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Badges Earned',
      value: `${earnedBadges.length} / ${BADGES.length}`,
      icon: <Award className="w-5 h-5" />,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  const levelTitles: Record<number, string> = {
    1: 'Eco Newcomer',
    2: 'Green Starter',
    3: 'Carbon Conscous',
    4: 'Eco Explorer',
    5: 'Sustainability Seeker',
    6: 'Green Guardian',
    7: 'Eco Warrior',
    8: 'Planet Protector',
    9: 'Sustainability Star',
    10: 'Eco Champion',
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and view your progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Change avatar"
                >
                  <Camera className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || 'Eco Warrior'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Level {currentLevel} - {levelTitles[currentLevel] || 'Eco Master'}
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Level Progress
                  </span>
                  <span className="text-sm font-medium text-primary-500">
                    {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                  </span>
                </div>
                <Progress value={xpProgress} max={100} variant="gradient" size="md" />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {nextLevelXP - currentXP} XP to Level {currentLevel + 1}
                </p>
              </div>

              <div className="mt-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      leftIcon={<User className="w-5 h-5" />}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setName(profile?.name || '');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={saving}
                        className="flex-1"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    leftIcon={<Edit3 className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader title="Account Info" icon={<Settings className="w-5 h-5" />} />
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile?.created_at
                      ? format(new Date(profile.created_at), 'MMMM d, yyyy')
                      : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lifetime CO2 Saved</p>
                  <p className="text-sm font-medium text-green-500">
                    {profile?.lifetime_co2_saved?.toFixed(1) || 0} kg
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {profileStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card padding="md">
                  <div className={`inline-flex p-2 rounded-xl ${stat.color} mb-2`}>
                    {stat.icon}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Recent Badges"
              subtitle="Your latest achievements"
              icon={<Trophy className="w-5 h-5" />}
              action={
                earnedBadges.length > 0 && (
                  <span className="text-sm text-primary-500">
                    {earnedBadges.length} earned
                  </span>
                )
              }
            />
            {earnedBadges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No badges earned yet. Keep logging activities!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                {earnedBadges.slice(0, 10).map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white">
                        <Award className="w-6 h-6" />
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-900 dark:text-white truncate">
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {badge.earned_at
                          ? format(new Date(badge.earned_at), 'MMM d')
                          : 'Recently'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Environmental Impact"
              subtitle="Your contribution to the planet"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-4xl mb-2">🌳</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((profile?.lifetime_co2_saved || 0) / 21)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Trees planted equivalent
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-4xl mb-2">🚗</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((profile?.lifetime_co2_saved || 0) / 0.21)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Km not driven
                </p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-center">
                <p className="text-4xl mb-2">💡</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((profile?.lifetime_co2_saved || 0) / 0.5)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  kWh saved
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader
              title="Goals"
              subtitle="Your sustainability targets"
              icon={<Target className="w-5 h-5" />}
            />
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Reach Level 5
                  </span>
                  <span className={`text-sm ${currentLevel >= 5 ? 'text-green-500' : 'text-gray-400'}`}>
                    {currentLevel >= 5 ? 'Completed!' : `Level ${currentLevel}/5`}
                  </span>
                </div>
                <Progress
                  value={currentLevel}
                  max={5}
                  variant={currentLevel >= 5 ? 'success' : 'default'}
                />
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Log 30 Activities
                  </span>
                  <span className={`text-sm ${activities.length >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
                    {activities.length >= 30 ? 'Completed!' : `${activities.length}/30`}
                  </span>
                </div>
                <Progress
                  value={activities.length}
                  max={30}
                  variant={activities.length >= 30 ? 'success' : 'default'}
                />
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Save 100kg CO2
                  </span>
                  <span className={`text-sm ${(profile?.lifetime_co2_saved || 0) >= 100 ? 'text-green-500' : 'text-gray-400'}`}>
                    {(profile?.lifetime_co2_saved || 0) >= 100
                      ? 'Completed!'
                      : `${profile?.lifetime_co2_saved?.toFixed(0) || 0}/100 kg`}
                  </span>
                </div>
                <Progress
                  value={profile?.lifetime_co2_saved || 0}
                  max={100}
                  variant={(profile?.lifetime_co2_saved || 0) >= 100 ? 'success' : 'default'}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

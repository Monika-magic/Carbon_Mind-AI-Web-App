import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus,
  Calendar,
  Car,
  Zap,
  Apple,
  ShoppingBag,
  Trash,
  Trash2,
  ChevronDown,
  ChevronUp,
  Leaf,
} from 'lucide-react';
import { Card, CardHeader, Button, Select, Input, Modal, useToast, ToastContainer } from '../components/ui';
import { useActivities } from '../hooks/useActivities';
import { ACTIVITY_TYPES, CATEGORY_INFO, getCategoryTypes, getActivityType } from '../utils/constants';
import type { Activity, ActivityCategory } from '../types';

const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
  transportation: <Car className="w-5 h-5" />,
  electricity: <Zap className="w-5 h-5" />,
  food: <Apple className="w-5 h-5" />,
  shopping: <ShoppingBag className="w-5 h-5" />,
  waste: <Trash className="w-5 h-5" />,
};

export default function Activities() {
  const { activities, loading, fetchActivities, logActivity, deleteActivity, getDailyScore } = useActivities();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<ActivityCategory>>(new Set());
  const toast = useToast();

  const [newActivity, setNewActivity] = useState<{
    category: ActivityCategory;
    type: string;
    value: string;
    notes: string;
  }>({
    category: 'transportation',
    type: '',
    value: '',
    notes: '',
  });

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const todayActivities = activities.filter(a => a.date === selectedDate);
  const groupedActivities = todayActivities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<ActivityCategory, Activity[]>);

  const dailyScore = getDailyScore(selectedDate);

  const handleLogActivity = async () => {
    if (!newActivity.type || !newActivity.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    const value = parseFloat(newActivity.value);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    const activityType = getActivityType(newActivity.type);
    if (!activityType) {
      toast.error('Invalid activity type');
      return;
    }

    const result = await logActivity({
      category: newActivity.category,
      type: newActivity.type,
      value,
      date: selectedDate,
      notes: newActivity.notes || undefined,
    });

    if (result.success) {
      toast.success('Activity logged successfully!');
      setShowModal(false);
      setNewActivity({
        category: 'transportation',
        type: '',
        value: '',
        notes: '',
      });
    } else {
      toast.error('Failed to log activity');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const result = await deleteActivity(id);
    if (result.success) {
      toast.success('Activity deleted');
    } else {
      toast.error('Failed to delete activity');
    }
  };

  const toggleCategory = (category: ActivityCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryTypes = getCategoryTypes(newActivity.category);

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daily Activities
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your daily carbon footprint
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            leftIcon={<Calendar className="w-5 h-5" />}
          />
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowModal(true)}
          >
            Add Activity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Object.keys(groupedActivities).length === 0 ? (
            <Card variant="elevated" padding="lg" className="text-center py-12">
              <Leaf className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No activities logged yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start tracking your carbon footprint by adding your first activity
              </p>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-5 h-5" />}
                onClick={() => setShowModal(true)}
              >
                Add Your First Activity
              </Button>
            </Card>
          ) : (
            <AnimatePresence>
              {Object.entries(groupedActivities).map(([category, items]) => {
                const catInfo = CATEGORY_INFO[category as ActivityCategory];
                const isExpanded = expandedCategories.has(category as ActivityCategory);
                const categoryTotal = items.reduce((sum, a) => sum + a.co2_emission, 0);

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card variant="bordered" padding="none">
                      <button
                        onClick={() => toggleCategory(category as ActivityCategory)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${catInfo.bgColor}/10 ${
                            catInfo.color.replace('text-', 'text-')
                          }`}>
                            {categoryIcons[category as ActivityCategory]}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {catInfo.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {items.length} activities
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {categoryTotal.toFixed(2)} kg
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                              {items.map((activity) => {
                                const actType = getActivityType(activity.type);
                                return (
                                  <div
                                    key={activity.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 dark:text-white">
                                        {actType?.name || activity.type}
                                      </h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {activity.value} {activity.unit}
                                        {activity.notes && ` - ${activity.notes}`}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {activity.co2_emission.toFixed(2)} kg
                                      </span>
                                      <button
                                        onClick={() => handleDeleteActivity(activity.id)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        aria-label="Delete activity"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <div className="space-y-4">
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Daily Summary"
              subtitle={format(new Date(selectedDate), 'MMMM d, yyyy')}
            />
            <div className="space-y-4 mt-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary-500">
                  {dailyScore.score}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sustainability Score
                </p>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-2">
                {Object.entries(dailyScore.breakdown).map(([category, value]) => {
                  const catInfo = CATEGORY_INFO[category as ActivityCategory];
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${catInfo.bgColor}`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {catInfo.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {value.toFixed(2)} kg
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-700" />

              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dailyScore.total_co2.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total CO2 Emissions (kg)
                </p>
              </div>
            </div>
          </Card>

          <Card variant="bordered" padding="lg">
            <CardHeader
              title="Quick Add"
              subtitle="Common activities"
            />
            <div className="space-y-2 mt-4">
              {['Bicycle - 5 km', 'Vegetables - 500 g', 'Recycling - 1 kg'].map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const [type, value] = item.split(' - ');
                    const quickTypes = {
                      'Bicycle': { category: 'transportation' as ActivityCategory, type: 'bicycle', unit: 'km' },
                      'Vegetables': { category: 'food' as ActivityCategory, type: 'vegetables', unit: 'kg' },
                      'Recycling': { category: 'waste' as ActivityCategory, type: 'recycling', unit: 'kg' },
                    };
                    const quick = quickTypes[type as keyof typeof quickTypes];
                    if (quick) {
                      const numValue = parseFloat(value);
                      setNewActivity({
                        category: quick.category,
                        type: quick.type,
                        value: (quick.unit === 'g' ? numValue / 1000 : numValue).toString(),
                        notes: '',
                      });
                      setShowModal(true);
                    }
                  }}
                  className="w-full px-4 py-3 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{item.split(' - ')[0]}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">{item.split(' - ')[1]}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log New Activity"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Category"
            value={newActivity.category}
            onChange={(e) => {
              const category = e.target.value as ActivityCategory;
              setNewActivity({
                ...newActivity,
                category,
                type: '',
              });
            }}
            options={Object.entries(CATEGORY_INFO).map(([key, value]) => ({
              value: key,
              label: value.name,
            }))}
          />

          <Select
            label="Activity Type"
            value={newActivity.type}
            onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
            options={categoryTypes.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.co2_per_unit} kg CO2/${t.unit})`,
            }))}
            placeholder="Select an activity type"
          />

          {newActivity.type && (
            <>
              <Input
                label={`Value (${getActivityType(newActivity.type)?.unit || ''})`}
                type="number"
                value={newActivity.value}
                onChange={(e) => setNewActivity({ ...newActivity, value: e.target.value })}
                placeholder="Enter amount"
                min="0"
                step="0.1"
              />

              {newActivity.value && (
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated CO2 Emissions:
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {(
                      (getActivityType(newActivity.type)?.co2_per_unit || 0) *
                      parseFloat(newActivity.value)
                    ).toFixed(2)}{' '}
                    kg
                  </p>
                </div>
              )}
            </>
          )}

          <Input
            label="Notes (optional)"
            type="text"
            value={newActivity.notes}
            onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
            placeholder="Any additional notes..."
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogActivity}
              isLoading={loading}
            >
              Log Activity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

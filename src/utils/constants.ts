import type { ActivityCategory, ActivityType } from '../types';

export const ACTIVITY_TYPES: ActivityType[] = [
  // Transportation
  { id: 'car_gasoline', category: 'transportation', name: 'Car (Gasoline)', icon: 'Car', unit: 'km', co2_per_unit: 0.21, description: 'Standard gasoline car' },
  { id: 'car_diesel', category: 'transportation', name: 'Car (Diesel)', icon: 'Car', unit: 'km', co2_per_unit: 0.18, description: 'Diesel car' },
  { id: 'car_electric', category: 'transportation', name: 'Car (Electric)', icon: 'Car', unit: 'km', co2_per_unit: 0.05, description: 'Electric vehicle' },
  { id: 'bus', category: 'transportation', name: 'Bus', icon: 'Bus', unit: 'km', co2_per_unit: 0.089, description: 'Public bus' },
  { id: 'train', category: 'transportation', name: 'Train', icon: 'Train', unit: 'km', co2_per_unit: 0.041, description: 'Electric train' },
  { id: 'flight_short', category: 'transportation', name: 'Flight (Short)', icon: 'Plane', unit: 'km', co2_per_unit: 0.255, description: 'Flight under 1000km' },
  { id: 'flight_long', category: 'transportation', name: 'Flight (Long)', icon: 'Plane', unit: 'km', co2_per_unit: 0.195, description: 'Flight over 1000km' },
  { id: 'bicycle', category: 'transportation', name: 'Bicycle', icon: 'Bike', unit: 'km', co2_per_unit: 0, description: 'Zero emissions!' },
  { id: 'walking', category: 'transportation', name: 'Walking', icon: 'Footprints', unit: 'km', co2_per_unit: 0, description: 'Zero emissions!' },

  // Electricity
  { id: 'electricity_home', category: 'electricity', name: 'Home Electricity', icon: 'Zap', unit: 'kWh', co2_per_unit: 0.5, description: 'Average grid electricity' },
  { id: 'electricity_renewable', category: 'electricity', name: 'Renewable Electricity', icon: 'Sun', unit: 'kWh', co2_per_unit: 0.02, description: 'Solar or wind power' },
  { id: 'natural_gas', category: 'electricity', name: 'Natural Gas', icon: 'Flame', unit: 'm³', co2_per_unit: 2.0, description: 'Natural gas heating' },
  { id: 'heating_oil', category: 'electricity', name: 'Heating Oil', icon: 'Flame', unit: 'liters', co2_per_unit: 2.68, description: 'Oil-based heating' },

  // Food
  { id: 'beef', category: 'food', name: 'Beef', icon: 'Beef', unit: 'kg', co2_per_unit: 27.0, description: 'Beef products' },
  { id: 'pork', category: 'food', name: 'Pork', icon: 'Pork', unit: 'kg', co2_per_unit: 12.1, description: 'Pork products' },
  { id: 'chicken', category: 'food', name: 'Chicken', icon: 'Drumstick', unit: 'kg', co2_per_unit: 6.9, description: 'Chicken products' },
  { id: 'fish', category: 'food', name: 'Fish', icon: 'Fish', unit: 'kg', co2_per_unit: 5.1, description: 'Fish and seafood' },
  { id: 'vegetables', category: 'food', name: 'Vegetables', icon: 'Salad', unit: 'kg', co2_per_unit: 0.4, description: 'Fresh vegetables' },
  { id: 'fruits', category: 'food', name: 'Fruits', icon: 'Apple', unit: 'kg', co2_per_unit: 0.5, description: 'Fresh fruits' },
  { id: 'dairy', category: 'food', name: 'Dairy', icon: 'Milk', unit: 'kg', co2_per_unit: 3.15, description: 'Milk, cheese, yogurt' },
  { id: 'plant_based', category: 'food', name: 'Plant-Based', icon: 'Leaf', unit: 'kg', co2_per_unit: 0.9, description: 'Plant-based proteins' },

  // Shopping
  { id: 'clothing_new', category: 'shopping', name: 'New Clothing', icon: 'Shirt', unit: 'item', co2_per_unit: 15.0, description: 'New clothing items' },
  { id: 'clothing_secondhand', category: 'shopping', name: 'Secondhand Clothing', icon: 'Recycle', unit: 'item', co2_per_unit: 0.5, description: 'Thrifting and vintage' },
  { id: 'electronics', category: 'shopping', name: 'Electronics', icon: 'Laptop', unit: 'item', co2_per_unit: 300.0, description: 'Electronic devices' },
  { id: 'furniture', category: 'shopping', name: 'Furniture', icon: 'Sofa', unit: 'item', co2_per_unit: 100.0, description: 'Furniture items' },
  { id: 'books', category: 'shopping', name: 'Books', icon: 'Book', unit: 'item', co2_per_unit: 2.5, description: 'Physical books' },

  // Waste
  { id: 'general_waste', category: 'waste', name: 'General Waste', icon: 'Trash', unit: 'kg', co2_per_unit: 0.5, description: 'Non-recycled waste' },
  { id: 'recycling', category: 'waste', name: 'Recycling', icon: 'Recycle', unit: 'kg', co2_per_unit: 0.1, description: 'Recycled materials' },
  { id: 'composting', category: 'waste', name: 'Composting', icon: 'Leaf', unit: 'kg', co2_per_unit: 0.05, description: 'Composted organic waste' },
  { id: 'food_waste', category: 'waste', name: 'Food Waste', icon: 'Trash', unit: 'kg', co2_per_unit: 2.5, description: 'Wasted food' },
];

export const CATEGORY_INFO: Record<ActivityCategory, { name: string; icon: string; color: string; bgColor: string }> = {
  transportation: { name: 'Transportation', icon: 'Car', color: 'text-blue-500', bgColor: 'bg-blue-500' },
  electricity: { name: 'Electricity', icon: 'Zap', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  food: { name: 'Food', icon: 'Apple', color: 'text-orange-500', bgColor: 'bg-orange-500' },
  shopping: { name: 'Shopping', icon: 'ShoppingBag', color: 'text-pink-500', bgColor: 'bg-pink-500' },
  waste: { name: 'Waste', icon: 'Trash', color: 'text-gray-500', bgColor: 'bg-gray-500' },
};

export const BADGES: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  xp_reward: number;
}> = [
  { id: 'first_log', name: 'First Step', description: 'Log your first activity', icon: 'Footprints', requirement: 'Log 1 activity', xp_reward: 50 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Calendar', requirement: '7 day streak', xp_reward: 200 },
  { id: 'month_streak', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: 'Award', requirement: '30 day streak', xp_reward: 500 },
  { id: 'eco_transport', name: 'Eco Commuter', description: 'Use low-carbon transport 10 times', icon: 'Bike', requirement: '10 eco trips', xp_reward: 150 },
  { id: 'plant_based', name: 'Green Eater', description: 'Log 20 plant-based meals', icon: 'Leaf', requirement: '20 plant-based meals', xp_reward: 100 },
  { id: 'recycler', name: 'Recycling Champion', description: 'Recycle 50kg of waste', icon: 'Recycle', requirement: 'Recycle 50kg', xp_reward: 200 },
  { id: 'carbon_saver_100', name: 'Carbon Saver', description: 'Save 100kg of CO2', icon: 'Leaf', requirement: 'Save 100kg CO2', xp_reward: 300 },
  { id: 'carbon_saver_500', name: 'Planet Protector', description: 'Save 500kg of CO2', icon: 'Globe', requirement: 'Save 500kg CO2', xp_reward: 500 },
  { id: 'level_5', name: 'Eco Enthusiast', description: 'Reach sustainability level 5', icon: 'Star', requirement: 'Level 5', xp_reward: 250 },
  { id: 'level_10', name: 'Sustainability Expert', description: 'Reach sustainability level 10', icon: 'Trophy', requirement: 'Level 10', xp_reward: 1000 },
];

export const SUSTAINABILITY_LEVELS = [
  0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 10000,
  15000, 22000, 30000, 40000, 55000, 75000, 100000, 130000, 170000, 220000,
];

export const ECO_TIPS = [
  'Take shorter showers to save water and energy.',
  'Use a reusable water bottle instead of buying plastic ones.',
  'Unplug electronics when not in use to reduce phantom energy use.',
  'Choose local, seasonal produce to reduce food miles.',
  'Walk or bike for short trips instead of driving.',
  'Use public transportation when possible.',
  'Reduce meat consumption, especially beef.',
  'Compost food scraps instead of throwing them away.',
  'Buy secondhand items instead of new ones.',
  'Use cold water for washing clothes.',
];

export function calculateCO2(category: ActivityCategory, typeId: string, value: number): number {
  const activityType = ACTIVITY_TYPES.find(t => t.id === typeId);
  if (!activityType) return 0;
  return activityType.co2_per_unit * value;
}

export function getActivityType(id: string): ActivityType | undefined {
  return ACTIVITY_TYPES.find(t => t.id === id);
}

export function getCategoryTypes(category: ActivityCategory): ActivityType[] {
  return ACTIVITY_TYPES.filter(t => t.category === category);
}

export function calculateLevel(xp: number): number {
  for (let i = SUSTAINABILITY_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= SUSTAINABILITY_LEVELS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= SUSTAINABILITY_LEVELS.length) {
    return SUSTAINABILITY_LEVELS[SUSTAINABILITY_LEVELS.length - 1];
  }
  return SUSTAINABILITY_LEVELS[currentLevel];
}

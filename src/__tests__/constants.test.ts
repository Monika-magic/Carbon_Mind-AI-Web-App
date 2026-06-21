import { describe, it, expect } from 'vitest';
import {
  ACTIVITY_TYPES,
  BADGES,
  SUSTAINABILITY_LEVELS,
  calculateCO2,
  getActivityType,
  getCategoryTypes,
  calculateLevel,
  getXPForNextLevel,
} from '../utils/constants';
import type { ActivityCategory } from '../types';

describe('Constants and Utilities', () => {
  describe('ACTIVITY_TYPES', () => {
    it('should have activity types for all categories', () => {
      const categories: ActivityCategory[] = ['transportation', 'electricity', 'food', 'shopping', 'waste'];
      categories.forEach((category) => {
        const types = getCategoryTypes(category);
        expect(types.length).toBeGreaterThan(0);
      });
    });

    it('should have positive co2_per_unit values for non-zero emission activities', () => {
      const positiveEmissions = ACTIVITY_TYPES.filter((t) => t.co2_per_unit > 0);
      expect(positiveEmissions.length).toBeGreaterThan(0);
    });

    it('should have zero emission activities for walking and cycling', () => {
      const walking = getActivityType('walking');
      const bicycle = getActivityType('bicycle');
      expect(walking?.co2_per_unit).toBe(0);
      expect(bicycle?.co2_per_unit).toBe(0);
    });
  });

  describe('calculateCO2', () => {
    it('should calculate CO2 emissions correctly', () => {
      const result = calculateCO2('transportation', 'car_gasoline', 100);
      expect(result).toBe(21); // 0.21 * 100
    });

    it('should return 0 for invalid activity type', () => {
      const result = calculateCO2('transportation', 'invalid_type', 100);
      expect(result).toBe(0);
    });

    it('should handle zero value', () => {
      const result = calculateCO2('food', 'beef', 0);
      expect(result).toBe(0);
    });

    it('should calculate emissions for food categories correctly', () => {
      const result = calculateCO2('food', 'beef', 1);
      expect(result).toBe(27); // 27.0 * 1
    });

    it('should calculate zero emissions for walking', () => {
      const result = calculateCO2('transportation', 'walking', 5);
      expect(result).toBe(0);
    });
  });

  describe('getActivityType', () => {
    it('should return the correct activity type', () => {
      const type = getActivityType('car_gasoline');
      expect(type).toBeDefined();
      expect(type?.name).toBe('Car (Gasoline)');
      expect(type?.unit).toBe('km');
    });

    it('should return undefined for invalid ID', () => {
      const type = getActivityType('nonexistent');
      expect(type).toBeUndefined();
    });
  });

  describe('getCategoryTypes', () => {
    it('should return all transportation types', () => {
      const types = getCategoryTypes('transportation');
      expect(types.length).toBeGreaterThan(0);
      types.forEach((t) => {
        expect(t.category).toBe('transportation');
      });
    });

    it('should return all food types', () => {
      const types = getCategoryTypes('food');
      expect(types.length).toBeGreaterThan(0);
      types.forEach((t) => {
        expect(t.category).toBe('food');
      });
    });
  });

  describe('BADGES', () => {
    it('should have badges with required properties', () => {
      BADGES.forEach((badge) => {
        expect(badge.id).toBeDefined();
        expect(badge.name).toBeDefined();
        expect(badge.description).toBeDefined();
        expect(badge.xp_reward).toBeGreaterThan(0);
      });
    });

    it('should have unique badge IDs', () => {
      const ids = BADGES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('SUSTAINABILITY_LEVELS', () => {
    it('should be an array of increasing values', () => {
      for (let i = 1; i < SUSTAINABILITY_LEVELS.length; i++) {
        expect(SUSTAINABILITY_LEVELS[i]).toBeGreaterThanOrEqual(SUSTAINABILITY_LEVELS[i - 1]);
      }
    });

    it('should start at 0', () => {
      expect(SUSTAINABILITY_LEVELS[0]).toBe(0);
    });

    it('should have 20 levels', () => {
      expect(SUSTAINABILITY_LEVELS.length).toBe(20);
    });
  });

  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 1 for small XP', () => {
      expect(calculateLevel(50)).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('should return level 3 for 250 XP', () => {
      expect(calculateLevel(250)).toBe(3);
    });

    it('should return level 5 for 1000 XP', () => {
      expect(calculateLevel(1000)).toBe(5);
    });

    it('should return higher levels for more XP', () => {
      expect(calculateLevel(10000)).toBeGreaterThan(5);
    });
  });

  describe('getXPForNextLevel', () => {
    it('should return the correct XP threshold for level 1', () => {
      expect(getXPForNextLevel(1)).toBe(100);
    });

    it('should return the correct XP threshold for level 2', () => {
      expect(getXPForNextLevel(2)).toBe(250);
    });

    it('should return the maximum for levels beyond the array', () => {
      const maxLevel = SUSTAINABILITY_LEVELS[SUSTAINABILITY_LEVELS.length - 1];
      expect(getXPForNextLevel(25)).toBe(maxLevel);
    });
  });
});

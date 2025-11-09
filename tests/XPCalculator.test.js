/**
 * XPCalculator Tests
 */

import { XPCalculator } from '../src/utils/XPCalculator.js';

describe('XPCalculator', () => {
    describe('getLevelFromXP', () => {
        test('should return level 1 for 0 XP', () => {
            expect(XPCalculator.getLevelFromXP(0)).toBe(1);
        });

        test('should return level 2 for 83 XP', () => {
            expect(XPCalculator.getLevelFromXP(83)).toBe(2);
        });

        test('should return level 10 for 1154 XP (hitpoints start)', () => {
            expect(XPCalculator.getLevelFromXP(1154)).toBe(10);
        });

        test('should return level 50 for 101333 XP', () => {
            expect(XPCalculator.getLevelFromXP(101333)).toBe(50);
        });

        test('should return level 99 for max XP', () => {
            expect(XPCalculator.getLevelFromXP(14000000)).toBe(99);
        });
    });

    describe('getXPForLevel', () => {
        test('should return 0 XP for level 1', () => {
            expect(XPCalculator.getXPForLevel(1)).toBe(0);
        });

        test('should return 83 XP for level 2', () => {
            expect(XPCalculator.getXPForLevel(2)).toBe(83);
        });

        test('should handle invalid levels', () => {
            expect(XPCalculator.getXPForLevel(0)).toBe(0);
            expect(XPCalculator.getXPForLevel(100)).toBe(XPCalculator.getXPForLevel(99));
        });
    });

    describe('getXPToNextLevel', () => {
        test('should return correct XP to next level', () => {
            const xp = 100;
            const currentLevel = XPCalculator.getLevelFromXP(xp);
            const nextLevelXP = XPCalculator.getXPForLevel(currentLevel + 1);
            const expected = nextLevelXP - xp;

            expect(XPCalculator.getXPToNextLevel(xp)).toBe(expected);
        });

        test('should return 0 for level 99', () => {
            const maxXP = XPCalculator.getXPForLevel(99);
            expect(XPCalculator.getXPToNextLevel(maxXP)).toBe(0);
        });
    });

    describe('getProgressToNextLevel', () => {
        test('should return 0 at exact level XP', () => {
            const level2XP = XPCalculator.getXPForLevel(2);
            expect(XPCalculator.getProgressToNextLevel(level2XP)).toBe(0);
        });

        test('should return 1 at level 99', () => {
            const maxXP = XPCalculator.getXPForLevel(99) + 1000000;
            expect(XPCalculator.getProgressToNextLevel(maxXP)).toBe(1);
        });

        test('should return value between 0 and 1', () => {
            const xp = 200;
            const progress = XPCalculator.getProgressToNextLevel(xp);
            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThanOrEqual(1);
        });
    });

    describe('calculateCombatLevel', () => {
        test('should calculate correct combat level for new player', () => {
            const skills = {
                attack: 1,
                strength: 1,
                defence: 1,
                hitpoints: 10,
                ranged: 1,
                prayer: 1,
                magic: 1
            };

            const combatLevel = XPCalculator.calculateCombatLevel(skills);
            expect(combatLevel).toBe(3);
        });

        test('should calculate correct combat level for mid-level player', () => {
            const skills = {
                attack: 50,
                strength: 50,
                defence: 50,
                hitpoints: 50,
                ranged: 1,
                prayer: 43,
                magic: 1
            };

            const combatLevel = XPCalculator.calculateCombatLevel(skills);
            expect(combatLevel).toBeGreaterThan(50);
            expect(combatLevel).toBeLessThan(70);
        });
    });

    describe('calculateMaxHit', () => {
        test('should calculate max hit for level 1 strength', () => {
            const maxHit = XPCalculator.calculateMaxHit(1, 0);
            expect(maxHit).toBeGreaterThanOrEqual(0);
        });

        test('should increase with strength level', () => {
            const maxHit1 = XPCalculator.calculateMaxHit(1, 0);
            const maxHit50 = XPCalculator.calculateMaxHit(50, 0);
            const maxHit99 = XPCalculator.calculateMaxHit(99, 0);

            expect(maxHit50).toBeGreaterThan(maxHit1);
            expect(maxHit99).toBeGreaterThan(maxHit50);
        });

        test('should increase with strength bonus', () => {
            const maxHitNoBonus = XPCalculator.calculateMaxHit(50, 0);
            const maxHitWithBonus = XPCalculator.calculateMaxHit(50, 50);

            expect(maxHitWithBonus).toBeGreaterThan(maxHitNoBonus);
        });
    });

    describe('calculateAccuracy', () => {
        test('should return value between 0 and 1', () => {
            const accuracy = XPCalculator.calculateAccuracy(50, 50, 30, 30);
            expect(accuracy).toBeGreaterThanOrEqual(0);
            expect(accuracy).toBeLessThanOrEqual(1);
        });

        test('should increase with higher attack', () => {
            const accuracy1 = XPCalculator.calculateAccuracy(10, 0, 50, 0);
            const accuracy2 = XPCalculator.calculateAccuracy(50, 0, 50, 0);

            expect(accuracy2).toBeGreaterThan(accuracy1);
        });

        test('should decrease with higher defence', () => {
            const accuracy1 = XPCalculator.calculateAccuracy(50, 0, 10, 0);
            const accuracy2 = XPCalculator.calculateAccuracy(50, 0, 50, 0);

            expect(accuracy1).toBeGreaterThan(accuracy2);
        });
    });
});

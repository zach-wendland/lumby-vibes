/**
 * LootSystem tests
 */

import { LootSystem, DROP_TABLES, RARE_DROP_TABLE, RARITY } from '../src/systems/LootSystem.js';

describe('LootSystem', () => {
    let mockGameLogic;
    let lootSystem;

    beforeEach(() => {
        mockGameLogic = {
            player: {
                addItem: jest.fn(() => true)
            }
        };

        lootSystem = new LootSystem(mockGameLogic);
    });

    describe('initialization', () => {
        test('should initialize with empty loot history', () => {
            expect(lootSystem.lootHistory).toEqual([]);
        });

        test('should have reference to gameLogic', () => {
            expect(lootSystem.gameLogic).toBe(mockGameLogic);
        });
    });

    describe('generateLoot', () => {
        test('should generate loot for chicken', () => {
            const loot = lootSystem.generateLoot('CHICKEN');
            expect(Array.isArray(loot)).toBe(true);

            // Chickens always drop bones
            const hasBones = loot.some(drop => drop.item === 'bones');
            expect(hasBones).toBe(true);
        });

        test('should return empty array for unknown enemy', () => {
            const loot = lootSystem.generateLoot('UNKNOWN_ENEMY');
            expect(loot).toEqual([]);
        });

        test('should generate loot for cow with guaranteed drops', () => {
            const loot = lootSystem.generateLoot('COW');

            // Cows always drop bones and cowhide
            const hasBones = loot.some(drop => drop.item === 'bones');
            const hasCowhide = loot.some(drop => drop.item === 'cowhide');

            expect(hasBones).toBe(true);
            expect(hasCowhide).toBe(true);
        });

        test('should generate variable quantities for ranged drops', () => {
            // Run multiple times to check variation
            const quantities = new Set();

            for (let i = 0; i < 20; i++) {
                const loot = lootSystem.generateLoot('GOBLIN_LEVEL_5');
                const coinsDrop = loot.find(drop => drop.item === 'coins');

                if (coinsDrop) {
                    quantities.add(coinsDrop.quantity);
                }
            }

            // Should have variation in coin quantities
            expect(quantities.size).toBeGreaterThan(1);
        });

        test('should add loot to history', () => {
            lootSystem.generateLoot('CHICKEN');
            expect(lootSystem.lootHistory.length).toBe(1);
            expect(lootSystem.lootHistory[0].enemyType).toBe('CHICKEN');
        });

        test('should include timestamp in history', () => {
            lootSystem.generateLoot('CHICKEN');
            expect(lootSystem.lootHistory[0].timestamp).toBeDefined();
            expect(typeof lootSystem.lootHistory[0].timestamp).toBe('number');
        });
    });

    describe('rollRareDropTable', () => {
        test('should return array of drops', () => {
            const rareLoot = lootSystem.rollRareDropTable();
            expect(Array.isArray(rareLoot)).toBe(true);
        });

        test('should potentially include rare items', () => {
            // Run multiple times to check if we ever get rare drops
            let foundRare = false;

            for (let i = 0; i < 100; i++) {
                const rareLoot = lootSystem.rollRareDropTable();
                if (rareLoot.length > 0) {
                    foundRare = true;
                    break;
                }
            }

            // With 100 rolls, we should hit at least once
            expect(foundRare).toBe(true);
        });
    });

    describe('calculateLootValue', () => {
        test('should calculate loot value correctly', () => {
            const loot = [
                { item: 'bones', quantity: 1 },
                { item: 'cowhide', quantity: 1 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(181); // 31 (bones) + 150 (cowhide)
        });

        test('should handle multiple quantities', () => {
            const loot = [
                { item: 'coins', quantity: 10 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(10);
        });

        test('should return 0 for empty loot', () => {
            const value = lootSystem.calculateLootValue([]);
            expect(value).toBe(0);
        });

        test('should handle unknown items gracefully', () => {
            const loot = [
                { item: 'unknown_item', quantity: 1 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(0);
        });
    });

    describe('rarity system', () => {
        test('ALWAYS rarity should drop 100% of the time', () => {
            // Test chicken bones (always drops)
            let allHaveBones = true;

            for (let i = 0; i < 10; i++) {
                const loot = lootSystem.generateLoot('CHICKEN');
                const hasBones = loot.some(drop => drop.item === 'bones');
                if (!hasBones) {
                    allHaveBones = false;
                    break;
                }
            }

            expect(allHaveBones).toBe(true);
        });

        test('COMMON rarity should drop frequently', () => {
            // Feathers from chickens are common (50% chance)
            let featherCount = 0;

            for (let i = 0; i < 20; i++) {
                const loot = lootSystem.generateLoot('CHICKEN');
                const hasFeathers = loot.some(drop => drop.item === 'feathers');
                if (hasFeathers) featherCount++;
            }

            // Should drop at least a few times
            expect(featherCount).toBeGreaterThan(0);
        });

        test('VERY_RARE rarity should access RDT rarely', () => {
            // Rare drop table is 0.1% (1/1000)
            // We'll just test that it exists in drop table
            expect(DROP_TABLES.GOBLIN_LEVEL_5.rare_drop_table).toBeDefined();
            expect(DROP_TABLES.GOBLIN_LEVEL_5.rare_drop_table.chance).toBeLessThan(0.01);
        });
    });

    describe('loot statistics', () => {
        test('should track loot history over time', () => {
            lootSystem.generateLoot('CHICKEN');
            lootSystem.generateLoot('COW');
            lootSystem.generateLoot('GOBLIN_LEVEL_5');

            expect(lootSystem.lootHistory.length).toBe(3);
        });

        test('should maintain separate history entries', () => {
            lootSystem.generateLoot('CHICKEN');
            lootSystem.generateLoot('COW');

            expect(lootSystem.lootHistory[0].enemyType).toBe('CHICKEN');
            expect(lootSystem.lootHistory[1].enemyType).toBe('COW');
        });
    });

    describe('item values', () => {
        test('should have correct GP values for common items', () => {
            const bonesValue = lootSystem.getItemValue('bones');
            const cowhideValue = lootSystem.getItemValue('cowhide');

            expect(bonesValue).toBe(31);
            expect(cowhideValue).toBe(150);
        });

        test('should have correct values for rare items', () => {
            const dragonMedValue = lootSystem.getItemValue('dragon_med_helm');
            expect(dragonMedValue).toBe(59000);
        });

        test('should return 0 for unknown items', () => {
            const value = lootSystem.getItemValue('nonexistent_item');
            expect(value).toBe(0);
        });
    });
});

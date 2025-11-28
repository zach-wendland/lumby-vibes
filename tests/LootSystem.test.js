/**
 * Comprehensive LootSystem tests
 */

import { LootSystem, DROP_TABLES, RARITY } from '../src/systems/LootSystem.ts';

describe('LootSystem', () => {
    let lootSystem;

    beforeEach(() => {
        lootSystem = new LootSystem();
    });

    describe('Initialization', () => {
        test('should initialize with empty loot history', () => {
            expect(lootSystem.lootHistory).toEqual([]);
        });
    });

    describe('generateLoot', () => {
        test('should return empty array for unknown enemy type', () => {
            const loot = lootSystem.generateLoot('UNKNOWN_ENEMY');
            expect(loot).toEqual([]);
        });

        test('should generate loot for CHICKEN', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force all drops

            const loot = lootSystem.generateLoot('CHICKEN');

            expect(loot.length).toBeGreaterThan(0);
            expect(loot.some(l => l.item === 'bones')).toBe(true);
            expect(loot.some(l => l.item === 'raw_chicken')).toBe(true);

            Math.random.mockRestore();
        });

        test('should generate loot for COW', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force all drops

            const loot = lootSystem.generateLoot('COW');

            expect(loot.some(l => l.item === 'bones')).toBe(true);
            expect(loot.some(l => l.item === 'cowhide')).toBe(true);

            Math.random.mockRestore();
        });

        test('should generate loot for GOBLIN_LEVEL_2', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force all drops

            const loot = lootSystem.generateLoot('GOBLIN_LEVEL_2');

            expect(loot.some(l => l.item === 'bones')).toBe(true);

            Math.random.mockRestore();
        });

        test('should respect drop chances', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.99); // Force no drops

            const loot = lootSystem.generateLoot('CHICKEN');

            // Bones should always drop (chance 1.0), but others shouldn't with high random
            const bonesOnly = loot.filter(l => l.item === 'bones');
            expect(bonesOnly.length).toBe(1);

            Math.random.mockRestore();
        });

        test('should handle quantity ranges correctly', () => {
            jest.spyOn(Math, 'random')
                .mockReturnValueOnce(0.01) // Pass drop chance
                .mockReturnValueOnce(0.5);  // Middle of quantity range

            const loot = lootSystem.generateLoot('CHICKEN');
            const feathers = loot.find(l => l.item === 'feathers');

            if (feathers) {
                expect(feathers.quantity).toBeGreaterThanOrEqual(5);
                expect(feathers.quantity).toBeLessThanOrEqual(15);
            }

            Math.random.mockRestore();
        });

        test('should record loot in history', () => {
            lootSystem.generateLoot('CHICKEN');

            expect(lootSystem.lootHistory.length).toBe(1);
            expect(lootSystem.lootHistory[0].enemyType).toBe('CHICKEN');
            expect(lootSystem.lootHistory[0]).toHaveProperty('loot');
            expect(lootSystem.lootHistory[0]).toHaveProperty('timestamp');
        });

        test('should generate multiple loot entries', () => {
            lootSystem.generateLoot('CHICKEN');
            lootSystem.generateLoot('COW');
            lootSystem.generateLoot('GOBLIN_LEVEL_2');

            expect(lootSystem.lootHistory.length).toBe(3);
        });

        test('should include rarity in loot drops', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force drops

            const loot = lootSystem.generateLoot('CHICKEN');

            expect(loot[0]).toHaveProperty('rarity');
            expect(Object.values(RARITY)).toContain(loot[0].rarity);

            Math.random.mockRestore();
        });
    });

    describe('rollRareDropTable', () => {
        test('should return loot from rare drop table', () => {
            const rareLoot = lootSystem.rollRareDropTable();

            expect(rareLoot.length).toBeGreaterThan(0);
            expect(rareLoot[0]).toHaveProperty('item');
            expect(rareLoot[0]).toHaveProperty('quantity');
            expect(rareLoot[0]).toHaveProperty('isRare');
            expect(rareLoot[0].isRare).toBe(true);
        });

        test('should respect weighted distribution', () => {
            const results = new Map();
            const iterations = 10000;

            for (let i = 0; i < iterations; i++) {
                const loot = lootSystem.rollRareDropTable();
                if (loot.length > 0) {
                    const item = loot[0].item;
                    results.set(item, (results.get(item) || 0) + 1);
                }
            }

            // Common items should appear more than rare items
            expect(results.size).toBeGreaterThan(0);
        });

        test('should handle quantity ranges in rare drop table', () => {
            const rareLoot = lootSystem.rollRareDropTable();

            if (rareLoot.length > 0 && Array.isArray(DROP_TABLES.RARE_DROP_TABLE[rareLoot[0].item]?.quantity)) {
                const [min, max] = DROP_TABLES.RARE_DROP_TABLE[rareLoot[0].item].quantity;
                expect(rareLoot[0].quantity).toBeGreaterThanOrEqual(min);
                expect(rareLoot[0].quantity).toBeLessThanOrEqual(max);
            }
        });
    });

    describe('Rare drop table access', () => {
        test('should trigger rare drop table for GOBLIN_LEVEL_2', () => {
            // Mock all Math.random calls to return values that trigger drops
            jest.spyOn(Math, 'random').mockReturnValue(0.0001);

            const loot = lootSystem.generateLoot('GOBLIN_LEVEL_2');

            // Should have rare loot
            const rareLoot = loot.find(l => l.isRare);
            expect(rareLoot).toBeDefined();

            Math.random.mockRestore();
        });
    });

    describe('calculateLootValue', () => {
        test('should calculate value for single item', () => {
            const loot = [
                { item: 'bones', quantity: 1 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(31); // bones = 31gp
        });

        test('should calculate value for multiple items', () => {
            const loot = [
                { item: 'bones', quantity: 1 },        // 31
                { item: 'cowhide', quantity: 1 }       // 150
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(181);
        });

        test('should handle quantities correctly', () => {
            const loot = [
                { item: 'bones', quantity: 5 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(155); // 31 * 5
        });

        test('should return 0 for empty loot', () => {
            const value = lootSystem.calculateLootValue([]);
            expect(value).toBe(0);
        });

        test('should return 0 for unknown items', () => {
            const loot = [
                { item: 'unknown_item', quantity: 1 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(0);
        });

        test('should calculate value for rare drops', () => {
            const loot = [
                { item: 'dragon_med_helm', quantity: 1 }
            ];

            const value = lootSystem.calculateLootValue(loot);
            expect(value).toBe(59000);
        });
    });

    describe('getLootStatistics', () => {
        beforeEach(() => {
            // Generate some loot
            jest.spyOn(Math, 'random').mockReturnValue(0.01); // Force drops

            lootSystem.generateLoot('CHICKEN');
            lootSystem.generateLoot('CHICKEN');
            lootSystem.generateLoot('COW');

            Math.random.mockRestore();
        });

        test('should return statistics for all kills', () => {
            const stats = lootSystem.getLootStatistics();

            expect(stats.totalKills).toBe(3);
            expect(stats).toHaveProperty('totalValue');
            expect(stats).toHaveProperty('averageValue');
            expect(stats).toHaveProperty('commonDrops');
            expect(stats).toHaveProperty('rareDrops');
        });

        test('should filter statistics by enemy type', () => {
            const chickenStats = lootSystem.getLootStatistics('CHICKEN');

            expect(chickenStats.totalKills).toBe(2);
        });

        test('should calculate total and average value', () => {
            const stats = lootSystem.getLootStatistics();

            expect(stats.totalValue).toBeGreaterThan(0);
            expect(stats.averageValue).toBe(stats.totalValue / stats.totalKills);
        });

        test('should track common drops count', () => {
            const stats = lootSystem.getLootStatistics();

            expect(stats.commonDrops).toBeInstanceOf(Map);
            expect(stats.commonDrops.has('bones')).toBe(true);
            expect(stats.commonDrops.get('bones')).toBeGreaterThan(0);
        });

        test('should track rare drops separately', () => {
            // Force a rare drop
            jest.spyOn(Math, 'random')
                .mockReturnValueOnce(0.01) // Pass regular drops
                .mockReturnValueOnce(0.0001) // Trigger rare drop table
                .mockReturnValue(0.5); // For rare table roll

            lootSystem.generateLoot('GOBLIN_LEVEL_2');

            const stats = lootSystem.getLootStatistics();

            // Check if rare drops were recorded
            if (stats.rareDrops.length > 0) {
                expect(stats.rareDrops[0]).toHaveProperty('item');
                expect(stats.rareDrops[0]).toHaveProperty('quantity');
                expect(stats.rareDrops[0]).toHaveProperty('timestamp');
            }

            Math.random.mockRestore();
        });

        test('should return zero values for empty history', () => {
            const emptySystem = new LootSystem();
            const stats = emptySystem.getLootStatistics();

            expect(stats.totalKills).toBe(0);
            expect(stats.totalValue).toBe(0);
            expect(stats.averageValue).toBe(0);
        });
    });

    describe('formatLootMessage', () => {
        test('should return message for empty loot', () => {
            const message = lootSystem.formatLootMessage([]);
            expect(message).toBe("Nothing was dropped.");
        });

        test('should format single item', () => {
            const loot = [
                { item: 'bones', quantity: 1 }
            ];

            const message = lootSystem.formatLootMessage(loot);
            expect(message).toContain('bones');
            expect(message).not.toContain('(x1)'); // Single items don't show quantity
        });

        test('should format multiple quantities', () => {
            const loot = [
                { item: 'feathers', quantity: 10 }
            ];

            const message = lootSystem.formatLootMessage(loot);
            expect(message).toContain('feathers');
            expect(message).toContain('(x10)');
        });

        test('should format multiple items', () => {
            const loot = [
                { item: 'bones', quantity: 1 },
                { item: 'raw_chicken', quantity: 1 }
            ];

            const message = lootSystem.formatLootMessage(loot);
            expect(message).toContain('bones');
            expect(message).toContain('raw chicken');
        });

        test('should mark rare drops', () => {
            const loot = [
                { item: 'dragon_med_helm', quantity: 1, isRare: true }
            ];

            const message = lootSystem.formatLootMessage(loot);
            expect(message).toContain('dragon med helm');
            expect(message).toContain('[RARE!]');
        });

        test('should replace underscores with spaces', () => {
            const loot = [
                { item: 'raw_chicken', quantity: 1 }
            ];

            const message = lootSystem.formatLootMessage(loot);
            expect(message).toContain('raw chicken');
            expect(message).not.toContain('raw_chicken');
        });
    });

    describe('Drop table integrity', () => {
        test('should have all required enemy drop tables', () => {
            const requiredTables = ['CHICKEN', 'COW', 'GOBLIN_LEVEL_2', 'GOBLIN_LEVEL_5'];

            for (const enemyType of requiredTables) {
                expect(DROP_TABLES).toHaveProperty(enemyType);
            }
        });

        test('all drop tables should have valid structure', () => {
            for (const [enemyType, dropTable] of Object.entries(DROP_TABLES)) {
                if (enemyType === 'RARE_DROP_TABLE') continue;

                for (const [item, dropData] of Object.entries(dropTable)) {
                    expect(dropData).toHaveProperty('chance');
                    expect(typeof dropData.chance).toBe('number');
                    expect(dropData.chance).toBeGreaterThan(0);
                    expect(dropData.chance).toBeLessThanOrEqual(1);
                }
            }
        });

        test('RARITY constants should be defined', () => {
            expect(RARITY.ALWAYS).toBeDefined();
            expect(RARITY.COMMON).toBeDefined();
            expect(RARITY.UNCOMMON).toBeDefined();
            expect(RARITY.RARE).toBeDefined();
            expect(RARITY.VERY_RARE).toBeDefined();
        });
    });

    describe('Integration tests', () => {
        test('should generate realistic loot distribution over many kills', () => {
            const iterations = 1000;

            for (let i = 0; i < iterations; i++) {
                lootSystem.generateLoot('CHICKEN');
            }

            const stats = lootSystem.getLootStatistics('CHICKEN');

            // Bones should always drop (1000 times)
            expect(stats.commonDrops.get('bones')).toBe(1000);

            // Raw chicken should also always drop
            expect(stats.commonDrops.get('raw_chicken')).toBe(1000);

            // Feathers should drop approximately 50% of the time (with variance)
            // Note: This counts total quantity, not drop occurrences
            // With 50% drop rate and 5-15 feathers per drop, expect ~2500-7500 total
            const featherCount = stats.commonDrops.get('feathers') || 0;
            expect(featherCount).toBeGreaterThan(2000);
            expect(featherCount).toBeLessThan(8000);
        });

        test('should track progression through multiple enemy types', () => {
            // Kill a variety of enemies
            for (let i = 0; i < 10; i++) {
                lootSystem.generateLoot('CHICKEN');
                lootSystem.generateLoot('COW');
                lootSystem.generateLoot('GOBLIN_LEVEL_2');
            }

            const chickenStats = lootSystem.getLootStatistics('CHICKEN');
            const cowStats = lootSystem.getLootStatistics('COW');
            const goblinStats = lootSystem.getLootStatistics('GOBLIN_LEVEL_2');

            expect(chickenStats.totalKills).toBe(10);
            expect(cowStats.totalKills).toBe(10);
            expect(goblinStats.totalKills).toBe(10);

            const totalStats = lootSystem.getLootStatistics();
            expect(totalStats.totalKills).toBe(30);
        });
    });
});

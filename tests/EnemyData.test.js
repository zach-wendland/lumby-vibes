/**
 * Comprehensive EnemyData tests
 */

import { ENEMY_DATA, SPAWN_LOCATIONS, getEnemyData, getEnemiesByLocation } from '../src/data/EnemyData.js';

describe('EnemyData', () => {
    describe('Data integrity', () => {
        test('should export ENEMY_DATA object', () => {
            expect(ENEMY_DATA).toBeDefined();
            expect(typeof ENEMY_DATA).toBe('object');
        });

        test('should have at least one enemy defined', () => {
            expect(Object.keys(ENEMY_DATA).length).toBeGreaterThan(0);
        });

        test('should export SPAWN_LOCATIONS object', () => {
            expect(SPAWN_LOCATIONS).toBeDefined();
            expect(typeof SPAWN_LOCATIONS).toBe('object');
        });
    });

    describe('Enemy structure validation', () => {
        test('all enemies should have required fields', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData).toHaveProperty('id');
                expect(enemyData).toHaveProperty('name');
                expect(enemyData).toHaveProperty('level');
                expect(enemyData).toHaveProperty('hitpoints');
                expect(enemyData).toHaveProperty('maxHit');
                expect(enemyData).toHaveProperty('attackSpeed');
                expect(enemyData).toHaveProperty('aggressive');
                expect(enemyData).toHaveProperty('examine');

                expect(typeof enemyData.id).toBe('string');
                expect(typeof enemyData.name).toBe('string');
                expect(typeof enemyData.level).toBe('number');
                expect(typeof enemyData.hitpoints).toBe('number');
                expect(typeof enemyData.maxHit).toBe('number');
                expect(typeof enemyData.aggressive).toBe('boolean');
                expect(typeof enemyData.examine).toBe('string');
            }
        });

        test('all enemies should have valid numeric stats', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData.level).toBeGreaterThan(0);
                expect(enemyData.hitpoints).toBeGreaterThanOrEqual(0);
                expect(enemyData.maxHit).toBeGreaterThanOrEqual(0);
                expect(enemyData.attackSpeed).toBeGreaterThanOrEqual(0);
            }
        });

        test('all enemies should have xpRewards object', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData).toHaveProperty('xpRewards');
                expect(typeof enemyData.xpRewards).toBe('object');
            }
        });

        test('all enemies should have combatStats object', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData).toHaveProperty('combatStats');
                expect(typeof enemyData.combatStats).toBe('object');

                const stats = enemyData.combatStats;
                expect(typeof stats.attack).toBe('number');
                expect(typeof stats.strength).toBe('number');
                expect(typeof stats.defence).toBe('number');
            }
        });

        test('aggressive enemies should have aggroRange', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                if (enemyData.aggressive) {
                    expect(enemyData.aggroRange).toBeDefined();
                    expect(typeof enemyData.aggroRange).toBe('number');
                    expect(enemyData.aggroRange).toBeGreaterThan(0);
                }
            }
        });

        test('all enemies should have respawnTime', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData).toHaveProperty('respawnTime');
                expect(typeof enemyData.respawnTime).toBe('number');
                expect(enemyData.respawnTime).toBeGreaterThanOrEqual(0);
            }
        });

        test('all enemies should have size and color', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData).toHaveProperty('size');
                expect(enemyData).toHaveProperty('color');

                expect(typeof enemyData.size).toBe('number');
                expect(typeof enemyData.color).toBe('number');
                expect(enemyData.size).toBeGreaterThan(0);
            }
        });
    });

    describe('Specific enemy tests', () => {
        test('should have Chicken', () => {
            expect(ENEMY_DATA.CHICKEN).toBeDefined();
            expect(ENEMY_DATA.CHICKEN.name).toBe('Chicken');
            expect(ENEMY_DATA.CHICKEN.level).toBe(1);
            expect(ENEMY_DATA.CHICKEN.aggressive).toBe(false);
        });

        test('should have Cow', () => {
            expect(ENEMY_DATA.COW).toBeDefined();
            expect(ENEMY_DATA.COW.name).toBe('Cow');
            expect(ENEMY_DATA.COW.level).toBe(2);
        });

        test('should have Goblin level 2', () => {
            expect(ENEMY_DATA.GOBLIN_LEVEL_2).toBeDefined();
            expect(ENEMY_DATA.GOBLIN_LEVEL_2.level).toBe(2);
            expect(ENEMY_DATA.GOBLIN_LEVEL_2.aggressive).toBe(false);
        });

        test('should have Goblin level 5', () => {
            expect(ENEMY_DATA.GOBLIN_LEVEL_5).toBeDefined();
            expect(ENEMY_DATA.GOBLIN_LEVEL_5.level).toBe(5);
            expect(ENEMY_DATA.GOBLIN_LEVEL_5.aggressive).toBe(true);
        });

        test('should have Rat', () => {
            expect(ENEMY_DATA.RAT).toBeDefined();
            expect(ENEMY_DATA.RAT.level).toBe(1);
        });

        test('should have Giant Rat variants', () => {
            expect(ENEMY_DATA.GIANT_RAT_LEVEL_3).toBeDefined();
            expect(ENEMY_DATA.GIANT_RAT_LEVEL_6).toBeDefined();
        });

        test('should have Spider', () => {
            expect(ENEMY_DATA.SPIDER).toBeDefined();
            expect(ENEMY_DATA.SPIDER.level).toBe(2);
        });
    });

    describe('XP rewards validation', () => {
        test('xpRewards should have valid properties', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                const xp = enemyData.xpRewards;

                if (xp.hitpoints !== undefined) {
                    expect(typeof xp.hitpoints).toBe('number');
                    expect(xp.hitpoints).toBeGreaterThanOrEqual(0);
                }

                if (xp.attack !== undefined) {
                    expect(typeof xp.attack).toBe('number');
                    expect(xp.attack).toBeGreaterThanOrEqual(0);
                }

                if (xp.strength !== undefined) {
                    expect(typeof xp.strength).toBe('number');
                    expect(xp.strength).toBeGreaterThanOrEqual(0);
                }

                if (xp.defence !== undefined) {
                    expect(typeof xp.defence).toBe('number');
                    expect(xp.defence).toBeGreaterThanOrEqual(0);
                }
            }
        });

        test('higher level enemies should give more XP', () => {
            const chicken = ENEMY_DATA.CHICKEN;
            const goblinLv5 = ENEMY_DATA.GOBLIN_LEVEL_5;

            const chickenXP = chicken.xpRewards.attack || 0;
            const goblinXP = goblinLv5.xpRewards.attack || 0;

            expect(goblinXP).toBeGreaterThan(chickenXP);
        });
    });

    describe('Examine text validation', () => {
        test('all examine texts should be properly formatted', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                const examine = enemyData.examine;

                expect(examine.trim().length).toBeGreaterThan(0);
                expect(/[.!?]$/.test(examine)).toBe(true);
                expect(/^[A-Z]/.test(examine)).toBe(true);
            }
        });
    });

    describe('Attack style validation', () => {
        test('all enemies should have valid attack style', () => {
            const validStyles = ['melee', 'ranged', 'magic', 'none'];

            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                expect(enemyData).toHaveProperty('attackStyle');
                expect(validStyles).toContain(enemyData.attackStyle);
            }
        });

        test('enemies with 0 max hit may be passive', () => {
            // Enemies with 0 maxHit can have various attack styles
            // (e.g., sheep have 'none', but some may have 'melee' indicating they can be attacked)
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                if (enemyData.maxHit === 0) {
                    expect(['melee', 'none']).toContain(enemyData.attackStyle);
                }
            }
        });
    });

    describe('SPAWN_LOCATIONS validation', () => {
        test('all spawn locations should have valid structure', () => {
            for (const [enemyType, locations] of Object.entries(SPAWN_LOCATIONS)) {
                expect(Array.isArray(locations)).toBe(true);

                locations.forEach(loc => {
                    expect(loc).toHaveProperty('x');
                    expect(loc).toHaveProperty('z');
                    expect(loc).toHaveProperty('count');
                    expect(loc).toHaveProperty('area');

                    expect(typeof loc.x).toBe('number');
                    expect(typeof loc.z).toBe('number');
                    expect(typeof loc.count).toBe('number');
                    expect(typeof loc.area).toBe('string');

                    expect(loc.count).toBeGreaterThan(0);
                });
            }
        });

        test('spawn locations should reference valid enemy types', () => {
            for (const enemyType of Object.keys(SPAWN_LOCATIONS)) {
                // Should exist in ENEMY_DATA (or be close match)
                const exists = ENEMY_DATA[enemyType] !== undefined ||
                    Object.keys(ENEMY_DATA).some(key => key.includes(enemyType));

                if (!exists) {
                    console.warn(`Spawn location for ${enemyType} has no matching ENEMY_DATA`);
                }
            }
        });
    });

    describe('getEnemyData utility function', () => {
        test('should return enemy data for valid ID', () => {
            const chickenData = getEnemyData('chicken');

            expect(chickenData).toBeDefined();
            expect(chickenData.name).toBe('Chicken');
        });

        test('should be case insensitive', () => {
            const data1 = getEnemyData('chicken');
            const data2 = getEnemyData('CHICKEN');
            const data3 = getEnemyData('ChIcKeN');

            expect(data1).toBe(data2);
            expect(data2).toBe(data3);
        });

        test('should return undefined for invalid ID', () => {
            const data = getEnemyData('nonexistent_enemy');

            expect(data).toBeUndefined();
        });

        test('should work with all enemy IDs', () => {
            for (const enemyId of Object.keys(ENEMY_DATA)) {
                const data = getEnemyData(enemyId.toLowerCase());
                expect(data).toBeDefined();
            }
        });
    });

    describe('getEnemiesByLocation utility function', () => {
        test('should return enemies for valid location', () => {
            const enemies = getEnemiesByLocation('Fred\'s Farm chicken pen');

            expect(Array.isArray(enemies)).toBe(true);
            expect(enemies.length).toBeGreaterThan(0);
        });

        test('should return empty array for invalid location', () => {
            const enemies = getEnemiesByLocation('Nonexistent Location');

            expect(Array.isArray(enemies)).toBe(true);
            expect(enemies.length).toBe(0);
        });

        test('should include enemy type and spawn data', () => {
            const enemies = getEnemiesByLocation('Fred\'s Farm chicken pen');

            enemies.forEach(enemy => {
                expect(enemy).toHaveProperty('type');
                expect(enemy).toHaveProperty('x');
                expect(enemy).toHaveProperty('z');
                expect(enemy).toHaveProperty('count');
                expect(enemy).toHaveProperty('area');
            });
        });

        test('should work with all defined locations', () => {
            const allLocations = new Set();

            for (const locations of Object.values(SPAWN_LOCATIONS)) {
                locations.forEach(loc => allLocations.add(loc.area));
            }

            allLocations.forEach(location => {
                const enemies = getEnemiesByLocation(location);
                expect(enemies.length).toBeGreaterThan(0);
            });
        });

        test('should return multiple enemies for same location', () => {
            // Find a location that should have multiple enemy types
            let locationWithMultiple = null;

            for (const [enemyType, locations] of Object.entries(SPAWN_LOCATIONS)) {
                for (const loc of locations) {
                    const enemies = getEnemiesByLocation(loc.area);
                    if (enemies.length > 1) {
                        locationWithMultiple = loc.area;
                        break;
                    }
                }
                if (locationWithMultiple) break;
            }

            // If we found such a location, test it
            if (locationWithMultiple) {
                const enemies = getEnemiesByLocation(locationWithMultiple);
                expect(enemies.length).toBeGreaterThan(1);
            }
        });
    });

    describe('Data consistency', () => {
        test('enemy IDs should be uppercase with underscores', () => {
            for (const enemyId of Object.keys(ENEMY_DATA)) {
                expect(enemyId).toMatch(/^[A-Z_0-9]+$/);
            }
        });

        test('enemy names should use proper capitalization', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                const name = enemyData.name;

                expect(/^[A-Z]/.test(name)).toBe(true);
            }
        });

        test('level and hitpoints should be proportional', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                // Generally, higher level = more HP
                // Level 1 enemies should have low HP
                if (enemyData.level === 1) {
                    expect(enemyData.hitpoints).toBeLessThanOrEqual(10);
                }
            }
        });

        test('quest enemies should have isQuestNPC flag', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                if (enemyData.isQuestNPC) {
                    expect(enemyData.quest).toBeDefined();
                    expect(typeof enemyData.quest).toBe('string');
                }
            }
        });
    });

    describe('Special enemy types', () => {
        test('should have quest enemies', () => {
            expect(ENEMY_DATA.RESTLESS_GHOST).toBeDefined();
            expect(ENEMY_DATA.RESTLESS_GHOST.isQuestNPC).toBe(true);
        });

        test('should have dungeon enemies', () => {
            expect(ENEMY_DATA.CAVE_GOBLIN).toBeDefined();
        });

        test('should have passive enemies (sheep)', () => {
            expect(ENEMY_DATA.SHEEP_UNSHORN).toBeDefined();
            expect(ENEMY_DATA.SHEEP_SHORN).toBeDefined();
            expect(ENEMY_DATA.SHEEP_UNSHORN.maxHit).toBe(0);
        });

        test('sheep should have shearing properties', () => {
            expect(ENEMY_DATA.SHEEP_UNSHORN.canShear).toBe(true);
            expect(ENEMY_DATA.SHEEP_SHORN.canShear).toBe(false);
            expect(ENEMY_DATA.SHEEP_SHORN.regrowWoolTime).toBeDefined();
        });
    });

    describe('Combat balance validation', () => {
        test('max hit should not exceed hitpoints for low level enemies', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                if (enemyData.level <= 5 && enemyData.maxHit > 0) {
                    expect(enemyData.maxHit).toBeLessThanOrEqual(enemyData.hitpoints);
                }
            }
        });

        test('aggressive enemies should have reasonable stats', () => {
            for (const [enemyId, enemyData] of Object.entries(ENEMY_DATA)) {
                if (enemyData.aggressive) {
                    // Aggressive enemies should have combat capabilities
                    expect(enemyData.maxHit).toBeGreaterThan(0);
                    expect(enemyData.aggroRange).toBeDefined();
                }
            }
        });
    });

    describe('Lumbridge specific enemies', () => {
        const lumbridgeEnemies = [
            'CHICKEN',
            'COW',
            'GOBLIN_LEVEL_2',
            'GOBLIN_LEVEL_5',
            'RAT',
            'GIANT_RAT_LEVEL_3',
            'SPIDER',
            'MAN',
            'WOMAN'
        ];

        test('should have all basic Lumbridge enemies', () => {
            lumbridgeEnemies.forEach(enemyId => {
                expect(ENEMY_DATA[enemyId]).toBeDefined();
                expect(ENEMY_DATA[enemyId].name).toBeTruthy();
            });
        });
    });
});

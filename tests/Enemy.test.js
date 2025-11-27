/**
 * Comprehensive Enemy tests
 */

import { Enemy } from '../src/entities/Enemy.js';
import { ITEMS } from '../src/utils/Constants.js';

describe('Enemy', () => {
    describe('Initialization', () => {
        test('should create enemy with basic properties', () => {
            const enemy = new Enemy(10, 20, 'CHICKEN');

            expect(enemy.position.x).toBe(10);
            expect(enemy.position.z).toBe(20);
            expect(enemy.enemyType).toBe('CHICKEN');
            expect(enemy.rotation).toBe(0);
        });

        test('should initialize from ENEMY_DATA', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.name).toBe('Chicken');
            expect(enemy.level).toBe(1);
            expect(enemy.maxHP).toBe(3);
            expect(enemy.currentHP).toBe(3);
        });

        test('should clone start position', () => {
            const enemy = new Enemy(5, 10, 'CHICKEN');

            expect(enemy.startPosition).not.toBe(enemy.position);
            expect(enemy.startPosition.x).toBe(5);
            expect(enemy.startPosition.z).toBe(10);
        });

        test('should initialize combat state', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.inCombat).toBe(false);
            expect(enemy.target).toBeNull();
            expect(enemy.lastAttackTime).toBe(0);
            expect(enemy.isDead).toBe(false);
        });

        test('should initialize respawn properties', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.respawnTime).toBe(30);
            expect(enemy.respawnTimer).toBe(0);
        });

        test('should initialize wandering properties', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.wanderRadius).toBe(15);
            expect(enemy.wanderTimer).toBe(0);
            expect(enemy.targetPosition).toBeNull();
            expect(enemy.isWandering).toBe(false);
        });

        test('should set aggression from ENEMY_DATA', () => {
            const chicken = new Enemy(0, 0, 'CHICKEN');
            expect(chicken.aggressive).toBe(false);

            const goblin = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            expect(goblin.aggressive).toBe(true);
            expect(goblin.aggroRange).toBe(10);
        });

        test('should create mesh with userData', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.mesh).toBeDefined();
            expect(enemy.mesh.userData.entity).toBe(enemy);
            expect(enemy.mesh.userData.type).toBe('enemy');
            expect(enemy.mesh.userData.enemyType).toBe('CHICKEN');
        });

        test('should create HP bar', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.hpBarBg).toBeDefined();
            expect(enemy.hpBarFill).toBeDefined();
        });

        test('should have body parts for animation', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.bodyParts).toBeDefined();
            expect(enemy.bodyParts.body).toBeDefined();
        });
    });

    describe('Enemy types', () => {
        test('should create chicken with correct stats', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.name).toBe('Chicken');
            expect(enemy.level).toBe(1);
            expect(enemy.aggressive).toBe(false);
        });

        test('should create cow with correct stats', () => {
            const enemy = new Enemy(0, 0, 'COW');

            expect(enemy.name).toBe('Cow');
            expect(enemy.level).toBe(2);
            expect(enemy.maxHP).toBe(8);
        });

        test('should create goblin level 2 with correct stats', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_2');

            expect(enemy.name).toBe('Goblin');
            expect(enemy.level).toBe(2);
            expect(enemy.aggressive).toBe(false);
        });

        test('should create goblin level 5 with aggression', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');

            expect(enemy.name).toBe('Goblin');
            expect(enemy.level).toBe(5);
            expect(enemy.aggressive).toBe(true);
            expect(enemy.aggroRange).toBe(10);
        });

        test('should create rat with correct stats', () => {
            const enemy = new Enemy(0, 0, 'RAT');

            expect(enemy.name).toBe('Rat');
            expect(enemy.level).toBe(1);
        });

        test('should handle unknown enemy type', () => {
            const enemy = new Enemy(0, 0, 'UNKNOWN');

            expect(enemy.name).toBe('Unknown');
            expect(enemy.level).toBe(1);
        });
    });

    describe('getDropTable', () => {
        test('should return chicken drops', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            const dropTable = enemy.dropTable;

            expect(dropTable).toContainEqual({ item: ITEMS.BONES, chance: 1.0 });
            expect(dropTable).toContainEqual({ item: ITEMS.RAW_CHICKEN, chance: 1.0 });
            expect(dropTable.some(d => d.item === ITEMS.FEATHER)).toBe(true);
        });

        test('should return cow drops', () => {
            const enemy = new Enemy(0, 0, 'COW');
            const dropTable = enemy.dropTable;

            expect(dropTable).toContainEqual({ item: ITEMS.BONES, chance: 1.0 });
            expect(dropTable).toContainEqual({ item: ITEMS.COWHIDE, chance: 1.0 });
            expect(dropTable).toContainEqual({ item: ITEMS.RAW_BEEF, chance: 1.0 });
        });

        test('should return goblin drops', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_2');
            const dropTable = enemy.dropTable;

            expect(dropTable).toContainEqual({ item: ITEMS.BONES, chance: 1.0 });
            expect(dropTable.some(d => d.item === ITEMS.COINS)).toBe(true);
        });

        test('should return default drops for unknown enemy', () => {
            const enemy = new Enemy(0, 0, 'UNKNOWN');
            const dropTable = enemy.dropTable;

            expect(dropTable).toContainEqual({ item: ITEMS.BONES, chance: 1.0 });
        });
    });

    describe('HP management', () => {
        test('should update HP bar on creation', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.hpBarFill.scale.x).toBe(1); // Full HP
        });

        test('should update HP bar when damaged', () => {
            const enemy = new Enemy(0, 0, 'COW');
            enemy.maxHP = 10;
            enemy.currentHP = 10;

            enemy.takeDamage(5);
            enemy.updateHPBar();

            expect(enemy.hpBarFill.scale.x).toBeCloseTo(0.5, 2);
        });

        test('should change HP bar color based on HP', () => {
            const enemy = new Enemy(0, 0, 'COW');
            enemy.maxHP = 100;

            // High HP - Green
            enemy.currentHP = 60;
            enemy.updateHPBar();
            expect(enemy.hpBarFill.material.color.getHex()).toBe(0x00FF00);

            // Medium HP - Yellow
            enemy.currentHP = 40;
            enemy.updateHPBar();
            expect(enemy.hpBarFill.material.color.getHex()).toBe(0xFFFF00);

            // Low HP - Red
            enemy.currentHP = 10;
            enemy.updateHPBar();
            expect(enemy.hpBarFill.material.color.getHex()).toBe(0xFF0000);
        });
    });

    describe('takeDamage', () => {
        test('should reduce HP when taking damage', () => {
            const enemy = new Enemy(0, 0, 'COW');
            enemy.currentHP = 8;

            enemy.takeDamage(3);

            expect(enemy.currentHP).toBe(5);
        });

        test('should not go below 0 HP', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.currentHP = 2;

            enemy.takeDamage(10);

            expect(enemy.currentHP).toBe(0);
        });

        test('should return false if enemy survives', () => {
            const enemy = new Enemy(0, 0, 'COW');
            enemy.currentHP = 8;

            const died = enemy.takeDamage(3);

            expect(died).toBe(false);
        });

        test('should return true if enemy dies', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.currentHP = 3;

            const died = enemy.takeDamage(3);

            expect(died).toBe(true);
            expect(enemy.isDead).toBe(true);
        });
    });

    describe('die and loot generation', () => {
        test('should set isDead flag', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            enemy.die();

            expect(enemy.isDead).toBe(true);
        });

        test('should exit combat on death', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            enemy.inCombat = true;
            enemy.target = { position: { x: 0, y: 0, z: 0 } };

            enemy.die();

            expect(enemy.inCombat).toBe(false);
            expect(enemy.target).toBeNull();
        });

        test('should start respawn timer', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.respawnTime = 30;

            enemy.die();

            expect(enemy.respawnTimer).toBe(30);
        });

        test('should hide mesh on death', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            enemy.die();

            expect(enemy.mesh.visible).toBe(false);
        });

        test('should generate loot', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            const loot = enemy.die();

            expect(Array.isArray(loot)).toBe(true);
            // Chicken always drops bones
            expect(loot.some(item => item.item === ITEMS.BONES)).toBe(true);
        });

        test('should generate random loot based on drop table', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            // Mock Math.random to always succeed
            const originalRandom = Math.random;
            Math.random = () => 0; // Always succeed

            const loot = enemy.generateLoot();

            // Should get all drops with 100% chance
            expect(loot.some(item => item.item === ITEMS.BONES)).toBe(true);
            expect(loot.some(item => item.item === ITEMS.RAW_CHICKEN)).toBe(true);

            Math.random = originalRandom;
        });

        test('should not generate loot with failed chance', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            // Mock Math.random to always fail optional drops
            const originalRandom = Math.random;
            Math.random = () => 1; // Always fail

            const loot = enemy.generateLoot();

            // Should get no drops since all fail
            expect(loot.length).toBe(0);

            Math.random = originalRandom;
        });
    });

    describe('respawn', () => {
        test('should reset isDead flag', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.die();

            enemy.respawn();

            expect(enemy.isDead).toBe(false);
        });

        test('should restore full HP', () => {
            const enemy = new Enemy(0, 0, 'COW');
            enemy.maxHP = 8;
            enemy.currentHP = 0;

            enemy.respawn();

            expect(enemy.currentHP).toBe(8);
        });

        test('should reset position to start position', () => {
            const enemy = new Enemy(5, 10, 'CHICKEN');
            enemy.position.x = 20;
            enemy.position.z = 30;

            enemy.respawn();

            expect(enemy.position.x).toBe(5);
            expect(enemy.position.z).toBe(10);
        });

        test('should show mesh', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.die();

            enemy.respawn();

            expect(enemy.mesh.visible).toBe(true);
        });
    });

    describe('Wandering behavior', () => {
        test('should not wander when dead', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.die();
            const pos = enemy.position.clone();

            enemy.update(1, null);

            expect(enemy.position.x).toBe(pos.x);
            expect(enemy.position.z).toBe(pos.z);
        });

        test('should start wandering after cooldown', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            enemy.update(10, null);

            expect(enemy.targetPosition).not.toBeNull();
            expect(enemy.isWandering).toBe(true);
        });

        test('should pick target within wander radius', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            enemy.update(10, null);

            if (enemy.targetPosition) {
                const distance = Math.sqrt(
                    Math.pow(enemy.targetPosition.x - enemy.startPosition.x, 2) +
                    Math.pow(enemy.targetPosition.z - enemy.startPosition.z, 2)
                );

                expect(distance).toBeLessThanOrEqual(enemy.wanderRadius);
            }
        });

        test('should move towards target', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            const initialX = enemy.position.x;

            // Force wandering
            enemy.targetPosition = { x: 10, y: 0, z: 0 };
            enemy.isWandering = true;

            enemy.update(0.5, null);

            expect(enemy.position.x).toBeGreaterThan(initialX);
        });

        test('should stop wandering when reaching target', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            // Set target very close
            enemy.targetPosition = enemy.position.clone();
            enemy.targetPosition.x += 0.1;
            enemy.isWandering = true;

            enemy.update(1, null);

            expect(enemy.isWandering).toBe(false);
            expect(enemy.targetPosition).toBeNull();
        });

        test('should animate legs when wandering', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_2');

            // Force wandering
            enemy.targetPosition = { x: 10, y: 0, z: 0 };
            enemy.isWandering = true;

            enemy.update(0.5, null);

            if (enemy.bodyParts.leftLeg) {
                expect(enemy.bodyParts.leftLeg.rotation.x).not.toBe(0);
                expect(enemy.bodyParts.rightLeg.rotation.x).not.toBe(0);
            }
        });
    });

    describe('Combat behavior', () => {
        test('should not aggro when not aggressive', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            const player = { position: { x: 5, y: 0, z: 0 }, distanceTo: () => 5 };

            enemy.update(0.1, player);

            expect(enemy.inCombat).toBe(false);
            expect(enemy.target).toBeNull();
        });

        test('should aggro player when aggressive and in range', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            enemy.aggressive = true;
            enemy.aggroRange = 10;

            const player = {
                position: { x: 5, y: 0, z: 0 }
            };

            enemy.update(0.1, player);

            expect(enemy.inCombat).toBe(true);
            expect(enemy.target).toBe(player);
        });

        test('should not aggro player when out of range', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            enemy.aggressive = true;
            enemy.aggroRange = 5;

            const player = {
                position: { x: 20, y: 0, z: 0 }
            };

            enemy.update(0.1, player);

            expect(enemy.inCombat).toBe(false);
        });

        test('should chase target when in combat', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            const initialX = enemy.position.x;

            const player = {
                position: { x: 10, y: 0, z: 0 }
            };

            enemy.inCombat = true;
            enemy.target = player;

            enemy.update(0.5, player);

            expect(enemy.position.x).toBeGreaterThan(initialX);
        });

        test('should chase target when in combat', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            const initialX = enemy.position.x;

            const player = {
                position: { x: 10, y: 0, z: 0 }
            };

            enemy.inCombat = true;
            enemy.target = player;

            enemy.update(0.5, player);

            // Should move towards target
            expect(enemy.position.x).toBeGreaterThan(initialX);
            expect(enemy.inCombat).toBe(true);
        });

        test('should not wander when in combat', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_5');
            const player = {
                position: { x: 5, y: 0, z: 0 }
            };

            enemy.inCombat = true;
            enemy.target = player;

            // Try to trigger wander
            enemy.wanderTimer = 100;
            enemy.update(0.1, player);

            // Should not have set wander target
            expect(enemy.isWandering).toBe(false);
        });
    });

    describe('Respawn mechanics', () => {
        test('should decrement respawn timer when dead', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.die();

            const initialTimer = enemy.respawnTimer;
            enemy.update(1, null);

            expect(enemy.respawnTimer).toBeLessThan(initialTimer);
        });

        test('should respawn when timer reaches 0', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');
            enemy.die();
            enemy.respawnTimer = 0.1;

            enemy.update(1, null);

            expect(enemy.isDead).toBe(false);
            expect(enemy.currentHP).toBe(enemy.maxHP);
        });
    });

    describe('Mesh updates', () => {
        test('should update mesh position', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            enemy.position.x = 10;
            enemy.position.z = 20;
            enemy.update(0.1, null);

            expect(enemy.mesh.position.x).toBe(10);
            expect(enemy.mesh.position.z).toBe(20);
        });

        test('should update mesh rotation', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            enemy.rotation = Math.PI / 2;
            enemy.update(0.1, null);

            expect(enemy.mesh.rotation.y).toBe(Math.PI / 2);
        });
    });

    describe('Special enemy types', () => {
        test('should create chicken with appropriate mesh', () => {
            const enemy = new Enemy(0, 0, 'CHICKEN');

            expect(enemy.bodyParts.body).toBeDefined();
        });

        test('should create cow with appropriate mesh', () => {
            const enemy = new Enemy(0, 0, 'COW');

            expect(enemy.bodyParts.body).toBeDefined();
        });

        test('should create goblin with limbs', () => {
            const enemy = new Enemy(0, 0, 'GOBLIN_LEVEL_2');

            expect(enemy.bodyParts.body).toBeDefined();
            expect(enemy.bodyParts.leftLeg).toBeDefined();
            expect(enemy.bodyParts.rightLeg).toBeDefined();
        });
    });
});

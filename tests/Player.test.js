/**
 * Player Tests
 */

import { Player } from '../src/entities/Player.js';
import { ITEMS, SKILLS } from '../src/utils/Constants.js';

// Mock THREE.js
global.THREE = {
    Vector3: class {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        copy(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        }
        distanceTo(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            const dz = this.z - v.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        subVectors(a, b) {
            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;
            return this;
        }
        normalize() {
            const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            if (length > 0) {
                this.x /= length;
                this.y /= length;
                this.z /= length;
            }
            return this;
        }
        addScaledVector(v, s) {
            this.x += v.x * s;
            this.y += v.y * s;
            this.z += v.z * s;
            return this;
        }
    },
    Group: class {},
    BoxGeometry: class {},
    SphereGeometry: class {},
    MeshLambertMaterial: class {},
    MeshBasicMaterial: class {},
    Mesh: class { constructor() { this.position = { y: 0 }; this.rotation = { x: 0, y: 0 }; } },
    CanvasTexture: class {},
    SpriteMaterial: class {},
    Sprite: class { constructor() { this.position = { y: 0 }; this.scale = { set: () => {} }; } }
};

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player(0, 0);
    });

    describe('initialization', () => {
        test('should initialize at correct position', () => {
            expect(player.position.x).toBe(0);
            expect(player.position.z).toBe(0);
        });

        test('should have correct starting skills', () => {
            expect(player.skills.attack.level).toBe(1);
            expect(player.skills.strength.level).toBe(1);
            expect(player.skills.defence.level).toBe(1);
            expect(player.skills.hitpoints.level).toBe(10);
        });

        test('should have full HP at start', () => {
            expect(player.currentHP).toBe(player.skills.hitpoints.level);
        });

        test('should have empty inventory', () => {
            expect(player.inventory.length).toBe(28);
            expect(player.inventory.every(slot => slot === null)).toBe(true);
        });
    });

    describe('movement', () => {
        test('should set target position when moving', () => {
            player.moveTo(10, 10);
            expect(player.targetPosition).toBeDefined();
            expect(player.targetPosition.x).toBe(10);
            expect(player.targetPosition.z).toBe(10);
            expect(player.isMoving).toBe(true);
        });

        test('should stop movement', () => {
            player.moveTo(10, 10);
            player.stop();
            expect(player.isMoving).toBe(false);
            expect(player.targetPosition).toBe(null);
        });
    });

    describe('XP and leveling', () => {
        test('should add XP to skills', () => {
            const initialXP = player.skills.attack.xp;
            player.addXP(SKILLS.ATTACK, 100);
            expect(player.skills.attack.xp).toBe(initialXP + 100);
        });

        test('should level up when enough XP gained', () => {
            const initialLevel = player.skills.attack.level;
            player.addXP(SKILLS.ATTACK, 1000);
            expect(player.skills.attack.level).toBeGreaterThan(initialLevel);
        });

        test('should return true when leveling up', () => {
            const leveledUp = player.addXP(SKILLS.ATTACK, 1000);
            expect(leveledUp).toBe(true);
        });

        test('should return false when not leveling up', () => {
            const leveledUp = player.addXP(SKILLS.ATTACK, 10);
            expect(leveledUp).toBe(false);
        });

        test('should update max HP when hitpoints level increases', () => {
            const oldMaxHP = player.skills.hitpoints.level;
            player.addXP(SKILLS.HITPOINTS, 10000);
            expect(player.skills.hitpoints.level).toBeGreaterThan(oldMaxHP);
            expect(player.currentHP).toBe(player.skills.hitpoints.level);
        });
    });

    describe('combat', () => {
        test('should calculate combat level', () => {
            const combatLevel = player.getCombatLevel();
            expect(combatLevel).toBeGreaterThanOrEqual(3);
        });

        test('should take damage', () => {
            const initialHP = player.currentHP;
            const died = player.takeDamage(5);
            expect(player.currentHP).toBe(initialHP - 5);
            expect(died).toBe(false);
        });

        test('should die when HP reaches 0', () => {
            const died = player.takeDamage(999);
            expect(player.currentHP).toBe(0);
            expect(died).toBe(true);
        });

        test('should heal HP', () => {
            player.currentHP = 5;
            player.heal(3);
            expect(player.currentHP).toBe(8);
        });

        test('should not heal above max HP', () => {
            const maxHP = player.skills.hitpoints.level;
            player.heal(999);
            expect(player.currentHP).toBe(maxHP);
        });
    });

    describe('inventory', () => {
        test('should add items to inventory', () => {
            const added = player.addItem(ITEMS.LOGS, 1);
            expect(added).toBe(true);
            expect(player.getInventoryCount()).toBe(1);
        });

        test('should stack stackable items', () => {
            player.addItem(ITEMS.LOGS, 1);
            player.addItem(ITEMS.LOGS, 5);

            const logsSlot = player.inventory.find(item => item && item.id === ITEMS.LOGS.id);
            expect(logsSlot.count).toBe(6);
            expect(player.getInventoryCount()).toBe(1);
        });

        test('should not stack non-stackable items', () => {
            player.addItem(ITEMS.BRONZE_SWORD, 1);
            player.addItem(ITEMS.BRONZE_SWORD, 1);

            const swordSlots = player.inventory.filter(item => item && item.id === ITEMS.BRONZE_SWORD.id);
            expect(swordSlots.length).toBe(2);
        });

        test('should return false when inventory is full', () => {
            // Fill inventory
            for (let i = 0; i < 28; i++) {
                player.inventory[i] = { ...ITEMS.BRONZE_SWORD, count: 1 };
            }

            const added = player.addItem(ITEMS.LOGS, 1);
            expect(added).toBe(false);
        });

        test('should remove items from inventory', () => {
            player.addItem(ITEMS.LOGS, 5);
            const item = player.removeItem(0);

            expect(item).toBeDefined();
            expect(player.getInventoryCount()).toBe(0);
        });

        test('should count inventory correctly', () => {
            expect(player.getInventoryCount()).toBe(0);

            player.addItem(ITEMS.LOGS, 5);
            expect(player.getInventoryCount()).toBe(1);

            player.addItem(ITEMS.BRONZE_SWORD, 1);
            expect(player.getInventoryCount()).toBe(2);
        });
    });
});

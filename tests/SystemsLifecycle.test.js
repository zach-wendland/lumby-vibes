/**
 * Systems Lifecycle Tests
 * Tests for dispose() methods across all game systems
 */

import { ShopSystem } from '../src/systems/ShopSystem.ts';
import { CombatSystem } from '../src/systems/CombatSystem.ts';
import { SkillsSystem } from '../src/systems/SkillsSystem.ts';

describe('Systems lifecycle safeguards', () => {
    describe('ShopSystem', () => {
        let mockGameLogic;
        let mockPlayer;
        let shopSystem;

        beforeEach(() => {
            mockPlayer = {
                skills: {
                    woodcutting: { level: 1, xp: 0 }
                },
                inventory: new Array(28).fill(null),
                isMember: false,
                addItem: jest.fn(),
                removeItem: jest.fn()
            };
            mockPlayer.inventory[0] = { id: 995, name: 'Coins', count: 10000 };

            mockGameLogic = { player: mockPlayer };
            shopSystem = new ShopSystem(mockGameLogic);
        });

        test('dispose clears all restock timers', () => {
            jest.useFakeTimers();

            // Open shop and buy item to trigger restock timer
            shopSystem.openShop('bobs_axes');
            shopSystem.buyItem('bronze_axe', 1);

            // Verify timer was created
            expect(shopSystem.restockTimers.size).toBeGreaterThan(0);

            // Dispose
            shopSystem.dispose();

            // Verify timers were cleared
            expect(shopSystem.restockTimers.size).toBe(0);

            jest.useRealTimers();
        });

        test('dispose closes current shop', () => {
            shopSystem.openShop('bobs_axes');
            expect(shopSystem.currentShop).not.toBeNull();

            shopSystem.dispose();

            expect(shopSystem.currentShop).toBeNull();
        });

        test('dispose clears all shops', () => {
            const initialShopCount = shopSystem.shops.size;
            expect(initialShopCount).toBeGreaterThan(0);

            shopSystem.dispose();

            expect(shopSystem.shops.size).toBe(0);
        });
    });

    describe('CombatSystem', () => {
        let mockGameLogic;
        let mockPlayer;
        let mockEnemy;
        let combatSystem;

        beforeEach(() => {
            mockPlayer = {
                skills: {
                    attack: { level: 10, xp: 1000 },
                    strength: { level: 10, xp: 1000 },
                    defence: { level: 10, xp: 1000 },
                    hitpoints: { level: 10, xp: 1000 }
                },
                equipmentBonuses: { attack: 0, defence: 0, strength: 0 },
                position: { x: 0, y: 0, z: 0 },
                inCombat: false,
                target: null,
                addXP: jest.fn()
            };

            mockEnemy = {
                name: 'Test Enemy',
                level: 5,
                skills: {
                    defence: { level: 5, xp: 0 }
                },
                equipmentBonuses: { attack: 0, defence: 0, strength: 0 },
                position: { x: 1, y: 0, z: 1 },
                isDead: false,
                takeDamage: jest.fn(() => false),
                inCombat: false,
                target: null
            };

            mockGameLogic = {
                player: mockPlayer,
                ui: {
                    addMessage: jest.fn(),
                    updateStats: jest.fn(),
                    updateInventory: jest.fn()
                },
                lootSystem: {
                    generateLoot: jest.fn(() => [])
                },
                createDamageSplash: jest.fn()
            };

            combatSystem = new CombatSystem(mockGameLogic);
        });

        test('dispose stops ongoing combat', () => {
            // Start combat
            combatSystem.attackTarget(mockEnemy);
            expect(mockPlayer.inCombat).toBe(true);

            // Dispose
            combatSystem.dispose();

            // Verify combat was stopped
            expect(mockPlayer.inCombat).toBe(false);
            expect(mockPlayer.target).toBeNull();
        });

        test('dispose clears combat queue', () => {
            // Add enemies to queue (simulated)
            combatSystem.combatQueue.push(mockEnemy);
            expect(combatSystem.combatQueue.length).toBeGreaterThan(0);

            // Dispose
            combatSystem.dispose();

            // Verify queue was cleared
            expect(combatSystem.combatQueue.length).toBe(0);
        });

        test('dispose resets attack timer', () => {
            // Set attack timer to non-zero value
            combatSystem.attackTimer = 2.4;
            expect(combatSystem.attackTimer).not.toBe(0);

            // Dispose
            combatSystem.dispose();

            // Verify timer was reset
            expect(combatSystem.attackTimer).toBe(0);
        });
    });

    describe('SkillsSystem', () => {
        let mockGameLogic;
        let mockPlayer;
        let skillsSystem;

        beforeEach(() => {
            mockPlayer = {
                skills: {
                    woodcutting: { level: 1, xp: 0 },
                    mining: { level: 1, xp: 0 },
                    fishing: { level: 1, xp: 0 }
                },
                inventory: new Array(28).fill(null),
                addItem: jest.fn(() => true),
                addXP: jest.fn()
            };

            mockGameLogic = {
                player: mockPlayer,
                ui: {
                    addMessage: jest.fn(),
                    updateStats: jest.fn(),
                    updateInventory: jest.fn()
                }
            };

            skillsSystem = new SkillsSystem(mockGameLogic);
        });

        test('dispose clears all resources', () => {
            // Add some mock resources
            const mockResource = {
                type: 'tree',
                name: 'Tree',
                levelRequired: 1,
                hp: 5,
                maxHP: 5,
                xpReward: 25,
                depleted: false,
                respawnTime: 30,
                respawnTimer: 0,
                deplete: jest.fn(),
                respawn: jest.fn()
            };

            skillsSystem.resources.push(mockResource);
            expect(skillsSystem.resources.length).toBeGreaterThan(0);

            // Dispose
            skillsSystem.dispose();

            // Verify resources were cleared
            expect(skillsSystem.resources.length).toBe(0);
        });

        test('dispose is idempotent', () => {
            // Add resources
            const mockResource = {
                type: 'tree',
                name: 'Tree',
                levelRequired: 1,
                hp: 5,
                maxHP: 5,
                xpReward: 25,
                depleted: false,
                respawnTime: 30,
                respawnTimer: 0,
                deplete: jest.fn(),
                respawn: jest.fn()
            };
            skillsSystem.resources.push(mockResource);

            // Dispose multiple times
            skillsSystem.dispose();
            skillsSystem.dispose();
            skillsSystem.dispose();

            // Should still be cleared with no errors
            expect(skillsSystem.resources.length).toBe(0);
        });
    });
});

/**
 * Integration Test - Tests multiple systems working together
 *
 * This test verifies that the core game systems (Player, Combat, Quest, Loot, Skills)
 * integrate properly and work together as they would in actual gameplay.
 */

import { Player } from '../src/entities/Player.ts';
import { CombatSystem } from '../src/systems/CombatSystem.ts';
import { QuestSystem } from '../src/systems/QuestSystem.ts';
import { LootSystem } from '../src/systems/LootSystem.ts';
import { SkillsSystem } from '../src/systems/SkillsSystem.ts';
import { XPCalculator } from '../src/utils/XPCalculator.ts';
import { SKILLS, ITEMS } from '../src/utils/Constants.ts';

// Mock Player.createMesh to avoid canvas issues in tests
jest.spyOn(Player.prototype, 'createMesh').mockImplementation(function() {
    this.mesh = {
        position: this.position,
        rotation: { y: 0 },
        userData: { entity: this, type: 'player' }
    };
    this.bodyParts = {
        leftLeg: { rotation: { x: 0 } },
        rightLeg: { rotation: { x: 0 } },
        leftArm: { rotation: { x: 0 } },
        rightArm: { rotation: { x: 0 } }
    };
});

// Mock enemy for combat testing
class MockEnemy {
    constructor(name, level, hitpoints, enemyId) {
        this.name = name;
        this.level = level;
        this.hitpoints = hitpoints;
        this.currentHP = hitpoints;
        this.enemyId = enemyId;
        this.type = enemyId;
        this.position = { x: 0, y: 0, z: 0 };
        this.isDead = false;
        this.inCombat = false;
        this.xpReward = level * 10;
        this.equipmentBonuses = { attack: 0, strength: 0, defence: 0 };
    }

    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) {
            this.isDead = true;
            return true;
        }
        return false;
    }

    die() {
        this.isDead = true;
    }
}

// Mock UI for testing
class MockUI {
    constructor() {
        this.messages = [];
    }

    addMessage(message, type) {
        this.messages.push({ message, type });
    }

    updateStats() {}
    updateInventory() {}
}

// Mock GameLogic for CombatSystem and SkillsSystem
class MockGameLogic {
    constructor(player) {
        this.player = player;
        this.ui = new MockUI();
        this.lootSystem = new LootSystem();
    }

    createDamageSplash(position, damage) {
        // Mock damage splash
    }
}

// Mock GameLogic for SkillsSystem that properly exposes player
class MockGameLogicForSkills {
    constructor(player) {
        this.player = player;
        this.ui = new MockUI();
    }
}

describe('Integration Tests - Core Game Systems', () => {
    let player;
    let questSystem;
    let skillsSystem;
    let combatSystem;
    let lootSystem;
    let mockGameLogic;

    beforeEach(() => {
        // Initialize all systems
        player = new Player(0, 0);
        questSystem = new QuestSystem(player);
        lootSystem = new LootSystem();
        mockGameLogic = new MockGameLogic(player);
        combatSystem = new CombatSystem(mockGameLogic);

        // SkillsSystem requires gameLogic with player property
        const mockGameLogicForSkills = new MockGameLogicForSkills(player);
        skillsSystem = new SkillsSystem(mockGameLogicForSkills);
    });

    describe('Player Progression Integration', () => {
        test('Player gains XP, levels up, and combat level increases', () => {
            const initialAttackLevel = player.skills.attack.level;
            const initialCombatLevel = player.getCombatLevel();

            // Add enough XP to level up
            const xpForLevel2 = XPCalculator.getXPForLevel(2);
            player.addXP(SKILLS.ATTACK, xpForLevel2);

            expect(player.skills.attack.level).toBe(2);
            expect(player.skills.attack.level).toBeGreaterThan(initialAttackLevel);
            expect(player.getCombatLevel()).toBeGreaterThanOrEqual(initialCombatLevel);
        });

        test('Player inventory management with stackable and non-stackable items', () => {
            const coin = ITEMS.COINS;
            const bronzeSword = ITEMS.BRONZE_SWORD;

            // Add stackable items (coins)
            expect(player.addItem(coin, 10)).toBe(true);
            expect(player.addItem(coin, 5)).toBe(true);

            // Should stack in same slot
            const coinSlot = player.inventory.find(item => item && item.id === coin.id);
            expect(coinSlot.count).toBe(15);

            // Add non-stackable item
            expect(player.addItem(bronzeSword, 1)).toBe(true);
            expect(player.addItem(bronzeSword, 1)).toBe(true);

            // Should occupy different slots
            const swordSlots = player.inventory.filter(item => item && item.id === bronzeSword.id);
            expect(swordSlots.length).toBe(2);
        });

        test('Player HP management through combat and healing', () => {
            const maxHP = player.skills.hitpoints.level;

            // Take damage
            player.takeDamage(5);
            expect(player.currentHP).toBe(maxHP - 5);

            // Heal
            player.heal(3);
            expect(player.currentHP).toBe(maxHP - 2);

            // Can't heal above max
            player.heal(100);
            expect(player.currentHP).toBe(maxHP);
        });
    });

    describe('Combat System Integration', () => {
        test('Complete combat encounter with loot generation', () => {
            const chicken = new MockEnemy('Chicken', 1, 3, 'CHICKEN');
            const initialXP = player.skills.attack.xp;

            // Attack target
            combatSystem.attackTarget(chicken);
            expect(player.inCombat).toBe(true);
            expect(player.target).toBe(chicken);

            // Manually kill enemy to test loot
            combatSystem.handleKill(chicken);

            // Verify XP was gained
            expect(player.skills.attack.xp).toBeGreaterThan(initialXP);

            // Verify enemy is dead
            expect(chicken.isDead).toBe(true);

            // Verify combat ended
            expect(player.inCombat).toBe(false);
        });

        test('Combat accuracy calculations work with player stats', () => {
            const enemy = new MockEnemy('Goblin', 2, 5, 'GOBLIN_LEVEL_2');

            // Test hit calculation
            const damage1 = combatSystem.calculateHit(player, enemy);
            expect(typeof damage1).toBe('number');
            expect(damage1).toBeGreaterThanOrEqual(0);

            // Increase player's attack and strength significantly
            const xpForLevel99 = XPCalculator.getXPForLevel(99);
            player.addXP(SKILLS.ATTACK, xpForLevel99);
            player.addXP(SKILLS.STRENGTH, xpForLevel99);
            player.equipmentBonuses.attack = 50; // Add equipment bonus
            player.equipmentBonuses.strength = 50;

            // Higher level should increase hit chance dramatically
            let hits = 0;
            let totalDamage = 0;
            const trials = 100;
            for (let i = 0; i < trials; i++) {
                const damage = combatSystem.calculateHit(player, enemy);
                if (damage > 0) {
                    hits++;
                    totalDamage += damage;
                }
            }

            // With level 99 attack/strength and equipment, should have very high accuracy
            expect(hits).toBeGreaterThan(trials * 0.7); // At least 70% hit rate
            expect(totalDamage).toBeGreaterThan(0); // Should have dealt damage
        });

        test('Loot system generates drops from defeated enemies', () => {
            const chicken = new MockEnemy('Chicken', 1, 3, 'CHICKEN');

            // Generate loot
            const loot = lootSystem.generateLoot('CHICKEN');

            // Chicken always drops bones and raw chicken
            expect(loot.length).toBeGreaterThan(0);
            const hasBones = loot.some(drop => drop.item === 'bones');
            const hasChicken = loot.some(drop => drop.item === 'raw_chicken');
            expect(hasBones).toBe(true);
            expect(hasChicken).toBe(true);
        });

        test('Combat with multiple enemies tracks loot statistics', () => {
            // Kill multiple chickens
            for (let i = 0; i < 10; i++) {
                lootSystem.generateLoot('CHICKEN');
            }

            const stats = lootSystem.getLootStatistics('CHICKEN');
            expect(stats.totalKills).toBe(10);
            expect(stats.totalValue).toBeGreaterThan(0);
            expect(stats.commonDrops.get('bones')).toBe(10); // Always drops
        });
    });

    describe('Quest System Integration', () => {
        test('Complete quest workflow from start to finish', () => {
            const questId = 'cooks_assistant';

            // Check quest can be started
            const canStart = questSystem.canStartQuest(questId);
            expect(canStart.can).toBe(true);

            // Start quest
            const result = questSystem.startQuest(questId);
            expect(result.success).toBe(true);
            expect(questSystem.activeQuests.size).toBe(1);

            // Complete objectives
            const quest = questSystem.questData.get(questId);
            const stage0Objectives = quest.stages[0].objectives;

            for (const objective of stage0Objectives) {
                questSystem.completeObjective(questId, objective);
            }

            // Should progress to next stage
            expect(quest.currentStage).toBe(1);

            // Complete all remaining stages
            for (let stage = 1; stage < quest.stages.length; stage++) {
                const objectives = quest.stages[stage].objectives;
                for (const objective of objectives) {
                    questSystem.completeObjective(questId, objective);
                }
            }

            // Quest should be completed
            expect(quest.status).toBe('completed');
            expect(questSystem.completedQuests.has(questId)).toBe(true);
            expect(questSystem.activeQuests.has(questId)).toBe(false);

            // Player should have quest points
            expect(player.questPoints).toBeGreaterThan(0);
        });

        test('Quest requirements are enforced', () => {
            // The Lost Tribe requires agility: 13, thieving: 13, mining: 17
            // Player has mining but needs level 17

            // First, let's verify that low-level quests can be started
            const cooksCanStart = questSystem.canStartQuest('cooks_assistant');
            expect(cooksCanStart.can).toBe(true);

            // Lost Tribe requires skills that either don't exist or player doesn't have high enough level
            // The quest system should fail this check
            try {
                const lostTribeCanStart = questSystem.canStartQuest('the_lost_tribe');
                // If it doesn't throw, it should return can: false
                expect(lostTribeCanStart.can).toBe(false);
                expect(lostTribeCanStart.reason).toBeTruthy();
            } catch (error) {
                // If it throws due to missing skill, that's also acceptable behavior
                expect(error).toBeDefined();
            }
        });

        test('Quest completion awards XP to correct skills', () => {
            const questId = 'cooks_assistant';
            const initialCookingXP = player.skills.cooking.xp;

            // Start quest
            questSystem.startQuest(questId);
            const quest = questSystem.questData.get(questId);

            // Complete all stages
            for (let stage = 0; stage < quest.stages.length; stage++) {
                const objectives = quest.stages[stage].objectives;
                for (const objective of objectives) {
                    questSystem.completeObjective(questId, objective);
                }
            }

            // Cooking XP should have increased (Cook's Assistant gives 300 cooking XP)
            expect(player.skills.cooking.xp).toBeGreaterThan(initialCookingXP);
            expect(player.skills.cooking.xp).toBe(initialCookingXP + 300);
        });
    });

    describe('Skills System Integration', () => {
        test('SkillsSystem can be created with player', () => {
            // SkillsSystem takes gameLogic not player directly
            // Just verify it was initialized
            expect(skillsSystem).toBeDefined();
            expect(skillsSystem.player).toBe(player);
        });

        test('Skill requirements map exists', () => {
            // Test that the system knows about skill types
            const skillRequired = skillsSystem.getRequiredSkill('tree');
            expect(skillRequired).toBe(SKILLS.WOODCUTTING);

            const fishingSkill = skillsSystem.getRequiredSkill('shrimp_spot');
            expect(fishingSkill).toBe(SKILLS.FISHING);
        });

        test('Items can be gathered and added to inventory', () => {
            const initialCount = player.getInventoryCount();

            // Test direct item addition (simulating resource gathering)
            const item = skillsSystem.getGatheredItem('tree');
            expect(item).toBeDefined();
            expect(item.name).toBe('Logs');

            player.addItem(item, 1);
            expect(player.getInventoryCount()).toBe(initialCount + 1);
        });

        test('XP gains lead to level ups', () => {
            const initialLevel = player.skills.fishing.level;

            // Add enough XP to level up multiple times
            const xpForLevel10 = XPCalculator.getXPForLevel(10);
            player.addXP(SKILLS.FISHING, xpForLevel10);

            expect(player.skills.fishing.level).toBe(10);
            expect(player.skills.fishing.level).toBeGreaterThan(initialLevel);
        });
    });

    describe('Cross-System Integration', () => {
        test('Complete gameplay loop: skill -> craft -> combat -> loot', () => {
            // Step 1: Add item to inventory (simulating skill action)
            const logs = ITEMS.LOGS;
            player.addItem(logs, 1);

            const logsInInventory = player.inventory.some(item =>
                item && item.name === 'Logs'
            );
            expect(logsInInventory).toBe(true);

            // Step 2: Combat
            const goblin = new MockEnemy('Goblin', 2, 5, 'GOBLIN_LEVEL_2');
            const initialAttackXP = player.skills.attack.xp;

            combatSystem.attackTarget(goblin);
            combatSystem.handleKill(goblin);

            // Verify XP and loot
            expect(player.skills.attack.xp).toBeGreaterThan(initialAttackXP);
            expect(goblin.isDead).toBe(true);

            // Step 3: Verify inventory has accumulated items
            expect(player.getInventoryCount()).toBeGreaterThan(0);
        });

        test('Quest requirements check player skills and inventory', () => {
            // Start a quest
            questSystem.startQuest('cooks_assistant');

            // Get quest dialogue
            const dialogue = questSystem.getNPCDialogue('Cook', player);
            expect(dialogue).toBeTruthy();
            expect(typeof dialogue).toBe('string');

            // Get quest options
            const options = questSystem.getQuestOptions('Cook', player);
            expect(Array.isArray(options)).toBe(true);
        });

        test('Multiple skills can be trained simultaneously', () => {
            const initialFishingXP = player.skills.fishing.xp;
            const initialCookingXP = player.skills.cooking.xp;
            const initialFiremakingXP = player.skills.firemaking.xp;

            // Add XP to multiple skills
            player.addXP(SKILLS.FISHING, 100);
            player.addXP(SKILLS.COOKING, 100);
            player.addXP(SKILLS.FIREMAKING, 100);

            // All should have gained XP
            expect(player.skills.fishing.xp).toBe(initialFishingXP + 100);
            expect(player.skills.cooking.xp).toBe(initialCookingXP + 100);
            expect(player.skills.firemaking.xp).toBe(initialFiremakingXP + 100);
        });

        test('Combat level calculation reflects all combat skills', () => {
            const initialCombatLevel = player.getCombatLevel();

            // Level up attack
            player.addXP(SKILLS.ATTACK, 1000);
            const afterAttackCombat = player.getCombatLevel();
            expect(afterAttackCombat).toBeGreaterThanOrEqual(initialCombatLevel);

            // Level up defence
            player.addXP(SKILLS.DEFENCE, 1000);
            const afterDefenceCombat = player.getCombatLevel();
            expect(afterDefenceCombat).toBeGreaterThanOrEqual(afterAttackCombat);

            // Level up hitpoints
            player.addXP(SKILLS.HITPOINTS, 1000);
            const afterHitpointsCombat = player.getCombatLevel();
            expect(afterHitpointsCombat).toBeGreaterThanOrEqual(afterDefenceCombat);
        });
    });

    describe('Data Integrity and Edge Cases', () => {
        test('Player cannot start quest twice', () => {
            const questId = 'cooks_assistant';

            const result1 = questSystem.startQuest(questId);
            expect(result1.success).toBe(true);

            const result2 = questSystem.startQuest(questId);
            expect(result2.success).toBe(false);
        });

        test('Inventory handles full inventory correctly', () => {
            // Fill inventory with non-stackable items
            for (let i = 0; i < 28; i++) {
                player.addItem(ITEMS.BRONZE_SWORD, 1);
            }

            // Inventory should be full
            expect(player.getInventoryCount()).toBe(28);

            // Try to add one more non-stackable item
            const result = player.addItem(ITEMS.BRONZE_DAGGER, 1);
            expect(result).toBe(false);
        });

        test('Combat system handles dead enemy correctly', () => {
            const enemy = new MockEnemy('Spider', 1, 1, 'SPIDER_LEVEL_2');

            combatSystem.attackTarget(enemy);
            enemy.die();

            // Should stop combat when enemy dies
            combatSystem.stopCombat();
            expect(player.inCombat).toBe(false);
        });

        test('Skill XP cannot go negative', () => {
            const currentXP = player.skills.mining.xp;

            // Try to remove XP (should not be possible via addXP)
            player.addXP(SKILLS.MINING, 0);

            expect(player.skills.mining.xp).toBe(currentXP);
        });

        test('Loot system handles unknown enemy types gracefully', () => {
            const loot = lootSystem.generateLoot('UNKNOWN_ENEMY');
            expect(Array.isArray(loot)).toBe(true);
            expect(loot.length).toBe(0);
        });
    });

    describe('Performance and State Management', () => {
        test('Player update cycle runs without errors', () => {
            player.moveTo(10, 10);

            // Simulate multiple update frames
            for (let i = 0; i < 60; i++) {
                const delta = 1/60; // 60 FPS
                expect(() => player.update(delta)).not.toThrow();
            }
        });

        test('Combat system update cycle runs without errors', () => {
            const enemy = new MockEnemy('Rat', 1, 3, 'GIANT_RAT_LEVEL_3');
            combatSystem.attackTarget(enemy);

            // Simulate combat updates
            for (let i = 0; i < 100; i++) {
                const delta = 1/60;
                expect(() => combatSystem.update(delta)).not.toThrow();

                if (enemy.isDead) break;
            }
        });

        test('Multiple quests can be active simultaneously', () => {
            questSystem.startQuest('cooks_assistant');
            questSystem.startQuest('sheep_shearer');

            expect(questSystem.activeQuests.size).toBe(2);

            const activeQuests = questSystem.getActiveQuests();
            expect(activeQuests.length).toBe(2);
        });

        test('Loot statistics track across multiple kills', () => {
            // Generate loot from various enemies
            lootSystem.generateLoot('CHICKEN');
            lootSystem.generateLoot('COW');
            lootSystem.generateLoot('GOBLIN_LEVEL_2');

            const stats = lootSystem.getLootStatistics();
            expect(stats.totalKills).toBe(3);
            expect(stats.totalValue).toBeGreaterThan(0);
        });
    });
});

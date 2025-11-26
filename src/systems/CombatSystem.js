/**
 * CombatSystem - RuneScape-style combat mechanics
 */

import { ATTACK_COOLDOWN, COMBAT_RANGE, SKILLS, ITEMS } from '../utils/Constants.js';
import { XPCalculator } from '../utils/XPCalculator.js';

export class CombatSystem {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player;
        this.combatQueue = [];
        this.attackTimer = 0;
    }

    /**
     * Initiate combat with target
     */
    attackTarget(target) {
        if (!target || target.isDead) return;

        this.player.target = target;
        this.player.inCombat = true;
        target.inCombat = true;

        this.gameLogic.ui.addMessage(`You are now in combat with ${target.name}!`, 'game');
    }

    /**
     * Stop combat
     */
    stopCombat() {
        if (this.player.target) {
            this.player.target.inCombat = false;
        }
        this.player.inCombat = false;
        this.player.target = null;
        this.attackTimer = 0;
    }

    /**
     * Calculate hit damage
     */
    calculateHit(attacker, defender) {
        const attackLevel = attacker.skills ? attacker.skills.attack.level : attacker.level;
        const strengthLevel = attacker.skills ? attacker.skills.strength.level : attacker.level;
        const defenceLevel = defender.skills ? defender.skills.defence.level : defender.level;

        const attackBonus = attacker.equipmentBonuses ? attacker.equipmentBonuses.attack : 0;
        const defenceBonus = defender.equipmentBonuses ? defender.equipmentBonuses.defence : 0;

        // Calculate accuracy
        const accuracy = XPCalculator.calculateAccuracy(
            attackLevel,
            attackBonus,
            defenceLevel,
            defenceBonus
        );

        // Check if hit lands
        if (Math.random() > accuracy) {
            return 0; // Miss
        }

        // Calculate max hit
        const strengthBonus = attacker.equipmentBonuses ? attacker.equipmentBonuses.strength : 0;
        const maxHit = XPCalculator.calculateMaxHit(strengthLevel, strengthBonus);

        // Random damage between 0 and max hit
        return Math.floor(Math.random() * (maxHit + 1));
    }

    /**
     * Perform attack
     */
    performAttack() {
        if (!this.player.target || this.player.target.isDead) {
            this.stopCombat();
            return;
        }

        const target = this.player.target;
        const distance = this.player.position.distanceTo(target.position);

        // Check if target is in range
        if (distance > COMBAT_RANGE) {
            // Move closer
            this.player.moveTo(target.position.x, target.position.z);
            return;
        }

        // Calculate damage
        const damage = this.calculateHit(this.player, target);

        if (damage === 0) {
            this.gameLogic.ui.addMessage('You missed!', 'game');
        } else {
            // Deal damage
            const killed = target.takeDamage(damage);

            this.gameLogic.ui.addMessage(
                `You hit ${target.name} for ${damage} damage!`,
                'game'
            );

            // Create damage splash
            this.gameLogic.createDamageSplash(target.position, damage);

            if (killed) {
                this.handleKill(target);
            }
        }

        // Reset attack timer
        this.attackTimer = ATTACK_COOLDOWN;
    }

    /**
     * Handle enemy kill
     */
    handleKill(enemy) {
        // Award XP
        const xpGained = enemy.xpReward;

        // Split XP between attack, strength, defence, and hitpoints
        const xpPerSkill = Math.floor(xpGained / 3);

        this.player.addXP(SKILLS.ATTACK, xpPerSkill);
        this.player.addXP(SKILLS.STRENGTH, xpPerSkill);
        this.player.addXP(SKILLS.DEFENCE, xpPerSkill);
        this.player.addXP(SKILLS.HITPOINTS, Math.floor(xpPerSkill / 3));

        // Mark enemy as dead
        enemy.die();

        // Generate loot using the LootSystem
        const loot = this.gameLogic.lootSystem
            ? this.gameLogic.lootSystem.generateLoot(enemy.enemyId || enemy.type)
            : [];

        this.gameLogic.ui.addMessage(
            `You defeated ${enemy.name}! You gain ${xpGained} XP.`,
            'game'
        );

        // Add loot to inventory
        if (loot.length > 0) {
            for (const drop of loot) {
                // Convert item name to item object
                const itemKey = drop.item.toUpperCase().replace(/ /g, '_');
                const itemObj = ITEMS[itemKey];

                if (itemObj) {
                    const added = this.player.addItem(itemObj, drop.quantity);
                    if (added) {
                        this.gameLogic.ui.addMessage(
                            `You receive ${drop.quantity}x ${itemObj.name}.`,
                            'game'
                        );
                    }
                } else {
                    console.warn(`Unknown item: ${drop.item}`);
                }
            }
            this.gameLogic.ui.updateInventory();
        }

        // Stop combat
        this.stopCombat();

        // Update UI
        this.gameLogic.ui.updateStats();
    }

    /**
     * Update combat system (called every frame)
     */
    update(delta) {
        // Combat tick
        if (this.player.inCombat && this.player.target) {
            this.attackTimer -= delta;

            if (this.attackTimer <= 0) {
                this.performAttack();
            }
        }
    }
}

export default CombatSystem;

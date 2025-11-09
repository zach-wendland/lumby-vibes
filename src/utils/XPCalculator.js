/**
 * XP Calculator - RuneScape experience system
 */

import { XP_TABLE } from './Constants.js';

export class XPCalculator {
    /**
     * Get level from XP
     */
    static getLevelFromXP(xp) {
        for (let level = 1; level <= 99; level++) {
            if (xp < XP_TABLE[level]) {
                return level;
            }
        }
        return 99;
    }

    /**
     * Get XP required for level
     */
    static getXPForLevel(level) {
        if (level < 1) return 0;
        if (level > 99) return XP_TABLE[99];
        return XP_TABLE[level];
    }

    /**
     * Get XP remaining to next level
     */
    static getXPToNextLevel(xp) {
        const currentLevel = this.getLevelFromXP(xp);
        if (currentLevel >= 99) return 0;
        return XP_TABLE[currentLevel + 1] - xp;
    }

    /**
     * Get progress to next level (0-1)
     */
    static getProgressToNextLevel(xp) {
        const currentLevel = this.getLevelFromXP(xp);
        if (currentLevel >= 99) return 1;

        const currentLevelXP = XP_TABLE[currentLevel];
        const nextLevelXP = XP_TABLE[currentLevel + 1];
        const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);

        return Math.max(0, Math.min(1, progress));
    }

    /**
     * Calculate combat level (RuneScape formula)
     */
    static calculateCombatLevel(skills) {
        const base = 0.25 * (skills.defence + skills.hitpoints + Math.floor(skills.prayer / 2));
        const melee = 0.325 * (skills.attack + skills.strength);
        const range = 0.325 * (Math.floor(skills.ranged * 1.5));
        const mage = 0.325 * (Math.floor(skills.magic * 1.5));

        return Math.floor(base + Math.max(melee, range, mage));
    }

    /**
     * Calculate max hit based on strength level and bonuses
     */
    static calculateMaxHit(strengthLevel, strengthBonus = 0) {
        const effectiveStrength = strengthLevel + strengthBonus;
        return Math.floor(0.5 + effectiveStrength * (strengthBonus + 64) / 640);
    }

    /**
     * Calculate accuracy (chance to hit)
     */
    static calculateAccuracy(attackLevel, attackBonus, defenceLevel, defenceBonus) {
        const attackRoll = attackLevel * (attackBonus + 64);
        const defenceRoll = defenceLevel * (defenceBonus + 64);

        if (attackRoll > defenceRoll) {
            return 1 - (defenceRoll + 2) / (2 * (attackRoll + 1));
        } else {
            return attackRoll / (2 * (defenceRoll + 1));
        }
    }
}

export default XPCalculator;

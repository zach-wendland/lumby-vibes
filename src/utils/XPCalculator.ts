/**
 * XP Calculator - RuneScape experience system
 * TypeScript implementation with type safety
 */

import { XP_TABLE } from './Constants.js';

export interface PlayerSkills {
    attack: number;
    strength: number;
    defence: number;
    hitpoints: number;
    ranged: number;
    prayer: number;
    magic: number;
    [key: string]: number; // Allow for additional skills
}

export class XPCalculator {
    /**
     * Get level from XP
     * @param xp - Experience points
     * @returns Level (1-99)
     */
    static getLevelFromXP(xp: number): number {
        for (let level = 1; level <= 99; level++) {
            if (xp < XP_TABLE[level]) {
                return level;
            }
        }
        return 99;
    }

    /**
     * Get XP required for level
     * @param level - Target level (1-99)
     * @returns Experience points required
     */
    static getXPForLevel(level: number): number {
        if (level < 1) return 0;
        if (level > 99) return XP_TABLE[98]; // Level 99 is at index 98
        return XP_TABLE[level - 1]; // XP_TABLE is 0-indexed, levels are 1-indexed
    }

    /**
     * Get XP remaining to next level
     * @param xp - Current experience points
     * @returns XP needed for next level
     */
    static getXPToNextLevel(xp: number): number {
        const currentLevel = this.getLevelFromXP(xp);
        if (currentLevel >= 99) return 0;
        return XP_TABLE[currentLevel] - xp; // Next level is at index currentLevel
    }

    /**
     * Get progress to next level (0-1)
     * @param xp - Current experience points
     * @returns Progress percentage (0-1)
     */
    static getProgressToNextLevel(xp: number): number {
        const currentLevel = this.getLevelFromXP(xp);
        if (currentLevel >= 99) return 1;

        const currentLevelXP = XP_TABLE[currentLevel - 1]; // Current level XP
        const nextLevelXP = XP_TABLE[currentLevel]; // Next level XP
        const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);

        return Math.max(0, Math.min(1, progress));
    }

    /**
     * Calculate combat level (RuneScape formula)
     * @param skills - Player skill levels
     * @returns Combat level
     */
    static calculateCombatLevel(skills: PlayerSkills): number {
        const base = 0.25 * (skills.defence + skills.hitpoints + Math.floor(skills.prayer / 2));
        const melee = 0.325 * (skills.attack + skills.strength);
        const range = 0.325 * (Math.floor(skills.ranged * 1.5));
        const mage = 0.325 * (Math.floor(skills.magic * 1.5));

        return Math.floor(base + Math.max(melee, range, mage));
    }

    /**
     * Calculate max hit based on strength level and bonuses
     * @param strengthLevel - Strength skill level
     * @param strengthBonus - Equipment strength bonus (default: 0)
     * @returns Maximum hit damage
     */
    static calculateMaxHit(strengthLevel: number, strengthBonus: number = 0): number {
        const effectiveStrength = strengthLevel + strengthBonus;
        return Math.floor(0.5 + effectiveStrength * (strengthBonus + 64) / 640);
    }

    /**
     * Calculate accuracy (chance to hit)
     * @param attackLevel - Attacker's attack level
     * @param attackBonus - Attacker's attack bonus
     * @param defenceLevel - Defender's defence level
     * @param defenceBonus - Defender's defence bonus
     * @returns Hit chance (0-1)
     */
    static calculateAccuracy(
        attackLevel: number,
        attackBonus: number,
        defenceLevel: number,
        defenceBonus: number
    ): number {
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

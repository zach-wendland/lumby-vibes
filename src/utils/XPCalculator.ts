/**
 * XP Calculator - RuneScape experience system
 * TypeScript version with full type safety
 */

import { XP_TABLE } from './Constants';

/**
 * Skills interface for combat level calculation
 */
interface CombatSkills {
    attack: number;
    strength: number;
    defence: number;
    hitpoints: number;
    ranged: number;
    prayer: number;
    magic: number;
}

/**
 * XP Calculator class for OSRS experience calculations
 */
export class XPCalculator {
    /** Maximum level in OSRS */
    static readonly MAX_LEVEL: number = 99;

    /** Minimum level in OSRS */
    static readonly MIN_LEVEL: number = 1;

    /**
     * Get level from XP
     * @param xp - Current experience points
     * @returns Level corresponding to the XP amount (1-99)
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
     * Get XP required for a specific level
     * @param level - Target level (1-99)
     * @returns XP required to reach that level
     * @note XP_TABLE is 0-indexed, levels are 1-indexed
     */
    static getXPForLevel(level: number): number {
        if (level < 1) return 0;
        if (level > 99) return XP_TABLE[98]; // Level 99 is at index 98
        return XP_TABLE[level - 1]; // XP_TABLE is 0-indexed, levels are 1-indexed
    }

    /**
     * Get XP remaining to reach next level
     * @param xp - Current experience points
     * @returns XP needed to reach the next level, 0 if at max level
     */
    static getXPToNextLevel(xp: number): number {
        const currentLevel = this.getLevelFromXP(xp);
        if (currentLevel >= 99) return 0;
        return XP_TABLE[currentLevel] - xp; // Next level is at index currentLevel
    }

    /**
     * Get progress to next level as a percentage
     * @param xp - Current experience points
     * @returns Progress from 0 to 1, 1 if at max level
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
     * Calculate combat level using OSRS formula
     * @param skills - Object containing combat skill levels
     * @returns Combat level (3-126)
     */
    static calculateCombatLevel(skills: CombatSkills): number {
        const base = 0.25 * (skills.defence + skills.hitpoints + Math.floor(skills.prayer / 2));
        const melee = 0.325 * (skills.attack + skills.strength);
        const range = 0.325 * (Math.floor(skills.ranged * 1.5));
        const mage = 0.325 * (Math.floor(skills.magic * 1.5));

        return Math.floor(base + Math.max(melee, range, mage));
    }

    /**
     * Calculate max hit based on strength level and bonuses
     * Uses OSRS max hit formula
     * @param strengthLevel - Current strength level
     * @param strengthBonus - Equipment strength bonus (default 0)
     * @returns Maximum damage that can be dealt
     */
    static calculateMaxHit(strengthLevel: number, strengthBonus: number = 0): number {
        const effectiveStrength = strengthLevel + strengthBonus;
        return Math.floor(0.5 + effectiveStrength * (strengthBonus + 64) / 640);
    }

    /**
     * Calculate accuracy (chance to hit) using OSRS formula
     * @param attackLevel - Attacker's attack level
     * @param attackBonus - Attacker's attack bonus from equipment
     * @param defenceLevel - Defender's defence level
     * @param defenceBonus - Defender's defence bonus from equipment
     * @returns Probability of hitting (0 to 1)
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

    /**
     * Calculate XP gained from dealing damage
     * @param damage - Damage dealt
     * @param style - Combat style ('attack', 'strength', 'defence', or 'controlled')
     * @returns Object containing XP gained for each skill
     */
    static calculateCombatXP(
        damage: number,
        style: 'attack' | 'strength' | 'defence' | 'controlled' = 'attack'
    ): Partial<CombatSkills> {
        const hitpointsXP = damage * 1.33;
        const combatXP = damage * 4;

        switch (style) {
            case 'attack':
                return { attack: combatXP, hitpoints: hitpointsXP };
            case 'strength':
                return { strength: combatXP, hitpoints: hitpointsXP };
            case 'defence':
                return { defence: combatXP, hitpoints: hitpointsXP };
            case 'controlled':
                const sharedXP = combatXP / 3;
                return {
                    attack: sharedXP,
                    strength: sharedXP,
                    defence: sharedXP,
                    hitpoints: hitpointsXP
                };
            default:
                return { hitpoints: hitpointsXP };
        }
    }

    /**
     * Get total XP for virtual level (beyond 99)
     * @param level - Virtual level (1-126)
     * @returns XP required for that level
     */
    static getXPForVirtualLevel(level: number): number {
        if (level <= 99) {
            return this.getXPForLevel(level);
        }
        // Formula for levels beyond 99
        return Math.floor(
            (1 / 4) * Math.floor(level - 1 + 300 * Math.pow(2, (level - 1) / 7))
        );
    }
}

export default XPCalculator;

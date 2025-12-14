/**
 * SaveSystem - Handles saving and loading game state to localStorage
 */

import type { Player } from '../entities/Player';
import type { TutorialProgress } from './TutorialSystem';
import type { SkillName, OSRSItem, EquipmentSlot } from '../types/index';

/**
 * Saved skill data
 */
interface SavedSkill {
    level: number;
    xp: number;
}

/**
 * Saved inventory slot
 */
interface SavedInventorySlot {
    itemId: number;
    count: number;
}

/**
 * Saved equipment slot
 */
interface SavedEquipmentSlot {
    itemId: number;
}

/**
 * Complete save data structure
 */
export interface SaveData {
    version: number;
    timestamp: number;
    player: {
        skills: Record<SkillName, SavedSkill>;
        currentHP: number;
        currentPrayer: number;
        inventory: (SavedInventorySlot | null)[];
        equipment: Partial<Record<EquipmentSlot, SavedEquipmentSlot | null>>;
        position: { x: number; z: number };
    };
    quests: Record<string, number>; // questId -> stage
    tutorial: TutorialProgress;
}

const SAVE_KEY = 'lumbridge_save';
const SAVE_VERSION = 1;

/**
 * SaveSystem class - Manages game persistence
 */
export class SaveSystem {
    /**
     * Check if a save exists
     */
    static hasSave(): boolean {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    /**
     * Save the current game state
     */
    static save(
        player: Player,
        questProgress: Record<string, number>,
        tutorialProgress: TutorialProgress
    ): boolean {
        try {
            const saveData: SaveData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                player: {
                    skills: { ...player.skills } as Record<SkillName, SavedSkill>,
                    currentHP: player.currentHP,
                    currentPrayer: player.currentPrayer,
                    inventory: player.inventory.map(item => {
                        if (item) {
                            return {
                                itemId: item.id,
                                count: item.count
                            };
                        }
                        return null;
                    }),
                    equipment: Object.fromEntries(
                        Object.entries(player.equipment).map(([slot, item]) => [
                            slot,
                            item ? { itemId: item.id } : null
                        ])
                    ) as Partial<Record<EquipmentSlot, SavedEquipmentSlot | null>>,
                    position: {
                        x: player.position.x,
                        z: player.position.z
                    }
                },
                quests: questProgress,
                tutorial: tutorialProgress
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load saved game state
     */
    static load(): SaveData | null {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (!saved) return null;

            const data = JSON.parse(saved) as SaveData;

            // Version check - could add migration logic here
            if (data.version !== SAVE_VERSION) {
                console.warn(`Save version mismatch: ${data.version} vs ${SAVE_VERSION}`);
                // For now, still try to load
            }

            return data;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    /**
     * Delete saved game
     */
    static deleteSave(): void {
        localStorage.removeItem(SAVE_KEY);
        console.log('Save deleted');
    }

    /**
     * Get save timestamp as formatted string
     */
    static getSaveTime(): string | null {
        const data = this.load();
        if (!data) return null;

        const date = new Date(data.timestamp);
        return date.toLocaleString();
    }

    /**
     * Apply loaded data to player
     */
    static applyToPlayer(
        player: Player,
        saveData: SaveData,
        itemLookup: Record<number, OSRSItem>
    ): void {
        // Restore skills
        for (const [skillName, skillData] of Object.entries(saveData.player.skills)) {
            if (player.skills[skillName as SkillName]) {
                player.skills[skillName as SkillName].level = skillData.level;
                player.skills[skillName as SkillName].xp = skillData.xp;
            }
        }

        // Restore HP and Prayer
        player.currentHP = saveData.player.currentHP;
        player.currentPrayer = saveData.player.currentPrayer;

        // Restore position
        player.position.x = saveData.player.position.x;
        player.position.z = saveData.player.position.z;

        // Clear and restore inventory
        player.inventory = new Array(28).fill(null);
        for (let i = 0; i < saveData.player.inventory.length; i++) {
            const slot = saveData.player.inventory[i];
            if (slot) {
                const item = itemLookup[slot.itemId];
                if (item) {
                    // Create inventory item with count (InventoryItem extends OSRSItem)
                    player.inventory[i] = { ...item, count: slot.count };
                }
            }
        }

        // Clear and restore equipment
        const equipmentSlots = Object.keys(player.equipment) as EquipmentSlot[];
        for (const slot of equipmentSlots) {
            player.equipment[slot] = null;
        }
        for (const [slot, equip] of Object.entries(saveData.player.equipment)) {
            if (equip) {
                const item = itemLookup[equip.itemId];
                if (item) {
                    player.equipment[slot as EquipmentSlot] = item;
                }
            }
        }
    }
}

export default SaveSystem;

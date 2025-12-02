/**
 * SkillsSystem - Mining, Woodcutting, Fishing, etc.
 * TypeScript version with full type safety
 */

import { SKILLS, ITEMS } from '../utils/Constants';
import type { Player } from '../entities/Player';
import type { SkillName, OSRSItem } from '../types/index';

/**
 * Resource node interface
 */
interface Resource {
    name: string;
    type: string;
    levelRequired: number;
    xpReward: number;
    hp: number;
    depleted: boolean;
    respawnTimer: number;
    deplete(): void;
    respawn(): void;
}

/**
 * UI Manager interface
 */
interface UIManager {
    addMessage(message: string, type?: string): void;
    updateStats(): void;
    updateInventory(): void;
}

/**
 * Game Logic interface
 */
interface GameLogic {
    player: Player;
    ui: UIManager;
}

/**
 * Resource type to skill mapping
 */
const SKILL_MAP: Record<string, SkillName> = {
    'tree': 'woodcutting',
    'normal_tree': 'woodcutting',
    'oak_tree': 'woodcutting',
    'willow_tree': 'woodcutting',
    'copper_rock': 'mining',
    'tin_rock': 'mining',
    'iron_rock': 'mining',
    'fishing_spot': 'fishing',
    'shrimp_spot': 'fishing'
};

/**
 * Resource type to item mapping
 */
const ITEM_MAP: Record<string, OSRSItem> = {
    'tree': ITEMS.LOGS,
    'normal_tree': ITEMS.LOGS,
    'oak_tree': ITEMS.LOGS,
    'willow_tree': ITEMS.LOGS,
    'copper_rock': ITEMS.COPPER_ORE,
    'tin_rock': ITEMS.TIN_ORE,
    'fishing_spot': ITEMS.RAW_SHRIMPS,
    'shrimp_spot': ITEMS.RAW_SHRIMPS
};

/**
 * SkillsSystem class - Handles gathering skills
 */
export class SkillsSystem {
    private gameLogic: GameLogic;
    private player: Player;
    private resources: Resource[];

    constructor(gameLogic: GameLogic) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player;
        this.resources = [];
    }

    /**
     * Add resource node to world
     */
    addResource(resource: Resource): void {
        this.resources.push(resource);
    }

    /**
     * Remove resource from world
     */
    removeResource(resource: Resource): void {
        const index = this.resources.indexOf(resource);
        if (index > -1) {
            this.resources.splice(index, 1);
        }
    }

    /**
     * Gather from resource (Mining, Woodcutting, Fishing)
     */
    gatherResource(resource: Resource): void {
        if (!resource || resource.depleted) return;

        const skillRequired = this.getRequiredSkill(resource.type);
        if (!skillRequired) return;

        const playerLevel = this.player.skills[skillRequired].level;

        // Check if player has required level
        if (playerLevel < resource.levelRequired) {
            this.gameLogic.ui.addMessage(
                `You need ${resource.levelRequired} ${skillRequired} to gather this resource.`,
                'game'
            );
            return;
        }

        // Calculate success chance based on level
        const successChance = Math.min(0.9, 0.1 + (playerLevel - resource.levelRequired) * 0.05);

        if (Math.random() < successChance) {
            // Success!
            resource.hp--;

            // Determine what item was gathered
            const item = this.getGatheredItem(resource.type);
            const xpGained = resource.xpReward;

            if (item) {
                const added = this.player.addItem(item, 1);
                if (added) {
                    this.gameLogic.ui.addMessage(
                        `You gather ${item.name}. (+${xpGained} ${skillRequired} XP)`,
                        'game'
                    );
                } else {
                    this.gameLogic.ui.addMessage(
                        `Your inventory is full!`,
                        'game'
                    );
                }
            }

            // Award XP
            this.player.addXP(skillRequired, xpGained);
            this.gameLogic.ui.updateStats();
            this.gameLogic.ui.updateInventory();

            // Check if resource is depleted
            if (resource.hp <= 0) {
                resource.deplete();
            }
        } else {
            this.gameLogic.ui.addMessage(
                `You attempt to gather from the ${resource.name}...`,
                'game'
            );
        }
    }

    /**
     * Get required skill for resource type
     */
    getRequiredSkill(resourceType: string): SkillName | undefined {
        return SKILL_MAP[resourceType];
    }

    /**
     * Get item gathered from resource
     */
    getGatheredItem(resourceType: string): OSRSItem | undefined {
        return ITEM_MAP[resourceType];
    }

    /**
     * Check if player can gather resource
     */
    canGather(resource: Resource): boolean {
        if (resource.depleted) return false;

        const skillRequired = this.getRequiredSkill(resource.type);
        if (!skillRequired) return false;

        const playerLevel = this.player.skills[skillRequired].level;
        return playerLevel >= resource.levelRequired;
    }

    /**
     * Get all resources of a type
     */
    getResourcesByType(type: string): Resource[] {
        return this.resources.filter(r => r.type === type);
    }

    /**
     * Get nearby resources
     */
    getNearbyResources(x: number, z: number, radius: number): Resource[] {
        return this.resources.filter(r => {
            // Would need position on resource, simplified here
            return !r.depleted;
        });
    }

    /**
     * Update skills system (called every frame)
     */
    update(delta: number): void {
        // Update resource respawn timers
        for (const resource of this.resources) {
            if (resource.depleted) {
                resource.respawnTimer -= delta;
                if (resource.respawnTimer <= 0) {
                    resource.respawn();
                }
            }
        }
    }

    /**
     * Get all resources
     */
    getAllResources(): Resource[] {
        return this.resources;
    }

    /**
     * Clear all resources
     */
    clearResources(): void {
        this.resources = [];
    }

    /**
     * Dispose of resources and clean up
     */
    dispose(): void {
        // Clear all resource references
        this.clearResources();
    }
}

export default SkillsSystem;

/**
 * SkillsSystem - Mining, Woodcutting, Fishing, etc.
 */

import { SKILLS, ITEMS } from '../utils/Constants.js';

export class SkillsSystem {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player;

        // Resources in the world
        this.resources = [];
    }

    /**
     * Add resource node to world
     */
    addResource(resource) {
        this.resources.push(resource);
    }

    /**
     * Gather from resource (Mining, Woodcutting, Fishing)
     */
    gatherResource(resource) {
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
                        'Your inventory is full!',
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
    getRequiredSkill(resourceType) {
        const skillMap = {
            'tree': SKILLS.WOODCUTTING,
            'normal_tree': SKILLS.WOODCUTTING,
            'oak_tree': SKILLS.WOODCUTTING,
            'willow_tree': SKILLS.WOODCUTTING,
            'copper_rock': SKILLS.MINING,
            'tin_rock': SKILLS.MINING,
            'iron_rock': SKILLS.MINING,
            'fishing_spot': SKILLS.FISHING,
            'shrimp_spot': SKILLS.FISHING
        };

        return skillMap[resourceType];
    }

    /**
     * Get item gathered from resource
     */
    getGatheredItem(resourceType) {
        const itemMap = {
            'tree': ITEMS.LOGS,
            'normal_tree': ITEMS.LOGS,
            'oak_tree': ITEMS.LOGS,
            'willow_tree': ITEMS.LOGS,
            'copper_rock': ITEMS.COPPER_ORE,
            'tin_rock': ITEMS.TIN_ORE,
            'fishing_spot': ITEMS.RAW_SHRIMPS,
            'shrimp_spot': ITEMS.RAW_SHRIMPS
        };

        return itemMap[resourceType];
    }

    /**
     * Update skills system (called every frame)
     */
    update(delta) {
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
}

export default SkillsSystem;

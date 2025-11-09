/**
 * Complete Loot System with OSRS Drop Tables
 */

export const RARITY = {
    ALWAYS: 'always',
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    VERY_RARE: 'very_rare'
};

// Complete drop tables for all Lumbridge enemies
export const DROP_TABLES = {
    CHICKEN: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        raw_chicken: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        feathers: { rarity: RARITY.COMMON, quantity: [5, 15], chance: 0.5 }
    },

    COW: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        cowhide: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        raw_beef: { rarity: RARITY.COMMON, quantity: 1, chance: 0.8 }
    },

    GOBLIN_LEVEL_2: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        // Drop table 1
        coins: { rarity: RARITY.COMMON, quantity: [1, 18], chance: 0.65 },
        goblin_mail: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.15 },
        bronze_spear: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.10 },
        bronze_square_shield: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.08 },
        beer: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.05 },
        grapes: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.03 },
        // Rare drop table access
        rare_drop_table: { rarity: RARITY.VERY_RARE, chance: 0.001 }
    },

    GOBLIN_LEVEL_5: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        // Drop table 2 (better drops)
        coins: { rarity: RARITY.COMMON, quantity: [5, 25], chance: 0.70 },
        goblin_mail: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.18 },
        bronze_spear: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.12 },
        bronze_full_helm: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.10 },
        bronze_square_shield: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.10 },
        beer: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.06 },
        grapes: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.04 },
        chaos_rune: { rarity: RARITY.RARE, quantity: 1, chance: 0.02 },
        rare_drop_table: { rarity: RARITY.VERY_RARE, chance: 0.001 }
    },

    GIANT_RAT_LEVEL_3: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        raw_rat_meat: { rarity: RARITY.COMMON, quantity: 1, chance: 0.85 },
        coins: { rarity: RARITY.UNCOMMON, quantity: [1, 5], chance: 0.20 }
    },

    SPIDER_LEVEL_2: {
        bones: { rarity: RARITY.COMMON, quantity: 1, chance: 0.50 }
    },

    MAN_WOMAN_LEVEL_2: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        coins: { rarity: RARITY.COMMON, quantity: [1, 3], chance: 0.40 },
        bronze_dagger: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.08 },
        wooden_shield: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.05 },
        leather_boots: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.05 },
        leather_gloves: { rarity: RARITY.UNCOMMON, quantity: 1, chance: 0.05 }
    },

    SHEEP: {
        bones: { rarity: RARITY.ALWAYS, quantity: 1, chance: 1.0 },
        raw_mutton: { rarity: RARITY.COMMON, quantity: 1, chance: 0.50 },
        wool: { rarity: RARITY.COMMON, quantity: 1, chance: 0.30 } // If not sheared
    },

    // Rare drop table (accessed by various monsters)
    RARE_DROP_TABLE: {
        nature_rune: { rarity: RARITY.COMMON, quantity: [4, 67], chance: 0.25 },
        law_rune: { rarity: RARITY.COMMON, quantity: [2, 45], chance: 0.20 },
        death_rune: { rarity: RARITY.UNCOMMON, quantity: [2, 45], chance: 0.15 },
        rune_javelin: { rarity: RARITY.UNCOMMON, quantity: [1, 5], chance: 0.10 },
        rune_dagger: { rarity: RARITY.RARE, quantity: 1, chance: 0.05 },
        rune_2h_sword: { rarity: RARITY.RARE, quantity: 1, chance: 0.03 },
        dragon_med_helm: { rarity: RARITY.VERY_RARE, quantity: 1, chance: 0.002 },
        shield_left_half: { rarity: RARITY.VERY_RARE, quantity: 1, chance: 0.001 },
        dragon_spear: { rarity: RARITY.VERY_RARE, quantity: 1, chance: 0.001 }
    }
};

export class LootSystem {
    constructor() {
        this.lootHistory = [];
    }

    /**
     * Generate loot from enemy death
     */
    generateLoot(enemyType) {
        const dropTable = DROP_TABLES[enemyType];
        if (!dropTable) return [];

        const loot = [];

        for (const [itemName, dropData] of Object.entries(dropTable)) {
            // Special handling for rare drop table
            if (itemName === 'rare_drop_table') {
                if (Math.random() < dropData.chance) {
                    const rareLoot = this.rollRareDropTable();
                    loot.push(...rareLoot);
                }
                continue;
            }

            // Roll for drop
            if (Math.random() < dropData.chance) {
                let quantity;

                if (Array.isArray(dropData.quantity)) {
                    // Random quantity between min and max
                    const [min, max] = dropData.quantity;
                    quantity = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    quantity = dropData.quantity;
                }

                loot.push({
                    item: itemName,
                    quantity,
                    rarity: dropData.rarity,
                    noted: dropData.noted || false
                });
            }
        }

        this.lootHistory.push({
            enemyType,
            loot,
            timestamp: Date.now()
        });

        return loot;
    }

    /**
     * Roll on the rare drop table
     */
    rollRareDropTable() {
        const rareLoot = [];
        const rareTable = DROP_TABLES.RARE_DROP_TABLE;

        // Calculate total weight
        let totalWeight = 0;
        for (const dropData of Object.values(rareTable)) {
            totalWeight += dropData.chance;
        }

        // Roll random value
        let roll = Math.random() * totalWeight;

        // Determine drop
        for (const [itemName, dropData] of Object.entries(rareTable)) {
            roll -= dropData.chance;
            if (roll <= 0) {
                let quantity;
                if (Array.isArray(dropData.quantity)) {
                    const [min, max] = dropData.quantity;
                    quantity = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    quantity = dropData.quantity;
                }

                rareLoot.push({
                    item: itemName,
                    quantity,
                    rarity: dropData.rarity,
                    isRare: true
                });
                break;
            }
        }

        return rareLoot;
    }

    /**
     * Calculate total loot value
     */
    calculateLootValue(loot) {
        // Item values in GP (approximate OSRS prices)
        const ITEM_VALUES = {
            bones: 31,
            raw_chicken: 24,
            feathers: 3,
            cowhide: 150,
            raw_beef: 70,
            goblin_mail: 12,
            bronze_spear: 30,
            bronze_square_shield: 25,
            bronze_full_helm: 40,
            beer: 2,
            grapes: 15,
            chaos_rune: 100,
            raw_rat_meat: 5,
            wool: 60,
            raw_mutton: 40,
            bronze_dagger: 20,
            wooden_shield: 10,
            leather_boots: 20,
            leather_gloves: 15,
            // Rare items
            nature_rune: 200,
            law_rune: 180,
            death_rune: 250,
            rune_javelin: 500,
            rune_dagger: 5000,
            rune_2h_sword: 38000,
            dragon_med_helm: 59000,
            shield_left_half: 65000000,
            dragon_spear: 37000
        };

        let totalValue = 0;
        for (const drop of loot) {
            const itemValue = ITEM_VALUES[drop.item] || 0;
            totalValue += itemValue * drop.quantity;
        }

        return totalValue;
    }

    /**
     * Get loot statistics
     */
    getLootStatistics(enemyType = null) {
        let relevantLoot = this.lootHistory;

        if (enemyType) {
            relevantLoot = this.lootHistory.filter(l => l.enemyType === enemyType);
        }

        const stats = {
            totalKills: relevantLoot.length,
            totalValue: 0,
            commonDrops: new Map(),
            rareDrops: []
        };

        for (const lootDrop of relevantLoot) {
            const value = this.calculateLootValue(lootDrop.loot);
            stats.totalValue += value;

            for (const drop of lootDrop.loot) {
                const count = stats.commonDrops.get(drop.item) || 0;
                stats.commonDrops.set(drop.item, count + drop.quantity);

                if (drop.isRare || drop.rarity === RARITY.VERY_RARE) {
                    stats.rareDrops.push({
                        item: drop.item,
                        quantity: drop.quantity,
                        timestamp: lootDrop.timestamp
                    });
                }
            }
        }

        stats.averageValue = stats.totalKills > 0 ? stats.totalValue / stats.totalKills : 0;

        return stats;
    }

    /**
     * Format loot for display
     */
    formatLootMessage(loot) {
        if (loot.length === 0) return "Nothing was dropped.";

        const messages = [];
        for (const drop of loot) {
            const itemName = drop.item.replace(/_/g, ' ');
            const quantityText = drop.quantity > 1 ? ` (x${drop.quantity})` : '';
            const rareText = drop.isRare ? ' [RARE!]' : '';
            messages.push(`${itemName}${quantityText}${rareText}`);
        }

        return `Loot: ${messages.join(', ')}`;
    }
}

export default LootSystem;

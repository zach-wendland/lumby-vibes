/**
 * Loot System Type Definitions
 * Authentic OSRS drop mechanics
 */

import type { OSRSItem } from './index';

// ============ DROP RARITY TIERS ============

export type DropRarity = 'always' | 'common' | 'uncommon' | 'rare' | 'very_rare';

export interface DropChances {
    always: 1;
    common: number;  // 1/2 - 1/8
    uncommon: number; // 1/16 - 1/64
    rare: number;    // 1/128 - 1/512
    very_rare: number; // 1/1000+
}

// ============ LOOT DROP DEFINITIONS ============

export interface BaseDrop {
    item: string;
    chance: number;
    noted?: boolean;
}

export interface QuantityDrop extends BaseDrop {
    minQuantity: number;
    maxQuantity: number;
}

export type LootDropDefinition = BaseDrop | QuantityDrop;

// ============ LOOT TABLES ============

export interface EnemyLootTable {
    always?: LootDropDefinition[];
    main?: LootDropDefinition[];
    tertiary?: LootDropDefinition[];
    rdt?: boolean; // Access to Rare Drop Table
}

export interface RareDropTableEntry {
    item: string;
    chance: number;
    quantity?: number;
}

// Rare Drop Table (1/1000 chance to roll)
export const RARE_DROP_TABLE_CHANCE = 1 / 1000;

// ============ LOOT RESULT ============

export interface LootResult {
    item: OSRSItem;
    quantity: number;
    source: 'main' | 'tertiary' | 'rdt' | 'always';
}

// ============ DROP TABLE BY ENEMY ============

export interface EnemyDropTables {
    [enemyId: string]: EnemyLootTable;
}

// ============ LOOT GENERATION CONFIG ============

export interface LootGenerationConfig {
    enableRDT: boolean;
    dropRateModifier: number; // For future ring of wealth etc.
    notedDrops: boolean;
}

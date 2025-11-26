/**
 * OSRS Type Definitions
 * Following RuneScape's original design philosophy
 */

/**
 * Skill names in OSRS
 */
export type SkillName =
    | 'attack'
    | 'strength'
    | 'defence'
    | 'ranged'
    | 'prayer'
    | 'magic'
    | 'runecraft'
    | 'hitpoints'
    | 'crafting'
    | 'mining'
    | 'smithing'
    | 'fishing'
    | 'cooking'
    | 'firemaking'
    | 'woodcutting'
    | 'agility'
    | 'herblore'
    | 'thieving'
    | 'fletching'
    | 'slayer'
    | 'farming'
    | 'construction'
    | 'hunter';

/**
 * Combat stat names
 */
export type CombatStatName = 'attack' | 'strength' | 'defence' | 'ranged' | 'magic';

/**
 * Item in the OSRS world
 */
export interface OSRSItem {
    id: number;
    name: string;
    stackable: boolean;
    value: number; // GP value
    examine?: string;
    members?: boolean;
    tradeable?: boolean;
    equipable?: boolean;
    slot?: EquipmentSlot;
}

/**
 * Equipment slots
 */
export type EquipmentSlot =
    | 'head'
    | 'cape'
    | 'neck'
    | 'ammo'
    | 'weapon'
    | 'body'
    | 'shield'
    | 'legs'
    | 'hands'
    | 'feet'
    | 'ring';

/**
 * Combat stats for entities
 */
export interface CombatStats {
    attack: number;
    strength: number;
    defence: number;
    ranged: number;
    magic: number;
}

/**
 * Equipment bonuses
 */
export interface EquipmentBonuses {
    attackStab: number;
    attackSlash: number;
    attackCrush: number;
    attackMagic: number;
    attackRanged: number;
    defenceStab: number;
    defenceSlash: number;
    defenceCrush: number;
    defenceMagic: number;
    defenceRanged: number;
    meleeStrength: number;
    rangedStrength: number;
    magicDamage: number;
    prayer: number;
}

/**
 * XP rewards for killing an enemy
 */
export interface XPRewards {
    attack: number;
    strength: number;
    defence: number;
    hitpoints: number;
    ranged?: number;
    magic?: number;
}

/**
 * Enemy/NPC statistics
 */
export interface EnemyStats {
    level: number;
    hitpoints: number;
    maxHit: number;
    attackSpeed: number; // In game ticks (600ms each)
    aggressive: boolean;
    attackStyle?: 'melee' | 'ranged' | 'magic';
    combatStats: CombatStats;
    xpRewards: XPRewards;
}

/**
 * Drop table entry
 */
export interface DropTableEntry {
    item: OSRSItem | string; // Can be item object or item name
    quantity: number | [number, number]; // Fixed quantity or range [min, max]
    rarity: 'always' | 'common' | 'uncommon' | 'rare' | 'very_rare';
    probability?: number; // 0-1, overrides rarity
}

/**
 * Complete drop table for an enemy
 */
export interface DropTable {
    main: DropTableEntry[];
    rareDropTable?: boolean; // Whether this enemy can access RDT
    rdtChance?: number; // Chance to roll on RDT (default 1/1000)
}

/**
 * Quest stage
 */
export interface QuestStage {
    id: number;
    description: string;
    objectives: string[];
    requirements?: QuestRequirements;
}

/**
 * Quest requirements
 */
export interface QuestRequirements {
    skills?: Partial<Record<SkillName, number>>;
    quests?: string[]; // Quest IDs
    items?: { item: string; quantity: number }[];
}

/**
 * Quest rewards
 */
export interface QuestRewards {
    questPoints: number;
    xp?: Partial<Record<SkillName, number>>;
    items?: { item: string; quantity: number }[];
    coins?: number;
    unlocks?: string[]; // What this quest unlocks
}

/**
 * Complete quest definition
 */
export interface Quest {
    id: string;
    name: string;
    difficulty: 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster';
    length: 'Short' | 'Medium' | 'Long' | 'Very Long';
    requirements: QuestRequirements;
    stages: QuestStage[];
    rewards: QuestRewards;
    members?: boolean;
}

/**
 * NPC dialogue node
 */
export interface DialogueNode {
    text: string;
    options?: DialogueOption[];
    next?: string; // Next dialogue node ID
    action?: string; // Action to trigger
}

/**
 * Dialogue option
 */
export interface DialogueOption {
    text: string;
    next: string; // Next dialogue node ID
    requirement?: QuestRequirements;
}

/**
 * NPC dialogue tree
 */
export interface NPCDialogue {
    default?: string[];
    greeting?: string[];
    quest_start?: Record<string, string[]>;
    quest_progress?: Record<string, string[]>;
    quest_complete?: Record<string, string[]>;
    shop?: string[];
    busy?: string[];
}

/**
 * NPC definition
 */
export interface NPCDefinition {
    id: string;
    name: string;
    level?: number;
    examine?: string;
    dialogue: NPCDialogue;
    questGiver?: string[]; // Quest IDs
    shopkeeper?: boolean;
    roaming?: boolean;
    wanderRadius?: number;
    attackable?: boolean;
}

/**
 * Shop stock item
 */
export interface ShopStock {
    item: OSRSItem | string;
    stock: number;
    maxStock: number;
    restockRate: number; // Seconds per item
    price?: number; // Override item value
    requirements?: QuestRequirements;
}

/**
 * Shop definition
 */
export interface Shop {
    id: string;
    name: string;
    owner: string; // NPC ID
    currency: 'coins' | 'tokkul' | 'points';
    sells: ShopStock[];
    buys: string[] | 'all'; // Item IDs or 'all' for general stores
    buyPriceMultiplier?: number; // Default 0.4 (40% of item value)
    sellPriceMultiplier?: number; // Default 1.0 (100% of item value)
}

/**
 * Player inventory slot
 */
export interface InventorySlot {
    item: OSRSItem | null;
    quantity: number;
}

/**
 * Player equipment slots
 */
export type PlayerEquipment = Partial<Record<EquipmentSlot, OSRSItem>>;

/**
 * Player skills
 */
export type PlayerSkills = Record<SkillName, { level: number; xp: number }>;

/**
 * Player statistics
 */
export interface PlayerStats {
    combatLevel: number;
    skills: PlayerSkills;
    questPoints: number;
    totalLevel: number;
    totalXP: number;
}

/**
 * Spawn location with position and count
 */
export interface SpawnLocation {
    x: number;
    z: number;
    count?: number; // Number of entities to spawn here
    radius?: number; // Spawn radius
}

/**
 * Enemy definition with spawn locations
 */
export interface EnemyDefinition {
    id: string;
    name: string;
    examine?: string;
    stats: EnemyStats;
    dropTable: DropTable;
    spawnLocations: SpawnLocation[];
    respawnTime: number; // Seconds
}

/**
 * Position in 3D space
 */
export interface Position3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Position in 2D (tile-based)
 */
export interface Position2D {
    x: number;
    z: number;
}

/**
 * Game tick (600ms in OSRS)
 */
export type GameTick = number;

/**
 * Combat style
 */
export type CombatStyle = 'accurate' | 'aggressive' | 'defensive' | 'controlled';

/**
 * Attack style for different weapon types
 */
export interface AttackStyle {
    name: string;
    type: CombatStatName;
    style: CombatStyle;
    bonusType: 'stab' | 'slash' | 'crush' | 'ranged' | 'magic';
}

/**
 * Core OSRS Type Definitions
 * Following Andrew Gower's data-driven design philosophy
 */

// ============ SKILL TYPES ============

export type SkillName =
    | 'attack'
    | 'strength'
    | 'defence'
    | 'hitpoints'
    | 'ranged'
    | 'prayer'
    | 'magic'
    | 'cooking'
    | 'woodcutting'
    | 'fishing'
    | 'firemaking'
    | 'crafting'
    | 'smithing'
    | 'mining';

export interface SkillData {
    level: number;
    xp: number;
}

export type Skills = Record<SkillName, SkillData>;

// ============ ITEM TYPES ============

export interface OSRSItem {
    id: number;
    name: string;
    stackable: boolean;
    value: number;
    examine?: string;
    members?: boolean;
}

export interface InventoryItem {
    item: OSRSItem;
    quantity: number;
}

export type EquipmentSlot =
    | 'head'
    | 'cape'
    | 'neck'
    | 'weapon'
    | 'body'
    | 'shield'
    | 'legs'
    | 'hands'
    | 'feet'
    | 'ring'
    | 'ammo';

export type Equipment = Partial<Record<EquipmentSlot, OSRSItem>>;

// ============ COMBAT TYPES ============

export type AttackStyle = 'melee' | 'ranged' | 'magic' | 'none';

export interface CombatStats {
    attack: number;
    strength: number;
    defence: number;
    magic?: number;
    ranged?: number;
}

export interface XPRewards {
    hitpoints?: number;
    attack?: number;
    strength?: number;
    defence?: number;
    magic?: number;
    ranged?: number;
}

export interface CombatBonuses {
    attackBonus: number;
    defenceBonus: number;
    strengthBonus: number;
}

// ============ ENEMY TYPES ============

export interface EnemyData {
    id: string;
    name: string;
    level: number;
    hitpoints: number;
    maxHit: number;
    attackSpeed: number;
    aggressive: boolean;
    aggroRange?: number;
    poisonous: boolean;
    attackStyle: AttackStyle;
    xpRewards: XPRewards;
    slayerXP?: number;
    combatStats: CombatStats;
    examine: string;
    respawnTime: number;
    size: number;
    color: number;
    variants?: string[];
    canShear?: boolean;
    regrowWoolTime?: number;
    isQuestNPC?: boolean;
    quest?: string;
    location?: string;
}

export interface SpawnLocation {
    x: number;
    z: number;
    count: number;
    area: string;
}

export type SpawnLocations = Record<string, SpawnLocation[]>;

// ============ NPC TYPES ============

export interface NPCDialogue {
    greeting?: string[];
    default?: string[];
    goodbye?: string[];
    [key: string]: string[] | undefined;
}

export interface NPCData {
    name: string;
    title?: string;
    location: string;
    examine: string;
    questGiver?: string[] | false;
    questNPC?: string[];
    shop?: string | false;
    dialogue: NPCDialogue;
    roaming: boolean;
    wanderRadius: number;
    wanderPattern?: string;
    count?: number;
}

// ============ QUEST TYPES ============

export type QuestStatus = 'not_started' | 'in_progress' | 'completed';

export interface QuestRequirement {
    skill?: SkillName;
    level?: number;
    item?: string;
    quantity?: number;
    quest?: string;
}

export interface QuestStage {
    description: string;
    completed: boolean;
    requirements?: QuestRequirement[];
    onComplete?: () => void;
}

export interface Quest {
    name: string;
    description?: string;
    difficulty?: 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster';
    stages: QuestStage[];
    rewards?: QuestRewards;
}

export interface QuestRewards {
    questPoints: number;
    xp?: Partial<Record<SkillName, number>>;
    items?: Array<{ item: OSRSItem; quantity: number }>;
    unlocks?: string[];
}

// ============ LOOT TYPES ============

export interface LootDrop {
    item: string;
    chance: number;
    minQuantity?: number;
    maxQuantity?: number;
}

export type LootTable = LootDrop[];

export interface DropTableEntry {
    always?: LootDrop[];
    common?: LootDrop[];
    uncommon?: LootDrop[];
    rare?: LootDrop[];
    veryRare?: LootDrop[];
}

// ============ SHOP TYPES ============

export interface ShopItem {
    item: OSRSItem;
    stock: number;
    maxStock: number;
    buyPrice: number;
    sellPrice: number;
}

export interface Shop {
    id: string;
    name: string;
    owner: string;
    inventory: ShopItem[];
    restockRate: number;
    generalStore: boolean;
}

// ============ WORLD TYPES ============

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Position2D {
    x: number;
    z: number;
}

export interface WorldObject {
    id: string;
    name: string;
    position: Position;
    interactable: boolean;
    examine?: string;
}

// ============ CAMERA TYPES ============

export interface CameraSettings {
    DEFAULT_DISTANCE: number;
    DEFAULT_HEIGHT: number;
    DEFAULT_ANGLE: number;
    MIN_DISTANCE: number;
    MAX_DISTANCE: number;
    ROTATION_SPEED: number;
    ZOOM_SPEED: number;
}

// ============ UI TYPES ============

export interface ChatMessage {
    text: string;
    type: 'game' | 'public' | 'private' | 'trade' | 'clan';
    timestamp: number;
    sender?: string;
}

export type TabName = 'stats' | 'inventory' | 'equipment' | 'prayer' | 'magic';

// ============ ENTITY TYPES ============

export interface Entity {
    id: string;
    name: string;
    position: Position;
    mesh?: THREE.Mesh;
}

export interface GameEntityEvents {
    onDeath?: () => void;
    onRespawn?: () => void;
    onDamage?: (damage: number) => void;
    onHeal?: (amount: number) => void;
}

// ============ GAME STATE TYPES ============

export interface GameState {
    isPaused: boolean;
    isLoading: boolean;
    currentTab: TabName;
    selectedEntity: Entity | null;
    inCombat: boolean;
    combatTarget: Entity | null;
}

// ============ BUILDING TYPES ============

export type BuildingType =
    | 'Lumbridge Castle'
    | 'Church'
    | 'General Store'
    | "Bob's Brilliant Axes"
    | 'Chicken Farm'
    | 'Sheep Farm'
    | 'Cow Field'
    | 'Goblin House';

// ============ COLOR TYPES ============

export interface GameColors {
    // Terrain
    GRASS: number;
    DIRT: number;
    STONE: number;
    WATER: number;
    SAND: number;
    // Buildings
    CASTLE_STONE: number;
    WOOD: number;
    ROOF_RED: number;
    ROOF_GRAY: number;
    // UI
    UI_YELLOW: number;
    UI_GREEN: number;
    UI_RED: number;
    UI_BLUE: number;
    // Characters
    PLAYER_BLUE: number;
    NPC_YELLOW: number;
    ENEMY_RED: number;
}

// ============ UTILITY TYPES ============

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Re-export THREE namespace for type safety
import type * as THREE from 'three';
export type { THREE };

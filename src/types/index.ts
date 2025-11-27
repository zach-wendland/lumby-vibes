/**
 * Shared Type Definitions for Lumbridge Game
 * Comprehensive TypeScript interfaces and types
 */

import * as THREE from 'three';
import { Item, SkillName } from '../utils/Constants.js';

// ========== Vector Types ==========
export interface Vector3Like {
    x: number;
    y: number;
    z: number;
}

// ========== Entity Types ==========
export interface EntityBase {
    position: THREE.Vector3;
    rotation: number;
    mesh?: THREE.Group | THREE.Mesh;
    update?(delta: number, ...args: any[]): void;
}

// ========== Player Types ==========
export interface PlayerSkills {
    attack: number;
    strength: number;
    defence: number;
    hitpoints: number;
    ranged: number;
    prayer: number;
    magic: number;
    cooking: number;
    woodcutting: number;
    fishing: number;
    firemaking: number;
    crafting: number;
    smithing: number;
    mining: number;
}

export interface PlayerSkillXP {
    attack: number;
    strength: number;
    defence: number;
    hitpoints: number;
    ranged: number;
    prayer: number;
    magic: number;
    cooking: number;
    woodcutting: number;
    fishing: number;
    firemaking: number;
    crafting: number;
    smithing: number;
    mining: number;
}

export interface InventoryItem {
    item: Item;
    count: number;
}

// ========== NPC Types ==========
export interface NPCDialogue {
    greeting?: string[];
    default?: string[];
    quest?: string[];
    shop?: string[];
    [key: string]: string[] | undefined;
}

export interface NPCQuest {
    questId: string;
    startDialogue?: string[];
    progressDialogue?: string[];
    completeDialogue?: string[];
}

export interface NPCDefinition {
    name: string;
    title?: string;
    location: string;
    examine: string;
    dialogue: NPCDialogue;
    questGiver?: string[] | false;
    shop?: string | false;
    shopkeeper?: boolean;
    roaming: boolean;
    wanderRadius: number;
    count?: number;
}

// ========== Enemy Types ==========
export interface CombatStats {
    attack: number;
    strength: number;
    defence: number;
    magic?: number;
    ranged?: number;
}

export interface XPRewards {
    hitpoints: number;
    attack: number;
    strength: number;
    defence: number;
    magic?: number;
    ranged?: number;
}

export interface EnemyDefinition {
    id: string;
    name: string;
    level: number;
    hitpoints: number;
    maxHit: number;
    attackSpeed: number;
    aggressive: boolean;
    aggroRange?: number;
    poisonous: boolean;
    attackStyle: 'melee' | 'ranged' | 'magic' | 'none';
    xpRewards: XPRewards;
    slayerXP?: number;
    combatStats: CombatStats;
    examine: string;
    respawnTime: number;
    size: number;
    color: number;
    variants?: string[];
    isQuestNPC?: boolean;
    quest?: string;
    canShear?: boolean;
    regrowWoolTime?: number;
}

export interface SpawnLocation {
    x: number;
    z: number;
    count: number;
    area: string;
}

// ========== Quest Types ==========
export interface QuestRequirements {
    skills?: Partial<PlayerSkills>;
    quests?: string[];
    items?: { item: Item; count: number }[];
}

export interface QuestRewards {
    xp?: Partial<PlayerSkillXP>;
    items?: { item: Item; count: number }[];
    questPoints?: number;
}

export interface QuestObjective {
    id: string;
    description: string;
    completed: boolean;
    type: 'talk' | 'kill' | 'collect' | 'explore';
    target?: string;
    count?: number;
    currentCount?: number;
}

export interface QuestDefinition {
    id: string;
    name: string;
    description: string;
    difficulty: 'Novice' | 'Intermediate' | 'Experienced' | 'Master';
    length: 'Short' | 'Medium' | 'Long' | 'Very Long';
    requirements: QuestRequirements;
    rewards: QuestRewards;
    objectives: QuestObjective[];
    startNPC: string;
}

export interface QuestProgress {
    questId: string;
    started: boolean;
    completed: boolean;
    objectives: Map<string, boolean>;
}

// ========== Shop Types ==========
export interface ShopItem {
    item: Item;
    stock: number;
    maxStock: number;
    restockRate: number;
    buyPrice: number;
    sellPrice: number;
}

export interface ShopDefinition {
    id: string;
    name: string;
    owner: string;
    items: ShopItem[];
}

// ========== Loot Types ==========
export interface LootDrop {
    item: Item;
    chance: number;
    min?: number;
    max?: number;
}

export interface LootTable {
    enemyId: string;
    drops: LootDrop[];
}

// ========== Combat Types ==========
export interface CombatState {
    inCombat: boolean;
    target: EntityBase | null;
    lastAttackTime: number;
    attackCooldown: number;
}

export interface DamageResult {
    damage: number;
    hit: boolean;
    xpGained?: number;
}

// ========== Resource Types ==========
export interface ResourceNode {
    type: 'tree' | 'rock' | 'fish';
    position: Vector3Like;
    mesh?: THREE.Mesh;
    hp: number;
    maxHP: number;
    respawnTime: number;
    respawnTimer: number;
    depleted: boolean;
    requiredLevel: number;
    xpReward: number;
    skill: SkillName;
    item: Item;
}

// ========== Game State Types ==========
export interface GameState {
    player: any; // Will be Player type after migration
    npcs: any[]; // Will be NPC[] after migration
    enemies: any[]; // Will be Enemy[] after migration
    resources: ResourceNode[];
    quests: Map<string, QuestProgress>;
    shops: Map<string, ShopDefinition>;
}

// ========== UI Types ==========
export interface UINotification {
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'xp';
    duration: number;
    timestamp: number;
}

export interface ContextMenuOption {
    label: string;
    action: () => void;
    enabled: boolean;
}

// ========== Three.js Helper Types ==========
export interface MeshUserData {
    entity?: EntityBase;
    type?: 'player' | 'npc' | 'enemy' | 'resource' | 'building' | 'terrain';
    npcType?: string;
    enemyType?: string;
    resourceType?: string;
    [key: string]: any;
}

// ========== Event Types ==========
export interface GameClickEvent extends CustomEvent {
    detail: {
        object: THREE.Object3D;
        point: THREE.Vector3;
        button: 'left' | 'right';
        mouseX?: number;
        mouseY?: number;
    };
}

export interface CombatEvent {
    attacker: EntityBase;
    defender: EntityBase;
    damage: number;
    hit: boolean;
    fatal: boolean;
}

export interface XPGainEvent {
    skill: SkillName;
    xp: number;
    levelUp: boolean;
    newLevel?: number;
}

/**
 * Entity Type Definitions
 * Player, NPC, and Enemy types
 */

import type * as THREE from 'three';
import type {
    Skills,
    SkillName,
    Equipment,
    InventoryItem,
    CombatStats,
    XPRewards,
    Position,
    AttackStyle,
    OSRSItem
} from './index';

// ============ BASE ENTITY ============

export interface BaseEntity {
    id: string;
    name: string;
    position: Position;
    mesh: THREE.Mesh | null;
    isAlive: boolean;
}

// ============ PLAYER ============

export interface PlayerState {
    currentHitpoints: number;
    maxHitpoints: number;
    currentPrayer: number;
    maxPrayer: number;
    runEnergy: number;
    specialAttack: number;
}

export interface PlayerStats {
    skills: Skills;
    combatLevel: number;
}

export interface PlayerInventory {
    items: (InventoryItem | null)[];
    maxSlots: 28;
}

export interface PlayerEquipment {
    slots: Equipment;
    bonuses: {
        attackBonus: number;
        defenceBonus: number;
        strengthBonus: number;
    };
}

export interface Player extends BaseEntity {
    state: PlayerState;
    stats: PlayerStats;
    inventory: PlayerInventory;
    equipment: PlayerEquipment;
    questProgress: Record<string, number>;
    inCombat: boolean;
    combatTarget: Enemy | null;
    attackCooldown: number;
}

// ============ NPC ============

export interface NPCState {
    currentDialogueIndex: number;
    hasInteracted: boolean;
    isWandering: boolean;
}

export interface NPC extends BaseEntity {
    title?: string;
    examine: string;
    dialogue: Record<string, string[]>;
    shop?: string;
    questGiver?: string[];
    roaming: boolean;
    wanderRadius: number;
    homePosition: Position;
    state: NPCState;
}

// ============ ENEMY ============

export interface EnemyState {
    currentHitpoints: number;
    maxHitpoints: number;
    isDead: boolean;
    respawnTimer: number;
    isAggressive: boolean;
    currentTarget: Player | null;
    lastAttackTime: number;
}

export interface EnemyCombat {
    level: number;
    maxHit: number;
    attackSpeed: number;
    attackStyle: AttackStyle;
    combatStats: CombatStats;
    xpRewards: XPRewards;
}

export interface Enemy extends BaseEntity {
    examine: string;
    combat: EnemyCombat;
    state: EnemyState;
    homePosition: Position;
    aggroRange?: number;
    lootTable?: string;
    respawnTime: number;
    size: number;
    color: number;
}

// ============ ENTITY FACTORY CONFIG ============

export interface CreatePlayerConfig {
    name?: string;
    position?: Position;
    startingItems?: OSRSItem[];
}

export interface CreateNPCConfig {
    npcId: string;
    position: Position;
}

export interface CreateEnemyConfig {
    enemyId: string;
    position: Position;
    variant?: string;
}

// ============ ENTITY EVENTS ============

export type EntityEventType =
    | 'spawn'
    | 'death'
    | 'damage'
    | 'heal'
    | 'levelUp'
    | 'questComplete'
    | 'itemPickup'
    | 'itemDrop';

export interface EntityEvent {
    type: EntityEventType;
    entity: BaseEntity;
    data?: unknown;
    timestamp: number;
}

// ============ ENTITY UPDATES ============

export interface EntityUpdate {
    position?: Partial<Position>;
    rotation?: number;
    animation?: string;
}

export interface PlayerUpdate extends EntityUpdate {
    xpGained?: Partial<Record<SkillName, number>>;
    damage?: number;
    heal?: number;
}

export interface EnemyUpdate extends EntityUpdate {
    damage?: number;
    target?: Player | null;
}

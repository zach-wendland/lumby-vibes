/**
 * Game System Interface Definitions
 * Defines contracts for game systems to avoid circular dependencies
 */

import type * as THREE from 'three';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { NPC } from '../entities/NPC';
import type { OSRSItem } from './index';

/**
 * UI Manager interface for systems that need UI access
 */
export interface IUIManager {
    addMessage(message: string, type?: string): void;
    updateStats(): void;
    updateInventory(): void;
    updateMinimap(player: Player, npcs: NPC[], enemies: Enemy[]): void;
    showLevelUp(skill: string, level: number): void;
    createContextMenu(options: Array<{ label: string; action: () => void }>): HTMLElement;
}

/**
 * Loot System interface for combat system
 */
export interface ILootSystem {
    generateLoot(enemyId: string): Array<{ item: string; quantity: number }>;
}

/**
 * Combat System interface
 */
export interface ICombatSystem {
    attackTarget(target: Enemy): void;
    stopCombat(): void;
    update(delta: number): void;
    isInCombat(): boolean;
    getCurrentTarget(): Enemy | null;
    getAttackCooldown(): number;
}

/**
 * Skills System interface
 */
export interface ISkillsSystem {
    gatherResource(resource: unknown): void;
    update(delta: number): void;
    getRequiredSkill(resourceType: string): string;
}

/**
 * Quest System interface
 */
export interface IQuestSystem {
    getNPCDialogue(npcId: string, player: Player): string | null;
    getQuestOptions(npcId: string, player: Player): Array<{ label: string; questId: string; action: string }>;
    handleQuestInteraction(questId: string, action: string, player: Player): { message?: string; updateUI?: boolean } | null;
}

/**
 * Shop System interface
 */
export interface IShopSystem {
    openShop(shopId: string): void;
    buyItem(shopId: string, itemId: number, quantity: number): boolean;
    sellItem(shopId: string, itemId: number, quantity: number): boolean;
}

/**
 * Minimal GameLogic interface for systems
 * Only includes what systems actually need
 * Note: player and ui are guaranteed to be non-null when systems are initialized
 */
export interface IGameLogicContext {
    readonly player: Player;
    readonly ui: IUIManager;
    readonly lootSystem?: ILootSystem;
    createDamageSplash(position: THREE.Vector3, damage: number): void;
}

/**
 * Skills System context (needs less than combat)
 */
export interface ISkillsSystemContext {
    readonly player: Player;
    readonly ui: IUIManager;
}

/**
 * Shop System context
 */
export interface IShopSystemContext {
    readonly player: Player;
}

/**
 * World interface
 */
export interface IWorld {
    npcs: NPC[];
    enemies: Enemy[];
    update(delta: number, player: Player): void;
    create(): void;
}

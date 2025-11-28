/**
 * Game Systems Type Definitions
 * Combat, Quest, Loot, Shop, Skills systems
 */

import type { Player, Enemy, NPC } from './entities';
import type { SkillName, OSRSItem, Quest, QuestStatus } from './index';
import type { LootResult, LootGenerationConfig } from './loot';

// ============ COMBAT SYSTEM ============

export interface CombatState {
    isActive: boolean;
    attacker: Player | Enemy;
    defender: Player | Enemy;
    lastAttackTime: number;
    ticksSinceStart: number;
}

export interface AttackResult {
    hit: boolean;
    damage: number;
    maxHit: number;
    accuracy: number;
    xpGained?: Partial<Record<SkillName, number>>;
}

export interface CombatSystemConfig {
    attackCooldown: number; // seconds (2.4 in OSRS)
    tickSpeed: number; // ms per tick (600 in OSRS)
    maxCombatRange: number;
}

export interface ICombatSystem {
    startCombat(attacker: Player, target: Enemy): void;
    stopCombat(): void;
    update(deltaTime: number): void;
    calculateAccuracy(attacker: Player | Enemy, defender: Player | Enemy): number;
    calculateMaxHit(attacker: Player | Enemy): number;
    rollDamage(maxHit: number): number;
}

// ============ QUEST SYSTEM ============

export interface QuestProgress {
    questId: string;
    currentStage: number;
    status: QuestStatus;
    startedAt?: number;
    completedAt?: number;
}

export interface QuestSystemState {
    quests: Record<string, Quest>;
    progress: Record<string, QuestProgress>;
    questPoints: number;
}

export interface IQuestSystem {
    startQuest(questId: string): boolean;
    advanceStage(questId: string): boolean;
    completeQuest(questId: string): boolean;
    getQuestStatus(questId: string): QuestStatus;
    canStartQuest(questId: string): boolean;
    getQuestPoints(): number;
}

// ============ LOOT SYSTEM ============

export interface ILootSystem {
    generateLoot(enemyId: string, config?: Partial<LootGenerationConfig>): LootResult[];
    rollDrop(chance: number): boolean;
    rollRareDropTable(): LootResult | null;
    getDropTable(enemyId: string): unknown;
}

// ============ SHOP SYSTEM ============

export interface ShopTransaction {
    type: 'buy' | 'sell';
    item: OSRSItem;
    quantity: number;
    totalPrice: number;
    success: boolean;
    message?: string;
}

export interface ShopState {
    currentShop: string | null;
    isOpen: boolean;
}

export interface IShopSystem {
    openShop(shopId: string): boolean;
    closeShop(): void;
    buyItem(itemId: number, quantity: number): ShopTransaction;
    sellItem(itemId: number, quantity: number): ShopTransaction;
    getShopInventory(shopId: string): unknown;
    restockShop(shopId: string): void;
}

// ============ SKILLS SYSTEM ============

export interface SkillAction {
    skill: SkillName;
    xpGain: number;
    duration: number; // ticks
    requirements?: {
        level: number;
        items?: OSRSItem[];
    };
}

export interface ResourceNode {
    id: string;
    type: 'tree' | 'rock' | 'fishing_spot';
    skill: SkillName;
    level: number;
    xp: number;
    depleted: boolean;
    respawnTime: number;
}

export interface ISkillsSystem {
    startAction(action: SkillAction): boolean;
    stopAction(): void;
    update(deltaTime: number): void;
    canPerformAction(action: SkillAction): boolean;
}

// ============ UI MANAGER ============

export interface UIState {
    activeTab: string;
    chatMessages: Array<{
        text: string;
        type: string;
        timestamp: number;
    }>;
    isDialogueOpen: boolean;
    currentDialogue: {
        npc: NPC | null;
        lines: string[];
        currentLine: number;
    } | null;
}

export interface IUIManager {
    updateStats(): void;
    updateInventory(): void;
    updateEquipment(): void;
    addMessage(message: string, type?: string): void;
    showDialogue(npc: NPC, dialogueKey: string): void;
    hideDialogue(): void;
    switchTab(tabName: string): void;
}

// ============ GAME LOGIC ============

export interface GameLogicState {
    isPaused: boolean;
    isRunning: boolean;
    lastUpdate: number;
    deltaTime: number;
}

export interface IGameLogic {
    init(): Promise<void>;
    update(deltaTime: number): void;
    pause(): void;
    resume(): void;
    handleClick(event: MouseEvent): void;
    handleRightClick(event: MouseEvent): void;
}

// ============ GAME ENGINE ============

export interface RendererConfig {
    antialias: boolean;
    alpha: boolean;
    powerPreference: 'high-performance' | 'low-power' | 'default';
}

export interface SceneConfig {
    backgroundColor: number;
    fogEnabled: boolean;
    fogColor: number;
    fogNear: number;
    fogFar: number;
}

export interface LightingConfig {
    ambientColor: number;
    ambientIntensity: number;
    directionalColor: number;
    directionalIntensity: number;
    shadowMapSize: number;
}

export interface IGameEngine {
    init(canvas: HTMLCanvasElement): void;
    render(): void;
    resize(): void;
    addToScene(object: THREE.Object3D): void;
    removeFromScene(object: THREE.Object3D): void;
}

// Import THREE namespace
import type * as THREE from 'three';

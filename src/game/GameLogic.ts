/**
 * GameLogic - Main game controller integrating all systems
 * TypeScript version with full type safety
 */

import * as THREE from 'three';
import { GameEngine } from '../engine/GameEngine';
import { Player } from '../entities/Player';
import { Lumbridge } from '../world/Lumbridge';
import { CombatSystem } from '../systems/CombatSystem';
import { SkillsSystem } from '../systems/SkillsSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { LootSystem } from '../systems/LootSystem';
import { ShopSystem } from '../systems/ShopSystem';
import { UIManager } from '../ui/UIManager';
import { InputHandler } from './InputHandler';
import { CameraController } from './CameraController';
import { DamageSplashManager } from './DamageSplashManager';
import type { Enemy } from '../entities/Enemy';
import type { NPC } from '../entities/NPC';
import type { IGameLogicContext, ISkillsSystemContext, IShopSystemContext } from '../types/game';
import {
    extractEntity,
    getEnemyFromObject,
    getNPCFromObject,
    getResourceFromObject,
    type ResourceData
} from '../types/guards';

/**
 * Context menu option interface
 */
interface ContextMenuOption {
    label: string;
    action: () => void;
}

/**
 * Click event detail interface
 */
interface GameClickDetail {
    object: THREE.Object3D;
    point: THREE.Vector3;
    button: 'left' | 'right';
    mouseX?: number;
    mouseY?: number;
}

/**
 * Level up event detail interface
 */
interface LevelUpDetail {
    skill: string;
    level: number;
}

/**
 * GameLogic class - Main game controller
 */
export class GameLogic {
    public engine: GameEngine;
    public player: Player | null;
    public world: Lumbridge | null;
    public combatSystem: CombatSystem | null;
    public skillsSystem: SkillsSystem | null;
    public questSystem: QuestSystem | null;
    public lootSystem: LootSystem | null;
    public shopSystem: ShopSystem | null;
    public ui: UIManager | null;

    // Extracted components
    private inputHandler: InputHandler | null;
    private cameraController: CameraController | null;
    private damageSplashManager: DamageSplashManager;

    // Event handler references for cleanup
    private handleGameClick: (e: Event) => void;
    private handleLevelUp: (e: Event) => void;

    constructor() {
        this.engine = new GameEngine();
        this.player = null;
        this.world = null;
        this.combatSystem = null;
        this.skillsSystem = null;
        this.questSystem = null;
        this.lootSystem = null;
        this.shopSystem = null;
        this.ui = null;

        // Extracted components
        this.inputHandler = null;
        this.cameraController = null;
        this.damageSplashManager = new DamageSplashManager();

        // Event handlers
        this.handleGameClick = ((e: CustomEvent<GameClickDetail>) => {
            this.handleGameClickEvent(e.detail);
        }) as EventListener;

        this.handleLevelUp = ((e: CustomEvent<LevelUpDetail>) => {
            if (this.ui) {
                this.ui.showLevelUp(e.detail.skill, e.detail.level);
            }
        }) as EventListener;
    }

    /**
     * Initialize the game
     */
    async init(): Promise<void> {
        try {
            // Initialize engine
            console.log('Init: Initializing engine...');
            await this.engine.init();
            this.engine.updateLoadingProgress(40);

            // Create player
            console.log('Init: Creating player...');
            this.player = new Player(0, 0);
            this.engine.addEntity(this.player);
            this.engine.updateLoadingProgress(50);

            // Create world
            console.log('Init: Creating world...');
            this.world = new Lumbridge(this.engine);
            this.world.create();
            this.engine.updateLoadingProgress(70);

            // Create systems (player is guaranteed non-null at this point)
            console.log('Init: Creating combat system...');
            this.combatSystem = new CombatSystem(this as IGameLogicContext);
            console.log('Init: Creating skills system...');
            this.skillsSystem = new SkillsSystem(this as ISkillsSystemContext);
            if (this.world) {
                // Register all world resources so depletion/respawn works
                for (const resource of this.world.getResources()) {
                    this.skillsSystem.addResource(resource);
                }
            }
            console.log('Init: Creating quest system...');
            this.questSystem = new QuestSystem(this.player);
            console.log('Init: Creating loot system...');
            this.lootSystem = new LootSystem();
            console.log('Init: Creating shop system...');
            this.shopSystem = new ShopSystem(this as IShopSystemContext);

            // Add world resources to skills system
            console.log('Init: Adding resources...');
            // Resources are stored in world userData, but we'll skip this for now as it's handled by Lumbridge
            this.engine.updateLoadingProgress(80);

            // Setup camera controller
            console.log('Init: Setting up camera...');
            if (!this.engine.camera) {
                throw new Error('Camera not initialized - engine initialization failed');
            }
            this.cameraController = new CameraController({
                camera: this.engine.camera,
                getPlayer: () => this.player
            });
            window.gameCamera = this.engine.camera; // For sprite billboarding

            // Setup input handler
            console.log('Init: Setting up controls...');
            this.inputHandler = new InputHandler({
                getPlayer: () => this.player,
                getCombatSystem: () => this.combatSystem,
                onCameraRotate: (deltaX, deltaY) => this.cameraController?.rotate(deltaX, deltaY),
                onCameraZoom: (delta) => this.cameraController?.zoom(delta)
            });
            this.inputHandler.setup();

            // Setup damage splash manager
            if (this.engine.scene) {
                this.damageSplashManager.setScene(this.engine.scene);
            }

            // Initialize UI (player is guaranteed non-null at this point)
            console.log('Init: Initializing UI...');
            this.ui = new UIManager(this as IShopSystemContext);
            this.ui.updateStats();
            this.ui.updateInventory();
            this.ui.addMessage('Welcome to Lumbridge!', 'game');
            this.ui.addMessage('Use WASD or Arrow keys to move, click to interact.', 'system');

            this.engine.updateLoadingProgress(90);

            // Setup update loop
            console.log('Init: Setting up game loop...');
            this.engine.onUpdate((delta) => this.update(delta));
            this.engine.onRender(() => this.render());

            // Setup event listeners
            console.log('Init: Setting up event listeners...');
            this.setupEventListeners();

            this.engine.updateLoadingProgress(100);
            console.log('Init: Hiding loading screen...');
            this.engine.hideLoadingScreen();

            // Start game loop
            console.log('Init: Starting game loop...');
            this.engine.start();
            console.log('Init: Complete!');
        } catch (error) {
            console.error('Init failed at step:', error);
            throw error;
        }
    }

    /**
     * Setup game event listeners
     */
    setupEventListeners(): void {
        // Click events
        window.addEventListener('gameClick', this.handleGameClick);

        // Level up events
        window.addEventListener('levelUp', this.handleLevelUp);
    }

    /**
     * Handle game world clicks
     */
    handleGameClickEvent(detail: GameClickDetail): void {
        if (!this.player || !this.ui || !this.combatSystem || !this.skillsSystem) return;

        const { object, point, button, mouseX, mouseY } = detail;

        if (!object) return;

        // Use type-safe entity extraction
        const entityResult = extractEntity(object, point);

        // Left click
        if (button === 'left') {
            this.handleLeftClick(entityResult, point);
        }
        // Right click
        else if (button === 'right' && mouseX !== undefined && mouseY !== undefined) {
            this.handleRightClick(object, mouseX, mouseY);
        }
    }

    /**
     * Handle left click on entities
     */
    private handleLeftClick(entityResult: ReturnType<typeof extractEntity>, point: THREE.Vector3): void {
        if (!this.player || !this.ui || !this.combatSystem || !this.skillsSystem) return;

        switch (entityResult.type) {
            case 'terrain':
                this.player.moveTo(point.x, point.z);
                this.combatSystem.stopCombat();
                this.ui.addMessage(`Walking to (${Math.floor(point.x)}, ${Math.floor(point.z)})`, 'game');
                break;

            case 'enemy':
                if (!entityResult.entity.isDead) {
                    this.combatSystem.attackTarget(entityResult.entity);
                }
                break;

            case 'npc': {
                const npc = entityResult.entity;
                const questDialogue = this.questSystem
                    ? this.questSystem.getNPCDialogue(npc.npcId || npc.name, this.player)
                    : null;
                const dialogue = questDialogue || npc.talk();
                this.ui.addMessage(`${npc.name}: ${dialogue}`, 'game');
                break;
            }

            case 'resource':
                if (!entityResult.resource.depleted) {
                    // Resource from userData has all required properties, cast to satisfy SkillsSystem
                    this.skillsSystem.gatherResource(entityResult.resource as unknown);
                }
                break;
        }
    }

    /**
     * Handle right click context menus
     */
    private handleRightClick(object: THREE.Object3D, mouseX: number, mouseY: number): void {
        if (!this.player || !this.ui || !this.combatSystem || !this.skillsSystem) return;

        const enemy = getEnemyFromObject(object);
        if (enemy) {
            this.showContextMenu(mouseX, mouseY, [
                { label: `Attack ${enemy.name}`, action: () => this.combatSystem!.attackTarget(enemy) },
                { label: 'Examine', action: () => this.ui!.addMessage(`A ${enemy.name} (Level ${enemy.level})`, 'game') }
            ]);
            return;
        }

        const npc = getNPCFromObject(object);
        if (npc) {
            this.showNPCContextMenu(npc, mouseX, mouseY);
            return;
        }

        const resource = getResourceFromObject(object);
        if (resource) {
            this.showResourceContextMenu(resource, mouseX, mouseY);
        }
    }

    /**
     * Show NPC context menu
     */
    private showNPCContextMenu(npc: NPC, mouseX: number, mouseY: number): void {
        if (!this.player || !this.ui) return;

        const menuOptions: ContextMenuOption[] = [];

        // Add quest options if available
        if (this.questSystem) {
            const questOptions = this.questSystem.getQuestOptions(npc.npcId || npc.name, this.player);
            menuOptions.push(...questOptions.map(opt => ({
                label: opt.label,
                action: () => {
                    const result = this.questSystem!.handleQuestInteraction(opt.questId, opt.action, this.player!);
                    if (result?.message) {
                        this.ui!.addMessage(`${npc.name}: ${result.message}`, 'game');
                    }
                    if (result?.updateUI) {
                        this.ui!.updateStats();
                    }
                }
            })));
        }

        // Add standard talk option
        menuOptions.push(
            {
                label: 'Talk-to',
                action: () => {
                    const questDialogue = this.questSystem
                        ? this.questSystem.getNPCDialogue(npc.npcId || npc.name, this.player!)
                        : null;
                    const dialogue = questDialogue || npc.talk();
                    this.ui!.addMessage(`${npc.name}: ${dialogue}`, 'game');
                }
            },
            { label: 'Examine', action: () => this.ui!.addMessage(`This is ${npc.name}.`, 'game') }
        );

        this.showContextMenu(mouseX, mouseY, menuOptions);
    }

    /**
     * Show resource context menu
     */
    private showResourceContextMenu(resource: ResourceData, mouseX: number, mouseY: number): void {
        if (!this.ui || !this.skillsSystem) return;

        const skillName = this.skillsSystem.getRequiredSkill(resource.type);
        this.showContextMenu(mouseX, mouseY, [
            { label: `Chop ${resource.name}`, action: () => this.skillsSystem!.gatherResource(resource as unknown) },
            { label: 'Examine', action: () => this.ui!.addMessage(`A ${resource.name}. Requires level ${resource.levelRequired} ${skillName}.`, 'game') }
        ]);
    }

    /**
     * Show context menu
     */
    showContextMenu(x: number, y: number, options: ContextMenuOption[]): void {
        if (!this.ui) return;

        const menu = this.ui.createContextMenu(options);
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        document.body.appendChild(menu);

        setTimeout(() => {
            const removeMenu = (): void => {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            };
            document.addEventListener('click', removeMenu);
        }, 10);
    }

    /**
     * Create damage splash effect
     */
    createDamageSplash(position: THREE.Vector3, damage: number): void {
        this.damageSplashManager.create(position, damage);
    }

    /**
     * Main update loop
     */
    update(delta: number): void {
        if (!this.player || !this.world || !this.combatSystem || !this.skillsSystem || !this.ui) return;

        // Handle keyboard movement
        this.inputHandler?.handleMovement(delta);

        // Update systems
        this.combatSystem.update(delta);
        this.skillsSystem.update(delta);

        // Update world
        this.world.update(delta, this.player);

        // Update camera
        this.cameraController?.update();

        // Update damage splashes
        this.damageSplashManager.update();

        // Update UI
        this.ui.updateStats();
        this.ui.updateMinimap(this.player, this.world.npcs, this.world.enemies);
    }

    /**
     * Render loop
     */
    render(): void {
        // Additional rendering if needed
    }

    /**
     * Dispose of resources and event listeners
     */
    dispose(): void {
        // Stop the engine
        if (this.engine) {
            this.engine.stop();
        }

        // Dispose input handler (removes its event listeners)
        if (this.inputHandler) {
            this.inputHandler.dispose();
            this.inputHandler = null;
        }

        // Remove game event listeners
        if (typeof window !== 'undefined') {
            window.removeEventListener('gameClick', this.handleGameClick);
            window.removeEventListener('levelUp', this.handleLevelUp);
        }

        // Dispose engine resources
        if (this.engine) {
            this.engine.dispose();
        }

        // Dispose damage splash manager
        this.damageSplashManager.dispose();

        // Dispose of all systems before clearing references
        if (this.combatSystem) {
            this.combatSystem.dispose();
        }
        if (this.skillsSystem) {
            this.skillsSystem.dispose();
        }
        if (this.shopSystem) {
            this.shopSystem.dispose();
        }
        if (this.ui) {
            this.ui.dispose();
        }
        if (this.world) {
            this.world.dispose();
        }

        // Dispose player
        if (this.player) {
            this.player.dispose();
        }

        // Clear references to systems
        this.combatSystem = null;
        this.skillsSystem = null;
        this.questSystem = null;
        this.lootSystem = null;
        this.shopSystem = null;
        this.ui = null;

        // Clear references to entities and world
        this.player = null;
        this.world = null;
        this.cameraController = null;
    }
}

export default GameLogic;

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
import { CAMERA } from '../utils/Constants';
import type { Enemy } from '../entities/Enemy';
import type { NPC } from '../entities/NPC';
import type { IGameLogicContext, ISkillsSystemContext, IShopSystemContext } from '../types/game';

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
 * Damage splash interface
 */
interface DamageSplash {
    sprite: THREE.Sprite;
    startY: number;
    startTime: number;
    duration: number;
}

/**
 * Resource interface
 */
interface Resource {
    type: string;
    name: string;
    levelRequired: number;
    depleted: boolean;
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

    private camera: THREE.PerspectiveCamera | null;
    private cameraDistance: number;
    private cameraAngle: number;
    private cameraRotation: number;

    private keys: Record<string, boolean>;
    private mouseDown: boolean;
    private lastMouseX: number;
    private lastMouseY: number;

    private damageSplashes: DamageSplash[];

    // Event handler references for cleanup
    private handleKeyDown: (e: KeyboardEvent) => void;
    private handleKeyUp: (e: KeyboardEvent) => void;
    private handleMouseDown: (e: MouseEvent) => void;
    private handleMouseUp: (e: MouseEvent) => void;
    private handleMouseMove: (e: MouseEvent) => void;
    private handleWheel: (e: WheelEvent) => void;
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

        this.camera = null;
        this.cameraDistance = CAMERA.DEFAULT_DISTANCE;
        this.cameraAngle = CAMERA.DEFAULT_ANGLE;
        this.cameraRotation = 0;

        this.keys = {};
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.damageSplashes = [];

        // Initialize event handlers
        this.handleKeyDown = (e: KeyboardEvent) => {
            this.keys[e.code] = true;
        };

        this.handleKeyUp = (e: KeyboardEvent) => {
            this.keys[e.code] = false;
        };

        this.handleMouseDown = (e: MouseEvent) => {
            if (e.button === 1) { // Middle mouse button
                this.mouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            }
        };

        this.handleMouseUp = (e: MouseEvent) => {
            if (e.button === 1) {
                this.mouseDown = false;
            }
        };

        this.handleMouseMove = (e: MouseEvent) => {
            if (this.mouseDown) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                this.cameraRotation -= deltaX * 0.005;
                this.cameraAngle = Math.max(0.1, Math.min(Math.PI / 2.5, this.cameraAngle + deltaY * 0.005));

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;

                this.updateCamera();
            }
        };

        this.handleWheel = (e: WheelEvent) => {
            this.cameraDistance = Math.max(
                CAMERA.MIN_DISTANCE,
                Math.min(CAMERA.MAX_DISTANCE, this.cameraDistance + e.deltaY * 0.01)
            );
            this.updateCamera();
        };

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

            // Setup camera
            console.log('Init: Setting up camera...');
            this.setupCamera();
            window.gameCamera = this.camera!; // For sprite billboarding

            // Setup controls
            console.log('Init: Setting up controls...');
            this.setupControls();

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
     * Setup camera
     */
    setupCamera(): void {
        this.camera = this.engine.camera;
        this.updateCamera();
    }

    /**
     * Update camera position
     */
    updateCamera(): void {
        if (!this.camera || !this.player) return;

        const height = this.cameraDistance * Math.sin(this.cameraAngle);
        const distance = this.cameraDistance * Math.cos(this.cameraAngle);

        this.camera.position.x = this.player.position.x + Math.sin(this.cameraRotation) * distance;
        this.camera.position.y = height;
        this.camera.position.z = this.player.position.z + Math.cos(this.cameraRotation) * distance;

        this.camera.lookAt(this.player.position);
    }

    /**
     * Setup controls
     */
    setupControls(): void {
        // Keyboard
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // Mouse camera rotation
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);

        // Mouse wheel zoom
        window.addEventListener('wheel', this.handleWheel);
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

        if (!object || !object.userData) return;

        const type = object.userData.type || object.parent?.userData?.type;

        // Left click
        if (button === 'left') {
            if (type === 'terrain') {
                // Walk to location
                this.player.moveTo(point.x, point.z);
                this.combatSystem.stopCombat();
                this.ui.addMessage(`Walking to (${Math.floor(point.x)}, ${Math.floor(point.z)})`, 'game');
            } else if (type === 'enemy') {
                const enemy = object.userData.entity || object.parent?.userData?.entity;
                if (enemy && !enemy.isDead) {
                    this.combatSystem.attackTarget(enemy as Enemy);
                }
            } else if (type === 'npc') {
                const npc = object.userData.entity || object.parent?.userData?.entity;
                if (npc) {
                    // Check for quest-related dialogue
                    const questDialogue = this.questSystem
                        ? this.questSystem.getNPCDialogue((npc as NPC).npcId || (npc as NPC).name, this.player)
                        : null;

                    const dialogue = questDialogue || (npc as NPC).talk();
                    this.ui.addMessage(`${(npc as NPC).name}: ${dialogue}`, 'game');
                }
            } else if (type === 'resource') {
                const resource = object.userData.resource || object.parent?.userData?.resource;
                if (resource && !resource.depleted) {
                    this.skillsSystem.gatherResource(resource);
                }
            }
        }
        // Right click
        else if (button === 'right' && mouseX !== undefined && mouseY !== undefined) {
            if (type === 'enemy') {
                const enemy = object.userData.entity || object.parent?.userData?.entity;
                if (enemy) {
                    this.showContextMenu(mouseX, mouseY, [
                        { label: `Attack ${(enemy as Enemy).name}`, action: () => this.combatSystem!.attackTarget(enemy as Enemy) },
                        { label: 'Examine', action: () => this.ui!.addMessage(`A ${(enemy as Enemy).name} (Level ${(enemy as Enemy).level})`, 'game') }
                    ]);
                }
            } else if (type === 'npc') {
                const npc = object.userData.entity || object.parent?.userData?.entity;
                if (npc) {
                    const menuOptions: ContextMenuOption[] = [];

                    // Add quest options if available
                    if (this.questSystem) {
                        const questOptions = this.questSystem.getQuestOptions((npc as NPC).npcId || (npc as NPC).name, this.player);
                        menuOptions.push(...questOptions.map(opt => ({
                            label: opt.label,
                            action: () => {
                                const result = this.questSystem!.handleQuestInteraction(opt.questId, opt.action, this.player!);
                                if (result && result.message) {
                                    this.ui!.addMessage(`${(npc as NPC).name}: ${result.message}`, 'game');
                                }
                                if (result && result.updateUI) {
                                    this.ui!.updateStats();
                                }
                            }
                        })));
                    }

                    // Add standard talk option
                    menuOptions.push(
                        { label: 'Talk-to', action: () => {
                            const questDialogue = this.questSystem
                                ? this.questSystem.getNPCDialogue((npc as NPC).npcId || (npc as NPC).name, this.player!)
                                : null;
                            const dialogue = questDialogue || (npc as NPC).talk();
                            this.ui!.addMessage(`${(npc as NPC).name}: ${dialogue}`, 'game');
                        }},
                        { label: 'Examine', action: () => this.ui!.addMessage(`This is ${(npc as NPC).name}.`, 'game') }
                    );

                    this.showContextMenu(mouseX, mouseY, menuOptions);
                }
            } else if (type === 'resource') {
                const resource = object.userData.resource || object.parent?.userData?.resource;
                if (resource) {
                    const skillName = this.skillsSystem.getRequiredSkill((resource as Resource).type);
                    this.showContextMenu(mouseX, mouseY, [
                        { label: `Chop ${(resource as Resource).name}`, action: () => this.skillsSystem!.gatherResource(resource) },
                        { label: 'Examine', action: () => this.ui!.addMessage(`A ${(resource as Resource).name}. Requires level ${(resource as Resource).levelRequired} ${skillName}.`, 'game') }
                    ]);
                }
            }
        }
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
     * Handle player movement from keyboard
     */
    handleMovement(delta: number): void {
        if (!this.player || !this.combatSystem) return;

        let dx = 0;
        let dz = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) dz -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dz += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

        if (dx !== 0 || dz !== 0) {
            // Normalize diagonal movement
            const length = Math.sqrt(dx * dx + dz * dz);
            dx /= length;
            dz /= length;

            // Move player
            const newX = this.player.position.x + dx * this.player.speed * delta;
            const newZ = this.player.position.z + dz * this.player.speed * delta;

            // Bounds check
            const bound = 140;
            if (newX > -bound && newX < bound && newZ > -bound && newZ < bound) {
                this.player.position.x = newX;
                this.player.position.z = newZ;
                this.player.rotation = Math.atan2(dx, dz);

                // Stop combat when moving manually
                if (this.player.inCombat && this.player.target) {
                    this.combatSystem.stopCombat();
                }
            }
        }
    }

    /**
     * Create damage splash effect
     */
    createDamageSplash(position: THREE.Vector3, damage: number): void {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = 128;
        canvas.height = 64;

        const color = damage === 0 ? '#0099FF' : '#FF0000';
        const text = damage === 0 ? 'Miss' : damage.toString();

        context.fillStyle = color;
        context.font = 'Bold 32px Arial';
        context.textAlign = 'center';
        context.fillText(text, 64, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.position.y += 3;
        sprite.scale.set(2, 1, 1);

        if (this.engine.scene) {
            this.engine.scene.add(sprite);
        }

        // Animate and remove
        const startY = sprite.position.y;
        const startTime = Date.now();

        this.damageSplashes.push({
            sprite,
            startY,
            startTime,
            duration: 1500
        });
    }

    /**
     * Update damage splashes
     */
    updateDamageSplashes(): void {
        const now = Date.now();

        for (let i = this.damageSplashes.length - 1; i >= 0; i--) {
            const splash = this.damageSplashes[i];
            const elapsed = now - splash.startTime;

            if (elapsed >= splash.duration) {
                if (this.engine.scene) {
                    this.engine.scene.remove(splash.sprite);
                }
                this.damageSplashes.splice(i, 1);
            } else {
                const progress = elapsed / splash.duration;
                splash.sprite.position.y = splash.startY + progress * 2;
                splash.sprite.material.opacity = 1 - progress;
            }
        }
    }

    /**
     * Main update loop
     */
    update(delta: number): void {
        if (!this.player || !this.world || !this.combatSystem || !this.skillsSystem || !this.ui) return;

        // Handle keyboard movement
        this.handleMovement(delta);

        // Update systems
        this.combatSystem.update(delta);
        this.skillsSystem.update(delta);

        // Update world
        this.world.update(delta, this.player);

        // Update camera
        this.updateCamera();

        // Update damage splashes
        this.updateDamageSplashes();

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

        // Remove all event listeners
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
            window.removeEventListener('mousedown', this.handleMouseDown);
            window.removeEventListener('mouseup', this.handleMouseUp);
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('wheel', this.handleWheel);
            window.removeEventListener('gameClick', this.handleGameClick);
            window.removeEventListener('levelUp', this.handleLevelUp);
        }

        // Dispose engine resources
        if (this.engine) {
            this.engine.dispose();
        }

        // Clear damage splashes
        if (this.damageSplashes && this.damageSplashes.length > 0) {
            this.damageSplashes.forEach(splash => {
                if (splash.sprite && splash.sprite.parent) {
                    splash.sprite.parent.remove(splash.sprite);
                }
            });
            this.damageSplashes = [];
        }

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
        this.camera = null;

        // Clear keys
        this.keys = {};
        this.mouseDown = false;
    }
}

export default GameLogic;

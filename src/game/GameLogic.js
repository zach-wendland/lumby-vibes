/**
 * GameLogic - Main game controller integrating all systems
 */

import { GameEngine } from '../engine/GameEngine.js';
import { Player } from '../entities/Player.js';
import { Lumbridge } from '../world/Lumbridge.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { SkillsSystem } from '../systems/SkillsSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { LootSystem } from '../systems/LootSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { CAMERA } from '../utils/Constants.js';

export class GameLogic {
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
    }

    /**
     * Initialize the game
     */
    async init() {
        // Initialize engine
        await this.engine.init();
        this.engine.updateLoadingProgress(40);

        // Create player
        this.player = new Player(0, 0);
        this.engine.addEntity(this.player);
        this.engine.updateLoadingProgress(50);

        // Create world
        this.world = new Lumbridge(this.engine);
        this.world.create();
        this.engine.updateLoadingProgress(70);

        // Create systems
        this.combatSystem = new CombatSystem(this);
        this.skillsSystem = new SkillsSystem(this);
        this.questSystem = new QuestSystem(this.player);
        this.lootSystem = new LootSystem(this);
        this.shopSystem = new ShopSystem(this);

        // Add world resources to skills system
        for (const resource of this.world.resources) {
            this.skillsSystem.addResource(resource);
        }
        this.engine.updateLoadingProgress(80);

        // Setup camera
        this.setupCamera();
        window.gameCamera = this.camera; // For sprite billboarding

        // Setup controls
        this.setupControls();

        // Initialize UI
        this.ui = new UIManager(this);
        this.ui.updateStats();
        this.ui.updateInventory();
        this.ui.addMessage('Welcome to Lumbridge!', 'game');
        this.ui.addMessage('Use WASD or Arrow keys to move, click to interact.', 'system');

        this.engine.updateLoadingProgress(90);

        // Setup update loop
        this.engine.onUpdate((delta) => this.update(delta));
        this.engine.onRender(() => this.render());

        // Setup event listeners
        this.setupEventListeners();

        this.engine.updateLoadingProgress(100);
        this.engine.hideLoadingScreen();

        // Start game loop
        this.engine.start();
    }

    /**
     * Setup camera
     */
    setupCamera() {
        this.camera = this.engine.camera;
        this.updateCamera();
    }

    /**
     * Update camera position
     */
    updateCamera() {
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
    setupControls() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse camera rotation
        window.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle mouse button
                this.mouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                e.preventDefault();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 1) {
                this.mouseDown = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.mouseDown) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                this.cameraRotation -= deltaX * 0.005;
                this.cameraAngle = Math.max(0.1, Math.min(Math.PI / 2.5, this.cameraAngle + deltaY * 0.005));

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;

                this.updateCamera();
            }
        });

        // Mouse wheel zoom
        window.addEventListener('wheel', (e) => {
            this.cameraDistance = Math.max(
                CAMERA.MIN_DISTANCE,
                Math.min(CAMERA.MAX_DISTANCE, this.cameraDistance + e.deltaY * 0.01)
            );
            this.updateCamera();
        });
    }

    /**
     * Setup game event listeners
     */
    setupEventListeners() {
        // Click events
        window.addEventListener('gameClick', (e) => {
            this.handleGameClick(e.detail);
        });

        // Level up events
        window.addEventListener('levelUp', (e) => {
            this.ui.showLevelUp(e.detail.skill, e.detail.level);
        });
    }

    /**
     * Handle game world clicks
     */
    handleGameClick(detail) {
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
                    this.combatSystem.attackTarget(enemy);
                }
            } else if (type === 'npc') {
                const npc = object.userData.entity || object.parent?.userData?.entity;
                if (npc) {
                    // Check for quest-related dialogue
                    const questDialogue = this.questSystem
                        ? this.questSystem.getNPCDialogue(npc.npcId || npc.name, this.player)
                        : null;

                    const dialogue = questDialogue || npc.talk();
                    this.ui.addMessage(`${npc.name}: ${dialogue}`, 'npc');
                }
            } else if (type === 'resource') {
                const resource = object.userData.resource || object.parent?.userData?.resource;
                if (resource && !resource.depleted) {
                    this.skillsSystem.gatherResource(resource);
                }
            }
        }
        // Right click
        else if (button === 'right') {
            if (type === 'enemy') {
                const enemy = object.userData.entity || object.parent?.userData?.entity;
                if (enemy) {
                    this.showContextMenu(mouseX, mouseY, [
                        { label: `Attack ${enemy.name}`, action: () => this.combatSystem.attackTarget(enemy) },
                        { label: 'Examine', action: () => this.ui.addMessage(`A ${enemy.name} (Level ${enemy.level})`, 'game') }
                    ]);
                }
            } else if (type === 'npc') {
                const npc = object.userData.entity || object.parent?.userData?.entity;
                if (npc) {
                    const menuOptions = [];

                    // Add quest options if available
                    if (this.questSystem) {
                        const questOptions = this.questSystem.getQuestOptions(npc.npcId || npc.name, this.player);
                        menuOptions.push(...questOptions.map(opt => ({
                            label: opt.label,
                            action: () => {
                                const result = this.questSystem.handleQuestInteraction(opt.questId, opt.action, this.player);
                                if (result && result.message) {
                                    this.ui.addMessage(`${npc.name}: ${result.message}`, 'npc');
                                }
                                if (result && result.updateUI) {
                                    this.ui.updateStats();
                                }
                            }
                        })));
                    }

                    // Add standard talk option
                    menuOptions.push(
                        { label: 'Talk-to', action: () => {
                            const questDialogue = this.questSystem
                                ? this.questSystem.getNPCDialogue(npc.npcId || npc.name, this.player)
                                : null;
                            const dialogue = questDialogue || npc.talk();
                            this.ui.addMessage(`${npc.name}: ${dialogue}`, 'npc');
                        }},
                        { label: 'Examine', action: () => this.ui.addMessage(`This is ${npc.name}.`, 'game') }
                    );

                    this.showContextMenu(mouseX, mouseY, menuOptions);
                }
            } else if (type === 'resource') {
                const resource = object.userData.resource || object.parent?.userData?.resource;
                if (resource) {
                    const skillName = this.skillsSystem.getRequiredSkill(resource.type);
                    this.showContextMenu(mouseX, mouseY, [
                        { label: `Chop ${resource.name}`, action: () => this.skillsSystem.gatherResource(resource) },
                        { label: 'Examine', action: () => this.ui.addMessage(`A ${resource.name}. Requires level ${resource.levelRequired} ${skillName}.`, 'game') }
                    ]);
                }
            }
        }
    }

    /**
     * Show context menu
     */
    showContextMenu(x, y, options) {
        const menu = this.ui.createContextMenu(options);
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        document.body.appendChild(menu);

        setTimeout(() => {
            const removeMenu = () => {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            };
            document.addEventListener('click', removeMenu);
        }, 10);
    }

    /**
     * Handle player movement from keyboard
     */
    handleMovement(delta) {
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
    createDamageSplash(position, damage) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
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

        this.engine.scene.add(sprite);

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
    updateDamageSplashes() {
        const now = Date.now();

        for (let i = this.damageSplashes.length - 1; i >= 0; i--) {
            const splash = this.damageSplashes[i];
            const elapsed = now - splash.startTime;

            if (elapsed >= splash.duration) {
                this.engine.scene.remove(splash.sprite);
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
    update(delta) {
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
    render() {
        // Additional rendering if needed
    }
}

export default GameLogic;

/**
 * InteractionHandler - Handles click interactions and context menus
 * Extracted from GameLogic to reduce god object complexity
 */

import * as THREE from 'three';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { NPC } from '../entities/NPC';
import type { CombatSystem } from '../systems/CombatSystem';
import type { SkillsSystem } from '../systems/SkillsSystem';
import type { QuestSystem } from '../systems/QuestSystem';
import type { UIManager } from '../ui/UIManager';

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
export interface GameClickDetail {
    object: THREE.Object3D;
    point: THREE.Vector3;
    button: 'left' | 'right';
    mouseX?: number;
    mouseY?: number;
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
 * Interaction context - dependencies needed for handling interactions
 */
export interface IInteractionContext {
    readonly player: Player;
    readonly ui: UIManager;
    readonly combatSystem: CombatSystem;
    readonly skillsSystem: SkillsSystem;
    readonly questSystem: QuestSystem | null;
}

/**
 * Interaction Handler interface for dependency injection
 */
export interface IInteractionHandler {
    handleClick(detail: GameClickDetail): void;
    showContextMenu(x: number, y: number, options: ContextMenuOption[]): void;
    dispose(): void;
}

/**
 * InteractionHandler class - Handles click interactions
 */
export class InteractionHandler implements IInteractionHandler {
    private context: IInteractionContext | null = null;

    // Context menu state for proper cleanup
    private activeContextMenu: HTMLDivElement | null = null;
    private contextMenuClickHandler: ((e: MouseEvent) => void) | null = null;

    constructor(context?: IInteractionContext) {
        if (context) {
            this.context = context;
        }
    }

    /**
     * Set the context (for lazy initialization)
     */
    setContext(context: IInteractionContext): void {
        this.context = context;
    }

    /**
     * Handle game click event
     */
    handleClick(detail: GameClickDetail): void {
        if (!this.context) return;

        const { player, ui, combatSystem, skillsSystem, questSystem } = this.context;
        const { object, point, button, mouseX, mouseY } = detail;

        if (!object || !object.userData) return;

        const type = object.userData.type || object.parent?.userData?.type;

        // Left click
        if (button === 'left') {
            if (type === 'terrain') {
                player.moveTo(point.x, point.z);
                combatSystem.stopCombat();
                ui.addMessage(`Walking to (${Math.floor(point.x)}, ${Math.floor(point.z)})`, 'game');
            } else if (type === 'enemy') {
                const enemy = object.userData.entity || object.parent?.userData?.entity;
                if (enemy && !enemy.isDead) {
                    combatSystem.attackTarget(enemy as Enemy);
                }
            } else if (type === 'npc') {
                const npc = object.userData.entity || object.parent?.userData?.entity;
                if (npc) {
                    const questDialogue = questSystem
                        ? questSystem.getNPCDialogue((npc as NPC).npcId || (npc as NPC).name, player)
                        : null;
                    const dialogue = questDialogue || (npc as NPC).talk();
                    ui.addMessage(`${(npc as NPC).name}: ${dialogue}`, 'game');
                }
            } else if (type === 'resource') {
                const resource = object.userData.resource || object.parent?.userData?.resource;
                if (resource && !resource.depleted) {
                    skillsSystem.gatherResource(resource);
                }
            }
        }
        // Right click
        else if (button === 'right' && mouseX !== undefined && mouseY !== undefined) {
            if (type === 'enemy') {
                const enemy = object.userData.entity || object.parent?.userData?.entity;
                if (enemy) {
                    this.showContextMenu(mouseX, mouseY, [
                        { label: `Attack ${(enemy as Enemy).name}`, action: () => combatSystem.attackTarget(enemy as Enemy) },
                        { label: 'Examine', action: () => ui.addMessage(`A ${(enemy as Enemy).name} (Level ${(enemy as Enemy).level})`, 'game') }
                    ]);
                }
            } else if (type === 'npc') {
                const npc = object.userData.entity || object.parent?.userData?.entity;
                if (npc) {
                    const menuOptions: ContextMenuOption[] = [];

                    // Add quest options if available
                    if (questSystem) {
                        const questOptions = questSystem.getQuestOptions((npc as NPC).npcId || (npc as NPC).name, player);
                        menuOptions.push(...questOptions.map(opt => ({
                            label: opt.label,
                            action: () => {
                                const result = questSystem.handleQuestInteraction(opt.questId, opt.action, player);
                                if (result && result.message) {
                                    ui.addMessage(`${(npc as NPC).name}: ${result.message}`, 'game');
                                }
                                if (result && result.updateUI) {
                                    ui.updateStats();
                                }
                            }
                        })));
                    }

                    // Add standard talk option
                    menuOptions.push(
                        { label: 'Talk-to', action: () => {
                            const questDialogue = questSystem
                                ? questSystem.getNPCDialogue((npc as NPC).npcId || (npc as NPC).name, player)
                                : null;
                            const dialogue = questDialogue || (npc as NPC).talk();
                            ui.addMessage(`${(npc as NPC).name}: ${dialogue}`, 'game');
                        }},
                        { label: 'Examine', action: () => ui.addMessage(`This is ${(npc as NPC).name}.`, 'game') }
                    );

                    this.showContextMenu(mouseX, mouseY, menuOptions);
                }
            } else if (type === 'resource') {
                const resource = object.userData.resource || object.parent?.userData?.resource;
                if (resource) {
                    const skillName = skillsSystem.getRequiredSkill((resource as Resource).type);
                    this.showContextMenu(mouseX, mouseY, [
                        { label: `Chop ${(resource as Resource).name}`, action: () => skillsSystem.gatherResource(resource) },
                        { label: 'Examine', action: () => ui.addMessage(`A ${(resource as Resource).name}. Requires level ${(resource as Resource).levelRequired} ${skillName}.`, 'game') }
                    ]);
                }
            }
        }
    }

    /**
     * Show context menu
     */
    showContextMenu(x: number, y: number, options: ContextMenuOption[]): void {
        if (!this.context?.ui) return;

        // Close any existing context menu first
        this.closeContextMenu();

        const menu = this.context.ui.createContextMenu(options);
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        document.body.appendChild(menu);
        this.activeContextMenu = menu;

        // Attach click listener (use setTimeout(0) to prevent current click from closing)
        this.contextMenuClickHandler = (e: MouseEvent): void => {
            if (!menu.contains(e.target as Node)) {
                this.closeContextMenu();
            }
        };
        setTimeout(() => {
            if (this.contextMenuClickHandler) {
                document.addEventListener('click', this.contextMenuClickHandler);
            }
        }, 0);
    }

    /**
     * Close active context menu and cleanup handler
     */
    private closeContextMenu(): void {
        if (this.activeContextMenu) {
            this.activeContextMenu.remove();
            this.activeContextMenu = null;
        }
        if (this.contextMenuClickHandler) {
            document.removeEventListener('click', this.contextMenuClickHandler);
            this.contextMenuClickHandler = null;
        }
    }

    /**
     * Dispose of resources
     */
    dispose(): void {
        this.closeContextMenu();
        this.context = null;
    }
}

export default InteractionHandler;

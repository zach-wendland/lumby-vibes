/**
 * InteractionHandler Service Tests
 * Tests for click interactions and context menus
 */

import * as THREE from 'three';
import { InteractionHandler, IInteractionContext, GameClickDetail } from '../../src/services/InteractionHandler';

// Mock dependencies
const createMockPlayer = () => ({
    moveTo: jest.fn(),
    position: { x: 0, z: 0 }
});

const createMockUI = () => ({
    addMessage: jest.fn(),
    updateStats: jest.fn(),
    createContextMenu: jest.fn().mockReturnValue(document.createElement('div'))
});

const createMockCombatSystem = () => ({
    stopCombat: jest.fn(),
    attackTarget: jest.fn()
});

const createMockSkillsSystem = () => ({
    gatherResource: jest.fn(),
    getRequiredSkill: jest.fn().mockReturnValue('Woodcutting')
});

const createMockQuestSystem = () => ({
    getNPCDialogue: jest.fn().mockReturnValue(null),
    getQuestOptions: jest.fn().mockReturnValue([]),
    handleQuestInteraction: jest.fn().mockReturnValue({ message: 'Quest updated', updateUI: true })
});

const createMockContext = (): IInteractionContext => ({
    player: createMockPlayer() as any,
    ui: createMockUI() as any,
    combatSystem: createMockCombatSystem() as any,
    skillsSystem: createMockSkillsSystem() as any,
    questSystem: createMockQuestSystem() as any
});

describe('InteractionHandler', () => {
    let interactionHandler: InteractionHandler;
    let mockContext: IInteractionContext;

    beforeEach(() => {
        mockContext = createMockContext();
        interactionHandler = new InteractionHandler(mockContext);
    });

    afterEach(() => {
        interactionHandler.dispose();
    });

    describe('constructor', () => {
        it('should initialize without context', () => {
            const handler = new InteractionHandler();
            expect(handler).toBeDefined();
            handler.dispose();
        });

        it('should accept context in constructor', () => {
            const handler = new InteractionHandler(mockContext);
            expect(handler).toBeDefined();
            handler.dispose();
        });
    });

    describe('setContext', () => {
        it('should set context for lazy initialization', () => {
            const handler = new InteractionHandler();
            handler.setContext(mockContext);

            const detail: GameClickDetail = {
                object: createMockTerrainObject(),
                point: new THREE.Vector3(10, 0, 10),
                button: 'left'
            };

            handler.handleClick(detail);

            expect(mockContext.player.moveTo).toHaveBeenCalled();
            handler.dispose();
        });
    });

    describe('handleClick - terrain', () => {
        it('should move player on left click', () => {
            const detail: GameClickDetail = {
                object: createMockTerrainObject(),
                point: new THREE.Vector3(25, 0, 30),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.player.moveTo).toHaveBeenCalledWith(25, 30);
        });

        it('should stop combat when moving', () => {
            const detail: GameClickDetail = {
                object: createMockTerrainObject(),
                point: new THREE.Vector3(10, 0, 10),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.combatSystem.stopCombat).toHaveBeenCalled();
        });

        it('should display walking message', () => {
            const detail: GameClickDetail = {
                object: createMockTerrainObject(),
                point: new THREE.Vector3(15, 0, 20),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.ui.addMessage).toHaveBeenCalledWith(
                expect.stringContaining('Walking to'),
                'game'
            );
        });
    });

    describe('handleClick - enemy', () => {
        it('should attack enemy on left click', () => {
            const mockEnemy = { name: 'Goblin', isDead: false };
            const detail: GameClickDetail = {
                object: createMockEnemyObject(mockEnemy),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.combatSystem.attackTarget).toHaveBeenCalledWith(mockEnemy);
        });

        it('should not attack dead enemies', () => {
            const mockEnemy = { name: 'Goblin', isDead: true };
            const detail: GameClickDetail = {
                object: createMockEnemyObject(mockEnemy),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.combatSystem.attackTarget).not.toHaveBeenCalled();
        });

        it('should show context menu on right click', () => {
            const mockEnemy = { name: 'Goblin', level: 5 };
            const detail: GameClickDetail = {
                object: createMockEnemyObject(mockEnemy),
                point: new THREE.Vector3(0, 0, 0),
                button: 'right',
                mouseX: 100,
                mouseY: 200
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.ui.createContextMenu).toHaveBeenCalled();
        });
    });

    describe('handleClick - NPC', () => {
        it('should talk to NPC on left click', () => {
            const mockNPC = { name: 'Hans', talk: jest.fn().mockReturnValue('Hello!') };
            const detail: GameClickDetail = {
                object: createMockNPCObject(mockNPC),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.ui.addMessage).toHaveBeenCalledWith(
                expect.stringContaining('Hans'),
                'game'
            );
        });

        it('should use quest dialogue when available', () => {
            mockContext.questSystem!.getNPCDialogue = jest.fn().mockReturnValue('Quest dialogue!');
            const mockNPC = { name: 'Hans', npcId: 'HANS', talk: jest.fn().mockReturnValue('Normal dialogue') };
            const detail: GameClickDetail = {
                object: createMockNPCObject(mockNPC),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.ui.addMessage).toHaveBeenCalledWith(
                expect.stringContaining('Quest dialogue'),
                'game'
            );
        });

        it('should show context menu on right click', () => {
            const mockNPC = { name: 'Hans', npcId: 'HANS' };
            const detail: GameClickDetail = {
                object: createMockNPCObject(mockNPC),
                point: new THREE.Vector3(0, 0, 0),
                button: 'right',
                mouseX: 100,
                mouseY: 200
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.ui.createContextMenu).toHaveBeenCalled();
        });
    });

    describe('handleClick - resource', () => {
        it('should gather resource on left click', () => {
            const mockResource = { type: 'tree', name: 'Oak tree', depleted: false };
            const detail: GameClickDetail = {
                object: createMockResourceObject(mockResource),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.skillsSystem.gatherResource).toHaveBeenCalledWith(mockResource);
        });

        it('should not gather depleted resources', () => {
            const mockResource = { type: 'tree', name: 'Oak tree', depleted: true };
            const detail: GameClickDetail = {
                object: createMockResourceObject(mockResource),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.skillsSystem.gatherResource).not.toHaveBeenCalled();
        });

        it('should show context menu on right click', () => {
            const mockResource = { type: 'tree', name: 'Oak tree', levelRequired: 15 };
            const detail: GameClickDetail = {
                object: createMockResourceObject(mockResource),
                point: new THREE.Vector3(0, 0, 0),
                button: 'right',
                mouseX: 100,
                mouseY: 200
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.ui.createContextMenu).toHaveBeenCalled();
        });
    });

    describe('handleClick - edge cases', () => {
        it('should handle null object', () => {
            const detail: GameClickDetail = {
                object: null as any,
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            expect(() => {
                interactionHandler.handleClick(detail);
            }).not.toThrow();
        });

        it('should handle object without userData', () => {
            const detail: GameClickDetail = {
                object: new THREE.Object3D(),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            expect(() => {
                interactionHandler.handleClick(detail);
            }).not.toThrow();
        });

        it('should handle no context', () => {
            const handler = new InteractionHandler();
            const detail: GameClickDetail = {
                object: createMockTerrainObject(),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            expect(() => {
                handler.handleClick(detail);
            }).not.toThrow();

            handler.dispose();
        });

        it('should check parent userData if object userData has no type', () => {
            const parent = new THREE.Object3D();
            parent.userData = { type: 'terrain' };

            const child = new THREE.Object3D();
            child.userData = {}; // No type
            parent.add(child);

            const detail: GameClickDetail = {
                object: child,
                point: new THREE.Vector3(5, 0, 5),
                button: 'left'
            };

            interactionHandler.handleClick(detail);

            expect(mockContext.player.moveTo).toHaveBeenCalled();
        });
    });

    describe('showContextMenu', () => {
        it('should create and position context menu', () => {
            const options = [
                { label: 'Option 1', action: jest.fn() },
                { label: 'Option 2', action: jest.fn() }
            ];

            interactionHandler.showContextMenu(150, 250, options);

            expect(mockContext.ui.createContextMenu).toHaveBeenCalledWith(options);
        });

        it('should close previous context menu before opening new one', () => {
            const options1 = [{ label: 'Option 1', action: jest.fn() }];
            const options2 = [{ label: 'Option 2', action: jest.fn() }];

            interactionHandler.showContextMenu(100, 100, options1);
            interactionHandler.showContextMenu(200, 200, options2);

            // Should not have multiple menus
            expect(mockContext.ui.createContextMenu).toHaveBeenCalledTimes(2);
        });

        it('should handle no UI context gracefully', () => {
            const handler = new InteractionHandler();
            const options = [{ label: 'Option', action: jest.fn() }];

            expect(() => {
                handler.showContextMenu(100, 100, options);
            }).not.toThrow();

            handler.dispose();
        });
    });

    describe('dispose', () => {
        it('should close active context menu', () => {
            const options = [{ label: 'Option', action: jest.fn() }];
            interactionHandler.showContextMenu(100, 100, options);

            // Dispose should close the menu
            interactionHandler.dispose();

            // Calling again should not throw
            expect(() => {
                interactionHandler.dispose();
            }).not.toThrow();
        });

        it('should clear context reference', () => {
            interactionHandler.dispose();

            const detail: GameClickDetail = {
                object: createMockTerrainObject(),
                point: new THREE.Vector3(0, 0, 0),
                button: 'left'
            };

            // Should not call any methods after dispose
            interactionHandler.handleClick(detail);
            expect(mockContext.player.moveTo).not.toHaveBeenCalled();
        });
    });
});

// Helper functions to create mock objects
function createMockTerrainObject(): THREE.Object3D {
    const obj = new THREE.Object3D();
    obj.userData = { type: 'terrain' };
    return obj;
}

function createMockEnemyObject(enemy: any): THREE.Object3D {
    const obj = new THREE.Object3D();
    obj.userData = { type: 'enemy', entity: enemy };
    return obj;
}

function createMockNPCObject(npc: any): THREE.Object3D {
    const obj = new THREE.Object3D();
    obj.userData = { type: 'npc', entity: npc };
    return obj;
}

function createMockResourceObject(resource: any): THREE.Object3D {
    const obj = new THREE.Object3D();
    obj.userData = { type: 'resource', resource: resource };
    return obj;
}

/**
 * InputManager Service Tests
 * Tests for keyboard input handling and player movement
 */

import { InputManager } from '../../src/services/InputManager';

// Mock Player
const createMockPlayer = () => ({
    position: { x: 0, z: 0 },
    speed: 5,
    rotation: 0,
    inCombat: false,
    target: null
});

// Mock CombatSystem
const createMockCombatSystem = () => ({
    stopCombat: jest.fn()
});

describe('InputManager', () => {
    let inputManager: InputManager;

    beforeEach(() => {
        inputManager = new InputManager();
    });

    afterEach(() => {
        inputManager.dispose();
    });

    describe('constructor', () => {
        it('should initialize with empty keys', () => {
            expect(inputManager.keys).toEqual({});
        });
    });

    describe('setupControls', () => {
        it('should add event listeners to window', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

            inputManager.setupControls();

            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

            addEventListenerSpy.mockRestore();
        });
    });

    describe('keyboard input', () => {
        beforeEach(() => {
            inputManager.setupControls();
        });

        it('should track keydown events', () => {
            const event = new KeyboardEvent('keydown', { code: 'KeyW' });
            window.dispatchEvent(event);

            expect(inputManager.keys['KeyW']).toBe(true);
        });

        it('should track keyup events', () => {
            // Press key
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
            expect(inputManager.keys['KeyW']).toBe(true);

            // Release key
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
            expect(inputManager.keys['KeyW']).toBe(false);
        });

        it('should track multiple keys simultaneously', () => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

            expect(inputManager.keys['KeyW']).toBe(true);
            expect(inputManager.keys['KeyA']).toBe(true);
        });
    });

    describe('handleMovement', () => {
        const delta = 0.016; // ~60 FPS

        it('should not move player when no keys are pressed', () => {
            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.position.x).toBe(0);
            expect(player.position.z).toBe(0);
        });

        it('should move player forward when W is pressed', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.position.z).toBeLessThan(0);
        });

        it('should move player backward when S is pressed', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.position.z).toBeGreaterThan(0);
        });

        it('should move player left when A is pressed', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.position.x).toBeLessThan(0);
        });

        it('should move player right when D is pressed', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.position.x).toBeGreaterThan(0);
        });

        it('should support arrow keys', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.position.z).toBeLessThan(0);
        });

        it('should normalize diagonal movement', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            // Diagonal movement should be normalized (roughly same speed as cardinal)
            const distance = Math.sqrt(player.position.x ** 2 + player.position.z ** 2);
            const expectedDistance = player.speed * delta;

            expect(distance).toBeCloseTo(expectedDistance, 3);
        });

        it('should update player rotation', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));

            const player = createMockPlayer();
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(player.rotation).not.toBe(0);
        });

        it('should stop combat when player moves manually', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

            const player = createMockPlayer();
            player.inCombat = true;
            player.target = {} as any;
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(combat.stopCombat).toHaveBeenCalled();
        });

        it('should not stop combat if player is not in combat', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

            const player = createMockPlayer();
            player.inCombat = false;
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            expect(combat.stopCombat).not.toHaveBeenCalled();
        });

        it('should respect world bounds', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

            const player = createMockPlayer();
            player.position.z = -139; // Near boundary
            player.speed = 1000; // Very fast
            const combat = createMockCombatSystem();

            inputManager.handleMovement(delta, player as any, combat as any);

            // Should not move past bound
            expect(player.position.z).toBeGreaterThan(-140);
        });

        it('should handle null player gracefully', () => {
            expect(() => {
                inputManager.handleMovement(delta, null as any, null);
            }).not.toThrow();
        });
    });

    describe('dispose', () => {
        it('should remove event listeners', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            inputManager.setupControls();
            inputManager.dispose();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should clear keys state', () => {
            inputManager.setupControls();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
            expect(inputManager.keys['KeyW']).toBe(true);

            inputManager.dispose();

            expect(inputManager.keys).toEqual({});
        });
    });
});

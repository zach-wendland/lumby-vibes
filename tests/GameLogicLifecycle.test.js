/**
 * GameLogic Lifecycle Tests
 * Tests for GameLogic dispose() method and cleanup behavior
 */

import { GameLogic } from '../src/game/GameLogic.ts';

// Mock PostProcessingManager
jest.mock('../src/engine/PostProcessingManager.ts', () => ({
    PostProcessingManager: jest.fn().mockImplementation(() => ({
        init: jest.fn(),
        render: jest.fn(),
        onResize: jest.fn(),
        dispose: jest.fn()
    }))
}));

describe('GameLogic lifecycle safeguards', () => {
    beforeEach(() => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        jest.clearAllMocks();
    });

    test('dispose removes all event listeners', () => {
        const windowRemoveSpy = jest.spyOn(window, 'removeEventListener');

        const gameLogic = new GameLogic();
        gameLogic.dispose();

        // Verify all event listeners were removed
        const removedEvents = windowRemoveSpy.mock.calls.map((call) => call[0]);
        expect(removedEvents).toContain('keydown');
        expect(removedEvents).toContain('keyup');
        expect(removedEvents).toContain('mousedown');
        expect(removedEvents).toContain('mouseup');
        expect(removedEvents).toContain('mousemove');
        expect(removedEvents).toContain('wheel');
        expect(removedEvents).toContain('gameClick');
        expect(removedEvents).toContain('levelUp');
    });

    test('dispose clears all system references', () => {
        const gameLogic = new GameLogic();

        // Set some mock systems with dispose methods (would normally be set during init)
        const combatDispose = jest.fn();
        const skillsDispose = jest.fn();
        const shopDispose = jest.fn();
        const uiDispose = jest.fn();

        gameLogic.combatSystem = { dispose: combatDispose };
        gameLogic.skillsSystem = { dispose: skillsDispose };
        gameLogic.questSystem = {};
        gameLogic.lootSystem = {};
        gameLogic.shopSystem = { dispose: shopDispose };
        gameLogic.ui = { dispose: uiDispose };

        gameLogic.dispose();

        // Verify dispose was called on systems that have it
        expect(combatDispose).toHaveBeenCalled();
        expect(skillsDispose).toHaveBeenCalled();
        expect(shopDispose).toHaveBeenCalled();
        expect(uiDispose).toHaveBeenCalled();

        // Verify all systems are cleared
        expect(gameLogic.combatSystem).toBeNull();
        expect(gameLogic.skillsSystem).toBeNull();
        expect(gameLogic.questSystem).toBeNull();
        expect(gameLogic.lootSystem).toBeNull();
        expect(gameLogic.shopSystem).toBeNull();
        expect(gameLogic.ui).toBeNull();
    });

    test('dispose clears entity and world references', () => {
        const gameLogic = new GameLogic();

        // Set some mock references with dispose method
        const worldDispose = jest.fn();
        gameLogic.player = {};
        gameLogic.world = { dispose: worldDispose };

        gameLogic.dispose();

        // Verify dispose was called on world
        expect(worldDispose).toHaveBeenCalled();

        // Verify all references are cleared
        expect(gameLogic.player).toBeNull();
        expect(gameLogic.world).toBeNull();
    });

    test('dispose stops the engine', () => {
        const gameLogic = new GameLogic();
        const engineStopSpy = jest.spyOn(gameLogic.engine, 'stop');
        const engineDisposeSpy = jest.spyOn(gameLogic.engine, 'dispose');

        gameLogic.dispose();

        expect(engineStopSpy).toHaveBeenCalled();
        expect(engineDisposeSpy).toHaveBeenCalled();
    });
});

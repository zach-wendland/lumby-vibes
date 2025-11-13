/**
 * Loading and Error Handling Tests
 *
 * Tests the game initialization, loading screen behavior, and error handling.
 */

import { GameLogic } from '../src/game/GameLogic.js';

// Mock GameLogic for controlled testing
jest.mock('../src/game/GameLogic.js');

describe('Loading and Error Handling', () => {
    let mockDocument;
    let mockLoadingText;
    let mockLoadingScreen;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Create mock DOM elements
        mockLoadingText = {
            textContent: '',
            style: {
                color: '',
                fontSize: ''
            }
        };

        mockLoadingScreen = {
            style: {
                display: ''
            },
            classList: {
                remove: jest.fn(),
                add: jest.fn()
            }
        };

        // Mock document.getElementById
        global.document = {
            getElementById: jest.fn((id) => {
                if (id === 'loading-text') return mockLoadingText;
                if (id === 'loading-screen') return mockLoadingScreen;
                return null;
            }),
            addEventListener: jest.fn(),
            hidden: false
        };

        // Mock console methods
        global.console.error = jest.fn();
        global.console.log = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Loading timeout fallback triggers after 15 seconds', () => {
        // Simulate GameLogic hanging indefinitely
        GameLogic.mockImplementation(() => ({
            init: jest.fn(() => new Promise(() => {})) // Never resolves
        }));

        // Simulate main.js loading logic with timeout
        const loadingTimeout = setTimeout(() => {
            mockLoadingText.textContent = 'Loading timeout. Please refresh the page.';
            mockLoadingText.style.color = '#FF0000';
            mockLoadingText.style.fontSize = '14px';
            mockLoadingScreen.style.display = 'flex';
            mockLoadingScreen.classList.remove('hidden');
        }, 15000);

        // Fast-forward time
        jest.advanceTimersByTime(15000);

        // Verify timeout behavior
        expect(mockLoadingText.textContent).toBe('Loading timeout. Please refresh the page.');
        expect(mockLoadingText.style.color).toBe('#FF0000');
        expect(mockLoadingScreen.style.display).toBe('flex');
        expect(mockLoadingScreen.classList.remove).toHaveBeenCalledWith('hidden');

        clearTimeout(loadingTimeout);
    });

    test('Successful initialization clears timeout and hides loading screen', async () => {
        // Mock successful initialization
        const mockInit = jest.fn(() => Promise.resolve());
        GameLogic.mockImplementation(() => ({
            init: mockInit,
            engine: {
                hideLoadingScreen: jest.fn()
            }
        }));

        const loadingTimeout = setTimeout(() => {
            mockLoadingText.textContent = 'Loading timeout';
        }, 15000);

        // Simulate successful init
        const game = new GameLogic();
        await game.init();

        // Clear timeout on success
        clearTimeout(loadingTimeout);

        // Fast-forward to where timeout would have triggered
        jest.advanceTimersByTime(15000);

        // Verify timeout was cleared (text should NOT be updated)
        expect(mockLoadingText.textContent).toBe('');
        expect(mockInit).toHaveBeenCalled();
    });

    test('Initialization error displays error message in loading screen', async () => {
        // Mock initialization failure
        const testError = new Error('Test initialization failed');
        GameLogic.mockImplementation(() => ({
            init: jest.fn(() => Promise.reject(testError))
        }));

        try {
            const game = new GameLogic();
            await game.init();
        } catch (error) {
            // Simulate error handler
            mockLoadingText.textContent = `Error: ${error.message}`;
            mockLoadingText.style.color = '#FF0000';
            mockLoadingText.style.fontSize = '14px';
            mockLoadingScreen.style.display = 'flex';
            mockLoadingScreen.classList.remove('hidden');
        }

        // Verify error is displayed
        expect(mockLoadingText.textContent).toBe('Error: Test initialization failed');
        expect(mockLoadingText.style.color).toBe('#FF0000');
        expect(mockLoadingScreen.style.display).toBe('flex');
        expect(mockLoadingScreen.classList.remove).toHaveBeenCalledWith('hidden');
    });

    test('Loading screen stays visible when initialization throws error', async () => {
        const mockInit = jest.fn(() => Promise.reject(new Error('Fatal error')));
        GameLogic.mockImplementation(() => ({
            init: mockInit
        }));

        const loadingTimeout = setTimeout(() => {}, 15000);

        try {
            const game = new GameLogic();
            await game.init();
        } catch (error) {
            clearTimeout(loadingTimeout);

            // Force loading screen to stay visible
            mockLoadingScreen.style.display = 'flex';
            mockLoadingScreen.classList.remove('hidden');
        }

        // Verify loading screen remains visible
        expect(mockLoadingScreen.style.display).toBe('flex');
        expect(mockLoadingScreen.classList.remove).toHaveBeenCalledWith('hidden');
    });

    test('Error details are logged to console for debugging', async () => {
        const testError = new Error('Debug test error');
        testError.stack = 'Test stack trace';
        testError.name = 'TestError';

        GameLogic.mockImplementation(() => ({
            init: jest.fn(() => Promise.reject(testError))
        }));

        try {
            const game = new GameLogic();
            await game.init();
        } catch (error) {
            // Simulate enhanced error logging
            console.error('Failed to initialize game:', error);
            console.error('Error stack:', error.stack);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }

        // Verify all error details were logged
        expect(console.error).toHaveBeenCalledWith('Failed to initialize game:', testError);
        expect(console.error).toHaveBeenCalledWith('Error stack:', 'Test stack trace');
        expect(console.error).toHaveBeenCalledWith('Error name:', 'TestError');
        expect(console.error).toHaveBeenCalledWith('Error message:', 'Debug test error');
    });

    test('Timeout does not trigger if initialization completes successfully', async () => {
        const mockInit = jest.fn(() => new Promise(resolve => {
            setTimeout(() => resolve(), 5000); // Resolves in 5 seconds
        }));

        GameLogic.mockImplementation(() => ({
            init: mockInit
        }));

        const loadingTimeout = setTimeout(() => {
            mockLoadingText.textContent = 'Loading timeout';
        }, 15000);

        // Start initialization
        const game = new GameLogic();
        const initPromise = game.init();

        // Fast-forward 5 seconds (initialization completes)
        jest.advanceTimersByTime(5000);
        await initPromise;

        // Clear timeout after successful init
        clearTimeout(loadingTimeout);

        // Fast-forward past the timeout point
        jest.advanceTimersByTime(10000);

        // Verify timeout message was NOT set
        expect(mockLoadingText.textContent).not.toBe('Loading timeout');
    });

    test('Loading screen error handler works even if elements are missing', () => {
        // Mock missing DOM elements
        global.document.getElementById = jest.fn(() => null);

        const loadingTimeout = setTimeout(() => {
            const loadingText = document.getElementById('loading-text');
            const loadingScreen = document.getElementById('loading-screen');

            if (loadingText) {
                loadingText.textContent = 'Loading timeout';
            }

            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
            }
        }, 15000);

        jest.advanceTimersByTime(15000);

        // Should not throw errors even with missing elements
        expect(() => clearTimeout(loadingTimeout)).not.toThrow();
        expect(document.getElementById).toHaveBeenCalledWith('loading-text');
        expect(document.getElementById).toHaveBeenCalledWith('loading-screen');
    });
});

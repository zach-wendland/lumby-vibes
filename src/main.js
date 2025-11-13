/**
 * Main entry point for Lumbridge Three.js game
 */

import { GameLogic } from './game/GameLogic.js';

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Lumbridge...');

    // Add loading timeout fallback (15 seconds)
    const loadingTimeout = setTimeout(() => {
        console.error('Loading timeout - game failed to initialize within 15 seconds');
        const loadingText = document.getElementById('loading-text');
        const loadingScreen = document.getElementById('loading-screen');

        if (loadingText) {
            loadingText.textContent = 'Loading timeout. Please refresh the page.';
            loadingText.style.color = '#FF0000';
            loadingText.style.fontSize = '14px';
        }

        if (loadingScreen) {
            loadingScreen.style.display = 'flex'; // Ensure it stays visible
            loadingScreen.classList.remove('hidden');
        }
    }, 15000);

    try {
        console.log('Step 1: Creating GameLogic');
        const game = new GameLogic();

        console.log('Step 2: Initializing game');
        await game.init();

        // Clear timeout on successful init
        clearTimeout(loadingTimeout);

        // Make game accessible for debugging
        window.game = game;

        console.log('Lumbridge initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        // Clear timeout since we caught an error
        clearTimeout(loadingTimeout);

        const loadingText = document.getElementById('loading-text');
        const loadingScreen = document.getElementById('loading-screen');

        if (loadingText) {
            loadingText.textContent = `Error: ${error.message}`;
            loadingText.style.color = '#FF0000';
            loadingText.style.fontSize = '14px';
        }

        // Force loading screen to stay visible with error
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.remove('hidden');
        }
    }
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.engine.stop();
        } else {
            window.game.engine.start();
        }
    }
});

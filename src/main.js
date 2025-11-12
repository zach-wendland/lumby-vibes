/**
 * Main entry point for Lumbridge Three.js game
 */

import { GameLogic } from './game/GameLogic.js';

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Lumbridge...');

    try {
        console.log('Step 1: Creating GameLogic');
        const game = new GameLogic();

        console.log('Step 2: Initializing game');
        await game.init();

        // Make game accessible for debugging
        window.game = game;

        console.log('Lumbridge initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        console.error('Error stack:', error.stack);

        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = `Error: ${error.message}`;
            loadingText.style.color = '#FF0000';
            loadingText.style.fontSize = '14px';
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

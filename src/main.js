/**
 * Main entry point for Lumbridge Three.js game
 */

import { GameLogic } from './game/GameLogic.js';

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Lumbridge...');

    try {
        const game = new GameLogic();
        await game.init();

        // Make game accessible for debugging
        window.game = game;

        console.log('Lumbridge initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);

        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = 'Error loading game. Please refresh the page.';
            loadingText.style.color = '#FF0000';
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

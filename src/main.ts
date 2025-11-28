/**
 * Main entry point for Lumbridge Three.js game
 * TypeScript version
 */

import * as THREE from 'three';
import { GameLogic } from './game/GameLogic';

// Extend Window interface for game debugging
declare global {
    interface Window {
        game: GameLogic | undefined;
        gameCamera: THREE.Camera | undefined;
    }
}

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

        const err = error as Error;
        console.error('Error stack:', err.stack);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);

        // Clear timeout since we caught an error
        clearTimeout(loadingTimeout);

        const loadingText = document.getElementById('loading-text');
        const loadingScreen = document.getElementById('loading-screen');

        if (loadingText) {
            loadingText.textContent = `Error: ${err.message}`;
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

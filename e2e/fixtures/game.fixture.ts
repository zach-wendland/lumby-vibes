import { test as base, expect } from '@playwright/test';
import { GamePage } from '../pages/GamePage';
import { UIPage } from '../pages/UIPage';
import { CanvasPage } from '../pages/CanvasPage';

/**
 * Extended test fixtures for Lumby-Vibes game testing
 *
 * This provides reusable page objects and utilities for all e2e tests
 */
export interface GameFixtures {
    gamePage: GamePage;
    uiPage: UIPage;
    canvasPage: CanvasPage;
}

export const test = base.extend<GameFixtures>({
    gamePage: async ({ page }, use) => {
        const gamePage = new GamePage(page);
        await gamePage.goto();
        await gamePage.waitForGameLoad();
        await use(gamePage);
    },

    uiPage: async ({ page }, use) => {
        const uiPage = new UIPage(page);
        await use(uiPage);
    },

    canvasPage: async ({ page }, use) => {
        const canvasPage = new CanvasPage(page);
        await use(canvasPage);
    },
});

export { expect };

/**
 * Test utilities for common operations
 */
export const testUtils = {
    /**
     * Wait for game to be fully interactive
     */
    async waitForInteractive(page: GamePage): Promise<void> {
        await page.waitForGameLoad();
        // Additional wait for WebGL context
        await page.page.waitForTimeout(500);
    },

    /**
     * Generate random position within bounds
     */
    randomPosition(bound: number = 100): { x: number; z: number } {
        return {
            x: Math.floor(Math.random() * bound * 2) - bound,
            z: Math.floor(Math.random() * bound * 2) - bound,
        };
    },

    /**
     * Simulate time passing in game
     */
    async advanceTime(page: GamePage, ms: number): Promise<void> {
        await page.page.waitForTimeout(ms);
    },
};

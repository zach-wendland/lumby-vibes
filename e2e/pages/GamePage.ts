import { Page, Locator, expect } from '@playwright/test';

/**
 * GamePage - Main page object for the game
 *
 * Handles game initialization, loading, and core interactions
 */
export class GamePage {
    readonly page: Page;
    readonly canvas: Locator;
    readonly loadingScreen: Locator;
    readonly loadingBar: Locator;
    readonly loadingText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.canvas = page.locator('#gameCanvas');
        this.loadingScreen = page.locator('#loading');
        this.loadingBar = page.locator('#loading-bar');
        this.loadingText = page.locator('#loading-text');
    }

    /**
     * Navigate to the game
     */
    async goto(): Promise<void> {
        await this.page.goto('/');
    }

    /**
     * Wait for the game to fully load
     */
    async waitForGameLoad(): Promise<void> {
        // Wait for loading screen to appear and then disappear
        await this.loadingScreen.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
            // Loading screen might already be hidden if game loads fast
        });

        // Wait for loading screen to be hidden
        await this.loadingScreen.waitFor({ state: 'hidden', timeout: 60000 });

        // Verify canvas is visible
        await expect(this.canvas).toBeVisible();
    }

    /**
     * Check if game is loaded
     */
    async isLoaded(): Promise<boolean> {
        const loadingVisible = await this.loadingScreen.isVisible();
        const canvasVisible = await this.canvas.isVisible();
        return !loadingVisible && canvasVisible;
    }

    /**
     * Get loading progress percentage
     */
    async getLoadingProgress(): Promise<number> {
        const style = await this.loadingBar.getAttribute('style');
        if (!style) return 0;
        const match = style.match(/width:\s*(\d+)%/);
        return match ? parseInt(match[1], 10) : 0;
    }

    /**
     * Click on canvas at specific coordinates
     */
    async clickCanvas(x: number, y: number, button: 'left' | 'right' = 'left'): Promise<void> {
        await this.canvas.click({
            position: { x, y },
            button,
        });
    }

    /**
     * Move mouse on canvas
     */
    async moveMouseOnCanvas(x: number, y: number): Promise<void> {
        await this.canvas.hover({ position: { x, y } });
    }

    /**
     * Drag on canvas (for camera rotation)
     */
    async dragOnCanvas(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        button: 'left' | 'middle' | 'right' = 'middle'
    ): Promise<void> {
        const box = await this.canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await this.page.mouse.move(box.x + startX, box.y + startY);
        await this.page.mouse.down({ button });
        await this.page.mouse.move(box.x + endX, box.y + endY);
        await this.page.mouse.up({ button });
    }

    /**
     * Scroll on canvas (for zoom)
     */
    async scrollOnCanvas(deltaY: number): Promise<void> {
        const box = await this.canvas.boundingBox();
        if (!box) throw new Error('Canvas not found');

        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.wheel(0, deltaY);
    }

    /**
     * Press a key
     */
    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    /**
     * Hold a key down
     */
    async keyDown(key: string): Promise<void> {
        await this.page.keyboard.down(key);
    }

    /**
     * Release a key
     */
    async keyUp(key: string): Promise<void> {
        await this.page.keyboard.up(key);
    }

    /**
     * Hold WASD keys for movement
     */
    async movePlayer(direction: 'w' | 'a' | 's' | 'd', duration: number = 500): Promise<void> {
        await this.keyDown(direction.toUpperCase());
        await this.page.waitForTimeout(duration);
        await this.keyUp(direction.toUpperCase());
    }

    /**
     * Access window.game for debugging/testing
     */
    async getGameObject(): Promise<any> {
        return await this.page.evaluate(() => (window as any).game);
    }

    /**
     * Get player position from game state
     */
    async getPlayerPosition(): Promise<{ x: number; z: number }> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.player) return { x: 0, z: 0 };
            return {
                x: game.player.position.x,
                z: game.player.position.z,
            };
        });
    }

    /**
     * Get player stats
     */
    async getPlayerStats(): Promise<any> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.player) return null;
            return {
                skills: game.player.skills,
                hitpoints: game.player.currentHitpoints,
                maxHitpoints: game.player.maxHitpoints,
            };
        });
    }

    /**
     * Get inventory items
     */
    async getInventory(): Promise<any[]> {
        return await this.page.evaluate(() => {
            const game = (window as any).game;
            if (!game || !game.player) return [];
            return game.player.inventory.filter((item: any) => item !== null);
        });
    }
}

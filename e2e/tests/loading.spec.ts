import { test, expect } from '../fixtures/game.fixture';

/**
 * Game Loading Tests
 *
 * Verifies the game loads correctly and initializes properly
 */
test.describe('Game Loading', () => {
    test('should show loading screen initially', async ({ page }) => {
        // Navigate without waiting for load
        await page.goto('/');

        // Loading screen should be visible initially
        const loadingScreen = page.locator('#loading');
        await expect(loadingScreen).toBeVisible({ timeout: 5000 });
    });

    test('should display loading progress', async ({ page }) => {
        await page.goto('/');

        const loadingBar = page.locator('#loading-bar');
        await expect(loadingBar).toBeVisible({ timeout: 5000 });

        // Progress should start at 0 or greater
        const style = await loadingBar.getAttribute('style');
        expect(style).toContain('width:');
    });

    test('should hide loading screen after game loads', async ({ gamePage }) => {
        // gamePage fixture waits for load automatically
        const isLoaded = await gamePage.isLoaded();
        expect(isLoaded).toBe(true);
    });

    test('should display canvas after loading', async ({ gamePage }) => {
        await expect(gamePage.canvas).toBeVisible();
    });

    test('should initialize WebGL renderer', async ({ canvasPage }) => {
        const hasContext = await canvasPage.hasWebGLContext();
        expect(hasContext).toBe(true);
    });

    test('should start rendering loop', async ({ canvasPage }) => {
        const isRendering = await canvasPage.isRendering();
        expect(isRendering).toBe(true);
    });

    test('should populate scene with objects', async ({ canvasPage }) => {
        const objectCount = await canvasPage.getSceneObjectCount();
        expect(objectCount).toBeGreaterThan(10); // Should have lights, terrain, entities
    });

    test('should load NPCs, enemies, and resources', async ({ canvasPage }) => {
        const counts = await canvasPage.getEntityCounts();

        expect(counts.npcs).toBeGreaterThan(0);
        expect(counts.enemies).toBeGreaterThan(0);
        expect(counts.resources).toBeGreaterThan(0);
    });

    test('should display welcome message in chat', async ({ uiPage }) => {
        await uiPage.verifyWelcomeMessage();
    });

    test('should show minimap', async ({ uiPage }) => {
        const visible = await uiPage.isMinimapVisible();
        expect(visible).toBe(true);
    });
});

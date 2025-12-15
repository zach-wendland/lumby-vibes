import { test, expect } from '../fixtures/game.fixture';

/**
 * Performance Tests
 *
 * Verifies the game runs at acceptable performance levels
 */
test.describe('Performance', () => {
    test.describe('Frame Rate', () => {
        test('should maintain reasonable FPS', async ({ canvasPage }) => {
            // Measure FPS over 2 seconds
            const fps = await canvasPage.measureFPS(2000);

            // Should maintain at least 30 FPS
            expect(fps).toBeGreaterThanOrEqual(30);
        });

        test('should maintain FPS during movement', async ({ gamePage, canvasPage }) => {
            // Start measuring while moving
            const fpsPromise = canvasPage.measureFPS(2000);

            // Move player during measurement
            await gamePage.keyDown('W');
            await gamePage.page.waitForTimeout(1000);
            await gamePage.keyUp('W');

            const fps = await fpsPromise;
            expect(fps).toBeGreaterThanOrEqual(25);
        });
    });

    test.describe('Rendering', () => {
        test('should not have WebGL errors', async ({ canvasPage }) => {
            const hasErrors = await canvasPage.hasWebGLErrors();
            expect(hasErrors).toBe(false);
        });

        test('should have appropriate scene complexity', async ({ canvasPage }) => {
            const objectCount = await canvasPage.getSceneObjectCount();

            // Scene should not be too sparse or too complex
            expect(objectCount).toBeGreaterThan(50);
            expect(objectCount).toBeLessThan(10000);
        });

        test('should have proper lighting', async ({ canvasPage }) => {
            const lightCount = await canvasPage.getLightCount();
            expect(lightCount).toBeGreaterThan(0);
        });
    });

    test.describe('Memory', () => {
        test('should not leak memory during gameplay', async ({ gamePage, page }) => {
            // Get initial heap size
            const initialHeap = await page.evaluate(() => {
                if ((performance as any).memory) {
                    return (performance as any).memory.usedJSHeapSize;
                }
                return 0;
            });

            // Play for a while
            for (let i = 0; i < 5; i++) {
                await gamePage.movePlayer('w', 500);
                await gamePage.movePlayer('d', 500);
                await gamePage.movePlayer('s', 500);
                await gamePage.movePlayer('a', 500);
            }

            // Get final heap size
            const finalHeap = await page.evaluate(() => {
                if ((performance as any).memory) {
                    return (performance as any).memory.usedJSHeapSize;
                }
                return 0;
            });

            // If memory API is available, check for leaks
            if (initialHeap > 0 && finalHeap > 0) {
                const heapGrowth = (finalHeap - initialHeap) / initialHeap;
                // Allow up to 50% growth during active gameplay
                expect(heapGrowth).toBeLessThan(0.5);
            }
        });
    });

    test.describe('Loading', () => {
        test('should load within acceptable time', async ({ page }) => {
            const startTime = Date.now();

            await page.goto('/');

            // Wait for game to load
            await page.locator('#loading').waitFor({ state: 'hidden', timeout: 30000 });

            const loadTime = Date.now() - startTime;

            // Should load within 15 seconds
            expect(loadTime).toBeLessThan(15000);
        });

        test('should show progress during loading', async ({ page }) => {
            await page.goto('/');

            const loadingBar = page.locator('#loading-bar');
            let maxProgress = 0;

            // Poll progress while loading
            while (await page.locator('#loading').isVisible()) {
                const style = await loadingBar.getAttribute('style');
                if (style) {
                    const match = style.match(/width:\s*(\d+)%/);
                    if (match) {
                        maxProgress = Math.max(maxProgress, parseInt(match[1], 10));
                    }
                }
                await page.waitForTimeout(100);
            }

            // Should have shown some progress
            expect(maxProgress).toBeGreaterThan(0);
        });
    });
});

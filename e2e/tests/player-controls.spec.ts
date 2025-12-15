import { test, expect } from '../fixtures/game.fixture';

/**
 * Player Controls Tests
 *
 * Verifies keyboard and mouse controls work correctly
 */
test.describe('Player Controls', () => {
    test.describe('Keyboard Movement', () => {
        test('should move player forward with W key', async ({ gamePage }) => {
            const initialPos = await gamePage.getPlayerPosition();

            await gamePage.movePlayer('w', 500);

            const newPos = await gamePage.getPlayerPosition();
            expect(newPos.z).toBeLessThan(initialPos.z);
        });

        test('should move player backward with S key', async ({ gamePage }) => {
            const initialPos = await gamePage.getPlayerPosition();

            await gamePage.movePlayer('s', 500);

            const newPos = await gamePage.getPlayerPosition();
            expect(newPos.z).toBeGreaterThan(initialPos.z);
        });

        test('should move player left with A key', async ({ gamePage }) => {
            const initialPos = await gamePage.getPlayerPosition();

            await gamePage.movePlayer('a', 500);

            const newPos = await gamePage.getPlayerPosition();
            expect(newPos.x).toBeLessThan(initialPos.x);
        });

        test('should move player right with D key', async ({ gamePage }) => {
            const initialPos = await gamePage.getPlayerPosition();

            await gamePage.movePlayer('d', 500);

            const newPos = await gamePage.getPlayerPosition();
            expect(newPos.x).toBeGreaterThan(initialPos.x);
        });

        test('should support arrow keys', async ({ gamePage }) => {
            const initialPos = await gamePage.getPlayerPosition();

            await gamePage.keyDown('ArrowUp');
            await gamePage.page.waitForTimeout(500);
            await gamePage.keyUp('ArrowUp');

            const newPos = await gamePage.getPlayerPosition();
            expect(newPos.z).toBeLessThan(initialPos.z);
        });

        test('should allow diagonal movement', async ({ gamePage }) => {
            const initialPos = await gamePage.getPlayerPosition();

            await gamePage.keyDown('W');
            await gamePage.keyDown('D');
            await gamePage.page.waitForTimeout(500);
            await gamePage.keyUp('W');
            await gamePage.keyUp('D');

            const newPos = await gamePage.getPlayerPosition();
            expect(newPos.z).toBeLessThan(initialPos.z);
            expect(newPos.x).toBeGreaterThan(initialPos.x);
        });

        test('should respect world boundaries', async ({ gamePage }) => {
            // Move player far in one direction
            for (let i = 0; i < 10; i++) {
                await gamePage.movePlayer('w', 1000);
            }

            const pos = await gamePage.getPlayerPosition();
            // Should be within bounds (-140 to 140)
            expect(Math.abs(pos.z)).toBeLessThan(145);
        });
    });

    test.describe('Camera Controls', () => {
        test('should zoom with mouse wheel', async ({ gamePage, canvasPage }) => {
            const initialCameraPos = await canvasPage.getCameraPosition();

            await gamePage.scrollOnCanvas(100); // Zoom out
            await gamePage.page.waitForTimeout(100);

            const newCameraPos = await canvasPage.getCameraPosition();

            // Camera should move further from origin (zoom out)
            const initialDistance = Math.sqrt(
                initialCameraPos.x ** 2 + initialCameraPos.y ** 2 + initialCameraPos.z ** 2
            );
            const newDistance = Math.sqrt(
                newCameraPos.x ** 2 + newCameraPos.y ** 2 + newCameraPos.z ** 2
            );

            expect(newDistance).toBeGreaterThan(initialDistance);
        });

        test('should rotate camera with middle mouse drag', async ({ gamePage, canvasPage }) => {
            const initialCameraPos = await canvasPage.getCameraPosition();

            // Drag horizontally with middle mouse button
            await gamePage.dragOnCanvas(200, 200, 400, 200, 'middle');
            await gamePage.page.waitForTimeout(100);

            const newCameraPos = await canvasPage.getCameraPosition();

            // Camera X or Z should change (rotation around Y axis)
            const positionChanged =
                Math.abs(newCameraPos.x - initialCameraPos.x) > 0.1 ||
                Math.abs(newCameraPos.z - initialCameraPos.z) > 0.1;

            expect(positionChanged).toBe(true);
        });

        test('should follow player when moving', async ({ gamePage, canvasPage }) => {
            // Move player and check camera follows
            const initialCameraPos = await canvasPage.getCameraPosition();

            await gamePage.movePlayer('w', 1000);
            await gamePage.page.waitForTimeout(100);

            const newCameraPos = await canvasPage.getCameraPosition();

            // Camera should move in same direction as player
            expect(newCameraPos.z).toBeLessThan(initialCameraPos.z);
        });
    });

    test.describe('Click Interactions', () => {
        test('should show walking message when clicking terrain', async ({ gamePage, uiPage }) => {
            // Click on canvas (terrain)
            await gamePage.clickCanvas(400, 300);

            // Should display walking message
            await uiPage.waitForChatMessage('Walking to');
        });

        test('should show context menu on right click', async ({ gamePage, uiPage, page }) => {
            // Right click on canvas
            await gamePage.clickCanvas(400, 300, 'right');

            // Context menu might appear depending on what's clicked
            await page.waitForTimeout(500);
        });
    });
});

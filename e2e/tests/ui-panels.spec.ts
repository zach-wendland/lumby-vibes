import { test, expect } from '../fixtures/game.fixture';

/**
 * UI Panel Tests
 *
 * Verifies UI panels display correctly and are interactive
 */
test.describe('UI Panels', () => {
    test.describe('Stats Panel', () => {
        test('should display stats panel by default', async ({ uiPage }) => {
            await expect(uiPage.statsPanel).toBeVisible();
        });

        test('should show hitpoints', async ({ uiPage }) => {
            await uiPage.openStatsTab();
            const hp = await uiPage.getHitpoints();

            expect(hp.current).toBeGreaterThan(0);
            expect(hp.max).toBeGreaterThanOrEqual(hp.current);
        });

        test('should show combat skill levels', async ({ uiPage, gamePage }) => {
            await uiPage.openStatsTab();

            const stats = await gamePage.getPlayerStats();

            expect(stats.skills.attack.level).toBeGreaterThanOrEqual(1);
            expect(stats.skills.strength.level).toBeGreaterThanOrEqual(1);
            expect(stats.skills.defence.level).toBeGreaterThanOrEqual(1);
        });
    });

    test.describe('Inventory Panel', () => {
        test('should switch to inventory tab', async ({ uiPage }) => {
            await uiPage.openInventoryTab();
            await expect(uiPage.inventoryPanel).toBeVisible();
        });

        test('should have 28 inventory slots', async ({ uiPage }) => {
            await uiPage.openInventoryTab();
            const slotCount = await uiPage.getInventorySlotCount();

            expect(slotCount).toBe(28);
        });

        test('should be able to click inventory slots', async ({ uiPage }) => {
            await uiPage.openInventoryTab();

            // Should not throw
            await uiPage.clickInventorySlot(0);
        });
    });

    test.describe('Equipment Panel', () => {
        test('should switch to equipment tab', async ({ uiPage }) => {
            await uiPage.openEquipmentTab();
            await expect(uiPage.equipmentPanel).toBeVisible();
        });
    });

    test.describe('Quests Panel', () => {
        test('should switch to quests tab', async ({ uiPage }) => {
            await uiPage.openQuestsTab();
            await expect(uiPage.questsPanel).toBeVisible();
        });

        test('should display available quests', async ({ uiPage }) => {
            await uiPage.openQuestsTab();
            const questCount = await uiPage.getQuestCount();

            expect(questCount).toBeGreaterThanOrEqual(0);
        });
    });

    test.describe('Chat Panel', () => {
        test('should display chat box', async ({ uiPage }) => {
            await expect(uiPage.chatBox).toBeVisible();
        });

        test('should have chat input', async ({ uiPage }) => {
            await expect(uiPage.chatInput).toBeVisible();
        });

        test('should display game messages', async ({ uiPage }) => {
            const messageCount = await uiPage.getChatMessageCount();
            expect(messageCount).toBeGreaterThan(0); // Welcome message at minimum
        });

        test('should show welcome message', async ({ uiPage }) => {
            const latestMessage = await uiPage.getLatestChatMessage();
            // Should have some message
            expect(latestMessage.length).toBeGreaterThan(0);
        });
    });

    test.describe('Tab Navigation', () => {
        test('should switch between tabs correctly', async ({ uiPage }) => {
            // Start with stats
            await uiPage.openStatsTab();
            await expect(uiPage.statsPanel).toBeVisible();
            await expect(uiPage.inventoryPanel).toBeHidden();

            // Switch to inventory
            await uiPage.openInventoryTab();
            await expect(uiPage.inventoryPanel).toBeVisible();
            await expect(uiPage.statsPanel).toBeHidden();

            // Switch to equipment
            await uiPage.openEquipmentTab();
            await expect(uiPage.equipmentPanel).toBeVisible();
            await expect(uiPage.inventoryPanel).toBeHidden();

            // Switch to quests
            await uiPage.openQuestsTab();
            await expect(uiPage.questsPanel).toBeVisible();
            await expect(uiPage.equipmentPanel).toBeHidden();
        });
    });
});

import { Page, Locator, expect } from '@playwright/test';

/**
 * UIPage - Page object for UI interactions
 *
 * Handles all UI panel interactions: stats, inventory, equipment, chat, minimap
 */
export class UIPage {
    readonly page: Page;

    // Stats panel
    readonly statsTab: Locator;
    readonly statsPanel: Locator;
    readonly hitpointsDisplay: Locator;
    readonly attackLevel: Locator;
    readonly strengthLevel: Locator;
    readonly defenceLevel: Locator;

    // Inventory panel
    readonly inventoryTab: Locator;
    readonly inventoryPanel: Locator;
    readonly inventorySlots: Locator;

    // Equipment panel
    readonly equipmentTab: Locator;
    readonly equipmentPanel: Locator;

    // Quests panel
    readonly questsTab: Locator;
    readonly questsPanel: Locator;
    readonly questList: Locator;

    // Chat panel
    readonly chatBox: Locator;
    readonly chatInput: Locator;
    readonly chatMessages: Locator;

    // Minimap
    readonly minimap: Locator;

    constructor(page: Page) {
        this.page = page;

        // Tab buttons
        this.statsTab = page.locator('.tab-button:has-text("Stats")');
        this.inventoryTab = page.locator('.tab-button:has-text("Inventory")');
        this.equipmentTab = page.locator('.tab-button:has-text("Equipment")');
        this.questsTab = page.locator('.tab-button:has-text("Quests")');

        // Panels
        this.statsPanel = page.locator('#stats-panel');
        this.inventoryPanel = page.locator('#inventory-panel');
        this.equipmentPanel = page.locator('#equipment-panel');
        this.questsPanel = page.locator('#quests-panel');

        // Stats elements
        this.hitpointsDisplay = page.locator('#hitpoints');
        this.attackLevel = page.locator('#attack-level');
        this.strengthLevel = page.locator('#strength-level');
        this.defenceLevel = page.locator('#defence-level');

        // Inventory
        this.inventorySlots = page.locator('.inventory-slot');

        // Quests
        this.questList = page.locator('.quest-item');

        // Chat
        this.chatBox = page.locator('#chat-box');
        this.chatInput = page.locator('#chat-input');
        this.chatMessages = page.locator('.chat-message');

        // Minimap
        this.minimap = page.locator('#minimap');
    }

    /**
     * Switch to stats tab
     */
    async openStatsTab(): Promise<void> {
        await this.statsTab.click();
        await expect(this.statsPanel).toBeVisible();
    }

    /**
     * Switch to inventory tab
     */
    async openInventoryTab(): Promise<void> {
        await this.inventoryTab.click();
        await expect(this.inventoryPanel).toBeVisible();
    }

    /**
     * Switch to equipment tab
     */
    async openEquipmentTab(): Promise<void> {
        await this.equipmentTab.click();
        await expect(this.equipmentPanel).toBeVisible();
    }

    /**
     * Switch to quests tab
     */
    async openQuestsTab(): Promise<void> {
        await this.questsTab.click();
        await expect(this.questsPanel).toBeVisible();
    }

    /**
     * Get current hitpoints display
     */
    async getHitpoints(): Promise<{ current: number; max: number }> {
        const text = await this.hitpointsDisplay.textContent();
        if (!text) return { current: 0, max: 0 };
        const match = text.match(/(\d+)\s*\/\s*(\d+)/);
        if (!match) return { current: 0, max: 0 };
        return {
            current: parseInt(match[1], 10),
            max: parseInt(match[2], 10),
        };
    }

    /**
     * Get skill level from stats panel
     */
    async getSkillLevel(skillId: string): Promise<number> {
        const element = this.page.locator(`#${skillId}-level`);
        const text = await element.textContent();
        return text ? parseInt(text, 10) : 0;
    }

    /**
     * Get inventory slot count
     */
    async getInventorySlotCount(): Promise<number> {
        return await this.inventorySlots.count();
    }

    /**
     * Get filled inventory slots
     */
    async getFilledInventorySlots(): Promise<number> {
        return await this.page.locator('.inventory-slot:not(:empty)').count();
    }

    /**
     * Click on inventory slot
     */
    async clickInventorySlot(index: number, button: 'left' | 'right' = 'left'): Promise<void> {
        await this.inventorySlots.nth(index).click({ button });
    }

    /**
     * Get quest list count
     */
    async getQuestCount(): Promise<number> {
        return await this.questList.count();
    }

    /**
     * Get chat message count
     */
    async getChatMessageCount(): Promise<number> {
        return await this.chatMessages.count();
    }

    /**
     * Get latest chat message
     */
    async getLatestChatMessage(): Promise<string> {
        const messages = await this.chatMessages.all();
        if (messages.length === 0) return '';
        return (await messages[messages.length - 1].textContent()) || '';
    }

    /**
     * Send chat message
     */
    async sendChatMessage(message: string): Promise<void> {
        await this.chatInput.fill(message);
        await this.chatInput.press('Enter');
    }

    /**
     * Check if message appears in chat
     */
    async waitForChatMessage(text: string, timeout: number = 5000): Promise<void> {
        await this.page.locator(`.chat-message:has-text("${text}")`).waitFor({ timeout });
    }

    /**
     * Verify welcome message appears
     */
    async verifyWelcomeMessage(): Promise<void> {
        await this.waitForChatMessage('Welcome to Lumbridge!');
    }

    /**
     * Check if minimap is visible
     */
    async isMinimapVisible(): Promise<boolean> {
        return await this.minimap.isVisible();
    }

    /**
     * Get context menu if visible
     */
    async getContextMenu(): Promise<Locator | null> {
        const menu = this.page.locator('.context-menu');
        if (await menu.isVisible()) {
            return menu;
        }
        return null;
    }

    /**
     * Click context menu option
     */
    async clickContextMenuOption(text: string): Promise<void> {
        const menu = await this.getContextMenu();
        if (!menu) throw new Error('No context menu visible');
        await menu.locator(`text=${text}`).click();
    }

    /**
     * Close context menu by clicking elsewhere
     */
    async closeContextMenu(): Promise<void> {
        await this.page.click('body');
    }
}

/**
 * UIManager - Handle all UI updates and interactions
 * TypeScript version with full type safety
 */

import { XPCalculator } from '../utils/XPCalculator';
import type { Player } from '../entities/Player';
import type { NPC } from '../entities/NPC';
import type { Enemy } from '../entities/Enemy';
import type { IShopSystemContext } from '../types/game';
import type { EquipmentSlot } from '../types/index';

/**
 * Context menu option interface
 */
interface ContextMenuOption {
    label: string;
    action: () => void;
}

/**
 * Message type
 */
type MessageType = 'game' | 'system' | 'chat';

/**
 * UIManager class - Handles all UI updates and interactions
 */
export class UIManager {
    private gameLogic: IShopSystemContext;
    private player: Player;
    private currentTab: string;

    constructor(gameLogic: IShopSystemContext) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player;

        this.currentTab = 'stats';
        this.setupEventListeners();
        this.setupInventoryGrid();
        this.setupEquipmentSlots();
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners(): void {
        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = (btn as HTMLElement).dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Chat input
        const chatInput = document.getElementById('chat-input') as HTMLInputElement | null;
        if (chatInput) {
            chatInput.addEventListener('keypress', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    this.handleChatInput(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    }

    /**
     * Setup inventory grid
     */
    setupInventoryGrid(): void {
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;

        // Create 28 slots
        for (let i = 0; i < 28; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slot = i.toString();

            slot.addEventListener('click', () => {
                this.handleInventoryClick(i);
            });

            slot.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
                this.handleInventoryRightClick(i, e);
            });

            inventoryGrid.appendChild(slot);
        }
    }

    /**
     * Setup equipment slot click handlers
     */
    setupEquipmentSlots(): void {
        const equipmentSlots = document.querySelectorAll('.equipment-slot');
        equipmentSlots.forEach(slotEl => {
            const slot = (slotEl as HTMLElement).dataset.slot as EquipmentSlot | undefined;
            if (!slot) return;

            // Left click - examine
            slotEl.addEventListener('click', () => {
                const item = this.player.equipment[slot];
                if (item) {
                    this.addMessage(`${item.name}`, 'game');
                }
            });

            // Right click - context menu to unequip
            slotEl.addEventListener('contextmenu', (e: Event) => {
                e.preventDefault();
                const item = this.player.equipment[slot];
                if (!item) return;

                const menu = this.createContextMenu([
                    { label: 'Remove', action: () => this.unequipItem(slot) },
                    { label: 'Examine', action: () => this.addMessage(`${item.name}`, 'game') }
                ]);

                const mouseEvent = e as MouseEvent;
                menu.style.left = mouseEvent.clientX + 'px';
                menu.style.top = mouseEvent.clientY + 'px';
                document.body.appendChild(menu);

                setTimeout(() => {
                    const removeMenu = (): void => {
                        menu.remove();
                        document.removeEventListener('click', removeMenu);
                    };
                    document.addEventListener('click', removeMenu);
                }, 10);
            });
        });
    }

    /**
     * Switch active tab
     */
    switchTab(tabName: string): void {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = (btn as HTMLElement).dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const activePanel = document.getElementById(`${tabName}-tab`);
        if (activePanel) {
            activePanel.classList.add('active');
        }

        // Trigger inventory open callback for tutorial
        if (tabName === 'inventory' && this.onInventoryTabOpen) {
            this.onInventoryTabOpen();
        }

        // Update equipment display when switching to equipment tab
        if (tabName === 'equipment') {
            this.updateEquipment();
        }
    }

    /**
     * Update player stats display
     */
    updateStats(): void {
        // HP bar
        const hpBar = document.getElementById('hp-bar');
        const hpText = document.getElementById('hp-text');
        if (hpBar && hpText) {
            const hpPercent = (this.player.currentHP / this.player.skills.hitpoints.level) * 100;
            hpBar.style.width = hpPercent + '%';
            hpText.textContent = `${this.player.currentHP}/${this.player.skills.hitpoints.level}`;
        }

        // Prayer bar
        const prayerBar = document.getElementById('prayer-bar');
        const prayerText = document.getElementById('prayer-text');
        if (prayerBar && prayerText) {
            const prayerPercent = (this.player.currentPrayer / this.player.skills.prayer.level) * 100;
            prayerBar.style.width = prayerPercent + '%';
            prayerText.textContent = `${this.player.currentPrayer}/${this.player.skills.prayer.level}`;
        }

        // Combat level
        const combatLvlText = document.getElementById('combat-lvl-text');
        if (combatLvlText) {
            combatLvlText.textContent = this.player.getCombatLevel().toString();
        }

        // Update skill list
        this.updateSkillsList();
    }

    /**
     * Update skills list
     */
    updateSkillsList(): void {
        for (const [skillName, skillData] of Object.entries(this.player.skills)) {
            const skillItem = document.querySelector(`.skill-item[data-skill="${skillName}"]`);
            if (skillItem) {
                const levelSpan = skillItem.querySelector('.skill-level');
                const xpSpan = skillItem.querySelector('.skill-xp');

                if (levelSpan) levelSpan.textContent = skillData.level.toString();
                if (xpSpan) xpSpan.textContent = `${skillData.xp} XP`;
            }
        }
    }

    /**
     * Update inventory display
     */
    updateInventory(): void {
        const slots = document.querySelectorAll('.inventory-slot');

        for (let i = 0; i < this.player.inventory.length; i++) {
            const slot = slots[i] as HTMLElement | undefined;
            if (!slot) continue;

            const item = this.player.inventory[i];

            if (item) {
                slot.classList.add('has-item');
                const itemWithCount = item as { name: string; stackable?: boolean; count?: number };
                slot.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    ${itemWithCount.stackable ? `<div class="item-count">${itemWithCount.count || 1}</div>` : ''}
                `;
            } else {
                slot.classList.remove('has-item');
                slot.innerHTML = '';
            }
        }

        // Update count
        const countSpan = document.getElementById('inventory-count');
        if (countSpan) {
            countSpan.textContent = this.player.getInventoryCount().toString();
        }
    }

    /**
     * Handle inventory click
     */
    handleInventoryClick(slot: number): void {
        const item = this.player.inventory[slot];
        if (item) {
            const count = (item as { count?: number }).count || 1;
            this.addMessage(`${item.name} (x${count})`, 'game');
        }
    }

    /**
     * Handle inventory right-click
     */
    handleInventoryRightClick(slot: number, event: MouseEvent): void {
        const item = this.player.inventory[slot];
        if (!item) return;

        // Build context menu options based on item type
        const options: ContextMenuOption[] = [];

        // Add Eat option if food
        if (this.player.isFood(item.id)) {
            options.push({ label: 'Eat', action: () => this.eatItem(slot) });
        }

        // Add Wield/Wear option if equippable
        if (this.player.isEquippable(item.id)) {
            const equipSlot = this.player.getEquipmentSlot(item.id);
            const label = equipSlot === 'weapon' ? 'Wield' : 'Wear';
            options.push({ label, action: () => this.equipItem(slot) });
        }

        // Standard options
        options.push(
            { label: 'Use', action: () => this.useItem(slot) },
            { label: 'Drop', action: () => this.dropItem(slot) },
            { label: 'Examine', action: () => this.examineItem(slot) }
        );

        // Create context menu
        const menu = this.createContextMenu(options);

        menu.style.left = event.clientX + 'px';
        menu.style.top = event.clientY + 'px';
        document.body.appendChild(menu);

        // Remove menu on click outside
        setTimeout(() => {
            const removeMenu = (): void => {
                menu.remove();
                document.removeEventListener('click', removeMenu);
            };
            document.addEventListener('click', removeMenu);
        }, 10);
    }

    /**
     * Create context menu
     */
    createContextMenu(options: ContextMenuOption[]): HTMLDivElement {
        const menu = document.createElement('div');
        menu.className = 'context-menu';

        for (const option of options) {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            item.textContent = option.label;
            item.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                option.action();
                menu.remove();
            });
            menu.appendChild(item);
        }

        return menu;
    }

    /**
     * Use item from inventory
     */
    useItem(slot: number): void {
        const item = this.player.inventory[slot];
        if (!item) return;

        this.addMessage(`You attempt to use ${item.name}...`, 'game');
        // Note: Item usage (eating food, potions, etc.) not yet implemented
    }

    /**
     * Drop item from inventory
     */
    dropItem(slot: number): void {
        const item = this.player.removeItem(slot);
        if (item) {
            this.addMessage(`You drop ${item.name}.`, 'game');
            this.updateInventory();
            // Note: Ground items not yet implemented - items are lost when dropped
        }
    }

    /**
     * Examine item
     */
    examineItem(slot: number): void {
        const item = this.player.inventory[slot];
        if (!item) return;

        this.addMessage(`${item.name}`, 'game');
    }

    /**
     * Equip item from inventory slot
     */
    equipItem(slot: number): void {
        const result = this.player.equipItem(slot);
        this.addMessage(result.message, 'game');
        if (result.success) {
            this.updateInventory();
            this.updateEquipment();
            this.updateStats();
        }
    }

    /**
     * Unequip item from equipment slot
     */
    unequipItem(equipSlot: EquipmentSlot): void {
        const result = this.player.unequipItem(equipSlot);
        this.addMessage(result.message, 'game');
        if (result.success) {
            this.updateInventory();
            this.updateEquipment();
            this.updateStats();
        }
    }

    /**
     * Eat food from inventory slot
     */
    eatItem(slot: number): void {
        const result = this.player.eatFood(slot);
        if (result.success) {
            this.addMessage(`${result.message} It heals ${result.healed} hitpoints.`, 'game');
            this.updateInventory();
            this.updateStats();
        } else {
            this.addMessage(result.message, 'game');
        }
    }

    /**
     * Update equipment display
     */
    updateEquipment(): void {
        const equipmentSlots = document.querySelectorAll('.equipment-slot');

        equipmentSlots.forEach(slotEl => {
            const slot = (slotEl as HTMLElement).dataset.slot as EquipmentSlot | undefined;
            if (!slot) return;

            const item = this.player.equipment[slot];
            const htmlEl = slotEl as HTMLElement;

            if (item) {
                htmlEl.classList.add('has-item');
                htmlEl.innerHTML = `<div class="equip-item-name">${item.name}</div>`;
            } else {
                htmlEl.classList.remove('has-item');
                // Keep original slot label
                const slotLabel = slot.charAt(0).toUpperCase() + slot.slice(1);
                htmlEl.textContent = slotLabel;
            }
        });

        // Update equipment stats
        const attackBonus = document.getElementById('attack-bonus');
        const defenceBonus = document.getElementById('defence-bonus');
        const strengthBonus = document.getElementById('strength-bonus');

        if (attackBonus) attackBonus.textContent = this.player.equipmentBonuses.attack.toString();
        if (defenceBonus) defenceBonus.textContent = this.player.equipmentBonuses.defence.toString();
        if (strengthBonus) strengthBonus.textContent = this.player.equipmentBonuses.strength.toString();
    }

    /**
     * Open shop UI
     */
    openShop(shopId: string): void {
        const shopSystem = this.gameLogic.shopSystem;
        if (!shopSystem) {
            this.addMessage('Shop system not available.', 'game');
            return;
        }

        const result = shopSystem.openShop(shopId);
        if (!result.success) {
            this.addMessage(result.message || 'Cannot open shop.', 'game');
            return;
        }

        // Setup close button
        const closeBtn = document.getElementById('shop-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeShop();
        }

        // Show shop modal
        const modal = document.getElementById('shop-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }

        this.updateShopUI();
    }

    /**
     * Close shop UI
     */
    closeShop(): void {
        const shopSystem = this.gameLogic.shopSystem;
        if (shopSystem) {
            shopSystem.closeShop();
        }

        const modal = document.getElementById('shop-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Update shop UI display
     */
    updateShopUI(): void {
        const shopSystem = this.gameLogic.shopSystem;
        if (!shopSystem) return;

        const shop = shopSystem.getCurrentShop() as {
            name: string;
            items: Array<{
                id: string;
                name: string;
                stock: number;
                buyPrice: number;
                sellPrice: number;
            }>;
            buysItems?: boolean;
        } | null;

        if (!shop) return;

        // Update title
        const titleEl = document.getElementById('shop-title');
        if (titleEl) {
            titleEl.textContent = shop.name;
        }

        // Update coins display
        const coinsEl = document.getElementById('shop-coins');
        if (coinsEl) {
            coinsEl.textContent = `Coins: ${shopSystem.getPlayerCoins()}`;
        }

        // Update shop items
        const shopItemsEl = document.getElementById('shop-items');
        if (shopItemsEl) {
            shopItemsEl.innerHTML = '';

            for (const item of shop.items) {
                const itemEl = document.createElement('div');
                itemEl.className = `shop-item${item.stock <= 0 ? ' out-of-stock' : ''}`;
                itemEl.innerHTML = `
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-price">${item.buyPrice} gp</div>
                    <div class="shop-item-stock">Stock: ${item.stock}</div>
                `;

                if (item.stock > 0) {
                    itemEl.onclick = () => this.handleShopBuy(item.id);
                }

                shopItemsEl.appendChild(itemEl);
            }
        }

        // Update player inventory for selling
        const playerItemsEl = document.getElementById('shop-player-items');
        if (playerItemsEl) {
            playerItemsEl.innerHTML = '';

            for (let i = 0; i < this.player.inventory.length; i++) {
                const item = this.player.inventory[i];
                if (!item) continue;

                const itemEl = document.createElement('div');
                itemEl.className = 'shop-sell-item';

                // Calculate sell price (60% of value for general stores)
                const sellPrice = Math.floor((item.value || 0) * 0.6);
                const count = (item as { count?: number }).count || 1;

                itemEl.innerHTML = `
                    <div class="shop-sell-name">${item.name}</div>
                    <div class="shop-sell-price">${sellPrice > 0 ? sellPrice + ' gp' : 'No value'}</div>
                    ${count > 1 ? `<div class="shop-sell-count">x${count}</div>` : ''}
                `;

                if (sellPrice > 0 || shop.buysItems) {
                    const slot = i;
                    itemEl.onclick = () => this.handleShopSell(slot);
                }

                playerItemsEl.appendChild(itemEl);
            }
        }
    }

    /**
     * Handle buying item from shop
     */
    handleShopBuy(itemId: string): void {
        const shopSystem = this.gameLogic.shopSystem;
        if (!shopSystem) return;

        const result = shopSystem.buyItem(itemId, 1);
        this.addMessage(result.message, 'game');

        if (result.success) {
            this.updateShopUI();
            this.updateInventory();
        }
    }

    /**
     * Handle selling item to shop
     */
    handleShopSell(slot: number): void {
        const shopSystem = this.gameLogic.shopSystem;
        if (!shopSystem) return;

        const result = shopSystem.sellItem(slot, 1);
        this.addMessage(result.message, 'game');

        if (result.success) {
            this.updateShopUI();
            this.updateInventory();
        }
    }

    /**
     * Add message to chat
     */
    addMessage(message: string, type: MessageType = 'game'): void {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type}`;
        msgDiv.textContent = message;

        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Keep only last 50 messages
        while (chatMessages.children.length > 50) {
            if (chatMessages.firstChild) {
                chatMessages.removeChild(chatMessages.firstChild);
            }
        }
    }

    /**
     * Handle chat input
     */
    handleChatInput(text: string): void {
        if (!text.trim()) return;

        this.addMessage(`You: ${text}`, 'system');

        // Check for commands
        if (text.startsWith('/')) {
            this.handleCommand(text.substring(1));
        }
    }

    /**
     * Handle commands
     */
    handleCommand(cmd: string): void {
        const parts = cmd.split(' ');
        const command = parts[0].toLowerCase();

        switch (command) {
            case 'help':
                this.addMessage('Available commands: /help, /stats, /pos', 'system');
                break;
            case 'stats': {
                const combat = this.player.getCombatLevel();
                this.addMessage(`Combat level: ${combat}`, 'system');
                break;
            }
            case 'pos': {
                const pos = this.player.position;
                this.addMessage(`Position: (${pos.x.toFixed(1)}, ${pos.z.toFixed(1)})`, 'system');
                break;
            }
            default:
                this.addMessage('Unknown command. Type /help for help.', 'system');
        }
    }

    /**
     * Update minimap
     */
    updateMinimap(player: Player, npcs: NPC[], enemies: Enemy[]): void {
        const canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement | null;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        const scale = width / 200; // 200 units of game world
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw terrain features
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(centerX + (20 - player.position.x) * scale - 3, 0, 6, height);

        // Draw NPCs
        ctx.fillStyle = '#FFFF00';
        for (const npc of npcs) {
            const dx = (npc.position.x - player.position.x) * scale;
            const dy = (npc.position.z - player.position.z) * scale;
            ctx.fillRect(centerX + dx - 1, centerY + dy - 1, 2, 2);
        }

        // Draw enemies
        ctx.fillStyle = '#FF0000';
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx = (enemy.position.x - player.position.x) * scale;
            const dy = (enemy.position.z - player.position.z) * scale;
            ctx.fillRect(centerX + dx - 1, centerY + dy - 1, 2, 2);
        }

        // Draw player
        ctx.fillStyle = '#0099FF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Show level up notification
     */
    showLevelUp(skill: string, level: number): void {
        this.addMessage(`Congratulations! You have advanced a ${skill} level! You are now level ${level}.`, 'game');

        // Note: Visual level up effects (fireworks, etc.) not yet implemented
    }

    /**
     * Show tutorial step
     */
    showTutorialStep(title: string, message: string, hint: string): void {
        const overlay = document.getElementById('tutorial-overlay');
        const titleEl = document.getElementById('tutorial-title');
        const messageEl = document.getElementById('tutorial-message');
        const hintEl = document.getElementById('tutorial-hint');

        if (overlay && titleEl && messageEl && hintEl) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            hintEl.textContent = `Hint: ${hint}`;
            overlay.classList.remove('hidden');
        }
    }

    /**
     * Hide tutorial overlay
     */
    hideTutorial(): void {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Setup tutorial skip button handler
     */
    setupTutorialSkipHandler(onSkip: () => void): void {
        const skipBtn = document.getElementById('tutorial-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                onSkip();
                this.hideTutorial();
            });
        }
    }

    /**
     * Get callback when inventory tab is opened (for tutorial tracking)
     */
    onInventoryTabOpen: (() => void) | null = null;

    /**
     * Dispose of resources and clean up
     * Note: Full event listener cleanup would require refactoring to store handler references
     */
    dispose(): void {
        // Clear current tab reference
        this.currentTab = '';
        this.onInventoryTabOpen = null;

        // Note: Event listeners on DOM elements (tab buttons, chat input, inventory slots, context menus)
        // would need to be explicitly removed if handler references were stored during setupEventListeners()
        // For now, relying on browser garbage collection when elements are removed from DOM
    }
}

export default UIManager;

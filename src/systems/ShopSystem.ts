/**
 * Complete Shop System for OSRS Lumbridge
 * TypeScript version with full type safety
 */

import type { Player } from '../entities/Player';
import type { SkillName, OSRSItem } from '../types/index';

/**
 * Shop item definition
 */
interface ShopItem {
    id: string;
    name: string;
    stock: number;
    maxStock: number;
    buyPrice: number;
    sellPrice: number;
    description?: string;
    requirements?: Partial<Record<SkillName, number>>;
}

/**
 * Shop definition
 */
interface ShopDefinition {
    id: string;
    name: string;
    owner: string;
    location: string;
    type: 'specialty' | 'general';
    currency: string;
    items: ShopItem[];
    restockRate: number;
    memberOnly: boolean;
    buysItems?: boolean;
}

/**
 * Shop state (runtime)
 */
interface ShopState extends ShopDefinition {
    items: ShopItem[];
}

/**
 * Transaction result
 */
interface TransactionResult {
    success: boolean;
    message: string;
    item?: ShopItem;
    quantity?: number;
    cost?: number;
    value?: number;
}

/**
 * Open shop result
 */
interface OpenShopResult {
    success: boolean;
    message?: string;
    shop?: ShopState;
}

/**
 * GameLogic interface for type safety
 */
interface GameLogic {
    player: Player & { isMember?: boolean };
}

/**
 * All shop definitions
 */
export const SHOPS: Record<string, ShopDefinition> = {
    BOBS_AXES: {
        id: 'bobs_axes',
        name: "Bob's Brilliant Axes",
        owner: 'Bob',
        location: 'South Lumbridge',
        type: 'specialty',
        currency: 'coins',
        items: [
            {
                id: 'bronze_axe',
                name: 'Bronze axe',
                stock: 10,
                maxStock: 10,
                buyPrice: 16,
                sellPrice: 10,
                description: 'A woodcutting axe.',
                requirements: { woodcutting: 1 }
            },
            {
                id: 'iron_axe',
                name: 'Iron axe',
                stock: 5,
                maxStock: 5,
                buyPrice: 112,
                sellPrice: 70,
                requirements: { woodcutting: 1 }
            },
            {
                id: 'steel_axe',
                name: 'Steel axe',
                stock: 3,
                maxStock: 3,
                buyPrice: 560,
                sellPrice: 350,
                requirements: { woodcutting: 6 }
            },
            {
                id: 'mithril_axe',
                name: 'Mithril axe',
                stock: 2,
                maxStock: 2,
                buyPrice: 1248,
                sellPrice: 780,
                requirements: { woodcutting: 21 }
            },
            {
                id: 'adamant_axe',
                name: 'Adamant axe',
                stock: 1,
                maxStock: 1,
                buyPrice: 2912,
                sellPrice: 1820,
                requirements: { woodcutting: 31 }
            },
            {
                id: 'rune_axe',
                name: 'Rune axe',
                stock: 1,
                maxStock: 1,
                buyPrice: 20992,
                sellPrice: 13120,
                requirements: { woodcutting: 41 }
            },
            {
                id: 'bronze_pickaxe',
                name: 'Bronze pickaxe',
                stock: 5,
                maxStock: 5,
                buyPrice: 16,
                sellPrice: 10
            },
            {
                id: 'iron_pickaxe',
                name: 'Iron pickaxe',
                stock: 3,
                maxStock: 3,
                buyPrice: 175,
                sellPrice: 109
            }
        ],
        restockRate: 5000,
        memberOnly: false
    },

    GENERAL_STORE: {
        id: 'general_store',
        name: 'Lumbridge General Store',
        owner: 'Donie',
        location: 'North Lumbridge',
        type: 'general',
        currency: 'coins',
        items: [
            { id: 'pot', name: 'Pot', stock: 5, maxStock: 5, buyPrice: 1, sellPrice: 0 },
            { id: 'jug', name: 'Jug', stock: 2, maxStock: 2, buyPrice: 1, sellPrice: 0 },
            { id: 'shears', name: 'Shears', stock: 2, maxStock: 2, buyPrice: 1, sellPrice: 0 },
            { id: 'bucket', name: 'Bucket', stock: 2, maxStock: 2, buyPrice: 2, sellPrice: 1 },
            { id: 'tinderbox', name: 'Tinderbox', stock: 2, maxStock: 2, buyPrice: 1, sellPrice: 0 },
            { id: 'chisel', name: 'Chisel', stock: 2, maxStock: 2, buyPrice: 1, sellPrice: 0 },
            { id: 'hammer', name: 'Hammer', stock: 5, maxStock: 5, buyPrice: 1, sellPrice: 0 },
            { id: 'newcomer_map', name: 'Newcomer map', stock: 10, maxStock: 10, buyPrice: 1, sellPrice: 0 },
            { id: 'rope', name: 'Rope', stock: 0, maxStock: 0, buyPrice: 18, sellPrice: 11 },
            { id: 'bronze_arrow', name: 'Bronze arrow', stock: 0, maxStock: 0, buyPrice: 2, sellPrice: 1 }
        ],
        buysItems: true,
        restockRate: 5000,
        memberOnly: false
    }
};

/**
 * ShopSystem class - Handles shop operations
 */
export class ShopSystem {
    private gameLogic: GameLogic;
    private player: Player & { isMember?: boolean };
    private shops: Map<string, ShopState>;
    private currentShop: ShopState | null;
    private restockTimers: Map<string, ReturnType<typeof setTimeout>>;

    constructor(gameLogic: GameLogic) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player as Player & { isMember?: boolean };
        this.shops = new Map();
        this.currentShop = null;
        this.restockTimers = new Map();

        this.initializeShops();
    }

    /**
     * Initialize all shops with deep copied items
     */
    private initializeShops(): void {
        for (const [key, shopData] of Object.entries(SHOPS)) {
            this.shops.set(shopData.id, {
                ...shopData,
                items: shopData.items.map(item => ({ ...item }))
            });
        }
    }

    /**
     * Open a shop
     */
    openShop(shopId: string): OpenShopResult {
        const shop = this.shops.get(shopId);
        if (!shop) {
            return { success: false, message: 'Shop not found!' };
        }

        if (shop.memberOnly && !this.player.isMember) {
            return { success: false, message: 'This shop is for members only!' };
        }

        this.currentShop = shop;
        return { success: true, shop };
    }

    /**
     * Close current shop
     */
    closeShop(): void {
        this.currentShop = null;
    }

    /**
     * Buy an item from current shop
     */
    buyItem(itemId: string, quantity: number = 1): TransactionResult {
        if (!this.currentShop) {
            return { success: false, message: 'No shop is open!' };
        }

        const item = this.currentShop.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: 'Item not found in shop!' };
        }

        if (item.stock < quantity) {
            return { success: false, message: 'Not enough stock!' };
        }

        // Check requirements
        if (item.requirements) {
            for (const [skill, level] of Object.entries(item.requirements)) {
                const skillData = this.player.skills[skill as SkillName];
                if (skillData && skillData.level < level) {
                    return {
                        success: false,
                        message: `Requires ${skill} level ${level}!`
                    };
                }
            }
        }

        const totalCost = item.buyPrice * quantity;
        const coinsInInventory = this.getPlayerCoins();

        if (coinsInInventory < totalCost) {
            return {
                success: false,
                message: `You need ${totalCost} coins! You only have ${coinsInInventory}.`
            };
        }

        if (!this.hasInventorySpace(quantity)) {
            return { success: false, message: 'Not enough inventory space!' };
        }

        // Process purchase
        this.removePlayerCoins(totalCost);
        item.stock -= quantity;

        // Add item to inventory
        for (let i = 0; i < quantity; i++) {
            this.player.addItem({ id: parseInt(item.id) || 0, name: item.name, stackable: false, value: item.sellPrice }, 1);
        }

        this.scheduleRestock(this.currentShop.id, itemId);

        return {
            success: true,
            message: `Purchased ${quantity}x ${item.name} for ${totalCost} coins!`,
            item,
            quantity,
            cost: totalCost
        };
    }

    /**
     * Sell an item to current shop
     */
    sellItem(inventorySlot: number, quantity: number = 1): TransactionResult {
        if (!this.currentShop) {
            return { success: false, message: 'No shop is open!' };
        }

        const playerItem = this.player.inventory[inventorySlot];
        if (!playerItem) {
            return { success: false, message: 'No item in that slot!' };
        }

        const shopItem = this.currentShop.items.find(i => i.id === playerItem.id?.toString());

        if (!this.currentShop.buysItems && !shopItem) {
            return { success: false, message: "This shop doesn't buy that item!" };
        }

        const sellPrice = shopItem ? shopItem.sellPrice : Math.floor((playerItem.value || 0) * 0.6);

        if (sellPrice <= 0) {
            return { success: false, message: "This shop doesn't buy that item!" };
        }

        const totalValue = sellPrice * quantity;

        // Remove from player inventory
        const itemCount = (playerItem as { count?: number }).count;
        if (itemCount && itemCount > quantity) {
            (playerItem as { count: number }).count -= quantity;
        } else {
            this.player.removeItem(inventorySlot);
        }

        this.addPlayerCoins(totalValue);

        if (shopItem) {
            shopItem.stock = Math.min(shopItem.stock + quantity, shopItem.maxStock);
        }

        return {
            success: true,
            message: `Sold ${quantity}x ${playerItem.name} for ${totalValue} coins!`,
            value: totalValue
        };
    }

    /**
     * Schedule item restock
     */
    private scheduleRestock(shopId: string, itemId: string): void {
        const shop = this.shops.get(shopId);
        if (!shop) return;

        const key = `${shopId}_${itemId}`;

        if (this.restockTimers.has(key)) {
            clearTimeout(this.restockTimers.get(key));
        }

        const timer = setTimeout(() => {
            this.restockItem(shopId, itemId);
        }, shop.restockRate);

        this.restockTimers.set(key, timer);
    }

    /**
     * Restock a single item
     */
    private restockItem(shopId: string, itemId: string): void {
        const shop = this.shops.get(shopId);
        if (!shop) return;

        const item = shop.items.find(i => i.id === itemId);
        if (!item) return;

        if (item.stock < item.maxStock) {
            item.stock++;

            if (item.stock < item.maxStock) {
                this.scheduleRestock(shopId, itemId);
            }
        }
    }

    /**
     * Get player's coin count
     */
    getPlayerCoins(): number {
        for (const item of this.player.inventory) {
            if (item && item.id === 995) { // Coins ID
                return (item as { count?: number }).count || 0;
            }
        }
        return 0;
    }

    /**
     * Add coins to player
     */
    addPlayerCoins(amount: number): void {
        for (const item of this.player.inventory) {
            if (item && item.id === 995) {
                (item as { count: number }).count += amount;
                return;
            }
        }

        this.player.addItem({ id: 995, name: 'Coins', stackable: true, value: 1 }, amount);
    }

    /**
     * Remove coins from player
     */
    removePlayerCoins(amount: number): boolean {
        for (let i = 0; i < this.player.inventory.length; i++) {
            const item = this.player.inventory[i];
            if (item && item.id === 995) {
                const itemWithCount = item as { count: number };
                itemWithCount.count -= amount;
                if (itemWithCount.count <= 0) {
                    this.player.inventory[i] = null;
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Check if player has inventory space
     */
    hasInventorySpace(quantity: number): boolean {
        let emptySlots = 0;
        for (const slot of this.player.inventory) {
            if (slot === null) emptySlots++;
        }
        return emptySlots >= quantity;
    }

    /**
     * Get shop info by ID
     */
    getShopInfo(shopId: string): ShopState | undefined {
        return this.shops.get(shopId);
    }

    /**
     * Get current shop
     */
    getCurrentShop(): ShopState | null {
        return this.currentShop;
    }

    /**
     * Update (called every frame)
     */
    update(delta: number): void {
        // Could add dynamic pricing based on stock levels
    }

    /**
     * Dispose of resources and clean up
     */
    dispose(): void {
        // Clear all restock timers
        for (const timer of this.restockTimers.values()) {
            clearTimeout(timer);
        }
        this.restockTimers.clear();

        // Close current shop
        this.currentShop = null;

        // Clear shop references
        this.shops.clear();
    }
}

export default ShopSystem;

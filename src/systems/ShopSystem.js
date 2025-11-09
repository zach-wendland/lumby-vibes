/**
 * Complete Shop System for OSRS Lumbridge
 */

export const SHOPS = {
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
        restockRate: 5000, // 5 seconds per item
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
            {
                id: 'pot',
                name: 'Pot',
                stock: 5,
                maxStock: 5,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'jug',
                name: 'Jug',
                stock: 2,
                maxStock: 2,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'shears',
                name: 'Shears',
                stock: 2,
                maxStock: 2,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'bucket',
                name: 'Bucket',
                stock: 2,
                maxStock: 2,
                buyPrice: 2,
                sellPrice: 1
            },
            {
                id: 'tinderbox',
                name: 'Tinderbox',
                stock: 2,
                maxStock: 2,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'chisel',
                name: 'Chisel',
                stock: 2,
                maxStock: 2,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'hammer',
                name: 'Hammer',
                stock: 5,
                maxStock: 5,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'newcomer_map',
                name: 'Newcomer map',
                stock: 10,
                maxStock: 10,
                buyPrice: 1,
                sellPrice: 0
            },
            {
                id: 'rope',
                name: 'Rope',
                stock: 0,
                maxStock: 0,
                buyPrice: 18,
                sellPrice: 11
            },
            {
                id: 'bronze_arrow',
                name: 'Bronze arrow',
                stock: 0,
                maxStock: 0,
                buyPrice: 2,
                sellPrice: 1
            }
        ],
        buysItems: true, // General stores buy almost anything
        restockRate: 5000,
        memberOnly: false
    },

    RANCH_OUT_OF_TIME: {
        id: 'ranch_store',
        name: 'Ranch Out of Time Shop',
        owner: 'Granny Potterington',
        location: 'Lumbridge Farm',
        type: 'specialty',
        currency: 'beans',
        items: [
            {
                id: 'animal_feed',
                name: 'Animal feed',
                stock: 100,
                buyPrice: 50, // beans
                sellPrice: 25
            }
        ],
        memberOnly: true
    }
};

export class ShopSystem {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.player = gameLogic.player;
        this.shops = new Map();
        this.currentShop = null;
        this.restockTimers = new Map();

        this.initializeShops();
    }

    initializeShops() {
        for (const [key, shopData] of Object.entries(SHOPS)) {
            this.shops.set(shopData.id, {
                ...shopData,
                items: shopData.items.map(item => ({ ...item })) // Deep copy
            });
        }
    }

    openShop(shopId) {
        const shop = this.shops.get(shopId);
        if (!shop) {
            return { success: false, message: 'Shop not found!' };
        }

        // Check if members-only
        if (shop.memberOnly && !this.player.isMember) {
            return { success: false, message: 'This shop is for members only!' };
        }

        this.currentShop = shop;
        return { success: true, shop };
    }

    closeShop() {
        this.currentShop = null;
    }

    buyItem(itemId, quantity = 1) {
        if (!this.currentShop) {
            return { success: false, message: 'No shop is open!' };
        }

        const item = this.currentShop.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: 'Item not found in shop!' };
        }

        // Check stock
        if (item.stock < quantity) {
            return { success: false, message: 'Not enough stock!' };
        }

        // Check requirements
        if (item.requirements) {
            for (const [skill, level] of Object.entries(item.requirements)) {
                if (this.player.skills[skill].level < level) {
                    return {
                        success: false,
                        message: `Requires ${skill} level ${level}!`
                    };
                }
            }
        }

        // Calculate cost
        const totalCost = item.buyPrice * quantity;

        // Check if player has enough coins
        const coinsInInventory = this.getPlayerCoins();
        if (coinsInInventory < totalCost) {
            return {
                success: false,
                message: `You need ${totalCost} coins! You only have ${coinsInInventory}.`
            };
        }

        // Check inventory space
        if (!this.hasInventorySpace(quantity)) {
            return { success: false, message: 'Not enough inventory space!' };
        }

        // Process purchase
        this.removePlayerCoins(totalCost);
        item.stock -= quantity;

        // Add item to inventory
        for (let i = 0; i < quantity; i++) {
            this.player.addItem({ id: item.id, name: item.name, stackable: false }, 1);
        }

        // Start restock timer
        this.scheduleRestock(this.currentShop.id, itemId);

        return {
            success: true,
            message: `Purchased ${quantity}x ${item.name} for ${totalCost} coins!`,
            item,
            quantity,
            cost: totalCost
        };
    }

    sellItem(inventorySlot, quantity = 1) {
        if (!this.currentShop) {
            return { success: false, message: 'No shop is open!' };
        }

        const playerItem = this.player.inventory[inventorySlot];
        if (!playerItem) {
            return { success: false, message: 'No item in that slot!' };
        }

        // Check if shop buys this item
        if (!this.currentShop.buysItems && !this.currentShop.items.find(i => i.id === playerItem.id)) {
            return { success: false, message: "This shop doesn't buy that item!" };
        }

        // Find shop item or use default sell price
        const shopItem = this.currentShop.items.find(i => i.id === playerItem.id);
        const sellPrice = shopItem ? shopItem.sellPrice : Math.floor(playerItem.value * 0.6);

        if (sellPrice <= 0) {
            return { success: false, message: "This shop doesn't buy that item!" };
        }

        // Calculate total value
        const totalValue = sellPrice * quantity;

        // Remove from player inventory
        if (playerItem.count && playerItem.count > quantity) {
            playerItem.count -= quantity;
        } else {
            this.player.removeItem(inventorySlot);
        }

        // Add coins to player
        this.addPlayerCoins(totalValue);

        // Add to shop stock if it's a stocked item
        if (shopItem) {
            shopItem.stock = Math.min(shopItem.stock + quantity, shopItem.maxStock);
        }

        return {
            success: true,
            message: `Sold ${quantity}x ${playerItem.name} for ${totalValue} coins!`,
            value: totalValue
        };
    }

    scheduleRestock(shopId, itemId) {
        const shop = this.shops.get(shopId);
        if (!shop) return;

        const key = `${shopId}_${itemId}`;

        // Cancel existing timer
        if (this.restockTimers.has(key)) {
            clearTimeout(this.restockTimers.get(key));
        }

        // Set new timer
        const timer = setTimeout(() => {
            this.restockItem(shopId, itemId);
        }, shop.restockRate);

        this.restockTimers.set(key, timer);
    }

    restockItem(shopId, itemId) {
        const shop = this.shops.get(shopId);
        if (!shop) return;

        const item = shop.items.find(i => i.id === itemId);
        if (!item) return;

        if (item.stock < item.maxStock) {
            item.stock++;

            // Schedule another restock if not at max
            if (item.stock < item.maxStock) {
                this.scheduleRestock(shopId, itemId);
            }
        }
    }

    // Helper methods
    getPlayerCoins() {
        // Check inventory for coins
        for (const item of this.player.inventory) {
            if (item && item.id === 'coins') {
                return item.count || 0;
            }
        }
        return 0;
    }

    addPlayerCoins(amount) {
        // Find coins in inventory
        for (const item of this.player.inventory) {
            if (item && item.id === 'coins') {
                item.count += amount;
                return;
            }
        }

        // No coins found, add new stack
        this.player.addItem({ id: 'coins', name: 'Coins', stackable: true }, amount);
    }

    removePlayerCoins(amount) {
        for (const item of this.player.inventory) {
            if (item && item.id === 'coins') {
                item.count -= amount;
                if (item.count <= 0) {
                    const index = this.player.inventory.indexOf(item);
                    this.player.inventory[index] = null;
                }
                return true;
            }
        }
        return false;
    }

    hasInventorySpace(quantity) {
        let emptySlots = 0;
        for (const slot of this.player.inventory) {
            if (slot === null) emptySlots++;
        }
        return emptySlots >= quantity;
    }

    getShopInfo(shopId) {
        return this.shops.get(shopId);
    }

    getCurrentShop() {
        return this.currentShop;
    }

    update(delta) {
        // Could add dynamic pricing based on stock levels
    }
}

export default ShopSystem;
